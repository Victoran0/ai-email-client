'use client'
import { api } from '@/trpc/react'
import React from 'react'

type Props = {
    isCollapsed: boolean 
}

const AccountSwitcher = ({isCollapsed}: Props) => {
    const {data} = api.account.getAccounts.useQuery()
    
    return (
        <div>
            {data?.map((account, id) => {
                return <div key={id}>{account.emailAddress}</div>
            })}
        </div>
    )
}

export default AccountSwitcher