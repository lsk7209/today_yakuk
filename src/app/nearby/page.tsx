import type { Metadata } from "next";
import NearbyClient from "./NearbyClient";

export const metadata: Metadata = {
  title: "내 주변 문 연 약국 찾기",
  description: "현재 위치 기준으로 반경 3km, 5km, 10km 안의 문 연 약국을 거리순과 종료 임박순으로 확인하세요.",
  alternates: {
    canonical: "/nearby",
  },
  openGraph: {
    title: "내 주변 문 연 약국 찾기",
    description: "GPS 위치 기반으로 가까운 영업 약국과 방문 전 확인 정보를 제공합니다.",
    type: "website",
  },
};

export default function NearbyPage() {
  return <NearbyClient />;
}
