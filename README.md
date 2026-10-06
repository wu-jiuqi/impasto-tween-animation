# impasto-tween-animation

`impasto-tween-animation` 是 `palette-knife-impasto-ui` 的下游 Skill。上游先完成油画 UI 组件与材质状态，本 Skill 再为组件提供可重复、可中断、可降级的补间动画。

## 使用顺序

`palette-knife-impasto-ui → 组件 manifest/静态拼装 → impasto-tween-animation → H5/Godot 运行时验收`

它覆盖 default、hover、focus-visible、pressed、clicked、disabled、selected、loading、success、error，并提供果汁感、果冻感、弹性、旋转、手绘不规则形变和 reduced-motion 方案。

## 本地运行 Demo

```bash
cd impasto-tween-animation/demo
python -m http.server 8788
# 浏览器打开 http://localhost:8788/
```

Demo 提供：状态卡、可点击油画按钮、hover/focus/pressed、成功回弹、加载、错误抖动、disabled、easing 选择、动画重播和 reduced-motion 手动开关；桌面与移动端均支持。

## 目录

- `SKILL.md`：触发条件、上下游契约、状态矩阵、实现规范与验收标准
- `references/transition-contract.md`：组件级动效字段契约
- `references/easing-catalog.md`：easing、时长、运动语义和果汁/果冻参数
- `references/h5-adapter.md`：H5 事件、WAAPI、移动端与无障碍实现
- `demo/`：可运行验收页与 `motion-manifest.json`
- `evals/scenarios.md`：重复触发、键盘、触控、降级等验收场景

## 研究来源

实现建议依据 MDN CSS Easing Functions、Web Animations API、CSS transform/性能/reduced-motion 文档以及 Material Design Motion duration/easing 指南，完整链接见 `SKILL.md`。
