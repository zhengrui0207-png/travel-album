import { zip, unzip, strToU8, strFromU8 } from "fflate";
import type { Album, Photo } from "./engine";
import { validateProject } from "./storage";
import { renderPage } from "./render";
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
const pack = (files: Record<string, Uint8Array>) =>
  new Promise<Uint8Array>((res, rej) =>
    zip(files, { level: 0 }, (e, d) => (e ? rej(e) : res(d))),
  );
const unpack = (bytes: Uint8Array) =>
  new Promise<Record<string, Uint8Array>>((res, rej) =>
    unzip(
      bytes,
      {
        filter: (f) =>
          f.originalSize < 26 * 1024 * 1024 &&
          /^(album\.json|photos\/[a-zA-Z0-9-]{1,80}|thumbs\/[a-zA-Z0-9-]{1,80})$/.test(
            f.name,
          ),
      },
      (e, d) => (e ? rej(e) : res(d)),
    ),
  );
export async function backup(album: Album, signal?: AbortSignal) {
  const files: Record<string, Uint8Array> = {};
  for (const p of album.photos) {
    if (signal?.aborted) throw new Error("已取消导出");
    files[`photos/${p.id}`] = new Uint8Array(await p.blob.arrayBuffer());
    files[`thumbs/${p.id}`] = new Uint8Array(await p.thumb.arrayBuffer());
  }
  files["album.json"] = strToU8(
    JSON.stringify({
      ...album,
      photos: album.photos.map(({ blob, thumb, ...p }) => ({
        ...p,
        mime: blob.type,
      })),
    }),
  );
  const data = await pack(files);
  if (signal?.aborted) throw new Error("已取消导出");
  download(
    new Blob([data as BlobPart], { type: "application/zip" }),
    (album.title || "留页") + ".liuye",
  );
}
export async function restore(file: File): Promise<Album> {
  if (file.size > 1024 * 1024 * 1024)
    throw new Error("项目备份过大（上限 1 GB）");
  const files = await unpack(new Uint8Array(await file.arrayBuffer()));
  if (!files["album.json"]) throw new Error("不是有效的留页项目");
  const a = JSON.parse(strFromU8(files["album.json"]));
  validateProject(a);
  for (const p of a.photos as (Photo & { mime: string })[]) {
    if (
      !files[`photos/${p.id}`] ||
      !files[`thumbs/${p.id}`] ||
      !["image/jpeg", "image/png", "image/webp"].includes(p.mime)
    )
      throw new Error("项目照片缺失或格式不支持");
    p.blob = new Blob([files[`photos/${p.id}`] as BlobPart], { type: p.mime });
    p.thumb = new Blob([files[`thumbs/${p.id}`] as BlobPart], {
      type: "image/jpeg",
    });
  }
  return a;
}
export async function exportAlbum(
  album: Album,
  format: "images" | "pdf",
  progress: (n: number) => void,
  signal: AbortSignal,
) {
  const files: Record<string, Uint8Array> = {},
    canvas = document.createElement("canvas");
  const pdf =
    format === "pdf"
      ? new (await import("jspdf")).jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [240, 180],
        })
      : null;
  for (let i = 0; i < album.pages.length; i++) {
    if (signal.aborted) throw new Error("已取消导出");
    await renderPage(canvas, album, album.pages[i], 2400);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("图片导出失败"))),
        "image/jpeg",
        0.94,
      ),
    );
    if (signal.aborted) throw new Error("已取消导出");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (pdf) {
      if (i) pdf.addPage([240, 180], "landscape");
      pdf.addImage(bytes, "JPEG", 0, 0, 240, 180);
    } else files[`${String(i + 1).padStart(3, "0")}.jpg`] = bytes;
    progress(Math.round(((i + 1) / album.pages.length) * 100));
    await new Promise((r) => setTimeout(r, 0));
  }
  if (signal.aborted) throw new Error("已取消导出");
  const name = album.title || "留页";
  if (pdf) {
    download(pdf.output("blob"), name + ".pdf");
  } else {
    const data = await pack(files);
    if (signal.aborted) throw new Error("已取消导出");
    download(
      new Blob([data as BlobPart], { type: "application/zip" }),
      name + "-页面图片.zip",
    );
  }
  canvas.width = canvas.height = 1;
}
