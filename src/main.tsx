import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Images,
  LayoutTemplate,
  Type,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Undo2,
  Redo2,
  Eye,
  Move,
  RotateCcw,
  Trash2,
  ArrowUp,
  ArrowDown,
  FolderOpen,
  ShieldCheck,
  Expand,
  Bookmark,
  LoaderCircle,
  LockKeyhole,
  FileText,
  Image as ImageIcon,
  Archive,
  PanelLeftClose,
} from "lucide-react";
import {
  type Album,
  type Photo,
  type Page,
  type TemplateId,
  type Crop,
  type LayoutId,
  TEMPLATES,
  LAYOUTS,
  emptyAlbum,
  defaultCrop,
  makePage,
  generate,
  groupIntoChapter,
  frames,
  reorder,
  removePhotos,
  uid,
} from "./engine";
import { renderPage, pageFrames, clearImageCache } from "./render";
import { loadAlbum, saveAlbum } from "./storage";
import { backup, restore, exportAlbum } from "./export";
import "./style.css";

const CHAPTERS = [
  { title: "序章", caption: "故事，从这一页开始。" },
  { title: "途中", caption: "慢一点，留意沿途的片刻。" },
  { title: "片刻", caption: "一些平常的日子，也值得被记住。" },
  { title: "尾声", caption: "旅途会结束，记忆还在继续。" },
];
const PHRASES = [
  "把这些日子，轻轻留下。",
  "时间走过，照片留下。",
  "这一刻，值得慢慢看。",
  "未完待续，下次再见。",
];
function useBlobUrl(blob?: Blob) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!blob) {
      setUrl("");
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}
function PhotoImg({
  photo,
  ...props
}: { photo?: Photo } & React.ImgHTMLAttributes<HTMLImageElement>) {
  const url = useBlobUrl(photo?.thumb);
  return url ? (
    <img src={url} alt={photo?.name || ""} {...props} />
  ) : (
    <span className="image-placeholder" />
  );
}
function IconButton({
  label,
  children,
  ...props
}: {
  label: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="icon-button" title={label} aria-label={label} {...props}>
      {children}
    </button>
  );
}
function MiniPage({ page, album }: { page: Page; album: Album }) {
  const theme = TEMPLATES.find((t) => t.id === album.template)!;
  return (
    <div
      className={"mini-page " + page.kind}
      style={{ background: theme.paper, color: theme.ink }}
    >
      {pageFrames(album, page).map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: r.x / 12 + "%",
            top: r.y / 9 + "%",
            width: r.w / 12 + "%",
            height: r.h / 9 + "%",
          }}
        >
          <PhotoImg
            photo={album.photos.find((p) => p.id === page.photos[i])}
            style={{ objectFit: page.crops[page.photos[i]]?.fit || "contain" }}
          />
        </div>
      ))}
      {page.kind === "cover" ? (
        <span className="mini-title">{album.title.slice(0, 8)}</span>
      ) : page.kind === "chapter" ? (
        <span>{page.title}</span>
      ) : page.kind === "back" ? (
        <span>留页</span>
      ) : null}
    </div>
  );
}
function LayoutGlyph({ layout }: { layout: LayoutId }) {
  return (
    <span className="layout-glyph">
      {frames("paper", layout).map((r, i) => (
        <i
          key={i}
          style={{
            left: r.x / 12 + "%",
            top: r.y / 9 + "%",
            width: r.w / 12 + "%",
            height: r.h / 9 + "%",
          }}
        />
      ))}
    </span>
  );
}
async function makePhoto(file: File): Promise<Photo> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("仅支持 JPG、PNG、WebP");
  if (file.size > 25 * 1024 * 1024) throw new Error("超过 25 MB");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 80000000)
      throw new Error("图片像素过大（上限 8000 万）");
    const c = document.createElement("canvas"),
      s = Math.min(1, 480 / Math.max(bitmap.width, bitmap.height));
    c.width = Math.round(bitmap.width * s);
    c.height = Math.round(bitmap.height * s);
    c.getContext("2d")!.drawImage(bitmap, 0, 0, c.width, c.height);
    const thumb = await new Promise<Blob>((res, rej) =>
      c.toBlob(
        (b) => (b ? res(b) : rej(Error("无法生成预览"))),
        "image/jpeg",
        0.85,
      ),
    );
    return {
      id: uid(),
      name: file.name,
      width: bitmap.width,
      height: bitmap.height,
      blob: file,
      thumb,
      created: file.lastModified,
    };
  } finally {
    bitmap.close();
  }
}
async function demoAlbum() {
  const a = emptyAlbum();
  a.title = "风经过的时候";
  a.subtitle = "把平凡的日子，过成值得收藏的片刻。";
  a.location = "海边来信";
  a.date = "SUMMER, 2026";
  a.demo = true;
  const names = ["portrait", "shore", "walk", "ocean", "umbrella", "waves"];
  for (const name of names) {
    const r = await fetch(`/demo/${name}.jpg`);
    if (!r.ok) continue;
    const b = await r.blob();
    try {
      a.photos.push(
        await makePhoto(new File([b], name + ".jpg", { type: "image/jpeg" })),
      );
    } catch {
      /* An unavailable demo asset must not block the editor. */
    }
  }
  if (a.photos.length) {
    a.coverId = a.photos[0].id;
    a.pages = generate(a);
    a.pages[0].crops[a.coverId] = { ...defaultCrop(), fit: "cover" };
    a.pages.splice(1, 0, { ...makePage("chapter"), ...CHAPTERS[0] });
  }
  return a;
}

