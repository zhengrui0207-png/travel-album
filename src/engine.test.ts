import { test } from "node:test";
import assert from "node:assert/strict";
import {
  paginate,
  generate,
  emptyAlbum,
  removePhotos,
  defaultCrop,
  imagePlacement,
  frames,
  TEMPLATES,
  LAYOUTS,
  reorder,
  type Photo,
} from "./engine";
import { validateProject } from "./storage";
const photos = (n: number): Photo[] =>
  Array.from({ length: n }, (_, i) => ({
    id: "p" + i,
    name: "photo-" + i,
    width: [1200, 800, 3000, 1000][i % 4],
    height: [800, 1200, 700, 1000][i % 4],
    blob: new Blob(),
    thumb: new Blob(),
    created: 0,
  }));
test("all templates preserve every photo exactly once and preserve user order for 1,20,100 photos", () => {
  for (const t of TEMPLATES)
    for (const n of [1, 20, 100]) {
      const p = photos(n),
        pages = paginate(p, t.id);
      assert.deepEqual(
        pages.flatMap((p) => p.photos),
        p.map((p) => p.id),
      );
      assert.ok(
        pages.every(
          (p) =>
            p.photos.length === LAYOUTS.find((l) => l.id === p.layout)!.count,
        ),
      );
    }
});
test("cover is always explicitly selected; generation never chooses a cover", () => {
  const a = emptyAlbum();
  a.photos = photos(5);
  const pages = generate(a);
  assert.deepEqual(pages[0].photos, []);
  a.coverId = "p3";
  assert.deepEqual(generate(a)[0].photos, ["p3"]);
  assert.deepEqual(
    generate(a)
      .filter((p) => p.kind === "photo")
      .flatMap((p) => p.photos),
    a.photos.map((p) => p.id),
  );
});
test("deleting selected photos also repairs page layouts and clears deleted cover without choosing a replacement", () => {
  const a = emptyAlbum();
  a.photos = photos(6);
  a.coverId = "p0";
  a.pages = generate(a);
  a.activePage = a.pages.length - 1;
  const b = removePhotos(a, new Set(["p0", "p1", "p3"]));
  assert.equal(b.coverId, null);
  assert.equal(b.photos.length, 3);
  assert.ok(
    b.pages.every((p) =>
      p.photos.every((id) => !["p0", "p1", "p3"].includes(id)),
    ),
  );
  assert.ok(b.activePage < b.pages.length);
  assert.deepEqual(
    removePhotos(a, new Set(a.photos.map((p) => p.id))).photos,
    [],
  );
});
test("contain preserves all pixels; cover and extreme panning never reveal empty canvas", () => {
  for (const t of TEMPLATES)
    for (const l of LAYOUTS)
      for (const r of frames(t.id, l.id))
        for (const [w, h] of [
          [800, 1200],
          [3000, 500],
          [1000, 1000],
        ]) {
          let b = imagePlacement(w, h, r, defaultCrop());
          assert.ok(
            b.x >= r.x - 1e-8 &&
              b.y >= r.y - 1e-8 &&
              b.x + b.w <= r.x + r.w + 1e-8 &&
              b.y + b.h <= r.y + r.h + 1e-8,
          );
          for (const x of [-1, 0, 1])
            for (const y of [-1, 0, 1]) {
              b = imagePlacement(w, h, r, { fit: "cover", zoom: 2, x, y });
              assert.ok(
                b.x <= r.x + 1e-8 &&
                  b.y <= r.y + 1e-8 &&
                  b.x + b.w >= r.x + r.w - 1e-8 &&
                  b.y + b.h >= r.y + r.h - 1e-8,
              );
            }
        }
});
test("reordering is immutable and invalid moves do not lose a photo", () => {
  const a = ["a", "b", "c"];
  assert.deepEqual(reorder(a, 0, 2), ["b", "c", "a"]);
  assert.deepEqual(a, ["a", "b", "c"]);
  assert.deepEqual(reorder(a, -1, 1), a);
});
test("project restore validation rejects unsupported versions, dangling references, malformed crops and duplicate photo ids", () => {
  const a = emptyAlbum();
  a.photos = photos(3);
  a.pages = generate(a);
  validateProject(a);
  for (const mutate of [
    (b: any) => (b.version = 999),
    (b: any) => (b.pages[1].photos = ["missing"]),
    (b: any) => b.photos.push(b.photos[0]),
    (b: any) => (b.pages[1].crops.p0 = { fit: "cover", zoom: 100, x: 0, y: 0 }),
  ]) {
    const b = structuredClone(a);
    mutate(b);
    assert.throws(() => validateProject(b));
  }
});

test("manual grouping preserves cover and all library assets, moves only selected content into a new chapter", async () => {
  const { groupIntoChapter } = await import("./engine");
  const a = emptyAlbum();
  a.photos = photos(8);
  a.coverId = "p2";
  a.pages = generate(a);
  const b = groupIntoChapter(a, new Set(["p2", "p4"]), "人物", "手动分组");
  assert.equal(b.coverId, "p2");
  assert.equal(b.photos.length, 8);
  assert.deepEqual(b.pages[0].photos, ["p2"]);
  assert.equal(b.pages[b.activePage].title, "人物");
  assert.deepEqual(
    b.pages
      .slice(b.activePage + 1)
      .filter((p) => p.kind === "photo")
      .flatMap((p) => p.photos),
    ["p2", "p4"],
  );
  const body = b.pages
    .filter((p) => p.kind === "photo")
    .flatMap((p) => p.photos);
  assert.equal(new Set(body).size, 8);
  assert.equal(body.length, 8);
});
