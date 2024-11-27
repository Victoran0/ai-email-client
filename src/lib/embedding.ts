import {GoogleGenerativeAI} from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY as string);
const gemini = genAI.getGenerativeModel({ model: "text-embedding-004"});

export async function getEmbeddings(text: string) {
    try {
        const result = await gemini.embedContent(text.replace(/\n/g, " "))
        // console.log(result.embedding.values);
        return result.embedding.values as number[]
    } catch (error) {
        console.log("error calling gemini embedding: ", error)
        throw error
    }
}

// console.log(await getEmbeddings('hello world'))