# 组件级补间契约

每个组件在 `motion-manifest.json` 中登记：

```json
{
  "id": "cta-primary",
  "sourceComponent": "button",
  "materialInvariant": ["paintTexture", "knifeEdge", "textSafeZone"],
  "states": {
    "hover": {
      "trigger": "pointerenter",
      "keyframes": [
        {"transform": "translateY(0) rotate(0deg) scale(1)"},
        {"transform": "translateY(-2px) rotate(-0.6deg) scale(1.02)"}
      ],
      "durationMs": 180,
      "easing": "ease-standard",
      "cancelOn": ["pointerleave", "disabled"],
      "reducedMotion": "instant-focus-and-contrast"
    }
  }
}
```

约束：

- `materialInvariant` 是不可被动画覆盖的视觉层；主本体不能变成单色背景。
- 任何状态必须定义 trigger、keyframes、duration、easing、取消条件与 reduced-motion 降级。
- 文字容器可与材质本体分层，避免 scale/rotate 造成阅读抖动。
- 不允许用 `transition: all`；属性白名单按平台记录。
- 同一组件只保留一个当前交互动画；新事件先取消旧动画，再从当前视觉状态重播。
