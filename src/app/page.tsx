'use client'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    router.push('/login')
    return null;
  }

  else {
    router.push('/dashboard')
    return null;
  }
}
