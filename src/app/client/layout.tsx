import { ReactNode } from 'react'
import ClientLayout from './ClientLayout'

export const metadata = {
  title: 'StarWebFlow | Müşteri Paneli',
  description: 'Müşteri Paneli ve Proje Yönetimi',
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
