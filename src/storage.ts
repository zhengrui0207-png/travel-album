import type { Album, Photo, Page } from "./engine";
import { TEMPLATES, LAYOUTS } from "./engine";
let dbPromise: Promise<IDBDatabase> | undefined;
function db() {
  return (dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("liuye-studio", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("albums");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  }));
}
export async function saveAlbum(album: Album) {
  const d = await db();
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction("albums", "readwrite");
    tx.objectStore("albums").put(album, "current");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
export async function loadAlbum(): Promise<Album | undefined> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const r = d.transaction("albums").objectStore("albums").get("current");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export function validateProject(raw: unknown): asserts raw is Album {
  if (!raw || typeof raw !== "object") throw new Error("项目格式不正确");
  const a = raw as Album;
  if (a.version !== 1) throw new Error("项目版本不受支持");
  if (
    !TEMPLATES.some((t) => t.id === a.template) ||
    !Array.isArray(a.photos) ||
    a.photos.length > 100 ||
    !Array.isArray(a.pages) ||
    a.pages.length > 500
  )
    throw new Error("项目结构不正确");
  for (const key of ["title", "subtitle", "location", "date"] as const)
    if (typeof a[key] !== "string" || a[key].length > 500)
      throw new Error("项目信息不正确");
  const ids = new Set<string>();
  for (const p of a.photos as Photo[]) {
    if (
      !p ||
      typeof p.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,80}$/.test(p.id) ||
      ids.has(p.id) ||
      typeof p.name !== "string" ||
      !Number.isFinite(p.width) ||
      !Number.isFinite(p.height) ||
      p.width <= 0 ||
      p.height <= 0 ||
      p.width > 50000 ||
      p.height > 50000
    )
      throw new Error("照片信息不正确");
    ids.add(p.id);
  }
  if (a.coverId !== null && !ids.has(a.coverId))
    throw new Error("封面照片缺失");
  const pageIds = new Set<string>();
  for (const p of a.pages as Page[]) {
    if (
      !p ||
      typeof p.id !== "string" ||
      pageIds.has(p.id) ||
      !["cover", "photo", "chapter", "back"].includes(p.kind) ||
      !LAYOUTS.some((l) => l.id === p.layout) ||
      !Array.isArray(p.photos) ||
      p.photos.length > 3 ||
      p.photos.some((id) => !ids.has(id)) ||
      typeof p.title !== "string" ||
      p.title.length > 500 ||
      typeof p.caption !== "string" ||
      p.caption.length > 1000 ||
      !p.crops ||
      typeof p.crops !== "object"
    )
      throw new Error("页面信息不正确");
    pageIds.add(p.id);
    for (const c of Object.values(p.crops)) {
      if (
        !c ||
        !["contain", "cover"].includes(c.fit) ||
        ![c.zoom, c.x, c.y].every(Number.isFinite) ||
        c.zoom < 1 ||
        c.zoom > 3 ||
        Math.abs(c.x) > 1 ||
        Math.abs(c.y) > 1
      )
        throw new Error("取景数据不正确");
    }
  }
  a.activePage = Math.max(
    0,
    Math.min(
      Number.isInteger(a.activePage) ? a.activePage : 0,
      a.pages.length - 1,
    ),
  );
}
