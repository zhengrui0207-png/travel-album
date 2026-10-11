from gen_pages2 import *

P[-1] = P[-1].replace('>香格里拉</div>', '>东巴</div>')

# 12 纳帕海 · 章首
P.append(page(
    ph('IMG_2860', 0, 0, 530, 794, 0, 'bleed')
    + '<div class="pattern" style="left:530px;top:0;width:22px;height:794px;opacity:.5"></div>'
    + txt('CHAPTER VI · NAPA LAKE', 640, 110, 400, 'en')
    + txt('纳帕海', 636, 152, 420, 'h1', 'font-size:92px')
    + txt('民族风 · 草原上的彩衣', 640, 262, 400, 'body', 'font-size:22px;letter-spacing:5px;color:var(--cin)')
    + '<div class="rule" style="left:640px;top:312px;width:60px"></div>'
    + txt('到了香格里拉，天忽然就高了。<br>'
          '草甸一直铺到山脚，牦牛低头吃着云的影子。<br>'
          '我穿上缀满花纹的彩衣，<br>'
          '风一吹，裙摆就成了经幡。', 640, 344, 430, 'body poem')
    + mo('sun', 980, 80, 64, 'var(--gold)', 0, .9)
    + mo('bird', 640, 620, 70, 'var(--ind)', 0, .7)
    + folio(12, '纳帕海')))

# 13 纳帕海 · 拼贴一
P.append(page(
    ph('IMG_2874', 60, 64, 620, 413, -1, 'film', z=2)
    + ph('IMG_2863', 712, 64, 360, 240, 1.5, 'film', z=3)
    + tape(330, 50, 100, -4)
    + txt('你说，这里的风是有颜色的——<br>青稞的绿，经幡的红，<br>还有我裙角上，那一抹靛蓝。', 70, 522, 620, 'quote', 'font-size:26px')
    + txt('牦牛不急，我们也不急。<br>在海拔三千米的草原上，<br>连时间都走得慢一点。', 740, 360, 330, 'body', 'font-size:16px;line-height:1.95')
    + mo('feather', 1000, 500, 30, 'var(--cin)', 20, .8)
    + mo('bird', 760, 500, 60, 'var(--ind)', 0, .6)
    + folio(13, '纳帕海')))

# 14 纳帕海 · 拼贴二
P.append(page(
    ph('WX_224910', 0, 0, 1123, 400, 0, 'bleed')
    + ph('IMG_2898', 100, 330, 375, 250, -2.5, 'film', z=4)
    + ph('IMG_2918', 560, 350, 375, 250, 1.5, 'film', z=4)
    + tape(230, 318, 80, -6) + tape(700, 338, 80, 5)
    + txt('草原很大，我们很小；<br>可你一回头，整个世界就只剩下我们。', 100, 636, 620, 'quote', 'font-size:24px')
    + txt('NAPA · SHANGRI-LA', 780, 660, 300, 'en')
    + folio(14, '纳帕海')))

# 15 尾声
P.append(page(
    ph('WX_225200', 0, 0, 1123, 794, 0, 'bleed', z=1)
    + '<div class="band" style="inset:0;z-index:2;background:linear-gradient(0deg,rgba(16,32,58,.88) 0,rgba(16,32,58,.5) 40%,rgba(16,32,58,.05) 75%)"></div>'
    + txt('EPILOGUE', 0, 470, 1123, 'en', 'text-align:center;color:var(--gold)')
    + txt('后记 · 风会记得', 0, 500, 1123, 'h2', 'text-align:center;color:#f4ead6')
    + txt('从古城的暮色到草原的晴空，<br>我们走过了雪山、湖泊、峡谷与白台。<br>'
          '照片会褪色，可那些风、那些光、那些你看我的眼神，<br>都已经落进了心里，成了我们自己的东巴经。', 0, 578, 1123, 'body', 'text-align:center;color:#efe6d4;font-size:17px;line-height:2')
    + '<div class="seal fill" style="left:532px;top:722px;transform:rotate(0);width:58px;height:58px">同行</div>'
    + folio(15, '二〇二六 · 云南', True), dark=True))

GRAIN_CSS = f':root{{--grain:url("{GRAIN}")}}'
css = open('/tmp/yn/style.css', encoding='utf-8').read()
html = ('<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>云端秘境 · 我们的云南手记</title><style>' + css + GRAIN_CSS + '</style></head><body><main class="book">'
        + '\n'.join(P) + '</main></body></html>')
OUT = '/Users/zhengrui/Documents/ChatGPT/旅行相册/云南/相册/云南旅行相册.html'
open(OUT, 'w', encoding='utf-8').write(html)
print('pages', len(P))
# 输出全部用字，用于字体子集
import re as _re
chars = set(_re.sub(r'<[^>]+>', '', html)) | set('0123456789')
open('/tmp/yn/chars.txt', 'w', encoding='utf-8').write(''.join(sorted(chars)))
