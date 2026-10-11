# 《一梦入江南》图像生成记录

生成方式：内置 image_gen 工具。当前工具不开放模型选择，也未返回可核验的模型名称，因此不能确认使用了用户指定的 image-2.5。没有切换到 CLI。

## 封面设计参考

输入：相册/432A7476.jpg。输出：cover-design.png。

用途：确定书法标题、花窗照片、青灰宣纸和浅墨园林的视觉方向。网页封面采用该构图重新排版，人物部分直接使用原始照片的网页副本，以保留真实人物细节。

最终提示词：

Use case: ads-marketing
Asset type: finished flat front cover artwork for a personal Chinese travel portrait photobook, portrait 3:4.
Primary request: Design a refined Chinese editorial photobook cover named "一梦入江南". Suzhou classical garden, poetic misty Jiangnan atmosphere, white Hanfu beauty.
Input images: Image 1 is a photo insert reference. Preserve the pictured woman's exact identity, face, hairstyle, white Hanfu, pose and umbrella; preserve the garden scene within the photo. Do not invent another woman.
Composition: flat full-bleed page design, NOT a mockup or a 3D book. Pale celadon-gray fibrous rice-paper background. A large tall photographic inset on the right occupying about 65% of page width, using the provided photograph with its octagonal garden window and woman, careful not to crop the face or umbrella. On the left, spacious vertical Chinese title in expressive elegant black ink calligraphy, subtle vertical small editorial text. Very restrained painted ink willow foliage at bottom left and a faint mist-washed garden silhouette along the bottom margin. The actual photo remains photographic, never painted. Elegant irregular photo border subtly blending into paper, not a torn-paper collage.
Text verbatim: large title "一梦入江南"; small subtitle "晓梦 · 姑苏游园记"; small red seal "听雨"; tiny bottom text "一卷园林清梦，半笺烟雨江南。"
Palette: pale celadon #dce4db, paper #f2f1e9, deep pine #243e36, muted vermilion seal.
Lighting/mood: quiet, intimate, antique literati poetry meets refined contemporary photography book.
Constraints: correct Chinese typography, beautiful generous negative space, no logos, no watermark, no UI elements, no extra text, no face reconstruction. High resolution portrait 3:4.

## 宣纸园林底图

输出：../assets/ink-garden.png。用于实际网页封面、序页和封底。

最终提示词：

Use case: stylized-concept
Asset type: flat portrait 3:4 full-page decorative background paper for a Chinese personal photography book, usable behind actual photographs and HTML typography.
Primary request: quiet, poetic Suzhou garden scenery painted in very restrained Chinese ink wash on pale celadon-gray-white handmade rice paper. Wispy drooping willow branches enter only from the upper left corner; faint misty small pavilion, arched stone bridge and water reflection inhabit only the bottom 18 percent of the page. Visible delicate paper fibers, cool warm-white #f1f1e9 with gray-green ink #81958b. Ninety percent pale negative space overall; keep central 75 percent nearly empty for photos and text. A refined book interior texture, gentle nearly invisible feathered ink, calm exquisite Chinese literati aesthetic. No people, no text, no title, no seal, no border, no interface, no book mockup. Full bleed flat raster artwork. Portrait 3:4 high resolution.

