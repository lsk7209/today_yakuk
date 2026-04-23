"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type AnalyticsDatabase = {
  public: {
    Tables: {
      analytics_logs: {
        Row: {
          path: string;
          referrer: string | null;
          user_agent: string;
          device_type: string;
        };
        Insert: {
          path: string;
          referrer?: string | null;
          user_agent: string;
          device_type: string;
        };
        Update: Partial<{
          path: string;
          referrer: string | null;
          user_agent: string;
          device_type: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let analyticsClient: SupabaseClient<AnalyticsDatabase> | null = null;

function getAnalyticsClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!analyticsClient) {
    analyticsClient = createClient<AnalyticsDatabase>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return analyticsClient;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_DEV) {
      return;
    }

    const supabase = getAnalyticsClient();
    if (!supabase) {
      return;
    }

    const trackPageView = async () => {
      try {
        const userAgent = window.navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const deviceType = isMobile ? "mobile" : "desktop";
        const referrer = document.referrer || null;
        const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

        await supabase.from("analytics_logs").insert({
          path: fullPath,
          referrer,
          user_agent: userAgent,
          device_type: deviceType,
        });
      } catch {
        // 추적 실패는 사용자 경험에 영향을 주지 않도록 무시합니다.
      }
    };

    void trackPageView();
  }, [pathname, searchParams]);

  return null;
}
