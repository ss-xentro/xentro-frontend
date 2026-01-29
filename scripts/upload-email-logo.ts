/**
 * Script to upload the XENTRO logo to R2 for use in email templates
 * Run with: bun run scripts/upload-email-logo.ts
 */

import { uploadToR2 } from '../server/services/storage';
import fs from 'fs';
import path from 'path';

async function uploadLogo() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'xentro-logo.png');
    
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo file not found at:', logoPath);
      process.exit(1);
    }

    console.log('📤 Uploading XENTRO logo to R2...');
    
    const fileBuffer = fs.readFileSync(logoPath);
    
    const result = await uploadToR2({
      fileBuffer,
      contentType: 'image/png',
      folder: 'branding',
      fileName: 'xentro-logo.png'
    });

    console.log('✅ Logo uploaded successfully!');
    console.log('📍 Public URL:', result.url);
    console.log('\n💡 Add this to your .env file:');
    console.log(`EMAIL_LOGO_URL=${result.url}`);
    
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    process.exit(1);
  }
}

uploadLogo();
