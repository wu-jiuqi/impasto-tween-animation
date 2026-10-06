# H5 token → Godot Tween 映射

| H5 token | CSS | Godot `Tween` | 备注 |
| --- | --- | --- | --- |
| `ease-standard` | `cubic-bezier(.2,0,0,1)` | `set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)` | 默认 hover/focus |
| `ease-enter` | `cubic-bezier(.16,1,.3,1)` | `TRANS_QUART`, `EASE_OUT` | 进入/弹出 |
| `ease-exit` | `cubic-bezier(.7,0,.84,0)` | `TRANS_QUAD`, `EASE_IN` | 离开 |
| `ease-juice` | `cubic-bezier(.22,1.25,.36,1)` | `TRANS_BACK`, `EASE_OUT` | clicked/success，小超调 |
| `ease-jelly` | `cubic-bezier(.35,1.5,.65,1)` | `TRANS_ELASTIC`, `EASE_OUT` | 低幅度，避免文字缩放 |
| `ease-step` | `steps(4,end)` | `TRANS_STEP` | 分段/机械 |
| `ease-linear` | `linear` | `TRANS_LINEAR` | spinner/progress |

```gdscript
var tween := create_tween()
tween.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
tween.tween_property($ButtonGeometry, "scale", Vector2(1.04, 1.04), 0.36)
```

manifest 至少包含 `godot.property`, `godot.transition`, `godot.ease`, `godot.durationSec`, `godot.reducedMotion`. Godot 版本不支持某个 transition 时，回退到 `TRANS_CUBIC`，不要回退到瞬移，除非 reduced motion 开启。
