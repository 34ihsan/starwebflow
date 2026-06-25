'use client'

import { useState, useEffect, useRef } from 'react'
import ServiceLayout from '@/components/services/ServiceLayout'
import ServiceHero from '@/components/services/ServiceHero'
import ValueMatrix from '@/components/services/ValueMatrix'
import ComparisonTable from '@/components/services/ComparisonTable'
import ServiceCTA from '@/components/services/ServiceCTA'
import ROITicker from '@/components/services/ROITicker'
import GlowCard from '@/components/ui/GlowCard'
import Button from '@/components/ui/Button'
import LeadFormModal from '@/components/services/LeadFormModal'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import {
  Bot, Zap, TrendingUp, Clock, MessageSquare,
  Send, Loader2, CheckCircle, Users, Star, ArrowRight
} from 'lucide-react'

const ACCENT = '#8B5CF6'

const terminalLogs = [
  { type: 'success' as const, text: 'AI Agent initialized — model: GPT-4o' },
  { type: 'info' as const,    text: 'Intent classified: appointment_booking (0.97)' },
  { type: 'success' as const, text: 'CRM lead saved → Pipedrive #4821' },
  { type: 'info' as const,    text: 'Response latency: 1.4s — within SLA' },
  { type: 'success' as const, text: 'Sentiment: positive — escalation not needed' },
  { type: 'info' as const,    text: 'Knowledge base query: 3 relevant docs found' },
  { type: 'success' as const, text: 'Handoff to human: NOT required' },
  { type: 'info' as const,    text: 'Session duration: 4m 12s — resolved ✓' },
  { type: 'warn' as const,    text: 'Spike detected: 47 concurrent sessions' },
  { type: 'success' as const, text: 'Auto-scaled to handle load — 0 timeouts' },
]

