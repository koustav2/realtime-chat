import FriendRequests from '@/components/FriendRequests';
import { fetchRedisData } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { FC } from 'react'



const page = async ({ }) => {
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    // ids of people who sent current logged in user a friend requests
    const incomingSenderIds = (await fetchRedisData(
        'smembers',
        `user:${session.user.id}:incoming_friend_requests`
    )) as string[]
    // ids of people who current logged in user sent a friend request to
    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async (Id) => {
            const sender = (await fetchRedisData('get', `user:${Id}`)) as string
            const senderParsed = JSON.parse(sender) as User

            return {
                Id,
                senderEmail: senderParsed.email,
            }
        })
    )

    return (
        <main className='pt-8'>
            <h1 className='font-bold text-5xl  gradient-text mb-8'>Add a friend</h1>
            <div className='flex flex-col gap-4'>
                <FriendRequests
                    incomingFriendRequests={incomingFriendRequests}
                    sessionId={session.user.id}
                />
                {/* <>
                    {incomingFriendRequests.map((request) => (
                        <div
                            key={request.Id}
                        >
                            <h1>{request.senderEmail}</h1>
                            <h1>{request.Id}</h1>
                        </div>
                    ))}
                </> */}
            </div>
        </main>
    )
}

export default page