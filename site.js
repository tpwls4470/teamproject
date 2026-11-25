'use strict';
(() => {
  const data = window.SITE_DATA;
  const home = document.querySelector('#home-view');
  const view = document.querySelector('#page-view');
  const nav = document.querySelector('#main-nav');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const external = (href, label, cls = 'button') => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span><span class="sr-only">새 창</span></a>`;
  const internal = (route, title, cls = '') => `<a class="${cls}" href="#/${route}">${esc(title)}</a>`;
  const footerItems = {
    cert: [['guide','예술활동증명'],['apply','신청하기 · 재신청하기'],['status','신청내역 확인'],['faq','자주 묻는 질문'],['statistics','예술활동증명 통계']],
    welfare: [['prep','예술활동준비금지원'],['artist','예술로(路) 사업'],['insurance','산재보험'],['pension','국민연금 보험료 지원'],['pass','예술인패스'],['loan','예술인생활안정자금(융자)']],
    rights: [['legal','법률상담 · 컨설팅'],['psy','예술인 심리상담'],['sinmungo','예술인신문고'],['harass','성폭력 피해지원'],['contract','표준계약서'],['union','예술인 조합']],
    notice: [['list','공지사항'],['faq','자주 묻는 질문'],['inquiry','1:1 문의']]
  };
  document.querySelector('#footer-menus').innerHTML=data.groups.slice(0,4).map(group=>`<section><h2>${group.title}</h2><ul>${footerItems[group.id].map(([id,title])=>{const item=group.items.find(i=>i.id===id);return `<li>${item.kind==='external'?external(item.source,title,'footer-menu-link'):internal(item.route,title,'footer-menu-link')}</li>`;}).join('')}</ul></section>`).join('');
  document.querySelector('.back-to-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  document.querySelector('.footer-brand').addEventListener('click',event=>{if(location.hash==='#/'||!location.hash){event.preventDefault();window.scrollTo({top:0,behavior:'instant'});}});
  let demoSignedIn = false;
  try { demoSignedIn = sessionStorage.getItem('teamproject-demo-session') === 'active'; } catch {}
  const applicationDraft = { step: 0, kind: '일반', field: '', role: '창작', title: '', date: '', place: '', note: '', filenames: [], complete: false };
  function setDemoSession(active) {
    demoSignedIn=active;
    try { if(active)sessionStorage.setItem('teamproject-demo-session','active');else sessionStorage.removeItem('teamproject-demo-session'); } catch {}
    const loginLink=document.querySelector('.utility [data-link="login"]');
    if(loginLink)loginLink.textContent=active?'로그아웃':'로그인';
  }
  setDemoSession(demoSignedIn);
  document.querySelector('.utility [data-link="login"]').addEventListener('click',event=>{
    if(!demoSignedIn)return;
    event.preventDefault();setDemoSession(false);applicationDraft.step=0;applicationDraft.complete=false;
    location.hash='/';
  });
  const norm = url => { try { const u = new URL(url); return u.origin.replace('https://kawfartist.kr','https://www.kawfartist.kr') + u.pathname + u.search; } catch { return url; } };
  const sourceRoutes = new Map(Object.values(data.pages).map(p => [norm(p.source), p.route]));
  const summaries = {
    'cert/guide':'예술활동증명의 의미부터 신청 대상까지, 시작에 필요한 내용을 확인하세요.',
    'cert/method':'활동 방식에 맞는 신청 방법과 준비 자료를 확인하세요.',
    'cert/process':'신청부터 결과 안내까지, 진행 순서를 한눈에 확인하세요.',
    'cert/criteria':'분야별 인정 기준과 제출자료 예시를 확인하세요.',
    'cert/videos':'제도 이해부터 온라인 신청까지, 공식 영상으로 차근차근 알아보세요.',
    'cert/apply':'신청 종류와 준비 자료를 확인한 뒤 공식 서비스에서 신청하세요.',
    'cert/status':'진행 상태와 보완 요청을 확인하고, 완료된 확인서를 출력하세요.',
    'welfare/prep':'창작을 이어갈 수 있도록, 필요한 지원을 안내합니다.',
    'welfare/artist':'예술인과 기업·기관이 예술로 함께하는 협업 사업입니다.',
    'welfare/insurance':'작업의 순간에도, 무대의 순간에도 안전한 창작환경을 준비하세요.',
    'welfare/pension':'국민연금 보험료 지원 공고와 신청 정보를 확인하세요.',
    'welfare/pass':'공연·전시 관람 등 예술인을 위한 할인 혜택을 확인하세요.',
    'welfare/loan':'예술인의 생활 안정을 위한 융자 정보를 확인하세요.',
    'rights/legal':'계약·저작권 등 예술활동 중 필요한 법률상담을 안내합니다.',
    'rights/psy':'지속적인 예술활동을 위해 마음건강을 돌보는 상담을 안내합니다.',
    'rights/sinmungo':'예술활동 중 권리침해를 겪었다면, 상담·신고 절차를 확인하세요.',
    'rights/harass':'안전한 예술환경을 위한 피해지원과 상담 경로를 안내합니다.',
    'rights/contract':'분야별 표준계약서를 확인하고 공정한 계약에 활용하세요.',
    'rights/union':'예술인의 지속적인 활동을 위한 조합 정보를 확인하세요.',
    'rights/system':'예술인의 권리보호를 위한 상담과 신고 서비스를 연결합니다.',
    'notice/list':'예술활동증명과 복지·권익보호 서비스의 공고와 안내를 확인하세요.',
    'notice/faq':'자주 묻는 질문을 분류와 검색으로 빠르게 찾아보세요.',
    'cert/faq':'예술활동증명을 준비하며 궁금한 내용을 확인하세요.',
    'notice/inquiry':'신청·자료 준비·시스템 이용 중 궁금한 점을 문의하세요.'
  };

  nav.innerHTML = data.groups.slice(0, 5).map(group => `<div class="nav-group"><div class="nav-label"><a href="#/${group.items[0].route}" aria-haspopup="true" aria-expanded="false" aria-controls="dropdown-${group.id}">${group.title}</a></div><div id="dropdown-${group.id}" class="nav-dropdown">${group.items.map(i => internal(i.route, i.title)).join('')}</div></div>`).join('');
  const hideDropdowns = () => nav.querySelectorAll('.nav-group').forEach(el => {
    el.classList.remove('expanded');el.querySelector('.nav-label>a').setAttribute('aria-expanded','false');
  });
  nav.querySelectorAll('.nav-label>a').forEach(link => {
    const group=link.closest('.nav-group');
    link.addEventListener('click',event=>{
      if (!matchMedia('(max-width: 900px)').matches) return;
      event.preventDefault();const wasOpen=group.classList.contains('expanded');hideDropdowns();
      if(!wasOpen){group.classList.add('expanded');link.setAttribute('aria-expanded','true');}
    });
    link.addEventListener('keydown',event=>{
      if(event.key==='ArrowDown'){event.preventDefault();group.classList.add('expanded');link.setAttribute('aria-expanded','true');group.querySelector('.nav-dropdown a').focus();}
    });
    group.addEventListener('pointerenter',()=>link.setAttribute('aria-expanded','true'));
    group.addEventListener('pointerleave',()=>{if(!group.contains(document.activeElement))link.setAttribute('aria-expanded','false');});
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { hideDropdowns(); document.activeElement?.blur(); } });
  document.addEventListener('click', event => { if (!nav.contains(event.target)) hideDropdowns(); });
  document.querySelector('.brand').addEventListener('click',event=>{
    event.preventDefault();hideDropdowns();
    if(location.hash==='#/'||!location.hash){window.scrollTo({top:0,behavior:'instant'});}
    else location.hash='/';
  });
  document.querySelector('.skip-link').href = '#main';

  function faqDetails(faq, compact = false) {
    let answer = faq.answer;
    if (compact) {
      if (faq.question.includes('소요되는 기간')) answer = '공식 FAQ는 접수 후 약 15~20주 이상을 안내합니다. 신청량에 따라 달라질 수 있으니 최신 안내를 확인하세요.';
      else if (faq.question.includes('재신청 날짜')) answer = '공식 사이트에 로그인한 뒤 예술활동증명 > 신청내역에서 재신청 가능일을 확인할 수 있습니다.';
      else if (faq.question.includes('증명서 발급')) answer = '신청한 계정으로 로그인한 뒤 신청내역 확인 > 출력에서 확인서를 발급하거나 PDF로 저장할 수 있습니다.';
    }
    return `<details class="faq-item"><summary><span class="faq-question">${esc(faq.question)}</span><span class="faq-plus" aria-hidden="true">+</span></summary><div class="faq-answer"><p>${esc(answer)}</p>${compact ? internal('notice/faq','질문 더 보기','inline-link') : external(faq.source,'공식 FAQ 원문','inline-link')}</div></details>`;
  }
  document.querySelector('#home-notices').innerHTML = data.notices.slice(0,4).map(n => `<a class="news-row" href="#/notice/list?post=${n.id}"><span class="notice-name">${esc(n.title)}</span><time datetime="${n.date}">${n.date.replaceAll('-','.').slice(2)}</time><span aria-hidden="true">→</span></a>`).join('');
  const preferred = ['소요되는 기간','재신청 날짜','증명서 발급'];
  document.querySelector('#home-faq').innerHTML = preferred.map(word => data.faqs.find(f => f.question.includes(word))).filter(Boolean).map(f => faqDetails(f,true)).join('');

  function breadcrumb(page) {
    return `<nav class="breadcrumbs" aria-label="현재 위치"><a href="#/">홈</a><span aria-hidden="true">/</span>${internal(data.groups.find(g=>g.id===page.group).items[0].route,page.groupTitle)}<span aria-hidden="true">/</span><span aria-current="page">${esc(page.title)}</span></nav>`;
  }
  function shell(page, body) {
    const group = data.groups.find(g => g.id === page.group);
    const certTabs = ['guide','method','process','criteria','videos'];
    const tabs = page.group==='cert' && certTabs.includes(page.id) ? `<nav class="page-tabs" aria-label="예술활동증명 안내 분류">${group.items.filter(i=>certTabs.includes(i.id)).map(i=>`<a href="#/${i.route}" ${i.id===page.id?'aria-current="page"':''}>${esc(i.title)}</a>`).join('')}</nav>` : '';
    return `${breadcrumb(page)}<div class="page-layout"><aside class="side-menu"><h2>${group.title}</h2><nav aria-label="${group.title} 하위 메뉴">${group.items.map(i=>`<a href="#/${i.route}" ${i.route===page.route?'aria-current="page"':''}>${esc(i.title)}<span aria-hidden="true">${i.kind==='external'?'↗':'›'}</span></a>`).join('')}</nav><a class="side-help" href="#/guide/first">처음 방문하셨나요?<span>신청 준비부터 확인까지</span></a></aside><article class="page-article"><header class="page-heading"><span class="page-eyebrow">${group.title}</span><h1 tabindex="-1">${esc(page.title)}</h1><p>${esc(summaries[page.route] || '필요한 정보와 이용 절차를 확인하세요.')}</p></header>${tabs}<div class="page-content">${body}</div><div class="source-note"><span>공식 안내 확인 · ${data.checkedAt.replaceAll('-','.')}<br>시연 화면의 정보는 확인 시점 기준이며, 신청 전 최신 원문을 확인해 주세요.</span>${external(page.source,'공식 안내 원문','inline-link')}</div><div class="page-bottom">${internal('guide/sitemap','전체 메뉴','button')}${internal('','홈으로','button')}</div></article></div>`;
  }
  function sourceBody(page) {
    const box = document.createElement('div');box.innerHTML = page.body || '';
    box.querySelectorAll('a[href]').forEach(a => {
      const route = sourceRoutes.get(norm(a.href));
      if (route) { a.href=`#/${route}`;a.removeAttribute('target');a.removeAttribute('rel'); }
      else if (/^https?:/.test(a.href)) { a.target='_blank';a.rel='noopener noreferrer'; }
    });
    box.querySelectorAll('img').forEach(img => { if (!img.alt) img.alt='공식 안내 자료'; });
    return `<div class="prose">${box.innerHTML}</div>`;
  }
  const actionCards = items => `<div class="action-cards">${items.map(([title,text,href])=>`<a href="${href}"><h3>${title}</h3><p>${text}</p></a>`).join('')}</div>`;
  function bodyFor(page, query) {
    if (page.route==='guide/login') return loginPage(query);
    if (page.route==='cert/guide') return guidePage();
    if (page.route==='cert/method') return methodPage();
    if (page.route==='notice/list') return noticePage(query);
    if (page.kind==='faq') return faqPage();
    if (page.route==='guide/sitemap') return `<div class="sitemap-grid">${data.groups.map(g=>`<section><h2>${g.title}</h2>${g.items.map(i=>internal(i.route,i.title)).join('')}</section>`).join('')}</div>`;
    if (page.route==='guide/first') return `<div class="intro-card"><span class="page-eyebrow">처음 시작하는 예술인에게</span><h2>준비부터 신청까지,<br>차근차근 시작하세요.</h2><p>신청 기준과 제출자료를 먼저 확인하면 준비가 수월해집니다.</p></div>${actionCards([['회원가입 · 로그인','공식 계정으로 서비스를 이용하세요.','#/guide/join'],['신청 기준 확인','내 분야의 기준과 제출자료를 확인하세요.','#/cert/criteria'],['예술활동증명 신청','신규·재신청 안내를 확인하세요.','#/cert/apply'],['결과 · 확인서 확인','진행 상태와 보완 요청을 확인하세요.','#/cert/status']])}`;
    if (page.route==='cert/process') return `<div class="process-steps">${[['신청완료','기본 정보와 예술활동 자료를 제출합니다.'],['접수확인','재단이 신청서를 접수합니다.'],['행정검토','분야와 신청 방법에 맞는 자료를 확인합니다.'],['위원회 검토','전문가 심의를 진행합니다.'],['결과안내','신청내역에서 결과를 확인합니다.']].map(([title,text],i)=>`<div><span class="step-index">${String(i+1).padStart(2,'0')}</span><div><h3>${title}</h3><p>${text}</p></div></div>`).join('')}</div><div class="info-callout"><h3>심의 기간은 여유 있게 확인해 주세요.</h3><p>제도 안내와 FAQ의 소요 기간 표기가 다를 수 있습니다. 공식 FAQ는 약 15~20주 이상을 안내하며 신청량에 따라 달라질 수 있습니다.</p>${internal('notice/faq','관련 FAQ 확인','inline-link')}</div>${actionCards([['신청하기','준비가 끝났다면 신청 안내를 확인하세요.','#/cert/apply'],['신청내역 확인','나의 진행 단계와 보완 요청을 확인하세요.','#/cert/status']])}`;
    if (page.route==='cert/apply') return applicationPage();
    if (page.route==='cert/criteria') return criteriaPage();
    if (page.route==='cert/videos') return videoPage();
    if (page.kind==='auth') {
      const descriptions = {
        'cert/status':['내 신청 상태를 한곳에서','접수·검토·결과와 보완 요청을 확인하고 완료된 확인서를 출력할 수 있습니다.'],
        'guide/login':['공식 계정으로 로그인하세요','기존 계정과 본인인증은 공식 예술인경력정보시스템에서 이용할 수 있습니다.'],
        'guide/join':['예술활동의 첫걸음을 시작하세요','공식 사이트에서 약관 확인과 본인인증을 거쳐 회원가입을 진행하세요.'],
        'notice/inquiry':['궁금한 내용을 문의하세요','신청·자료 준비·시스템 이용 등 문의 유형을 확인한 뒤 공식 사이트에서 문의할 수 있습니다.']
      };
      const [title,desc]=descriptions[page.route]||['나의 정보를 안전하게 확인하세요','공식 사이트에 로그인한 뒤 해당 메뉴에서 개인 정보를 확인하고 관리할 수 있습니다.'];
      return `<div class="account-gate"><svg class="icon" aria-hidden="true"><use href="./assets/icons.svg#document"/></svg><h2>${title}</h2><p>${desc}</p><div class="page-actions">${external(page.source,`${page.title} 이용하기`,'button primary')}</div><span class="meta">로그인이 필요한 공식 서비스로 이동합니다.</span></div>${page.route==='cert/status'?actionCards([['진행 단계가 궁금해요','접수부터 결과 안내까지 확인하세요.','#/cert/process'],['확인서 발급이 궁금해요','공식 FAQ의 발급 방법을 확인하세요.','#/notice/faq']]):internal('notice/faq','자주 묻는 질문 먼저 보기','inline-link')}`;
    }
    if (page.kind==='external') return `<div class="external-service"><span class="service-symbol" aria-hidden="true">↗</span><span class="page-eyebrow">관련 서비스 연결</span><h2>${page.title}</h2><p>${esc(summaries[page.route]||'해당 서비스를 운영하는 공식 사이트에서 자세한 정보를 확인할 수 있습니다.')}</p>${external(page.source,`${page.title} 사이트로 이동`,'button primary')}<span class="meta">외부 사이트가 새 창으로 열립니다.</span></div>`;
    if (page.kind==='service') return `<div class="intro-card"><h2>예술활동 중 법률적 어려움,<br>상담으로 함께 해결하세요.</h2><p>계약, 저작권 등 창작활동과 관련된 법률상담·컨설팅을 안내합니다.</p></div><section class="content-block"><h2>이용 안내</h2><ul class="check-list"><li>계약·저작권 등 문의할 내용을 정리해 주세요.</li><li>관련 자료와 상담 내용을 준비해 주세요.</li><li>공식 상담 게시판에서 공개·비공개 여부와 안내를 확인하세요.</li></ul>${external(page.source,'공식 법률상담 게시판 보기','button primary')}</section>`;
    return sourceBody(page) || `<div class="info-callout"><h2>${page.title}</h2><p>정확한 이용 안내는 공식 페이지에서 확인해 주세요.</p>${external(page.source,'공식 안내 확인','button primary')}</div>`;
  }
  function topic(title, body, id='') {
    return `<section class="reading-topic" ${id?`id="${id}"`:''}><h2>${title}</h2><div class="topic-body">${body}</div></section>`;
  }
  function guidePage() {
    const files=document.createElement('div');files.innerHTML=data.pages['cert/guide'].body;
    const lawLinks=[...files.querySelectorAll('a[href$=".pdf"]')].map(a=>external(a.href,a.textContent.trim()||'관련 법령 PDF','document-link')).join('');
    return `<div class="reading-topics">${topic('예술활동증명이란?',`<p>한국예술인복지재단의 예술인 복지사업 참여를 위한 기본 절차로, 직업으로 예술활동을 하고 있음을 확인하는 제도입니다.</p><p class="reading-note">예술인으로 승인하거나 예술인의 자격을 증명하는 제도는 아닙니다.</p>`)}${topic('신청 안내',`<dl class="reading-facts"><div><dt>신청 시기</dt><dd>연중 상시 신청할 수 있습니다.</dd></div><div><dt>신청 방법</dt><dd>온라인 신청 또는 사전 예약 후 방문 신청이 가능합니다.<br>온라인과 대면으로 같은 내용을 중복 신청할 수 없습니다.</dd></div><div><dt>방문 예약</dt><dd><a href="tel:0236680301">02-3668-0301</a> · ${external('https://www.kawf.kr/reservation/reserv02_form.do','방문 예약 안내','inline-link')}</dd></div><div><dt>진행 기간</dt><dd>신청량에 따라 달라질 수 있습니다. 제도안내와 FAQ의 기간 표기가 다르므로 최신 공지와 FAQ를 확인해 주세요.<br>${internal('notice/faq','심의 기간 관련 FAQ','inline-link')}</dd></div></dl>`)}${topic('신청 대상',`<p>15개 예술분야에서 창작·실연·기술지원·기획으로 활동하는 직업 예술인이 신청할 수 있습니다.</p><div class="field-tags">${data.criteria.fields.map(f=>`<span>${esc(f.title)}</span>`).join('')}</div><p>신청 분야는 자신의 직업명이 아니라 제출할 작품과 활동 자료를 기준으로 확인하세요.</p><details class="reading-details"><summary>국적과 체류자격 관련 안내<span aria-hidden="true">+</span></summary><p>원칙적으로 대한민국 국적의 예술인을 대상으로 합니다. 국내 체류 외국인의 신청 가능 여부와 제출서류는 체류자격별 운영지침을 확인해 주세요.</p>${external(data.pages['cert/guide'].source,'체류자격별 원문 확인','inline-link')}</details>`)}${topic('완료 후 이용',`<ul class="reading-list"><li>한국예술인복지재단의 복지사업 참여를 위한 기본 절차로 활용됩니다.</li><li>사업별 신청 대상과 참여 요건은 각 사업 공고에서 별도로 확인해야 합니다.</li><li>일반·신진·특례 등 증명 종류에 따라 참여할 수 있는 사업이 다를 수 있습니다.</li></ul>${internal('welfare/prep','복지지원 안내 보기','inline-link')}`)}${topic('관련 법령과 지침',`<p>신청 전에 관련 법령과 운영지침을 확인해 주세요.</p><div class="document-links">${lawLinks}</div>`)}<div class="page-actions">${internal('cert/apply','예술활동증명 신청하기','button primary')}${internal('cert/method','신청방법 알아보기','button')}</div></div>`;
  }
  function methodPage() {
    const rows=[
      ['예술활동 수입','기간 내 예술활동 수입이 있는 예술인','최근 1년 또는 5년','1년 또는 5년'],
      ['공개 발표된 예술활동','작품을 공개 발표한 예술인','최근 5년','5년'],
      ['원로예술인','만 70세 이상으로 오랫동안 활동한 예술인','제한 없음','면제'],
      ['경력단절 예술인','질병·육아·임신·출산·가족 돌봄·병역 등으로 활동을 쉬었던 예술인','경력단절 기간 전후','5년'],
      ['특수한 활동 방식','작품 준비나 발표에 오랜 기간이 걸리는 예술인','제한 없음','5년'],
      ['무형유산 보유자·전승교육사','국가유산청 또는 시·도가 인정한 보유자·전승교육사','해당 기준 확인','면제'],
      ['무형유산 이수자','국가유산청 또는 시·도가 인정한 이수자','최근 5년','5년']
    ];
    return `<div class="reading-topics"><p class="reading-lead">신청 종류에 따라 인정하는 활동과 실적 산정 기간, 유효기간이 다릅니다. 내 활동에 맞는 방법을 확인해 주세요.</p>${topic('신청 종류 한눈에 보기',`<dl class="reading-facts"><div><dt>일반</dt><dd>공개 발표 실적 또는 예술활동 수입 등이 있는 예술인</dd></div><div><dt>신진</dt><dd>예술활동증명을 완료한 이력이 없는 예술인</dd></div><div><dt>특례</dt><dd>특정 사업 참여를 위해 간소화된 절차로 운영하는 예술활동증명</dd></div></dl>`)}${topic('일반 예술활동증명',`<p>활동 방식에 맞는 실적과 증빙자료를 준비하세요.</p><div class="reading-table-wrap"><table class="reading-table"><caption class="sr-only">일반 예술활동증명 신청 방법별 대상과 기간</caption><thead><tr><th scope="col">신청 방법</th><th scope="col">대상</th><th scope="col">실적 산정 기간</th><th scope="col">유효기간</th></tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${cell}</th>`:`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)}${topic('신진예술인 예술활동증명',`<dl class="reading-facts"><div><dt>신청 대상</dt><dd>예술활동증명을 한 번도 완료한 적이 없는 예술인</dd></div><div><dt>실적 산정 기간</dt><dd>최근 2년</dd></div><div><dt>유효기간</dt><dd>2년</dd></div></dl>`)}${topic('예술활동증명 특례',`<dl class="reading-facts"><div><dt>사회보험료 지원</dt><dd>국민연금 보험료 지원사업 참여를 위한 특례입니다. 해당 사업의 운영 기간과 요건을 확인하세요.</dd></div><div><dt>산재보험 가입</dt><dd>예술인 산재보험 가입을 위한 특례입니다. 사업 참여 기간에 임시로 유효합니다.</dd></div></dl><p class="reading-note">특례를 완료한 뒤 다른 복지사업에 참여하려면 별도의 일반 예술활동증명 절차가 필요할 수 있습니다.</p>`)}${topic('제출자료 준비',`<p>신청 방법과 분야에 따라 최소 기준과 필수자료가 다릅니다. 세부 기준과 자료 예시는 분야별 안내에서 확인하세요.</p>${internal('cert/criteria','분야별 기준과 제출자료 보기','inline-link')}`)}<div class="page-actions">${internal('cert/apply','로그인하고 신청하기','button primary')}${internal('cert/process','신청절차 알아보기','button')}</div></div>`;
  }
  function safeNext(query) {
    const next=query.get('next')||'cert/apply';
    return Object.hasOwn(data.pages,next) && next!=='guide/login' ? next : 'cert/apply';
  }
  function loginShell(page, body) {
    return `${breadcrumb(page)}<article class="login-layout"><header class="login-heading"><h1 tabindex="-1">로그인</h1><p>로그인 후 예술활동증명을 신청할 수 있습니다.</p></header>${body}</article>`;
  }
  function loginPage(query) {
    return `<form class="login-form" id="login-form" novalidate><div class="form-field"><label for="login-id">아이디</label><input id="login-id" name="demo-username" autocomplete="off" spellcheck="false" autocapitalize="none" placeholder="아이디를 입력해 주세요" required maxlength="60"></div><div class="form-field"><label for="login-password">비밀번호</label><div class="password-field"><input id="login-password" name="demo-password" type="password" autocomplete="off" placeholder="비밀번호를 입력해 주세요" required maxlength="100"><button type="button" id="password-visibility" aria-label="비밀번호 보기" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div><p class="form-error" id="login-error" role="alert"></p><button class="button primary login-submit" type="submit">로그인</button><div class="account-links">${external('https://www.kawfartist.kr/hkor/join/member/findId.do','아이디 찾기','account-link')}${external('https://www.kawfartist.kr/hkor/join/member/findPw.do','비밀번호 찾기','account-link')}${internal('guide/join','회원가입','account-link')}</div></form><aside class="demo-login"><h2>디자인 시안 체험</h2><p>시연 계정 <strong>artist</strong> / <strong>demo1234!</strong><br>실제 계정이나 비밀번호를 입력하지 마세요.</p><button type="button" id="demo-login-button" class="button">시연 계정으로 바로 체험하기</button></aside><div class="official-login">${external(data.pages['guide/login'].source,'실제 서비스 로그인','inline-link')}<p>실제 인증과 접수는 공식 사이트에서 진행됩니다.</p></div>`;
  }
  function bindLogin(query) {
    const form=view.querySelector('#login-form');
    const id=view.querySelector('#login-id');const password=view.querySelector('#login-password');const error=view.querySelector('#login-error');
    const finish=()=>{password.value='';setDemoSession(true);location.hash='/'+safeNext(query);};
    form.addEventListener('submit',event=>{
      event.preventDefault();error.textContent='';
      if(!id.value.trim()){error.textContent='아이디를 입력해 주세요.';id.focus();return;}
      if(!password.value){error.textContent='비밀번호를 입력해 주세요.';password.focus();return;}
      if(id.value.trim()!=='artist'||password.value!=='demo1234!'){error.textContent='디자인 시안에서는 안내된 시연 계정으로 로그인해 주세요.';return;}
      finish();
    });
    view.querySelector('#demo-login-button').addEventListener('click',finish);
    view.querySelector('#password-visibility').addEventListener('click',event=>{
      const button=event.currentTarget;const show=password.type==='password';password.type=show?'text':'password';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',show?'비밀번호 숨기기':'비밀번호 보기');
    });
  }
  function applicationPage() {
    if(applicationDraft.complete)return `<div class="application-complete"><span class="page-eyebrow">디자인 시안</span><h2>신청 흐름을 확인했습니다.</h2><p>입력한 내용은 전송되지 않았으며, 실제로 접수된 신청은 없습니다.</p><div class="page-actions">${external(data.pages['cert/apply'].source,'공식 사이트에서 실제 신청하기','button primary')}<button type="button" class="button" id="restart-application">시안 다시 체험하기</button></div></div>`;
    const steps=['신청 정보','활동 자료','내용 확인'];let body='';
    if(applicationDraft.step===0)body=`<fieldset class="application-kinds"><legend>신청 종류</legend>${[['일반','공개 발표 실적·수입 등으로 신청'],['신진','처음 예술활동증명을 받는 경우'],['특례','지정 사업 참여를 위한 증명']].map(([kind,text])=>`<label><input type="radio" name="kind" value="${kind}" ${kind===applicationDraft.kind?'checked':''}><span><strong>${kind} 예술활동증명</strong><small>${text}</small></span></label>`).join('')}</fieldset><div class="form-row"><div class="form-field"><label for="application-field">활동 분야</label><select id="application-field" required><option value="">분야를 선택해 주세요</option>${data.criteria.fields.map(f=>`<option ${applicationDraft.field===f.title?'selected':''}>${esc(f.title)}</option>`).join('')}</select></div><div class="form-field"><label for="application-role">활동 역할</label><select id="application-role">${['창작','실연','기술지원','기획'].map(role=>`<option ${applicationDraft.role===role?'selected':''}>${role}</option>`).join('')}</select></div></div>`;
    if(applicationDraft.step===1)body=`<div class="form-field"><label for="activity-title">예술활동명</label><input id="activity-title" placeholder="예: 개인전 또는 공연명" value="${esc(applicationDraft.title)}" maxlength="120" required></div><div class="form-row"><div class="form-field"><label for="activity-date">활동일</label><input id="activity-date" type="date" value="${esc(applicationDraft.date)}" required></div><div class="form-field"><label for="activity-place">발표 장소 · 매체</label><input id="activity-place" placeholder="예: 전시장, 공연장, 발표 매체" value="${esc(applicationDraft.place)}" maxlength="120" required></div></div><div class="form-field"><label for="activity-note">활동 내용 <span class="optional">선택</span></label><textarea id="activity-note" rows="4" maxlength="1000" placeholder="활동 내용을 간단하게 입력해 주세요">${esc(applicationDraft.note)}</textarea></div><div class="reading-note"><strong>증빙자료 첨부 안내</strong><p>분야별 필수자료는 실제 공식 신청 화면에서 첨부합니다. 이 시안에서는 파일을 수집하지 않습니다.</p>${internal('cert/criteria','필수자료 기준 확인','inline-link')}</div>`;
    if(applicationDraft.step===2)body=`<h2 class="application-review-title">입력한 내용을 확인해 주세요</h2><dl class="reading-facts"><div><dt>신청 종류</dt><dd>${esc(applicationDraft.kind)} 예술활동증명</dd></div><div><dt>분야 · 역할</dt><dd>${esc(applicationDraft.field)} · ${esc(applicationDraft.role)}</dd></div><div><dt>예술활동명</dt><dd>${esc(applicationDraft.title)}</dd></div><div><dt>활동일</dt><dd>${esc(applicationDraft.date)}</dd></div><div><dt>발표 장소 · 매체</dt><dd>${esc(applicationDraft.place)}</dd></div>${applicationDraft.note?`<div><dt>활동 내용</dt><dd>${esc(applicationDraft.note)}</dd></div>`:''}</dl><p class="reading-note">아래 버튼은 시안 체험을 마칩니다. 실제 신청서는 제출되지 않습니다.</p>`;
    return `<div class="prototype-banner"><strong>신청 화면 시안</strong><span>실제 접수가 진행되지 않습니다. 예시 내용으로만 체험해 주세요.</span></div><ol class="application-progress" aria-label="신청 단계">${steps.map((label,i)=>`<li ${i===applicationDraft.step?'aria-current="step"':''}><span>${i+1}</span>${label}</li>`).join('')}</ol><form id="application-form" class="application-form">${body}<div class="form-actions">${applicationDraft.step?'<button type="button" id="application-back" class="button">이전</button>':''}<button type="submit" class="button primary">${applicationDraft.step===2?'시안 확인 완료':'다음'}</button></div></form>`;
  }
  function bindApplication() {
    const refresh=()=>{view.innerHTML=shell(data.pages['cert/apply'],applicationPage());bindApplication();view.querySelector('.page-heading h1')?.focus({preventScroll:true});const anchor=view.querySelector('.application-progress')||view.querySelector('.page-heading');window.scrollTo({top:Math.max(0,anchor.getBoundingClientRect().top+window.scrollY-32),behavior:'instant'});};
    const save=()=>{
      if(applicationDraft.step===0){applicationDraft.kind=view.querySelector('input[name="kind"]:checked').value;applicationDraft.field=view.querySelector('#application-field').value;applicationDraft.role=view.querySelector('#application-role').value;}
      if(applicationDraft.step===1){applicationDraft.title=view.querySelector('#activity-title').value.trim();applicationDraft.date=view.querySelector('#activity-date').value;applicationDraft.place=view.querySelector('#activity-place').value.trim();applicationDraft.note=view.querySelector('#activity-note').value.trim();}
    };
    view.querySelector('#application-form')?.addEventListener('submit',event=>{event.preventDefault();save();if(applicationDraft.step<2)applicationDraft.step+=1;else applicationDraft.complete=true;refresh();});
    view.querySelector('#application-back')?.addEventListener('click',()=>{save();applicationDraft.step-=1;refresh();});
    view.querySelector('#restart-application')?.addEventListener('click',()=>{applicationDraft.complete=false;applicationDraft.step=0;refresh();});
  }
  function criteriaPage() {
    return `<div class="intro-card"><h2>내 분야에 맞는 기준을<br>쉽게 찾아보세요.</h2><p>신청 종류와 분야를 선택하면 해당 기준과 필수자료를 확인할 수 있습니다.</p></div><div class="faq-categories" aria-label="신청 종류"><button type="button" data-criteria-type="general" aria-pressed="true">일반</button><button type="button" data-criteria-type="new" aria-pressed="false">신진</button><button type="button" data-criteria-type="other" aria-pressed="false">수입 · 기준 외 · 특례</button></div><div class="field-grid" id="criteria-fields" role="group" aria-label="예술 분야">${data.criteria.fields.map((f,i)=>`<button class="field-link" type="button" data-field="${i}" aria-pressed="${i===0}">${esc(f.title)}</button>`).join('')}</div><section id="criteria-panel" class="criteria-panel" aria-live="polite"></section><div class="page-actions">${external('https://micc.hkpalette.com/TYP?key=4ydU2LueIL942W%2F19po5bA%3D%3D','분야별 제출자료 예시 보기','button')}${internal('cert/apply','신청 안내 보기','button primary')}</div>`;
  }
  function videoPage() {
    const list=type=>data.videos.filter(v=>v.type===type).map(v=>`<a class="video-link-card" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer"><span class="video-link-play" aria-hidden="true">▶</span><span><strong>${esc(v.title.replace('[예술활동증명 안내] ','').replace('[예술활동증명 제출자료 안내] ',''))}</strong><small>한국예술인복지재단 공식 영상 · YouTube</small></span><span aria-hidden="true">↗</span><span class="sr-only">새 창</span></a>`).join('');
    return `<div class="intro-card"><h2>영상으로 먼저 이해하고,<br>차근차근 준비하세요.</h2><p>제도와 신청 방법, 분야별 제출자료까지 공식 영상으로 안내합니다.</p></div><section class="content-block"><h2>제도 · 신청 안내</h2><div class="video-link-grid">${list('guide')}</div></section><section class="content-block"><h2>분야별 제출자료 안내</h2><div class="video-link-grid">${list('field')}</div></section><div class="page-actions">${external('https://www.kawf.kr/files/ebook/index.html','예술활동증명 안내 E-BOOK','button')}${internal('cert/apply','신청 안내 보기','button primary')}</div>`;
  }
  function noticePage(query) {
    const post = data.notices.find(n => n.id === query.get('post'));
    if (post) return `<header class="post-heading"><span class="post-badge">공지</span><h2>${esc(post.title)}</h2><time datetime="${post.date}">등록일 ${post.date.replaceAll('-','.')}</time></header><div class="prose post-body">${post.body || '<p>자세한 내용은 원문에서 확인해 주세요.</p>'}</div>${post.attachments.length?`<section class="attachments"><h3>첨부파일</h3>${post.attachments.map((a,i)=>external(a.url,`첨부파일 ${i+1} 다운로드`,'attachment-link')).join('')}</section>`:''}<div class="page-actions">${internal('notice/list','목록으로','button')}${external(post.source,'공지 원문 보기','button')}</div>`;
    return `<form class="search-form" id="notice-search" role="search"><label class="sr-only" for="notice-query">공지사항 검색</label><input id="notice-query" type="search" placeholder="찾으시는 공지 제목을 입력하세요"><button class="search-button" type="submit">검색</button></form><div class="board-meta"><p>확인된 공지 <strong id="notice-count">${data.notices.length}</strong>건</p><span class="meta">등록일 기준 · ${data.checkedAt.replaceAll('-','.') } 확인</span></div><div id="notice-results" class="notice-list">${noticeRows(data.notices)}</div><div class="info-callout"><p>현재 확인한 공지를 정리했습니다. 이전 공지와 전체 게시물은 공식 게시판에서 확인할 수 있습니다.</p>${external(data.pages['notice/list'].source,'전체 공지 원문 보기','inline-link')}</div>`;
  }
  function noticeRows(rows) { return rows.length ? rows.map(n=>`<a class="board-row" href="#/notice/list?post=${n.id}"><span class="post-badge">공지</span><span class="board-title">${esc(n.title)}</span><time datetime="${n.date}">${n.date.replaceAll('-','.')}</time><span aria-hidden="true">→</span></a>`).join('') : '<p class="empty-state">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>'; }
  function faqPage() { return `<div class="faq-categories" role="group" aria-label="질문 분류">${['전체','사업소개','사업신청','사업내용','이용문의'].map((c,i)=>`<button type="button" data-category="${c}" aria-pressed="${i===0}">${c}</button>`).join('')}</div><form class="search-form" id="faq-search" role="search"><label class="sr-only" for="faq-query">질문 검색</label><input id="faq-query" type="search" placeholder="궁금한 내용을 검색해 보세요"><button class="search-button" type="submit">검색</button></form><div class="board-meta"><p>검색 결과 <strong id="faq-count">${data.faqs.length}</strong>건</p><span class="meta">질문을 누르면 답변이 펼쳐집니다.</span></div><div id="faq-results">${data.faqs.map(f=>faqDetails(f)).join('')}</div><div class="info-callout"><h3>아직 궁금한 점이 남아 있나요?</h3><p>찾으시는 답변이 없다면 1:1 문의를 이용해 주세요.</p>${internal('notice/inquiry','1:1 문의 안내','inline-link')}</div>`; }
  function bindPage(page,query) {
    if (page.route==='guide/login') bindLogin(query);
    if (page.route==='cert/apply') bindApplication();
    if (page.route==='cert/criteria') {
      let type='general',field=0;
      const panel=()=>{
        const selected=data.criteria.fields[field];
        view.querySelector('#criteria-fields').hidden=type==='other';
        view.querySelector('#criteria-panel').innerHTML=type==='other'?Object.entries(data.criteria.other).map(([title,body])=>`<details class="criteria-other"><summary>${esc(title)}<span aria-hidden="true">+</span></summary><div class="prose">${body}</div></details>`).join(''):`<header><span class="page-eyebrow">${type==='general'?'일반 예술활동증명':'신진예술인 예술활동증명'}</span><h2>${esc(selected.title)}</h2></header><div class="prose">${selected[type] || '<p>해당 기준은 공식 원문에서 확인해 주세요.</p>'}</div>`;
      };
      view.querySelectorAll('[data-criteria-type]').forEach(button=>button.addEventListener('click',()=>{type=button.dataset.criteriaType;view.querySelectorAll('[data-criteria-type]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));panel();}));
      view.querySelectorAll('[data-field]').forEach(button=>button.addEventListener('click',()=>{field=Number(button.dataset.field);view.querySelectorAll('[data-field]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));panel();}));
      panel();
    }
    if (page.kind==='faq') {
      let category='전체';
      const filter=()=>{ const term=view.querySelector('#faq-query').value.trim().toLowerCase();const matches=data.faqs.filter(f=>(category==='전체'||f.category===category)&&`${f.question} ${f.answer}`.toLowerCase().includes(term));view.querySelector('#faq-results').innerHTML=matches.length?matches.map(f=>faqDetails(f)).join(''):'<p class="empty-state">검색 결과가 없습니다. 다른 검색어나 분류를 선택해 주세요.</p>';view.querySelector('#faq-count').textContent=matches.length; };
      view.querySelector('#faq-search').addEventListener('submit',e=>{e.preventDefault();filter();});
      view.querySelector('#faq-query').addEventListener('input',filter);
      view.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;view.querySelectorAll('[data-category]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));filter();}));
    }
    if (page.route==='notice/list'&&!query.has('post')) {
      const filter=()=>{const term=view.querySelector('#notice-query').value.trim().toLowerCase();const rows=data.notices.filter(n=>n.title.toLowerCase().includes(term));view.querySelector('#notice-results').innerHTML=noticeRows(rows);view.querySelector('#notice-count').textContent=rows.length;};
      view.querySelector('#notice-search').addEventListener('submit',e=>{e.preventDefault();filter();});view.querySelector('#notice-query').addEventListener('input',filter);
    }
    view.querySelectorAll('a[href]').forEach(a=>{ const route=sourceRoutes.get(norm(a.href));if(route&&!a.hasAttribute('target')&&!a.closest('.source-note')&&!a.classList.contains('primary')&&!a.textContent.includes('원문')){a.href=`#/${route}`;a.removeAttribute('target');} });
  }
  function render() {
    const hash=location.hash.slice(1);
    // Plain in-page anchors stay on the home screen.
    if (!hash.startsWith('/')) return;
    const [pathname,search='']=hash.slice(1).split('?');
    let key=pathname.replace(/\/$/,'');
    const aliases={'cert/guide/method':'cert/method','cert/guide/process':'cert/process','cert/guide/criteria':'cert/criteria','cert/guide/easy':'cert/videos'};
    key=aliases[key]||key;
    if (key==='cert/apply' && !demoSignedIn) {
      location.hash='/guide/login?next='+encodeURIComponent('cert/apply');
      return;
    }
    const page=Object.hasOwn(data.pages,key)?data.pages[key]:null;
    home.hidden=!!key;view.hidden=!key;
    hideDropdowns();nav.classList.remove('is-open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');
    nav.querySelectorAll('.nav-label>a').forEach(a=>{if(page&&a.hash.includes(`/${page.group}/`))a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    if (!key) { view.innerHTML='';document.title='예술인경력정보시스템 · Teamproject';window.scrollTo({top:0,behavior:'instant'});return; }
    if (!page) { view.innerHTML='<div class="empty-state"><h1>페이지를 찾을 수 없습니다</h1><p>전체 메뉴에서 필요한 정보를 찾아보세요.</p><a class="button" href="#/guide/sitemap">전체 메뉴 보기</a></div>';return; }
    const query=new URLSearchParams(search);
    view.innerHTML=page.route==='guide/login'?loginShell(page,loginPage(query)):shell(page,bodyFor(page,query));document.title=`${page.title} · 예술인경력정보시스템`;
    bindPage(page,query);window.scrollTo({top:0,behavior:'instant'});view.querySelector('h1')?.focus({preventScroll:true});
  }
  window.addEventListener('hashchange',render);
  if (!location.hash || location.hash==='#') history.replaceState(null,'',`${location.pathname}${location.search}#/`);
  render();
})();
