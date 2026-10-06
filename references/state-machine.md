# 按钮状态机与中断策略

## 状态图

`default → hover/focus-visible → pressed → clicked → loading → success/error → default`

`任何状态 → disabled`；`disabled → default` 需要组件重新启用后由输入事件触发。触控设备没有 hover 时，`pressed` 直接承担临时反馈，`selected` 保留结果。

## 优先级

从高到低：`disabled (5) > loading (4) > success/error (3) > pressed (2) > clicked (2) > hover/focus (1) > default (0)`。高优先级进入时取消低优先级动画；`pointercancel`、`blur`、`visibilitychange` 会清理 pressed/磁性偏移，但不会误触发 clicked。

## 进入、退出、中断、恢复

| 状态 | 进入 | 退出 | 可中断 | 恢复策略 |
| --- | --- | --- | --- | --- |
| default | 初始化/结果结束 | pointerenter、focus、按下 | 无 | 直接进入输入态 |
| hover | pointerenter | pointerleave、按下、disabled | 是 | 从当前视觉值回到 default，或进入 pressed |
| focus-visible | 键盘 focus | blur、disabled | 是 | 保留焦点环，几何层回到最近状态 |
| pressed | pointerdown/keydown | pointerup/cancel/blur | 是 | pointerup 触发 clicked；cancel 回到 hover/default |
| clicked | click | 进入 loading 或结果态 | 是 | 取消旧 WAAPI，从当前进度重播，不叠加幽灵动画 |
| loading | 异步开始 | success/error/cancel/disabled | 是 | 只清理图标循环；恢复结果文案 |
| success/error | 请求结果 | 计时结束、下一次操作 | 是 | 回到 default；错误保留可读文案 |
| disabled | disabled/aria-disabled | 重新启用 | 否 | 清除指针/焦点动画，恢复 default |

实现要求：每个组件持有一个 `activeAnimation` 句柄；新状态先 `cancel()`，再根据当前 computed style 进入下一段；所有 timer 必须可清理。
