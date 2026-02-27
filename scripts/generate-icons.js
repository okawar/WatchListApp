// Run: node scripts/generate-icons.js
const sharp = require("sharp");
const path = require("path");

const ASSETS = path.join(__dirname, "../assets/images");

// ── Icon SVG (dark bg + film strip + green play + checkmark badge) ─────────────
const ICON_SVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="200" fill="#0d0d0d"/>

  <!-- Film strip top -->
  <rect x="0" y="72" width="1024" height="104" fill="#181818"/>
  <rect x="72"  y="86" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="208" y="86" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="344" y="86" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="480" y="86" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="616" y="86" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="752" y="86" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="888" y="86" width="60" height="76" rx="10" fill="#0d0d0d"/>

  <!-- Film strip bottom -->
  <rect x="0" y="848" width="1024" height="104" fill="#181818"/>
  <rect x="72"  y="862" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="208" y="862" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="344" y="862" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="480" y="862" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="616" y="862" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="752" y="862" width="60" height="76" rx="10" fill="#0d0d0d"/>
  <rect x="888" y="862" width="60" height="76" rx="10" fill="#0d0d0d"/>

  <!-- Play circle -->
  <circle cx="512" cy="480" r="244" fill="#181818"/>
  <circle cx="512" cy="480" r="244" fill="none" stroke="#2ecc71" stroke-width="18"/>

  <!-- Play triangle -->
  <path d="M442 358 L442 602 L706 480 Z" fill="#2ecc71"/>

  <!-- Checkmark badge -->
  <circle cx="724" cy="686" r="82" fill="#0d0d0d"/>
  <circle cx="724" cy="686" r="66" fill="#2ecc71"/>
  <polyline
    points="692,686 716,710 762,648"
    stroke="white" stroke-width="20"
    stroke-linecap="round" stroke-linejoin="round"
    fill="none"
  />
</svg>`;

// ── Foreground (transparent bg — for Android adaptive icon) ──────────────────
const FOREGROUND_SVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Play circle -->
  <circle cx="512" cy="480" r="244" fill="#1e1e1e"/>
  <circle cx="512" cy="480" r="244" fill="none" stroke="#2ecc71" stroke-width="18"/>
  <path d="M442 358 L442 602 L706 480 Z" fill="#2ecc71"/>

  <!-- Checkmark badge -->
  <circle cx="724" cy="686" r="82" fill="#1e1e1e"/>
  <circle cx="724" cy="686" r="66" fill="#2ecc71"/>
  <polyline
    points="692,686 716,710 762,648"
    stroke="white" stroke-width="20"
    stroke-linecap="round" stroke-linejoin="round"
    fill="none"
  />
</svg>`;

// ── Monochrome (white silhouette — Android monochrome adaptive icon) ──────────
const MONO_SVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <circle cx="512" cy="480" r="244" fill="none" stroke="white" stroke-width="18"/>
  <path d="M442 358 L442 602 L706 480 Z" fill="white"/>
  <circle cx="724" cy="686" r="66" fill="white"/>
  <polyline
    points="692,686 716,710 762,648"
    stroke="#0d0d0d" stroke-width="20"
    stroke-linecap="round" stroke-linejoin="round"
    fill="none"
  />
</svg>`;

// ── Splash icon (centered on transparent) ────────────────────────────────────
const SPLASH_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="200" fill="#181818"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="#2ecc71" stroke-width="14"/>
  <path d="M200 160 L200 352 L380 256 Z" fill="#2ecc71"/>
</svg>`;

async function generate() {
  const jobs = [
    { svg: ICON_SVG,       size: 1024, file: "icon.png" },
    { svg: FOREGROUND_SVG, size: 1024, file: "android-icon-foreground.png" },
    { svg: MONO_SVG,       size: 1024, file: "android-icon-monochrome.png" },
    { svg: SPLASH_SVG,     size: 512,  file: "splash-icon.png" },
    { svg: ICON_SVG,       size: 196,  file: "favicon.png" },
  ];

  for (const { svg, size, file } of jobs) {
    const dest = path.join(ASSETS, file);
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(dest);
    console.log(`✓ ${file} (${size}×${size})`);
  }

  // Background: solid dark square
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: "#0d0d0d" },
  })
    .png()
    .toFile(path.join(ASSETS, "android-icon-background.png"));
  console.log("✓ android-icon-background.png (solid #0d0d0d)");

  console.log("\nAll icons generated!");
}

generate().catch(console.error);
