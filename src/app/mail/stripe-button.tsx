"use client"
import { Button } from '@/components/ui/button'
import { createBillingPortalSession, createCheckoutSession, getSubscriptionStatus } from '@/lib/stripe-action'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const StripeButton = () => {
    const [isSubscribed, setIsSubscribed] = useState({isSubscribed: false, loaded: false})

    useEffect(() => {
      ( async() => {
        const subscriptionStatus = await getSubscriptionStatus()
        setIsSubscribed({isSubscribed: subscriptionStatus, loaded: true})
      })()
    }, [])
    
    const handleClick = async () => {
      if (isSubscribed.isSubscribed) {
        await createBillingPortalSession()
      } else {
        await createCheckoutSession()
      }
    }
  
    if (isSubscribed.loaded) {
      return (
        <Button variant={'outline'} size='lg' onClick={handleClick}>
        {isSubscribed ? 'Manage Subscription' : "Upgrade plan"}

        </Button>
      )
    } else return <Loader2 className='animate-spin text-gray-400 size-full md:size-auto' /> 
}

export default StripeButton