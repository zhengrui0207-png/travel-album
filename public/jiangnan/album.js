const A='assets/';
const pages=[
 {kind:'cover',title:'一梦入江南',chapter:'序 · 入梦',photos:['432A7476'],poem:'一卷园林清梦，\n半笺烟雨江南。'},
 {kind:'preface',title:'把时光，留在江南',chapter:'序 · 入梦',photos:['432A7472'],poem:'从一扇花窗望进去，\n日子便慢了下来。\n\n借一袭素衣，\n一柄纸伞，\n走进檐影深处。\n让风替我翻页，\n让江南替我记得。'},
 {kind:'portrait',title:'窗前有清风',chapter:'壹 · 入园',photos:['432A7473'],poem:'花影落在肩头，\n我把心事，轻轻交给风。'},
 {kind:'diptych',title:'撑一伞，入画',chapter:'壹 · 入园',photos:['432A7477','432A7478'],poem:'伞外是满园新绿，\n伞下是片刻的自己。'},
 {kind:'diptych',title:'回廊深处',chapter:'贰 · 回廊',photos:['432A7487','added-fan'],poem:'长廊把风留住，\n木窗把光筛成旧时模样。'},
 {kind:'portrait',title:'坐听庭院静',chapter:'贰 · 回廊',photos:['432A7497'],poem:'不急着赶路，\n在一方石栏上，坐满一段午后。'},
 {kind:'full',title:'檐下回眸',chapter:'贰 · 回廊',photos:['432A7500'],poem:'回眸时，青瓦无言，\n只有衣袖，接住了风。'},
 {kind:'diptych',title:'一袖清凉',chapter:'贰 · 回廊',photos:['432A7508','432A7511'],poem:'团扇轻摇，绿意渐深。\n走过的每一步，都有草木相迎。'},
 {kind:'landscape',title:'听荷',chapter:'叁 · 听荷',photos:['432A7523'],poem:'沿着曲桥，走入一池碧色。\n荷叶不语，却把夏天说得很长。'},
 {kind:'full',title:'满池都是诗',chapter:'叁 · 听荷',photos:['432A7517_(2)'],poem:'风过荷塘，层层绿意。'},
 {kind:'full',title:'满池都是诗',chapter:'叁 · 听荷',photos:['added-lotus-front'],poem:'我站在诗里，忘了归期。'},
 {kind:'diptych',title:'绿意里的小憩',chapter:'叁 · 听荷',photos:['432A7519','added-lotus-side'],poem:'把喧嚣留在园外，\n把这一刻，留给自己。'},
 {kind:'full',title:'伞下光阴',chapter:'叁 · 听荷',photos:['432A7521'],poem:'一柄纸伞，半肩柔光。\n原来寻常片刻，也值得珍藏。'},
 {kind:'diptych',title:'临水，见心',chapter:'肆 · 临水',photos:['432A7527','432A7528'],poem:'水面留着天色，衣袂沾着清风。\n心里的远方，此刻就在眼前。'},
 {kind:'portrait',title:'此身在画中',chapter:'肆 · 临水',photos:['432A7529'],poem:'不问风从哪里来，\n只记得，今天的自己很自在。'},
 {kind:'full',title:'梦醒，仍是江南',chapter:'终 · 留梦',photos:['added-green'],poem:'走出园门，仍有一片绿意跟着我。\n那些没有说出口的喜欢，都留在这一卷里。'},
 {kind:'back',title:'且将此刻，藏作长久。',chapter:'终 · 留梦',photos:['432A7468'],poem:'山水有重逢，清梦有回声。\n愿再来时，仍是这般好光景。'}
];
const $=s=>document.querySelector(s),book=$('#book');
let current=0,busy=false,autoTimer=null,resizeTimer;
const mobile=()=>matchMedia('(max-width: 700px)').matches;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function esc(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function photo(id,cls=''){return `<img class="photo ${cls}" src="${A+id}.jpg" alt="${esc(pages.find(p=>p.photos.includes(id))?.title||'姑苏游园写真')}" data-photo="${id}" draggable="false">`;}
function pageHTML(i){
 const p=pages[i],num=String(i+1).padStart(2,'0');
 const label=`<div class="page-top"><span>${p.chapter}</span><span>姑苏游园记</span></div>`;
 const tail=`<div class="page-bottom"><span>一梦入江南</span><b>${num}</b></div>`;
 const text=`<div class="page-copy"><h2>${p.title}</h2><p>${p.poem}</p></div>`;
 let inside='';
 if(p.kind==='cover') inside=`<img class="cover-design" src="design/cover-design-paper.png" alt="一梦入江南封面" draggable="false"><span class="cover-glyph" aria-hidden="true">姑</span>`;
 else if(p.kind==='back') inside=`${photo(p.photos[0])}<div class="back-photo-copy"><span class="red-seal">江南</span><h2>${p.title}</h2><p>${p.poem}</p></div>${tail}`;
 else if(p.kind==='preface'||p.kind==='farewell') inside=`${label}<div class="essay">${text}<div class="essay-photo">${photo(p.photos[0])}</div><span class="red-seal">${p.kind==='preface'?'入梦':'留梦'}</span></div>${tail}`;
 else if(p.kind==='full') inside=`${photo(p.photos[0])}<div class="photo-shade"></div><div class="full-label">${p.chapter}</div>${text}${tail}`;
 else if(p.kind==='portrait') inside=`${label}<div class="portrait-frame">${photo(p.photos[0])}</div>${text}${tail}`;
 else if(p.kind==='diptych') inside=`${label}<div class="paired">${p.photos.map(id=>photo(id)).join('')}</div>${text}${tail}`;
 else inside=`${label}<div class="landscape-heading"><span>叁</span><h2>${p.title}</h2><small>风起处，荷香来。</small></div><div class="landscape-frame">${photo(p.photos[0])}</div><p class="landscape-poem">${p.poem}</p>${tail}`;
 return `<article class="page ${p.kind}" data-page="${i+1}" aria-label="第${i+1}页：${p.title}">${inside}</article>`;
}
function visibleAt(n){return mobile()||n===0||n===pages.length-1?[n]:[n,n+1].filter(i=>i<pages.length-1);}
function normalize(n){return mobile()||n===0||n===pages.length-1?n:(n%2===0?n-1:n);}
function render(){
 const visible=visibleAt(current);book.innerHTML=visible.map(pageHTML).join('');book.classList.toggle('spread',visible.length===2);
 $('#prev').disabled=current===0;$('#next').disabled=current===pages.length-1;
 $('#page-label').textContent=visible.map(i=>String(i+1).padStart(2,'0')).join(' — ')+' / '+pages.length;
 $('#chapter').textContent=pages[current].chapter;
 document.querySelectorAll('.dot').forEach((d,i)=>{d.classList.toggle('active',visible.includes(i));d.setAttribute('aria-current',visible.includes(i)?'page':'false');});
 history.replaceState(null,'','#page='+(current+1));
 book.querySelectorAll('[data-photo]').forEach(img=>img.addEventListener('dblclick',()=>showPhoto(img.dataset.photo)));
 if(current===pages.length-1)stopAuto();
}
function go(n,animate=true){
 n=normalize(Math.max(0,Math.min(pages.length-1,n)));if(busy||n===current)return;
 if(!animate||reduced()){current=n;render();return;}
 busy=true;const before=current,direction=n>current?'forward':'backward';
 const old=book.cloneNode(true);old.removeAttribute('id');old.classList.add('turning',direction);old.setAttribute('aria-hidden','true');old.inert=true;
 current=n;render();$('.book-shell').append(old);
 const visible=visibleAt(before),leaf=old.children[direction==='forward'?visible.length-1:0];
 const animation=leaf.animate([{transform:'rotateY(0deg)',filter:'brightness(1)'},{transform:`rotateY(${direction==='forward'?'-':'+'}88deg)`,filter:'brightness(.65)',offset:.65},{transform:`rotateY(${direction==='forward'?'-':'+'}110deg)`,opacity:0}],{duration:650,easing:'cubic-bezier(.3,.05,.25,1)',fill:'forwards'});
 animation.finished.finally(()=>{old.remove();busy=false;});
}
function step(d){if(!mobile()&&d<0&&current===pages.length-1)return go(current-1);go(current+(mobile()?d:(d>0?(current===0?1:2):(current===1? -1:-2))));}
function stopAuto(){clearInterval(autoTimer);autoTimer=null;$('#auto').textContent='▷ 自动翻页';$('#auto').setAttribute('aria-pressed','false');}
$('#prev').onclick=()=>{stopAuto();step(-1);};$('#next').onclick=()=>{stopAuto();step(1);};
$('#auto').onclick=()=>{if(autoTimer)return stopAuto();if(current===pages.length-1)go(0);autoTimer=setInterval(()=>step(1),6500);$('#auto').textContent='Ⅱ 暂停翻页';$('#auto').setAttribute('aria-pressed','true');};
$('#dots').innerHTML=pages.map((p,i)=>`<button class="dot" aria-label="前往第${i+1}页：${p.title}" title="${i+1} · ${p.title}"></button>`).join('');
document.querySelectorAll('.dot').forEach((b,i)=>b.onclick=()=>{stopAuto();go(i);});
$('#thumbs').innerHTML=pages.map((p,i)=>`<button class="thumb" data-index="${i}" aria-label="阅读第${i+1}页：${p.title}"><div class="thumb-art">${p.photos.length?photo(p.photos[0]):'<span>江南</span>'}</div><span><em>${String(i+1).padStart(2,'0')}</em> ${p.title}</span></button>`).join('');
$('#overview').onclick=()=>{stopAuto();$('#gallery').showModal();};$('#close-gallery').onclick=()=>$('#gallery').close();
document.querySelectorAll('.thumb').forEach(b=>b.onclick=()=>{$('#gallery').close();go(+b.dataset.index);});
function showPhoto(id){stopAuto();$('#large-photo').src=A+id+'.jpg';$('#lightbox').showModal();}
$('#close-photo').onclick=()=>$('#lightbox').close();
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
function notify(message){$('#notice').textContent=message;$('#notice').classList.add('show');setTimeout(()=>$('#notice').classList.remove('show'),4000);}
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify('当前浏览器不支持全屏，可使用浏览器的全屏阅读功能。');}};
document.addEventListener('fullscreenchange',()=>$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'退出全屏':'全屏阅读'));
const audio=$('#bgm');audio.volume=.38;
$('#music').onclick=async()=>{try{if(audio.paused)await audio.play();else audio.pause();}catch{notify('音乐暂时无法播放，请确认相册的 assets 文件夹完整。');}};
function musicState(){const on=!audio.paused;$('#music').classList.toggle('playing',on);$('#music').setAttribute('aria-pressed',String(on));$('#music').setAttribute('aria-label',on?'暂停背景音乐':'播放背景音乐');$('#music-label').textContent=on?'江南清梦 · 播放中':'听一曲江南';}
audio.addEventListener('play',musicState);audio.addEventListener('pause',musicState);
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||['INPUT','TEXTAREA'].includes(e.target.tagName))return;if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();stopAuto();if(e.key==='Home')go(0);else if(e.key==='End')go(pages.length-1);else step(e.key==='ArrowRight'?1:-1);}});
let start=null;
book.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')start={x:e.clientX,y:e.clientY};});
book.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){stopAuto();step(dx<0?1:-1);}});
book.addEventListener('pointercancel',()=>start=null);
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!busy){current=normalize(current);render();}},150);});
window.addEventListener('hashchange',()=>{const n=Number(location.hash.split('=')[1]);if(Number.isFinite(n))go(n-1);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAuto();});
current=normalize(Math.max(0,Math.min(pages.length-1,(Number(location.hash.split('=')[1])||1)-1)));render();
