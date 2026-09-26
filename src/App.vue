<template>
  <div class="app-container">
    <!-- ===== 顶部标题栏 ===== -->
    <header class="top-bar">
      <div class="course-tag">哲学与文化</div>
      <div class="separator"></div>
      <div class="lesson-tag">第六课 第一框</div>
      <h1 class="main-title">价值与价值观</h1>
      <div class="progress-indicator" ref="progressRef">
        <span class="dot" :class="{ active: state.screen !== 'intro' }"></span>
        <span class="dot" :class="{ active: state.completed.xiao }"></span>
        <span class="dot" :class="{ active: state.completed.li }"></span>
        <span class="dot" :class="{ active: state.screen === 'summary' }"></span>
      </div>
    </header>

    <!-- ===== 主舞台 ===== -->
    <main class="stage" ref="stageRef">
      <!-- 背景装饰 -->
      <div class="bg-layer" ref="bgLayer">
        <div class="bg-sun" ref="bgSun"></div>
        <div class="bg-mirror-field">
          <div v-for="i in 40" :key="i" class="bg-mirror"
            :style="{ left: ((i*2.5)%100) + '%', top: (55 + (i%5)*6) + '%', animationDelay: (i*0.15) + 's' }">
          </div>
        </div>
        <div class="bg-tower" ref="bgTower"></div>
        <div class="bg-ground"></div>
      </div>

      <!-- 左侧人物区 -->
      <div class="character-zone" ref="characterZone">
        <transition name="char-fade" mode="out-in">
          <div v-if="currentCharacter" :key="currentCharacter.id" class="char-display">
            <img :src="currentCharacter.image" :alt="currentCharacter.name" class="char-img" ref="charImg" />
            <div class="char-info">
              <div class="char-name">{{ currentCharacter.name }}</div>
              <div class="char-role">{{ currentCharacter.role }}</div>
            </div>
          </div>
          <div v-else-if="state.screen === 'chooser'" key="chooser-visual" class="char-display chooser-visual">
            <div class="dual-char">
              <div class="mini-char" @click="selectRole('xiao')">
                <img src="/xiao-wang.png" alt="小王" class="mini-img" :class="{ done: state.completed.xiao }" />
                <span>小王</span>
              </div>
              <div class="vs-text">VS</div>
              <div class="mini-char" @click="selectRole('li')">
                <img src="/li-yong.png" alt="李勇" class="mini-img" :class="{ done: state.completed.li }" />
                <span>李勇</span>
              </div>
            </div>
          </div>
          <div v-else key="intro-visual" class="char-display intro-visual">
            <div class="intro-scene" ref="introScene">
              <div class="intro-sun"></div>
              <div class="intro-tower"></div>
              <div class="intro-mirrors">
                <div v-for="i in 12" :key="i" class="intro-mirror"
                  :style="{ left: (i * 8 - 4) + '%', animationDelay: (i * 0.12) + 's' }">
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 右侧对话/选择区 -->
      <div class="dialog-zone" ref="dialogZone">
        <transition name="panel-slide" mode="out-in">
          <!-- Intro -->
          <div v-if="state.screen === 'intro'" key="intro" class="dialog-panel intro-panel">
            <div class="panel-header">故事导入 · 光热电站</div>
            <div class="intro-captions">
              <p v-for="(cap, i) in introCaptions" :key="i" class="intro-caption-line"
                :class="{ visible: state.introStep >= i }" ref="el => introLineRefs[i] = el">
                {{ cap }}
              </p>
            </div>
          </div>

          <!-- Role Chooser -->
          <div v-else-if="state.screen === 'chooser'" key="chooser" class="dialog-panel chooser-panel">
            <div class="panel-header">请选择观察视角</div>
            <h2 class="panel-title">你要先帮助谁作决定？</h2>
            <p class="panel-desc">一项工程 · 两个位置 · 不同的价值判断</p>
            <div class="role-cards">
              <div class="role-card-choice" @click="selectRole('xiao')">
                <div class="rc-icon">🏛️</div>
                <div class="rc-body">
                  <strong>政府视角：小王</strong>
                  <span>财政压力下，如何判断项目价值？{{ state.completed.xiao ? ' · 已体验' : '' }}</span>
                </div>
              </div>
              <div class="role-card-choice" @click="selectRole('li')">
                <div class="rc-icon">🔬</div>
                <div class="rc-body">
                  <strong>科研人员视角：李勇</strong>
                  <span>个人机会面前，如何作出职业选择？{{ state.completed.li ? ' · 已体验' : '' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Role: Situation -->
          <div v-else-if="state.screen === 'role' && state.phase === 'situation'" key="situation" class="dialog-panel">
            <div class="panel-header">{{ currentCharacter.role }} · 情境</div>
            <h2 class="panel-title">{{ currentStory.title }}</h2>
            <p class="panel-body">{{ currentStory.situation }}</p>
          </div>

          <!-- Role: Cue -->
          <div v-else-if="state.screen === 'role' && state.phase === 'cue'" key="cue" class="dialog-panel">
            <div class="panel-header">现实矛盾</div>
            <h2 class="panel-title">{{ currentStory.title }}</h2>
            <p class="panel-body whitespace-pre">{{ currentStory.cue }}</p>
          </div>

          <!-- Role: Choice -->
          <div v-else-if="state.screen === 'role' && state.phase === 'choice'" key="choice" class="dialog-panel">
            <div class="panel-header">请作出选择</div>
            <h2 class="panel-title">{{ currentStory.title }}</h2>
            <div class="choice-list">
              <button v-for="(choice, i) in currentStory.choices" :key="i"
                class="choice-btn" :ref="el => choiceBtnRefs[i] = el"
                @click="makeChoice(i)">
                <span class="choice-letter">{{ 'ABC'[i] }}</span>
                <span class="choice-text">{{ choice }}</span>
              </button>
            </div>
          </div>

          <!-- Role: Result -->
          <div v-else-if="state.screen === 'role' && state.phase === 'result'" key="result" class="dialog-panel">
            <div class="panel-header">选择 {{ state.branch }} · 发展结果 {{ state.resultIndex + 1 }}/{{ currentBranch.results.length }}</div>
            <h2 class="panel-title">{{ state.resultIndex === 0 ? '接下来发生了什么？' : '事情继续发展' }}</h2>
            <p class="panel-body" :ref="el => resultTextRef = el">{{ currentBranch.results[state.resultIndex] }}</p>
          </div>

          <!-- Role: Question -->
          <div v-else-if="state.screen === 'role' && state.phase === 'question'" key="question" class="dialog-panel">
            <div class="panel-header">课堂追问</div>
            <h2 class="panel-title">{{ currentBranch.question }}</h2>
            <div v-if="currentBranch.keywords" class="keyword-row">
              <button v-for="(kw, i) in currentBranch.keywords" :key="i"
                class="keyword-btn" :class="{ active: state.selectedKeywords.includes(i), social: kw === '社会贡献' }"
                @click="toggleKeyword(i)">{{ kw }}</button>
            </div>
          </div>

          <!-- Role: Reveal -->
          <div v-else-if="state.screen === 'role' && state.phase === 'reveal'" key="reveal" class="dialog-panel reveal-panel">
            <div class="panel-header">教师揭示 · 知识生成</div>
            <h2 class="panel-title">{{ state.role === 'xiao' ? '判断背后的导向' : '怎样衡量人的价值？' }}</h2>
            <p class="reveal-text">{{ currentStory.concept }}</p>
            <p v-if="currentStory.note" class="reveal-note">{{ currentStory.note }}</p>
          </div>

          <!-- Balance -->
          <div v-else-if="state.screen === 'balance'" key="balance" class="dialog-panel balance-panel">
            <template v-if="state.balancePhase === 0">
              <div class="panel-header">现实选择的代价与依据</div>
              <h2 class="panel-title">价值天平</h2>
              <div class="balance-grid">
                <div class="balance-side">
                  <span>眼前利益</span><span>个人利益</span><span>经济成本</span><span>现实压力</span>
                </div>
                <div class="balance-icon">⚖️</div>
                <div class="balance-side right">
                  <span>长远发展</span><span>社会利益</span><span>生态价值</span><span>社会贡献</span>
                </div>
              </div>
              <p class="panel-body">现实选择往往有代价。我们依据什么标准判断和取舍？</p>
              <div class="balance-question-row">
                <button class="question-link-btn" @click="balanceAsk('xiao')">小王为什么会有不同选择？</button>
                <button class="question-link-btn" @click="balanceAsk('li')">李勇为什么会有不同选择？</button>
              </div>
            </template>
            <template v-else-if="state.balancePhase === 1">
              <div class="panel-header">从故事回到共同问题</div>
              <p class="prompt-line">
                面对同一件事，<br/>
                人们可能作出不同的认识、评价和选择。<br/>
                在这些判断背后，<br/>
                发挥导向作用的正是——
              </p>
            </template>
            <template v-else>
              <div class="panel-header">概念生成</div>
              <div class="final-word" ref="finalWordRef">价值观</div>
            </template>
          </div>

          <!-- Summary -->
          <div v-else-if="state.screen === 'summary'" key="summary" class="dialog-panel summary-panel">
            <div class="panel-header">知识归纳 · 第六课 第一框</div>
            <h2 class="panel-title">从选择中认识价值观</h2>
            <div class="flow-grid">
              <div class="flow-col">
                <strong>人物的行动</strong>
                <template v-for="(step, i) in summarySteps" :key="i">
                  <span :class="{ active: state.summaryStep >= i }">{{ step }}</span>
                  <b v-if="i < 3">↓</b>
                </template>
              </div>
              <div class="flow-col">
                <strong>价值观的作用</strong>
                <template v-for="(concept, i) in summaryConcepts" :key="i">
                  <span :class="{ active: state.summaryStep >= i }">{{ concept }}</span>
                  <b v-if="i < 3">↓</b>
                </template>
              </div>
            </div>
            <div v-if="state.summaryStep >= 4" class="knowledge-list">
              <p>1. 价值观对人们认识和改造世界的活动具有重要导向作用。</p>
              <p>2. 价值观是人生的重要向导。</p>
              <p>3. 人的价值主要在于对社会的贡献。</p>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <!-- ===== 底部操作栏 ===== -->
    <footer class="bottom-bar">
      <div class="bottom-left">
        <button v-if="canGoBack" class="nav-btn ghost" @click="goBack">← 上一步</button>
        <button v-if="state.screen === 'role'" class="nav-btn ghost" @click="goChooser">返回角色</button>
        <button v-if="state.screen !== 'intro' && state.screen !== 'chooser'" class="nav-btn ghost" @click="goChooser">重新选择角色</button>
      </div>
      <div class="bottom-right">
        <button v-if="state.screen === 'intro' && state.introStep < 3" class="nav-btn primary" @click="introNext">下一步 →</button>
        <button v-if="state.screen === 'intro' && state.introStep >= 3" class="nav-btn primary" @click="goChooser">进入故事 →</button>
        <button v-if="state.screen === 'role' && state.phase === 'situation'" class="nav-btn primary" @click="roleNext">下一步 →</button>
        <button v-if="state.screen === 'role' && state.phase === 'cue'" class="nav-btn primary" @click="roleNext">下一步 →</button>
        <button v-if="state.screen === 'role' && state.phase === 'result' && !isLastResult" class="nav-btn primary" @click="roleNext">下一步 →</button>
        <button v-if="state.screen === 'role' && state.phase === 'result' && isLastResult" class="nav-btn primary" @click="roleNext">课堂追问 →</button>
        <button v-if="state.screen === 'role' && state.phase === 'question' && !(state.role === 'xiao' && state.branch === 'C')" class="nav-btn primary" @click="reveal">揭示知识 →</button>
        <button v-if="state.screen === 'role' && state.phase === 'question' && state.role === 'xiao' && state.branch === 'C'" class="nav-btn primary" @click="reveal">继续思考 →</button>
        <button v-if="state.screen === 'role' && state.phase === 'reveal'" class="nav-btn primary" @click="nextAct">
          {{ state.completed.xiao && state.completed.li ? '进入总结 →' : '进入下一幕 →' }}
        </button>
        <button v-if="state.screen === 'chooser' && state.completed.xiao && state.completed.li" class="nav-btn primary" @click="goBalance">进入总结 →</button>
        <button v-if="state.screen === 'balance' && state.balancePhase < 2" class="nav-btn primary" @click="balanceNext">下一步 →</button>
        <button v-if="state.screen === 'balance' && state.balancePhase >= 2" class="nav-btn primary" @click="goSummary">进入知识归纳 →</button>
        <button v-if="state.screen === 'summary' && state.summaryStep < 4" class="nav-btn primary" @click="summaryNext">下一步 →</button>
        <button v-if="state.screen === 'summary' && state.summaryStep >= 4" class="nav-btn primary" @click="restart">重新开始 →</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

// ===== DATA =====
const STORIES = {
  xiao: {
    id: 'xiao',
    name: '小王',
    role: '政府财政工作人员',
    image: '/xiao-wang.png',
    title: '第一份财政方案',
    situation: '当地准备建设大型光热电站。项目有长期价值，但前期投入大、回本慢，财政压力和社会质疑同时出现。',
    cue: '项目建设需要持续投入。\n面对财政压力，小王必须提出自己的意见。',
    choices: [
      '短期投入太大，先暂停项目，把资金投向见效更快的领域。',
      '可以继续支持，但必须压缩投入，尽快看到经济收益。',
      '不能只算眼前账。在充分论证、控制风险的基础上，看到长期生态价值和社会价值。'
    ],
    branches: {
      A: { mode: 'paused', visual: '建设暂缓 · 镜场暗下', results: ['财政压力暂时缓解。', '几年后，能源转型项目重新启动。', '当地已错过部分产业和技术积累机会。'], question: '他的判断，更重视什么？', keywords: ['短期现实收益', '长期社会发展'] },
      B: { mode: 'limited', visual: '工程继续 · 研发投入缩减', results: ['项目保住了。', '为尽快见效，一些长期技术研发被压缩。', '短期数据改善，后续发展能力受到影响。'], question: '评价一种选择，只看眼前结果够吗？' },
      C: { mode: 'supported', visual: '共同论证 · 评估风险 · 分阶段推进', results: ['政府没有忽视财政压力。', '风险评估后，项目继续得到支持。', '技术逐步成熟，生态、能源和产业效益开始显现。'], question: '同样面对财政压力，为什么会作出不同判断？' }
    },
    concept: '价值观影响人们对事物的认识和评价，\n影响人们改造世界的活动和行为选择。'
  },
  li: {
    id: 'li',
    name: '李勇',
    role: '科研团队核心成员',
    image: '/li-yong.png',
    title: '一封新的邀请',
    situation: '项目进入攻坚阶段：实验受挫，工作艰苦，前景尚不明朗。此时，一封邀请发到了李勇的手机上。',
    cue: '大城市科研机构邀请李勇加入：\n薪酬更高，环境更好，项目也更成熟。',
    choices: [
      '先离开这里。个人发展机会不能错过。',
      '暂时留下，先看看项目还有没有成功可能。',
      '项目正处于最需要人的时候。只要仍有技术突破的可能，我愿意继续留下来。'
    ],
    branches: {
      A: { mode: 'city', visual: '新的工作 · 原团队出现空缺', results: ['他的收入提高了。', '工作环境也更加稳定。', '原团队需要重新寻找核心技术人员。', '项目进度因此受到影响。'], question: '评价一个人的人生价值，能不能只看他得到了什么？' },
      B: { mode: 'limited', visual: '继续参与 · 攻关负责人尚未稳定', results: ['他没有立即离开。', '他一边准备其他岗位，一边参与项目。', '最困难的攻关任务缺少稳定负责人，项目在犹豫中推进。'], question: '价值选择是否意味着必须面对取舍？' },
      C: { mode: 'night', visual: '夜间调试 · 重新计算 · 镜场再点亮', results: ['又一次实验失败。', '重新计算。', '再次调试。', '技术问题逐步被攻克。', '多年以后，数万面定日镜在戈壁上同时转向太阳。'], question: '李勇获得了什么？', keywords: ['个人收入', '职业发展', '社会贡献'] }
    },
    concept: '人的价值主要在于对社会的贡献。',
    note: '人的价值是社会价值和自我价值的统一。'
  }
}

const summarySteps = ['看见问题', '作出判断', '作出选择', '付诸行动']
const summaryConcepts = ['价值观', '影响认识和评价', '影响行为选择', '影响人生道路']
const introCaptions = [
  '戈壁的清晨',
  '数万面定日镜缓缓转向太阳',
  '光线汇聚，吸热塔点亮',
  '如果一项事业，\n今天投入巨大，\n明天未必立即见效，\n但可能改变未来，\n你会如何选择？'
]

// ===== STATE =====
const state = reactive({
  screen: 'intro',
  introStep: 0,
  role: null,
  phase: null,
  branch: null,
  resultIndex: 0,
  completed: { xiao: false, li: false },
  balancePhase: 0,
  balanceSeen: { xiao: false, li: false },
  summaryStep: 0,
  selectedKeywords: [],
  history: []
})

// ===== REFS =====
const stageRef = ref(null)
const characterZone = ref(null)
const dialogZone = ref(null)
const progressRef = ref(null)
const charImg = ref(null)
const choiceBtnRefs = ref([])
const resultTextRef = ref(null)
const finalWordRef = ref(null)
const introLineRefs = ref([])
const introScene = ref(null)
const bgSun = ref(null)
const bgTower = ref(null)
const bgLayer = ref(null)

// ===== COMPUTED =====
const currentStory = computed(() => state.role ? STORIES[state.role] : null)
const currentCharacter = computed(() => state.role ? STORIES[state.role] : null)
const currentBranch = computed(() => {
  if (!state.role || !state.branch) return null
  return STORIES[state.role].branches[state.branch]
})
const isLastResult = computed(() => {
  if (!currentBranch.value) return false
  return state.resultIndex >= currentBranch.value.results.length - 1
})
const canGoBack = computed(() => state.history.length > 0)

// ===== HISTORY =====
function snapshot() {
  const { history, ...rest } = state
  return JSON.parse(JSON.stringify(rest))
}
function commit(fn) {
  state.history.push(snapshot())
  fn()
}
function goBack() {
  if (!state.history.length) return
  Object.assign(state, state.history.pop())
}

// ===== ACTIONS =====
function introNext() {
  commit(() => { state.introStep = Math.min(3, state.introStep + 1) })
}
function goChooser() {
  commit(() => { state.screen = 'chooser'; state.role = null; state.phase = null })
}
function selectRole(role) {
  commit(() => {
    state.screen = 'role'
    state.role = role
    state.phase = 'situation'
    state.branch = null
    state.resultIndex = 0
    state.selectedKeywords = []
  })
}
function roleNext() {
  commit(() => {
    if (state.phase === 'situation') state.phase = 'cue'
    else if (state.phase === 'cue') state.phase = 'choice'
    else if (state.phase === 'result') {
      if (state.resultIndex < currentBranch.value.results.length - 1) state.resultIndex++
      else state.phase = 'question'
    }
  })
}
function makeChoice(idx) {
  const branch = 'ABC'[idx]
  commit(() => {
    state.branch = branch
    state.resultIndex = 0
    state.selectedKeywords = []
    state.phase = 'result'
  })
}
function toggleKeyword(i) {
  commit(() => {
    if (!state.selectedKeywords.includes(i)) state.selectedKeywords.push(i)
  })
}
function reveal() {
  commit(() => {
    state.phase = 'reveal'
    state.completed[state.role] = true
  })
}
function nextAct() {
  commit(() => {
    if (state.completed.xiao && state.completed.li) {
      state.screen = 'balance'
      state.balancePhase = 0
      state.balanceSeen = { xiao: false, li: false }
    } else {
      state.screen = 'chooser'
      state.role = null
      state.phase = null
    }
  })
}
function goBalance() {
  commit(() => {
    state.screen = 'balance'
    state.balancePhase = 0
    state.balanceSeen = { xiao: false, li: false }
  })
}
function balanceAsk(role) {
  const answer = role === 'xiao'
    ? '小王面临财政压力：不同选择背后是不同的价值排序——短期效益还是长远发展。'
    : '李勇面临个人选择：不同选择背后是不同的人生价值观——个人利益还是社会贡献。'
  state.balanceSeen[role] = true
  // Can't use commit here because we don't want history for this
  // Just update reactively
}
function balanceNext() {
  commit(() => { state.balancePhase++ })
}
function goSummary() {
  commit(() => { state.screen = 'summary'; state.summaryStep = 0 })
}
function summaryNext() {
  commit(() => { state.summaryStep = Math.min(4, state.summaryStep + 1) })
}
function restart() {
  Object.assign(state, {
    screen: 'intro', introStep: 0, role: null, phase: null, branch: null,
    resultIndex: 0, completed: { xiao: false, li: false },
    balancePhase: 0, balanceSeen: { xiao: false, li: false },
    summaryStep: 0, selectedKeywords: [], history: []
  })
}

// ===== ANIMATIONS =====
let introTimers = []
function clearIntroTimers() { introTimers.forEach(clearTimeout); introTimers = [] }

function playEnterAnim() {
  nextTick(() => {
    // Panel slide-in
    const panel = dialogZone.value?.querySelector('.dialog-panel')
    if (panel) {
      gsap.fromTo(panel,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
    }
    // Character zone pulse
    const charEl = characterZone.value?.querySelector('.char-img')
    if (charEl) {
      gsap.fromTo(charEl,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
      )
    }
    // Choice buttons stagger
    const choices = dialogZone.value?.querySelectorAll('.choice-btn')
    if (choices && choices.length) {
      gsap.fromTo(choices,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.12, ease: 'power2.out', delay: 0.2 }
      )
    }
    // Result text fade
    if (resultTextRef.value) {
      gsap.fromTo(resultTextRef.value,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
    }
    // Reveal text special
    const revealText = dialogZone.value?.querySelector('.reveal-text')
    if (revealText) {
      gsap.fromTo(revealText,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.4)' }
      )
    }
    // Final word
    if (finalWordRef.value) {
      gsap.fromTo(finalWordRef.value,
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2)' }
      )
    }
    // Knowledge list items
    const kItems = dialogZone.value?.querySelectorAll('.knowledge-list p')
    if (kItems && kItems.length) {
      gsap.fromTo(kItems,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.15, delay: 0.3 }
      )
    }
    // Flow grid steps
    const flowSpans = dialogZone.value?.querySelectorAll('.flow-col span')
    if (flowSpans && flowSpans.length) {
      gsap.fromTo(flowSpans,
        { x: -15, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, stagger: 0.1, delay: 0.2 }
      )
    }
  })
}

