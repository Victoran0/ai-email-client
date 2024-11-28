"use client"
import { Button } from '@/components/ui/button'
import { createBillingPortalSession, createCheckoutSession, getSubscriptionStatus } from '@/lib/stripe-action'
import React, { useEffect, useState } from 'react'

const StripeButton = () => {
    const [isSubscribed, setIsSubscribed] = useState(false)

    useEffect(() => {
      ( async() => {
        const subscriptionStatus = await getSubscriptionStatus()
        setIsSubscribed(subscriptionStatus)
      })()
    }, [])
    
    const handleClick = async () => {
      if (isSubscribed) {
        await createBillingPortalSession()
      } else {
        await createCheckoutSession()
      }
    }

  return (
    <Button variant={'outline'} size='lg' onClick={handleClick}>
        {isSubscribed ? 'Manage Subscription' : "Upgrade plan"}

    </Button>
  )
}

export default StripeButton