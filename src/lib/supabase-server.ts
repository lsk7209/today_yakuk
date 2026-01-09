/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase 환경 변수가 설정되지 않았습니다. 더미 클라이언트를 반환합니다."
    );
    // Return a proxy that handles any method call gracefully
    const createMockBuilder = () => {
      const handler = {
        get: (target: any, prop: string) => {
          if (prop === "then") {
            // make it awaitable, resolving to empty data
            return (resolve: any) => resolve({ data: [], error: null });
          }
          // return function that returns proxy (chaining)
          return () => new Proxy({}, handler);
        },
      };
      return new Proxy({}, handler);
    };

    return {
      from: () => createMockBuilder(),
      rpc: () => createMockBuilder(),
    } as any;
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

