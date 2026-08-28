import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "약국오늘 - 문 연 약국·영업시간 찾기",
    short_name: "약국오늘",
    description: "등록된 영업시간을 기준으로 가까운 약국과 현재 운영 상태를 확인하는 서비스입니다.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#047857",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
