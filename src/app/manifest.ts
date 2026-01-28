import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "약국오늘 - 실시간 영업 약국 찾기",
        short_name: "약국오늘",
        description: "지금 문 연 최저가/야간/주말 약국을 내 주변에서 즉시 찾으세요.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#047857", // brand-700
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    };
}
