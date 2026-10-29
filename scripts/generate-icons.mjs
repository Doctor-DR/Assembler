import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// SVG with DNA helix and plasmid assembly symbol
const svgStandard = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#0f172a" />
  <defs>
    <linearGradient id="grad1" x1="64" y1="64" x2="448" y2="448" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="glow" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
    </linearGradient>
  </defs>
  
  <!-- Outer circular plasmid track -->
  <circle cx="256" cy="256" r="170" stroke="url(#glow)" stroke-width="36" fill="none" />
  <circle cx="256" cy="256" r="160" stroke="#1e293b" stroke-width="16" fill="none" />
  
  <!-- Vector arc (cyan/blue) -->
  <circle cx="256" cy="256" r="160" stroke="#0284c7" stroke-width="20" stroke-linecap="round" stroke-dasharray="600 500" stroke-dashoffset="100" fill="none" />
  
  <!-- Insert fragments (emerald, amber, purple) -->
  <circle cx="256" cy="256" r="160" stroke="#10b981" stroke-width="20" stroke-linecap="round" stroke-dasharray="160 840" stroke-dashoffset="-220" fill="none" />
  <circle cx="256" cy="256" r="160" stroke="#f59e0b" stroke-width="20" stroke-linecap="round" stroke-dasharray="110 890" stroke-dashoffset="-410" fill="none" />

  <!-- Center DNA Hexagon / Overlap Nodes -->
  <g transform="translate(156, 156)">
    <!-- DNA Ladder Strands -->
    <path d="M 40 40 C 70 80, 130 80, 160 40" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M 40 160 C 70 120, 130 120, 160 160" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M 40 100 C 70 100, 130 100, 160 100" stroke="#06b6d4" stroke-width="10" stroke-linecap="round" stroke-dasharray="6 14" fill="none"/>
    <line x1="75" y1="65" x2="75" y2="135" stroke="#f1f5f9" stroke-width="7" stroke-linecap="round" />
    <line x1="100" y1="80" x2="100" y2="120" stroke="#f1f5f9" stroke-width="7" stroke-linecap="round" />
    <line x1="125" y1="65" x2="125" y2="135" stroke="#f1f5f9" stroke-width="7" stroke-linecap="round" />
    <!-- Overlap connection sparks -->
    <circle cx="75" cy="65" r="7" fill="#38bdf8" />
    <circle cx="125" cy="65" r="7" fill="#10b981" />
    <circle cx="75" cy="135" r="7" fill="#38bdf8" />
    <circle cx="125" cy="135" r="7" fill="#f59e0b" />
  </g>
</svg>
`;

// Maskable icon requires 10%+ safe padding margin around artwork
const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0f172a" />
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Outer circular plasmid track -->
    <circle cx="256" cy="256" r="160" stroke="#1e293b" stroke-width="16" fill="none" />
    
    <!-- Vector arc (cyan/blue) -->
    <circle cx="256" cy="256" r="160" stroke="#0284c7" stroke-width="22" stroke-linecap="round" stroke-dasharray="600 500" stroke-dashoffset="100" fill="none" />
    
    <!-- Insert fragments (emerald, amber) -->
    <circle cx="256" cy="256" r="160" stroke="#10b981" stroke-width="22" stroke-linecap="round" stroke-dasharray="160 840" stroke-dashoffset="-220" fill="none" />
    <circle cx="256" cy="256" r="160" stroke="#f59e0b" stroke-width="22" stroke-linecap="round" stroke-dasharray="110 890" stroke-dashoffset="-410" fill="none" />

    <!-- Center DNA Ladder Strands -->
    <g transform="translate(156, 156)">
      <path d="M 40 40 C 70 80, 130 80, 160 40" stroke="#38bdf8" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M 40 160 C 70 120, 130 120, 160 160" stroke="#38bdf8" stroke-width="14" stroke-linecap="round" fill="none"/>
      <line x1="75" y1="65" x2="75" y2="135" stroke="#f1f5f9" stroke-width="8" stroke-linecap="round" />
      <line x1="100" y1="80" x2="100" y2="120" stroke="#f1f5f9" stroke-width="8" stroke-linecap="round" />
      <line x1="125" y1="65" x2="125" y2="135" stroke="#f1f5f9" stroke-width="8" stroke-linecap="round" />
      <circle cx="75" cy="65" r="8" fill="#38bdf8" />
      <circle cx="125" cy="65" r="8" fill="#10b981" />
      <circle cx="75" cy="135" r="8" fill="#38bdf8" />
      <circle cx="125" cy="135" r="8" fill="#f59e0b" />
    </g>
  </g>
</svg>
`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgStandard);

  // Generate 512x512
  await sharp(Buffer.from(svgStandard))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Generate 192x192
  await sharp(Buffer.from(svgStandard))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // Generate maskable 512x512
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Generate Apple Touch Icon 180x180
  await sharp(Buffer.from(svgStandard))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('All PWA icons generated successfully!');
}

main().catch(console.error);
