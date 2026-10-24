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
const portfolio = document.querySelector('#portfolio');
const portfolioInner = document.querySelector('.portfolio-inner');
const portfolioOverview = document.querySelector('.portfolio-overview');
const categoryStrip = document.querySelector('.category-strip');
const categoryStripList = document.querySelector('.category-strip-list');
const categoryLinks = [...document.querySelectorAll('[data-category-link]')];
const workSections = [...document.querySelectorAll('[data-work-category]')];
const moduleLinks = [...document.querySelectorAll('[data-module-link]')];
const workModules = [...document.querySelectorAll('[data-work-module]')];
const folderCards = [...document.querySelectorAll('.folder-card')];
const categories = {
 brand:{name:'社媒传播',color:'#5546ed'},
 ecommerce:{name:'电商视觉',color:'#389ee9'},
 marketing:{name:'活动营销',color:'#ff9b2c'},
 offline:{name:'线下物料',color:'#ec6e78'},
 aigc:{name:'AI作图',color:'#92979b'},
 motion:{name:'动效制作',color:'#be38ec'}
};
let activePage = 'resume';
let activeCategory = 'brand';
let categoryOpenTimer;
let hasEnteredContent = false;
let activeModule = null;
let routeScrollingUntil = 0;
let lastNavigationScroll = 0;
let folderProgress = null;
let folderTarget = 0;
let folderFrame = 0;
let folderFrameTime = 0;
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
// Horizontal swipes change a career card; vertical gestures keep scrolling the page.
const touchSurface = document.querySelector('.experience-panels');
let touch = null;
touchSurface.addEventListener('touchstart', event => {
 if(event.touches.length !== 1) { touch=null; return; }
 const t=event.touches[0]; touch={id:t.identifier,x:t.clientX,y:t.clientY};
}, {passive:true});
touchSurface.addEventListener('touchend', event => {
 if(!touch) return;
 const t=[...event.changedTouches].find(point=>point.identifier===touch.id);
 if(!t) return;
 const dy=touch.y-t.clientY, dx=touch.x-t.clientX;
 touch=null;
 if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.4) goToJob(activeJob + Math.sign(dx));
}, {passive:true});
touchSurface.addEventListener('touchcancel', () => { touch=null; }, {passive:true});

// Keep the same bar attached to its hero position, then pin it at the top.
let anchorTop=0, anchorLeft=0, anchorWidth=0, anchorHeight=0;
let navigationFrame=0;
let navHeight=54, stripHeight=100;
function measureNavigation() {
 const rect=anchor.getBoundingClientRect();
 anchorTop=rect.top+scrollY; anchorLeft=rect.left; anchorWidth=rect.width; anchorHeight=rect.height;
 navHeight=innerWidth<=760?Math.max(52,anchorHeight):Math.max(44,anchorHeight);
 stripHeight=innerWidth<=760?96:62;
 navigation.style.setProperty('--nav-font-size',`${innerWidth<=760?28:Math.max(22,Math.min(32,navHeight*.59))}px`);
 document.documentElement.style.setProperty('--primary-nav-height',`${navHeight}px`);
 document.documentElement.style.setProperty('--primary-nav-top',`${innerWidth<=760?12:16}px`);
 document.documentElement.style.setProperty('--category-strip-height',`${stripHeight}px`);
 paintNavigation();
}
function selectTab(tab) {
 navigation.dataset.active=tab;
 navigation.querySelector('[data-action="简历"]').setAttribute('aria-pressed',String(tab==='resume'));
 navigation.querySelector('[data-action="过往作品"]').setAttribute('aria-pressed',String(tab==='portfolio'));
}
function paintNavigation() {
 const returningUp=scrollY<lastNavigationScroll-1;
 lastNavigationScroll=scrollY;
 if(activePage==='portfolio' && (performance.now()>routeScrollingUntil||returningUp) && scrollY<anchorTop*.42) {
  resetPageBounce();bounceSurface=document.querySelector('.resume-inner');
  activePage='resume';resume.hidden=false;portfolio.hidden=true;document.body.dataset.page='resume';
  hasEnteredContent=false;
  window.history.replaceState(null,'',window.location.pathname+window.location.search);
 }
 const compact=innerWidth<=760;
 const dockTop=compact?12:16;
 const docked=anchorTop-scrollY<=dockTop;
 navigation.classList.toggle('is-docked',docked);
 document.body.dataset.navigationDocked=String(docked);
 const raw=Math.max(0,Math.min(1,(scrollY-Math.max(0,anchorTop-innerHeight*.32))/Math.max(200,innerHeight*.5)));
 const progress=raw*raw*(3-2*raw);
 const contracted=compact?Math.min(360,innerWidth*.78,anchorWidth):Math.min(620,anchorWidth*.76);
 const width=anchorWidth+(contracted-anchorWidth)*progress;
 navigation.style.setProperty('--nav-top',`${Math.max(dockTop,anchorTop-scrollY)}px`);
 navigation.style.setProperty('--nav-left',`${anchorLeft+(anchorWidth-width)/2}px`);
 navigation.style.setProperty('--nav-width',`${width}px`);
 navigation.style.setProperty('--nav-height',`${navHeight}px`);
 const surface=activePage==='portfolio'?portfolio:resume;
 if(surface.getBoundingClientRect().top<innerHeight*.66) hasEnteredContent=true;
 selectTab(hasEnteredContent?activePage:'none');
 updateWorkScrollSpy();
}
window.addEventListener('scroll', () => {
 if(navigationFrame) return;
 navigationFrame=requestAnimationFrame(() => { paintNavigation(); navigationFrame=0; });
}, {passive:true});
window.addEventListener('resize',measureNavigation,{passive:true});
new ResizeObserver(measureNavigation).observe(anchor);
new ResizeObserver(measureNavigation).observe(categoryStrip);
navigation.querySelector('[data-action="简历"]').addEventListener('click', () => {
 navigateContent('#resume');
});
navigation.querySelector('[data-action="过往作品"]').addEventListener('click', () => {
 navigateContent('#portfolio');
});
measureNavigation();

