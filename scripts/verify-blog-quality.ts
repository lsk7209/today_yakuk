import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import "tsconfig-paths/register";
import { getTursoClient } from "../src/lib/turso";

const db = getTursoClient();

async function main() {
    console.info("===== 최근 블로그 콘텐츠 분석 =====\n");

    const result = await db.execute({
        sql: "SELECT slug, title, content_html, ai_summary, ai_faq, updated_at FROM content_queue WHERE status = 'pending' ORDER BY updated_at DESC LIMIT 1",
        args: [],
    });

    if (!result.rows.length) {
        console.error("블로그를 찾을 수 없습니다.");
        return;
    }

    const post = result.rows[0];
    let ai_faq: unknown[] = [];
    try { ai_faq = post.ai_faq ? JSON.parse(post.ai_faq as string) : []; } catch { /* skip */ }

    console.log(`📝 제목: ${post.title}`);
    console.log(`🔗 Slug: ${post.slug}`);
    console.log(`📅 생성일: ${post.updated_at}`);
    console.log(`\n📊 콘텐츠 분석:\n`);

    const contentHtml = (post.content_html as string) || "";
    const plainText = contentHtml.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const charCount = plainText.length;
    const wordCount = plainText.split(/\s+/).length;

    console.log(`✅ 총 글자수 (공백 포함): ${charCount}자`);
    console.log(`✅ 총 단어수: ${wordCount}개`);

    const h2Count = (contentHtml.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (contentHtml.match(/<h3[^>]*>/gi) || []).length;
    console.log(`✅ H2 섹션: ${h2Count}개`);
    console.log(`✅ H3 서브섹션: ${h3Count}개`);

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

    const faqCount = Array.isArray(ai_faq) ? ai_faq.length : 0;
    console.log(`\n❓ FAQ: ${faqCount}개`);

    const numberMatches = plainText.match(/\d+%|\d+mg|\d+시간|\d+일|\d+명|\d+건|\d+회/gi) || [];
    console.log(`\n📈 통계/수치 언급: ${numberMatches.length}회`);
    if (numberMatches.length > 0) {
        console.log(`  예시: ${numberMatches.slice(0, 5).join(", ")}`);
    }

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
