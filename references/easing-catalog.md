# Easing 与动势目录

| token | CSS | 语义 | 建议场景 |
| --- | --- | --- | --- |
| ease-standard | cubic-bezier(.2,0,0,1) | 先快后稳 | hover、focus |
| ease-enter | cubic-bezier(.16,1,.3,1) | 快速进入、带重量 | dialog、toast、card |
| ease-exit | cubic-bezier(.7,0,.84,0) | 快速离开 | popover、tooltip |
| ease-juice | cubic-bezier(.22,1.25,.36,1) | 小超调回弹 | clicked、success |
| ease-jelly | cubic-bezier(.35,1.5,.65,1) | 长宽交替的果冻 | pressed、badge |
| ease-step | steps(4,end) | 机械跳格 | pagination、meter |
| ease-linear | linear | 恒速 | progress、spinner |

参数边界：

- x 控制点 ∈ [0,1]；y 可小范围越界表达回弹。
- scale 超调一般 ≤8%，旋转一般 ≤12°，横向抖动 ≤4px。
- 反馈 120–220ms，进入 220–420ms，退出 140–240ms，连续循环必须有停止条件。
- 颜色、filter、纹理位移只做辅助，不覆盖油彩纹理。

## 动势配方

1. 果汁按钮：pressed `scale(.96)` + `rotate(-.8deg)`，clicked `1 → 1.04 → 1` + 高光 opacity。
2. 果冻徽章：`scaleX(1.06) scaleY(.94) → scaleX(.97) scaleY(1.03) → 1`，持续 360ms。
3. 手绘 hover：`translateY(-2px) rotate(-.6deg)`，`filter: brightness(1.08) saturate(1.06)`，180ms。
4. 错误回应：`translateX(0,-3,3,-2,2,0)`，总时长 280ms，最多播放一次。
5. loading：图标 360° 线性旋转；reduced-motion 下静态图标 + “加载中”文案。
