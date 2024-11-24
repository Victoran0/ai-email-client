'use client'
import ThemeToggle from '@/components/theme-toogle'
import { UserButton } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import React from 'react'
import ComposeButton from './compose-button'
// import Mail from './mail'
// importing mail dynamically

const Mail = dynamic(() => {
    return import("./mail")
}, {
    ssr: false
})


const MailDashboard = () => {
    return (
        <>
            <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2">
                    <UserButton />
                    <ThemeToggle />
                    <ComposeButton />
                </div>
            </div>
            <Mail
            defaultLayout={[20,32,40]}
            defaultCollapsed={false}
            navCollapsedSize={4}
            />
        </>
    )
}

export default MailDashboard
