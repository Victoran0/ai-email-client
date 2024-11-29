# AI Email Client

Users can sync their emails, search for any email, reply and compose a new thread of email.  
![AI Email Copilot home Page ](./public/demo.png)

## All this features are also enhanced with AI:

- users can give AI a prompt describing what they have in mind for the mail and AI will compose it for them.
  ![Ai composer page for replies](./public/composeAutopilot.png)
  ![AI composer page for composing new email](./public/replyAutoPilot.png)

- users can auto complete when writing a new email by simply pressing `ctrl + Q`.

- users can chat with an AI to search through their emails and get the results of the related data.
  ![RAG search and AI reply page](./public/ragsearch.png)

- users can subscribe to the premium plan to enable unlimited AI functionalities all day long. (basic plan gives only 15 AI helps daily)
  ![Subscribed premium user UI](./public/subscriptionSuccessful.png)

## What tech stacks and libraries are used in this project?

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- Shadcn-UI: For the UI components
- Neon DB: As the primary database to store data
- Orama: For Rag and vector search
- Stripe: For payment and subscription plan managements
- GoogleGenerativeAI: As the LLM Model
- Vercel AI sdk: To stream AI response
- react-avatar: For user avatars
- react-select: For selecting cc and Bccs
- Clerk: For user authentication
- Sonner: For toasting error and other messages
- Next-Themes: To toggle light and dark mode
- K bar: For enabling keyboard shortcuts
- Tiptap: Enabling an headless WYSIWYG editor in the reply and compose email body
- framer-motion: For interesting animations
- Jotai: For the useAtom hook to store react.useState values as an atom
- useHooks-ts: For the useLocalStorage hook to store react.useState values in local storage
- DomPurify: For protecting dangerously set innerHtml
- etc
