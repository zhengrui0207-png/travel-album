# 相册生成：基础样式与组件
import re
FACES = {}
for line in open('/tmp/yn/faces.txt', encoding='utf-8'):
    p = line.split()
    n = p[0].rsplit('.', 1)[0]
    if n.startswith('微信图片'):
        n = 'WX_' + n.split('_')[1][8:]
    FACES[n] = (float(p[2]), float(p[3]))

W, H = 1123, 794  # A4 横版 @96dpi

def pos(name):
    fx, fy = FACES.get(name, (.5, .5))
    fx = min(max(fx, .1), .9)
    fy = min(max(fy - .08, .05), .85)
    return f'{fx*100:.0f}% {fy*100:.0f}%'

def ph(name, x, y, w, h, rot=0, kind='film', cap='', z=2):
    """照片元素：film=细边胶片 / polaroid=白边拍立得 / bleed=无边"""
    capel = f'<figcaption>{cap}</figcaption>' if cap and kind == 'polaroid' else ''
    return (f'<figure class="ph {kind}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;'
            f'transform:rotate({rot}deg);z-index:{z}"><div class="im">'
            f'<img src="images/{name}.jpg" style="object-position:{pos(name)}" alt="{cap or name}"></div>{capel}</figure>')

def txt(html, x, y, w, cls='', style=''):
    return f'<div class="tx {cls}" style="left:{x}px;top:{y}px;width:{w}px;{style}">{html}</div>'

# 东巴风格装饰符号（简笔线描）
MOTIF = {
 'sun': '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="30" cy="30" r="3" fill="currentColor"/>' + ''.join(f'<line x1="30" y1="6" x2="30" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" transform="rotate({a} 30 30)"/>' for a in range(0, 360, 45)) + '</svg>',
 'mount': '<svg viewBox="0 0 80 50"><path d="M4 46 L26 12 L38 30 L52 6 L76 46 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M46 16 L52 6 L58 16 L55 14 L52 18 L49 14 Z" fill="currentColor"/></svg>',
 'water': '<svg viewBox="0 0 80 30"><path d="M2 10 q9 -8 18 0 t18 0 t18 0 t18 0 M2 22 q9 -8 18 0 t18 0 t18 0 t18 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
 'bird': '<svg viewBox="0 0 70 50"><path d="M6 30 Q22 10 34 26 Q46 8 64 22 M34 26 L34 44 M28 44 L40 44" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="34" cy="20" r="3" fill="currentColor"/></svg>',
 'eye': '<svg viewBox="0 0 70 40"><path d="M4 20 Q35 -6 66 20 Q35 46 4 20 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="35" cy="20" r="7" fill="currentColor"/></svg>',
 'feather': '<svg viewBox="0 0 40 90"><path d="M20 88 L20 10 M20 10 Q4 30 8 60 Q14 50 20 48 Q26 50 32 60 Q36 30 20 10 Z" fill="none" stroke="currentColor" stroke-width="2"/>' + ''.join(f'<line x1="20" y1="{y}" x2="{11 if i%2 else 29}" y2="{y-8}" stroke="currentColor" stroke-width="1.5"/>' for i, y in enumerate(range(28, 62, 6))) + '</svg>',
 'star': '<svg viewBox="0 0 40 40"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="currentColor"/></svg>',
}

def mo(k, x, y, s, color='var(--cin)', rot=0, op=.85):
    return (f'<div class="mo" style="left:{x}px;top:{y}px;width:{s}px;color:{color};'
            f'transform:rotate({rot}deg);opacity:{op}">{MOTIF[k]}</div>')

def tape(x, y, w=90, rot=-8):
    return f'<div class="tape" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg)"></div>'

def folio(n, label, dark=False):
    c = 'dark' if dark else ''
    return f'<div class="folio {c}"><span>{label}</span><b>{n:02d}</b></div>'

GRAIN = ("data:image/svg+xml;utf8," + re.sub(r'\s+', ' ', """<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/>
<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter>
<rect width='100%' height='100%' filter='url(%23n)'/></svg>""").replace('#', '%23').replace('"', "'"))
