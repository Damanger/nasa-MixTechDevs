import fs from 'node:fs';
import path from 'node:path';

async function ensureDir(dir) {
    await fs.promises.mkdir(dir, { recursive: true });
}

async function main() {
    const root = process.cwd();
    const pubDir = path.join(root, 'public');
    const src = path.join(pubDir, 'MixTechDevs.webp');

    try {
        await fs.promises.access(src, fs.constants.R_OK);
    } catch {
        console.error(`[icons] Source image not found: ${src}`);
        process.exit(1);
    }

    await ensureDir(pubDir);

    // Lazy import sharp to avoid error if not installed when script isn't used
    const { default: sharp } = await import('sharp');

    const targets = [
        { out: 'apple-touch-icon.png', size: 180 },
        { out: 'apple-touch-icon-precomposed.png', size: 180 },
        { out: 'icon-192x192.png', size: 192 },
        { out: 'icon-512x512.png', size: 512 },
    ];

    for (const t of targets) {
        const dest = path.join(pubDir, t.out);
        await sharp(src).resize(t.size, t.size, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(dest);
        console.log(`[icons] Generated ${t.out} (${t.size}x${t.size})`);
    }
}

main().catch((err) => {
    console.error('[icons] Failed generating icons:', err);
    process.exit(1);
});
