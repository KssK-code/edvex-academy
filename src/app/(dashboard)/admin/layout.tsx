import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('nombre_completo, rol')
    .eq('id', user.id)
    .single()

  if (!usuario || usuario.rol !== 'ADMIN') redirect('/login')

  return (
    <DashboardLayout
      role="ADMIN"
      userName={usuario.nombre_completo}
      pageTitle="header.adminPortal"
    >
      {children}
    </DashboardLayout>
  )
}