const localDict = {
  tr: {
    caseStudy: {
      company: 'DentalPro Kliniği',
      industry: 'Diş Kliniği',
      metric: '312 otomatik randevu/ay',
      detail: 'Gece 11\'de gelen randevu taleplerini kaybediyorlardı. AI agent ile %0 kayıp, +€28K ek gelir.',
    },
    hero: {
      badge: 'AI Agents — Dijital Çalışanlar',
      headline: '7/24 Çalışan,',
      headlineGradient: 'Hiç Yorulmayan Ekip',
      subheadline: 'Müşteri soruları, randevular, lead toplama — hepsini CRM\'e bağlı AI ajanlarınız halleder. Siz uyurken bile.',
      painStatement: 'Gece 2\'de gelen bir müşteri mesajına sabah cevap veriyorsanız, o müşteriyi rakibinize hediye ediyorsunuz. Her cevapsız mesaj, kaybedilen bir satıştır.',
      stat1: 'Yanıt Süresi',
      stat2: 'Maliyet Azalma',
      stat3: 'Kaçan Lead'
    },
    tickers: {
      t1: 'Destek Maliyeti Azalması',
      t2: 'Ortalama Yanıt Süresi',
      t3: 'Ort. Ek Aylık Gelir',
      t4: 'Otomatik Randevu/Ay',
      t4Sub: 'Klinik müşterimizde'
    },
    sim: {
      badge: '🤖 Canlı Simülasyon',
      title: 'AI Agent\'ınızı',
      titleHighlight: 'Şimdi Test Edin',
      desc: 'Sektörünüzü seçin, gerçek bir zor soru yazın. Saniyeler içinde profesyonel, marka dilinize sadık yanıt izleyin.',
      placeholder: 'Zor bir soru sorun...',
      buttonPlaceholder: 'Zor bir soru sorun...',
      disclaimer: 'Bu bir simülasyon. Gerçek sistemde marka sesiniz ve veritabanınızla çalışır.',
      featuresTitle: 'Her AI Agent Kapasiteleri',
      f1Title: 'Öğrenen Hafıza',
      f1Desc: 'Şirket bilginizi, ürünlerinizi, SSS\'larınızı ezberler. Yanlış bilgi vermez.',
      f2Title: 'CRM Entegrasyonu',
      f2Desc: 'Pipedrive, HubSpot, Salesforce. Her lead otomatik sisteme düşer.',
      f3Title: 'Çok Dil Desteği',
      f3Desc: 'Türkçe, İngilizce, Almanca, Arapça — müşteri dilinde konuşur.',
      f4Title: 'Analitik & Raporlama',
      f4Desc: 'Hangi sorular soruldu, kaç lead yakalandı — aylık rapor.',
      f5Title: 'KVKK Uyumlu',
      f5Desc: 'Veri işleme süreçleri Türkiye KVKK ve AB GDPR\'a uygun.',
      f6Title: 'Marka Sesi',
      f6Desc: 'Markanızın ton ve üslubunu öğrenir. Robot gibi değil, siz gibi konuşur.',
      valLeadTitle: 'AI Agent Prototipiniz Hazır!',
      valLeadSubtitle: 'Markanıza özel asistanın konuşmasını sürdürmek, canlı entegrasyon şablonlarını ve özel prompt yol haritasını indirmek için bilgilerinizi doğrulayın.',
      valLeadSource: 'AI Agent Analizi'
    },
    useCases: {
      badge: 'Kullanım Senaryoları',
      title: 'Her Sektörde',
      titleHighlight: 'Kanıtlanmış Sonuçlar',
      uc1Title: '🏥 Klinik & Sağlık',
      uc1Res: ['312 otomatik randevu/ay', 'Gece 23:00 bile lead yakalanıyor', '%0 kaçan hasta sorusu'],
      uc2Title: '🛍 E-Commerce',
      uc2Res: ['7/24 sipariş & iade desteği', 'Sepet terk oranı -%28', 'Müşteri memnuniyeti 4.9/5'],
      uc3Title: '📚 Eğitim',
      uc3Res: ['Kurs soruları anlık yanıt', 'Kayıt oranı +%165', 'Burs başvuru otomasyonu']
    },
    matrix: {
      title: 'Gerçek İş Etkisi',
      m1: 'Destek Maliyeti',
      m2: 'Yanıt Süresi',
      m3: 'Kaçırılan Lead',
      m4: 'Müşteri Memnuniyeti',
      m5: 'Aylık Lead Sayısı'
    },
    comp: {
      title: 'İnsan Destek vs AI Agent',
      f1: 'Çalışma Saatleri',
      f2: 'Yanıt Süresi',
      f3: 'Eş Zamanlı Kapasite',
      f4: 'Aylık Maliyet',
      f4Val: '€2.500+',
      f4ValStar: '€299\'dan başlar',
      f5: 'CRM Otomasyonu',
      f6: 'Raporlama',
      f6Val: 'Manuel',
      f6ValStar: 'Otomatik',
      f7: 'Ölçeklenebilirlik',
      f7Val: 'İşe alım gerekir',
      f7ValStar: 'Anlık ölçeklenir'
    },
    cta: {
      headline: 'Dijital Çalışanınızı İşe Alın',
      subheadline: 'Markanızın sesini öğrenen, CRM\'inize bağlı, hiç izin almayan AI agent — 2 haftada canlı.',
      urgency: 'Bu ay 3 AI Agent kurulum kapasitesi kaldı',
      primary: 'Ücretsiz Agent Demo',
      secondary: 'Kapsamı Belirle (Lastenheft)'
    },
    sectors: [
      { id: 'klinik', label: '🏥 Diş Kliniği', persona: 'Dr. Selin' },
      { id: 'ecommerce', label: '🛍 E-Commerce', persona: 'Meydan Shop' },
      { id: 'egitim', label: '📚 Eğitim Kurumu', persona: 'EduPro Akademi' },
      { id: 'hukuk', label: '⚖️ Hukuk Bürosu', persona: 'Av. Kara & Ortak' },
      { id: 'restoran', label: '🍽 Restoran/Cafe', persona: 'Bosphorus Kitchen' },
      { id: 'fitness', label: '💪 Spor Merkezi', persona: 'FitZone Gym' },
    ],
    agentResponses: {
      klinik: {
        'default': 'Merhaba! Ben Dr. Selin\'in kliniğinin dijital asistanıyım. 7/24 hizmetinizdeyim. Randevu almak, fiyat bilgisi, tedavi hakkında bilgi almak için buradayım. Size nasıl yardımcı olabilirim?',
        'fiyat': 'İmplant için fiyatlarınız nedir sorunuz için teşekkürler. Türkiye\'de implant fiyatları genellikle 15.000 - 25.000 (TL/$/€/£) arasında değişmektedir. Ancak ağız yapınıza göre net fiyat vermek için ücretsiz muayene yapılması gerekir. Size en yakın uygun randevuyu hemen ayarlayabilir miyim? 👩‍⚕️',
        'randevu': 'Harika! Sizi mümkün olan en kısa sürede görüşmek için şu anda hangi günler müsaitsiniz? Bu hafta Salı 14:00 ve Perşembe 10:30 slotlarımız boş. Hangisi daha uygun? 📅',
        'acı': 'Diş ağrısını anlıyorum — gerçekten zor bir durum. Hemen yardımcı olalım! Bugün acil randevumuz var. Sizi en geç 2 saat içinde doktorumuz görebilir. Adınızı ve telefon numaranızı alabilir miyim? 🚨',
      },
      ecommerce: {
        'default': 'Merhaba! Meydan Shop\'a hoşgeldiniz! Siparişiniz, ürünlerimiz, iade/değişim ya da herhangi bir konuda yardımcı olmaktan memnuniyet duyarım. 🛍',
        'iade': 'Ürününüzü iade etmek istediğiniz için üzgünüm. Ancak süreci çok kolay yaptık! Sipariş numaranızı paylaşırsanız, anında iade kodunuzu oluşturup e-postanıza göndereceğim. Kargo ücretsiz! 📦',
        'kargo': 'Siparişiniz şu an yoldadır! Ortalama teslimat süremiz 2-3 iş günüdür. Sipariş numaranızı paylaşırsanız anlık kargo takibi bilgisini hemen paylaşayım. 🚚',
        'default2': 'Bu konuda size en iyi çözümü sunmak istiyorum. Biraz daha detay verebilir misiniz? Size en hızlı şekilde yardımcı olacağım! ✨',
      },
      egitim: {
        'default': 'EduPro Akademi\'ye hoşgeldiniz! Kurs programlarımız, burslar, kayıt ve sertifika süreçleri konusunda size yardımcı olmak için buradayım. 📚',
        'fiyat': 'Mükemmel bir soru! Kurslarımız 2.500 - 8.000 (TL/$/€/£) arasında değişiyor. Şu anda %30 erken kayıt indirimi aktif. Ayrıca 12 aya kadar taksit imkânı var. Hangi alana ilgi duyuyorsunuz, size özel kurs önereceğim! 🎓',
        'sertifika': 'Sertifikalarımız uluslararası geçerliliktedir. Udemy ve LinkedIn\'de gösterilebilir formatda hazırlanıyor. Ayrıca başarılı mezunlarımızın %78\'i program sonrası iş değişikliği ya da terfi sağladı. Kayıt için ne gerekiyor isterseniz anlatabilirim! 🏆',
      },
      hukuk: {
        'default': 'Av. Kara & Ortakları Hukuk Bürosuna hoşgeldiniz. Hukuki konularınız için gizlilik içinde yardımcı olabilirim. Hangi hukuk alanında destek arıyorsunuz? ⚖️',
        'default2': 'Bu konu için bir avukatımızla ücretsiz 15 dakikalık ön görüşme ayarlayabilirim. Durumunuzla en ilgili uzman avukatımız size kısa sürede geri dönüş yapacak. Tercih ettiğiniz iletişim yöntemi nedir? 📞',
      },
      restoran: {
        'default': 'Bosphorus Kitchen\'a hoşgeldiniz! Rezervasyon, menü, özel etkinlik ya da paket sipariş için buradayım. Bugün size nasıl yardımcı olabilirim? 🍽',
        'rezervasyon': 'Harika tercih! Kaç kişilik masa istiyorsunuz ve hangi tarihi düşünüyorsunuz? Hafta sonu için önceden rezervasyon yapmanızı öneririm — boğaz manzaralı masalarımız hızlı doluyor! 🌉',
        'menu': 'Menümüzde Osmanlı mutfağından ilham alan modern füzyon lezzetler var. Vejetaryen ve vegan seçeneklerimiz de mevcut. Özel bir beslenme ihtiyacınız var mı? Şefimizle özel menü hazırlayabiliriz! 👨‍🍳',
      },
      fitness: {
        'default': 'FitZone Gym\'e hoşgeldiniz! Üyelik, ders programları, kişisel antrenör veya tesisimiz hakkında merak ettiğiniz her şeyi sorabilirsiniz. 💪',
        'fiyat': 'Üyelik paketlerimiz aylık 699 (TL/$/€/£)\'dan başlıyor. Yıllık üyelikte %40 indirim var — günlük sadece 38 birim! Ayrıca şu an "Arkadaşını getir" kampanyamızda 2 aylık üyelik hediye ediyoruz. Deneme dersi için yarın sizi bekleyebilir miyiz? 🏋️',
        'pt': 'Kişisel antrenörlerimiz uluslararası sertifikalı. 4 seans deneme paketiyle başlayıp 12 haftada hedeflerinize ulaşabilirsiniz. Hedefleriniz neler — kilo vermek mi, kas yapmak mı, form tutmak mı? 🎯',
      },
    }
  },
  en: {
    caseStudy: {
      company: 'DentalPro Clinic',
      industry: 'Dental Clinic',
      metric: '312 auto-appointments/mo',
      detail: 'They were losing appointments coming in at 11 PM. With AI agent, 0% loss and +€28K extra monthly revenue.',
    },
    hero: {
      badge: 'AI Agents — Digital Staff',
      headline: 'Working 24/7,',
      headlineGradient: 'A Team That Never Tires',
      subheadline: 'Customer questions, booking slots, lead capture — your CRM-connected AI agents handle it all. Even while you sleep.',
      painStatement: 'If you respond in the morning to a client message that came in at 2 AM, you are donating that lead to your competitor. Unanswered messages equal lost revenue.',
      stat1: 'Response Time',
      stat2: 'Cost Reduction',
      stat3: 'Missed Leads'
    },
    tickers: {
      t1: 'Support Cost Reduction',
      t2: 'Average Response Time',
      t3: 'Avg. Add. Monthly Revenue',
      t4: 'Auto Appointments/Mo',
      t4Sub: 'At our dental client'
    },
    sim: {
      badge: '🤖 Live Simulation',
      title: 'Test Your',
      titleHighlight: 'AI Agent Instantly',
      desc: 'Select your sector, write a challenging question, and watch a professional, brand-voice-compliant response in real-time.',
      placeholder: 'Ask a challenging question...',
      buttonPlaceholder: 'Ask a challenging question...',
      disclaimer: 'This is a simulation. The real system runs integrated with your private database and brand voice.',
      featuresTitle: 'Features of Every AI Agent',
      f1Title: 'Autonomous Learning Memory',
      f1Desc: 'Memorizes your company manuals, products, and FAQs. Guarantees zero hallucinations.',
      f2Title: 'CRM Integration',
      f2Desc: 'Pipedrive, HubSpot, Salesforce. Every lead automatically populates your pipelines.',
      f3Title: 'Multi-Lingual Capabilities',
      f3Desc: 'Turkish, English, German, Arabic — speaks fluently in your client\'s language.',
      f4Title: 'Analytics & Reporting',
      f4Desc: 'Monthly dashboard showing common questions, intent classifications, and leads captured.',
      f5Title: 'GDPR / DSGVO Compliant',
      f5Desc: 'All data processing operations are secure and compliant with EU GDPR regulations.',
      f6Title: 'Custom Brand Voice',
      f6Desc: 'Learns your brand tone and style. Talks like a human staff member, not a robot.',
      valLeadTitle: 'Your AI Agent Prototype is Ready!',
      valLeadSubtitle: 'Verify your info to keep chatting, receive live integration templates, and download your custom prompt roadmap.',
      valLeadSource: 'AI Agent Analysis'
    },
    useCases: {
      badge: 'Use Cases',
      title: 'Proven Results',
      titleHighlight: 'Across Industries',
      uc1Title: '🏥 Medical & Clinics',
      uc1Res: ['312 automatic bookings/mo', 'Leads captured even at 11 PM', '0% unanswered patient queries'],
      uc2Title: '🛍 E-Commerce',
      uc2Res: ['24/7 order & refund support', 'Shopping cart abandonment -28%', 'Customer satisfaction score 4.9/5'],
      uc3Title: '📚 Education',
      uc3Res: ['Instant course info response', 'Enrollment rates +165%', 'Scholarship application automation']
    },
    matrix: {
      title: 'Real Business Impact',
      m1: 'Support Cost',
      m2: 'Response Time',
      m3: 'Missed Leads',
      m4: 'Client Satisfaction',
      m5: 'Monthly Leads Captured'
    },
    comp: {
      title: 'Human Support vs AI Agent',
      f1: 'Business Hours',
      f2: 'Response Time',
      f3: 'Concurrent Sessions',
      f4: 'Monthly Cost',
      f4Val: '€2,500+',
      f4ValStar: 'Starts at €299',
      f5: 'CRM Automation',
      f6: 'Reporting',
      f6Val: 'Manual',
      f6ValStar: 'Automatic',
      f7: 'Scalability',
      f7Val: 'Requires hiring',
      f7ValStar: 'Instant scale'
    },
    cta: {
      headline: 'Hire Your First Digital Worker',
      subheadline: 'An AI agent that learns your brand voice, integrates with your CRM, and never takes time off — live in 2 weeks.',
      urgency: 'Only 3 AI Agent setup slots remaining this month',
      primary: 'Get Free Agent Demo',
      secondary: 'Scope Project (Lastenheft)'
    },
    sectors: [
      { id: 'klinik', label: '🏥 Dental Clinic', persona: 'Dr. Sarah' },
      { id: 'ecommerce', label: '🛍 E-Commerce', persona: 'Meydan Shop' },
      { id: 'egitim', label: '📚 Education Academy', persona: 'EduPro Academy' },
      { id: 'hukuk', label: '⚖️ Law Firm', persona: 'Miller & Associates' },
      { id: 'restoran', label: '🍽 Restaurant/Cafe', persona: 'Bosphorus Kitchen' },
      { id: 'fitness', label: '💪 Fitness Gym', persona: 'FitZone Gym' },
    ],
    agentResponses: {
      klinik: {
        'default': 'Hello! I am Dr. Sarah\'s clinic assistant. I am available 24/7. I can help you book appointments, share pricing info, or answer treatment details. How can I help you?',
        'fiyat': 'Thank you for asking about implant pricing. Typically, implant procedures range between €800 and €1,500. However, a free physical checkup is required for an exact quote. Can I schedule a free consult for you? 👩‍⚕️',
        'randevu': 'Great! What days work best for you? We have open slots this Tuesday at 2:00 PM and Thursday at 10:30 AM. Do either of those work? 📅',
        'acı': 'I understand dental pain is very tough. Let us help! We have an emergency slot open today. A doctor can see you within 2 hours. May I have your name and phone number? 🚨',
      },
      ecommerce: {
        'default': 'Hi! Welcome to Meydan Shop! I can assist you with your orders, product inquiries, returns/exchanges, or anything else. 🛍',
        'iade': 'I am sorry you want to return your product. We made the process simple! Share your order number and I will generate your free return shipping label instantly. 📦',
        'kargo': 'Your order is currently in transit! Average delivery is 2-3 business days. If you share your order number, I can retrieve the live tracking link. 🚚',
        'default2': 'I want to provide the best solution for you. Could you share a bit more detail? I will assist you immediately! ✨',
      },
      egitim: {
        'default': 'Welcome to EduPro Academy! I am here to help you with our course catalog, enrollments, scholarships, and certification tracks. 📚',
        'fiyat': 'Great question! Our programs range from €300 to €900. Currently, a 30% early bird discount is active. We also offer 12-month installment plans. What subject interest you? 🎓',
        'sertifika': 'Our certificates are internationally recognized. They are formatted to showcase on Udemy and LinkedIn. Additionally, 78% of our graduates secured new roles or promotions. 🏆',
      },
      hukuk: {
        'default': 'Welcome to Miller & Associates. I can assist you confidentially. What legal practice area are you seeking support with? ⚖️',
        'default2': 'I can schedule a free 15-minute consultation with one of our specialized lawyers. They will get back to you shortly. What is your preferred contact method? 📞',
      },
      restoran: {
        'default': 'Welcome to Bosphorus Kitchen! I can help you with table bookings, our menu, catering, or takeaway orders. How can I help you today? 🍽',
        'rezervasyon': 'Excellent! How many people is the booking for, and on what date? We highly recommend reserving weekend tables early for the best view! 🌉',
        'menu': 'Our menu features modern fusion flavors inspired by Mediterranean cuisine. We also have vegetarian and vegan options. Do you have any dietary requirements? 👨‍🍳',
      },
      fitness: {
        'default': 'Welcome to FitZone Gym! You can ask me about membership plans, class schedules, personal training, or our facilities. 💪',
        'fiyat': 'Our memberships start at €29/month. Annual signup gets a 40% discount — just €1/day! We also have a "Refer a Friend" campaign right now. Shall I book a trial session? 🏋️',
        'pt': 'Our personal trainers are certified. You can start with a 4-session trial and hit your goals in 12 weeks. What is your goal — fat loss, muscle gain, or conditioning? 🎯',
      },
    }
  },
  de: {
    caseStudy: {
      company: 'DentalPro Klinik',
      industry: 'Zahnklinik',
      metric: '312 automatische Termine/Monat',
      detail: 'Sie verloren Termine, die um 23:00 Uhr eingingen. Mit dem KI-Agenten: 0 % Verlust, +28.000 € zusätzlicher monatlicher Umsatz.',
    },
    hero: {
      badge: 'KI-Agenten — Digitale Mitarbeiter',
      headline: 'Arbeiten rund um die Uhr,',
      headlineGradient: 'Ein Team, das niemals müde wird',
      subheadline: 'Kundenanfragen, Terminbuchungen, Lead-Erfassung — Ihre CRM-integrierten KI-Agenten erledigen alles. Selbst während Sie schlafen.',
      painStatement: 'Wenn Sie morgens auf eine Kundennachricht antworten, die um 2 Uhr morgens eingegangen ist, schenken Sie diesen Kunden Ihrem Konkurrenten. Jede unbeantwortete Nachricht ist ein verlorener Verkauf.',
      stat1: 'Antwortzeit',
      stat2: 'Kostensenkung',
      stat3: 'Verlorene Leads'
    },
    tickers: {
      t1: 'Senkung der Supportkosten',
      t2: 'Durchschnittliche Antwortzeit',
      t3: 'Durchschn. zus. monatl. Umsatz',
      t4: 'Auto-Termine/Monat',
      t4Sub: 'Bei unserem Klinik-Kunden'
    },
    sim: {
      badge: '🤖 Live-Simulation',
      title: 'Testen Sie Ihren',
      titleHighlight: 'KI-Agenten jetzt',
      desc: 'Wählen Sie Ihre Branche, stellen Sie eine schwierige Frage. Erhalten Sie in Sekundenschnelle eine professionelle, markenkonforme Antwort.',
      placeholder: 'Stellen Sie eine schwierige Frage...',
      buttonPlaceholder: 'Frage stellen...',
      disclaimer: 'Dies ist eine Simulation. Das reale System läuft voll integriert mit Ihrer Datenbank und Markenstimme.',
      featuresTitle: 'Fähigkeiten jedes KI-Agenten',
      f1Title: 'Lernendes Gedächtnis',
      f1Desc: 'Merkt sich Ihre Firmenhandbücher, Produkte und FAQs. Garantiert keine Halluzinationen.',
      f2Title: 'CRM-Integration',
      f2Desc: 'Pipedrive, HubSpot, Salesforce. Jeder Lead wird automatisch in Ihr CRM eingepflegt.',
      f3Title: 'Mehrsprachigkeit',
      f3Desc: 'Türkisch, Englisch, Deutsch, Arabisch — spricht fließend in der Sprache des Kunden.',
      f4Title: 'Analysen & Berichte',
      f4Desc: 'Monatliche Übersicht über häufige Fragen, Absichtsklassifizierungen und erfasste Leads.',
      f5Title: 'DSGVO-konform',
      f5Desc: 'Alle Datenverarbeitungsprozesse sind sicher und entsprechen den EU-DSGVO-Richtlinien.',
      f6Title: 'Eigene Markenstimme',
      f6Desc: 'Lernt den Tonfall Ihrer Marke. Spricht wie ein menschlicher Mitarbeiter, nicht wie ein Roboter.',
      valLeadTitle: 'Ihr KI-Agent Prototyp ist bereit!',
      valLeadSubtitle: 'Bestätigen Sie Ihre Angaben, um den Chat fortzusetzen, Live-Integrationsvorlagen zu erhalten und Ihre Lastenheft-Roadmap herunterzuladen.',
      valLeadSource: 'KI-Agenten Analyse'
    },
    useCases: {
      badge: 'Anwendungsfälle',
      title: 'Bewährte Ergebnisse',
      titleHighlight: 'In jeder Branche',
      uc1Title: '🏥 Kliniken & Gesundheit',
      uc1Res: ['312 automatische Termine/Monat', 'Leads erfasst selbst um 23:00 Uhr morgens', '0 % unbeantwortete Patientenanfragen'],
      uc2Title: '🛍 E-Commerce',
      uc2Res: ['24/7 Bestell- & Retourensupport', 'Warenkorb-Abbruchquote -28 %', 'Kundenzufriedenheit von 4,9/5'],
      uc3Title: '📚 Bildungsakademie',
      uc3Res: ['Sofortige Antworten auf Kursfragen', 'Anmeldequote +165 %', 'Automatisierung von Stipendienanträgen']
    },
    matrix: {
      title: 'Reale geschäftliche Auswirkungen',
      m1: 'Supportkosten',
      m2: 'Antwortzeit',
      m3: 'Verlorene Leads',
      m4: 'Kundenzufriedenheit',
      m5: 'Monatlich erfasste Leads'
    },
    comp: {
      title: 'Menschlicher Support vs. KI-Agent',
      f1: 'Öffnungszeiten',
      f2: 'Antwortzeit',
      f3: 'Gleichzeitige Chats',
      f4: 'Monatliche Kosten',
      f4Val: '€2.500+',
      f4ValStar: 'Ab €299',
      f5: 'CRM-Automatisierung',
      f6: 'Berichterstattung',
      f6Val: 'Manuell',
      f6ValStar: 'Automatisch',
      f7: 'Skalierbarkeit',
      f7Val: 'Erfordert Personal',
      f7ValStar: 'Sofortige Skalierung'
    },
    cta: {
      headline: 'Stellen Sie Ihren ersten digitalen Mitarbeiter ein',
      subheadline: 'Ein KI-Agent, der Ihre Markenstimme lernt, in Ihr CRM integriert ist und niemals Urlaub macht — in 2 Wochen live.',
      urgency: 'Nur noch 3 KI-Agenten Setup-Slots in diesem Monat frei',
      primary: 'Kostenlose Agenten-Demo',
      secondary: 'Umfang festlegen (Lastenheft)'
    },
    sectors: [
      { id: 'klinik', label: '🏥 Zahnklinik', persona: 'Dr. Selin' },
      { id: 'ecommerce', label: '🛍 E-Commerce', persona: 'Meydan Shop' },
      { id: 'egitim', label: '📚 Bildungsakademie', persona: 'EduPro Akademi' },
      { id: 'hukuk', label: '⚖️ Anwaltskanzlei', persona: 'Müller & Partner' },
      { id: 'restoran', label: '🍽 Restaurant/Café', persona: 'Bosphorus Kitchen' },
      { id: 'fitness', label: '💪 Fitnessstudio', persona: 'FitZone Gym' },
    ],
    agentResponses: {
      klinik: {
        'default': 'Hallo! Ich bin der digitale Assistent der Zahnklinik von Dr. Selin. Ich bin rund um die Uhr für Sie da. Wie kann ich Ihnen helfen?',
        'fiyat': 'Vielen Dank für Ihre Anfrage zu den Preisen für Implantate. In der Regel liegen die Kosten zwischen 800 € und 1.500 €. Für ein genaues Angebot ist jedoch eine kostenlose Untersuchung erforderlich. Möchten Sie einen Termin vereinbaren? 👩‍⚕️',
        'randevu': 'Ausgezeichnet! Welche Tage passen Ihnen am besten? Wir haben Slots am Dienstag um 14:00 Uhr und Donnerstag um 10:30 Uhr frei. 📅',
        'acı': 'Ich verstehe, dass Zahnschmerzen sehr schlimm sind. Wir helfen Ihnen sofort! Wir haben heute einen Notfall-Slot frei. Ein Arzt kann Sie innerhalb von 2 Stunden sehen. Darf ich Ihren Namen und Ihre Telefonnummer haben? 🚨',
      },
      ecommerce: {
        'default': 'Hallo! Willkommen bei Meydan Shop! Ich helfe Ihnen gerne bei Bestellungen, Produktfragen, Retouren oder anderen Anliegen. 🛍',
        'iade': 'Es tut mir leid, dass Sie ein Produkt zurücksenden möchten. Wir haben den Prozess einfach gestaltet! Geben Sie Ihre Bestellnummer an und ich erstelle sofort Ihr kostenloses Rücksendeetikett. 📦',
        'kargo': 'Ihre Bestellung ist unterwegs! Die durchschnittliche Lieferzeit beträgt 2-3 Werktage. Bitte nennen Sie Ihre Bestellnummer, um den Sendungsstatus abzurufen. 🚚',
        'default2': 'Ich möchte Ihnen die beste Lösung bieten. Können Sie mir bitte mehr Details mitteilen? Ich helfe Ihnen sofort weiter! ✨',
      },
      egitim: {
        'default': 'Willkommen bei der EduPro Akademie! Ich bin hier, um Ihnen bei Kursen, Anmeldungen, Stipendien und Zertifikaten zu helfen. 📚',
        'fiyat': 'Gute Frage! Unsere Kurse liegen zwischen 300 € und 900 €. Derzeit gibt es einen Frühbucherrabatt von 30 %. Ratenzahlung ist ebenfalls möglich. Welches Fachgebiet interessiert Sie? 🎓',
        'sertifika': 'Unsere Zertifikate sind international anerkannt und können auf LinkedIn geteilt werden. 78 % unserer Absolventen befördert oder erhielten neue Stellen. 🏆',
      },
      hukuk: {
        'default': 'Willkommen bei Müller & Partner. Ich kann Ihnen vertraulich helfen. In welchem Rechtsgebiet suchen Sie Unterstützung? ⚖️',
        'default2': 'Ich kann ein kostenloses 15-minütiges Erstgespräch mit einem unserer spezialisierten Anwälte vereinbaren. Sie werden sich in Kürze bei Ihnen melden. Was ist Ihre bevorzugte Kontaktmethode? 📞',
      },
      restoran: {
        'default': 'Willkommen im Bosphorus Kitchen! Ich kann Ihnen bei Tischreservierungen, unserer Speisekarte, Catering oder Bestellungen helfen. 🍽',
        'rezervasyon': 'Hervorragend! Für wie viele Personen und für welches Datum möchten Sie reservieren? Wir empfehlen, frühzeitig für das Wochenende zu reservieren! 🌉',
        'menu': 'Unsere Speisekarte bietet moderne Fusion-Gerichte, die von der mediterranen Küche inspiriert sind. Wir haben auch vegane Optionen. Haben Sie Diätwünsche? 👨‍🍳',
      },
      fitness: {
        'default': 'Willkommen im FitZone Gym! Sie können mich nach Mitgliedschaften, Kursplänen, Personal Training oder Einrichtungen fragen. 💪',
        'fiyat': 'Mitgliedschaften beginnen bei 29 €/Monat. Bei jährlicher Anmeldung gibt es 40 % Rabatt — nur 1 €/Tag! Sollen wir ein Probetraining vereinbaren? 🏋️',
        'pt': 'Unsere Personal Trainer sind lizenziert. Sie können mit einem Testpaket aus 4 Einheiten starten. Was ist Ihr Ziel — Fettabbau, Muskelaufbau oder Ausdauer? 🎯',
      },
    }
  }
}

