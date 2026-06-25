import { getSocialData } from '@/app/actions/social';
import SocialDashboardClient from './SocialDashboardClient';

export default async function AdminSocialDashboardPage() {
  // tenantId artık getSocialData içinde otomatik çözümleniyor
  // (cookie → DB slug → ilk tenant → otomatik oluştur)
  const res = await getSocialData();
  const initialData = res.data ?? { posts: [], ads: [] };

  return <SocialDashboardClient initialData={initialData as any} />;
}
