import { getBlogPosts } from '@/app/actions/blog';
import BlogDashboardClient from './BlogDashboardClient';

export default async function AdminBlogDashboardPage() {
  const res = await getBlogPosts();
  const initialData = res.data ?? [];

  return <BlogDashboardClient initialData={initialData as any} />;
}
