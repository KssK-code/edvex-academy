/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions, prefer-spread, prefer-rest-params -- loader fbq oficial Meta */
'use client'

import { useEffect } from 'react'

const PIXEL_ID = '1576900274439491'

export default function MetaPixel() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).__edvexMetaPixelInit) return
    ;(window as any).__edvexMetaPixelInit = true

    const f = window as any
    if (f.fbq) return

    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    })
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []

    const t = document.createElement('script')
    t.async = true
    t.src = 'https://connect.facebook.net/en_US/fbevents.js'
    const s = document.getElementsByTagName('script')[0]
    s.parentNode?.insertBefore(t, s)

    f.fbq('init', PIXEL_ID)
    f.fbq('track', 'PageView')
  }, [])

  return (
    <noscript>
      {/* Pixel 1×1 de Meta: debe ser <img>, no next/image (rastreo sin JS) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}