function startIntroAuto() {
  clearIntroTimers()
  introTimers.push(setTimeout(() => { if (state.screen === 'intro' && state.introStep === 0) { commit(() => state.introStep = 1) } }, 2500))
  introTimers.push(setTimeout(() => { if (state.screen === 'intro' && state.introStep === 1) { commit(() => state.introStep = 2) } }, 5000))
  introTimers.push(setTimeout(() => { if (state.screen === 'intro' && state.introStep === 2) { commit(() => state.introStep = 3) } }, 7500))
}

// ===== WATCHER: play animation on state change =====
import { watch } from 'vue'
watch(
  () => [state.screen, state.phase, state.branch, state.resultIndex, state.introStep, state.balancePhase, state.summaryStep],
  () => { playEnterAnim() }
)

// ===== LIFECYCLE =====
onMounted(() => {
  gsap.ticker.lagSmoothing(0)
  startIntroAuto()
  // Background animations
  if (bgSun.value) {
    gsap.to(bgSun.value, { y: -8, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  }
  if (bgTower.value) {
    gsap.to(bgTower.value, { boxShadow: '0 0 30px 12px rgba(255,210,120,0.5)', duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  }
})

onUnmounted(() => {
  clearIntroTimers()
  gsap.killTweensOf("*")
})
</script>

<style scoped>
/* ===== BASE ===== */
* { box-sizing: border-box; margin: 0; padding: 0; }

.app-container {
  width: 100vw;
  height: 100dvh;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f4f8 0%, #e8eef5 100%);
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif;
  color: #1a2a3a;
}

/* ===== TOP BAR ===== */
.top-bar {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 3vw;
  background: linear-gradient(135deg, #1a3a5c 0%, #2c5f8a 100%);
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(26,58,92,0.15);
  z-index: 10;
}
.course-tag {
  font-size: 15px;
  letter-spacing: 0.08em;
  opacity: 0.85;
  white-space: nowrap;
}
.separator {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,0.3);
}
.lesson-tag {
  font-size: 15px;
  letter-spacing: 0.08em;
  opacity: 0.85;
  white-space: nowrap;
}
.main-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin-left: 8px;
}
.progress-indicator {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.progress-indicator .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  transition: all 0.3s;
}
.progress-indicator .dot.active {
  background: #f4c675;
  box-shadow: 0 0 8px rgba(244,198,117,0.6);
}

/* ===== STAGE ===== */
.stage {
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0;
  overflow: hidden;
}

/* Background layer */
.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: linear-gradient(180deg, #c8dde8 0%, #d5e5ec 40%, #e8d5b8 65%, #d4b896 100%);
}
.bg-sun {
  position: absolute;
  left: 8%;
  top: 5%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff4c2 0%, #ffdf84 50%, rgba(255,223,132,0) 80%);
  box-shadow: 0 0 60px 20px rgba(255,223,132,0.4);
}
.bg-mirror-field {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35%;
}
.bg-mirror {
  position: absolute;
  width: 28px;
  height: 4px;
  background: rgba(135,180,200,0.35);
  border-radius: 2px;
  transform: skewX(-15deg);
  animation: mirrorShimmer 3s ease-in-out infinite;
}
@keyframes mirrorShimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
.bg-tower {
  position: absolute;
  left: 48%;
  bottom: 25%;
  width: 16px;
  height: 120px;
  background: linear-gradient(180deg, #b0c4d8 0%, #8aa0b8 100%);
  border-radius: 4px 4px 0 0;
}
.bg-ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20%;
  background: linear-gradient(180deg, transparent 0%, rgba(180,160,120,0.3) 100%);
}

/* ===== CHARACTER ZONE (LEFT) ===== */
.character-zone {
  width: 42%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  padding: 20px;
}
.char-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.char-img {
  max-width: 320px;
  max-height: 60vh;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.15));
  border-radius: 12px;
}
.char-info {
  text-align: center;
}
.char-name {
  font-size: 22px;
  font-weight: 700;
  color: #1a3a5c;
}
.char-role {
  font-size: 14px;
  color: #5a7a8a;
  margin-top: 2px;
}

/* Chooser visual */
.dual-char {
  display: flex;
  align-items: center;
  gap: 20px;
}
.mini-char {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}
.mini-char:hover {
  transform: translateY(-4px);
}
.mini-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 3px solid #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.mini-img.done {
  border-color: #f4c675;
}
.mini-char span {
  font-size: 16px;
  font-weight: 600;
  color: #1a3a5c;
}
.vs-text {
  font-size: 28px;
  font-weight: 900;
  color: #c0c8d0;
}

