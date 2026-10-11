from gen_pages1 import *

# 5 丽江 · 拼贴二
P.append(page(
    ph('IMG_8019', 56, 64, 300, 450, -1.5, 'film', z=3)
    + ph('IMG_8053', 380, 64, 300, 450, 1.5, 'film', z=3)
    + tape(150, 50, 90, -5) + tape(480, 52, 90, 6)
    + txt('SOUVENIR · 01', 724, 76, 330, 'en')
    + txt('银饰碰撞的声音，<br>是古城给我们的回音。', 724, 104, 350, 'body poem', 'font-size:18px')
    + ph('IMG_8009', 724, 250, 170, 250, -3, 'polaroid', '图腾', z=4)
    + ph('IMG_8011', 900, 280, 170, 250, 4, 'polaroid', '骨与羽', z=5)
    + ph('IMG_8038', 740, 560, 300, 190, -1, 'film', z=3)
    + txt('你牵起我的手，<br>整座古城都退成了背景。', 70, 572, 600, 'quote')
    + txt('——四方街以西，某个没有名字的黄昏', 74, 680, 520, 'body', 'font-size:15px;color:var(--muted)')
    + folio(5, '丽江 · 部落公主')))

# 6 丽江 · 拼贴三
P.append(page(
    ph('IMG_8079', 60, 60, 560, 373, -1, 'film', z=2)
    + ph('IMG_8058', 650, 60, 260, 390, 2, 'film', z=3)
    + txt('我是山野的女儿<br>　　　也是你一个人的公主', 960, 64, 120, 'vert body', 'font-size:20px;height:420px;color:var(--ind)')
    + ph('IMG_8074', 76, 470, 200, 290, -3, 'polaroid', '赤足', z=4)
    + ph('IMG_8081', 312, 462, 210, 300, 1.5, 'film', z=3)
    + ph('IMG_8082', 546, 474, 210, 300, -1.5, 'film', z=3)
    + tape(380, 452, 76, -4)
    + txt('羽毛、兽骨、赭石与朱红，<br>这些古老的颜色，<br>让我想起人类最初的浪漫——<br>用尽全身的力气，<br>去爱一个人，去敬一座山。', 790, 500, 290, 'body', 'font-size:16px;line-height:1.95')
    + mo('eye', 1000, 700, 50, 'var(--cin)', 0, .7)
    + folio(6, '丽江 · 部落公主')))

# 7 丽江 · 拼贴四
P.append(page(
    ph('IMG_8093', 60, 60, 300, 450, -1.5, 'film', z=3)
    + ph('IMG_8090', 390, 70, 250, 400, 0, 'arch', z=3)
    + ph('IMG_8111', 670, 60, 400, 300, 1, 'film', z=2)
    + ph('IMG_8096', 860, 392, 210, 300, 4, 'polaroid', '夜将至', z=4)
    + txt('夜色一层层漫上来，<br>篝火在远处噼啪作响。<br>我们把这一天的野，<br>小心地折好，放进口袋里。', 390, 506, 440, 'body poem')
    + txt('THE NIGHT FALLS ON THE ANCIENT TOWN', 64, 560, 300, 'en', 'font-size:11px;line-height:2')
    + mo('feather', 80, 620, 30, 'var(--gold)', -20, .85)
    + mo('star', 140, 660, 20, 'var(--cin)', 0, .9)
    + '<div class="seal fill" style="left:200px;top:640px">丽江</div>'
    + folio(7, '丽江 · 部落公主')))

# 8 泸沽湖
P.append(page(
    ph('DJI_20260618124417_0264_D', 0, 0, 1123, 420, 0, 'bleed')
    + ph('WX_224612', 650, 290, 210, 330, -3, 'polaroid', '湖畔', z=4)
    + ph('WX_224617', 876, 322, 210, 330, 4, 'polaroid', '风起时', z=5)
    + txt('CHAPTER II · LUGU LAKE', 70, 464, 400, 'en')
    + txt('泸沽湖 · 母亲湖的蓝', 66, 494, 560, 'h2')
    + txt('从高处看，湖是一块被山轻轻捧着的蓝玉。<br>'
          '猪槽船划开水面，格姆女神山在云里打盹。<br>'
          '换回寻常的衣裳，我们只是两个吹风的人，<br>'
          '什么也不做，就很好。', 70, 572, 560, 'body', 'font-size:17px;line-height:1.95')
    + mo('water', 560, 470, 70, 'var(--ind)', 0, .6)
    + folio(8, '泸沽湖')))

