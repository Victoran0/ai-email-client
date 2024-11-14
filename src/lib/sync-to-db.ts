import { EmailMessage } from "./types";
import pLimit from 'p-limit'


export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log("attempting to sync emails to database", emails)
    const limit = pLimit(10)

    try {
        Promise.all(emails.map((email, index) => upsertEmail(email, accountId, index)))
    } catch (error) {
        console.log("oopsies", error)
    }

}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
    console.log("Upserting email", index)
    try {
        let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox'
        if (email.sysLabels.includes("inbox") || email.sysLabels.includes("important")) {
            emailLabelType = 'inbox'
        }
    } catch (error) {
        
    }
}