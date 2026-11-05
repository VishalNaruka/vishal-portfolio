(()=>{
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P=window.PROJECTS,list=$('#list'),worlds=$('#worlds'),modal=$('#modal'),body=$('#mbody');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* Worlds (filters) and level cards */
const WORLD={AR:'AR',VR:'VR',MR:'Mixed reality',Twin:'Digital twin',Tools:'Dev tools',Games:'Games'};
const COLOR={AR:'var(--lens)',VR:'var(--violet)',MR:'var(--amber)',Twin:'var(--blue)',Tools:'var(--green)',Games:'var(--pink)'};
const ytId=u=>{const m=(u||'').match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);return m&&m[1]};
const lvl=i=>String(i+1).padStart(2,'0');
const order=Object.keys(WORLD).filter(w=>P.some(p=>p.world===w));
worlds.innerHTML=[`<button aria-pressed="true" data-w="All">All<span class="n">${P.length}</span></button>`]
  .concat(order.map(w=>`<button aria-pressed="false" data-w="${w}" style="--c:${COLOR[w]}">${WORLD[w]}<span class="n">${P.filter(p=>p.world===w).length}</span></button>`)).join('');

function loot(p){return [p.video&&'Video',p.appStore&&'App Store',p.playStore&&'Google Play',p.demo&&(p.demo==='#bonus'?'Playable':'Live demo')].filter(Boolean)}
function draw(w){
  list.innerHTML=P.map((p,i)=>({p,i})).filter(({p})=>w==='All'||p.world===w).map(({p,i})=>{
    const id=ytId(p.video),img=p.thumb||(id?`https://i.ytimg.com/vi/${id}/mqdefault.jpg`:'');
    const l=loot(p);
    return `<li><button class="card w-${esc(p.world)}" data-id="${esc(p.id)}" aria-label="Level ${lvl(i)}: ${esc(p.title)}">
      <span class="thumb">${img?`<img src="${esc(img)}" alt="" loading="lazy" decoding="async" width="320" height="180">`:`<span class="glyph">${esc(p.world==='Games'?'▶':p.world==='Twin'?'DT':p.world==='Tools'?'</>':p.world)}</span>`}
        <span class="lvl">LVL ${lvl(i)}</span><span class="world">${esc(WORLD[p.world]||p.world)}</span>${p.video?'<span class="play" aria-hidden="true">▶</span>':''}</span>
      <span class="card-b"><h3>${esc(p.title)}</h3><span class="org">${esc(p.org)}</span>${l.length?`<span class="loot">${l.map(x=>`<span>${x}</span>`).join('')}</span>`:''}</span>
    </button></li>`}).join('');
}
worlds.onclick=e=>{const b=e.target.closest('button');if(!b)return;worlds.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw(b.dataset.w)};
draw('All');

/* Mission briefing */
function media(u){
  const y=ytId(u);
  if(y)return `<button class="facade" data-yt="${y}" aria-label="Play video"><img src="https://i.ytimg.com/vi/${y}/hqdefault.jpg" alt="" loading="lazy"><span>▶ Play video</span></button>`;
  const v=u.match(/vimeo\.com\/(\d+)/);
  if(v)return `<iframe src="https://player.vimeo.com/video/${v[1]}" title="Project video" allowfullscreen loading="lazy"></iframe>`;
  return `<video src="${esc(u)}" controls preload="none" playsinline></video>`;
}
list.onclick=e=>{
  const b=e.target.closest('button.card');if(!b)return;
  const i=P.findIndex(x=>x.id===b.dataset.id),p=P[i];
  const links=[[p.playStore,'Get it on Google Play'],[p.appStore,'Download on the App Store'],[p.demo&&p.demo!=='#bonus'&&p.demo,'Open live demo']].filter(l=>l[0])
    .map(l=>`<a class="btn" href="${esc(l[0])}" target="_blank" rel="noopener">${l[1]}</a>`).join('');
  modal.style.setProperty('--c',COLOR[p.world]||'var(--lens)');
  body.innerHTML=`<p class="px">Level ${lvl(i)} · ${esc(WORLD[p.world]||p.world)}</p><h3 id="mt">${esc(p.title)}</h3><p class="org">${esc(p.org)}</p>`
    +(p.video?`<div class="media">${media(p.video)}</div>`:'')
    +`<h4>Mission</h4><p>${esc(p.summary)}</p>`
    +(p.impact?`<h4>Result</h4><p>${esc(p.impact)}</p>`:'')
    +`<h4>Loadout</h4><div class="chips">${p.stack.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`
    +(p.demo==='#bonus'?`<p class="links"><button class="btn start" id="goPlay"><span class="px">Play now</span></button></p>`:'')
    +(links?`<p class="links">${links}</p>`:'');
  modal.showModal();
};
body.onclick=e=>{
  const f=e.target.closest('.facade');
  if(f){f.outerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${f.dataset.yt}?rel=0&autoplay=1&playsinline=1" title="Project video" allow="autoplay; fullscreen" allowfullscreen></iframe>`;return}
  if(e.target.closest('#goPlay')){modal.close();$('#bonus').scrollIntoView({behavior:reduce?'auto':'smooth'})}
};
$('#close').onclick=()=>modal.close();
modal.onclick=e=>{if(e.target===modal)modal.close()};
modal.onclose=()=>{body.innerHTML=''}; /* clearing the DOM stops any playing video */

/* Achievement counters, run once when visible */
const io=new IntersectionObserver(es=>es.forEach(en=>{
  if(!en.isIntersecting)return;io.unobserve(en.target);
  const el=en.target,n=+el.dataset.n,s=el.dataset.s||'';
  if(reduce){el.textContent=n.toLocaleString()+s;return}
  const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1200);el.textContent=Math.round(n*(1-Math.pow(1-k,3))).toLocaleString()+(k==1?s:'');if(k<1)requestAnimationFrame(f)})(t0);
}),{threshold:.6});
document.querySelectorAll('[data-n]').forEach(el=>io.observe(el));

