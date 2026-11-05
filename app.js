(()=>{
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P=window.PROJECTS,list=$('#list'),worlds=$('#worlds'),modal=$('#modal'),body=$('#mbody');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* Worlds (filters) and level cards */
const WORLD={AR:'AR',VR:'VR',MR:'Mixed reality',Twin:'Digital twin',Tools:'Dev tools',Games:'Games'};
const COLOR={AR:'var(--lens)',VR:'var(--violet)',MR:'var(--amber)',Twin:'var(--blue)',Tools:'var(--green)',Games:'var(--pink)'};
const ytId=u=>{const m=(u||'').match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);return m&&m[1]};
const lvl=i=>String(i+1).padStart(2,'0');
const order=Object.keys(WORLD).filter(w=>P.some(p=>p.world===w));
worlds.innerHTML=[`<button aria-pressed="true" data-w="All">All<span class="n">${P.length}</span></button>`]
  .concat(order.map(w=>`<button aria-pressed="false" data-w="${w}" style="--c:${COLOR[w]}">${WORLD[w]}<span class="n">${P.filter(p=>p.world===w).length}</span></button>`)).join('');

function loot(p){return [p.video&&'Video',p.appStore&&'App Store',p.playStore&&'Google Play',p.demo&&'Live demo'].filter(Boolean)}
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
  const links=[[p.playStore,'Get it on Google Play'],[p.appStore,'Download on the App Store'],[p.demo,'Open live demo']].filter(l=>l[0])
    .map(l=>`<a class="btn" href="${esc(l[0])}" target="_blank" rel="noopener">${l[1]}</a>`).join('');
  modal.style.setProperty('--c',COLOR[p.world]||'var(--lens)');
  body.innerHTML=`<p class="px">Level ${lvl(i)} · ${esc(WORLD[p.world]||p.world)}</p><h3 id="mt">${esc(p.title)}</h3><p class="org">${esc(p.org)}</p>`
    +(p.video?`<div class="media">${media(p.video)}</div>`:'')
    +`<h4>Mission</h4><p>${esc(p.summary)}</p>`
    +(p.impact?`<h4>Result</h4><p>${esc(p.impact)}</p>`:'')
    +`<h4>Loadout</h4><div class="chips">${p.stack.map(s=>`<span>${esc(s)}</span>`).join('')}</div>`
    +(links?`<p class="links">${links}</p>`:'');
  modal.showModal();
};
body.onclick=e=>{
  const f=e.target.closest('.facade');
  if(f){f.outerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${f.dataset.yt}?rel=0&autoplay=1&playsinline=1" title="Project video" allow="autoplay; fullscreen" allowfullscreen></iframe>`;return}
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

})();
