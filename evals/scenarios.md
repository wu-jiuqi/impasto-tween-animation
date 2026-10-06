# 验收场景

| 编号 | 操作 | 预期 |
| --- | --- | --- |
| M01 | 鼠标移入主按钮 | 保留油彩材质，轻微上浮/局部高光，不出现纯色块 |
| M02 | 鼠标移出后再次移入 | 动画可逆，不卡在 hover；磁性偏移回到 0 |
| M03 | 鼠标按下/松开 | pressed 压缩，clicked 果汁回弹，状态文案更新 |
| M04 | 快速连续点击 5 次 | 只有一个 active animation；loading 期间不叠加请求或幽灵动画 |
| M05 | Tab/Shift+Tab | focus-visible 焦点环清晰，文字不抖动、不被缩放 |
| M06 | 点击 disabled | 不触发主动作，不播放操作回弹，材质仍可见 |
| M07 | clicked 进入 loading | loading 图标层可取消；success/error 能恢复到 default |
| M08 | pointercancel / blur | pressed、hover、磁性变量清理，不误触发 clicked |
| M09 | 触控窄屏 | 无横向滚动，pressed/selected 反馈可见，主按钮和 recipe 按钮触控区 ≥44px |
| M10 | 切换 reduced motion | 自动媒体查询和手动开关都能立即关闭回弹、旋转、磁性跟随与循环 |
| M11 | 配方实验台六选一 | background-slide、border-spread、pseudo-wipe、icon-shift、local-sheen、magnetic-follow 均可播放 |
| M12 | 选择 easing 并重播 | 曲线轨迹和按钮动效使用同一 token，时长显示正确 |
| M13 | 动画预算 | 常规反馈 120–220ms、进入 220–420ms、配方 ≤520ms；超出需在 manifest 说明 |
| M14 | QA Gate 自检 | 6 项检查可见，FPS 采样与活动动画数更新，材质/语义分层检查通过 |
| M15 | Godot 对照 | 按 `references/godot-mapping.md` 映射 Tween；不支持的 transition 回退 cubic |
