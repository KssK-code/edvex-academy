// Server Component — exports route segment config so Next.js/Vercel
// never statically pre-generates or CDN-caches this route.
export const dynamic = 'force-dynamic'

import LandingPage from './_components/LandingPage'

export default function Page() {
  return <LandingPage />
}
