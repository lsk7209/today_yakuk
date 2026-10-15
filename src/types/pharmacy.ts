export type OperatingHours = Record<
  string,
  {
    open: string | null;
    close: string | null;
  }
>;

export type Pharmacy = {
  id?: string;
  hpid: string;
  name: string;
  address: string;
  tel?: string;
  latitude?: number | null;
  longitude?: number | null;
  operating_hours?: OperatingHours | null;
  description_raw?: string | null;
  gemini_summary?: string | null;
  // 저장된 원본 JSON. 형식·버전이 검증되지 않았으므로 parseStoredIntelligenceReport로만 읽는다.
  intelligence_report?: unknown;
  enriched_at?: string | null;
  skipped_at?: string | null;
  province?: string | null;
  city?: string | null;
  updated_at?: string | null;
};