# 9 玉龙雪山
P.append(page(
    ph('WX_224608', 0, 0, 1123, 794, 0, 'bleed', z=1)
    + '<div class="band" style="inset:0;z-index:2;background:linear-gradient(90deg,rgba(16,32,58,.82) 0,rgba(16,32,58,.55) 34%,rgba(16,32,58,0) 62%)"></div>'
    + txt('CHAPTER III · JADE DRAGON SNOW MOUNTAIN', 80, 128, 460, 'en', 'color:var(--gold)')
    + txt('玉龙雪山', 76, 196, 460, 'h1', 'color:#f4ead6')
    + txt('纳西人说，雪山是三朵神的化身。<br>'
          '十三座峰顶终年不化，<br>像一条沉睡的银龙，枕着云。<br><br>'
          '站在四千米的风里，呼吸变得很慢，<br>心却前所未有地安静——<br>原来人在山面前，真的会变小，<br>也变得干净。', 80, 300, 420, 'body', 'color:#efe6d4;font-size:17px;line-height:1.95')
    + ph('WX_224616', 640, 400, 420, 315, 2, 'film', z=4)
    + tape(800, 388, 90, -4)
    + mo('mount', 80, 640, 80, 'var(--gold)', 0, .9)
    + folio(9, '玉龙雪山', True), dark=True))

# 10 虎跳峡
P.append(page(
    ph('IMG_2953', 372, 48, 240, 360, -1.5, 'film', z=3)
    + ph('HTX_tiger', 634, 64, 240, 320, 1.5, 'film', z=3)
    + ph('WX_225204', 896, 40, 190, 290, 3, 'polaroid', '怒涛', z=4)
    + ph('WX_225207', 884, 372, 190, 290, -3, 'polaroid', '迎风', z=5)
    + tape(460, 36, 80, -5) + tape(720, 52, 80, 6)
    + txt('CHAPTER IV · TIGER LEAPING GORGE', 70, 110, 280, 'en', 'line-height:2')
    + txt('虎跳峡', 66, 170, 300, 'h1', 'font-size:70px')
    + '<div class="rule" style="left:70px;top:268px;width:50px"></div>'
    + txt('金沙江在这里<br>被玉龙与哈巴两座雪山紧紧攥住，<br>于是它咆哮，它奔腾，<br>它把千年的力气，<br>都砸在江心那块石头上。', 70, 296, 290, 'body', 'font-size:17px;line-height:2')
    + txt('传说猛虎一跃，便过了江。<br>而我们只是站在栏杆边，<br>张开双臂，听了很久很久的水声。', 386, 470, 480, 'quote', 'font-size:24px')
    + txt('长江第一峡 · 浪花溅湿了衣角，也溅湿了笑声', 390, 610, 470, 'body', 'font-size:15px;color:var(--muted)')
    + mo('water', 70, 660, 90, 'var(--ind)', 0, .6)
    + folio(10, '虎跳峡')))

# 11 白水台
P.append(page(
    ph('IMG_3141', 60, 56, 560, 373, -1, 'film', z=2)
    + ph('WX_225158', 650, 56, 420, 315, 1.5, 'film', z=3)
    + ph('IMG_3092', 650, 400, 260, 215, -3, 'polaroid', '挥手', z=4)
    + ph('IMG_3041', 880, 430, 210, 185, 4, 'polaroid', '马背上', z=5)
    + tape(300, 42, 90, -4) + tape(820, 44, 80, 5)
    + txt('CHAPTER V · BAISHUITAI', 70, 470, 400, 'en')
    + txt('白水台 · 大地的梯田', 66, 500, 520, 'h2')
    + txt('泉水带着碳酸钙，一滴一滴，<br>在山坡上砌出了层层白色的台阶，<br>'
          '池里盛着一汪一汪的天蓝。<br>这是东巴文化的发源地，<br>也是时间最有耐心的作品。', 70, 572, 480, 'body', 'font-size:17px;line-height:1.9')
    + txt('他骑着马从山路上来，<br>我在白台上朝他挥手——<br>像是怕惊扰了一场，下了一万年的雪。', 650, 660, 440, 'body', 'font-size:16px;line-height:1.85;color:var(--ind)')
    + '<div class="seal" style="left:540px;top:640px">东巴</div>'
    + folio(11, '白水台')))
