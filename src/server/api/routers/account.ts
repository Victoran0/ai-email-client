import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";
import { emailAddressSchema } from "@/lib/types";
import { Account } from "@/lib/account";
import { OramaClient } from "@/lib/orama";
import { FREE_CREDITS_PER_DAY } from "@/constants";
import { threadId } from "worker_threads";

// to check if the user is authorised any not trying to access information from any other account
export const authoriseAccountAccess = async (accountId: string, userId: string) => {
    const account = await db.account.findFirst({
        where: {
            id: accountId,
            userId
        }, select: {
            id: true, emailAddress: true, name: true, accessToken: true
        }
    })  
    if (!account) throw new Error("Account not found")
    return account
}
// When we create a trpc router, we are just grouping endpoints together to a certain router
export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async ({ctx}) => {
        return await ctx.db.account.findMany({
            where: {
                userId: ctx.auth.userId
            },
            select: {
                id: true, emailAddress: true, name: true
            },
        })
    }),
    getNumThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string()
    })).query(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)

        let filter: Prisma.ThreadWhereInput = {}
        
        if (input.tab === 'inbox') {
            filter.inboxStatus = true
        } else if (input.tab === 'draft') {
            filter.draftStatus = true
        } else if (input.tab === 'sent') {
            filter.sentStatus = true
        }

        return await ctx.db.thread.count({
            where: {
                accountId: account.id,
                ...filter
            }
        })
    }),
    getThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean()
    })).query(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const acc = new Account(account.accessToken)
        acc.syncEmails(input.accountId).catch(console.error)

        let filter: Prisma.ThreadWhereInput = {}

        if (input.tab === 'inbox') {
            filter.inboxStatus = true
        } else if (input.tab === 'draft') {
            filter.draftStatus = true
        } else if (input.tab === 'sent') {
            filter.sentStatus = true
        }

        filter.done = {
            equals: input.done
        }

        return await ctx.db.thread.findMany({
            where: filter,
            include: {
                emails: {
                    orderBy: {
                        sentAt: 'asc'
                    },
                    select: {
                        from: true,
                        body: true,
                        bodySnippet: true,
                        emailLabel: true,
                        subject: true,
                        sysLabels: true,
                        id: true,
                        sentAt: true
                    }
                },
            },
            take: 15,
            orderBy: {
                lastMessageDate: 'desc'
            }
        })
    }),
    getSuggestions: privateProcedure.input(z.object({
        accountId: z.string()
    })).query(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        return await ctx.db.emailAddress.findMany({
            where: {
                accountId: account.id
            },
            select: {
                address: true,
                name: true
            }
        })
    }),
    getReplyDetails: privateProcedure.input(z.object({
        accountId: z.string(),
        threadId: z.string()
    })).query(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const thread = await ctx.db.thread.findFirst({
            where: {
                id: input.threadId
            },
            include: {
                emails: {
                    orderBy: {sentAt:'asc'},
                    select: {
                        from:true,
                        to:true,
                        cc: true,
                        sentAt: true,
                        bcc:true,
                        subject: true,
                        internetMessageId: true
                    }
                }
            }
        })
        if (!thread || thread.emails.length === 0) throw new Error("Thread not found")

        // finding the last email that does not belong to the current user
        const lastExternalEmail = thread.emails.reverse().find( email=>email.from.address !== account.emailAddress)
        
        if (!lastExternalEmail) throw new Error("No external email found")

        return {
            subject: lastExternalEmail.subject,
            to: [lastExternalEmail.from, ...lastExternalEmail.to.filter(to => to.address !== account.emailAddress)],
            cc: lastExternalEmail.cc.filter(cc => cc.address !== account.emailAddress),
            from:  {name: account.name, address: account.emailAddress},
            id: lastExternalEmail.internetMessageId
        }
    }),

    saveDraft: privateProcedure.input(z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        to: z.array(emailAddressSchema).optional(),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional()
    })).mutation(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const acc = new Account(account.accessToken)
        await acc.saveDraft({
            from: input.from,
            subject: input.subject,
            body: input.body,
            cc: input.cc,
            bcc: input.bcc,
            to: input.to,
            replyTo: input.replyTo,
            inReplyTo: input.inReplyTo,
            threadId: input.threadId
        })
    }),

    sendEmail: privateProcedure.input(z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        to: z.array(emailAddressSchema),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional(),
        
        // Mutation is a function we can call to perform an action on the server
    })).mutation(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const acc = new Account(account.accessToken)
        await acc.sendEmail({
            from: input.from,
            subject: input.subject,
            body: input.body,
            inReplyTo: input.inReplyTo,
            threadId: input.threadId,
            to: input.to,
            cc: input.cc,
            bcc: input.bcc,
            replyTo: input.replyTo,
        })
    }),

    searchEmails: privateProcedure.input(z.object({
        accountId: z.string(),
        query: z.string()
    })).mutation(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        // console.log("The user's account: ", account)
        const orama = new OramaClient(account.id)
        await orama.initialize()
        const {query} = input
        const results = await orama.search({term: query})
        console.log("the orama search results: ", results.hits[0]?.document)
        return results
    }),
    getChatbotInteraction: privateProcedure.input(z.object({accountId: z.string()})
    ).query(async({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const today = new Date().toDateString()
        const chatbotInteraction = await db.chatbotInteraction.findUnique({
            where: {
                userId: ctx.auth.userId,
                day: today
            }
        })
        const remainingCredit = FREE_CREDITS_PER_DAY - (chatbotInteraction?.count || 0)
        return {remainingCredit}
    })
})