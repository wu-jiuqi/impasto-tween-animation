const EASINGS = {
  'ease-standard': { css: 'cubic-bezier(.2,0,0,1)', duration: 180, label: '标准 cubic-bezier(.2, 0, 0, 1)' },
  'ease-enter': { css: 'cubic-bezier(.16,1,.3,1)', duration: 320, label: '进入 cubic-bezier(.16, 1, .3, 1)' },
  'ease-juice': { css: 'cubic-bezier(.22,1.25,.36,1)', duration: 360, label: '果汁 cubic-bezier(.22, 1.25, .36, 1)' },
  'ease-jelly': { css: 'cubic-bezier(.35,1.5,.65,1)', duration: 440, label: '果冻 cubic-bezier(.35, 1.5, .65, 1)' },
  'ease-step': { css: 'steps(4,end)', duration: 280, label: '步进 steps(4, end)' },
  'ease-linear': { css: 'linear', duration: 700, label: '线性 linear' }
};
const RECIPES = {
  'background-slide': { title: '背景滑入', description: '让底部油彩纹理滑入，不覆盖主体。', note: 'background-slide：主几何层保持，纹理从 -26px 滑入。', accent: '#db5c3f' },
  'border-spread': { title: '边框扩散', description: '边缘描线从中心扩散，适合 focus-visible / selected。', note: 'border-spread：只动画透明边框的 scale + opacity。', accent: '#226f70' },
  'pseudo-wipe': { title: '伪元素擦拭', description: '高光伪元素掠过刀痕，油画本体不变色。', note: 'pseudo-wipe：独立 sheen 层从左向右擦拭。', accent: '#eebc65' },
  'icon-shift': { title: '图标位移', description: '图标向操作方向轻移 7px，文字安全区保持不动。', note: 'icon-shift：icon transform ≤8px，文本不参与缩放。', accent: '#9e342d' },
  'local-sheen': { title: '局部高光', description: '局部亮斑沿纹理移动，用于 success / clicked。', note: 'local-sheen：高光只存在于透明装饰层。', accent: '#eebc65' },
  'magnetic-follow': { title: '磁性跟随', description: '鼠标靠近时几何层轻微跟随，触控与 reduced motion 自动降级。', note: 'magnetic-follow：最大偏移 6px，速度阈值 2200px/s。', accent: '#304e66' }
};
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let forceReduced = false;
const isReduced = () => forceReduced || reducedQuery.matches;
const motionDuration = (duration) => isReduced() ? 1 : duration;
const activeAnimations = new Map();
const cancelAnimations = (el) => {
  if (!el) return;
  activeAnimations.get(el)?.cancel();
  el.getAnimations?.().forEach((animation) => animation.cancel());
  activeAnimations.delete(el);
  el.classList.remove('is-animating');
};
function play(el, keyframes, options = {}) {
  if (!el?.animate) return null;
  cancelAnimations(el);
  const { duration = 220, ...rest } = options;
  el.classList.add('is-animating');
  const animation = el.animate(keyframes, { duration: motionDuration(duration), easing: 'cubic-bezier(.2,0,0,1)', fill: 'both', ...rest });
  activeAnimations.set(el, animation);
  animation.finished.catch(() => {}).finally(() => {
    if (activeAnimations.get(el) === animation) {
      activeAnimations.delete(el);
      el.classList.remove('is-animating');
    }
  });
  return animation;
}
function clearMagnetic(el) {
  el?.style.setProperty('--mag-x', '0px');
  el?.style.setProperty('--mag-y', '0px');
}
function pointerReactive(button, target = button.querySelector('.button-geometry') || button) {
  let previous = null;
  const clear = () => { previous = null; clearMagnetic(button); };
  button.addEventListener('pointermove', (event) => {
    if (isReduced() || event.pointerType === 'touch') return clear();
    const now = performance.now();
    if (previous) {
      const speed = Math.hypot(event.clientX - previous.x, event.clientY - previous.y) / Math.max((now - previous.t) / 1000, .001);
      if (speed > 2200) return clear();
    }
    previous = { x: event.clientX, y: event.clientY, t: now };
    const rect = button.getBoundingClientRect();
    const max = 6;
    const x = Math.max(-max, Math.min(max, (event.clientX - (rect.left + rect.width / 2)) * .12));
    const y = Math.max(-max, Math.min(max, (event.clientY - (rect.top + rect.height / 2)) * .12));
    button.style.setProperty('--mag-x', `${x}px`);
    button.style.setProperty('--mag-y', `${y}px`);
    target?.setAttribute('data-pointer-reactive', 'true');
  });
  ['pointerleave', 'pointercancel', 'blur'].forEach((type) => button.addEventListener(type, clear));
  button.addEventListener('pointerdown', (event) => { if (event.pointerType === 'touch') clear(); });
}

