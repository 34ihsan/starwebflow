import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya uzantısını al
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${uuidv4()}.${ext}`;

    // Dosyayı public klasörüne kaydet (Basit yaklaşım)
    // Production'da S3, Cloudinary vb. kullanılması tavsiye edilir
    const dirPath = join(process.cwd(), 'public', 'uploads', 'avatars');
    
    // Klasör yoksa oluştur
    try {
      const fs = require('fs/promises');
      await fs.mkdir(dirPath, { recursive: true });
    } catch (e) {
      console.log('Klasör oluşturulurken hata veya zaten var', e);
    }

    const path = join(dirPath, filename);
    await writeFile(path, buffer);

    const fileUrl = `/uploads/avatars/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json({ error: 'Dosya yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}
