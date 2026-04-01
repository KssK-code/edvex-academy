import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import PageTransition from '@/components/ui/PageTransition'

export default async function AlumnoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('nombre_completo, rol, avatar_url')
    .eq('id', user.id)
    .single()

  if (!usuario || usuario.rol !== 'ALUMNO') redirect('/login')

  return (
    <DashboardLayout
      role="ALUMNO"
      userName={usuario.nombre_completo}
      avatarUrl={(usuario as unknown as { avatar_url?: string | null }).avatar_url ?? null}
      pageTitle="header.studentPortal"
      showFooter={true}
    >
      <PageTransition>{children}</PageTransition>
    </DashboardLayout>
  )
}
