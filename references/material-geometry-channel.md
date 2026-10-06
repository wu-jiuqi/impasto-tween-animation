# 材质层 / 几何层双通道

## 分层

- **几何层**：按钮形状、位移、旋转、缩放、磁性跟随。推荐 DOM 节点 `.button-geometry` 或 Godot `Control` 子节点。
- **材质层**：厚涂纹理、刀痕、局部高光、伪元素擦拭。使用透明伪元素、纹理偏移或 shader uniform。
- **语义层**：文字、图标、焦点环、aria 状态。使用独立 `.button-copy`，不随几何层 `scaleX/scaleY` 拉伸。

## 属性白名单

| 通道 | 允许 | 禁止 |
| --- | --- | --- |
| 几何 | `transform`, `transform-origin`, `opacity` | `top/left`, `width/height`, 大范围 `box-shadow` |
| 材质 | `opacity`, `filter`（低幅度）, `background-position`, `clip-path`（装饰层） | opaque 背景替换、整块纯色遮盖、改变图片本体 |
| 语义 | `outline`, `color` 对比度、图标 `transform` ≤8px | 文字 `scaleX/scaleY`、布局抖动 |

每个 WAAPI 调用必须声明白名单；不要使用 `transition: all`。材质层的 opacity 通常 ≤0.35，filter 亮度/饱和度变化 ≤12%。组件在 hover/pressed/disabled 时都应保留 `paintTexture`、`knifeEdge`、`textSafeZone`。

## Godot 对应

几何层使用 `Control.position/rotation/scale` 或 `Node2D` transform；材质层使用 `CanvasItem.modulate.a`、`ShaderMaterial` uniform；文字用独立 `Label`/`Button`，不要烘焙进纹理。
