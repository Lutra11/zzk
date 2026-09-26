<template>
  <div class="app">
    <header class="course-header">
      <div class="course-meta">《哲学与文化》<span></span>第六课 第一框</div>
      <h1>价值与价值观</h1>
      <div class="progress" aria-live="polite">{{ progressText }}</div>
    </header>

    <main class="stage" :data-mode="stageMode">
      <div class="landscape" aria-hidden="true">
        <div class="sky-glow"></div>
        <div class="sun"></div>
        <div class="horizon"></div>
        <div class="light-ray ray-a"></div>
        <div class="light-ray ray-b"></div>
        <div class="light-ray ray-c"></div>
        <div class="tower"><div class="tower-head"></div><div class="tower-body"></div></div>
        <div class="mirror-field">
          <i
            v-for="mirror in mirrors"
            :key="mirror.id"
            class="mirror"
            :style="mirror.style"
          ></i>
        </div>
        <div class="station-lights"></div>
        <div class="city-silhouette"></div>
      </div>
      <div class="stage-shade"></div>

      <div class="scene-label">{{ sceneLabel }}</div>
      <div v-if="visualNotes" class="visual-notes">{{ visualNotes }}</div>
      <img
        v-if="state.screen === 'role' && currentStory"
        class="character visible"
        :src="currentCharacterImage"
        :alt="`${currentStory.role}${currentStory.name}`"
      >

      <section v-if="state.screen === 'role'" class="story-panel" aria-live="polite">
        <template v-if="roleProgress.phase === 'situation'">
          <div class="eyebrow">第 {{ roleProgress.groupIndex + 1 }} 组 · {{ currentStory.role }}</div>
          <h2>【{{ currentGroup.title }}】</h2>
          <p class="body-copy">{{ currentGroup.situation }}</p>
          <p v-if="roleProgress.groupIndex === 0" class="small-note">角色背景：{{ currentStory.background }}</p>
        </template>

        <template v-else-if="roleProgress.phase === 'choice'">
          <div class="eyebrow">第 {{ roleProgress.groupIndex + 1 }} 组 · 请作出选择</div>
          <h2>【{{ currentGroup.title }}】</h2>
          <div class="choice-list">
            <button
              v-for="(option, index) in currentGroup.options"
              :key="option.text"
              type="button"
              class="choice"
              @click="makeChoice(index)"
            >
              <span class="letter">{{ optionLetter(index) }}</span>
              <span>{{ option.text }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="roleProgress.phase === 'subchoice'">
          <div class="eyebrow">第 {{ roleProgress.groupIndex + 1 }} 组 · 第二级选择</div>
          <h2>【{{ currentGroup.title }}】</h2>
          <p class="body-copy" style="margin-bottom: 1em">你选择了：{{ currentOption.text }}</p>
          <div class="choice-list">
            <button
              v-for="(sub, index) in currentSubOptions"
              :key="sub.text"
              type="button"
              class="choice"
              @click="makeSubChoice(index)"
            >
              <span class="letter">{{ subOptionLetter(index) }}</span>
              <span>{{ sub.text }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="roleProgress.phase === 'result'">
          <div class="eyebrow">第 {{ roleProgress.groupIndex + 1 }} 组 · 选择 {{ optionLetter(roleProgress.optionIndex) }}{{ subOptionLetter(roleProgress.subOptionIndex) }}</div>
          <h2>选择带来的结局</h2>
          <p class="body-copy">{{ currentSubOption.result }}</p>
        </template>

        <template v-else-if="roleProgress.phase === 'question'">
          <div class="eyebrow">课堂追问</div>
          <h2>{{ currentStory.question }}</h2>
          <div class="keyword-row">
            <button
              v-for="(keyword, index) in currentStory.keywords"
              :key="keyword"
              type="button"
              class="keyword"
              :class="{ active: state.selectedKeywords.includes(index), social: keyword === '社会贡献' }"
              @click="toggleKeyword(index)"
            >{{ keyword }}</button>
          </div>
        </template>

        <template v-else-if="roleProgress.phase === 'reveal'">
          <div class="eyebrow">教师揭示 · 知识生成</div>
          <h2>{{ state.role === 'xiao' ? '判断背后的导向' : '怎样衡量人的价值？' }}</h2>
          <p class="body-copy reveal">{{ currentStory.concept }}</p>
          <p v-if="currentStory.note" class="small-note">{{ currentStory.note }}</p>
        </template>
      </section>

      <section v-if="state.screen === 'chooser'" class="wide-panel" aria-live="polite">
        <div class="eyebrow">一项工程 · 两个位置</div>
        <h2>你要先帮助谁作决定？</h2>
        <div class="role-grid">
          <button class="role-card xiao" :class="{ done: state.completed.xiao }" @click="selectRole('xiao')">
            <strong>政府视角：小王</strong>
            <span>三组发展抉择中，如何判断项目价值？{{ state.completed.xiao ? ' · 已体验' : '' }}</span>
          </button>
          <button class="role-card li" :class="{ done: state.completed.li }" @click="selectRole('li')">
            <strong>科研人员视角：李勇</strong>
            <span>三组现实考验中，如何作出人生选择？{{ state.completed.li ? ' · 已体验' : '' }}</span>
          </button>
        </div>
      </section>

      <section v-if="state.screen === 'balance'" class="wide-panel" :class="`balance-phase-${state.balancePhase}`" aria-live="polite">
        <template v-if="state.balancePhase === 0">
          <div class="eyebrow">现实选择的代价与依据</div>
          <h2 class="balance-title">价值天平</h2>
          <div class="balance-grid">
            <div class="balance-side">
              <span v-for="(item, i) in ['眼前利益','个人利益','经济成本','现实压力']" :key="item"
                class="balance-item" :style="{ animationDelay: `${i * 0.12}s` }">{{ item }}</span>
            </div>
            <div class="balance-icon-wrap">
              <img :src="balanceIconUrl" alt="价值天平" class="balance-svg" />
            </div>
            <div class="balance-side right">
              <span v-for="(item, i) in ['长远发展','社会利益','生态价值','社会贡献']" :key="item"
                class="balance-item" :style="{ animationDelay: `${0.48 + i * 0.12}s` }">{{ item }}</span>
            </div>
          </div>
          <p class="body-copy balance-caption">现实选择往往有代价。我们依据什么标准判断和取舍？</p>
          <div class="balance-question-row">
            <button type="button" class="question-link" :class="{ active: state.balanceSeen.xiao }" @click="balanceAsk('xiao')">小王为什么会有不同选择？</button>
            <button type="button" class="question-link" :class="{ active: state.balanceSeen.li }" @click="balanceAsk('li')">李勇为什么会有不同选择？</button>
          </div>
          <Transition name="answer-fade">
            <p v-if="balanceAnswer" class="balance-answer" :key="state.balanceRole">{{ balanceAnswer }}</p>
          </Transition>
        </template>
        <template v-else-if="state.balancePhase === 1">
          <div class="eyebrow">从故事回到共同问题</div>
          <p class="prompt-line">面对同一件事，<br>人们可能作出不同的认识、评价和选择。<br>在这些判断背后，<br>发挥导向作用的正是——</p>
        </template>
        <template v-else>
          <div class="eyebrow">概念生成</div>
          <div class="final-word">价值观</div>
        </template>
      </section>

      <section v-if="state.screen === 'summary'" class="wide-panel" aria-live="polite">
        <div class="eyebrow">回看故事中的动作</div>
        <h2>从选择中认识价值观</h2>
        <div class="flow-grid">
          <div class="flow-col">
            <strong>人物的行动</strong>
            <template v-for="(step, index) in visibleSummarySteps" :key="step">
              <span>{{ step }}</span><b v-if="index < visibleSummarySteps.length - 1">↓</b>
            </template>
          </div>
          <div class="flow-col">
            <strong>价值观的作用</strong>
            <template v-for="(concept, index) in visibleSummaryConcepts" :key="concept">
              <span>{{ concept }}</span><b v-if="index < visibleSummaryConcepts.length - 1">↓</b>
            </template>
          </div>
        </div>
        <div v-if="state.summaryStep >= 4" class="knowledge-list">
          <p>1. 价值观对人们认识和改造世界的活动具有重要导向作用。</p>
          <p>2. 价值观是人生的重要向导。</p>
          <p>3. 人的价值主要在于对社会的贡献。</p>
        </div>
      </section>

      <div v-if="state.screen === 'intro'" class="intro-caption">
        <span class="body-copy">{{ INTRO_CAPTIONS[Math.min(state.introStep, 3)] }}</span>
        <div v-if="state.introStep >= 3"><button type="button" class="action" @click="goChooser">进入故事</button></div>
      </div>
    </main>

    <footer class="control-bar">
      <div class="control-left">
        <button v-if="canGoBack" type="button" class="ghost" @click="goBack">上一步</button>
      </div>
      <div class="control-right">
        <template v-if="state.screen === 'intro'">
          <button v-if="state.introStep < 3" type="button" class="action" @click="introNext">下一步</button>
          <button v-else type="button" class="action" @click="goChooser">进入故事</button>
        </template>
        <template v-else-if="state.screen === 'chooser'">
          <button v-if="state.completed.xiao && state.completed.li" type="button" class="action" @click="goBalance">进入总结</button>
        </template>
        <template v-else-if="state.screen === 'role'">
          <button type="button" class="ghost" @click="restartCurrentRole">重新体验本角色</button>
          <button type="button" class="ghost" @click="goChooser">返回角色</button>
          <button v-if="roleProgress.phase === 'situation'" type="button" class="action" @click="showChoices">进入选择</button>
          <button v-if="roleProgress.phase === 'result'" type="button" class="action" @click="advanceAfterResult">{{ roleProgress.groupIndex < currentStory.groups.length - 1 ? '进入下一组' : '课堂追问' }}</button>
          <button v-if="roleProgress.phase === 'question'" type="button" class="action" @click="revealConcept">揭示知识</button>
          <button v-if="roleProgress.phase === 'reveal'" type="button" class="action" @click="nextAct">{{ state.completed.xiao && state.completed.li ? '进入总结' : '进入下一幕' }}</button>
        </template>
        <template v-else-if="state.screen === 'balance'">
          <button type="button" class="ghost" @click="goChooser">返回角色</button>
          <button v-if="state.balancePhase === 0 && state.balanceSeen.xiao && state.balanceSeen.li" type="button" class="action" @click="balanceNext">下一步</button>
          <button v-else-if="state.balancePhase === 1" type="button" class="action" @click="balanceNext">下一步</button>
          <button v-else-if="state.balancePhase === 2" type="button" class="action" @click="goSummary">进入知识归纳</button>
        </template>
        <template v-else-if="state.screen === 'summary'">
          <button type="button" class="ghost" @click="goChooser">返回角色</button>
          <button v-if="state.summaryStep < 4" type="button" class="action" @click="summaryNext">下一步</button>
          <button v-else type="button" class="action" @click="restart">重新开始</button>
        </template>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { STORIES, INTRO_CAPTIONS, SUMMARY_STEPS, SUMMARY_CONCEPTS } from './story-data.js'
import { createRoleProgress, chooseOption, chooseSubOption, continueAfterResult } from './story-flow.js'
import { resolvePublicAsset } from './public-asset.js'

const state = reactive({
  screen: 'intro',
  introStep: 0,
  role: null,
  completed: { xiao: false, li: false },
  selectedKeywords: [],
  balancePhase: 0,
  balanceSeen: { xiao: false, li: false },
  balanceRole: null,
  summaryStep: 0,
  history: []
})

const roleProgress = reactive(createRoleProgress())
let introTimers = []

const mirrors = Array.from({ length: 80 }, (_, index) => {
  const row = Math.floor(index / 16)
  const col = index % 16
  return {
    id: index,
    style: {
      left: `${col * 6.2 + (row % 2) * 2.8 - 2}%`,
      top: `${row * 17 + 7}%`,
      transform: `scale(${0.58 + row * 0.12}) skew(-13deg) rotate(-5deg)`
    }
  }
})

const currentStory = computed(() => state.role ? STORIES[state.role] : null)
const balanceIconUrl = computed(() => resolvePublicAsset(import.meta.env.BASE_URL, 'balance.svg'))
const currentCharacterImage = computed(() => currentStory.value
  ? resolvePublicAsset(import.meta.env.BASE_URL, currentStory.value.image)
  : '')
const currentGroup = computed(() => currentStory.value?.groups[roleProgress.groupIndex] ?? null)
const currentOption = computed(() => currentGroup.value?.options[roleProgress.optionIndex] ?? null)
const currentSubOptions = computed(() => currentOption.value?.subChoices ?? [])
const currentSubOption = computed(() => currentSubOptions.value[roleProgress.subOptionIndex] ?? null)
const canGoBack = computed(() => state.history.length > 0)
const stageMode = computed(() => {
  if (state.screen === 'intro') return 'intro'
  if (state.screen === 'chooser' || state.screen === 'balance' || state.screen === 'summary') return 'supported'
  if (roleProgress.phase === 'result' && currentSubOption.value) return currentSubOption.value.mode
  if (roleProgress.phase === 'subchoice' && currentOption.value) {
    const lastSub = roleProgress.subOptionIndex
    if (lastSub !== null && currentSubOptions.value[lastSub]) return currentSubOptions.value[lastSub].mode
    return 'normal'
  }
  if ((roleProgress.phase === 'question' || roleProgress.phase === 'reveal') && currentStory.value) {
    const lastSelection = roleProgress.selections.at(-1)
    if (lastSelection) {
      const grp = currentStory.value.groups.at(-1)
      const opt = grp?.options[lastSelection.option]
      return opt?.subChoices?.[lastSelection.sub]?.mode ?? 'normal'
    }
    return 'normal'
  }
  return 'normal'
})
const sceneLabel = computed(() => {
  if (state.screen === 'intro') return '故事导入 · 光热电站'
  if (state.screen === 'chooser') return '请选择观察视角'
  if (state.screen === 'balance') return '两个故事 · 价值天平'
  if (state.screen === 'summary') return '知识归纳'
  return `${state.role === 'xiao' ? '第一幕' : '第二幕'} · ${currentStory.value.role}${currentStory.value.name}`
})
const progressText = computed(() => {
  if (state.screen === 'intro') return '导入'
  if (state.screen === 'chooser') return `已体验 ${Number(state.completed.xiao) + Number(state.completed.li)} / 2 个角色`
  if (state.screen === 'balance') return '综合讨论'
  if (state.screen === 'summary') return '第六课 第一框'
  if (roleProgress.phase === 'question') return `${currentStory.value.name} / 课堂追问`
  if (roleProgress.phase === 'reveal') return `${currentStory.value.name} / 知识生成`
  return `${currentStory.value.name} / 第 ${roleProgress.groupIndex + 1} 组（共 ${currentStory.value.groups.length} 组）`
})
const visualNotes = computed(() => {
  if (state.screen !== 'role') return ''
  if (roleProgress.phase === 'result') return currentSubOption.value?.visual ?? ''
  if (roleProgress.phase === 'subchoice') return ''
  if (roleProgress.phase === 'question' || roleProgress.phase === 'reveal') return '回看三组选择：不同判断背后，有着不同的价值排序。'
  return roleProgress.groupIndex === 0 ? currentStory.value.background : '先看行为后果，再讨论判断依据。'
})
const balanceAnswer = computed(() => {
  if (state.balanceRole === 'xiao') return '小王对财政成本、民生保障、生态效益和长远发展的价值排序不同。'
  if (state.balanceRole === 'li') return '李勇对个人生活、职业发展、科研责任和社会贡献的价值排序不同。'
  return ''
})
const visibleSummarySteps = computed(() => SUMMARY_STEPS.slice(0, Math.min(state.summaryStep + 1, 4)))
const visibleSummaryConcepts = computed(() => SUMMARY_CONCEPTS.slice(0, Math.min(state.summaryStep + 1, 4)))

function snapshot() {
  const { history, ...stateWithoutHistory } = state
  return JSON.parse(JSON.stringify({ state: stateWithoutHistory, roleProgress }))
}

function commit(mutator) {
  state.history.push(snapshot())
  mutator()
}

function restoreRoleProgress(progress) {
  Object.assign(roleProgress, createRoleProgress(), progress)
}

function goBack() {
  const previous = state.history.pop()
  if (!previous) return
  const remainingHistory = state.history
  Object.assign(state, previous.state, { history: remainingHistory })
  restoreRoleProgress(previous.roleProgress)
}

function optionLetter(index) {
  return ['A', 'B', 'C'][index] ?? ''
}

function subOptionLetter(index) {
  return ['A', 'B'][index] ?? ''
}

function clearIntroTimers() {
  introTimers.forEach(clearTimeout)
  introTimers = []
}

function introNext() {
  clearIntroTimers()
  commit(() => { state.introStep = Math.min(3, state.introStep + 1) })
}

function goChooser() {
  clearIntroTimers()
  commit(() => {
    state.screen = 'chooser'
    state.role = null
  })
}

function selectRole(role) {
  commit(() => {
    state.screen = 'role'
    state.role = role
    state.selectedKeywords = []
    restoreRoleProgress(createRoleProgress())
  })
}

function restartCurrentRole() {
  commit(() => {
    state.selectedKeywords = []
    restoreRoleProgress(createRoleProgress())
  })
}

function showChoices() {
  commit(() => { roleProgress.phase = 'choice' })
}

function makeChoice(index) {
  commit(() => { chooseOption(roleProgress, index) })
}

function makeSubChoice(index) {
  commit(() => { chooseSubOption(roleProgress, index) })
}

function advanceAfterResult() {
  commit(() => { continueAfterResult(roleProgress, currentStory.value.groups.length) })
}

function toggleKeyword(index) {
  if (!state.selectedKeywords.includes(index)) state.selectedKeywords.push(index)
}

function revealConcept() {
  commit(() => {
    roleProgress.phase = 'reveal'
    state.completed[state.role] = true
  })
}

function nextAct() {
  commit(() => {
    if (state.completed.xiao && state.completed.li) {
      state.screen = 'balance'
      state.balancePhase = 0
      state.balanceSeen = { xiao: false, li: false }
      state.balanceRole = null
    } else {
      state.screen = 'chooser'
      state.role = null
    }
  })
}

function goBalance() {
  commit(() => {
    state.screen = 'balance'
    state.balancePhase = 0
    state.balanceSeen = { xiao: false, li: false }
    state.balanceRole = null
  })
}

function balanceAsk(role) {
  state.balanceSeen[role] = true
  state.balanceRole = role
}

function balanceNext() {
  commit(() => { state.balancePhase = Math.min(2, state.balancePhase + 1) })
}

function goSummary() {
  commit(() => {
    state.screen = 'summary'
    state.summaryStep = 0
  })
}

function summaryNext() {
  commit(() => { state.summaryStep = Math.min(4, state.summaryStep + 1) })
}

function restart() {
  clearIntroTimers()
  Object.assign(state, {
    screen: 'intro', introStep: 0, role: null,
    completed: { xiao: false, li: false }, selectedKeywords: [],
    balancePhase: 0, balanceSeen: { xiao: false, li: false }, balanceRole: null,
    summaryStep: 0, history: []
  })
  restoreRoleProgress(createRoleProgress())
  startIntroAuto()
}

function startIntroAuto() {
  clearIntroTimers()
  ;[2300, 4700, 7100].forEach((delay, index) => {
    introTimers.push(setTimeout(() => {
      if (state.screen === 'intro' && state.introStep === index) state.introStep += 1
    }, delay))
  })
}

onMounted(startIntroAuto)
onUnmounted(clearIntroTimers)
</script>

<style src="../价值与价值观互动教学(1)/价值与价值观互动教学/style.css"></style>

<style scoped>
/* === 价值天平 优化 === */

/* 天平标题淡入放大 */
.balance-title {
  animation: balanceTitleIn .6s ease-out both;
}
@keyframes balanceTitleIn {
  from { opacity: 0; transform: scale(.85) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* 天平网格容器淡入 */
.wide-panel.balance-phase-0 {
  animation: panelFadeIn .5s ease-out both;
}
@keyframes panelFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* 天平标签逐个滑入 */
.balance-item {
  opacity: 0;
  animation: itemSlideIn .5s ease-out forwards;
}
@keyframes itemSlideIn {
  from { opacity: 0; transform: translateX(var(--slide-dir, -20px)); }
  to   { opacity: 1; transform: translateX(0); }
}
.balance-side.right .balance-item {
  --slide-dir: 20px;
}

/* 天平SVG图标 — 摇摆入场 */
.balance-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.balance-svg {
  width: 100%;
  max-width: 140px;
  height: auto;
  animation: balanceScaleIn .8s ease-out both;
}
@keyframes balanceScaleIn {
  0%   { opacity: 0; transform: scale(.5) rotate(-12deg); }
  60%  { opacity: 1; transform: scale(1.08) rotate(3deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}

/* 标题下方说明文字 */
.balance-caption {
  animation: captionFadeIn .6s ease-out .4s both;
}
@keyframes captionFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 问题按钮 — 按压波纹 + 激活高亮框 */
.question-link {
  position: relative;
  overflow: hidden;
  transition: all .3s ease;
}
.question-link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(255,235,150,.45) 0%, transparent 60%);
  opacity: 0;
  transform: scale(0);
  transition: none;
}
.question-link:active::after {
  opacity: 1;
  transform: scale(1.8);
  transition: opacity .4s, transform .5s;
}
.question-link.active {
  border: 2px solid #f4c675;
  box-shadow: 0 0 12px rgba(244,198,117,.5), 0 2px 8px rgba(0,0,0,.12);
  background: #fff5d8;
  transform: translateY(-1px);
}

/* 结论高亮框 */
.balance-answer {
  margin-top: 1.5vh;
  padding: .8em 1.2em;
  background: linear-gradient(135deg, #fff8e7 0%, #ffefc4 100%);
  border: 2px solid #f4c675;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(244,198,117,.25);
  font-size: clamp(18px, 1.25vw, 26px);
  color: #4a3500;
  text-align: center;
}

/* 结论 Transition */
.answer-fade-enter-active {
  transition: all .4s ease-out;
}
.answer-fade-leave-active {
  transition: all .25s ease-in;
}
.answer-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(.95);
}
.answer-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 选择按钮 — 缓慢切入 */
.choice {
  animation: choiceSlideIn .45s ease-out both;
}
.choice:nth-child(1) { animation-delay: .08s; }
.choice:nth-child(2) { animation-delay: .18s; }
.choice:nth-child(3) { animation-delay: .28s; }
@keyframes choiceSlideIn {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* 通用 — 模板切换淡入 */
.story-panel > template,
.wide-panel > template {
  animation: contentFadeIn .35s ease-out;
}
@keyframes contentFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* balance phase 1 prompt-line 淡入 */
.balance-phase-1 .prompt-line,
.balance-phase-1 .eyebrow,
.balance-phase-1 {
  animation: promptFadeIn .6s ease-out both;
}
@keyframes promptFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* balance phase 2 final-word 弹出 */
.balance-phase-2 .final-word {
  animation: finalWordPop .7s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes finalWordPop {
  0%   { opacity: 0; transform: scale(.3); }
  60%  { opacity: 1; transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
