export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-dvh flex items-start justify-center py-8 px-3 sm:items-center sm:py-6"
      style={{ background: 'linear-gradient(135deg, #0B0D11 0%, #111318 100%)' }}
    >
      <div className="w-full flex justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  )
}
