import {waitUntil} from '@vercel/functions'
import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko"
import { auth, getAuth } from "@clerk/nextjs/server"
import { NextResponse, NextRequest } from "next/server"
import { db } from "@/server/db"
import axios from 'axios'


export const GET = async (req: NextRequest) => {
    const {userId} = await auth()
    if (!userId) return NextResponse.json({message: 'Unauthorized'}, {status:401})

    const params = req.nextUrl.searchParams
    const status = params.get('status')
    if (status != 'success') return NextResponse.json({message: 'Failed to link account'})

    // Get the code to exchange for the access token
    const code = params.get('code')
    if (!code) return NextResponse.json({message: "No code provided"}, {status: 400})
    
    const token = await exchangeCodeForAccessToken(code)
    if (!token) return NextResponse.json({message: "Failed to exchange code for access token"}, {status: 400})

    const accountDetails = await getAccountDetails(token.accessToken)
    console.log(accountDetails)

    // upsert means updating or inserting
    await db.account.upsert({
        where: {
            id: token.accountId.toString()
        },
        update: {
            accessToken: token.accessToken,
        },
        create: {
            id: token.accountId.toString(),
            userId,
            emailAddress: accountDetails.email,
            name: "Victor O",
            accessToken: token.accessToken
        }
    })

    // trigger initial sync endpoint
    // we are going to wait for the initial sync to complete bebfore we end this process, but we are going to immediately send them a return redirect response
    waitUntil(
        axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
            accountId: token.accountId.toString(),
            userId
        }).then(response => {
            console.log("Initial sync trigerred: ", response.data)
        }).catch(error => {
            console.error("Failed to trigger initial sync", error)
        })
    )

    console.log('userid is: ', userId)

    return NextResponse.redirect(new URL('/mail', req.url))
}