function getAgentResponse(sector: string, question: string, responsesObj: any): string {
  const responses = responsesObj[sector] || responsesObj['klinik']
  const q = question.toLowerCase()

  if (q.includes('fiyat') || q.includes('ücret') || q.includes('kaç') || q.includes('para') || q.includes('preis') || q.includes('kosten') || q.includes('price') || q.includes('cost')) {
    return responses['fiyat'] || responses['default']
  }
  if (q.includes('randevu') || q.includes('rezervasyon') || q.includes('tarih') || q.includes('termin') || q.includes('date') || q.includes('appointment') || q.includes('book')) {
    return responses['randevu'] || responses['rezervasyon'] || responses['default']
  }
  if (q.includes('sertifika') || q.includes('diploma') || q.includes('certificate')) {
    return responses['sertifika'] || responses['default']
  }
  if (q.includes('iade') || q.includes('değişim') || q.includes('rücksende') || q.includes('retoure') || q.includes('return') || q.includes('refund')) {
    return responses['iade'] || responses['default']
  }
  if (q.includes('kargo') || q.includes('teslimat') || q.includes('gönder') || q.includes('versand') || q.includes('liefe') || q.includes('shipping') || q.includes('track')) {
    return responses['kargo'] || responses['default']
  }
  if (q.includes('ağrı') || q.includes('acil') || q.includes('acı') || q.includes('schmerz') || q.includes('notfall') || q.includes('pain') || q.includes('emergency')) {
    return responses['acı'] || responses['default']
  }
  if (q.includes('menü') || q.includes('yemek') || q.includes('speise') || q.includes('menu') || q.includes('food')) {
    return responses['menu'] || responses['default']
  }
  if (q.includes('pt') || q.includes('antrenör') || q.includes('koç') || q.includes('trainer') || q.includes('coach')) {
    return responses['pt'] || responses['default']
  }
  return responses['default2'] || responses['default']
}

