const EASINGS = {
  'ease-standard': { css: 'cubic-bezier(.2,0,0,1)', duration: 180, label: '标准 cubic-bezier(.2, 0, 0, 1)' },
  'ease-enter': { css: 'cubic-bezier(.16,1,.3,1)', duration: 320, label: '进入 cubic-bezier(.16, 1, .3, 1)' },
  'ease-juice': { css: 'cubic-bezier(.22,1.25,.36,1)', duration: 360, label: '果汁 cubic-bezier(.22, 1.25, .36, 1)' },
  'ease-jelly': { css: 'cubic-bezier(.35,1.5,.65,1)', duration: 440, label: '果冻 cubic-bezier(.35, 1.5, .65, 1)' },
  'ease-step': { css: 'steps(4,end)', duration: 280, label: '步进 steps(4, end)' }
};
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let forceReduced = false;
const isReduced = () => forceReduced || reducedQuery.matches;
const motionDuration = (duration) => isReduced() ? 1 : duration;

function cancelAnimations(el) {
  el?.getAnimations?.().forEach((animation) => animation.cancel());
}
function play(el, keyframes, options = {}) {
  if (!el?.animate) return null;
  cancelAnimations(el);
  el.classList.add('is-animating');
  const animation = el.animate(keyframes, {
    duration: motionDuration(options.duration ?? 220),
    easing: options.easing ?? 'cubic-bezier(.2,0,0,1)',
    fill: 'both',
    ...options
  });
  animation.finished.catch(() => {}).finally(() => el.classList.remove('is-animating'));
  return animation;
}

const heroButton = document.querySelector('#heroButton');
const heroNote = document.querySelector('#heroNote');
function juice(el, label = '已触发果汁回弹。') {
  play(el, [
    { transform: 'translateY(0) scale(1) rotate(0deg)', filter: 'brightness(1)' },
    { transform: 'translateY(3px) scale(.96) rotate(.5deg)', filter: 'brightness(.94)' },
    { transform: 'translateY(-4px) scale(1.045) rotate(-.7deg)', filter: 'brightness(1.08) saturate(1.08)' },
    { transform: 'translateY(0) scale(1) rotate(0deg)', filter: 'brightness(1)' }
  ], { duration: 380, easing: EASINGS['ease-juice'].css });
  heroNote.textContent = label;
}
heroButton.addEventListener('click', () => juice(heroButton));
heroButton.addEventListener('keydown', (event) => { if (event.key === ' ') event.preventDefault(); });

const tileMessages = {
  default: 'default：保持油彩纹理，等待输入。',
  hover: 'hover：上浮 2px + 局部高光，未替换材质。',
  focus: 'focus-visible：焦点环与文字对比独立于变形层。',
  pressed: 'pressed：短促压缩 scale(.96)，触控同样可见。',
  clicked: 'clicked：1 → 1.04 → 1 的果汁回弹。',
  disabled: 'disabled：禁用操作，不播放主动作，材质仍保留。',
  selected: 'selected：边缘描线 + 轻微上浮，aria-pressed 同步。',
  loading: 'loading：低速旋转，仅限图标层，完成后可取消。',
  success: 'success：短高光与回弹，结果文案仍可读。',
  error: 'error：最多一次 4px 轻抖，错误文案是主要反馈。'
};
const stateLog = document.querySelector('#stateLog');
const tileAnimations = {
  default: [{ transform: 'scale(1)' }, { transform: 'scale(1)' }],
  hover: [{ transform: 'translateY(0) rotate(0deg) scale(1)' }, { transform: 'translateY(-5px) rotate(-1deg) scale(1.03)' }],
  focus: [{ filter: 'brightness(1)' }, { filter: 'brightness(1.18)' }],
  pressed: [{ transform: 'scale(1)' }, { transform: 'scale(.9) rotate(.8deg)' }],
  clicked: [{ transform: 'scale(1)' }, { transform: 'scale(1.1) rotate(-1deg)' }, { transform: 'scale(1)' }],
  selected: [{ transform: 'translateY(0)' }, { transform: 'translateY(-4px) rotate(-.8deg)' }],
  loading: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
  success: [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
  error: [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(0)' }]
};

document.querySelectorAll('.state-tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    const state = tile.dataset.state;
    stateLog.textContent = tileMessages[state];
    const paint = tile.querySelector('.tile-paint');
    if (state === 'disabled') return;
    if (state === 'selected') tile.setAttribute('aria-pressed', tile.getAttribute('aria-pressed') !== 'true');
    if (state === 'loading') {
      play(paint, tileAnimations.loading, { duration: 900, easing: 'linear', iterations: isReduced() ? 1 : 2 });
      return;
    }
    play(paint, tileAnimations[state], { duration: state === 'error' ? 280 : 360, easing: state === 'pressed' ? EASINGS['ease-jelly'].css : EASINGS['ease-juice'].css });
  });
});

document.querySelector('#reducedToggle').addEventListener('click', (event) => {
  forceReduced = !forceReduced;
  document.body.classList.toggle('motion-reduced', isReduced());
  event.currentTarget.setAttribute('aria-pressed', String(forceReduced));
  event.currentTarget.textContent = `减少动效：${isReduced() ? '开' : '关'}`;
  heroNote.textContent = isReduced() ? '已开启减少动效：保留状态与焦点，关闭回弹与旋转。' : '已恢复完整补间。';
});
reducedQuery.addEventListener?.('change', () => {
  if (!forceReduced) document.body.classList.toggle('motion-reduced', reducedQuery.matches);
});

const easingSelect = document.querySelector('#easingSelect');
const easingButton = document.querySelector('#easingButton');
const easingNote = document.querySelector('#easingNote');
const curveDot = document.querySelector('#curveDot');
function playEasing() {
  const easing = EASINGS[easingSelect.value];
  easingNote.textContent = `当前：${easing.label}`;
  const trackWidth = curveDot.parentElement?.clientWidth ?? 240;
  const travel = Math.max(0, trackWidth - curveDot.offsetWidth);
  play(curveDot, [{ transform: 'translateX(0) rotate(0deg)' }, { transform: `translateX(${travel}px) rotate(180deg)` }], { duration: easing.duration, easing: easing.css });
}
easingButton.addEventListener('click', playEasing);
easingSelect.addEventListener('change', playEasing);

let timelineIndex = 0;
const timelineSteps = [...document.querySelectorAll('.timeline-step')];
document.querySelector('#advanceTimeline').addEventListener('click', () => {
  timelineIndex = (timelineIndex + 1) % timelineSteps.length;
  timelineSteps.forEach((step, index) => step.classList.toggle('active', index <= timelineIndex));
  play(timelineSteps[timelineIndex], [{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(-5px) rotate(-1deg)' }, { transform: 'translateY(0)' }], { duration: 360, easing: EASINGS['ease-juice'].css });
});

document.querySelector('#replayAll').addEventListener('click', () => {
  juice(heroButton, '全场重播：主按钮已回弹。');
  playEasing();
  const states = ['hover', 'pressed', 'clicked', 'selected', 'success', 'error'];
  states.forEach((state, index) => {
    const tile = document.querySelector(`[data-state="${state}"]`);
    setTimeout(() => tile?.click(), isReduced() ? index * 12 : index * 140);
  });
});

if (reducedQuery.matches) {
  document.body.classList.add('motion-reduced');
  const toggle = document.querySelector('#reducedToggle');
  toggle.textContent = '减少动效：开';
}
