export const size = { width: 180, height: 180 };
export const contentType = "image/svg+xml";

export default function AppleIcon() {
  return new Response(createIconSvg(180, 40, 110), {
    headers: { "Content-Type": contentType },
  });
}

function createIconSvg(width: number, radius: number, fontSize: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${width} ${width}">
  <defs>
    <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${width}" rx="${radius}" fill="url(#fg)"/>
  <text x="50%" y="57%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ecfdf3">약</text>
</svg>`;
}
