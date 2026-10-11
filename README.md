# 留页 · 私人摄影集

一个不调用 AI 的本地相册制作网站。照片保存在当前浏览器的 IndexedDB 中；没有账号、图片上传接口、人物识别或自动文案服务。

## 启动

需要 Node.js 22+。

```sh
npm install
npm run dev
```

打开 http://127.0.0.1:5173 。正式构建：`npm run build`；产物为 `dist/`。本地查看构建产物：`npm run preview`。

## 制作流程

1. 首次打开显示明确标注的示例相册。上传自己的照片会替换示例；之后上传则追加素材。
2. 批量选择 JPG、PNG、WebP；每本最多 100 张，单张不超过 25 MB。HEIC / RAW 需要先转换。照片不会发给任何模型或云端服务。
3. 在照片墙点击书签手动指定封面。可勾选移除、拖动排序、前移后移、大图预览。
4. 勾选照片后点击「分组」，手动归入人物 / 风景 / 细节 / 同行章节；不使用场景识别。新分组放在封底前，所选照片从原正文页移入新章节，原图和封面保留。
5. 选择素笺 / 远行 / 片段 / 夜色模板，点击重新排版。确定性的分页规则仅使用尺寸、比例和顺序，不分析图片内容。
6. 点击照片调整完整显示 / 铺满画框、缩放、水平与垂直位置。拖动时实时预览取景，松开后保存；照片不会被修改，裁切仅属于该页面的画框。
7. 插入通用章节，修改相册标题、介绍、日期地点、每页短句；文字预设可修改，未使用 AI。
8. 导出高清页面 ZIP、PDF，或带原始图片与编辑状态的 `.liuye` 项目备份。

## 行为说明

- 原照片默认完整显示；用户可主动切换铺满画框。缩放可能裁切照片。
- 封面由用户明确指定；删除封面不会自动选择替代图片。未选择封面时可以备份，但不能导出成品。
- 封面照片会保留在正文中。模板切换保留页面、文字、顺序与取景；点击重新排版才会重新分页。
- 新上传图片进入素材库；已有页面不会被自动重排。需要点击重新排版将新增素材编入整本书。
- 重新排版会重置章节与手动编辑，操作前会提醒；可撤销恢复。撤销历史在当前会话保留最近 30 次操作，刷新后不保留。
- 删除页面只移除页面，原图仍留在素材库。移除照片会同步移除其页面引用。
- 编辑后延迟 400 ms 保存。只有显示“已保存到本机”才代表写入完成。清理浏览器网站数据会删除作品，定期下载备份。不同端口 / 域名属于不同存储空间。
- 电脑为主要编辑端，手机可用图片或 PDF 阅读。网页有窄屏适配，但首版不承诺完整移动端制作体验。
- 预览与导出共用 Canvas 布局；PDF 是按页嵌入的高清图片，文字不可选，不是专业印刷 PDF。
- 使用设备自带宋体 / 黑体后备字体，无远程字体请求。同一设备的预览与导出一致，跨操作系统字体可能略有差异。
- 目前每个浏览器保存一本当前相册；可通过项目备份切换不同作品。

## 结构

- `src/engine.ts`：相册数据、模板画框、动态规划分页、排序与删除逻辑。
- `src/render.ts`：预览与导出共享的 1200 × 900 坐标系；JPG 导出放大到 2400 × 1800。
- `src/storage.ts` / `src/export.ts`：IndexedDB、项目校验、ZIP 与 PDF 导出。
- `src/main.tsx` / `src/style.css`：编辑器、阅读模式与响应式界面。

## 检查

```sh
npm test
npm run build
```

规则测试涵盖各模板 1/20/100 张照片的完整性与顺序、手动封面、删除修复、极端比例取景、排序和非法项目校验。浏览器验证截图存放于 `output/playwright/`（不入版本库）。

## 示例照片来源

示例均为 Pexels 标为免费使用的照片，仅用于模板演示，来源链接保留如下：

- portrait.jpg：https://www.pexels.com/photo/woman-wearing-white-dress-on-a-beach-18938539/
- walk.jpg：https://www.pexels.com/photo/woman-in-white-dress-walking-on-beach-water-8908751/
- umbrella.jpg：https://www.pexels.com/photo/a-woman-in-white-dress-standing-on-the-beach-2544165/
- shore.jpg：https://www.pexels.com/photo/woman-in-white-dress-walking-on-beach-12720656/
- ocean.jpg：https://www.pexels.com/photo/scenic-coastal-landscape-with-ocean-waves-34762949/
- waves.jpg：https://www.pexels.com/photo/wave-on-beach-8438179/

许可说明：https://www.pexels.com/license/ 。图片已随网站提供本地副本，运行时不请求第三方图片服务器。
