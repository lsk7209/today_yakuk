import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #059669 0%, #0f172a 100%)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ecfdf3",
          fontWeight: 700,
          fontSize: 20,
        }}
      >
        약
      </div>
    ),
    { width: 32, height: 32 }
  );
}
