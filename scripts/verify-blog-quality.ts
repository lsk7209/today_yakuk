import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import "tsconfig-paths/register";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase 환경 변수가 없습니다.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.info("===== 최근 블로그 콘텐츠 분석 =====\n");

    // 가장 최근에 생성된 pending 블로그 가져오기
    const { data: post, error } = await supabase
        .from("content_queue")
        .select("slug, title, content_html, ai_summary, ai_faq, updated_at")
        .eq("status", "pending")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !post) {
        console.error("블로그를 찾을 수 없습니다:", error);
        return;
    }

    console.log(`📝 제목: ${post.title}`);
    console.log(`🔗 Slug: ${post.slug}`);
    console.log(`📅 생성일: ${post.updated_at}`);
    console.log(`\n📊 콘텐츠 분석:\n`);

    // 1. 글자수 분석
    const contentHtml = post.content_html || "";
    const plainText = contentHtml.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const charCount = plainText.length;
    const wordCount = plainText.split(/\s+/).length;

    console.log(`✅ 총 글자수 (공백 포함): ${charCount}자`);
    console.log(`✅ 총 단어수: ${wordCount}개`);

    // 2. 구조 분석
    const h2Count = (contentHtml.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (contentHtml.match(/<h3[^>]*>/gi) || []).length;
    console.log(`✅ H2 섹션: ${h2Count}개`);
    console.log(`✅ H3 서브섹션: ${h3Count}개`);

    // 3. Rich Content 요소 분석
    const richElements = {
        "key-takeaways": (contentHtml.match(/class="key-takeaways"/gi) || []).length,
        "expert-quote": (contentHtml.match(/class="expert-quote"/gi) || []).length,
        "info-box": (contentHtml.match(/class="info-box"/gi) || []).length,
        "warning-box": (contentHtml.match(/class="warning-box"/gi) || []).length,
        "tip-box": (contentHtml.match(/class="tip-box"/gi) || []).length,
        "step-cards": (contentHtml.match(/class="step-cards"/gi) || []).length,
        "checklist": (contentHtml.match(/class="checklist"/gi) || []).length,
        "stat-highlight": (contentHtml.match(/class="stat-highlight"/gi) || []).length,
        "pros-cons-grid": (contentHtml.match(/class="pros-cons-grid"/gi) || []).length,
        "tables": (contentHtml.match(/<table[^>]*>/gi) || []).length,
    };

    console.log(`\n📦 Rich Content 요소:`);
    let totalRichElements = 0;
    Object.entries(richElements).forEach(([name, count]) => {
        if (count > 0) {
            console.log(`  ✅ ${name}: ${count}개`);
            totalRichElements += count;
        }
    });
    console.log(`  총 ${totalRichElements}개의 Rich Content 요소`);

    // 4. FAQ 분석
    const faqCount = Array.isArray(post.ai_faq) ? post.ai_faq.length : 0;
    console.log(`\n❓ FAQ: ${faqCount}개`);

    // 5. 통계/수치 추출
    const numberMatches = plainText.match(/\d+%|\d+mg|\d+시간|\d+일|\d+명|\d+건|\d+회/gi) || [];
    console.log(`\n📈 통계/수치 언급: ${numberMatches.length}회`);
    if (numberMatches.length > 0) {
        console.log(`  예시: ${numberMatches.slice(0, 5).join(", ")}`);
    }

    // 6. 검증 결과
    console.log(`\n\n🎯 SEO 최적화 검증 결과:`);
    const checks = [
        { name: "최소 글자수 (2,500자 이상)", pass: charCount >= 2500, value: `${charCount}자` },
        { name: "H2 섹션 (4개 이상)", pass: h2Count >= 4, value: `${h2Count}개` },
        { name: "H3 서브섹션 (8개 이상)", pass: h3Count >= 8, value: `${h3Count}개` },
        { name: "Rich Content (4개 이상)", pass: totalRichElements >= 4, value: `${totalRichElements}개` },
        { name: "FAQ (3개 이상)", pass: faqCount >= 3, value: `${faqCount}개` },
        { name: "통계/수치 (3회 이상)", pass: numberMatches.length >= 3, value: `${numberMatches.length}회` },
    ];

    checks.forEach(check => {
        const icon = check.pass ? "✅" : "❌";
        console.log(`${icon} ${check.name}: ${check.value}`);
    });

    const allPassed = checks.every(c => c.pass);
    if (allPassed) {
        console.log(`\n🎉 모든 SEO 최적화 기준을 통과했습니다!`);
    } else {
        console.log(`\n⚠️  일부 기준이 미달되었습니다. 프롬프트 추가 개선이 필요할 수 있습니다.`);
    }
}

main().catch(console.error);
