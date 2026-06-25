import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import TrustBar from '@/components/landing/TrustBar'
import ServicesSection from '@/components/landing/ServicesSection'
import ScenarioCards from '@/components/landing/ScenarioCards'
import InteractiveAIDemo from '@/components/landing/InteractiveAIDemo'
import ComparisonSection from '@/components/landing/ComparisonSection'
import DataFlowSection from '@/components/landing/DataFlowSection'
import WhyUsSection from '@/components/landing/WhyUsSection'
import PricingSection from '@/components/landing/PricingSection'
import CaseStudiesSection from '@/components/landing/CaseStudiesSection'
import ProcessSection from '@/components/landing/ProcessSection'
import CTABanner from '@/components/landing/CTABanner'
import Footer from '@/components/landing/Footer'
import ChatWidget from '@/components/marketing/ChatWidget'
import ROICalculatorSection from '@/components/landing/ROICalculatorSection'
import SecuritySection from '@/components/landing/SecuritySection'
import SpecBuilderSimulation from '@/components/landing/SpecBuilderSimulation'
import LeadCaptureModal from '@/components/marketing/LeadCaptureModal'
import QuickQuoteForm from '@/components/marketing/QuickQuoteForm'
import FAQSection from '@/components/landing/FAQSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div id="hero"><HeroSection /></div>
      <div id="trust"><TrustBar /></div>
      <div id="services"><ServicesSection /></div>
      <div id="scenarios"><ScenarioCards /></div>
      <div id="demo"><InteractiveAIDemo /></div>
      <div id="comparison"><ComparisonSection /></div>
      <div id="flow"><DataFlowSection /></div>
      <div id="why-us"><WhyUsSection /></div>
      <div id="roi"><ROICalculatorSection /></div>
      <div id="pricing"><PricingSection /></div>
      <div id="case-studies"><CaseStudiesSection /></div>
      <div id="testimonials"><TestimonialsSection /></div>
      <div id="process"><ProcessSection /></div>
      <div id="simulation"><SpecBuilderSimulation /></div>
      <div id="cta"><CTABanner /></div>
      <div id="quote" className="py-24 bg-[#0A0A0F] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B5CF6]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <QuickQuoteForm />
        </div>
      </div>
      <div id="security"><SecuritySection /></div>
      <div id="faq"><FAQSection /></div>
      <Footer />
      <ChatWidget />
      <LeadCaptureModal />
    </main>
  )
}
