//  /api/chat
import {GoogleGenerativeAI} from "@google/generative-ai"
import { Message } from "ai"
import {streamText} from 'ai'
import { google } from '@ai-sdk/google';
import {createStreamableValue} from 'ai/rsc'
import { auth } from "@clerk/nextjs/server";
import { OramaClient } from "@/lib/orama";
import { getSubscriptionStatus } from "@/lib/stripe-action";
import { db } from "@/server/db";
import { FREE_CREDITS_PER_DAY } from "@/constants";

export async function POST(req: Request) {
    try {
        const {userId} = await auth()
        if (!userId) {
            return new Response("Unauthorized", {status: 401})
        }

        const today = new Date().toDateString()
        const isSubscribed = await getSubscriptionStatus()

        if (!isSubscribed) {
            const chatbotInteraction = await db.chatbotInteraction.findUnique({where:{userId: userId, day: today}})
            
            if (!chatbotInteraction) {
                await db.chatbotInteraction.create({
                    data: {
                        day: today,
                        userId: userId,
                        count: 1
                    }
                })
            } else if (chatbotInteraction.count >= FREE_CREDITS_PER_DAY) {
                return new Response("You have reached the free limit for today", {status: 429})
            }
            } 

        const {accountId, messages} = await req.json()
        const orama = new OramaClient(accountId)
        await orama.initialize()

        const lastMessage = messages[messages.length-1]
        console.log("Last message: ", lastMessage)
        const context = await orama.vectorSearch({term: lastMessage.content})
        console.log(context.hits.length + ' hits found')

        const model = google('gemini-1.5-flash')
        const prompt = `
            You are an AI email assistant embedded in an email client application. Your purpose is to help the user regarding their emails by answering questions, providing suggestions, and offering relevant information based on the CONTEXT BLOCK of their previous emails.
            THE TIME NOW IS ${new Date().toLocaleString()}
      
            START CONTEXT BLOCK
            ${context.hits.map((hit) => JSON.stringify(hit.document)).join('\n')}
            END OF CONTEXT BLOCK

            USER PROMPT:
            ${lastMessage.content}
            
            When responding, please keep in mind:
            - Be helpful, clever, and articulate.
            - Rely on the provided email CONTEXT BLOCK to inform your responses.
            - The CONTEXT BLOCK is the result of a vector search using a Retrieval Augmented Generation of USER PROMPT, based on all data in the user's inbox. So the CONTEXT BLOCK being empty does not mean their inbox is empty, it only mean the USER PROMPT is not associated with anything in the email.
            - If the CONTEXT BLOCK is empty: If the USER PROMPT is a greeting you can kindly greet them back, if it is a question regarding their email, let them know there is no such information in their mailbox.
            - If the CONTEXT BLOCK is not empty but it does not contain enough information to answer a question, politely say you don't have enough information.
            - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
            - Do not invent or speculate about anything that is not directly supported by the email context.
            - Keep your responses concise and relevant to the user's questions or the email being composed.`

        const result = await streamText({
            model,
            // messages: [prompt, ...messages.filter((message: Message) => message.role === 'user')],
            prompt: prompt
        })
        console.log(result.toDataStreamResponse())
        await db.chatbotInteraction.update({
            where: {
                day: today,
                userId: userId
            },
            data: {
                count: {
                    increment: 1
                }
            }
        })
        return result.toDataStreamResponse()
        // return new Response("OK", {status: 200})
    } catch (error) {
        console.log("error", error)
        return new Response("Internal Server Error", {status: 500})
    }
}