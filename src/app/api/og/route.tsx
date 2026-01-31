import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "약국오늘";
  const subtitle = searchParams.get("subtitle") ?? "실시간 영업 약국 검색";

  // title을 seed로 사용하여 일관된 랜덤 스타일 생성
  const seed = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // 1. 색상 팔레트 (Tailwind Colors 기반 파스텔 톤)
  const palettes = [
    { bg: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 60%, #DBEAFE 100%)", text: "#1E3A8A", accent: "#BFDBFE", icon: "💊" }, // Blue
    { bg: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 60%, #D1FAE5 100%)", text: "#064E3B", accent: "#A7F3D0", icon: "🏥" }, // Green
    { bg: "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 60%, #FFEDD5 100%)", text: "#7C2D12", accent: "#FED7AA", icon: "🧡" }, // Orange
    { bg: "linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 60%, #F3E8FF 100%)", text: "#581C87", accent: "#E9D5FF", icon: "✨" }, // Purple
    { bg: "linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 60%, #FEE2E2 100%)", text: "#7F1D1D", accent: "#FECACA", icon: "❤️" }, // Red
  ];

  const paletteIndex = seed % palettes.length;
  const theme = palettes[paletteIndex];

  // 2. 랜덤 패턴 (원형, 사각형 등)
  const patternType = seed % 3; // 0: None, 1: Circles, 2: Stripes

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: theme.bg,
          color: "#0F172A",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 패턴 (장식용) */}
        {patternType === 1 && (
          <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: theme.accent, opacity: 0.3, filter: "blur(80px)" }} />
        )}
        {patternType === 2 && (
          <div style={{ position: "absolute", bottom: -50, left: -50, width: 300, height: 300, transform: "rotate(45deg)", background: theme.accent, opacity: 0.2 }} />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 10 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.8)",
              border: `2px solid ${theme.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            }}
          >
            {theme.icon}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: theme.text, opacity: 0.8 }}>약국오늘</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, zIndex: 10 }}>
          <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.08, color: "#1E293B", textShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            {title}
          </div>
          <div style={{ fontSize: 26, color: "#475569", fontWeight: 500 }}>
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, borderTop: `1px solid ${theme.accent}`, paddingTop: 32 }}>
          <div style={{ fontSize: 20, color: "#64748B", fontWeight: 500 }}>todaypharm.kr</div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ padding: "8px 16px", borderRadius: 20, background: theme.accent, color: theme.text, fontSize: 16, fontWeight: 700 }}>
              실시간 확인
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 20, background: "#F1F5F9", color: "#64748B", fontSize: 16, fontWeight: 600 }}>
              SEO · AEO
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}


