import { fetchRedisData } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validators/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { email: emailToAdd } = addFriendValidator.parse(body.email)

        const idToAdd = (await fetchRedisData(
            'get',
            `user:email:${emailToAdd}`
        )) as string

        if (!idToAdd) {
            return new Response('This person does not exist.', { status: 400 })
        }

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        if (idToAdd === session.user.id) {
            return new Response('You cannot add yourself as a friend', {
                status: 400,
            })
        }

        const isAddedAlready = (await fetchRedisData(
            'sismember',
            `user:${idToAdd}:incoming_friend_requests`,
            session.user.id
        )) as 0 | 1

        if (isAddedAlready) {
            return new Response('You have already added this person', {
                status: 400,
            })
        }

        const isAlreadyFriend = (await fetchRedisData(
            'sismember',
            `user:${session.user.id}:friends`,
            idToAdd
        )) as 0 | 1

        if (isAlreadyFriend) {
            return new Response('You are already friends with this person', {
                status: 400,
            })
        }
        await pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_requests',
            {
                Id: session.user.id,
                senderEmail: session.user.email,
            }
        )

        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('Done, Friend request sent', { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', { status: 422 }) // Unprocessable Entity
        }
        else if (error instanceof Error) {
            return new Response(error.message, { status: 400 })
        }
        else {
            return new Response('Something went wrong', { status: 500 })
        }

    }

}