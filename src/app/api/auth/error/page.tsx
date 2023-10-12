import Link from 'next/link'
import { FC } from 'react'

interface pageProps {

}

const page: FC<pageProps> = ({ }) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Not Found</h2>
      <p className="text-xl">Could not find the requested resource</p>
      <a href="/" className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Return Home</a>
    </div>
  )
}

export default page