import axios from "axios";
import { SyncResponse, SyncUpdatedResponse, EmailMessage, EmailAddress } from "./types";
import { threadId } from "worker_threads";
import { db } from "@/server/db";
import { syncEmailsToDatabase } from "./sync-to-db";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async startSync(daysWithin: number): Promise<SyncResponse> {
        const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync', {}, {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params: {
                daysWithin,
                bodyType: 'html'
            }
        })
        return response.data
    }

    async getUpdatedEmails({deltaToken, pageToken}: {deltaToken?: string, pageToken?: string}) {
        // console.log('getUpdatedEmails', { deltaToken, pageToken });
        console.log("updated emails");
        let params: Record<string, string> = {}
        if (deltaToken) params.deltaToken = deltaToken
        if (pageToken) params.pageToken = pageToken

        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params
        });
        return response.data
    }

    async performInitialSync() {
        try {
            // start the sync process
            const daysWithin = 365
            let syncResponse = await this.startSync(daysWithin)
            // keep rechecking until it is ready
            while (!syncResponse.ready) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                syncResponse = await this.startSync(daysWithin)
            }

            console.log("Sync is ready. Tokens: ", syncResponse)

            // get the bookmark delta token
            let storedDeltaToken: string = syncResponse.syncUpdatedToken

            let updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken})

            // console.log("Updated response: ", updatedResponse)

            if (updatedResponse && updatedResponse.nextDeltaToken) {
                // then the sync has completed
                storedDeltaToken = updatedResponse.nextDeltaToken
            }
            if (updatedResponse) {
                let allEmails: EmailMessage[] = updatedResponse.records

                // fetch all pages if there are more
                while (updatedResponse && updatedResponse.nextPageToken) {
                    updatedResponse = await this.getUpdatedEmails({pageToken: updatedResponse.nextPageToken})
                    allEmails = allEmails.concat(updatedResponse.records)
                    if (updatedResponse.nextDeltaToken) {
                        // sync has ended
                        storedDeltaToken = updatedResponse.nextDeltaToken
                    }
                }
                
                console.log("initial sync completed, we have synced", allEmails.length, 'email')
                // store the latest deltaToken for future incremental syncs
                await this.getUpdatedEmails({deltaToken: storedDeltaToken})
    
                return {
                    emails: allEmails,
                    deltaToken: storedDeltaToken
                }
            }
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error during sync:", JSON.stringify(error.response?.data, null, 2));
            } else {
                console.error("Error during sync: ", error)
            }
        }
    }

    async syncEmails(accountId: string) {
        const account = await db.account.findUnique({
            where: {
                accessToken: this.token,
                id: accountId
            } 
        })
        if (!account) throw new Error("Account not found")
        if (!account.nextDeltaToken) throw new Error("Account not ready for sync")
        let response = await this.getUpdatedEmails({
        deltaToken: account.nextDeltaToken})
        let storedDeltaToken = account.nextDeltaToken
        let allEmails: EmailMessage[] = response.records

        if (response.nextDeltaToken) {
            storedDeltaToken = response.nextDeltaToken
        }

        while (response.nextPageToken) {
            response = await this.getUpdatedEmails({pageToken: response.nextPageToken})
            allEmails = allEmails.concat(response.records)
            if (response.nextDeltaToken) {
                storedDeltaToken = response.nextDeltaToken
            }
        }

        try {
            syncEmailsToDatabase(allEmails, account.id) 
        } catch (error) {
            console.error("Error during sync: ", error)
        }

        await db.account.update({
            where: {id: account.id},
            data: {nextDeltaToken: storedDeltaToken}
        })

        return {
            emails: allEmails,
            deltaToken: storedDeltaToken
        }
    }

    async sendEmail({
        from,
        subject,
        body,
        inReplyTo,
        threadId,
        references,
        to,
        cc,
        bcc,
        replyTo
    }: {
        from: EmailAddress,
        subject: string,
        body: string,
        inReplyTo?: string,
        threadId?: string,
        references?: string,
        to: EmailAddress[],
        cc?: EmailAddress[],
        bcc?: EmailAddress[],
        replyTo?: EmailAddress
    }) {
        try {
            const response = await axios.post('https://api.aurinko.io/v1/email/messages', {
                from,
                subject,
                body,
                inReplyTo,
                threadId,
                references,
                to,
                cc,
                bcc,
                replyTo: [replyTo]
            }, {
                params: {
                    returnIds: true
                },
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            })
            console.log("email sent", response.data)
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error sending email:', JSON.stringify(error.response?.data, null, 2));
            } else {
                console.error('Error sending email:', error);
            }
            throw error;
        }
    }
}