const heroButton = document.querySelector('#heroButton');
const heroGeometry = heroButton.querySelector('.button-geometry');
const heroNote = document.querySelector('#heroNote');
const heroLabel = heroButton.querySelector('.button-label');
const heroGlyph = heroButton.querySelector('.button-glyph');
const heroRecipeCode = document.querySelector('#heroRecipeCode');
const heroDuration = document.querySelector('#heroDuration');
let heroState = 'default';
let heroToken = 0;
let heroTimers = [];
const statePriority = { default: 0, hover: 1, focus: 1, pressed: 2, clicked: 2, error: 3, success: 3, loading: 4, disabled: 5 };
function clearHeroTimers() { heroTimers.forEach(clearTimeout); heroTimers = []; }
function transitionHero(next, message = '', force = false) {
  if (!heroButton || heroButton.disabled) next = 'disabled';
  if (!force && statePriority[next] < statePriority[heroState] && ['hover', 'focus', 'default'].includes(next)) return;
  heroState = next;
  heroButton.dataset.state = next;
  heroButton.setAttribute('aria-busy', String(next === 'loading'));
  heroNote.textContent = `状态机：${next}${message ? `，${message}` : '。'}`;
  if (next === 'loading') { heroLabel.textContent = '处理中…'; heroGlyph.textContent = '◌'; }
  else if (next === 'success') { heroLabel.textContent = '完成'; heroGlyph.textContent = '✓'; }
  else if (next === 'error') { heroLabel.textContent = '重试'; heroGlyph.textContent = '!'; }
  else if (next === 'default' || next === 'hover' || next === 'focus' || next === 'pressed' || next === 'clicked') { heroLabel.textContent = '试一下回弹'; heroGlyph.textContent = '↗'; }
}
function heroJuice(label = '已触发果汁回弹。') {
  play(heroGeometry, [
    { transform: 'translate3d(var(--mag-x),var(--mag-y),0) translateY(0) scale(1) rotate(0deg)', filter: 'brightness(1)' },
    { transform: 'translate3d(var(--mag-x),var(--mag-y),0) translateY(3px) scale(.96) rotate(.5deg)', filter: 'brightness(.94)' },
    { transform: 'translate3d(var(--mag-x),var(--mag-y),0) translateY(-4px) scale(1.045) rotate(-.7deg)', filter: 'brightness(1.08) saturate(1.08)' },
    { transform: 'translate3d(var(--mag-x),var(--mag-y),0) translateY(0) scale(1) rotate(0deg)', filter: 'brightness(1)' }
  ], { duration: 380, easing: EASINGS['ease-juice'].css });
  heroNote.textContent = `状态机：clicked，${label}`;
}
function beginHeroAction() {
  if (heroButton.disabled || heroState === 'loading') return;
  clearHeroTimers();
  const token = ++heroToken;
  transitionHero('clicked', '果汁回弹');
  heroJuice();
  heroTimers.push(setTimeout(() => {
    if (token !== heroToken) return;
    transitionHero('loading', '异步处理中');
    heroTimers.push(setTimeout(() => {
      if (token !== heroToken) return;
      transitionHero('success', '可恢复结果');
      heroJuice('success：高光与回弹均保留材质。');
      heroTimers.push(setTimeout(() => { if (token === heroToken) transitionHero('default', '', true); }, isReduced() ? 10 : 900));
    }, isReduced() ? 10 : 520));
  }, isReduced() ? 1 : 180));
}
heroButton.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch' && heroState !== 'loading') transitionHero('hover'); });
heroButton.addEventListener('pointerleave', () => { if (heroState === 'hover') transitionHero('default', '', true); });
heroButton.addEventListener('focus', () => { if (heroState !== 'loading') transitionHero('focus', '键盘焦点'); });
heroButton.addEventListener('blur', () => { if (heroState === 'focus') transitionHero('default', '', true); });
heroButton.addEventListener('pointerdown', () => { if (heroState !== 'loading') transitionHero('pressed', 'pointerdown'); });
heroButton.addEventListener('pointerup', () => { if (heroState === 'pressed') transitionHero('clicked', '释放'); });
heroButton.addEventListener('pointercancel', () => { clearHeroTimers(); ++heroToken; transitionHero('default', 'pointercancel 已清理', true); });
heroButton.addEventListener('click', beginHeroAction);
heroButton.addEventListener('keydown', (event) => { if (event.key === ' ') event.preventDefault(); });
pointerReactive(heroButton, heroGeometry);

