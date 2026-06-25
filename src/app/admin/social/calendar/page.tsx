import CalendarClient from './CalendarClient';
import { getSocialData } from '@/app/actions/social';

export default async function CalendarPage() {
  const { data } = await getSocialData();

  return (
    <div className="min-h-screen bg-[#05050A]">
      <CalendarClient initialPosts={data?.posts || []} />
    </div>
  );
}
