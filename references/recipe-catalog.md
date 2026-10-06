# 按钮动效配方库

这些配方来自可复用的 Web 按钮实现模式（背景滑入、边框扩散、伪元素擦拭、图标位移、局部高光、磁性跟随），在厚涂 UI 中只作用于材质/装饰层，不替换油画本体。每个配方都能在 H5 Demo 的「配方实验台」切换并重播。

## 配方总表

| id | 视觉动作 | 允许属性 | 建议时长 | 使用状态 | 材质约束 |
| --- | --- | --- | --- | --- | --- |
| `background-slide` | 底部或侧面油彩纹理滑入 | `transform`, `opacity`, `background-position` | 220ms | hover / selected | 纹理层透明度 ≤ 0.32 |
| `border-spread` | 手绘边缘描线从中心扩散 | `transform: scale`, `opacity`, `border-color` | 180ms | focus-visible / selected | 不使用 opaque 遮罩 |
| `pseudo-wipe` | 伪元素高光擦过按钮 | `transform`, `opacity` | 420ms | hover / clicked | 高光只在 `::after` / `.button-sheen` |
| `icon-shift` | 图标轻微位移并回到安全区 | `transform` | 180–260ms | hover / clicked | 文本容器不跟随缩放 |
| `local-sheen` | 局部亮斑从刀痕上掠过 | `transform`, `filter`, `opacity` | 260ms | success / clicked | 不改变主背景色 |
| `magnetic-follow` | 指针靠近时几何层跟随 | `transform`（≤6px） | 120ms | hover / pointermove | touch 自动关闭；需速度阈值 |

## 组合规则

1. 一个时刻只允许一个主几何动作，装饰动作可延迟 20–60ms。
2. `magnetic-follow` 只写入 `--mag-x/--mag-y`，不与状态动画共用布局属性；状态动画取消时必须清除偏移。
3. `pseudo-wipe` 和 `local-sheen` 只能操作透明伪元素或独立 DOM 层，禁止设置整块纯色背景。
4. `icon-shift` 的位移上限 8px；文字区域始终独立，不能被 `scaleX/scaleY` 拉伸。
5. `prefers-reduced-motion` 或手动开关开启时，所有配方跳到终态；保留边框、文案、图标或对比度反馈。

## 参考实现片段

```css
.button-geometry { transform: translate3d(var(--mag-x, 0px), var(--mag-y, 0px), 0); }
.button-sheen { transform: translateX(-140%) rotate(14deg); }
.button:hover .button-sheen { transform: translateX(360%) rotate(14deg); }
.button:hover .button-glyph { transform: translateX(4px) rotate(6deg); }
```

```js
const max = 6;
const x = Math.max(-max, Math.min(max, (event.clientX - centerX) * 0.12));
button.style.setProperty('--mag-x', `${x}px`);
```

参考：Codrops 的 hover micro-interactions、Material Motion duration/easing、MDN Web Animations API。具体链接与平台限制见 `SKILL.md`。
