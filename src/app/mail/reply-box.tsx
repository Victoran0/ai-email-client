"use client"
import React, { useEffect, useState } from 'react'
import EmailEditor from './email-editor'
import { api, RouterOutputs } from '@/trpc/react'
import useThreads from '@/hooks/use-threads'

const ReplyBox = () => {
    const {accountId, threadId} = useThreads()
    const {data: replyDetails} = api.account.getReplyDetails.useQuery({
        accountId, 
        threadId: threadId ?? ""
    })

    if (!replyDetails) return null

    return <Component replyDetails={replyDetails} />
}

const Component = ({replyDetails}: {replyDetails: RouterOutputs['account']['getReplyDetails']}) => {
    const {accountId, threadId} = useThreads()
    const [subject, setSubject] = useState(replyDetails.subject.startsWith("Re:") ? replyDetails.subject : `Re ${replyDetails.subject}`)
    const [toValues, setToValues] = useState<{label: string, value: string} []>(replyDetails.to.map(to => ({label: to.address, value: to.address})))
    const [ccValues, setCcValues] = useState<{label: string, value: string} []>(replyDetails.cc.map(cc => ({label: cc.address, value: cc.address})))

    useEffect(() => {
        if (!threadId || !replyDetails) return

        if (!replyDetails.subject.startsWith("Re:")) {
            setSubject(`Re: ${replyDetails.subject}`)
        } else {
            setSubject(replyDetails.subject)
        }

        setToValues(replyDetails.to.map(to => ({label: to.address, value: to.address})))
        setCcValues(replyDetails.cc.map(cc =>({label: cc.address, value: cc.address})))

    }, [threadId, replyDetails])

    const handleSend = async (value: string) => {
        console.log(value)
    }

    return (
        <div>
            <EmailEditor 
                subject={subject}
                setSubject={setSubject}

                toValues={toValues}
                setToValues={setToValues}

                ccValues={ccValues}
                setCcValues={setCcValues}

                to={replyDetails.to.map(to => to.address)}

                handleSend={handleSend}
                isSending={false}
            />
        </div>
    )
}

export default ReplyBox
