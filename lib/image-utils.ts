/**
 * Client-side image compression using the Canvas API.
 * Reduces file size before upload without quality loss perceptible to users.
 */

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const JPEG_QUALITY = 0.82;

/**
 * Compresses an image File using canvas. Returns the original file unchanged
 * if it is already small enough, or if the browser doesn't support canvas.
 * GIFs and SVGs are returned as-is.
 */
export async function compressImage(file: File, maxSizeMB = 1): Promise<File> {
    // Skip non-compressible types
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        return file;
    }
    // Skip PDF
    if (file.type === 'application/pdf') {
        return file;
    }
    // Already small enough
    if (file.size <= maxSizeMB * 1024 * 1024) {
        return file;
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // fallback: no canvas support
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                const quality = outputType === 'image/jpeg' ? JPEG_QUALITY : undefined;

                canvas.toBlob(
                    (blob) => {
                        if (!blob || blob.size >= file.size) {
                            resolve(file); // compression made it larger, keep original
                            return;
                        }
                        const compressed = new File([blob], file.name, {
                            type: outputType,
                            lastModified: Date.now(),
                        });
                        resolve(compressed);
                    },
                    outputType,
                    quality,
                );
            };
            img.onerror = () => resolve(file);
            img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}
