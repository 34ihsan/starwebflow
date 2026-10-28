import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import TrustBar from '@/components/landing/TrustBar'
import InstantAuditWidget from '@/components/landing/InstantAuditWidget'
import ServicesSection from '@/components/landing/ServicesSection'
import ComparisonSection from '@/components/landing/ComparisonSection'
import CaseStudiesSection from '@/components/landing/CaseStudiesSection'
import SpecBuilderSimulation from '@/components/landing/SpecBuilderSimulation'
import FAQSection from '@/components/landing/FAQSection'
import Footer from '@/components/landing/Footer'
import ChatWidget from '@/components/marketing/ChatWidget'
import LeadCaptureModal from '@/components/marketing/LeadCaptureModal'
import GEOContent from '@/components/ui/GEOContent'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 w-full max-w-full overflow-x-hidden">
      <Navbar />

      {/* 1. Elite Hero: B2B Positioning + Fast Audit Bar + Autonomous Command Center */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* 2. Enterprise Trust & Compliance Bar (DIN ISO 25010, DSGVO, Dedicated VPS) */}
      <div id="trust">
        <TrustBar />
      </div>

      {/* 3. Flagship Conversion Anchor: Live Site Diagnostic, Financial Loss Calculator & AI Clone */}
      <div id="audit">
        <InstantAuditWidget />
      </div>

      {/* 4. Strategic Architecture Pillars & Live Machine Simulators */}
      <div id="services">
        <ServicesSection />
      </div>

      {/* 5. Strategic Decision Matrix: Traditional Agency Model vs. Starwebflow Sovereign Platform */}
      <div id="comparison">
        <ComparisonSection />
      </div>

      {/* 6. Measurable Business Wins & Sector Case Studies */}
      <div id="case-studies">
        <CaseStudiesSection />
      </div>

      {/* 7. Lastenheft Spec Builder & Technical Proposal Blueprint */}
      <div id="simulation" className="py-16 bg-slate-50/70 border-t border-slate-200">
        <SpecBuilderSimulation />
      </div>

      {/* 8. Enterprise FAQ & SLA Guarantees */}
      <div id="faq">
        <FAQSection />
      </div>

      <Footer />
      <ChatWidget />
      <LeadCaptureModal />

      {/* GEO — AI Citation Content (invisible to users, readable by AI search engines) */}
      <GEOContent />
    </main>
  )
}
