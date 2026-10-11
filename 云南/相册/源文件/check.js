
const puppeteer = require('puppeteer-core');
const D = '/Users/zhengrui/Documents/ChatGPT/旅行相册/云南/相册';
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, userDataDir: '/tmp/yn/chrome-prof', args: ['--allow-file-access-from-files','--no-sandbox','--disable-gpu'] });
  const p = await b.newPage(); await p.setViewport({ width: 1300, height: 900 });
  await p.goto('file://' + encodeURI(D + '/云南旅行相册.html'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((pg, i) => {
      const P = pg.getBoundingClientRect();
      const R = e => { const r = e.getBoundingClientRect(); return { l: r.left - P.left, t: r.top - P.top, r: r.right - P.left, b: r.bottom - P.top }; };
      const phs = [...pg.querySelectorAll('.ph:not(.bleed)')];
      pg.querySelectorAll('.tx,.seal,.folio').forEach(t => {
        const rg = document.createRange(); rg.selectNodeContents(t); const rr = rg.getBoundingClientRect();
        const a = { l: rr.left - P.left, t: rr.top - P.top, r: rr.right - P.left, b: rr.bottom - P.top };
        const name = (t.textContent || '').slice(0, 12);
        if (a.l < 20 || a.t < 10 || a.r > 1103 || a.b > 784) out.push('p'+(i+1)+' 越界 '+name+' '+[a.l,a.t,a.r,a.b].map(Math.round));
        phs.forEach(ph => { const q = R(ph); const ov = Math.min(a.r, q.r) - Math.max(a.l, q.l), oh = Math.min(a.b, q.b) - Math.max(a.t, q.t);
          if (ov > 4 && oh > 4) out.push('p'+(i+1)+' 压图 '+name+' <> '+ph.querySelector('img').src.split('/').pop()+' '+Math.round(ov)+'x'+Math.round(oh)); });
      });
      const T=[...pg.querySelectorAll('.tx,.seal')].map(t=>{const rg=document.createRange();rg.selectNodeContents(t);const x=rg.getBoundingClientRect();return [t.textContent.slice(0,8),x]});for(let a=0;a<T.length;a++)for(let c2=a+1;c2<T.length;c2++){const A=T[a][1],B=T[c2][1];if(Math.min(A.right,B.right)-Math.max(A.left,B.left)>2&&Math.min(A.bottom,B.bottom)-Math.max(A.top,B.top)>2)out.push('p'+(i+1)+' 字叠 '+T[a][0]+' / '+T[c2][0]);}
      phs.forEach(ph => { const q = R(ph); if (q.l < -2 || q.t < -2 || q.r > 1125 || q.b > 796) out.push('p'+(i+1)+' 图越界 '+ph.querySelector('img').src.split('/').pop()+' '+Math.round(q.r)+','+Math.round(q.b)); });
    });
    return out;
  });
  console.log(r.join('\n') || 'OK'); await b.close();
})();
