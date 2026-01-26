"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Init client-side supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // const isFirstMount = useRef(true);

    useEffect(() => {
        // Skip tracking on dev environment to avoid noise, or keep it if testing
        if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_DEV) {
            return;
        }

        const trackPageView = async () => {
            try {
                // Simple device detection
                const userAgent = window.navigator.userAgent;
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
                const deviceType = isMobile ? "mobile" : "desktop";

                // Referrer
                const referrer = document.referrer;

                const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

                await supabase.from("analytics_logs").insert({
                    path: fullPath,
                    referrer: referrer || null,
                    user_agent: userAgent,
                    device_type: deviceType,
                    // ip_hash would ideally be done server-side or via edge function
                    // for clientside only, we rely on what we can get
                });
            } catch (error) {
                // Silently fail to not disrupt user experience
                console.error("Analytics error:", error);
            }
        };

        // Track on mount (initial load) and subsequent path changes
        trackPageView();

    }, [pathname, searchParams]);

    return null;
}
