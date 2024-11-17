import { createTRPCRouter, privateProcedure } from "../trpc";

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
    })
})