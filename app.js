const status = document.querySelector('.feedback');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let hideTimer;
function notify(message) {
 status.textContent = message; status.classList.add('show');
 clearTimeout(hideTimer); hideTimer = setTimeout(() => status.classList.remove('show'), 2400);
}
const video = document.querySelector('video');
const playback = document.querySelector('.playback');
const startVideo = document.querySelector('.video-start');
function updatePlayback() { playback.textContent = video.paused ? '▷' : 'Ⅱ'; playback.setAttribute('aria-label', video.paused ? '播放动画' : '暂停动画'); }
async function playVideo() { try { await video.play(); } catch { startVideo.hidden = false; updatePlayback(); } }
video.muted = true; video.loop = true;
playback.addEventListener('click', () => video.paused ? playVideo() : video.pause());
video.addEventListener('play', () => { startVideo.hidden = true; updatePlayback(); });
video.addEventListener('pause', updatePlayback);
video.addEventListener('error', () => notify('视频加载失败，请刷新页面重试'));
startVideo.addEventListener('click', playVideo); playVideo();

const resume = document.querySelector('#resume');
const navigation = document.querySelector('.site-navigation');
const anchor = document.querySelector('.navigation-anchor');
const section = document.querySelector('.experience-section');
const panels = [...document.querySelectorAll('.experience-panel')];
const dots = [...document.querySelectorAll('[data-job]')];
const timeline = document.querySelector('.timeline-rule');
const timelineNodes = [...document.querySelectorAll('[data-timeline-job]')];
const maps = [...document.querySelectorAll('[data-map]')];
const dateStart = document.querySelector('#date-start');
const dateEnd = document.querySelector('#date-end');
const periods = [ ['2020.08','2023.01'], ['2023.01','2024.02'], ['2024.03','2026.10'] ];
const glyphWidths = {"0": 90, "1": 54, "2": 82, "3": 77, "4": 89, "5": 80, "6": 91, "7": 81, "8": 90, "9": 91, ".": 45};
const glyphUrl = char => `assets/resume-v2/digit-${char === '.' ? 'dot' : char}.png`;
Object.keys(glyphWidths).forEach(char => { const image = new Image(); image.src = glyphUrl(char); });
function makeDigit(char) {
 const image = document.createElement('img');
 image.src = glyphUrl(char); image.width = glyphWidths[char]; image.height = 208; image.alt = ''; image.draggable = false;
 image.dataset.char = char; return image;
}
function renderDate(element, text) { element.replaceChildren(...[...text].map(makeDigit)); }
renderDate(dateStart, periods[0][0]); renderDate(dateEnd, periods[0][1]);
let activeJob = 0;
let dateToken = 0;
let digitFrame = 0;
let currentGhost = null;
function animateDates(previous, next) {
 const token = ++dateToken;
 cancelAnimationFrame(digitFrame);
 if(currentGhost) { currentGhost.getAnimations().forEach(a => a.cancel()); currentGhost.remove(); currentGhost = null; }
 dateStart.style.opacity = '1';
 document.querySelector('.period-range').setAttribute('aria-label', `${periods[next][0]} 至 ${periods[next][1]}`);
 if(reduceMotion.matches) { renderDate(dateStart, periods[next][0]); renderDate(dateEnd, periods[next][1]); return; }
 // Carry the previous ending date into the fixed start position.
 const dx = dateEnd.getBoundingClientRect().left - dateStart.getBoundingClientRect().left;
 const ghost = document.createElement('span'); ghost.className = 'date-ghost date-endpoint';
 renderDate(ghost, periods[previous][1]);
 document.querySelector('.period-dates').append(ghost); currentGhost = ghost;
 renderDate(dateStart, periods[next][0]); dateStart.style.opacity = '0';
 const carry = ghost.animate([{transform:`translate3d(${dx}px,0,0)`,opacity:.85},{transform:'translate3d(0,0,0)',opacity:1}], {duration:680,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
 carry.finished.then(() => {
  if(token !== dateToken) return;
  dateStart.style.opacity = '1'; ghost.remove(); currentGhost = null;
 }).catch(() => {});
 // Randomize only date digits; each settles into its exact final value.
 renderDate(dateEnd, periods[previous][1]);
 const images = [...dateEnd.children]; const target = periods[next][1];
 const began = performance.now(); let lastTick = -Infinity;
 function tick(now) {
  if(token !== dateToken) return;
  const elapsed = now - began;
  if(now - lastTick >= 42) {
   images.forEach((image, i) => {
    const char = target[i] === '.' ? '.' : elapsed >= 390 + i * 42 ? target[i] : String(Math.floor(Math.random() * 10));
    if(image.dataset.char !== char) { image.src = glyphUrl(char); image.width = glyphWidths[char]; image.dataset.char = char; }
   }); lastTick = now;
  }
  if(elapsed < 720) digitFrame = requestAnimationFrame(tick);
  else renderDate(dateEnd, target);
 }
 digitFrame = requestAnimationFrame(tick);
}
let lastTransition = -Infinity;
let lastDirection = 0;
function updateTimeline(index) {
 timeline.style.setProperty('--timeline-progress', String([.08,.5,.92][index]));
 timelineNodes.forEach((node, i) => {
  node.classList.toggle('is-active', i === index);
  node.classList.toggle('is-past', i < index);
  node.setAttribute('aria-pressed', String(i === index));
  node.setAttribute('aria-current', i === index ? 'step' : 'false');
 });
}
updateTimeline(0);
function goToJob(requested) {
 const index = Math.max(0, Math.min(panels.length - 1, requested));
 if(index === activeJob) return false;
 const previous = activeJob; activeJob = index;
 lastDirection = Math.sign(index - previous); lastTransition = performance.now();
 panels.forEach((panel, i) => { panel.classList.toggle('is-active', i === index); panel.setAttribute('aria-hidden', String(i !== index)); });
 dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
 updateTimeline(index);
 const counter = document.querySelector('#experience-current'); counter.textContent = String(index + 1).padStart(2,'0');
 if(!reduceMotion.matches) counter.animate([{opacity:.2,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}], {duration:450,easing:'ease-out'});
 const city = panels[index].dataset.city;
 maps.forEach(map => { const visible = map.dataset.map === city; map.classList.toggle('is-visible', visible); map.setAttribute('aria-hidden', String(!visible)); });
 document.querySelector('.map-stage').setAttribute('aria-label', `工作城市：${city === 'hangzhou' ? '杭州' : '郑州'}`);
 document.querySelector('#experience-announcement').textContent = panels[index].getAttribute('aria-label');
 animateDates(previous, index);
 if(!reduceMotion.matches) {
  const visibleMap = maps.find(map => map.dataset.map === city);
  visibleMap.animate([{opacity:.15,transform:'translate3d(18px,0,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:850,delay:120,easing:'cubic-bezier(.22,1,.36,1)'});
 }
 return true;
}
dots.forEach(dot => dot.addEventListener('click', () => goToJob(Number(dot.dataset.job))));
timelineNodes.forEach(node => node.addEventListener('click', () => goToJob(Number(node.dataset.timelineJob))));
let wheelSum = 0;
let wheelAt = -Infinity;
section.addEventListener('wheel', event => {
 if(event.ctrlKey || innerWidth <= 760 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
 // Let the page arrive at the complete resume before changing an entry.
 if(resume.getBoundingClientRect().top > Math.max(150, innerHeight * .18)) return;
 const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
 if(Math.abs(delta) < 1) return;
 const direction = Math.sign(delta); const now = performance.now();
 // At an entry boundary, release the gesture to page scrolling or the bottom spring immediately.
 if(activeJob + direction < 0 || activeJob + direction >= panels.length) return;
 if(now - lastTransition < 900 && (direction === lastDirection || now - lastTransition < 280)) { event.preventDefault(); return; }
 event.preventDefault();
 if(now - wheelAt > 180 || Math.sign(wheelSum) !== direction) wheelSum = 0;
 wheelAt = now; wheelSum += delta;
 if(Math.abs(wheelSum) >= 44) { goToJob(activeJob + direction); wheelSum = 0; }
}, {passive:false});
section.addEventListener('mouseleave', () => { wheelSum = 0; wheelAt = -Infinity; });
section.addEventListener('keydown', event => {
 const targets = {ArrowDown:activeJob+1,ArrowRight:activeJob+1,ArrowUp:activeJob-1,ArrowLeft:activeJob-1,Home:0,End:panels.length-1};
 if(event.key in targets) { event.preventDefault(); goToJob(targets[event.key]); }
});
let touch = null;
section.addEventListener('touchstart', event => { const t=event.changedTouches[0]; touch={x:t.clientX,y:t.clientY}; }, {passive:true});
section.addEventListener('touchend', event => {
 if(!touch) return; const t=event.changedTouches[0]; const dy=touch.y-t.clientY, dx=touch.x-t.clientX;
 if(Math.abs(dy)>44 && Math.abs(dy)>Math.abs(dx)) goToJob(activeJob + Math.sign(dy));
 touch=null;
}, {passive:true});

// Keep the same bar attached to its hero position, then pin it at the top.
let anchorTop=0, anchorLeft=0, anchorWidth=0, anchorHeight=0;
let navigationFrame=0, manualSelectionUntil=0;
function measureNavigation() {
 const rect=anchor.getBoundingClientRect();
 anchorTop=rect.top+scrollY; anchorLeft=rect.left; anchorWidth=rect.width; anchorHeight=rect.height;
 paintNavigation();
}
function selectTab(tab) {
 navigation.dataset.active=tab;
 navigation.querySelector('[data-action="简历"]').setAttribute('aria-pressed',String(tab==='resume'));
 navigation.querySelector('[data-action="过往作品"]').setAttribute('aria-pressed',String(tab==='portfolio'));
}
function paintNavigation() {
 const docked=anchorTop-scrollY<=16;
 navigation.classList.toggle('is-docked',docked);
 const smallDock=innerWidth<=760 && docked;
 const width=smallDock?Math.min(innerWidth*.86,520):anchorWidth;
 navigation.style.setProperty('--nav-top',`${Math.max(16,anchorTop-scrollY)}px`);
 navigation.style.setProperty('--nav-left',`${smallDock?(innerWidth-width)/2:anchorLeft}px`);
 navigation.style.setProperty('--nav-width',`${width}px`);
 navigation.style.setProperty('--nav-height',`${smallDock?44:anchorHeight}px`);
 if(performance.now()>=manualSelectionUntil) selectTab(resume.getBoundingClientRect().top<innerHeight*.66?'resume':'none');
}
window.addEventListener('scroll', () => {
 if(navigationFrame) return;
 navigationFrame=requestAnimationFrame(() => { paintNavigation(); navigationFrame=0; });
}, {passive:true});
window.addEventListener('resize',measureNavigation,{passive:true});
new ResizeObserver(measureNavigation).observe(anchor);
navigation.querySelector('[data-action="简历"]').addEventListener('click', () => {
 manualSelectionUntil=performance.now()+1300; selectTab('resume');
 resume.scrollIntoView({behavior:reduceMotion.matches?'auto':'smooth',block:'start'});
});
navigation.querySelector('[data-action="过往作品"]').addEventListener('click', () => {
 manualSelectionUntil=performance.now()+2800; selectTab('portfolio'); notify('过往作品内容待补充');
});
measureNavigation();

const reveals=[...document.querySelectorAll('.reveal')];
if('IntersectionObserver' in window && !reduceMotion.matches) {
 const observer=new IntersectionObserver(entries => entries.forEach(entry => {
  if(!entry.isIntersecting) return;
  const element=entry.target;
  element.style.transitionDelay=`${Number(element.dataset.delay||0)}ms`;
  element.classList.add('revealed'); observer.unobserve(element);
  if(element.classList.contains('experience-stage')) {
   const company=panels[activeJob].querySelector('.company-reveal');
   const detail=panels[activeJob].querySelector('.detail-reveal');
   company.animate([{opacity:0,transform:'translateX(-16px)'},{opacity:1,transform:'translateX(0)'}],{duration:650,delay:100,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
   detail.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,delay:260,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
  }
 }),{threshold:.12,rootMargin:'0px 0px -20px 0px'});
 document.documentElement.classList.add('js-motion');
 reveals.forEach(element=>observer.observe(element));
} else reveals.forEach(element=>element.classList.add('revealed'));

// A restrained bottom-edge pull, independent of the career wheel gesture.
const bounceSurface = document.querySelector('.resume-inner');
let bouncePosition = 0;
let bounceVelocity = 0;
let bounceTarget = 0;
let bouncePull = 0;
let bounceFrame = 0;
let bounceTime = 0;
let bounceReleaseTimer;
function isAtPageBottom() {
 const root = document.scrollingElement || document.documentElement;
 const end = Math.max(0, root.scrollHeight - root.clientHeight);
 return end > 0 && scrollY >= end - 2;
}
function resetPageBounce() {
 clearTimeout(bounceReleaseTimer);
 cancelAnimationFrame(bounceFrame);
 bounceFrame = 0; bounceTime = 0;
 bouncePosition = 0; bounceVelocity = 0; bounceTarget = 0; bouncePull = 0;
 bounceSurface.style.transform = '';
 bounceSurface.style.willChange = '';
}
function animatePageBounce(now) {
 const dt = bounceTime ? Math.min(.032, Math.max(.008, (now - bounceTime) / 1000)) : .016;
 bounceTime = now;
 const spring = bounceTarget > 0 ? 190 : 145;
 const damping = bounceTarget > 0 ? 23 : 20;
 bounceVelocity += ((bounceTarget - bouncePosition) * spring - bounceVelocity * damping) * dt;
 bouncePosition += bounceVelocity * dt;
 if(bounceTarget === 0 && Math.abs(bouncePosition) < .15 && Math.abs(bounceVelocity) < 1) {
  resetPageBounce(); return;
 }
 bounceSurface.style.transform = `translate3d(0,${(-bouncePosition).toFixed(2)}px,0)`;
 bounceFrame = requestAnimationFrame(animatePageBounce);
}
function releasePageBounce() {
 bounceTarget = 0; bouncePull = 0;
 if(!bounceFrame && Math.abs(bouncePosition) > .15) {
  bounceTime = 0; bounceFrame = requestAnimationFrame(animatePageBounce);
 }
}
window.addEventListener('wheel', event => {
 // An experience transition consumes its own gesture before it reaches here.
 if(event.defaultPrevented || event.ctrlKey || event.cancelable === false || reduceMotion.matches) return;
 if(Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
 const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
 if(delta === 0) return;
 if(delta < 0) { if(bounceFrame) resetPageBounce(); return; }
 if(!isAtPageBottom()) return;
 event.preventDefault();
 const limit = Math.min(82, innerHeight * .1);
 bouncePull = Math.min(440, bouncePull + Math.min(delta, 160) * .6);
 bounceTarget = limit * (1 - Math.exp(-bouncePull / 175));
 bounceSurface.style.willChange = 'transform';
 clearTimeout(bounceReleaseTimer);
 bounceReleaseTimer = setTimeout(releasePageBounce, 130);
 if(!bounceFrame) { bounceTime = 0; bounceFrame = requestAnimationFrame(animatePageBounce); }
}, {passive:false});
window.addEventListener('scroll', () => {
 if(bounceFrame && !isAtPageBottom()) resetPageBounce();
}, {passive:true});
window.addEventListener('resize', resetPageBounce, {passive:true});
window.addEventListener('pointerdown', resetPageBounce, {passive:true});
window.addEventListener('pagehide', resetPageBounce, {passive:true});