// Portfolio reveal: observe individual artwork blocks, keeping layout and lazy loading intact.
const workRevealTargets=Array.from(document.querySelectorAll('[data-work-reveal]')||[]);
let workRevealObserver=null;
function showWorkReveal(element){element.classList.add('is-work-visible');}
function prepareWorkReveals(slug){
 if(!workRevealObserver || reduceMotion.matches)return;
 workRevealTargets.filter(element=>element.dataset.workReveal===slug).forEach(element=>{
  workRevealObserver.unobserve(element);
  element.classList.remove('is-work-visible');
  workRevealObserver.observe(element);
 });
}
if('IntersectionObserver' in window && !reduceMotion.matches){
 workRevealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting || activePage!=='portfolio' || entry.target.dataset.workReveal!==activeCategory)return;
  showWorkReveal(entry.target);workRevealObserver.unobserve(entry.target);
 }),{threshold:.06,rootMargin:'0px 0px -28px 0px'});
 document.documentElement.classList.add('work-motion');
 workRevealTargets.forEach(element=>{
  element.style.setProperty('--work-reveal-delay',`${Number(element.dataset.workDelay||0)}ms`);
  workRevealObserver.observe(element);
 });
}else workRevealTargets.forEach(showWorkReveal);
reduceMotion.addEventListener?.('change',event=>{
 if(!event.matches)return;
 workRevealObserver?.disconnect();workRevealObserver=null;
 document.documentElement.classList.remove('work-motion');
 workRevealTargets.forEach(showWorkReveal);
});
// End portfolio reveal.

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
let bounceSurface = document.querySelector('.resume-inner');
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

