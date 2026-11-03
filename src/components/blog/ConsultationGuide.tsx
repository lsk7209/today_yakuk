import Link from "next/link";
import { JsonLd, buildFAQSchema } from "@/components/seo/json-ld";

type Props = { title: string; intro: string; correction: string; checklist: string[]; faqs: {question: string; answer: string}[]; sources: { label: string; url: string }[] };

export default function ConsultationGuide({ title, intro, correction, checklist, faqs, sources }: Props) {

  return <article className="city-template mx-auto max-w-3xl px-4 py-10 space-y-8">
    <header className="space-y-3"><p className="text-sm text-brand-700">약국 방문 · 상담 준비</p><h1 className="text-3xl font-bold">{title}</h1><p>{intro}</p></header>
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 space-y-2"><h2 className="font-bold">이전 안내 정정</h2><p>{correction}</p><p className="text-sm">이 글은 약사 검수 완료 콘텐츠가 아닙니다. 특정 제품의 안전성·금기·복용량을 판정하지 않습니다.</p></section>
    <section className="space-y-3"><h2 className="text-xl font-bold">상담 전에 준비할 것</h2><ul className="list-disc pl-5 space-y-2">{checklist.map(item => <li key={item}>{item}</li>)}</ul></section>
    <section className="space-y-4"><h2 className="text-xl font-bold">약국에서 확인할 질문</h2>{faqs.map(faq => <div key={faq.question} className="city-card border p-4 space-y-2"><h3 className="font-bold">{faq.question}</h3><p>{faq.answer}</p></div>)}</section>
    <section className="space-y-2"><h2 className="text-xl font-bold">공식 정보 확인 경로</h2><p>제품별 허가사항과 개인의 상황을 함께 확인하기 위한 경로입니다. 기관 링크 자체를 이 글의 의학적 검수 근거로 표시하지 않습니다.</p><ul className="list-disc pl-5">{sources.map(source => <li key={source.url}><a className="underline break-words" href={source.url} rel="noopener noreferrer" target="_blank">{source.label}</a></li>)}</ul></section>
    <p>상태가 급격히 나빠지거나 응급상황이 의심되면 약국 검색을 기다리지 말고 119 또는 의료기관에 도움을 요청하세요.</p>
    <Link className="inline-flex rounded-full bg-brand-700 text-white px-5 py-3 font-bold" href="/nearby" data-analytics-event="content_to_nearby_click" data-source-surface="consultation_guide" data-cta-placement="article_end">내 주변 약국 찾기</Link>
    <JsonLd id="consultation-faq" data={buildFAQSchema(faqs)} />
  </article>;
}
