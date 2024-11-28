import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { headers } from "next/headers"
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text()
    // console.log("body: ", body)
    const signature = (await headers()).get('Stripe-Signature') as string
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string)
    } catch (error) {
        return new Response("Webhook Error", {status: 400})
    }
    const session = event.data.object as Stripe.Checkout.Session
    console.log("received stripe event", event.type)

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
            {
                expand: ['items.data.price.product']
            }
        ) 
        if (!session?.client_reference_id) {
            return new Response("no userid", {status: 400})
        }
        const plan = subscription.items.data[0]?.price
        if (!plan) {
            return new Response("No plan found for this subscription.", {status: 400})
        }
        const productId = (plan.product as Stripe.Product).id

        if (!productId) {
            return new Response("No product ID found for this subscription.", {status: 400})
        }

        await db.stripeSubscription.create({
            data: {
                userId: session.client_reference_id,
                priceId: plan.id,
                customerId: subscription.customer as string,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                subscriptionId: subscription.id
            }
        })

        return new Response("Webhook received", {status: 200})
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
            {
                expand: ['items.data.price.product']
            }
        ) 

        if (!session?.client_reference_id) {
            return new Response("no userid", {status: 400})
        }

        const plan = subscription.items.data[0]?.price
        if (!plan) {
            return new Response("No plan found for this subscription.", {status: 400})
        }

        await db.stripeSubscription.update({
            where: {
                userId: session.client_reference_id,
                subscriptionId: subscription.id as string
            },
            data: {
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                priceId: plan.id,
            }
        })

        return new Response("Webhook received", {status: 200})
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const existingSubscription = await db.stripeSubscription.findUnique({
            where: {
                subscriptionId: session.id as string,
                userId: session.client_reference_id as string
            }
        })

        if (!existingSubscription) {
            return new Response("Subscription not found.", {status: 200})
        }

        if (!session?.client_reference_id) {
            return new Response("no userid", {status: 400})
        }

        await db.stripeSubscription.update({
            where: {
                userId: session.client_reference_id,
                subscriptionId: subscription.id as string
            },
            data: {
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date(),
            }
        })
    }

    return new Response("Webhook received", {status: 200})
}