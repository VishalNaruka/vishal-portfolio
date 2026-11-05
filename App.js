(()=>{
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P=window.PROJECTS,list=$('#list'),filters=$('#filters'),modal=$('#modal'),body=$('#mbody');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* Project list + filters */
const cats=['All',...new Set(P.flatMap(p=>p.cats))];
filters.innerHTML=cats.map((c,i)=>`<button aria-pressed="${i==0}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
function draw(c){
  list.innerHTML=P.filter(p=>c==='All'||p.cats.includes(c)).map(p=>{
    const has=[p.video&&'Video',p.playStore&&'Google Play',p.appStore&&'App Store',p.demo&&'Live demo'].filter(Boolean).join(', ');
    return `<li><button data-id="${p.id}"><h3>${esc(p.title)}</h3><span class="org">${esc(p.org)}</span><span class="sum">${esc(p.summary)}</span>${has?`<span class="badges">${has}</span>`:''}</button></li>`}).join('');
}
filters.onclick=e=>{const b=e.target.closest('button');if(!b)return;filters.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw(b.dataset.c)};
draw('All');

/* Project modal */
function embed(u){
  const y=u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  if(y)return `<iframe src="https://www.youtube-nocookie.com/embed/${y[1]}?rel=0" title="Project video" allow="fullscreen" allowfullscreen></iframe>`;
  const v=u.match(/vimeo\.com\/(\d+)/);
  if(v)return `<iframe src="https://player.vimeo.com/video/${v[1]}" title="Project video" allowfullscreen></iframe>`;
  return `<video src="${esc(u)}" controls preload="metadata" playsinline></video>`;
}
list.onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  const p=P.find(x=>x.id===b.dataset.id);
  const links=[[p.playStore,'Get it on Google Play'],[p.appStore,'Download on the App Store'],[p.demo,'Open live demo']].filter(l=>l[0])
    .map(l=>`<a class="btn" href="${esc(l[0])}" target="_blank" rel="noopener">${l[1]}</a>`).join('');
  body.innerHTML=`<h3 id="mt">${esc(p.title)}</h3><p class="org">${esc(p.org)}</p><p>${esc(p.summary)}</p><p><b style="color:var(--text)">Impact.</b> ${esc(p.impact)}</p><p>Built with ${p.stack.map(esc).join(', ')}.</p>`
    +(p.video?`<div class="media">${embed(p.video)}</div>`:'')+(links?`<p>${links}</p>`:'');
  modal.showModal();
};
$('#close').onclick=()=>modal.close();
modal.onclick=e=>{if(e.target===modal)modal.close()};
modal.onclose=()=>{body.innerHTML=''}; /* clearing the DOM stops any playing video */

/* Counters and reveal, run once when visible */
const io=new IntersectionObserver(es=>es.forEach(en=>{
  if(!en.isIntersecting)return;io.unobserve(en.target);
  const el=en.target,n=+el.dataset.n,s=el.dataset.s||'';
  if(reduce){el.textContent=n.toLocaleString()+s;return}
  const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1200);el.textContent=Math.round(n*(1-Math.pow(1-k,3))).toLocaleString()+(k==1?s:'');if(k<1)requestAnimationFrame(f)})(t0);
}),{threshold:.6});
document.querySelectorAll('[data-n]').forEach(el=>io.observe(el));

/* Hero: hidden pipe network revealed by a cursor lens (echoes the DEWA see-through viewer) */
const hero=$('#hero'),cv=$('#net'),cx=cv.getContext('2d');
let W,H,seg=[];
function build(){
  const d=Math.min(devicePixelRatio||1,2);W=hero.clientWidth;H=hero.clientHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
  seg=[];const g=Math.max(54,W/22);
  for(let y=g/2;y<H;y+=g){let x=0;while(x<W){const run=g*(1+Math.floor(Math.random()*4));seg.push([x,y,Math.min(W,x+run),y,Math.random()<.2]);x+=run+g*Math.random()}}
  for(let x=g;x<W;x+=g*1.6){let y=0;while(y<H){const run=g*(1+Math.floor(Math.random()*3));seg.push([x,y,x,Math.min(H,y+run),Math.random()<.2]);y+=run+g*Math.random()}}
  cx.clearRect(0,0,W,H);cx.lineCap='round';
  for(const [a,b,c,d2,hot] of seg){cx.strokeStyle=hot?'#ffb454':'#4ff0d2';cx.lineWidth=hot?5:3;cx.globalAlpha=.9;cx.beginPath();cx.moveTo(a,b);cx.lineTo(c,d2);cx.stroke()}
  cx.globalAlpha=1;
}
build();addEventListener('resize',build);
const setLens=(x,y)=>{hero.style.setProperty('--mx',x+'px');hero.style.setProperty('--my',y+'px');cv.style.setProperty('--mx',x+'px');cv.style.setProperty('--my',y+'px')};
hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();setLens(e.clientX-r.left,e.clientY-r.top)});
if(!reduce){ /* idle drift until the user moves a pointer, so touch screens still see the effect */
  let used=false;hero.addEventListener('pointermove',()=>used=true);
  (function drift(t){if(!used){const r=hero.getBoundingClientRect();setLens(W*(.5+.3*Math.cos(t/2400)),H*(.5+.25*Math.sin(t/1700)))}requestAnimationFrame(drift)})(0);
}
})();