/* Contact dock on phones: appears once you scroll past the title screen */
const dock=$('.dock'),hero=$('#hero');
new IntersectionObserver(([en])=>dock.classList.toggle('show',!en.isIntersecting),{threshold:.15}).observe(hero);

/* Title screen: hidden pipe network revealed by a lens (echoes the DEWA see-through viewer).
   Follows the mouse, a finger drag, or phone tilt; drifts on its own until touched. */
const cv=$('#net'),cx=cv.getContext('2d');
let W,H;
function build(){
  const d=Math.min(devicePixelRatio||1,2);W=hero.clientWidth;H=hero.clientHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
  const g=Math.max(46,W/22),seg=[];
  for(let y=g/2;y<H;y+=g){let x=0;while(x<W){const run=g*(1+Math.floor(Math.random()*4));seg.push([x,y,Math.min(W,x+run),y,Math.random()<.2]);x+=run+g*Math.random()}}
  for(let x=g;x<W;x+=g*1.6){let y=0;while(y<H){const run=g*(1+Math.floor(Math.random()*3));seg.push([x,y,x,Math.min(H,y+run),Math.random()<.2]);y+=run+g*Math.random()}}
  cx.clearRect(0,0,W,H);cx.lineCap='round';
  for(const [a,b,c,d2,hot] of seg){cx.strokeStyle=hot?'#ffb454':'#3ff5d6';cx.lineWidth=hot?5:3;cx.beginPath();cx.moveTo(a,b);cx.lineTo(c,d2);cx.stroke()}
  cv.style.setProperty('--lr',(W<640?110:170)+'px');
}
build();let rw=innerWidth;addEventListener('resize',()=>{if(innerWidth!==rw){rw=innerWidth;build()}}); /* ignore mobile URL-bar height changes */
const setLens=(x,y)=>{cv.style.setProperty('--mx',x+'px');cv.style.setProperty('--my',y+'px')};
let used=false;
hero.addEventListener('pointermove',e=>{used=true;const r=hero.getBoundingClientRect();setLens(e.clientX-r.left,e.clientY-r.top)});
hero.addEventListener('pointerdown',e=>{used=true;const r=hero.getBoundingClientRect();setLens(e.clientX-r.left,e.clientY-r.top)});
addEventListener('deviceorientation',e=>{ /* Android tilt; iOS needs a permission prompt, so it just keeps drifting there */
  if(e.gamma==null||e.beta==null)return;used=true;
  setLens(W*(.5+Math.max(-1,Math.min(1,e.gamma/35))*.4),H*(.5+Math.max(-1,Math.min(1,(e.beta-45)/35))*.35));
});
if(!reduce){let heroOn=true;new IntersectionObserver(([en])=>heroOn=en.isIntersecting).observe(hero);
  (function drift(t){if(!used&&heroOn)setLens(W*(.5+.3*Math.cos(t/2400)),H*(.5+.25*Math.sin(t/1700)));requestAnimationFrame(drift)})(0);
}else setLens(W*.7,H*.45);

