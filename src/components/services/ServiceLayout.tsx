'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import ChatWidget from '@/components/marketing/ChatWidget'
import LiveCaseStudyCard from './LiveCaseStudyCard'

export interface TerminalLog {
  type: 'info' | 'success' | 'warn' | 'error'
  text: string
}

export interface CaseStudyData {
  company: string
  industry: string
  metric: string
  detail: string
  accentColor: string
}

interface ServiceLayoutProps {
  children: React.ReactNode
  terminalLogs: TerminalLog[]
  caseStudy: CaseStudyData
}

export default function ServiceLayout({
  children,
  terminalLogs,
  caseStudy,
}: ServiceLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="bg-white text-slate-900">{children}</main>
      <Footer />
      <ChatWidget />
      <LiveCaseStudyCard {...caseStudy} />
    </div>
  )
}
