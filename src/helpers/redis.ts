const restUrl = process.env.UPSTASH_REDIS_REST_URL
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN

type cmd = 'zrange' | 'sismember' | 'get' | 'smembers';

export async function fetchRedisData(
  cmd: cmd,
  ...args: (string | number)[]
) {
  const RESTURL = `${restUrl}/${cmd}/${args.join('/')}`

  const res = await fetch(RESTURL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Error executing Redis command: ${res.statusText}`)
  }

  const data = await res.json()
  return data.result
}




