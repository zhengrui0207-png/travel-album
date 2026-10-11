const puppeteer = require('puppeteer-core');
const D = '/Users/zhengrui/Documents/ChatGPT/旅行相册/云南/相册';
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, userDataDir: '/tmp/yn/chrome-prof', args: ['--allow-file-access-from-files','--no-sandbox','--disable-gpu','--no-first-run'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2.5 });
  await p.goto('file://' + encodeURI(D + '/云南旅行相册.html'), { waitUntil: 'networkidle0' });
  await p.evaluate(async () => { document.body.classList.add('shot'); await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(()=>{}))); });
  console.log('fonts', await p.evaluate(() => [...document.fonts].map(f => f.family + ':' + f.status).join(',')));
  const pages = await p.$$('.page');
  for (let i = 0; i < pages.length; i++) {
    const n = (i + 1 < 10 ? '0' : '') + (i + 1);
    await pages[i].screenshot({ path: D + '/png/page_' + n + '.png' });
  }
  await p.evaluate(() => document.body.classList.remove('shot'));
  await p.pdf({ path: D + '/云南旅行相册_打印版.pdf', width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  await b.close(); console.log('done', pages.length);
})();