/* Intro visual */
.intro-scene {
  width: 100%;
  max-width: 400px;
  position: relative;
  height: 280px;
}
.intro-sun {
  position: absolute;
  left: 30%;
  top: 5%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff4c2, #ffdf84);
  box-shadow: 0 0 40px 15px rgba(255,223,132,0.5);
}
.intro-tower {
  position: absolute;
  left: 50%;
  bottom: 20%;
  width: 12px;
  height: 100px;
  background: linear-gradient(180deg, #b0c4d8, #8aa0b8);
  border-radius: 4px 4px 0 0;
}
.intro-mirrors {
  position: absolute;
  bottom: 10%;
  left: 0;
  right: 0;
  height: 40px;
}
.intro-mirror {
  position: absolute;
  bottom: 0;
  width: 20px;
  height: 3px;
  background: rgba(135,180,200,0.5);
  border-radius: 2px;
  transform: skewX(-15deg);
  animation: introMirrorGlow 2s ease-in-out infinite;
}
@keyframes introMirrorGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

/* ===== DIALOG ZONE (RIGHT) ===== */
.dialog-zone {
  width: 58%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  padding: 20px 30px 20px 0;
}
.dialog-panel {
  width: 100%;
  max-width: 560px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 8px 32px rgba(26,58,92,0.1);
  border: 1px solid rgba(255,255,255,0.6);
}
.panel-header {
  font-size: 13px;
  color: #5a8aaa;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
  text-transform: none;
}
.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a3a5c;
  margin-bottom: 16px;
  line-height: 1.4;
}
.panel-body {
  font-size: 17px;
  line-height: 1.8;
  color: #333;
}
.panel-body.whitespace-pre {
  white-space: pre-wrap;
}
.panel-desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 16px;
}

