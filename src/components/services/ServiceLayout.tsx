'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import AIChatBot from '@/components/landing/AIChatBot'
import ExpertTerminal from './ExpertTerminal'
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
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <AIChatBot />
      <ExpertTerminal logs={terminalLogs} />
      <LiveCaseStudyCard {...caseStudy} />
    </div>
  )
}
