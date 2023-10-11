import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { fetchRedisData } from "@/helpers/redis";
import { Message, messageValidator } from '@/lib/validators/message'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { nanoid } from 'nanoid'
export async function POST(req: Request) {
    try {
        const { text, chatId } = await req.json();
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Unauthorized", {
                status: 401
            });
        }
        const [userId, userId1] = chatId.split('--')
        if (session.user.id !== userId && session.user.id !== userId1) {
            return new Response('Unauthorized', { status: 401 })
        }
        const friendId = session.user.id === userId ? userId1 : userId
        const friendList = (await fetchRedisData(
            'smembers',
            `user:${session.user.id}:friends`
        )) as string[]

        const isFriend = friendList.includes(friendId)

        if (!isFriend) {
            return new Response('Unauthorized', { status: 401 })
        }

        const rawSender = (await fetchRedisData(
            'get',
            `user:${session.user.id}`
        )) as string
        const sender = JSON.parse(rawSender) as User

        const timestamp = Date.now()

        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp,
        }
        const message = messageValidator.parse(messageData)
        console.log(message)
        await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message)

        await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message,
            senderImg: sender.image,
            senderName: sender.name
        })

        // all valid, send the message
        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message),
        })

        return new Response('OK')
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response('Internal Server Error', { status: 500 })
    }

}