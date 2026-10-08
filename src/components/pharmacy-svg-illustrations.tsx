import type { VisualCategory } from "@/lib/pharmacy-intelligence";

export function PharmacyCategoryIllustration({
  category,
  className = "w-full h-36",
}: {
  category: VisualCategory;
  className?: string;
}) {
  switch (category) {
    case "night_care":
      return (
        <svg
          viewBox="0 0 320 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="야간 및 휴일 운영 약국 일러스트"
        >
          <rect width="320" height="140" rx="20" fill="url(#nightBg)" />
          <circle cx="262" cy="38" r="18" fill="#FDE68A" fillOpacity="0.9" />
          <circle cx="270" cy="32" r="15" fill="#0F172A" />
          <circle cx="64" cy="28" r="2" fill="#F8FAFC" fillOpacity="0.7" />
          <circle cx="110" cy="22" r="1.5" fill="#F8FAFC" fillOpacity="0.5" />
          <circle cx="204" cy="26" r="2" fill="#F8FAFC" fillOpacity="0.6" />
          <rect x="34" y="46" width="144" height="74" rx="12" fill="#1E293B" stroke="#334155" strokeWidth="2" />
          <rect x="48" y="60" width="52" height="42" rx="6" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
          <path d="M74 69V93M62 81H86" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
          <rect x="112" y="60" width="52" height="60" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <rect x="122" y="72" width="32" height="6" rx="3" fill="#38BDF8" fillOpacity="0.7" />
          <rect x="122" y="84" width="22" height="6" rx="3" fill="#94A3B8" fillOpacity="0.5" />
          <rect x="196" y="68" width="90" height="36" rx="10" fill="#065F46" stroke="#34D399" strokeWidth="1.5" />
          <text x="241" y="90" textAnchor="middle" fill="#ECFDF5" fontSize="12" fontWeight="800">
            야간·휴일 케어
          </text>
          <defs>
            <linearGradient id="nightBg" x1="0" y1="0" x2="320" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F172A" />
              <stop offset="1" stopColor="#1E293B" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "consultation":
      return (
        <svg
          viewBox="0 0 320 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="전문 복약지도 및 맞춤 상담 일러스트"
        >
          <rect width="320" height="140" rx="20" fill="url(#consultBg)" />
          <rect x="28" y="26" width="128" height="88" rx="14" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="2" />
          <circle cx="62" cy="54" r="14" fill="#D1FAE5" />
          <path d="M62 46V62M54 54H70" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="86" y="44" width="54" height="8" rx="4" fill="#059669" />
          <rect x="86" y="58" width="40" height="6" rx="3" fill="#6EE7B7" />
          <rect x="44" y="80" width="96" height="8" rx="4" fill="#E2E8F0" />
          <rect x="44" y="94" width="72" height="8" rx="4" fill="#E2E8F0" />
          <rect x="174" y="34" width="118" height="72" rx="14" fill="#047857" />
          <path d="M196 62H268M196 78H248" stroke="#ECFDF5" strokeWidth="4" strokeLinecap="round" />
          <circle cx="268" cy="78" r="6" fill="#FBBF24" />
          <defs>
            <linearGradient id="consultBg" x1="0" y1="0" x2="320" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ECFDF5" />
              <stop offset="1" stopColor="#D1FAE5" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "transit_hub":
      return (
        <svg
          viewBox="0 0 320 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="대중교통 역세권 및 정류장 인접 약국 일러스트"
        >
          <rect width="320" height="140" rx="20" fill="url(#transitBg)" />
          <path d="M24 106H296" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
          <rect x="36" y="38" width="96" height="62" rx="12" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="2" />
          <rect x="48" y="50" width="72" height="22" rx="5" fill="#DBEAFE" />
          <circle cx="58" cy="86" r="6" fill="#2563EB" />
          <circle cx="110" cy="86" r="6" fill="#2563EB" />
          <path d="M148 70H192" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          <circle cx="170" cy="70" r="12" fill="#10B981" />
          <path d="M166 70L170 74L176 66" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="204" y="32" width="84" height="68" rx="12" fill="#FFFFFF" stroke="#34D399" strokeWidth="2" />
          <path d="M246 48V72M234 60H258" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="transitBg" x1="0" y1="0" x2="320" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EFF6FF" />
              <stop offset="1" stopColor="#ECFDF5" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "specialty_care":
      return (
        <svg
          viewBox="0 0 320 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="특화 품목 및 맞춤 조제 약국 일러스트"
        >
          <rect width="320" height="140" rx="20" fill="url(#specBg)" />
          <rect x="34" y="30" width="80" height="80" rx="16" fill="#FFFFFF" stroke="#C4B5FD" strokeWidth="2" />
          <rect x="58" y="48" width="32" height="44" rx="8" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2" />
          <path d="M74 62V78M66 70H82" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
          <rect x="130" y="30" width="156" height="80" rx="16" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="2" />
          <rect x="148" y="48" width="84" height="10" rx="5" fill="#059669" />
          <rect x="148" y="66" width="120" height="8" rx="4" fill="#6EE7B7" />
          <rect x="148" y="82" width="96" height="8" rx="4" fill="#CBD5E1" />
          <defs>
            <linearGradient id="specBg" x1="0" y1="0" x2="320" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5F3FF" />
              <stop offset="1" stopColor="#ECFDF5" />
            </linearGradient>
          </defs>
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 320 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="우리 동네 거점 약국 일러스트"
        >
          <rect width="320" height="140" rx="20" fill="url(#defaultBg)" />
          <rect x="40" y="32" width="110" height="78" rx="14" fill="#FFFFFF" stroke="#6EE7B7" strokeWidth="2" />
          <path d="M95 50V78M81 64H109" stroke="#059669" strokeWidth="5" strokeLinecap="round" />
          <rect x="68" y="88" width="54" height="8" rx="4" fill="#A7F3D0" />
          <rect x="168" y="40" width="112" height="62" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="184" y="56" width="80" height="8" rx="4" fill="#0F172A" />
          <rect x="184" y="72" width="60" height="8" rx="4" fill="#10B981" />
          <defs>
            <linearGradient id="defaultBg" x1="0" y1="0" x2="320" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F0FDF4" />
              <stop offset="1" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
        </svg>
      );
  }
}

export function ReportSectionSvgIcon({
  section,
  className = "w-6 h-6",
}: {
  section: "briefing" | "cost" | "keywords" | "guide" | "peers" | "faq";
  className?: string;
}) {
  switch (section) {
    case "briefing":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="#10B981" fillOpacity="0.15" />
          <path d="M8 9H16M8 13H16M8 17H13" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "cost":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="#0EA5E9" fillOpacity="0.15" />
          <path d="M9 9.5L10.8 15.5L12 11.5L13.2 15.5L15 9.5M8 12H16" stroke="#0369A1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "keywords":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="4" fill="#8B5CF6" fillOpacity="0.15" />
          <path d="M7 15V11M12 15V8M17 15V12" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "guide":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="#F59E0B" fillOpacity="0.15" />
          <path d="M12 7V12L15 14" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "peers":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="#EC4899" fillOpacity="0.15" />
          <path d="M7 16L10.5 11.5L13.5 14L17 8.5" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "faq":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="#3B82F6" fillOpacity="0.15" />
          <path d="M9.5 9.5C9.5 8.1 10.6 7 12 7C13.4 7 14.5 8.1 14.5 9.5C14.5 10.7 13.5 11.4 12.6 12C12.2 12.3 12 12.7 12 13.5M12 16.5H12.01" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
