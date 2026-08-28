import type { Metadata } from "next";
import NearbyClient from "./NearbyClient";

export const metadata: Metadata = {
  title: "내 주변 문 연 약국 찾기",
  description: "현재 위치 기준 반경 3km, 5km, 10km 안의 약국과 등록 영업시간 기준 운영 상태를 확인하세요. 방문 전 전화 확인을 권장합니다.",
  alternates: {
    canonical: "/nearby",
  },
  openGraph: {
    title: "내 주변 문 연 약국 찾기",
    description: "GPS 위치 기반 가까운 약국과 등록 영업시간, 방문 전 확인 정보를 제공합니다.",
    type: "website",
  },
};

export default function NearbyPage() {
  return <NearbyClient />;
}
