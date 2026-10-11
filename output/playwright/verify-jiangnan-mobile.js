async (page) => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const assert=(v,m)=>{if(!v)throw Error(m)};
 await page.goto('http://127.0.0.1:4175');await page.setViewportSize({width:390,height:844});
 await page.waitForFunction(()=>document.querySelectorAll('#book .page').length===1);
 const root='/Users/zhengrui/Documents/ChatGPT/旅行相册/output/playwright/';
 await page.getByRole('button',{name:'下一页',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.turning'));
 assert(await page.locator('#book .page').getAttribute('data-page')==='2','mobile next');
 await page.screenshot({path:root+'jiangnan-mobile-inside.png'});
 await page.getByRole('button',{name:'上一页',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.turning'));
 assert(await page.locator('#book .page').getAttribute('data-page')==='1','mobile previous');
 await page.locator('#book').dispatchEvent('pointerdown',{pointerType:'touch',clientX:310,clientY:350});
 await page.locator('#book').dispatchEvent('pointerup',{pointerType:'touch',clientX:90,clientY:354});
 await page.waitForFunction(()=>!document.querySelector('.turning'));
 assert(await page.locator('#book .page').getAttribute('data-page')==='2','touch swipe');
 await page.getByRole('button',{name:'▷ 自动翻页',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#book .page').dataset.page==='3');
 await page.getByRole('button',{name:'Ⅱ 暂停翻页',exact:true}).click();
 await page.waitForFunction(()=>!document.querySelector('.turning'));
 await page.emulateMedia({reducedMotion:'reduce'});
 for(let i=1;i<=16;i++){
  await page.getByRole('button',{name:new RegExp('^前往第'+i+'页：')}).click();
  assert(await page.locator('#book .page').getAttribute('data-page')===String(i),'page '+i);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no overflow '+i);
 }
 await page.keyboard.press('Home');assert(await page.locator('#book .page').getAttribute('data-page')==='1','Home');
 await page.keyboard.press('End');assert(await page.locator('#book .page').getAttribute('data-page')==='16','End');
 await page.keyboard.press('ArrowLeft');assert(await page.locator('#book .page').getAttribute('data-page')==='15','left');
 await page.goto('file:///Users/zhengrui/Documents/ChatGPT/旅行相册/public/jiangnan/index.html');
 assert(await page.locator('#book .page').getAttribute('data-page')==='1','offline starts');
 await page.locator('#book .photo').evaluateAll(imgs=>Promise.all(imgs.map(im=>im.decode())));
 await page.getByRole('button',{name:'播放背景音乐',exact:true}).click();
 await page.waitForFunction(()=>!document.querySelector('audio').paused&&document.querySelector('audio').currentTime>0);
 await page.getByRole('button',{name:'暂停背景音乐',exact:true}).click();
 await page.getByRole('button',{name:'下一页',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#book .page').dataset.page==='2');
 assert(errors.length===0,'runtime errors '+errors);
 await page.goto('http://127.0.0.1:4175');await page.setViewportSize({width:1512,height:982});
 return {mobile:'passed all 16 pages',swipe:'passed',auto:'passed',offline:'passed',offlineAudio:'passed',runtimeErrors:errors};
}
