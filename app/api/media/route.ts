import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { mediaRepository } from '@/server/repositories/media.repository';
import { uploadToR2 } from '@/server/services/storage';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = typeof formData.get('folder') === 'string' ? (formData.get('folder') as string) : undefined;
    const entityType = typeof formData.get('entityType') === 'string' ? (formData.get('entityType') as string) : null;
    const entityId = typeof formData.get('entityId') === 'string' ? (formData.get('entityId') as string) : null;

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'File is required' }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ message: 'File too large. Max 5MB.' }, { status: 413 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Only image uploads are allowed for now.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await uploadToR2({
      fileBuffer: buffer,
      contentType: file.type,
      folder: folder ?? 'uploads',
      fileName: file.name,
    });

    const media = await mediaRepository.create({
      bucket: uploaded.bucket,
      key: uploaded.key,
      url: uploaded.url,
      mimeType: uploaded.mimeType ?? null,
      size: uploaded.size,
      entityType,
      entityId,
    });

    return NextResponse.json({ data: media }, { status: 201 });
  } catch (error) {
    console.error('Failed to upload media', error);
    return NextResponse.json({ message: 'Failed to upload media' }, { status: 500 });
  }
}
