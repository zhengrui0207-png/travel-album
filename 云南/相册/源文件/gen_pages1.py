from gen_base import *

def page(inner, dark=False):
    return f'<section class="page{" dark" if dark else ""}">{inner}</section>'

P = []

# 1 封面
P.append(page(
    '<div class="pattern" style="left:0;top:0;width:34px;height:794px;opacity:.35"></div>'
    + ph('IMG_8001', 590, 70, 440, 654, 0, 'arch', z=3)
    + '<div class="band" style="left:560px;top:430px;width:500px;height:330px;border:1.5px solid rgba(199,154,75,.5);border-radius:999px 999px 0 0;border-bottom:none;top:40px;height:720px"></div>'
    + txt('YUNNAN · A JOURNEY ABOVE THE CLOUDS', 110, 124, 460, 'en')
    + txt('云端<br>秘境', 106, 208, 400, 'h1', 'font-size:112px;line-height:1.05')
    + '<div class="rule" style="left:110px;top:462px;width:66px"></div>'
    + txt('纳西古韵 · 我们的云南手记', 110, 486, 420, 'body', 'font-size:22px;letter-spacing:6px')
    + txt('丽江　泸沽湖　玉龙雪山　虎跳峡　白水台　纳帕海', 110, 536, 440, 'body', 'font-size:14px;letter-spacing:3px;opacity:.75')
    + txt('二〇二六 · 夏', 110, 650, 300, 'en', 'font-size:14px')
    + '<div class="seal fill" style="left:470px;top:630px">云南</div>'
    + mo('sun', 468, 110, 52, 'var(--gold)', 0, .9)
    + mo('feather', 1046, 560, 34, 'var(--gold)', 18, .8)
    + mo('star', 548, 700, 18, 'var(--gold)', 0, .9),
    dark=True))

# 2 序
P.append(page(
    ph('DJI_20260617114744_0237_D', 0, 0, 540, 794, 0, 'bleed')
    + '<div class="band" style="left:540px;top:0;width:10px;height:794px;background:var(--cin)"></div>'
    + txt('PROLOGUE', 630, 96, 300, 'en')
    + txt('序 · 风的方向', 628, 126, 420, 'h2')
    + txt('有些地方，是要两个人一起去的。<br><br>'
          '风从玉龙雪山上吹下来，吹过古城的瓦檐、泸沽湖的水面、金沙江的峡谷，一路吹到香格里拉的草甸。<br><br>'
          '我们跟着风走了一程，把沿途的光，一帧一帧，收进这本册子里。', 630, 214, 410, 'body poem', 'font-size:18px')
    + '<svg class="route" style="left:630px;top:560px" width="420" height="120" viewBox="0 0 420 120">'
      '<path d="M14 90 C70 20 110 100 170 56 S270 20 300 70 S380 40 406 24" fill="none" stroke="#b8432f" stroke-width="1.6" stroke-dasharray="5 6"/>'
      + ''.join(f'<circle cx="{x}" cy="{y}" r="5" fill="#1f3a5f"/><text x="{x}" y="{y+ (26 if i%2==0 else -14)}" text-anchor="middle" font-family="KT" font-size="14" fill="#3b2a1e">{n}</text>'
                for i, (x, y, n) in enumerate([(14, 90, '丽江'), (92, 58, '泸沽湖'), (170, 56, '玉龙雪山'), (246, 42, '虎跳峡'), (318, 66, '白水台'), (406, 24, '纳帕海')]))
    + '</svg>'
    + mo('mount', 962, 96, 70, 'var(--ind)', 0, .6)
    + folio(2, '云端秘境')))

# 3 丽江 · 章首
P.append(page(
    ph('IMG_7971', 0, 0, 530, 794, 0, 'bleed')
    + '<div class="pattern" style="left:530px;top:0;width:22px;height:794px;opacity:.55"></div>'
    + txt('CHAPTER I', 640, 96, 300, 'en')
    + txt('丽江', 636, 136, 400, 'h1', 'font-size:96px')
    + txt('部落公主 · 暮色里的野性', 640, 262, 400, 'body', 'font-size:22px;letter-spacing:5px;color:var(--gold)')
    + '<div class="rule" style="left:640px;top:312px;width:60px;background:var(--gold)"></div>'
    + txt('暮色落进古城的时候，我换上了另一个自己。<br>'
          '把野性穿在身上，把山风别进发间，<br>'
          '像从东巴经卷里走出来的女孩——<br>'
          '不问归期，只听风的方向。', 640, 344, 420, 'body poem')
    + txt('LIJIANG · THE TRIBAL PRINCESS', 640, 590, 400, 'en', 'font-size:11px')
    + mo('sun', 980, 80, 64, 'var(--cin)', 0, .9)
    + mo('feather', 1040, 520, 36, 'var(--gold)', -14, .8)
    + mo('eye', 640, 640, 60, 'var(--gold)', 0, .7)
    + folio(3, '丽江', True), dark=True))

# 4 丽江 · 拼贴一
P.append(page(
    ph('IMG_7980', 60, 70, 330, 494, -2.5, 'film', z=3)
    + ph('IMG_7985', 420, 110, 250, 374, 2, 'polaroid', '眉间朱砂', z=4)
    + ph('IMG_7994', 700, 60, 360, 300, 0, 'film', z=2)
    + ph('IMG_8002', 790, 390, 250, 330, -3, 'polaroid', '回眸', z=4)
    + tape(170, 58, 100, -6) + tape(890, 378, 80, 8)
    + txt('野性不是张扬，<br>是终于不再躲藏。', 94, 612, 420, 'quote')
    + txt('他站在我身后，像一座沉默的山。', 430, 560, 330, 'body', 'font-size:16px;color:var(--muted)')
    + mo('bird', 690, 640, 60, 'var(--cin)', 0, .8)
    + '<div class="seal" style="left:520px;top:640px">暮色</div>'
    + folio(4, '丽江 · 部落公主')))
