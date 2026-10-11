export type TemplateId = "paper" | "journey" | "fragments" | "nocturne";
export type LayoutId = "single" | "full" | "offset" | "pair" | "duet" | "trio";
export type Photo = {
  id: string;
  name: string;
  width: number;
  height: number;
  blob: Blob;
  thumb: Blob;
  created: number;
};
export type Crop = {
  fit: "contain" | "cover";
  zoom: number;
  x: number;
  y: number;
};
export type Page = {
  id: string;
  kind: "cover" | "photo" | "chapter" | "back";
  layout: LayoutId;
  photos: string[];
  crops: Record<string, Crop>;
  title: string;
  caption: string;
  locked: boolean;
};
export type Album = {
  version: 1;
  title: string;
  subtitle: string;
  location: string;
  date: string;
  template: TemplateId;
  coverId: string | null;
  photos: Photo[];
  pages: Page[];
  activePage: number;
  demo: boolean;
};
export type Rect = { x: number; y: number; w: number; h: number };
export const uid = () => crypto.randomUUID();
export const defaultCrop = (): Crop => ({
  fit: "contain",
  zoom: 1,
  x: 0,
  y: 0,
});
export const TEMPLATES = [
  {
    id: "paper" as const,
    name: "素笺",
    en: "The quiet edition",
    desc: "让留白，替照片说话",
    color: "#8c9989",
    paper: "#fdfcf8",
    ink: "#343c35",
  },
  {
    id: "journey" as const,
    name: "远行",
    en: "Somewhere, slowly",
    desc: "把沿途，装进书页",
    color: "#8c9eaa",
    paper: "#f7f8f6",
    ink: "#344652",
  },
  {
    id: "fragments" as const,
    name: "片段",
    en: "Collected moments",
    desc: "零碎的，也是完整的",
    color: "#b49c87",
    paper: "#f5f0e8",
    ink: "#50463d",
  },
  {
    id: "nocturne" as const,
    name: "夜色",
    en: "After the light",
    desc: "让光，停留得更久",
    color: "#555e5a",
    paper: "#242c2a",
    ink: "#e2e7db",
  },
];
export const LAYOUTS: { id: LayoutId; name: string; count: number }[] = [
  { id: "single", name: "留白单图", count: 1 },
  { id: "full", name: "满版大图", count: 1 },
  { id: "offset", name: "偏置单图", count: 1 },
  { id: "pair", name: "并排双图", count: 2 },
  { id: "duet", name: "错落双图", count: 2 },
  { id: "trio", name: "三联叙事", count: 3 },
];
export function emptyAlbum(): Album {
  return {
    version: 1,
    title: "未命名的片刻",
    subtitle: "一本属于自己的摄影集",
    location: "",
    date: "",
    template: "paper",
    coverId: null,
    photos: [],
    pages: [],
    activePage: 0,
    demo: false,
  };
}
export function makePage(
  kind: Page["kind"],
  photos: string[] = [],
  layout: LayoutId = "single",
): Page {
  return {
    id: uid(),
    kind,
    photos,
    layout,
    crops: {},
    title: "",
    caption: "",
    locked: false,
  };
}
export function frames(template: TemplateId, layout: LayoutId): Rect[] {
  const f = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });
  if (layout === "full") return [f(0, 0, 1200, 900)];
  if (layout === "single")
    return [
      template === "nocturne" ? f(65, 55, 1070, 750) : f(100, 75, 1000, 700),
    ];
  if (layout === "offset")
    return [
      template === "fragments" ? f(110, 90, 760, 650) : f(160, 70, 780, 700),
    ];
  if (layout === "pair")
    return template === "nocturne"
      ? [f(65, 75, 520, 700), f(615, 75, 520, 700)]
      : [f(100, 95, 475, 650), f(625, 95, 475, 650)];
  if (layout === "duet")
    return template === "journey"
      ? [f(65, 85, 670, 665), f(780, 300, 340, 410)]
      : [f(100, 80, 560, 650), f(725, 250, 370, 465)];
  if (template === "journey")
    return [
      f(100, 60, 1000, 440),
      f(100, 525, 480, 250),
      f(620, 525, 480, 250),
    ];
  if (template === "fragments")
    return [f(85, 85, 640, 670), f(765, 85, 350, 315), f(765, 440, 350, 315)];
  return [f(85, 165, 320, 530), f(440, 165, 320, 530), f(795, 165, 320, 530)];
}
// Dynamic programming: preserve order, compare the whole sequence, favor complete crops and readable photo size.
export function paginate(photos: Photo[], template: TemplateId): Page[] {
  const n = photos.length,
    dp = Array(n + 1).fill(Infinity),
    choices: { layout: LayoutId; count: number }[] = [];
  dp[n] = 0;
  for (let i = n - 1; i >= 0; i--)
    for (const l of LAYOUTS) {
      if (i + l.count > n || (l.count === 3 && template === "paper")) continue;
      const subset = photos.slice(i, i + l.count),
        slots = frames(template, l.id);
      let cost = 1.1;
      subset.forEach((p, k) => {
        const a = p.width / p.height,
          b = slots[k].w / slots[k].h;
        cost += 2.2 * (1 - Math.min(a / b, b / a));
      });
      if (
        l.count === 2 &&
        Math.abs(
          Math.log(
            subset[0].width /
              subset[0].height /
              (subset[1].width / subset[1].height),
          ),
        ) > 0.55
      )
        cost += 1.6;
      if (l.id === "full")
        cost += template === "journey" || template === "nocturne" ? 0.25 : 1.25;
      if (l.id === "offset") cost += template === "fragments" ? 0 : 0.7;
      if (l.count === 3) cost += 0.7;
      if (l.id === "duet" && template === "paper") cost += 0.9;
      if (cost + dp[i + l.count] < dp[i]) {
        dp[i] = cost + dp[i + l.count];
        choices[i] = { layout: l.id, count: l.count };
      }
    }
  const pages: Page[] = [];
  for (let i = 0; i < n;) {
    const c = choices[i];
    const p = makePage(
      "photo",
      photos.slice(i, i + c.count).map((p) => p.id),
      c.layout,
    );
    if (
      pages.length >= 2 &&
      pages.at(-1)?.layout === p.layout &&
      pages.at(-2)?.layout === p.layout &&
      c.count === 1
    )
      p.layout = p.layout === "single" ? "offset" : "single";
    if (p.layout === "full")
      p.crops = Object.fromEntries(
        p.photos.map((id) => [id, { ...defaultCrop(), fit: "cover" }]),
      );
    pages.push(p);
    i += c.count;
  }
  return pages;
}
export function generate(album: Album): Page[] {
  const cover = makePage("cover", album.coverId ? [album.coverId] : []),
    back = makePage("back");
  return [cover, ...paginate(album.photos, album.template), back];
}
export function imagePlacement(iw: number, ih: number, r: Rect, c: Crop): Rect {
  const scale =
    (c.fit === "contain"
      ? Math.min(r.w / iw, r.h / ih)
      : Math.max(r.w / iw, r.h / ih)) * c.zoom;
  const w = iw * scale,
    h = ih * scale;
  return {
    x: r.x + (r.w - w) / 2 + (c.x * Math.abs(r.w - w)) / 2,
    y: r.y + (r.h - h) / 2 + (c.y * Math.abs(r.h - h)) / 2,
    w,
    h,
  };
}
export function removePhotos(a: Album, ids: Set<string>): Album {
  const coverId = a.coverId && ids.has(a.coverId) ? null : a.coverId;
  const pages = a.pages
    .map((p) => ({ ...p, photos: p.photos.filter((id) => !ids.has(id)) }))
    .filter((p) => p.kind !== "photo" || p.photos.length)
    .map((p) => ({
      ...p,
      layout:
        p.kind === "photo" &&
        LAYOUTS.find((l) => l.id === p.layout)?.count !== p.photos.length
          ? p.photos.length === 1
            ? "single"
            : p.photos.length === 2
              ? LAYOUTS.find((l) => l.id === p.layout)?.count === 2
                ? p.layout
                : "pair"
              : "trio"
          : p.layout,
    }));
  return {
    ...a,
    photos: a.photos.filter((p) => !ids.has(p.id)),
    coverId,
    pages,
    activePage: Math.max(0, Math.min(a.activePage, pages.length - 1)),
  };
}
export function reorder<T>(items: T[], from: number, to: number): T[] {
  const result = [...items];
  if (from < 0 || to < 0 || from >= items.length || to >= items.length)
    return result;
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
}

export function groupIntoChapter(
  a: Album,
  ids: Set<string>,
  title: string,
  caption: string,
): Album {
  const chosen = a.photos.filter((p) => ids.has(p.id));
  if (!chosen.length) return a;
  const retained = removePhotos(a, ids).pages.filter(
    (p) => p.kind !== "cover" && p.kind !== "back",
  );
  const cover =
    a.pages.find((p) => p.kind === "cover") ||
    makePage("cover", a.coverId ? [a.coverId] : []);
  const back = a.pages.find((p) => p.kind === "back") || makePage("back");
  const chapter = { ...makePage("chapter"), title, caption, locked: true };
  const pages = [
    cover,
    ...retained,
    chapter,
    ...paginate(chosen, a.template),
    back,
  ];
  return {
    ...a,
    pages,
    activePage: pages.findIndex((p) => p.id === chapter.id),
  };
}
