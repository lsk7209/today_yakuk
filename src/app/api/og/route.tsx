import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "오늘약국";
  const subtitle = searchParams.get("subtitle") ?? "실시간 영업 약국 검색";

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
          background: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 60%, #EEF2FF 100%)",
          color: "#0F172A",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#DCFCE7",
              border: "2px solid #A7F3D0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "#065F46",
            }}
          >
            약
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>오늘약국</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.08 }}>{title}</div>
          <div style={{ fontSize: 26, color: "#334155" }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, color: "#475569" }}>todaypharm.kr</div>
          <div style={{ fontSize: 18, color: "#475569" }}>SEO · AEO 최적화</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}