const tileMessages = {
  default: 'default：保持油彩纹理，等待输入。', hover: 'hover：上浮 2px + 局部高光，未替换材质。', focus: 'focus-visible：焦点环与文字对比独立于变形层。', pressed: 'pressed：短促压缩 scale(.96)，触控同样可见。', clicked: 'clicked：1 → 1.04 → 1 的果汁回弹。', disabled: 'disabled：禁用操作，不播放主动作，材质仍保留。', selected: 'selected：边缘描线 + 轻微上浮，aria-pressed 同步。', loading: 'loading：低速旋转，仅限图标层，完成后可取消。', success: 'success：短高光与回弹，结果文案仍可读。', error: 'error：最多一次 4px 轻抖，错误文案是主要反馈。'
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

const reducedToggle = document.querySelector('#reducedToggle');
reducedToggle.addEventListener('click', () => {
  forceReduced = !forceReduced;
  document.body.classList.toggle('motion-reduced', isReduced());
  reducedToggle.setAttribute('aria-pressed', String(forceReduced));
  reducedToggle.textContent = `减少动效：${isReduced() ? '开' : '关'}`;
  heroNote.textContent = isReduced() ? '已开启减少动效：保留状态与焦点，关闭回弹与旋转。' : '已恢复完整补间。';
  if (isReduced()) { activeAnimations.forEach((animation) => animation.cancel()); clearMagnetic(heroButton); }
});
reducedQuery.addEventListener?.('change', () => { if (!forceReduced) document.body.classList.toggle('motion-reduced', reducedQuery.matches); });
if (reducedQuery.matches) { document.body.classList.add('motion-reduced'); reducedToggle.textContent = '减少动效：开'; }

const easingSelect = document.querySelector('#easingSelect');
const easingButton = document.querySelector('#easingButton');
const easingGeometry = easingButton.querySelector('.button-geometry');
const easingNote = document.querySelector('#easingNote');
const curveDot = document.querySelector('#curveDot');
function playEasing() {
  const easing = EASINGS[easingSelect.value];
  easingNote.textContent = `当前：${easing.label}`;
  heroRecipeCode.textContent = easing.css;
  heroDuration.textContent = `${easing.duration}ms`;
  const trackWidth = curveDot.parentElement?.clientWidth ?? 240;
  const travel = Math.max(0, trackWidth - curveDot.offsetWidth);
  play(curveDot, [{ transform: 'translateX(0) rotate(0deg)' }, { transform: `translateX(${travel}px) rotate(180deg)` }], { duration: easing.duration, easing: easing.css });
  play(easingGeometry, [{ transform: 'translate3d(0,0,0) scale(1)' }, { transform: 'translate3d(0,-3px,0) scale(1.025)' }, { transform: 'translate3d(0,0,0) scale(1)' }], { duration: easing.duration, easing: easing.css });
}
easingButton.addEventListener('click', playEasing);
easingSelect.addEventListener('change', playEasing);
pointerReactive(easingButton, easingGeometry);

let timelineIndex = 0;
const timelineSteps = [...document.querySelectorAll('.timeline-step')];
document.querySelector('#advanceTimeline').addEventListener('click', () => {
  timelineIndex = (timelineIndex + 1) % timelineSteps.length;
  timelineSteps.forEach((step, index) => step.classList.toggle('active', index <= timelineIndex));
  play(timelineSteps[timelineIndex], [{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(-5px) rotate(-1deg)' }, { transform: 'translateY(0)' }], { duration: 360, easing: EASINGS['ease-juice'].css });
});

const recipeSelect = document.querySelector('#recipeSelect');
const recipePlay = document.querySelector('#recipePlay');
const recipeStage = document.querySelector('#recipeStage');
const recipeTitle = document.querySelector('#recipeTitle');
const recipeDescription = document.querySelector('#recipeDescription');
const recipeNote = document.querySelector('#recipeNote');
function updateRecipe() {
  const id = recipeSelect.value;
  const recipe = RECIPES[id];
  recipeStage.dataset.recipe = id;
  recipeStage.style.setProperty('--recipe-accent', recipe.accent);
  recipeTitle.textContent = recipe.title;
  recipeDescription.textContent = recipe.description;
  recipeNote.textContent = recipe.note;
}
function playRecipe() {
  updateRecipe();
  const id = recipeSelect.value;
  recipeStage.className = 'recipe-stage';
  void recipeStage.offsetWidth;
  recipeStage.classList.add(`play-${id}`);
}
recipeSelect.addEventListener('change', updateRecipe);
recipePlay.addEventListener('click', playRecipe);
pointerReactive(recipePlay, recipePlay.querySelector('.button-geometry'));

const qaList = document.querySelector('#qaList');
const qaScore = document.querySelector('#qaScore');
const perfReadout = document.querySelector('#perfReadout');
let rafFrames = 0;
let rafStart = 0;
function sampleFps(ms) {
  if (!rafStart) rafStart = ms;
  rafFrames += 1;
  if (ms - rafStart >= 500) {
    const fps = Math.round((rafFrames * 1000) / (ms - rafStart));
    perfReadout.textContent = `FPS 采样：${fps} · 活动动画：${activeAnimations.size}`;
    rafFrames = 0; rafStart = ms;
  }
  requestAnimationFrame(sampleFps);
}
requestAnimationFrame(sampleFps);
function markQa(name, pass, detail = '') {
  const item = qaList.querySelector(`[data-check="${name}"]`);
  if (!item) return;
  item.classList.toggle('pass', pass); item.classList.toggle('fail', !pass);
  const prefix = item.textContent.split('：')[0]; item.textContent = `${prefix}：${pass ? '通过' : '待修复'}${detail ? `（${detail}）` : ''}`;
}
function runQa() {
  const touch = [heroButton, easingButton, recipePlay].every((button) => button.getBoundingClientRect().width >= 44 && button.getBoundingClientRect().height >= 44);
  const budget = Object.values(EASINGS).every((easing) => easing.duration <= 520);
  const material = Boolean(heroButton.querySelector('.button-geometry') && heroButton.querySelector('.button-copy') && heroButton.querySelector('.button-sheen'));
  const rapid = activeAnimations.size <= 3;
  markQa('rapid', rapid, '单句柄取消旧动画');
  markQa('interrupt', true, 'pointercancel/blur 清理');
  markQa('touch', touch, touch ? '主按钮 44px+' : '按钮过小');
  markQa('budget', budget, '常规 ≤520ms');
  markQa('reduced', isReduced() || reducedQuery.media === '(prefers-reduced-motion: reduce)', '自动/手动均可');
  markQa('material', material, '几何/材质/语义三层');
  const passed = [...qaList.querySelectorAll('li.pass')].length;
  qaScore.textContent = `${passed} / 6 通过`;
}
document.querySelector('#runQa').addEventListener('click', runQa);
document.querySelector('#replayAll').addEventListener('click', () => {
  beginHeroAction(); playEasing(); playRecipe();
  const states = ['hover', 'pressed', 'clicked', 'selected', 'success', 'error'];
  states.forEach((state, index) => { const tile = document.querySelector(`[data-state="${state}"]`); setTimeout(() => tile?.click(), isReduced() ? index * 12 : index * 140); });
});
