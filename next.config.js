/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost', 'res.cloudinary.com', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    }
}

module.exports = {
    nextConfig,
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: true,
            },
        ]
    },
}