/* ===== INTRO PANEL ===== */
.intro-panel {
  text-align: center;
}
.intro-captions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}
.intro-caption-line {
  font-size: 18px;
  color: #888;
  opacity: 0;
  transition: opacity 0.6s;
  white-space: pre-wrap;
}
.intro-caption-line.visible {
  opacity: 1;
  color: #1a3a5c;
}
.intro-caption-line:last-child {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.8;
  color: #1a3a5c;
}

/* ===== CHOOSER PANEL ===== */
.chooser-panel {
  text-align: center;
}
.role-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}
.role-card-choice {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(240,244,248,0.8);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}
.role-card-choice:hover {
  border-color: #6ba8d4;
  background: rgba(240,244,248,1);
  transform: translateX(4px);
}
.rc-icon {
  font-size: 28px;
}
.rc-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rc-body strong {
  font-size: 17px;
  color: #1a3a5c;
}
.rc-body span {
  font-size: 14px;
  color: #666;
}

/* ===== CHOICE BUTTONS ===== */
.choice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.choice-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  background: #f8fafc;
  border: 2px solid #e0e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}
.choice-btn:hover {
  border-color: #6ba8d4;
  background: #fff;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(107,168,212,0.15);
}
.choice-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2c5f8a;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.choice-text {
  flex: 1;
}

