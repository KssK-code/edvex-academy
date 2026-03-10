'use client'

import { useId } from 'react'

interface EdvexLogoProps {
  size?: number
  /** Color del fill central (adaptar al fondo del componente padre) */
  innerFill?: string
}

export function EdvexLogo({ size = 36, innerFill = '#050c18' }: EdvexLogoProps) {
  const uid = useId()
  const gid = `edvex-g-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="EDVEX Academy"
    >
      <polygon
        points="30,3 55,17 55,43 30,57 5,43 5,17"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="2.5"
      />
      <circle cx="30" cy="30" r="7" fill={`url(#${gid})`} />
      <circle cx="30" cy="30" r="3.5" fill={innerFill} />
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1ad9ff" />
          <stop offset="100%" stopColor="#0044ee" />
        </linearGradient>
      </defs>
    </svg>
  )
}
