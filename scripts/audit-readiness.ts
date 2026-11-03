import fs from 'node:fs';
import path from 'node:path';

// Offline inventory: never treats the checkout as evidence of public HTTP/DB state.
const out = path.resolve('docs/site-quality/2026-11-03');
fs.mkdirSync(out, {recursive:true});
function walk(dir: string): string[] {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
const quote = (value: unknown) => '"'+String(value ?? '').replace(/"/g,'""')+'"';
const csv = (name: string, rows: unknown[][]) => fs.writeFileSync(path.join(out,name), '\uFEFF'+rows.map(row => row.map(quote).join(',')).join('\n')+'\n');
const rows: unknown[][] = [['URL','페이지 유형','엔터티 ID','HTTP 상태','canonical','robots','sitemap 포함','주요 출처','콘텐츠 상태','광고 허용','중복 후보','권장 조치','판단 근거']];
const files = walk('src/app').filter(f => f.endsWith('/page.tsx'));
for (const file of files.sort()) {
  const source = fs.readFileSync(file,'utf8');
  const route = '/'+file.slice('src/app/'.length).replace(/\/page\.tsx$/,'').replace(/^page\.tsx$/,'');
  const dynamic = route.includes('[');
  const type = route.startsWith('/pharmacy')?'약국 상세':route.startsWith('/wiki')?'제품·위키':route.startsWith('/blog')?'블로그':route.startsWith('/guide')?'가이드':route.startsWith('/admin')?'관리자':route==='/'?'홈':'운영·지역';
  rows.push(['https://todaypharm.kr'+route,type,dynamic?'런타임 식별자 필요':'해당 없음','미검증: 운영 네트워크 403',source.match(/canonical:\s*["']([^"']+)/)?.[1] || '런타임 확인 필요',source.includes('index: false')?'코드 noindex 선언 확인 / 런타임 미검증':'런타임 확인 필요','공개 sitemap 접근 불가',file, dynamic?'운영 DB 본문 미확인':'로컬 코드 검사','기본 제외: 명시적 pageEligible과 serving flag 필요',route.startsWith('/blog/')?'본문·검색 의도 대조 필요':'없음으로 확정하지 않음','유지·검토', '로컬 소스 인벤토리 / 공개 상태의 증거 아님']);
}
const request=fs.readFileSync(path.join(out,'request.txt'),'utf8');
for (const url of new Set(request.match(/https:\/\/todaypharm\.kr\/[^\s\r\n]+/g) || [])) {
  const id=url.match(/(?:pharmacy\/|pharmacy-)([A-Z]\d+)/)?.[1] || url.split('/').at(-1);
  rows.push([url,url.includes('/blog/')?'블로그':url.includes('/pharmacy/')?'약국 상세':'제품 상세',id,'미검증: 프록시 CONNECT 403','운영 확인 필요','운영 확인 필요','사용자 감사 기준값 / 재확인 불가','요청서 재현 후보','DB 미확인','기본 제외',url.includes('pharmacy-')?'동일 HPID 상세와 비교':'개별 확인 필요','검수 대기','현재 DB·공개 본문 접근 불가']);
}
csv('url-inventory.csv',rows);
const riskRows:unknown[][]=[['파일','행','패턴','구분','권장 조치']];
const patterns:[string,RegExp][]=[['임신·수유·소아',/임신|수유|소아|영아/],['용량·금기·상호작용',/mg\/kg|[\d,]+\s*IU|금기|상호작용/],['전문가·통계 인용',/전문 약사|연구에 따르면|통계에 따르면|[0-9]+%/],['외부평가',/리뷰|참여자|평점/]];
for(const file of [...walk('src/app/blog'), 'src/lib/gemini-blog.ts'].filter(f=>f.endsWith('.tsx')||f.endsWith('.ts'))) {
 fs.readFileSync(file,'utf8').split('\n').forEach((line,i)=>{
  for(const [label,re] of patterns) if(re.test(line)) riskRows.push([file,i+1,label,'자동 탐지 후보: 오류 확정 아님','원문·제품 허가사항·검수자 기록 대조']);
 });
}
csv('review-candidates.csv',riskRows);
const duplicates:unknown[][]=[['원본 URL','엔터티 ID','대체 후보','판정','보존할 정보','실행 조건']];
for(const row of rows.slice(1)) {
 const url=String(row[0]); const id=url.match(/\/blog\/pharmacy-([A-Z]\d+)/)?.[1];
 if(id) duplicates.push([url,id,'https://todaypharm.kr/pharmacy/'+id,'검수 대기 / 301 미적용','고유 방문 정보·출처·게시 이력·유입 의도: 본문 접근 후 대조','목적지 대체성·정상 HTTP·원문 보존 확인 및 승인']);
}
// Local campaign entries are plans, not proof of published URLs.
for(const file of fs.readdirSync('content').filter(f=>/^blog-campaign.*\.json$/.test(f))) {
 const value=JSON.parse(fs.readFileSync(path.join('content',file),'utf8'));
 const entries=Array.isArray(value)?value:[];
 for(const item of entries) {
  const slug=String(item.slug||''); const id=slug.match(/^pharmacy-([A-Z]\d+)$/)?.[1];
  if(id) duplicates.push(['https://todaypharm.kr/blog/'+slug,id,'https://todaypharm.kr/pharmacy/'+id,'로컬 계획 후보 / 공개 미확인','원문 비교 전 통합 정보 미확정',file+'; DB와 성과 자료 대조 필요']);
 }
}
csv('duplicate-decisions.csv',duplicates);
console.log(JSON.stringify({scope:'offline checkout; no live HTTP/DB claims',routeRows:rows.length-1,riskCandidates:riskRows.length-1,duplicateCandidates:duplicates.length-1}));
