# H5 适配器

- 使用 DOM 语义控件（button、input、dialog），动态文字放在材质层之上。
- 用 pointerenter/leave/down/up/cancel 统一鼠标与触控；移动端不依赖 hover。
- WAAPI：`el.animate(keyframes, {duration, easing, fill:'both'})`；调用前取消旧 `getAnimations()`，避免快速交互叠加。
- CSS 仅动画 `transform、opacity、filter、background-position、border-color` 等显式属性。
- `@media (hover: none)` 将 hover 反馈改为 pressed/selected；触控区至少 44×44px。
- `@media (prefers-reduced-motion: reduce)` 关闭回弹、旋转、粒子和连续循环；保留焦点环、文案、图标或对比度变化。
- 使用 `aria-pressed`、`aria-busy`、`aria-disabled`，状态变化同步到可读文本。
- 检查窄屏 safe-area、dvh/svh 和横向溢出；避免在动画中修改布局属性。
