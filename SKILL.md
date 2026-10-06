---
name: impasto-tween-animation
description: "作为 palette-knife-impasto-ui 的下游补间动画 Skill：在 UI 组件拼装完成后，为 default、hover、focus、pressed、clicked、disabled、selected、loading、success 等状态生成有材质感的补间、果汁/果冻感、弹性、旋转和不规则形变，并在 H5/Godot 中提供可验收的状态契约。"
---

# 厚涂 UI 补间动画

本 Skill 只在 `palette-knife-impasto-ui` 完成「主题 → 组件清单 → 生成/拼装 → 材质检查」后调用。它负责把静态油画组件变成有反馈、有重量、有节奏的交互组件；不会用纯色背景或默认 `transition: all` 替换油彩本体。

## 触发条件

从请求中提取：

```text
downstream_of: palette-knife-impasto-ui
runtime: h5-dom | godot | other
input: mouse | keyboard | touch | gamepad | mixed
components: 需要动效的组件及实例 id
states: default | hover | focus | pressed | clicked | disabled | selected | loading | success | error
motion_tone: calm | confident | playful | juicy | jelly | dramatic
reduced_motion: respect-system | off | custom
```

缺少 `runtime` 时输出平台中立的状态矩阵和参数；用户明确要求 H5、可运行或验收页面时进入 `runtime-integration`。

## 下游输入与输出契约

输入必须包含：

- UI 组件 manifest：组件 id、几何/材质家族、文字安全区、可交互状态
- 静态组件本体或 DOM/Control 节点引用；hover/pressed 不得以纯色图代替原始材质
- 交互事件与平台目标；触控设备至少提供 pressed/selected/focus-visible 等价反馈
- 可用动画预算：常规反馈 120–220ms，进入/退出 180–420ms，连续循环需明确停止条件

输出必须包含：

- `motion-manifest.json`：每个状态的 trigger、from/to keyframes、duration、easing、delay、fill、interrupt、reduced-motion 降级
- 可复用 tokens：easing、duration、spring/jelly 参数、transform-origin、opacity/blur 上限
- H5 CSS/JS 或 Godot Tween 实现；所有动画使用显式属性白名单
- 状态矩阵与验收记录：normal、hover、focus-visible、pressed、clicked、disabled、selected、loading、success、error
- 动效证据：桌面/移动端截图或视频、重复触发/中断测试、`prefers-reduced-motion` 结果
- 未实现项和平台限制；不能以“看起来有动画”替代可重复的状态契约

## 核心工作流

1. **读取上游契约**：复核组件清单、材质和文字配对；发现缺组件先返回 UI Skill，不在动画层补假组件。
2. **建立状态图**：为每个交互组件列出 `default → hover/focus → pressed → clicked → success/error`，以及 pointerleave、blur、disabled、loading 中断路径。
3. **选择动势**：根据 tone 选择 easing 与 transform 组合。优先 transform/opacity，颜色和滤镜只做低幅度辅助；不动画布局尺寸、`top/left` 或大面积 box-shadow。
4. **建立时间线**：主运动、材质回应、文字回应分层；主运动先完成，装饰层可延迟 20–60ms。每个事件只允许一个可取消的 active animation。
5. **接入运行时**：H5 使用 CSS transitions/keyframes 或 Web Animations API；Godot 使用 Tween/Trans。事件可重复、可中断、可恢复；touch 使用 pointer 事件，不依赖 hover。
6. **无障碍降级**：尊重 `@media (prefers-reduced-motion: reduce)`；保留即时状态变化、焦点环、颜色/文本/图标等非运动反馈。提供 Demo 的手动 Reduced motion 开关。
7. **验收**：按状态矩阵逐项触发，检查材质仍可见、文字不漂移、焦点不丢、移动端无 hover 卡住、连续点击不叠加幽灵动画，并记录通过/部分通过/未验证。

## 动势词典

- **果汁感（juicy）**：按下时短促压缩 `scale(0.96)`，回弹 `scale(1.03 → 1)`；配合高光位移、轻微亮度变化，避免颜色整块替换。适合 CTA、奖励、成功反馈。
- **果冻感（jelly）**：`scaleX(1.05) scaleY(0.95)` 后反向回弹，或使用 3–4 个 keyframe 让长宽交替。幅度通常 ≤6%，避免文字变形；适合按钮、徽章、空状态插画。
- **弹性进入（spring）**：超调 y 值或 scale 值可使用 `cubic-bezier(0.2, 1.35, 0.3, 1)`；更复杂弹簧用 WAAPI 多帧或 JS 插值。超调应小于组件尺寸的 8%。
- **不规则/手绘回应**：`rotate(-1.2deg → 0.8deg → 0deg)`、`skewX` 低幅度或 `clip-path` 仅用于装饰层。保持油彩边缘与透明高光，禁止替换为平面色块。
- **旋转与擦拭**：图标可 6–12° 轻旋，加载可 360° 低速旋转；大于 180° 或持续循环必须有 reduced-motion 方案。
- **材质层**：优先 opacity、filter brightness/saturate、背景纹理位置、伪元素高光与刀痕；不在主本体上叠 opaque layer。

## Easing 与时长基线

