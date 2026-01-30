import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import "tsconfig-paths/register";
import { createClient } from "@supabase/supabase-js";
import { generateBlogTopic, generateBlogPost } from "../src/lib/gemini-blog";
import { getNextSlot } from "../src/lib/scheduler";
import { z } from "zod";

// 환경변수 체크 및 로드
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase 환경 변수가 없습니다.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.info("===== 블로그 자동 생성 시작 =====");

    // 1. 주제 선정
    console.info("주제 선정 중...");
    const topic = await generateBlogTopic();
    if (!topic) {
        console.error("주제 생성 실패");
        return;
    }
    console.info(`📌 선정된 주제: ${topic}`);

    // 2. 글 작성
    console.info("블로그 글 작성 중...");
    const post = await generateBlogPost(topic);
    if (!post) {
        console.error("글 작성 실패");
        return;
    }
    console.info(`✅ 글 작성 완료: ${post.title}`);

    // 3. 스케줄링 (마지막 예약 시간 + 다음 슬롯)
    // 마지막 예약된 시간 확인 (가장 미래의 pending)
    const { data: lastPending } = await supabase
        .from("content_queue")
        .select("publish_at")
        .eq("status", "pending")
        .order("publish_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    let lastScheduledTime = lastPending?.publish_at
        ? new Date(lastPending.publish_at)
        : new Date();

    // 과거의 시간이라면 현재 시간으로 보정
    if (lastScheduledTime.getTime() < Date.now()) {
        lastScheduledTime = new Date();
    }

    const nextSlot = getNextSlot(lastScheduledTime);
    console.info(`📅 발행 예약: ${nextSlot.toISOString()}`);

    // 4. DB 저장
    // 4. DB 저장
    // SEO 친화적 슬러그 생성 (DB 중복 체크)
    let finalSlug = post.slug_suggestion || `blog-${Date.now()}`;

    // 단순 무식하지만 확실한 중복 체크 루프 (최대 5번 시도)
    for (let i = 1; i <= 5; i++) {
        const checkSlug = i === 1 ? finalSlug : `${finalSlug}-${i}`;
        const { data: existing } = await supabase
            .from("content_queue")
            .select("id")
            .eq("slug", checkSlug)
            .maybeSingle();

        if (!existing) {
            finalSlug = checkSlug;
            break;
        }
    }

    const queueItem = {
        hpid: null, // 블로그는 약국 ID 없음
        title: post.title,
        slug: finalSlug,
        region: null,
        theme: "blog",
        content_html: post.content_html,
        ai_summary: post.summary,
        ai_bullets: null,
        ai_faq: post.faq,
        ai_cta: null,
        extra_sections: null,
        status: "pending",
        publish_at: nextSlot.toISOString(),
    };

    const { error } = await supabase.from("content_queue").insert(queueItem);

    if (error) {
        console.error("DB 저장 실패:", error);
    } else {
        console.info("✨ 블로그 포스트가 성공적으로 예약되었습니다.");
    }
}

main().catch(console.error);
