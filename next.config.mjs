import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

await initOpenNextCloudflareForDev()

/** @type {import('next').NextConfig} */
const nextConfig = { images: { unoptimized: true } }
export default nextConfig