| 用途 | 推荐 token | CSS 值 | 时长 |
| --- | --- | --- | --- |
| 静态状态切换 | `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | 160–220ms |
| 进入 | `ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | 220–420ms |
| 离开 | `ease-exit` | `cubic-bezier(0.7, 0, 0.84, 0)` | 140–240ms |
| 果汁回弹 | `ease-juice` | `cubic-bezier(0.22, 1.25, 0.36, 1)` | 260–420ms |
| 果冻形变 | `ease-jelly` | `cubic-bezier(0.35, 1.5, 0.65, 1)` | 300–520ms |
| 机械步进 | `ease-step` | `steps(4, end)` | 180–320ms |
| 线性进度 | `ease-linear` | `linear` | 按业务时长 |

`cubic-bezier()` 的 x 控制点必须在 0–1；y 可以越界制造小幅回弹。`linear()` 适合自定义多段速度，`steps()` 适合分页、刻度或机械跳变。参考 MDN easing 文档和 Material Design duration/easing。

## 状态矩阵（默认要求）

| 状态 | 触发 | 动效建议 | 必须保留 | 降级 |
| --- | --- | --- | --- | --- |
| default | 无输入 | 静态油彩/环境微动可选 | 文字对比、材质层次 | 静态 |
| hover | pointerenter | 2–4px 位移、局部高光、1° 内旋转 | 原始油画纹理 | 用 focus-visible/pressed 等价 |
| focus-visible | 键盘 focus | 焦点环 120–180ms fade/paint | WCAG 可见焦点 | 即时焦点环 |
| pressed | pointerdown/keydown | scale 0.96、压痕/亮度轻降 | 触点反馈 | 即时状态 |
| clicked | click 完成 | 果汁回弹、涟漪或墨点 | 操作结果 | 直接跳到结果态 |
| disabled | disabled | 无 pointer 动效；降低饱和度/对比度但仍保材质 | 可读性、aria-disabled | 静态禁用 |
| selected | 选择完成 | 轻微上浮、边缘描线、selected icon | 当前选择可辨 | 即时 selected |
| loading | 异步中 | 低幅旋转/进度，禁止抖动 | 文案与 `aria-busy` | 静态 loading 文案 |
| success | 成功 | scale 1→1.04→1、短高光、图标勾 | 结果文本 | 图标/文本 |
| error | 失败 | 2 次以内轻微横向抖动 ≤4px | 错误文案、焦点 | 颜色+文本 |

## H5 实现建议

- CSS 只 transition 明确的 `transform, opacity, filter, background-position, border-color`；不要 `transition: all`。
- Web Animations API 适合可取消、可重播和多关键帧：`element.animate(keyframes, {duration, easing, fill:'both'})`；默认 easing 是 linear，需显式传入。
- pointer 事件统一鼠标和触控；`pointercancel`、`pointerleave` 和 `blur` 必须清理 pressed/hover。
- `transform-origin` 与油画组件重心一致；文字容器独立于变形本体，避免字形被拉伸。
- 动画中使用 `will-change` 要短时、按需添加；优先 transform/opacity 以减少布局和绘制。
- 移动端 `@media (hover: none)` 不依赖 hover；用 pressed/selected 反馈。
- `prefers-reduced-motion: reduce` 下关闭弹跳、旋转、粒子与连续循环，将时长压缩到 1ms 或使用无动画结果态。

示例：

```js
const play = (el, keyframes, options) => {
  const old = el.getAnimations?.();
  old?.forEach((animation) => animation.cancel());
  return el.animate(keyframes, { fill: 'both', ...options });
};
play(button, [
  { transform: 'scale(1) rotate(0deg)' },
  { transform: 'scale(.96) rotate(-.8deg)' },
  { transform: 'scale(1.04) rotate(.5deg)' },
  { transform: 'scale(1) rotate(0deg)' }
], { duration: 360, easing: 'cubic-bezier(.22,1.25,.36,1)' });
```

## Godot 适配提示

使用 `Tween.set_trans(Tween.TRANS_BACK)` 或 `TRANS_SPRING`（按 Godot 版本支持情况验证），明确 `set_ease`、时长和可取消句柄；材质响应可通过 `modulate.a`, shader uniform 或 `TextureRect` 的轻微 `scale`/`rotation` 实现。不要把文字烘焙到纹理；`Control` 仍负责语义、焦点与输入。

## 研究依据

- MDN `<easing-function>`：linear、`linear()`、`cubic-bezier()`、`steps()` 语法与约束：https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function
- MDN cubic-bezier：控制点、y 越界的回弹效果：https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/cubic-bezier
- MDN Web Animations API：keyframes、显式 easing 与 fill：https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
- Material Design Motion：duration/easing 基线：https://m1.material.io/motion/duration-easing.html
- MDN transform 与性能：优先 transform/opacity、避免布局动画：https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Fundamentals
- MDN reduced motion：用 `prefers-reduced-motion` 提供无障碍降级：https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility

## 交付与验收

交付目录应至少含：`SKILL.md`、`README.md`、`references/`、`demo/index.html`、`demo/styles.css`、`demo/main.js`、`demo/motion-manifest.json`、`evals/scenarios.md`。H5 Demo 必须在桌面和窄屏可用，能手动触发所有状态、切换 easing、重播 clicked/success、开启 reduced motion，并可在无网络环境运行。

通过条件：

- P0 状态矩阵 10/10 可触发，状态文案和材质均可见；
- hover 不变成纯色块，pressed/clicked 在触控设备有等价反馈；
- 连续点击、快速移入移出、键盘 Tab/Enter、disabled、loading 中断均无卡死；
- reduced motion 自动检测和手动开关均有效；
- 窄屏无横向滚动，按钮触控区 ≥44px；
- `node --check`、JSON 解析和本地 HTTP 200 自检通过。