/* Bonus level: Pipe Runner mini-game */
const gc=$('#game'),g=gc.getContext('2d'),ui=$('#gameUi'),msg=$('#gameMsg'),gbtn=$('#gameBtn'),bestEl=$('#best'),box=$('.game');
const GW=box.clientWidth<600?440:720,GH=260,GROUND=214; /* narrower world on phones so the robot and pipes stay big */
let best=+store.get('pr-best')||0;bestEl.textContent=best;
let overAt=0,st='idle',bot,obs,chips,speed,dist,score,spawn,last,visible=false,raf=0;
(function scale(){const d=Math.min(devicePixelRatio||1,2);gc.style.aspectRatio=GW+'/'+GH;gc.width=GW*d;gc.height=GH*d;g.setTransform(d,0,0,d,0,0)})();
function reset(){bot={x:GW<600?60:90,y:GROUND-34,vy:0,w:30,h:34,ground:true};obs=[];chips=[];speed=reduce?4:5;dist=0;score=0;spawn=60}
function jump(){if(st!=='run')return;if(bot.ground){bot.vy=-11.5;bot.ground=false}}
function start(){visible=true;reset();st='run';ui.hidden=true;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function over(){
  st='over';overAt=performance.now();if(score>best){best=score;store.set('pr-best',best);bestEl.textContent=best}
  msg.textContent=`Score ${score}. Best ${best}.`;gbtn.querySelector('.px').textContent='Retry';ui.hidden=false;
}
function step(){
  dist+=speed;speed=Math.min(11,speed+.0025);score=Math.floor(dist/10);
  bot.vy+=.62;bot.y+=bot.vy;if(bot.y>=GROUND-bot.h){bot.y=GROUND-bot.h;bot.vy=0;bot.ground=true}
  if(--spawn<=0){
    const h=26+Math.random()*34,w=22+Math.random()*16;obs.push({x:GW+10,w,h,hot:Math.random()<.3});
    if(Math.random()<.6)chips.push({x:GW+10+w/2+60+Math.random()*80,y:GROUND-70-Math.random()*60,got:false});
    spawn=Math.max(46,Math.floor(95-speed*4+Math.random()*50));
  }
  for(const o of obs)o.x-=speed;for(const c of chips)c.x-=speed;
  obs=obs.filter(o=>o.x+o.w>-10);chips=chips.filter(c=>c.x>-20&&!c.got);
  const bx=bot.x+4,by=bot.y+4,bw=bot.w-8,bh=bot.h-4;
  for(const o of obs){if(bx<o.x+o.w&&bx+bw>o.x&&by+bh>GROUND-o.h)return over()}
  for(const c of chips){if(Math.abs(c.x-(bot.x+bot.w/2))<22&&Math.abs(c.y-(bot.y+bot.h/2))<26){c.got=true;dist+=150}}
}
function render(){
  g.fillStyle='#05080d';g.fillRect(0,0,GW,GH);
  g.strokeStyle='rgba(63,245,214,.08)';g.lineWidth=1;const off=(dist*.3)%40;
  for(let x=-off;x<GW;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,GROUND);g.stroke()}
  for(let y=20;y<GROUND;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(GW,y);g.stroke()}
  g.fillStyle='#0e1622';g.fillRect(0,GROUND,GW,GH-GROUND);g.fillStyle='#3ff5d6';g.fillRect(0,GROUND,GW,2);
  for(let x=-(dist%60);x<GW;x+=60){g.fillStyle='rgba(63,245,214,.25)';g.fillRect(x,GROUND+14,30,3)}
  for(const o of obs){const c=o.hot?'#ffb454':'#3ff5d6',top=GROUND-o.h;
    g.fillStyle=c;g.fillRect(o.x+4,top+8,o.w-8,o.h-8);g.fillRect(o.x,top,o.w,10);
    g.fillStyle='rgba(5,8,13,.5)';g.fillRect(o.x+o.w/2-2,top+12,4,o.h-14)}
  for(const c of chips){g.save();g.translate(c.x,c.y);g.rotate(Math.PI/4);g.fillStyle='#ff5fa2';g.shadowColor='#ff5fa2';g.shadowBlur=12;g.fillRect(-7,-7,14,14);g.restore()}
  const b=bot;g.fillStyle='#e8eef5';g.fillRect(b.x,b.y+6,b.w,b.h-12);g.fillRect(b.x+4,b.y,b.w-8,8);
  g.fillStyle='#05080d';g.fillRect(b.x+5,b.y+11,b.w-10,10);g.fillStyle='#3ff5d6';g.fillRect(b.x+8,b.y+14,5,5);g.fillRect(b.x+b.w-13,b.y+14,5,5);
  g.fillStyle='#a98bff';const leg=b.ground?Math.floor(dist/18)%2*4:2;g.fillRect(b.x+5,b.y+b.h-6,7,6-leg/2);g.fillRect(b.x+b.w-12,b.y+b.h-6,7,2+leg);
  g.fillStyle='#e8eef5';g.font='12px "Press Start 2P",monospace';g.textAlign='right';g.fillText(String(score).padStart(5,'0'),GW-16,28);
}
function loop(t){
  if(st!=='run')return render();
  let n=Math.min(4,Math.round((t-last)/(1000/60)));last=t;while(n-->0&&st==='run')step();
  render();if(st==='run')raf=requestAnimationFrame(loop);
}
reset();render();
gbtn.onclick=e=>{e.stopPropagation();if(st==='paused'){st='run';ui.hidden=true;last=performance.now();raf=requestAnimationFrame(loop)}else start()};
box.addEventListener('pointerdown',e=>{if(e.target.closest('#gameBtn'))return;if(st==='run')jump();else if(st==='idle'||(st==='over'&&performance.now()-overAt>600))start()});
addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='ArrowUp')&&st==='run'&&visible){e.preventDefault();jump()}});
function pause(){if(st!=='run')return;st='paused';cancelAnimationFrame(raf);ui.hidden=false;msg.textContent='Paused';gbtn.querySelector('.px').textContent='Resume'}
new IntersectionObserver(([en])=>{visible=en.isIntersecting;if(!visible)pause()},{threshold:.2}).observe(box);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
})();