interface Message {
  role: 'user' | 'agent'
  text: string
  ts: string
}

function AgentTestLab() {
  const { language } = useLanguage()
  const c = localDict[language] || localDict.tr
  const responsesObj = c.agentResponses as any

  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingUserMsg, setPendingUserMsg] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  const now = () => {
    const d = new Date()
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
  }

  const selectSector = (sectorId: string) => {
    setSelectedSector(sectorId)
    const greeting = responsesObj[sectorId]?.['default'] || ''
    setMessages([{ role: 'agent', text: greeting, ts: now() }])
    setQuestion('')
  }

  const sendMessage = async () => {
    if (!question.trim() || !selectedSector || typing) return
    const userMsg = question.trim()
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg, ts: now() }])

    // Trigger lead modal on 2nd user message
    if (messages.filter(m => m.role === 'user').length >= 1) {
      setPendingUserMsg(userMsg)
      setShowLeadModal(true)
      return
    }

    setTyping(true)
    setTypedText('')

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))

    const response = getAgentResponse(selectedSector, userMsg, responsesObj)
    let i = 0
    const interval = setInterval(() => {
      i += 3
      setTypedText(response.slice(0, i))
      if (i >= response.length) {
        clearInterval(interval)
        setMessages(prev => [...prev, { role: 'agent', text: response, ts: now() }])
        setTyping(false)
        setTypedText('')
      }
    }, 20)
  }

  const handleLeadSubmit = async (leadData: { name: string; email: string }) => {
    setShowLeadModal(false)
    setTyping(true)
    setTypedText('')

    await new Promise(r => setTimeout(r, 800))

    const response = getAgentResponse(selectedSector!, pendingUserMsg, responsesObj)
    let i = 0
    const interval = setInterval(() => {
      i += 3
      setTypedText(response.slice(0, i))
      if (i >= response.length) {
        clearInterval(interval)
        setMessages(prev => [...prev, { role: 'agent', text: response, ts: now() }])
        setTyping(false)
        setTypedText('')
        setPendingUserMsg('')
      }
    }, 20)
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, typedText, typing])

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#12121F]/80 backdrop-blur-sm overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Agent Test Lab</div>
            <div className="text-xs text-[#64748B]">{selectedSector ? `Status: Active (${c.sectors.find(s=>s.id===selectedSector)?.persona})` : 'Status: Awaiting Sector'}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {!selectedSector ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">🧬</div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">{language === 'tr' ? 'Bir Simülasyon Sektörü Seçin' : language === 'de' ? 'Wählen Sie eine Branche' : 'Select a Sector'}</h4>
              <p className="text-xs text-[#64748B] max-w-xs leading-relaxed">
                {language === 'tr' ? 'Ajanın o sektöre ait bilgi kartını yüklemek ve konuşmaya başlamak için tıklayın.' : language === 'de' ? 'Klicken Sie hier, um den KI-Agenten für diese Branche zu laden.' : 'Click to load the AI Agent persona for that sector.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm pt-2">
              {c.sectors.map(s => (
                <button
                  key={s.id}
                  onClick={() => selectSector(s.id)}
                  className="px-3 py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 text-xs text-left text-white transition-all flex flex-col gap-0.5"
                >
                  <span className="font-semibold">{s.label}</span>
                  <span className="text-[10px] text-[#64748B]">Persona: {s.persona}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#8B5CF6] text-white rounded-br-sm'
                        : 'bg-white/[0.04] border border-white/[0.06] text-[#E2E8F0] rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] text-[#64748B] block text-right mt-1 font-medium">{msg.ts}</span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-3 py-2.5 rounded-xl rounded-bl-sm bg-white/[0.06] border border-white/[0.06] text-sm text-[#E2E8F0] leading-relaxed">
                    {typedText || (
                      <div className="flex gap-1 py-1">
                        {[0,1,2].map(i => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"
                            style={{ animation: `float 1s ease-in-out infinite ${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={c.sim.placeholder}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-[#475569] outline-none focus:border-[#8B5CF6]/40 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!question.trim() || typing}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: '#8B5CF6' }}
              >
                {typing ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            <p className="text-[10px] text-[#334155] mt-2 text-center">
              {c.sim.disclaimer}
            </p>
          </div>
        )}
      </div>

      <LeadFormModal
        isOpen={showLeadModal}
        title={c.sim.valLeadTitle}
        subtitle={c.sim.valLeadSubtitle}
        source={c.sim.valLeadSource}
        value={30000}
        onSubmitSuccess={handleLeadSubmit}
      />
    </div>
  )
}

const useCasesDict = {
  tr: [
    {
      icon: '🏥', title: 'Klinik & Sağlık',
      results: ['312 otomatik randevu/ay', 'Gece 23:00 bile lead yakalanıyor', '%0 kaçan hasta sorusu'],
      color: '#8B5CF6',
    },
    {
      icon: '🛍', title: 'E-Commerce',
      results: ['7/24 sipariş & iade desteği', 'Sepet terk oranı -%28', 'Müşteri memnuniyeti 4.9/5'],
      color: '#06B6D4',
    },
    {
      icon: '📚', title: 'Eğitim',
      results: ['Kurs soruları anlık yanıt', 'Kayıt oranı +%165', 'Burs başvuru otomasyonu'],
      color: '#10B981',
    },
  ],
  en: [
    {
      icon: '🏥', title: 'Clinical & Health',
      results: ['312 auto-appointments/mo', 'Capture leads even at 11 PM', '0% missed patient queries'],
      color: '#8B5CF6',
    },
    {
      icon: '🛍', title: 'E-Commerce',
      results: ['24/7 order & refund support', 'Cart abandonment rate -28%', 'Customer satisfaction 4.9/5'],
      color: '#06B6D4',
    },
    {
      icon: '📚', title: 'Education',
      results: ['Instant course info response', 'Enrollment rates +165%', 'Scholarship application automation'],
      color: '#10B981',
    },
  ],
  de: [
    {
      icon: '🏥', title: 'Kliniken & Gesundheit',
      results: ['312 automatische Termine/Monat', 'Leads erfasst selbst um 23:00 Uhr', '0 % verlorene Patientennachrichten'],
      color: '#8B5CF6',
    },
    {
      icon: '🛍', title: 'E-Commerce',
      results: ['24/7 Bestell- & Retourensupport', 'Warenkorb-Abbruchquote -28 %', 'Kundenzufriedenheit von 4,9/5'],
      color: '#06B6D4',
    },
    {
      icon: '📚', title: 'Bildung',
      results: ['Sofortige Antworten auf Kursfragen', 'Anmeldequote +165 %', 'Automatisierung von Stipendienanträgen'],
      color: '#10B981',
    },
  ]
}

export default function AIAgentsPage() {
  const { language } = useLanguage()
  const c = localDict[language] || localDict.tr
  const useCases = useCasesDict[language] || useCasesDict.tr

  const caseStudy = {
    company: 'DentalPro',
    industry: c.caseStudy.industry,
    metric: c.caseStudy.metric,
    detail: c.caseStudy.detail,
    accentColor: ACCENT,
  }

  return (
    <ServiceLayout terminalLogs={terminalLogs} caseStudy={caseStudy}>

      {/* ─── HERO ─── */}
      <ServiceHero
        badge={c.hero.badge}
        headline={c.hero.headline}
        headlineGradient={c.hero.headlineGradient}
        subheadline={c.hero.subheadline}
        painStatement={c.hero.painStatement}
        accentColor={ACCENT}
        gradientFrom="#8B5CF6"
        gradientTo="#06B6D4"
        stats={[
          { value: '2s', label: c.hero.stat1, icon: Clock },
          { value: '%60', label: c.hero.stat2, icon: TrendingUp },
          { value: '0', label: c.hero.stat3, icon: CheckCircle },
        ]}
        floatingBadges={[
          { label: 'GPT-4o', icon: '🤖', style: { top: '5%', right: '0%', animation: 'float 7s ease-in-out infinite' } },
          { label: language === 'tr' ? 'CRM Entegre' : language === 'de' ? 'CRM-integriert' : 'CRM Integrated', icon: '🔗', style: { bottom: '8%', left: '2%', animation: 'float 5s ease-in-out infinite 1s' } },
          { label: language === 'tr' ? '7/24 Aktif' : language === 'de' ? '24/7 aktiv' : 'Active 24/7', icon: '⚡', style: { top: '40%', left: '-5%', animation: 'float 6s ease-in-out infinite 0.5s' } },
        ]}
        simulationId="simulation"
      />

      {/* ─── ROI TICKERS ─── */}
      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ROITicker value={60} suffix="%" label={c.tickers.t1} accentColor={ACCENT} />
            <ROITicker value={2} suffix="s" label={c.tickers.t2} accentColor={ACCENT} duration={1200} />
            <ROITicker value={28000} prefix="€" label={c.tickers.t3} accentColor={ACCENT} />
            <ROITicker value={312} label={c.tickers.t4} sublabel={c.tickers.t4Sub} accentColor={ACCENT} />
          </div>
        </div>
      </section>

      {/* ─── SIMULATION ─── */}
      <section id="simulation" className="section relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">{c.sim.badge}</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {c.sim.title} <span className="gradient-text">{c.sim.titleHighlight}</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              {c.sim.desc}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <AgentTestLab />

            {/* Right: Features */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
                {c.sim.featuresTitle}
              </div>
              {[
                { icon: '🧠', title: c.sim.f1Title, desc: c.sim.f1Desc },
                { icon: '🔗', title: c.sim.f2Title, desc: c.sim.f2Desc },
                { icon: '🌍', title: c.sim.f3Title, desc: c.sim.f3Desc },
                { icon: '📊', title: c.sim.f4Title, desc: c.sim.f4Desc },
                { icon: '🔒', title: c.sim.f5Title, desc: c.sim.f5Desc },
                { icon: '🎭', title: c.sim.f6Title, desc: c.sim.f6Desc },
              ].map((f, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-white/10 transition-all">
                  <div className="text-2xl flex-shrink-0">{f.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">{f.title}</div>
                    <div className="text-xs text-[#64748B] leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">{c.useCases.badge}</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {c.useCases.title} <span className="gradient-text">{c.useCases.titleHighlight}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <GlowCard key={i} glowColor="purple" className="p-6">
                <div className="text-3xl mb-4">{uc.icon}</div>
                <h3 className="text-base font-bold text-white mb-4">{uc.title}</h3>
                <ul className="space-y-2">
                  {uc.results.map((r, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: uc.color }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE MATRIX ─── */}
      <section className="section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              {c.matrix.title}
            </h2>
          </div>
          <ValueMatrix
            accentColor={ACCENT}
            rows={[
              { metric: c.matrix.m1, before: '€3.800/ay', after: '€620/ay', delta: '-%84', deltaPositive: true },
              { metric: c.matrix.m2, before: '4.2 saat', after: '1.4 saniye', delta: '-%99.9', deltaPositive: true },
              { metric: c.matrix.m3, before: '%38', after: '%0', delta: '-%100', deltaPositive: true },
              { metric: c.matrix.m4, before: '3.4/5', after: '4.8/5', delta: '+%41', deltaPositive: true },
              { metric: c.matrix.m5, before: '42', after: '127', delta: '+%202', deltaPositive: true },
            ]}
          />
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section className="section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              {c.comp.title}
            </h2>
          </div>
          <ComparisonTable
            accentColor={ACCENT}
            rows={[
              { feature: c.comp.f1, traditional: '08:00-18:00', starwebflow: '7/24/365' },
              { feature: c.comp.f2, traditional: '2-4 saat', starwebflow: '< 2 saniye' },
              { feature: c.comp.f3, traditional: '1 müşteri', starwebflow: 'Sınırsız' },
              { feature: c.comp.f4, traditional: c.comp.f4Val, starwebflow: c.comp.f4ValStar },
              { feature: c.comp.f5, traditional: false, starwebflow: true },
              { feature: c.comp.f6, traditional: c.comp.f6Val, starwebflow: c.comp.f6ValStar },
              { feature: c.comp.f7, traditional: c.comp.f7Val, starwebflow: c.comp.f7ValStar },
            ]}
          />
        </div>
      </section>

      {/* ─── CTA ─── */}
      <ServiceCTA
        accentColor={ACCENT}
        headline={c.cta.headline}
        subheadline={c.cta.subheadline}
        urgencyText={c.cta.urgency}
        primaryLabel={c.cta.primary}
        secondaryLabel={c.cta.secondary}
      />

    </ServiceLayout>
  )
}