function setCategorySelection(slug) {
 activeCategory=slug;
 categoryLinks.forEach(link=>link.setAttribute('aria-current',String(link.dataset.categoryLink===slug)));
}
const clampUnit=value=>Math.max(0,Math.min(1,value));
const softStep=value=>{const t=clampUnit(value);return t*t*t*(t*(t*6-15)+10);};
const morphWindow=(value,start,end)=>softStep((value-start)/(end-start));
function renderFolderMorph(progress) {
 const mobile=innerWidth<=760;
 const viewWidth=document.documentElement.clientWidth||innerWidth;
 const top=(mobile?12:16)+navHeight+6;
 const available=innerHeight-top;
 const overviewTop=portfolioOverview.getBoundingClientRect().top;
 categoryStrip.style.setProperty('--stage-top',`${Math.max(top,overviewTop)}px`);
 categoryStrip.style.visibility=overviewTop<innerHeight?'visible':'hidden';
 categoryStrip.style.setProperty('--bar-opacity',String(morphWindow(progress,.62,.96)));
 categoryStrip.classList.toggle('is-compact',progress>.995);
 categoryStrip.classList.toggle('is-morphing',progress>.008&&progress<.995);
 categoryStrip.dataset.morph=progress.toFixed(3);
 const gridWidth=mobile?Math.min(215,viewWidth*.43):Math.min(350,viewWidth*.23);
 const gridHeight=gridWidth*900/700;
 const endWidth=mobile?Math.min(118,(viewWidth-32)/3):Math.min(152,(viewWidth-70)/6);
 const endHeight=mobile?36:42,gap=mobile?6:10,columns=mobile?3:6;
 const rowWidth=columns*endWidth+(columns-1)*gap;
 const delays=[0,.025,.05,.08,.105,.13];
 const bezier=(a,b,c,d,t)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;};
 categoryLinks.forEach((card,i)=>{
  const local=reduceMotion.matches?progress:clampUnit((progress-delays[i])/.87);
  const q=softStep(local),lerp=(a,b)=>a+(b-a)*q;
  // Match the expanded reading order to the final controls to avoid crossing paths.
  const col=mobile?i%2:i%3,row=mobile?Math.floor(i/2):Math.floor(i/3);
  const centerX=viewWidth*(mobile?[.27,.73][col]:[.23,.50,.77][col]);
  const centerY=available*(mobile?[.20,.49,.78][row]+[0,-.008,.008,0,-.006,.006][i]:[.27,.235,.285,.71,.745,.705][i]);
  const x0=centerX-gridWidth*.5,y0=centerY-gridHeight*.66;
  const x1=(viewWidth-rowWidth)/2+(i%columns)*(endWidth+gap);
  const y1=8+Math.floor(i/columns)*(endHeight+gap);
  const cardX=lerp(x0,x1),cardY=lerp(y0,y1);
  const iconX=x1+endWidth*.5-(mobile?26.5:33.5),iconY=y1+endHeight*.5+2;
  const bend=(mobile?12:22)*[1,-1,1,1,-1,-1][i];
  const visualX=bezier(centerX,centerX+(iconX-centerX)*.16+bend,iconX-bend*.35,iconX,q);
  const visualY=bezier(centerY,centerY-available*.16,iconY+Math.min(90,available*.12),iconY,q);
  // Keep the source texture at a constant size and scale it on the compositor.
  const endArtWidth=(mobile?21:27)*700/580;
  const scale=Math.pow(endArtWidth/gridWidth,q);
  const artX=visualX-cardX-gridWidth*.5*scale;
  const artY=visualY-cardY-gridHeight*.66*scale;
  const handoff=morphWindow(local,.85,1);
  card.style.setProperty('--card-x',`${cardX}px`);
  card.style.setProperty('--card-y',`${cardY}px`);
  card.style.setProperty('--card-width',`${lerp(gridWidth,endWidth)}px`);
  card.style.setProperty('--card-height',`${lerp(gridHeight,endHeight)}px`);
  card.style.setProperty('--expanded-width',`${gridWidth}px`);
  card.style.setProperty('--art-x',`${artX}px`);
  card.style.setProperty('--art-y',`${artY}px`);
  card.style.setProperty('--art-scale',String(scale));
  card.style.setProperty('--morph-tilt',`${Math.sin(Math.PI*q)*[2,-2,1.5,-2,1.8,-1.5][i]}deg`);
  card.style.setProperty('--art-opacity',String(1-handoff));
  card.style.setProperty('--mini-opacity',String(handoff));
  card.style.setProperty('--label-opacity',String(morphWindow(local,.69,1)));
  card.style.setProperty('--label-lift',`${(1-morphWindow(local,.69,1))*5}px`);
  card.style.setProperty('--bar-opacity',String(morphWindow(local,.76,1)));
  card.style.setProperty('--float-strength',String(1-q));
 });
}
function advanceFolderMorph(now) {
 folderFrame=0;
 if(activePage!=='portfolio'||portfolio.hidden){folderFrameTime=0;return;}
 const dt=folderFrameTime?Math.min(.05,(now-folderFrameTime)/1000):1/60;
 folderFrameTime=now;
 // A short, time-based catch-up softens wheel steps without overshoot or trailing drift.
 folderProgress+=(folderTarget-folderProgress)*(1-Math.exp(-dt/.065));
 if(Math.abs(folderTarget-folderProgress)<.0002)folderProgress=folderTarget;
 renderFolderMorph(folderProgress);
 if(folderProgress!==folderTarget)folderFrame=requestAnimationFrame(advanceFolderMorph);
 else folderFrameTime=0;
}
function paintFolderMorph() {
 const top=(innerWidth<=760?12:16)+navHeight+6;
 const available=innerHeight-top;
 const distance=Math.max(120,Math.min(available*.84,available-stripHeight-40));
 const raw=clampUnit((top-portfolioOverview.getBoundingClientRect().top)/distance);
 folderTarget=reduceMotion.matches?(raw>=.5?1:0):raw;
 if(folderProgress===null||reduceMotion.matches){
  folderProgress=folderTarget;cancelAnimationFrame(folderFrame);folderFrame=0;folderFrameTime=0;
 }
 renderFolderMorph(folderProgress);
 if(folderProgress!==folderTarget&&!folderFrame)folderFrame=requestAnimationFrame(advanceFolderMorph);
}