/* ===== REVEAL ===== */
.reveal-panel {
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,248,255,0.92));
  border: 1px solid rgba(107,168,212,0.3);
}
.reveal-text {
  font-size: 18px;
  line-height: 1.9;
  color: #1a3a5c;
  white-space: pre-wrap;
  font-weight: 500;
}
.reveal-note {
  font-size: 15px;
  color: #666;
  margin-top: 8px;
}

/* ===== KEYWORDS ===== */
.keyword-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.keyword-btn {
  padding: 8px 16px;
  background: #f0f4f8;
  border: 2px solid #d0dde8;
  border-radius: 20px;
  font-size: 15px;
  color: #5a7a8a;
  cursor: pointer;
  transition: all 0.3s;
}
.keyword-btn.active {
  background: #2c5f8a;
  color: #fff;
  border-color: #2c5f8a;
}
.keyword-btn.social.active {
  background: #d4a020;
  border-color: #d4a020;
}

/* ===== BALANCE ===== */
.balance-panel {
  text-align: center;
}
.balance-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}
.balance-side {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 15px;
  color: #666;
}
.balance-side span {
  padding: 6px 12px;
  background: #f5f8fa;
  border-radius: 6px;
}
.balance-side.right span {
  color: #1a3a5c;
  font-weight: 500;
}
.balance-icon {
  font-size: 36px;
}
.balance-question-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}
.question-link-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #6ba8d4;
  border-radius: 8px;
  color: #2c5f8a;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}
