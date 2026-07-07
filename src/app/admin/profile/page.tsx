import { getProfile } from '@/app/actions/profile';
import ProfileDashboardClient from '@/components/profile/ProfileDashboardClient';

export default async function AdminProfilePage() {
  const res = await getProfile();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center text-red-400">
        Profil bilgileri yüklenemedi: {res.error}
      </div>
    );
  }

  return <ProfileDashboardClient initialProfile={res.data as any} />;
}
