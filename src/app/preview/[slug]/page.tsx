import type { Metadata } from 'next';
import SolutionPreviewClient from './SolutionPreviewClient';

export const metadata: Metadata = {
  title: 'İnteraktif Çözüm & Otomasyon Simülatörü | StarWebFlow Enterprise',
  description: 'Müşteriye özel canlı interaktif AI asistanı, ROI hesaplayıcı ve iş akışı prototipi.',
  robots: 'noindex, nofollow' // Özel müşteri önizlemesi olduğu için arama motorlarına kapalı (DSGVO uyumlu)
};

export default function SolutionPreviewPage() {
  return <SolutionPreviewClient />;
}
