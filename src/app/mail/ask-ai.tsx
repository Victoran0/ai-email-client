"use client"
import React from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import { cn } from '@/lib/utils'
import { Send, SparkleIcon } from 'lucide-react'
import {useChat} from 'ai/react'
import useThreads from '@/hooks/use-threads'
import PremiumBanner from './premium-banner'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

const AskAI = ({isCollapsed}: {isCollapsed: boolean}) => {
    if (isCollapsed) return null
    const {accountId} = useThreads()
    const utils = api.useUtils()
    const {input, handleInputChange, handleSubmit, messages} = useChat({
        api: '/api/chat',
        body: {
            accountId
        },
        onError: error => {
            toast.error(error.message)
            console.error("useChat error: ", error)
        },
        onFinish: () => {
            utils.account.getChatbotInteraction.refetch()
        },
        initialMessages: []
    })
    // const messages: any[] = []
  return (
    <div className='p-4 mb-14'>
        <PremiumBanner />
        <div className="h-4"></div>
        <motion.div className='flex flex-1 flex-col items-end p-4 pb-4 rounded-lg bg-gray-100 shadow-inner dark:bg-gray-900'>
        <div className="max-h-[50vh] overflow-y-scroll w-full flex flex-col gap-2" id='message-container'>
            <AnimatePresence mode='wait'>
                {messages.map((message) => {
                    return (
                        <motion.div 
                            key={message.id}
                            layout='position'
                            className={cn('z-10 mt-2 max-w-[250px] break-words rounded-2xl bg-gray-200 dark:bg-gray-800', 
                            {'self-end text-gray-900 dark:text-gray-100': message.role === 'user', 
                            'self-start bg-blue-500 text-white': message.role === 'assistant'
                            })}
                            layoutId={`container-[${messages.length-1}]`}
                            transition={{
                                type: 'easeOut',
                                duration: 0.2
                            }}
                        >
                            <div className='px-3 py-2 text-[15px] leading-[15px]'>
                                {message.content}
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
        {messages.length > 0 && <div className='h-4'/>}
        <div className="w-full">
            {messages.length === 0 && <div className='mb-4'>
                <div className="flex items-center gap-4">
                    <SparkleIcon className='size-6 text-gray-600' />
                    <div>
                        <p className="text-gray-900 dark:text-gray-100">Ask AI anything about your emails</p>
                        <p className="text-gray-500 text-xs dark:text-gray-400">Get answers to your questions about your emails</p>
                    </div>
                </div>
                <div className="h-2"></div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span 
                    className='cursor-pointer px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs'
                    onClick={() => {
                        handleInputChange({target: {value: "What can i ask?"}})
                    }}
                    >
                        What can I ask?
                    </span>
                    <span 
                    className='cursor-pointer px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs'
                    onClick={() => {
                        handleInputChange({target: {value: "When is my next flight?"}})
                    }}
                    >
                        When is my next flight?
                    </span>
                    <span 
                    className='cursor-pointer px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs'
                    onClick={() => {
                        handleInputChange({target: {value: "When is my next meeting?"}})
                    }}
                    >
                        When is my next meeting?
                    </span>
                </div>
            </div>}
            <form className='w-full flex'onSubmit={handleSubmit} >
                <input 
                    type="text" className='py-1 relative h-9 placeholder:text-[13px] flex-grow rounded-full border border-gray-200 bg-white px-3 text-[15px] outline-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-blue-500/20 focus-visible:ring-offset-1
                    dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus-visible:ring-blue-500/20 dark:focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-700'
                    placeholder='Ask AI anything about your emails'
                    value={input}
                    onChange={handleInputChange}
                />
                <motion.div 
                    key={messages.length}
                    layout='position'
                    layoutId={`container-[${messages.length}]`}
                    transition={{
                        type: 'eastOut',
                        duration: 0.2
                    }}
                    initial={{opacity: 0.6, zIndex:-1}}
                    animate={{opacity: 0.6, zIndex:-1}}
                    exit={{opacity:1, zIndex:1}}
                    className='pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full bg-gray-200 [word-break:break-word] dark:bg-gray-800'
                >
                    <div className="px3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100">
                        {input}
                    </div>
                </motion.div>
                <button title='send' type="submit" className='ml-2 flex size-9 items-center justify-center rounded-full bg-gray-200 dark:border-y-gray-800'>
                    <Send className='size-4 text-gray-500 dark:text-gray-300' />
                </button>
            </form>
        </div>
        </motion.div>
    </div>
  )
}

export default AskAI
