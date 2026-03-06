export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-6"
      style={{ background: 'linear-gradient(135deg, #0B0D11 0%, #111318 100%)' }}
    >
      {children}
    </div>
  )
}
