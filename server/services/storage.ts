import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

interface UploadToR2Params {
  fileBuffer: Buffer;
  contentType?: string;
  folder?: string;
  fileName?: string;
}

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for R2 storage`);
  }
  return value;
}

const r2Endpoint = process.env.R2_ACCOUNT_ID
  ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : undefined;

const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: getEnv('R2_ACCESS_KEY'),
    secretAccessKey: getEnv('R2_SECRET_ACCESS_KEY'),
  },
});

export async function uploadToR2({ fileBuffer, contentType, folder, fileName }: UploadToR2Params) {
  const bucket = getEnv('R2_BUCKET_NAME');
  const safeFolder = (folder ?? 'uploads').replace(/^\/+|\/+$/g, '');
  const inferredExt = fileName?.includes('.') ? fileName.split('.').pop() : undefined;
  const objectKey = `${safeFolder}/${randomUUID()}${inferredExt ? `.${inferredExt}` : ''}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: fileBuffer,
    ContentType: contentType ?? 'application/octet-stream',
  });

  await r2Client.send(command);

  const publicBase = process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_BASE_URL || `${r2Endpoint}/${bucket}`;
  const url = `${publicBase}/${objectKey}`;

  return {
    bucket,
    key: objectKey,
    url,
    mimeType: contentType,
    size: fileBuffer.byteLength,
  };
}

export function resolveMediaUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }

  const base =
    process.env.R2_PUBLIC_URL ||
    process.env.R2_PUBLIC_BASE_URL ||
    (process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET_NAME
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`
      : null);

  if (!base) return value;

  return `${base.replace(/\/+$/, '')}/${value.replace(/^\/+/, '')}`;
}
