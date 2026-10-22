/* CITY SIGNAL / static preview interactions only. No network, geolocation, advertising or medical data services. */
(()=>{
  'use strict';
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const toast=$('[data-toast]'); let toastTimeout;
  function notify(msg){ if(!toast)return;toast.textContent=msg;toast.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{toast.hidden=true;},4300); }
  const toggle=$('[data-menu-toggle]');const nav=$('[data-primary-nav]');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.getAttribute('data-open')==='true';nav.setAttribute('data-open',String(!open));toggle.setAttribute('aria-expanded',String(!open));});}
  $$('[data-demo-search]').forEach(form=>{form.addEventListener('submit',e=>{e.preventDefault();const q=$('input',form)?.value.trim()||''; const target=form.getAttribute('data-target')||'pages/nearby.html'; location.href=target+(q?'?q='+encodeURIComponent(q):'');});});
  const query=new URLSearchParams(location.search).get('q');
  if(query){$$('[data-query-label]').forEach(el=>el.textContent='입력한 검색어: '+query+' (디자인 시안 — 실제 검색 결과가 아닙니다)');}
  $$('[data-demo-action]').forEach(button=>button.addEventListener('click',()=>notify(button.getAttribute('data-demo-action')||'디자인 목업입니다. 실제 서비스는 연결되지 않았습니다.')));
  $$('[data-tab-group]').forEach(group=>{
    const name=group.dataset.tabGroup, buttons=$$('[data-tab]',group), target=$(`[data-tab-target="${name}"]`);
    if(!target)return;
    buttons.forEach(b=>b.addEventListener('click',()=>{
      const v=b.dataset.tab;
      buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      $$('[data-category]',target).forEach(card=>{card.hidden=v!=='all'&&card.dataset.category!==v;});
    }));
  });
  const list=$('[data-directory-list]');
  if(list){
    $$('[data-radius]').forEach(b=>b.addEventListener('click',()=>{const r=Number(b.dataset.radius);$$('[data-radius]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$$('[data-sample-distance]',list).forEach(x=>{x.hidden=Number(x.dataset.sampleDistance)>r;});}));
    $$('[data-sort]').forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.sort;$$('[data-sort]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const items=$$('[data-sample-distance]',list);items.sort((a,b)=>Number(a.dataset[mode==='close'?'sampleClose':'sampleDistance'])-Number(b.dataset[mode==='close'?'sampleClose':'sampleDistance']));items.forEach(x=>list.appendChild(x));}));
    const defaultRadius=$('[data-radius][aria-pressed="true"]');
    if(defaultRadius) defaultRadius.click();
  }
  $$('[data-demo-contact]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();notify('디자인 시안: 문의는 전송되지 않았습니다. 실제 사이트에서만 운영합니다.');}));
  $$('[data-copy-demo]').forEach(btn=>btn.addEventListener('click',()=>notify('디자인 시안입니다. 실제 약국 데이터 연결 후 복사 기능을 구현합니다.')));
})();
