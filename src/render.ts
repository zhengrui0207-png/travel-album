import {
  type Album,
  type Page,
  type Photo,
  type Rect,
  TEMPLATES,
  frames,
  imagePlacement,
  defaultCrop,
} from "./engine";
const imageCache = new Map<string, Promise<HTMLImageElement>>();
export function loadPhoto(photo: Photo): Promise<HTMLImageElement> {
  if (!imageCache.has(photo.id) && imageCache.size >= 6)
    imageCache.delete(imageCache.keys().next().value!);
  if (!imageCache.has(photo.id))
    imageCache.set(
      photo.id,
      new Promise((resolve, reject) => {
        const img = new Image(),
          url = URL.createObjectURL(photo.blob);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          imageCache.delete(photo.id);
          reject(new Error("照片无法读取：" + photo.name));
        };
        img.src = url;
      }),
    );
  return imageCache.get(photo.id)!;
}
export function clearImageCache() {
  imageCache.clear();
}
export function pageFrames(album: Album, page: Page): Rect[] {
  if (page.kind === "cover") return [{ x: 575, y: 90, w: 520, h: 670 }];
  if (page.kind !== "photo") return [];
  return frames(album.template, page.layout);
}
function textLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  line: number,
  maxLines: number,
) {
  let row = "";
  const rows: string[] = [];
  for (const char of text) {
    if (char === "\n" || ctx.measureText(row + char).width > width) {
      rows.push(row);
      row = char === "\n" ? "" : char;
    } else row += char;
  }
  rows.push(row);
  rows.slice(0, maxLines).forEach((content, index) => {
    if (index === maxLines - 1 && rows.length > maxLines) {
      while (ctx.measureText(content + "…").width > width)
        content = content.slice(0, -1);
      content += "…";
    }
    ctx.fillText(content, x, y + index * line);
  });
}
export async function renderPage(
  canvas: HTMLCanvasElement,
  album: Album,
  page: Page,
  width = 1200,
) {
  const height = Math.round(width * 0.75);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(width / 1200, height / 900);
  const theme = TEMPLATES.find((t) => t.id === album.template)!;
  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, 1200, 900);
  const slots = pageFrames(album, page);
  for (let i = 0; i < page.photos.length; i++) {
    const photo = album.photos.find((p) => p.id === page.photos[i]),
      slot = slots[i];
    if (!photo || !slot) continue;
    const img = await loadPhoto(photo),
      crop = page.crops[photo.id] || defaultCrop();
    const box = imagePlacement(img.naturalWidth, img.naturalHeight, slot, crop);
    ctx.save();
    ctx.beginPath();
    ctx.rect(slot.x, slot.y, slot.w, slot.h);
    ctx.clip();
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
    ctx.restore();
  }
  ctx.fillStyle = theme.ink;
  ctx.textBaseline = "top";
  const serif = '"Songti SC", "Noto Serif CJK SC", SimSun, Georgia, serif',
    sans = '"PingFang SC", "Microsoft YaHei", sans-serif';
  if (page.kind === "cover") {
    ctx.globalAlpha = 0.6;
    ctx.font = `16px ${sans}`;
    ctx.fillText("私人摄影集", 100, 104);
    ctx.globalAlpha = 1;
    ctx.font = `48px ${serif}`;
    textLines(ctx, album.title, 100, 290, 390, 70, 4);
    ctx.globalAlpha = 0.7;
    ctx.font = `20px ${serif}`;
    textLines(ctx, album.subtitle, 100, 620, 390, 32, 2);
    ctx.font = `15px ${sans}`;
    ctx.fillText(
      [album.location, album.date].filter(Boolean).join("  /  "),
      100,
      738,
    );
    ctx.globalAlpha = 1;
    if (!page.photos.length) {
      ctx.fillStyle = album.template === "nocturne" ? "#333f39" : "#e9ede5";
      ctx.fillRect(575, 90, 520, 670);
      ctx.fillStyle = theme.ink;
      ctx.globalAlpha = 0.5;
      ctx.font = `24px ${serif}`;
      ctx.fillText("留一个位置，给喜欢的照片", 635, 390);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = theme.ink;
    ctx.globalAlpha = 0.4;
    ctx.font = "14px Georgia, serif";
    ctx.fillText("A COLLECTION OF MOMENTS", 100, 826);
    ctx.globalAlpha = 1;
  } else if (page.kind === "chapter") {
    ctx.globalAlpha = 0.45;
    ctx.font = `16px ${sans}`;
    ctx.fillText(
      "CHAPTER  /  " +
        String(
          album.pages
            .filter((p) => p.kind === "chapter")
            .findIndex((p) => p.id === page.id) + 1,
        ).padStart(2, "0"),
      140,
      250,
    );
    ctx.globalAlpha = 1;
    ctx.font = `62px ${serif}`;
    textLines(ctx, page.title || "未命名章节", 140, 332, 900, 80, 2);
    ctx.font = `23px ${serif}`;
    ctx.globalAlpha = 0.65;
    textLines(ctx, page.caption, 140, 570, 850, 40, 4);
    ctx.globalAlpha = 1;
  } else if (page.kind === "back") {
    ctx.textAlign = "center";
    ctx.font = `32px ${serif}`;
    textLines(
      ctx,
      page.caption || "把这些日子，轻轻留下。",
      600,
      400,
      800,
      50,
      3,
    );
    ctx.globalAlpha = 0.45;
    ctx.font = `14px ${sans}`;
    ctx.fillText(album.date || "留页 · 私人摄影集", 600, 750);
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  } else {
    if (page.layout === "full" && (page.caption || page.title)) {
      const gradient = ctx.createLinearGradient(0, 650, 0, 900);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, "#0008");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 650, 1200, 250);
      ctx.fillStyle = "white";
    }
    ctx.font = `21px ${serif}`;
    textLines(ctx, page.caption || page.title, 100, 806, 890, 29, 2);
    ctx.globalAlpha = 0.45;
    ctx.font = `14px ${sans}`;
    ctx.textAlign = "right";
    ctx.fillText(
      String(album.pages.findIndex((p) => p.id === page.id)).padStart(2, "0"),
      1100,
      839,
    );
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
  }
}
