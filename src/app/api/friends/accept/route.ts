import { fetchRedisData } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id: idToAdd } = z.object({
            id: z.string()
        }).parse(body);
        // console.log(idToAdd);
        // console.log('req 1');




        const session = await getServerSession(authOptions);
        // console.log('req 2');
        // console.log(session);


        if (!session) {
            return new Response("Unauthorized", {
                status: 401
            });
        }

        const isAlreadyFriend = await fetchRedisData(
            'sismember',
            `user:${session.user.id}:friends`,
            idToAdd
        )
        // console.log('req 3');


        if (isAlreadyFriend) {
            return new Response(JSON.stringify({ error: "Already friends" }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }

        const hasFriendRequest = await fetchRedisData(
            'sismember',
            `user:${session.user.id}:incoming_friend_requests`,
            idToAdd
        )
        // console.log('req 4');
        // console.log('hasFriendRequest? ', hasFriendRequest);

        if (!hasFriendRequest) {
            return new Response(JSON.stringify({ error: "No friend request" }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        const [userRaw, friendRaw] = (await Promise.all([
            fetchRedisData('get', `user:${session.user.id}`),
            fetchRedisData('get', `user:${idToAdd}`),
        ])) as [string, string]

        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User

        await Promise.all([
            pusherServer.trigger(
                toPusherKey(`user:${idToAdd}:friends`),
                'new_friend',
                user
            ),
            pusherServer.trigger(
                toPusherKey(`user:${session.user.id}:friends`),
                'new_friend',
                friend
            ),
            db.sadd(`user:${session.user.id}:friends`, idToAdd),
            db.sadd(`user:${idToAdd}:friends`, session.user.id),
            db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
        ])

        return new Response('OK')


    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request body', { status: 422 })
        }
        return new Response('Invalid request', { status: 400 });
    }

}