function CanvasPage({
  album,
  page,
  selected,
  onSelect,
  onCrop,
  readonly = false,
}: {
  album: Album;
  page: Page;
  selected: string | null;
  onSelect: (id: string) => void;
  onCrop: (id: string, crop: Crop) => void;
  readonly?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null),
    drag = useRef<{
      id: string;
      x: number;
      y: number;
      crop: Crop;
      width: number;
      height: number;
    } | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<{ id: string; crop: Crop } | null>(null);
  useEffect(() => {
    let alive = true;
    const buffer = document.createElement("canvas");
    setDrawing(true);
    renderPage(
      buffer,
      album,
      draft
        ? { ...page, crops: { ...page.crops, [draft.id]: draft.crop } }
        : page,
    )
      .then(() => {
        if (alive && ref.current) {
          ref.current.width = buffer.width;
          ref.current.height = buffer.height;
          ref.current.getContext("2d")!.drawImage(buffer, 0, 0);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setDrawing(false);
      });
    return () => {
      alive = false;
    };
  }, [album, page, draft]);
  return (
    <div className={"canvas-page " + (drawing ? "drawing" : "")}>
      <canvas
        ref={ref}
        role="img"
        aria-label={`${page.kind === "cover" ? "封面" : page.kind === "chapter" ? page.title : "相册页面"}预览`}
      />
      {error && <div className="canvas-error">{error}</div>}
      {!readonly &&
        pageFrames(album, page).map((r, i) => {
          const id = page.photos[i];
          if (!id) return null;
          return (
            <button
              key={id}
              className={"crop-target " + (selected === id ? "selected" : "")}
              aria-label={`调整照片 ${i + 1}`}
              style={{
                left: r.x / 12 + "%",
                top: r.y / 9 + "%",
                width: r.w / 12 + "%",
                height: r.h / 9 + "%",
              }}
              onClick={() => onSelect(id)}
              onPointerDown={(e) => {
                onSelect(id);
                const bounds = e.currentTarget.getBoundingClientRect();
                drag.current = {
                  id,
                  x: e.clientX,
                  y: e.clientY,
                  crop: page.crops[id] || defaultCrop(),
                  width: bounds.width,
                  height: bounds.height,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                const d = drag.current;
                setDraft({
                  id: d.id,
                  crop: {
                    ...d.crop,
                    x: Math.max(
                      -1,
                      Math.min(1, d.crop.x + ((e.clientX - d.x) / d.width) * 2),
                    ),
                    y: Math.max(
                      -1,
                      Math.min(
                        1,
                        d.crop.y + ((e.clientY - d.y) / d.height) * 2,
                      ),
                    ),
                  },
                });
              }}
              onPointerUp={(e) => {
                const d = drag.current;
                if (
                  d &&
                  Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 3
                )
                  onCrop(d.id, {
                    ...d.crop,
                    x: Math.max(
                      -1,
                      Math.min(1, d.crop.x + ((e.clientX - d.x) / d.width) * 2),
                    ),
                    y: Math.max(
                      -1,
                      Math.min(
                        1,
                        d.crop.y + ((e.clientY - d.y) / d.height) * 2,
                      ),
                    ),
                  });
                setDraft(null);
                drag.current = null;
              }}
              onPointerCancel={(e) => {
                drag.current = null;
                setDraft(null);
              }}
            >
              <span>
                <Move size={13} /> 拖动取景
              </span>
            </button>
          );
        })}
    </div>
  );
}
function App() {
  const [album, setAlbum] = useState<Album>(emptyAlbum),
    [ready, setReady] = useState(false),
    [tab, setTab] = useState<"templates" | "photos" | "text">("templates"),
    [save, setSave] = useState("正在打开"),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(""),
    [selected, setSelected] = useState<Set<string>>(new Set()),
    [cropId, setCropId] = useState<string | null>(null),
    [modal, setModal] = useState<
      "export" | "chapter" | "group" | "help" | null
    >(null),
    [lightbox, setLightbox] = useState<string | null>(null),
    [reading, setReading] = useState(false),
    [exportProgress, setExportProgress] = useState<number | null>(null),
    [exportError, setExportError] = useState(""),
    [failures, setFailures] = useState<string[]>([]),
    [historyCount, setHistoryCount] = useState(0);
  const past = useRef<Album[]>([]),
    future = useRef<Album[]>([]),
    fileInput = useRef<HTMLInputElement>(null),
    projectInput = useRef<HTMLInputElement>(null),
    replaceInput = useRef<HTMLInputElement>(null),
    photoDrag = useRef<string | null>(null),
    pageDrag = useRef<number | null>(null),
    cancelExport = useRef<AbortController | null>(null),
    saveQueue = useRef(Promise.resolve());
  const tell = useCallback((message: string) => setNotice(message), []);
  const update = useCallback((fn: (a: Album) => Album, undo = true) => {
    setAlbum((a) => {
      const next = fn(a);
      if (undo) {
        past.current = [...past.current.slice(-29), a];
        future.current = [];
        setHistoryCount((x) => x + 1);
      }
      return next;
    });
  }, []);
  const undo = () => {
    const a = past.current.pop();
    if (a) {
      future.current.push(album);
      setAlbum(a);
      setHistoryCount((x) => x + 1);
      setCropId(null);
    }
  };
  const redo = () => {
    const a = future.current.pop();
    if (a) {
      past.current.push(album);
      setAlbum(a);
      setHistoryCount((x) => x + 1);
      setCropId(null);
    }
  };
  useEffect(() => {
    loadAlbum()
      .then(async (a) => {
        setAlbum(a || (await demoAlbum()));
        setReady(true);
      })
      .catch(() => {
        setReady(true);
        setSave("本机保存不可用");
        tell("浏览器存储不可用，请在制作后导出项目备份。");
      });
  }, [tell]);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    setSave("保存中");
    const timer = setTimeout(() => {
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(() => saveAlbum(album));
      saveQueue.current
        .then(() => {
          if (live) setSave("已保存到本机");
        })
        .catch(() => {
          if (live) {
            setSave("保存失败");
            tell("本机空间不足或保存失败，请导出项目备份。");
          }
        });
    }, 400);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [album, ready, tell]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (save === "保存中" || busy) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [save, busy]);
  const active = Math.max(
      0,
      Math.min(album.activePage, album.pages.length - 1),
    ),
    page = album.pages[active],
    theme = TEMPLATES.find((t) => t.id === album.template)!,
    cropPhoto = album.photos.find((p) => p.id === cropId),
    crop = page?.crops[cropId || ""] || defaultCrop();
  const go = (n: number) => {
    update(
      (a) => ({
        ...a,
        activePage: Math.max(0, Math.min(n, a.pages.length - 1)),
      }),
      false,
    );
    setCropId(null);
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
        el.isContentEditable
      )
        return;
      if (e.key === "Escape") {
        if (exportProgress === null) setModal(null);
        setLightbox(null);
        setReading(false);
        setCropId(null);
      }
      if (modal || lightbox) return;
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  useEffect(() => {
    if (!modal && !lightbox) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>("[role=dialog]");
    const getButtons = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input,textarea,[tabindex="0"]',
        ) || [],
      );
    getButtons()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = getButtons(),
        first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [modal, lightbox]);
  const patchPage = (patch: Partial<Page>) =>
    update((a) => ({
      ...a,
      pages: a.pages.map((p, i) =>
        i === active ? { ...p, ...patch, locked: true } : p,
      ),
    }));
  const patchCrop = (id: string, c: Crop) =>
    update((a) => ({
      ...a,
      pages: a.pages.map((p, i) =>
        i === active
          ? { ...p, crops: { ...p.crops, [id]: c }, locked: true }
          : p,
      ),
    }));
  async function importPhotos(files: FileList | File[] | null) {
    if (!files?.length || busy) return;
    setBusy("准备导入");
    const base = album.demo ? emptyAlbum() : album,
      max = 100 - base.photos.length,
      good: Photo[] = [],
      bad: string[] = [];
    const all = Array.from(files);
    for (let i = 0; i < all.length; i++) {
      setBusy(`正在导入 ${i + 1} / ${all.length}`);
      if (i >= max) {
        bad.push(`${all[i].name}：每本最多 100 张照片`);
        continue;
      }
      try {
        good.push(await makePhoto(all[i]));
      } catch (e) {
        bad.push(`${all[i].name}：${(e as Error).message}`);
      }
    }
    if (good.length) {
      update(() => {
        const next = {
          ...base,
          title: base.photos.length ? base.title : "我的旅行摄影集",
          photos: [...base.photos, ...good],
          demo: false,
        };
        if (!next.pages.length) next.pages = generate(next);
        return next;
      });
      setTab("photos");
      setSelected(new Set());
      tell(
        `已导入 ${good.length} 张照片${base.pages.length ? "，点击「重新排版」加入相册" : "，请选择一张封面"}`,
      );
    }
    setFailures(bad);
    setBusy("");
    if (fileInput.current) fileInput.current.value = "";
  }
  function chooseCover(id: string) {
    update((a) => ({
      ...a,
      coverId: id,
      pages: a.pages.map((p) =>
        p.kind === "cover" ? { ...p, photos: [id], crops: {} } : p,
      ),
      activePage: 0,
    }));
    tell("已设为封面");
    setLightbox(null);
    setCropId(null);
  }
  function build() {
    if (!album.photos.length) {
      fileInput.current?.click();
      return;
    }
    if (!album.coverId) {
      setTab("photos");
      tell("先为这本相册选一张封面：点击照片上的书签按钮。");
      return;
    }
    if (
      album.pages.some((p) => p.locked || p.kind === "chapter") &&
      !window.confirm(
        "重新排版将重置页面取景、章节和文案。当前版本可通过撤销恢复，也可先导出项目备份。继续重新排版？",
      )
    )
      return;
    update((a) => ({ ...a, pages: generate(a), activePage: 0 }));
    setCropId(null);
    tell("已按照片顺序生成相册，可逐页精修");
  }
  function changeTemplate(id: TemplateId) {
    if (id === album.template) return;
    update((a) => ({ ...a, template: id }));
    tell("已切换模板，现有文字和页面顺序已保留。需要重排可点击「重新排版」。");
  }
  function addChapter(title: string, caption: string) {
    if (modal === "group") {
      update((a) => groupIntoChapter(a, selected, title, caption));
      setSelected(new Set());
      setModal(null);
      setTab("text");
      setCropId(null);
      tell("已将所选照片整理为新章节");
      return;
    }
    const p = { ...makePage("chapter"), title, caption, locked: true };
    update((a) => {
      const pages = [...a.pages];
      const position = Math.max(1, Math.min(active + 1, pages.length - 1));
      pages.splice(position, 0, p);
      return { ...a, pages, activePage: position };
    });
    setModal(null);
    setTab("text");
    setCropId(null);
  }
  function movePhoto(id: string, delta: number) {
    update((a) => {
      const i = a.photos.findIndex((p) => p.id === id);
      return { ...a, photos: reorder(a.photos, i, i + delta) };
    });
  }
  async function doExport(format: "images" | "pdf" | "backup") {
    setExportError("");
    setExportProgress(0);
    cancelExport.current = new AbortController();
    try {
      if (format === "backup") await backup(album, cancelExport.current.signal);
      else
        await exportAlbum(
          album,
          format,
          setExportProgress,
          cancelExport.current.signal,
        );
      tell("已生成下载文件");
    } catch (e) {
      setExportError((e as Error).message);
    } finally {
      setExportProgress(null);
    }
  }
  async function importProject(files: FileList | null) {
    if (!files?.[0]) return;
    if (
      album.photos.length &&
      !album.demo &&
      !window.confirm(
        "导入项目将替换当前相册。需要保留当前作品，请先导出项目备份。继续？",
      )
    )
      return;
    setBusy("正在恢复项目");
    try {
      const next = await restore(files[0]);
      clearImageCache();
      update(() => next);
      setCropId(null);
      setSelected(new Set());
      tell("项目已恢复，可以继续编辑");
    } catch (e) {
      tell((e as Error).message);
    } finally {
      setBusy("");
      if (projectInput.current) projectInput.current.value = "";
    }
  }
  async function replacePhoto(files: FileList | null) {
    if (!files?.[0] || !cropId) return;
    setBusy("正在替换照片");
    try {
      const p = await makePhoto(files[0]);
      const old = cropId;
      update((a) => ({
        ...a,
        photos: [...a.photos, p],
        pages: a.pages.map((pg, i) =>
          i === active
            ? {
                ...pg,
                photos: pg.photos.map((id) => (id === old ? p.id : id)),
                crops: { ...pg.crops, [p.id]: defaultCrop() },
                locked: true,
              }
            : pg,
        ),
        coverId: page.kind === "cover" ? p.id : a.coverId,
      }));
      setCropId(p.id);
      tell("已替换当前画框，原照片仍保留在素材库");
    } catch (e) {
      tell((e as Error).message);
    } finally {
      setBusy("");
      if (replaceInput.current) replaceInput.current.value = "";
    }
  }
  const lightPhoto = album.photos.find((p) => p.id === lightbox);
  const lightUrl = useBlobUrl(lightPhoto?.blob);
  if (!ready)
    return (
      <div className="loading-screen">
        <span className="brand-mark">
          <BookOpen />
        </span>
        <h1>留页</h1>
        <p>正在展开你的摄影集…</p>
      </div>
    );
  return (
    <div className={"app " + (reading ? "reading" : "")}>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => void importPhotos(e.target.files)}
      />
      <input
        ref={projectInput}
        type="file"
        accept=".liuye,.zip"
        hidden
        onChange={(e) => void importProject(e.target.files)}
      />
      <input
        ref={replaceInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => void replacePhoto(e.target.files)}
      />
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setReading(false);
          }}
        >
          <span className="brand-mark">
            <BookOpen size={22} strokeWidth={1.4} />
          </span>
          <span>
            留页<small>LIUYE</small>
          </span>
        </a>
        <div className="header-divider" />
        <div className="project-name">
          {album.title}
          <span>{album.demo ? "示例相册" : "私人摄影集"}</span>
        </div>
        <div className={"save-state " + (save.includes("失败") ? "error" : "")}>
          <i />
          {save}
        </div>
        <div className="header-actions">
          <IconButton
            label="撤销"
            onClick={undo}
            disabled={!past.current.length}
          >
            <Undo2 size={17} />
          </IconButton>
          <IconButton
            label="重做"
            onClick={redo}
            disabled={!future.current.length}
          >
            <Redo2 size={17} />
          </IconButton>
          <span className="action-divider" />
          <button
            className="quiet-button"
            disabled={!page}
            onClick={() => setReading(!reading)}
          >
            <Eye size={16} />
            {reading ? "返回编辑" : "阅读预览"}
          </button>
          <button
            className="primary-button"
            onClick={() => setModal("export")}
            disabled={!album.photos.length}
          >
            <Download size={16} />
            导出相册
          </button>
        </div>
      </header>
      <div className="workbench">
        <nav className="rail" aria-label="编辑工具">
          {[
            { id: "templates", icon: LayoutTemplate, name: "模板" },
            { id: "photos", icon: Images, name: "照片" },
            { id: "text", icon: Type, name: "文字" },
          ].map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id as typeof tab)}
            >
              <t.icon size={21} strokeWidth={1.5} />
              <span>{t.name}</span>
            </button>
          ))}
          <div className="rail-bottom">
            <button
              onClick={() => projectInput.current?.click()}
              title="导入项目备份"
            >
              <FolderOpen size={20} />
              <span>打开</span>
            </button>
            <button onClick={() => setModal("help")}>
              <ShieldCheck size={20} />
              <span>关于</span>
            </button>
          </div>
        </nav>
        <aside className="sidebar">
          {tab === "templates" && (
            <>
              <div className="panel-heading">
                <span className="eyebrow">THE COLLECTION</span>
                <h2>为记忆，选一种气质。</h2>
                <p>四种风格，每一种都留有余地。</p>
              </div>
              <div className="template-list">
                {TEMPLATES.map((t, i) => (
                  <button
                    key={t.id}
                    className={
                      "template-card " +
                      (album.template === t.id ? "active" : "")
                    }
                    onClick={() => changeTemplate(t.id)}
                  >
                    <div
                      className={"template-art " + t.id}
                      style={{ background: t.paper, color: t.ink }}
                    >
                      <span className="template-art-title">{t.name}</span>
                      <div className="template-art-photo">
                        <PhotoImg
                          photo={
                            album.photos[i % Math.max(1, album.photos.length)]
                          }
                        />
                      </div>
                      <span className="template-art-line" />
                      <span className="template-art-note">{t.en}</span>
                    </div>
                    <div className="template-info">
                      <div>
                        <strong>{t.name}</strong>
                        <span>{t.desc}</span>
                      </div>
                      <span className="template-check">
                        {album.template === t.id ? (
                          <Check size={13} />
                        ) : (
                          <span />
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="panel-note">
                <span>不是每一页，都需要填满。</span>
                <p>照片的比例决定排版，故事的节奏由你决定。</p>
              </div>
            </>
          )}
          {tab === "photos" && (
            <>
              <div className="panel-heading">
                <span className="eyebrow">YOUR MOMENTS</span>
                <h2>照片里的，那些日子。</h2>
                <p>{album.photos.length} 张照片 · 拖动排序，双击预览</p>
              </div>
              <button
                className="upload-zone"
                disabled={!!busy}
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void importPhotos(e.dataTransfer.files);
                }}
              >
                <Upload size={23} strokeWidth={1.3} />
                <strong>{busy || "拖入照片，或点击上传"}</strong>
                <span>JPG / PNG / WebP · 每张不超过 25 MB</span>
                {album.demo && <small>上传你的照片将替换当前示例</small>}
              </button>
              <div className="selection-bar">
                <label>
                  <input
                    type="checkbox"
                    checked={
                      album.photos.length > 0 &&
                      selected.size === album.photos.length
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? new Set(album.photos.map((p) => p.id))
                          : new Set(),
                      )
                    }
                  />{" "}
                  {selected.size ? `已选 ${selected.size} 张` : "全选"}
                </label>
                <button
                  disabled={!selected.size}
                  onClick={() => setModal("group")}
                >
                  分组
                </button>
                <button
                  disabled={!selected.size}
                  onClick={() => {
                    update((a) => removePhotos(a, selected));
                    setSelected(new Set());
                    setCropId(null);
                    tell("已从相册移除，可撤销恢复");
                  }}
                >
                  <Trash2 size={14} />
                  移除
                </button>
              </div>
              <div className="photo-grid">
                {album.photos.map((p, i) => (
                  <div
                    className={
                      "photo-tile " + (selected.has(p.id) ? "checked" : "")
                    }
                    key={p.id}
                    draggable
                    onDragStart={() => {
                      photoDrag.current = p.id;
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = album.photos.findIndex(
                        (x) => x.id === photoDrag.current,
                      );
                      update((a) => ({
                        ...a,
                        photos: reorder(a.photos, from, i),
                      }));
                      photoDrag.current = null;
                    }}
                  >
                    <button
                      className="photo-thumb"
                      onDoubleClick={() => setLightbox(p.id)}
                      onClick={() =>
                        setSelected((s) => {
                          const n = new Set(s);
                          n.has(p.id) ? n.delete(p.id) : n.add(p.id);
                          return n;
                        })
                      }
                      aria-label={`选择照片 ${i + 1} ${p.name}`}
                    >
                      <PhotoImg photo={p} />
                      <span className="photo-select">
                        {selected.has(p.id) && <Check size={12} />}
                      </span>
                      <span className="photo-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </button>
                    <button
                      className={
                        "cover-pin " + (album.coverId === p.id ? "active" : "")
                      }
                      title={album.coverId === p.id ? "当前封面" : "设为封面"}
                      aria-label={`将照片 ${i + 1} 设为封面`}
                      onClick={() => chooseCover(p.id)}
                    >
                      <Bookmark
                        size={13}
                        fill={album.coverId === p.id ? "currentColor" : "none"}
                      />
                    </button>
                    <div className="photo-tools">
                      <IconButton
                        label={`照片 ${i + 1} 前移`}
                        onClick={() => movePhoto(p.id, -1)}
                        disabled={i === 0}
                      >
                        <ArrowUp size={12} />
                      </IconButton>
                      <IconButton
                        label={`预览照片 ${i + 1}`}
                        onClick={() => setLightbox(p.id)}
                      >
                        <Expand size={12} />
                      </IconButton>
                      <IconButton
                        label={`照片 ${i + 1} 后移`}
                        onClick={() => movePhoto(p.id, 1)}
                        disabled={i === album.photos.length - 1}
                      >
                        <ArrowDown size={12} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
              {failures.length > 0 && (
                <div className="import-errors">
                  <strong>{failures.length} 张未能导入</strong>
                  {failures.map((f, i) => (
                    <p key={i}>{f}</p>
                  ))}
                  <button onClick={() => fileInput.current?.click()}>
                    重新选择文件
                  </button>
                </div>
              )}
              <div className="panel-note">
                <p>
                  书签按钮用于指定封面。照片排序后，点击「重新排版」应用到正文。
                </p>
              </div>
            </>
          )}
          {tab === "text" && (
            <>
              <div className="panel-heading">
                <span className="eyebrow">WORDS TO KEEP</span>
                <h2>用自己的话，留下。</h2>
                <p>选一句开场，也可以从空白开始。</p>
              </div>
              <div className="text-section">
                <span className="field-heading">章节预设</span>
                {CHAPTERS.map((c) => (
                  <button
                    className="chapter-preset"
                    key={c.title}
                    disabled={!page}
                    onClick={() => addChapter(c.title, c.caption)}
                  >
                    <div>
                      <strong>{c.title}</strong>
                      <span>{c.caption}</span>
                    </div>
                    <Plus size={15} />
                  </button>
                ))}
                <button
                  className="outline-button full-width"
                  onClick={() => addChapter("新的章节", "")}
                  disabled={!page}
                >
                  <Plus size={15} />
                  空白章节
                </button>
                <span className="field-heading spaced">通用短句</span>
                {PHRASES.map((p) => (
                  <button
                    className="phrase"
                    key={p}
                    disabled={!page || page.kind === "cover"}
                    onClick={() => {
                      patchPage({ caption: p });
                      tell("短句已添加，可在右侧修改");
                    }}
                  >
                    {p}
                    <Plus size={13} />
                  </button>
                ))}
                <div className="panel-note">
                  <p>这些是可修改的通用预设，不会识别或分析你的照片。</p>
                </div>
              </div>
            </>
          )}
        </aside>
        <main
          className="main-area"
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("Files")) e.preventDefault();
          }}
          onDrop={(e) => {
            if (e.dataTransfer.files.length) {
              e.preventDefault();
              void importPhotos(e.dataTransfer.files);
            }
          }}
        >
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">YOUR PRIVATE PHOTOBOOK</span>
              <h1>{album.demo ? "有些片刻，值得留一页。" : album.title}</h1>
            </div>
            <button
              className="outline-button"
              disabled={!!busy}
              onClick={() => fileInput.current?.click()}
            >
              <Plus size={15} />
              添加照片
            </button>
          </div>
          <div className="workspace-subline">
            <span>
              {album.demo
                ? "从一本示例开始，想象你的故事。"
                : "按自己的顺序，整理那些值得记住的日子。"}
            </span>
            <span className="format-tag">
              4:3 横向画幅 <i /> {theme.name}
            </span>
          </div>
          <div className="canvas-stage">
            <div className="stage-label">
              <span>
                {page?.kind === "cover"
                  ? "封面"
                  : page?.kind === "back"
                    ? "封底"
                    : page?.kind === "chapter"
                      ? "章节页"
                      : `第 ${active} 页`}
              </span>
              <span>
                {album.demo
                  ? "示例作品"
                  : page?.locked
                    ? "已手动编辑"
                    : "自由编辑"}{" "}
                <span className="tiny-dot" />
              </span>
            </div>
            {page ? (
              <div className="paper-wrapper">
                <CanvasPage
                  album={album}
                  page={page}
                  selected={cropId}
                  onSelect={setCropId}
                  onCrop={patchCrop}
                  readonly={reading}
                />
              </div>
            ) : (
              <div className="empty-canvas">
                <BookOpen size={45} strokeWidth={1} />
                <h2>每一本相册，始于一个片刻。</h2>
                <p>把照片拖到这里，让故事慢慢展开。</p>
                <button
                  className="primary-button"
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload size={16} />
                  选择照片
                </button>
                <button
                  className="text-button"
                  onClick={async () => {
                    setBusy("加载示例");
                    try {
                      const a = await demoAlbum();
                      update(() => a);
                    } finally {
                      setBusy("");
                    }
                  }}
                >
                  先看看示例相册
                </button>
              </div>
            )}
            <div className="canvas-under">
              <span>
                <Move size={13} />
                {reading
                  ? "左右方向键翻页，Esc 返回编辑"
                  : "点击照片调整取景 · 在右侧修改文字"}
              </span>
              <div>
                <IconButton
                  label="上一页"
                  disabled={active === 0}
                  onClick={() => go(active - 1)}
                >
                  <ChevronLeft size={17} />
                </IconButton>
                <span>
                  {album.pages.length
                    ? String(active + 1).padStart(2, "0")
                    : "00"}{" "}
                  <em>/ {String(album.pages.length).padStart(2, "0")}</em>
                </span>
                <IconButton
                  label="下一页"
                  disabled={active >= album.pages.length - 1}
                  onClick={() => go(active + 1)}
                >
                  <ChevronRight size={17} />
                </IconButton>
              </div>
            </div>
          </div>
          <div className="page-strip">
            <div className="strip-label">
              <span>书页</span>
              <small>{album.pages.length} PAGES</small>
            </div>
            <div className="pages-scroll">
              {album.pages.map((p, i) => (
                <button
                  key={p.id}
                  className={"page-thumbnail " + (active === i ? "active" : "")}
                  onClick={() => go(i)}
                  draggable={p.kind === "photo" || p.kind === "chapter"}
                  onDragStart={() => {
                    pageDrag.current = i;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = pageDrag.current;
                    if (
                      from === null ||
                      i === 0 ||
                      i === album.pages.length - 1
                    )
                      return;
                    update((a) => ({
                      ...a,
                      pages: reorder(a.pages, from, i),
                      activePage: i,
                    }));
                    pageDrag.current = null;
                  }}
                >
                  <MiniPage page={p} album={album} />
                  <span>
                    {p.kind === "cover"
                      ? "封面"
                      : p.kind === "back"
                        ? "封底"
                        : p.kind === "chapter"
                          ? p.title
                          : i.toString().padStart(2, "0")}
                  </span>
                </button>
              ))}
              <button
                className="add-page"
                disabled={!page}
                onClick={() => setModal("chapter")}
                title="添加章节"
              >
                <Plus size={20} />
                <span>章节</span>
              </button>
            </div>
          </div>
          <footer className="workspace-footer">
            <span>
              <LockKeyhole size={12} />
              照片只保存在当前浏览器
            </span>
            <span>慢慢整理，认真收藏。</span>
          </footer>
        </main>
        <aside className="inspector">
          <div className="inspector-heading">
            <h3>{cropPhoto ? "照片取景" : "相册设置"}</h3>
            {cropPhoto ? (
              <IconButton label="关闭取景设置" onClick={() => setCropId(null)}>
                <X size={15} />
              </IconButton>
            ) : (
              <span>DETAILS</span>
            )}
          </div>
          {cropPhoto && page ? (
            <>
              <div className="selected-photo">
                <PhotoImg photo={cropPhoto} />
                <span>{cropPhoto.name}</span>
              </div>
              <div className="inspector-section">
                <span className="field-heading">适配方式</span>
                <div className="segmented">
                  <button
                    className={crop.fit === "contain" ? "active" : ""}
                    onClick={() =>
                      patchCrop(cropPhoto.id, {
                        ...defaultCrop(),
                        fit: "contain",
                      })
                    }
                  >
                    完整显示
                  </button>
                  <button
                    className={crop.fit === "cover" ? "active" : ""}
                    onClick={() =>
                      patchCrop(cropPhoto.id, {
                        ...defaultCrop(),
                        fit: "cover",
                      })
                    }
                  >
                    铺满画框
                  </button>
                </div>
                <label className="range-label">
                  缩放 <span>{Math.round(crop.zoom * 100)}%</span>
                  <input
                    aria-label="照片缩放"
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={crop.zoom}
                    onChange={(e) =>
                      patchCrop(cropPhoto.id, {
                        ...crop,
                        zoom: +e.target.value,
                      })
                    }
                  />
                </label>
                <label className="range-label">
                  水平位置 <span>{Math.round(crop.x * 100)}</span>
                  <input
                    aria-label="水平位置"
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={crop.x}
                    onChange={(e) =>
                      patchCrop(cropPhoto.id, { ...crop, x: +e.target.value })
                    }
                  />
                </label>
                <label className="range-label">
                  垂直位置 <span>{Math.round(crop.y * 100)}</span>
                  <input
                    aria-label="垂直位置"
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={crop.y}
                    onChange={(e) =>
                      patchCrop(cropPhoto.id, { ...crop, y: +e.target.value })
                    }
                  />
                </label>
                <button
                  className="outline-button full-width"
                  onClick={() => patchCrop(cropPhoto.id, defaultCrop())}
                >
                  <RotateCcw size={14} />
                  重置取景
                </button>
                <button
                  className="text-button full-width"
                  disabled={album.photos.length >= 100}
                  onClick={() => replaceInput.current?.click()}
                >
                  替换这张照片
                </button>
                <p className="small-note">
                  完整显示保留原始构图。铺满画框后，可以拖动照片调整裁切。
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="inspector-section">
                <label className="field-label">
                  相册标题
                  <input
                    aria-label="相册标题"
                    maxLength={24}
                    value={album.title}
                    placeholder="给这段记忆起个名字"
                    onChange={(e) =>
                      update((a) => ({ ...a, title: e.target.value }))
                    }
                  />
                </label>
                <label className="field-label">
                  一句话介绍
                  <textarea
                    aria-label="相册介绍"
                    maxLength={36}
                    rows={2}
                    value={album.subtitle}
                    placeholder="写下此刻想说的话"
                    onChange={(e) =>
                      update((a) => ({ ...a, subtitle: e.target.value }))
                    }
                  />
                  {album.subtitle.split("\n").length > 2 && (
                    <small className="text-warning">
                      介绍最多显示 2 行，请减少换行。
                    </small>
                  )}
                </label>
                <div className="field-row">
                  <label className="field-label">
                    地点
                    <input
                      aria-label="地点"
                      maxLength={12}
                      value={album.location}
                      placeholder="在哪里"
                      onChange={(e) =>
                        update((a) => ({ ...a, location: e.target.value }))
                      }
                    />
                  </label>
                  <label className="field-label">
                    时间
                    <input
                      aria-label="时间"
                      maxLength={18}
                      value={album.date}
                      placeholder="某年某月"
                      onChange={(e) =>
                        update((a) => ({ ...a, date: e.target.value }))
                      }
                    />
                  </label>
                </div>
              </div>
              <div className="inspector-section">
                <span className="field-heading">
                  封面照片 <small>由你决定</small>
                </span>
                {album.coverId ? (
                  <button
                    className="cover-selector"
                    onClick={() => {
                      setTab("photos");
                      tell("点击任意照片右上角的书签，更换封面");
                    }}
                  >
                    <PhotoImg
                      photo={album.photos.find((p) => p.id === album.coverId)}
                    />
                    <div>
                      <span>这张，就是故事的开场。</span>
                      <small>
                        更换封面 <ChevronRight size={11} />
                      </small>
                    </div>
                  </button>
                ) : (
                  <button
                    className="cover-empty"
                    onClick={() => {
                      setTab("photos");
                      tell("点击照片右上角的书签按钮，设为封面");
                    }}
                  >
                    <Bookmark size={17} />
                    选择一张封面照片
                  </button>
                )}
              </div>
              {page?.kind === "photo" && (
                <div className="inspector-section">
                  <span className="field-heading">
                    本页排版 <small>{page.photos.length} 张照片</small>
                  </span>
                  <div className="layout-options">
                    {LAYOUTS.filter((l) => l.count === page.photos.length).map(
                      (l) => (
                        <button
                          className={page.layout === l.id ? "active" : ""}
                          key={l.id}
                          onClick={() =>
                            patchPage({
                              layout: l.id,
                              crops:
                                l.id === "full"
                                  ? Object.fromEntries(
                                      page.photos.map((id) => [
                                        id,
                                        { ...defaultCrop(), fit: "cover" },
                                      ]),
                                    )
                                  : {},
                            })
                          }
                        >
                          <LayoutGlyph layout={l.id} />
                          <span>{l.name}</span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
              {page && page.kind !== "cover" && (
                <div className="inspector-section">
                  {page.kind === "chapter" && (
                    <label className="field-label">
                      章节标题
                      <input
                        aria-label="章节标题"
                        maxLength={24}
                        value={page.title}
                        onChange={(e) => patchPage({ title: e.target.value })}
                      />
                    </label>
                  )}
                  <label className="field-label">
                    {page.kind === "chapter"
                      ? "章节文字"
                      : page.kind === "back"
                        ? "结束语"
                        : "本页文字"}
                    <textarea
                      aria-label="本页文字"
                      rows={3}
                      maxLength={page.kind === "chapter" ? 80 : 48}
                      placeholder="留白，也是一种表达。"
                      value={page.caption}
                      onChange={(e) => patchPage({ caption: e.target.value })}
                    />
                    <small>
                      {page.caption.length} /{" "}
                      {page.kind === "chapter" ? 80 : 48}
                    </small>
                    {page.caption.split("\n").length >
                      (page.kind === "chapter"
                        ? 4
                        : page.kind === "back"
                          ? 3
                          : 2) && (
                      <small className="text-warning">
                        文字超出画框行数，请减少换行后导出。
                      </small>
                    )}
                  </label>
                </div>
              )}
              <div className="inspector-section">
                <span className="field-heading">纸页规格</span>
                <div className="paper-spec">
                  <div className="paper-icon">4:3</div>
                  <div>
                    <strong>横向摄影集</strong>
                    <span>2400 × 1800 px · 导出图片</span>
                  </div>
                  <Check size={14} />
                </div>
              </div>
            </>
          )}
          <div className="inspector-bottom">
            {page && (page.kind === "photo" || page.kind === "chapter") && (
              <div className="page-actions">
                <IconButton
                  label="页面前移"
                  disabled={active <= 1}
                  onClick={() => {
                    update((a) => ({
                      ...a,
                      pages: reorder(a.pages, active, active - 1),
                      activePage: active - 1,
                    }));
                    setCropId(null);
                  }}
                >
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton
                  label="页面后移"
                  disabled={active >= album.pages.length - 2}
                  onClick={() => {
                    update((a) => ({
                      ...a,
                      pages: reorder(a.pages, active, active + 1),
                      activePage: active + 1,
                    }));
                    setCropId(null);
                  }}
                >
                  <ArrowDown size={15} />
                </IconButton>
                <button
                  onClick={() => {
                    update((a) => ({
                      ...a,
                      pages: a.pages.filter((_, i) => i !== active),
                      activePage: Math.max(0, active - 1),
                    }));
                    setCropId(null);
                    tell("页面已移除，原照片仍在素材库");
                  }}
                >
                  <Trash2 size={13} />
                  移除此页
                </button>
              </div>
            )}
            <button
              className="primary-button full-width"
              onClick={build}
              disabled={!!busy}
            >
              <LayoutTemplate size={16} />
              {album.pages.length ? "重新排版" : "生成相册"}
            </button>
            <p>按照片顺序排版 · 随时可以撤销</p>
          </div>
        </aside>
      </div>
      {reading && (
        <button
          className="exit-reading outline-button"
          onClick={() => setReading(false)}
        >
          <PanelLeftClose size={16} />
          返回编辑
        </button>
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="关闭提示">
            <X size={14} />
          </button>
        </div>
      )}
      {busy && (
        <div className="busy-overlay" role="status">
          <LoaderCircle className="spin" size={23} />
          {busy}
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (exportProgress === null) setModal(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "export"
                ? "导出相册"
                : modal === "chapter" || modal === "group"
                  ? "添加章节"
                  : "关于留页"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              label="关闭窗口"
              disabled={exportProgress !== null}
              onClick={() => setModal(null)}
            >
              <X size={20} />
            </IconButton>
            {modal === "export" ? (
              <>
                <span className="eyebrow">KEEP IT WITH YOU</span>
                <h2>让记忆，成为可以带走的礼物。</h2>
                <p>
                  「{album.title}」 · {album.pages.length} 页 ·{" "}
                  {album.photos.length} 张照片
                </p>
                {[
                  {
                    id: "images",
                    icon: ImageIcon,
                    title: "页面图片",
                    desc: "2400 × 1800 高清 JPG，打包为 ZIP；适合手机浏览与分享。",
                  },
                  {
                    id: "pdf",
                    icon: FileText,
                    title: "PDF 摄影集",
                    desc: "保持完整页序，在手机或电脑上慢慢翻阅。",
                  },
                  {
                    id: "backup",
                    icon: Archive,
                    title: "可编辑项目备份",
                    desc: "包含原图、文字与取景参数，导入留页后继续编辑。",
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    className="export-option"
                    disabled={
                      exportProgress !== null ||
                      (!album.coverId && f.id !== "backup") ||
                      (!album.pages.length && f.id !== "backup")
                    }
                    onClick={() =>
                      void doExport(f.id as "images" | "pdf" | "backup")
                    }
                  >
                    <f.icon size={25} strokeWidth={1.3} />
                    <div>
                      <strong>{f.title}</strong>
                      <span>{f.desc}</span>
                    </div>
                    <Download size={17} />
                  </button>
                ))}
                {!album.coverId && (
                  <p className="warning">
                    请先选择封面照片，再导出成品。项目备份仍可下载。
                  </p>
                )}
                {exportProgress !== null && (
                  <div className="export-progress">
                    <progress max={100} value={exportProgress} />
                    <span>正在生成 {exportProgress}%</span>
                    <button onClick={() => cancelExport.current?.abort()}>
                      取消
                    </button>
                  </div>
                )}
                {exportError && (
                  <p className="warning" role="alert">
                    {exportError}
                  </p>
                )}
                <div className="privacy-note">
                  <ShieldCheck size={15} />
                  所有导出均在本机完成，照片不会上传。
                </div>
              </>
            ) : modal === "chapter" || modal === "group" ? (
              <>
                <span className="eyebrow">A NEW CHAPTER</span>
                <h2>给故事，一个停顿。</h2>
                <p>
                  {modal === "group"
                    ? `将选中的 ${selected.size} 张照片移入新章节，并放在封底之前；其他照片与封面保留。`
                    : "章节将添加在当前页之后，文字可以随时修改。"}
                </p>
                {(modal === "group"
                  ? [
                      {
                        title: "人物",
                        caption: "记住相遇，也记住此刻的自己。",
                      },
                      { title: "风景", caption: "把沿途的风景，留在这一页。" },
                      {
                        title: "细节",
                        caption: "一些细小的片刻，也值得收藏。",
                      },
                      { title: "同行", caption: "一起走过的日子。" },
                    ]
                  : CHAPTERS
                ).map((c) => (
                  <button
                    className="chapter-preset"
                    key={c.title}
                    onClick={() => addChapter(c.title, c.caption)}
                  >
                    <div>
                      <strong>{c.title}</strong>
                      <span>{c.caption}</span>
                    </div>
                    <Plus size={18} />
                  </button>
                ))}
                <button
                  className="outline-button full-width"
                  onClick={() => addChapter("新的章节", "")}
                >
                  添加空白章节
                </button>
              </>
            ) : (
              <>
                <span className="eyebrow">A LITTLE SPACE FOR MEMORIES</span>
                <h2>你的照片，留在你这里。</h2>
                <p>
                  留页是一个不使用 AI
                  的私人摄影集工作室。模板根据图片尺寸排版，封面、章节和文字都由你决定。
                </p>
                <div className="help-note">
                  <strong>本机自动保存</strong>
                  <p>
                    作品保存在当前设备、当前浏览器。清理网站数据或使用无痕模式可能导致丢失，请定期导出项目备份。
                  </p>
                  <strong>换一台设备继续</strong>
                  <p>
                    导出 .liuye
                    项目，在另一台电脑打开留页，点击左下角「打开」即可恢复。手机推荐阅读导出的图片或
                    PDF。
                  </p>
                  <strong>示例素材</strong>
                  <p>
                    示例照片来自 Pexels，来源和使用说明见项目
                    README。示例短句均为通用预设。
                  </p>
                </div>
                <button
                  className="outline-button full-width"
                  onClick={() => {
                    setModal(null);
                    projectInput.current?.click();
                  }}
                >
                  <FolderOpen size={16} />
                  导入项目备份
                </button>
              </>
            )}
          </section>
        </div>
      )}
      {lightPhoto && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="照片预览"
          onClick={() => setLightbox(null)}
        >
          <IconButton label="关闭照片预览" onClick={() => setLightbox(null)}>
            <X size={23} />
          </IconButton>
          <img src={lightUrl} alt={lightPhoto.name} />
          <div onClick={(e) => e.stopPropagation()}>
            <span>
              {lightPhoto.name} · {lightPhoto.width} × {lightPhoto.height}
            </span>
            <button
              className="primary-button"
              onClick={() => chooseCover(lightPhoto.id)}
            >
              <Bookmark size={15} />
              用这张做封面
            </button>
          </div>
        </div>
      )}
      <span hidden>{historyCount}</span>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
