"use client"
import React, { useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
// import EmailEditor from './email-editor'
const EmailEditor = dynamic(() => {
    return import('./email-editor')
}, {ssr: false})
import { api } from '@/trpc/react'
import useThreads from '@/hooks/use-threads'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import DraftOption from './draft-option'
import { turndown } from '@/lib/turndown'


const ComposeButton = () => {
    const [toValues, setToValues] = useState<{label: string, value: string} []>([])
    const [ccValues, setCcValues] = useState<{label: string, value: string} []>([])
    const [subject, setSubject] = useState<string>('')
    const [value, setValue] = React.useState<string>('')
    const [showDraftOption, setShowDraftOption] = useState<boolean>(false)

    const sendEmail = api.account.sendEmail.useMutation()
    const saveDraft = api.account.saveDraft.useMutation()
    const {account} = useThreads()

    const handleSend = async (value: string) => {
        if (!account) return
        sendEmail.mutate({
            accountId: account.id,
            threadId: undefined,
            body: value,
            from: {name: account?.name ?? 'Me', address: account.emailAddress ?? 'me@example.com'},
            to: toValues.map(to => ({name: to.value, address: to.value})),
            cc: ccValues.map(cc => ({name: cc.value, address: cc.value})),
            replyTo: {name: account?.name ?? 'Me', address: account.emailAddress ?? 'me@example.com'},
            subject: subject,
            inReplyTo: undefined
        }, {
            onSuccess: () => {
                toast.success("Email sent")
            },
            onError: error => {
                console.log(error)
                toast.error("Error sending Email")
            }
        })
        // console.log("value", value)
    }

    const handleDrawerOpen = (isOpen: boolean): void => {
        console.log("is the drawer open: ", isOpen)
        if (!isOpen) {
            if (turndown.turndown(value) !== "" || subject !== "") {
                setShowDraftOption(!isOpen)
            }
            // console.log('---- the body----', )
            // console.log('---- the subject----', )
        }
        // if the input fields are empty, terminate the compose section. If it is not empty, then show the draftoptions
    }

    const handleSaveDraft = () => {
        setValue('')
        setSubject('')
    }

    const handleDeleteDraft = () => {
        if (!account) return
        saveDraft.mutate({
            accountId: account.id,
            threadId: undefined,
            body: value,
            from: {name: account?.name ?? 'Me', address: account?.emailAddress ?? 'me@example.com'},
            to: toValues.map(to => ({name: to.value, address: to.value})),
            cc: ccValues.map(cc => ({name: cc.value, address: cc.value})),
            replyTo: {name: account?.name ?? 'Me', address: account?.emailAddress ?? "me@example.com"},
            subject: subject,
            inReplyTo: undefined
        }, {
            onSuccess: () => {
                toast.success("Draft saved")
            },
            onError: (error) => {
                console.log("Error while saving the draft: ", error)
                toast.error("Error saving draft")
            }
        })
    }


  return (
    <>
        <Drawer onOpenChange={handleDrawerOpen}>
            <DrawerTrigger>
                <Button>
                    <Pencil className='size-4 mr-1' />
                    Compose
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                <DrawerTitle>Compose Email</DrawerTitle>
                </DrawerHeader>
                <EmailEditor
                    toValues={toValues}
                    setToValues={setToValues}
                    ccValues={ccValues}
                    setCcValues={setCcValues}
                    subject={subject}
                    setSubject={setSubject}
                    handleSend={handleSend}
                    isSending={sendEmail.isPending}
                    to={toValues.map(to => to.value)}
                    defaultToolbarExpanded={true}
                    value={value}
                    setValue={setValue}
                />
            </DrawerContent>
        </Drawer>
        <DraftOption 
            open={showDraftOption} 
            setOpen={setShowDraftOption} 
            handleDeleteDraft={handleDeleteDraft}
            handleSaveDraft={handleSaveDraft}
        />
    </>
  )
}

export default ComposeButton
