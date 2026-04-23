import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "약국오늘 - 실시간 영업 약국 찾기",
    short_name: "약국오늘",
    description: "지금 문 연 근처 약국과 운영 시간을 빠르게 확인하는 약국 검색 서비스입니다.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#047857",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