.question-link-btn:hover {
  background: #f0f4f8;
}
.prompt-line {
  font-size: 20px;
  line-height: 2.2;
  color: #1a3a5c;
  margin: 24px 0;
  white-space: pre-wrap;
  font-weight: 500;
}
.final-word {
  font-size: 48px;
  font-weight: 900;
  color: #1a3a5c;
  margin: 30px 0;
  letter-spacing: 0.2em;
  text-align: center;
  background: linear-gradient(135deg, #1a3a5c, #6ba8d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== SUMMARY ===== */
.summary-panel {
  text-align: center;
}
.flow-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}
.flow-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}
.flow-col strong {
  font-size: 15px;
  color: #5a7a8a;
  margin-bottom: 4px;
}
.flow-col span {
  padding: 8px 12px;
  background: #f5f8fa;
  border-radius: 6px;
  font-size: 15px;
  color: #999;
  transition: all 0.3s;
}
.flow-col span.active {
  background: #e8f0fa;
  color: #1a3a5c;
  font-weight: 500;
}
.flow-col b {
  color: #c0c8d0;
  font-size: 14px;
}
.knowledge-list {
  margin-top: 20px;
  text-align: left;
}
.knowledge-list p {
  font-size: 16px;
  color: #1a3a5c;
  line-height: 1.8;
  padding: 8px 16px;
  background: rgba(232,240,250,0.6);
  border-radius: 8px;
  margin-bottom: 6px;
}

/* ===== BOTTOM BAR ===== */
.bottom-bar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  background: #fff;
  border-top: 1px solid #e0e8f0;
  flex-shrink: 0;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.04);
  z-index: 10;
}
.bottom-left, .bottom-right {
  display: flex;
  gap: 10px;
}
.nav-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.nav-btn.ghost {
  background: transparent;
  color: #5a7a8a;
  border: 1px solid #d0dde8;
}
.nav-btn.ghost:hover {
  background: #f5f8fa;
  color: #1a3a5c;
}
.nav-btn.primary {
  background: linear-gradient(135deg, #2c5f8a, #1a3a5c);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(44,95,138,0.25);
}
.nav-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44,95,138,0.35);
}

/* ===== TRANSITIONS ===== */
.char-fade-enter-active, .char-fade-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}
.char-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.char-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.panel-slide-enter-active, .panel-slide-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .stage {
    flex-direction: column;
  }
  .character-zone {
    width: 100%;
    min-height: 180px;
    padding: 12px;
  }
  .char-img {
    max-width: 160px;
    max-height: 160px;
  }
  .dialog-zone {
    width: 100%;
    padding: 12px;
  }
  .main-title {
    font-size: 20px;
  }
}
</style>
