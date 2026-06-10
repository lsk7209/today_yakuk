import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #059669 0%, #0f172a 100%)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ecfdf3",
          fontWeight: 700,
          fontSize: 110,
        }}
      >
        약
      </div>
    ),
    { width: 180, height: 180 }
  );
}
