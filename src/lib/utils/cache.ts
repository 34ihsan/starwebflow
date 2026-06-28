import { revalidatePath } from 'next/cache';

/**
 * Next.js Server Actions içinde kullanıldığında hata fırlatmasını önlemek için 
 * güvenli (safe) bir revalidatePath sarıcı fonksiyonu.
 * Bu fonksiyon revalidatePath işleminin başarısız olması durumunda tüm action'ı çökertmesini engeller.
 * 
 * @param path Revalidate edilecek sayfa yolu
 * @param type Revalidate edilecek tip ('page' veya 'layout')
 */
export function safeRevalidatePath(path: string, type?: 'page' | 'layout') {
  try {
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
  } catch (error) {
    console.warn(`[Cache Warning] Failed to revalidate path: ${path}`, error);
  }
}