function moduleCategory(item){return item.dataset.moduleCategory||'ecommerce';}
function updateWorkScrollSpy() {
 if(activePage!=='portfolio' || portfolio.hidden) return;
 paintFolderMorph();
 const visibleModules=workModules.filter(item=>moduleCategory(item)===activeCategory);
 if(!visibleModules.length)return;
 const line=(innerWidth<=760?12:16)+navHeight+6+stripHeight+24+(innerWidth<=760?72:0);
 let current=visibleModules[0];
 for(const item of visibleModules)if(item.getBoundingClientRect().top<=line+12)current=item;
 const key=activeCategory+'/'+current.dataset.workModule;
 if(activeModule!==key){
  activeModule=key;
  moduleLinks.forEach(link=>link.setAttribute('aria-current',String(moduleCategory(link)===activeCategory&&link.dataset.moduleLink===current.dataset.workModule)));
 }
}
function contentTarget(hash) {
 const parts=hash.replace(/^#/,'').split('/');
 if(parts[0]!=='portfolio')return {page:'resume',target:resume};
 const slug=Object.hasOwn(categories,parts[1])?parts[1]:activeCategory||'brand';
 const category=workSections.find(item=>item.dataset.workCategory===slug);
 const module=workModules.find(item=>moduleCategory(item)===slug&&item.dataset.workModule===parts[2]);
 return {page:'portfolio',category:slug,target:parts[1]?(module||category):portfolio};
}
function applyContentRoute(hash,{scroll=false,focus=false}={}){
 clearTimeout(categoryOpenTimer);folderCards.forEach(card=>card.classList.remove('is-opening'));
 const route=contentTarget(hash),changed=activePage!==route.page||activeCategory!==route.category;
 resetPageBounce();routeScrollingUntil=performance.now()+1600;
 activePage=route.page;resume.hidden=activePage!=='resume';portfolio.hidden=activePage!=='portfolio';
 if(route.category)setCategorySelection(route.category);
 workSections.forEach(item=>item.hidden=item.dataset.workCategory!==activeCategory);
 if(changed && activePage==='portfolio')prepareWorkReveals(activeCategory);
 document.body.dataset.page=activePage;
 bounceSurface=activePage==='portfolio'?workSections.find(item=>item.dataset.workCategory===activeCategory):document.querySelector('.resume-inner');
 hasEnteredContent=true;
 if(changed&&!reduceMotion.matches)bounceSurface.animate([{opacity:.35},{opacity:1}],{duration:400,easing:'ease-out'});
 measureNavigation();
 if(scroll)route.target.scrollIntoView({behavior:reduceMotion.matches?'auto':'smooth',block:'start'});
 if(focus)route.target.focus({preventScroll:true});
 selectTab(activePage);
}
function navigateContent(hash,options={}){
 if(window.location.hash!==hash)window.history.pushState(null,'',hash);
 applyContentRoute(hash,{scroll:true,...options});
}
folderCards.forEach(card=>card.addEventListener('click',event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();clearTimeout(categoryOpenTimer);
 card.classList.add('is-opening');
 const delay=reduceMotion.matches||categoryStrip.classList.contains('is-compact')?0:160;
 categoryOpenTimer=setTimeout(()=>navigateContent(card.getAttribute('href'),{focus:true}),delay);
}));
[...moduleLinks,...document.querySelectorAll('[data-next-category]')].forEach(link=>link.addEventListener('click',event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();navigateContent(link.getAttribute('href'),{focus:true});
}));
window.addEventListener('popstate',()=>applyContentRoute(window.location.hash,{scroll:true}));
window.addEventListener('hashchange',()=>applyContentRoute(window.location.hash,{scroll:true}));
// A fresh visit always opens the cover. Its next screen defaults to the resume.
window.history.scrollRestoration='manual';
window.scrollTo({top:0,behavior:'instant'});
window.addEventListener('load',()=>{if(!hasEnteredContent)window.scrollTo({top:0,behavior:'instant'});},{once:true});
