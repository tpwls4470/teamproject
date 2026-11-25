'use strict';
const destinations = {
  official: 'https://www.kawfartist.kr/hkor/userMain/hkorMain.do?sso=ok',
  apply:'#/cert/apply', history:'#/cert/status',login:'#/guide/login',join:'#/guide/join',
  examples:'#/cert/criteria', contact:'#/notice/inquiry',guide:'#/cert/videos',welfare:'#/welfare/prep',
  counsel:'#/rights/psy',report:'#/rights/sinmungo',insurance:'#/welfare/insurance',rights:'#/rights/system',news:'#/notice/list'
};
document.querySelectorAll('[data-link]').forEach(link => {
  link.href = destinations[link.dataset.link];
  if (!link.href.includes('#/')) { link.target = '_blank';link.rel='noopener noreferrer'; }
  else { link.removeAttribute('target');link.removeAttribute('rel'); }
  link.removeAttribute('aria-label');
});

const themeButton = document.querySelector('.theme-toggle');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.innerHTML = dark
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z"/></svg>';
  themeButton.title = dark ? '라이트 모드로 전환' : '다크 모드로 전환';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
}
try { setTheme(localStorage.getItem('teamproject-theme') === 'dark' ? 'dark' : 'light'); }
catch { setTheme('light'); }
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem('teamproject-theme', theme); } catch { /* Storage is optional. */ }
});
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', event => { if (event.target.closest('a') && !event.target.closest('.nav-label')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

// The approved first five photos stay in this exact order. Add artists here.
const artists = [
  { name: '조각', alt: '작업실에서 인물 조각을 다듬는 예술인', source: 'original', position: 100 },
  { name: '공예', alt: '물레 위의 흙을 빚는 도예가', source: 'original', position: 25 },
  { name: '무용', alt: '연습실에서 팔을 뻗어 춤추는 무용가', source: 'original', position: 50 },
  { name: '첼로', alt: '첼로를 연주하는 음악가', source: 'original', position: 75 },
  { name: '가수', alt: '마이크를 들고 노래하는 가수', source: 'singer', position: 100 },
  { name: '회화', alt: '캔버스에 붓으로 그림을 그리는 화가', source: 'original', position: 0 }
];
const track = document.querySelector('#artist-track');
// Leading/trailing copies allow seamless movement in either direction.
const sequence = [...artists, ...artists, ...artists];
sequence.forEach((artist, index) => {
  const figure = document.createElement('figure');
  figure.className = 'artist-photo';
  figure.style.setProperty('--position', `${artist.position}%`);
  const image = document.createElement('img');
  image.src = `./assets/artists-${artist.source}.webp`;
  image.alt = artist.alt;
  image.width = 434;
  image.height = 724;
  image.decoding = 'async';
  image.draggable = false;
  figure.append(image);
  if (index < artists.length || index >= artists.length * 2) figure.setAttribute('aria-hidden', 'true');
  track.append(figure);
});
const carousel = document.querySelector('.carousel');
const windowElement = document.querySelector('.carousel-window');
const playButton = document.querySelector('#autoplay');
const announcement = document.querySelector('#carousel-announcement');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let cursor = artists.length;
let paused = reducedMotion.matches;
let hover = false;
let focused = false;
let moving = false;
let timer;
let settleTimer;
const visibleCount = () => matchMedia('(max-width: 600px)').matches ? 2 : 5;
const activeIndex = () => ((cursor % artists.length) + artists.length) % artists.length;
function paint(animate = false) {
  track.style.transition = animate && !reducedMotion.matches ? 'transform 900ms cubic-bezier(.25,.8,.25,1)' : 'none';
  track.style.transform = `translateX(${-cursor * windowElement.clientWidth / visibleCount()}px)`;
}
function settle() {
  clearTimeout(settleTimer);
  if (cursor >= artists.length * 2) cursor -= artists.length;
  if (cursor < artists.length) cursor += artists.length;
  moving = false;
  paint(false);
}
function step(direction, manual = false) {
  if (moving) return;
  cursor += direction;
  moving = true;
  paint(true);
  if (manual) announcement.textContent = `${artists[activeIndex()].name} 사진부터 표시합니다.`;
  settleTimer = setTimeout(settle, reducedMotion.matches ? 0 : 950);
}
function schedule() {
  clearInterval(timer);
  if (!paused && !hover && !focused && !document.hidden && !document.querySelector('#home-view').hidden) timer = setInterval(() => step(1), 4500);
}
function updatePlayButton() {
  playButton.setAttribute('aria-pressed', String(paused));
  playButton.setAttribute('aria-label', paused ? '사진 자동 넘김 재생' : '사진 자동 넘김 일시정지');
  playButton.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
  schedule();
}
playButton.addEventListener('click', () => { paused = !paused; updatePlayButton(); });
document.querySelector('#previous').addEventListener('click', () => { step(-1, true); schedule(); });
document.querySelector('#next').addEventListener('click', () => { step(1, true); schedule(); });
carousel.addEventListener('mouseenter', () => { hover = true; schedule(); });
carousel.addEventListener('mouseleave', () => { hover = false; schedule(); });
carousel.addEventListener('focusin', () => { focused = true; schedule(); });
carousel.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) { focused = false; schedule(); } });
document.addEventListener('visibilitychange', schedule);
reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; settle(); updatePlayButton(); });
new ResizeObserver(() => { settle(); }).observe(windowElement);
paint();
updatePlayButton();


window.addEventListener('hashchange', () => setTimeout(schedule, 0));
