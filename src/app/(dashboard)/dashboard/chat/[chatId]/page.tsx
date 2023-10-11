/* eslint-disable @next/next/no-img-element */
import Messages from '@/components/Messages'
import { fetchRedisData } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validators/message'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC } from 'react'
import ChatInput from '@/components/ChatInput'


interface pageProps {
    params: {
        chatId: string
    }
}

const getMessages = async (chatId: string) => {
    try {
        const results: string[] = await fetchRedisData(
            'zrange',
            `chat:${chatId}:messages`,
            0,
            -1
        )
        const dbmsg = results.map((msg) => JSON.parse(msg) as Message)
        const revdbMsg = dbmsg.reverse()
        const messages = messageArrayValidator.parse(revdbMsg)
        return messages
    } catch (error) {
        notFound()
    }
}

const page = async ({ params }: pageProps) => {
    const { chatId } = params
    const session = await getServerSession(authOptions)
    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }

    const { user } = session

    const [userId1, userId2] = chatId.split('--')

    if (user.id !== userId1 && user.id !== userId2) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false,
            },
        }
    }

    const partnerId = user.id === userId1 ? userId2 : userId1
    const chatPartnerRaw = await fetchRedisData(
        'get',
        `
        user:${partnerId}
        `
        ,
    )
    const chatPartner = JSON.parse(chatPartnerRaw) as User
    const messages = await getMessages(chatId)
    // console.log(messages);


    return (
        <div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]'>
            <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
                <div className='relative flex items-center space-x-4'>
                    <div className='relative'>
                        <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
                            <img
                                className='rounded-full object-cover w-full h-full'
                                src={chatPartner.image}
                                alt={chatPartner.name}
                            />
                        </div>
                    </div>

                    <div className='flex flex-col leading-tight'>
                        <div className='text-xl flex items-center'>
                            <span className='text-gray-700 mr-3 font-semibold'>
                                {chatPartner.name}
                            </span>
                        </div>

                        <span className='text-sm text-gray-600'>{chatPartner.email}</span>
                    </div>
                </div>
            </div>
            <Messages
                chatId={chatId}
                chatPartner={chatPartner}
                sessionImg={session.user.image}
                sessionId={session.user.id}
                initialMessages={messages}
            />
            <ChatInput chatId={chatId} chatPartner={chatPartner} />
        </div>
    )
}



export default page