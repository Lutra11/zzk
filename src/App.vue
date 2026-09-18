<template>
  <div class="app-container">
    <!-- ===== NAV BAR ===== -->
    <nav class="nav-bar">
      <div class="nav-title">☀️ 追光者 · 价值与价值观</div>
      <ul class="nav-links">
        <li><a v-for="link in navLinks" :key="link.id" :class="{ active: activeSection === link.id }"
            @click="scrollToSection(link.id)">{{ link.label }}</a></li>
      </ul>
    </nav>

    <!-- ===== HERO ===== -->
    <section id="hero" class="hero">
      <div class="hero-bg-grid"></div>
      <!-- Heliostat SVG Scene -->
      <svg class="heliostat-scene" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffb347" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#1a2140" stop-opacity="0.3"/>
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffd966" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ffd966" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="rayGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffd966" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#ffd966" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <!-- Sun -->
        <circle ref="sunRef" cx="100" cy="80" r="30" fill="url(#sunGlow)"/>
        <circle ref="sunCoreRef" cx="100" cy="80" r="18" fill="#ffd966" opacity="0.9"/>
        <!-- Sun rays to mirrors -->
        <line class="sun-ray" v-for="i in 6" :key="'ray-'+i"
          :x1="100" :y1="80" :x2="200 + i*120" :y2="350"
          stroke="url(#rayGrad)" stroke-width="1.5" stroke-dasharray="6 3" opacity="0.3"/>
        <!-- Tower -->
        <rect x="580" y="100" width="40" height="350" fill="url(#towerGrad)" rx="4"/>
        <rect x="570" y="90" width="60" height="30" rx="8" class="tower-top"/>
        <!-- Tower glow -->
        <circle ref="towerGlowRef" cx="600" cy="105" r="20" fill="#ffd966" opacity="0.6"/>
        <!-- Mirrors -->
        <g v-for="i in 6" :key="'mirror-'+i" :ref="el => mirrorRefs[i-1] = el">
          <rect :x="200 + i*120 - 25" y="340" width="50" height="6" rx="3"
            transform="rotate(-15, 200+i*120, 343)" class="mirror-glass"/>
          <rect :x="200 + i*120 - 3" y="346" width="6" height="20" fill="rgba(56,225,212,0.3)"/>
          <!-- Reflected ray to tower -->
          <line :x1="200 + i*120" :y1="340" :x2="600" :y2="110"
            stroke="rgba(255,217,102,0.2)" stroke-width="1" stroke-dasharray="4 4"/>
        </g>
        <!-- Ground -->
        <rect x="0" y="400" width="1200" height="100" fill="rgba(26,33,64,0.5)"/>
      </svg>

      <div class="hero-content">
        <span class="hero-tag" ref="heroTag">AI 赋能 · 高中政治公开课</span>
        <h1 class="hero-title" ref="heroTitle">
          追光的镜子<br/>从戈壁绿电看价值与价值观
        </h1>
        <p class="hero-subtitle" ref="heroSub">
          高中政治统编版 必修四 第六课第一框<br/>
          当定日镜追上太阳的光，戈壁滩上升起绿色的电——<br/>
          在这场追光之旅中，我们一起探寻：什么是价值？什么是价值观？
        </p>
        <button class="hero-cta" ref="heroBtn" @click="scrollToSection('data')">
          开始探索 ↓
        </button>
      </div>
    </section>

    <!-- ===== DATA SECTION ===== -->
    <section id="data" class="section">
      <span class="section-label" ref="dataLabel">CASE STUDY</span>
      <h2 class="section-title" ref="dataTitle">敦煌：戈壁滩上的"超级光热电站"</h2>
      <p class="section-desc" ref="dataDesc">
        在甘肃敦煌的戈壁滩上，一座百兆瓦级熔盐塔式光热电站巍然矗立。
        1 万多面定日镜如向日葵般追逐太阳，将阳光汇聚到塔顶，化光为热、化热为电。
        这不是科幻——这是中国新能源团队的真实故事，也是我们今天探讨"价值与价值观"的生动案例。
      </p>
      <div class="data-grid">
        <div class="data-card" v-for="(card, idx) in dataCards" :key="idx" :ref="el => dataCardRefs[idx] = el">
          <div class="icon">{{ card.icon }}</div>
          <div class="value">
            <span :ref="el => counterRefs[idx] = el">0</span>
          </div>
          <div class="unit">{{ card.unit }}</div>
          <div class="label">{{ card.label }}</div>
        </div>
      </div>
    </section>

    <!-- ===== VALUE MEANING ===== -->
    <section id="concept" class="section">
      <span class="section-label">CONCEPT 01</span>
      <h2 class="section-title">什么是价值？——从"追光"说起</h2>
      <p class="section-desc">
        哲学意义上的"价值"不是价格，而是客体能够满足主体需要的属性。
        定日镜追光，是因为阳光能满足发电的需要；人类开发绿电，是因为能源能满足发展的需要。
        点击卡片，翻转揭示答案。
      </p>
      <div class="flip-grid">
        <div v-for="(card, idx) in flipCards" :key="idx"
          class="flip-card" :class="{ flipped: flippedCards[idx] }"
          @click="toggleFlip(idx)">
          <div class="flip-card-inner">
            <div class="flip-card-face flip-card-front">
              <div class="card-icon">{{ card.icon }}</div>
              <div class="card-title">{{ card.title }}</div>
              <div class="card-hint">👆 点击翻转</div>
            </div>
            <div class="flip-card-face flip-card-back">
              <div class="card-body">{{ card.body }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== VALUES GUIDANCE ===== -->
    <section id="guidance" class="section">
      <span class="section-label">CONCEPT 02</span>
      <h2 class="section-title">价值观的导向作用——追光团队的故事</h2>
      <p class="section-desc">
        敦煌光热电站背后的研发团队，用十余年坚守诠释了价值观如何引导人生选择。
        他们的故事，正是"价值观导向作用"的鲜活注脚。
      </p>
      <div class="story-container">
        <div class="team-card" ref="teamCard">
          <div class="team-name">🏔️ 敦煌光热研发团队</div>
          <div class="team-role">中国新能源追光者 · 2010—至今</div>
          <p class="team-quote">
            "戈壁滩上夏天 50°C，冬天 -30°C，沙尘暴一来什么都看不见。
            但我们相信，每一面定日镜对准太阳的角度，
            就是我们对绿色未来投出的选票。"
          </p>
        </div>
        <div class="team-timeline">
          <div class="timeline-item" v-for="(item, idx) in timeline" :key="idx" :ref="el => timelineRefs[idx] = el">
            <div class="time">{{ item.time }}</div>
            <div class="event">{{ item.event }}</div>
            <div class="desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== VALUE MAP ===== -->
    <section id="values" class="section">
      <span class="section-label">CONCEPT 03</span>
      <h2 class="section-title">社会主义核心价值观的三个层面</h2>
      <p class="section-desc">
        定日镜从三个维度追光——国家层面、社会层面、个人层面。
        社会主义核心价值观同样从三个层面指引我们"追光前行"。
        点击卡片展开详情，看看绿电案例如何与之对应。
      </p>
      <div class="value-map-grid">
        <div v-for="(card, idx) in valueMapCards" :key="idx"
          class="value-map-card" :class="{ expanded: expandedCards[idx] }"
          @click="toggleExpand(idx)">
          <div class="vm-level">{{ card.level }}</div>
          <div class="vm-title">{{ card.title }}</div>
          <div class="vm-content">{{ card.content }}</div>
          <div class="vm-toggle">{{ expandedCards[idx] ? '收起 ↑' : '展开 ↓' }}</div>
        </div>
      </div>
    </section>

    <!-- ===== AI WORKSHOP ===== -->
    <section id="ai" class="section">
      <span class="section-label">AI WORKSHOP</span>
      <h2 class="section-title">AI 赋能工作坊：我是价值分析员</h2>
      <p class="section-desc">
        现在，你是一名"价值分析员"。请选择一个分析维度，
        AI 助手将帮你从敦煌光热电站案例中提取价值与价值观的关键信息。
        看看 AI 如何帮我们深化理解——同时也要思考：AI 的分析够不够？还需补充什么？
      </p>
      <div class="ai-workshop" ref="aiWorkshop">
        <div class="ai-prompt-box">
          <div class="prompt-label">📋 分析任务</div>
          <div class="prompt-text">
            案例：敦煌百兆瓦光热电站——1万面定日镜追光发电，年减碳35万吨。<br/>
            任务：从以下维度分析该案例体现的"价值"与"价值观"。<br/>
            请选择维度 →
          </div>
        </div>
        <div class="ai-buttons">
          <button v-for="(dim, idx) in aiDimensions" :key="idx"
            class="ai-btn" :class="{ active: activeDim === idx }"
            @click="runAIAnalysis(idx)">
            {{ dim.label }}
          </button>
        </div>
        <div class="ai-response" :class="{ visible: aiVisible }">
          <span class="ai-tag">AI 分析结果</span>
          <div ref="aiResponseText"></div>
        </div>
      </div>
    </section>

    <!-- ===== KNOWLEDGE MAP ===== -->
    <section id="summary" class="section">
      <span class="section-label">SUMMARY</span>
      <h2 class="section-title">知识图谱小结</h2>
      <p class="section-desc">一图回顾本课核心知识结构。</p>
      <div class="knowledge-map">
        <div v-for="(node, idx) in knowledgeNodes" :key="idx" class="km-node"
          :ref="el => kmRefs[idx] = el">
          <div class="km-icon" :style="{ background: node.bg }">{{ node.icon }}</div>
          <div class="km-text"><strong>{{ node.title }}</strong> — {{ node.text }}</div>
        </div>
      </div>
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="footer">
      <p><strong>追光的镜子</strong> · 高中政治统编版必修四 · 第六课第一框 · 价值与价值观</p>
      <p style="margin-top:8px;">AI 赋能教学公开课 · 案例素材基于敦煌光热电站公开报道整理</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ===== NAV =====
const navLinks = [
  { id: 'hero', label: '首页' },
  { id: 'data', label: '案例' },
  { id: 'concept', label: '价值' },
  { id: 'guidance', label: '导向' },
  { id: 'values', label: '价值观' },
  { id: 'ai', label: 'AI 工作坊' },
  { id: 'summary', label: '小结' },
]
const activeSection = ref('hero')
function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) {
    const offset = 60
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// ===== HERO REFS =====
const heroTag = ref(null)
const heroTitle = ref(null)
const heroSub = ref(null)
const heroBtn = ref(null)
const sunRef = ref(null)
const sunCoreRef = ref(null)
const towerGlowRef = ref(null)
const mirrorRefs = ref([])

// ===== DATA CARDS =====
const dataCards = [
  { icon: '🔋', value: 100, unit: 'MW', label: '装机容量（百兆瓦级）' },
  { icon: '🪞', value: 11989, unit: '面', label: '定日镜数量' },
  { icon: '⚡', value: 3.9, unit: '亿kWh', label: '年发电量' },
  { icon: '🌍', value: 35, unit: '万吨', label: '年减排CO₂' },
  { icon: '🏠', value: 50, unit: '万户', label: '可供电家庭数' },
  { icon: '⏱️', value: 24, unit: '小时', label: '熔盐储能持续发电' },
]
const dataCardRefs = ref([])
const counterRefs = ref([])

// ===== FLIP CARDS =====
const flipCards = [
  { icon: '☀️', title: '阳光的价值', body: '阳光本身是自然资源。当人类掌握了光热发电技术，阳光就能满足人类对清洁能源的需要——这时阳光对人类就有了价值。价值是客体的积极功能属性与主体需要的满足关系。' },
  { icon: '🔧', title: '技术的价值', body: '定日镜追光技术使阳光→热能→电能的转化成为可能。技术作为客体，满足了人类对绿色发展的需要。价值离不开人的需要，也离不开客体的属性——两者缺一不可。' },
  { icon: '🌿', title: '绿电的价值', body: '绿电减少了碳排放，满足了可持续发展的需要。这体现了价值的社会历史性——在气候变化时代，"绿色"本身成为新的价值维度，这是时代赋予的新内涵。' },
  { icon: '💎', title: '人的价值', body: '追光团队十年坚守，创造了巨大社会价值。人的价值在于创造价值——人既是价值的享受者，更是价值的创造者。人的价值是自我价值与社会价值的统一。' },
]
const flippedCards = reactive([false, false, false, false])
function toggleFlip(idx) {
  flippedCards[idx] = !flippedCards[idx]
}

// ===== TEAM TIMELINE =====
const timeline = [
  { time: '2010', event: '项目立项', desc: '团队首次进入敦煌戈壁勘察，面对"无人区"的严酷环境' },
  { time: '2014', event: '技术突破', desc: '攻克熔盐传热储热核心难题，实现自主知识产权' },
  { time: '2016', event: '示范电站建成', desc: '10MW示范电站并网发电，验证技术路线可行性' },
  { time: '2018', event: '百兆瓦级投运', desc: '100MW电站全面投运，成为亚洲最大光热电站' },
  { time: '2023', event: '持续优化', desc: '团队坚守戈壁十余年，定日镜效率提升至94%' },
]
const timelineRefs = ref([])
const teamCard = ref(null)

// ===== VALUE MAP =====
const valueMapCards = [
  {
    level: '国家层面',
    title: '富强 · 文明',
    content: '敦煌光热电站年发电3.9亿kWh，助力国家能源安全与"双碳"目标。从"跟跑"到"领跑"，中国光热技术走向世界，体现国家富强的科技支撑。同时，绿色能源代表生态文明，是"文明"在新时代的内涵延伸。'
  },
  {
    level: '社会层面',
    title: '和谐 · 公正',
    content: '绿电惠及50万户家庭，缩小东西部能源差距。电站建设带动当地就业，促进民族团结与区域协调。清洁能源替代火电，保障代际公平——我们这一代不留碳债给下一代。'
  },
  {
    level: '个人层面',
    title: '敬业 · 爱国',
    content: '追光团队十年坚守戈壁，从-30°C到50°C，以极致的敬业精神攻克技术难关。他们把个人理想融入国家新能源战略，用行动诠释了"爱国"不是口号，是把每一面镜子调到最佳角度的执着。'
  },
]
const expandedCards = reactive([false, false, false])
function toggleExpand(idx) {
  expandedCards[idx] = !expandedCards[idx]
}

// ===== AI WORKSHOP =====
const aiDimensions = [
  {
    label: '🔍 价值的含义',
    text: '从敦煌光热电站案例中，我们可以提取以下关于"价值"的关键信息：\n\n① 价值的客体：阳光（自然资源）、技术（定日镜+熔盐）、绿电（产品）\n② 价值的主体：人类社会——对清洁能源、可持续发展、碳减排的需要\n③ 价值的关系：阳光→满足发电需要→有能源价值；绿电→满足环保需要→有生态价值\n\n核心结论：价值是客体属性与主体需要的满足关系。没有人的需要，阳光只是阳光；有了人的需要和技术的中介，阳光就成了"绿色能源"。这体现了价值的客观性（客体真实存在）与主体性（因人的需要而显现）的统一。'
  },
  {
    label: '🧭 价值观导向',
    text: '从追光团队的故事中，我们可以提取以下关于"价值观导向作用"的关键信息：\n\n① 认识导向：团队坚信"绿色能源是未来"——这一价值观引导他们认识到了光热技术的战略意义，在别人看不到前景时坚持投入。\n② 行动导向：价值观转化为十年坚守的行动——50°C酷暑、-30°C严寒、沙尘暴中调整定日镜角度。价值观不是空话，是实实在在的选择。\n③ 人生选择：团队成员放弃大城市舒适生活，选择扎根戈壁——价值观引导了人生道路的选择，把个人价值融入社会价值。\n\n核心结论：价值观影响着人们的认识活动和实践活动，影响着人生道路的选择。追光团队的价值观——"为绿色未来而坚守"——正是他们十年不放弃的精神支柱。'
  },
  {
    label: '🇨🇳 核心价值观',
    text: '从敦煌光热电站案例中，我们可以提取社会主义核心价值观的三个层面映射：\n\n【国家层面】富强——百兆瓦级电站为国家能源安全提供支撑；文明——绿色能源代表生态文明新内涵\n【社会层面】和谐——东西部能源互补、带动地方就业；公正——清洁能源保障代际公平，当代人不给后代留碳债\n【个人层面】敬业——十年坚守戈壁的极致追求；爱国——把个人理想融入国家新能源战略\n\n核心结论：社会主义核心价值观不是抽象口号，它就在每一面追光的镜子中，在每一位追光者的坚守中。从敦煌戈壁到国家战略，价值观三个层面的统一，构成了中国绿色发展的精神坐标。'
  },
  {
    label: '🤖 AI的局限',
    text: 'AI 分析到此，但请同学们思考——AI 的分析有什么局限？\n\n① AI 能识别"价值"的逻辑结构（客体-主体-关系），但难以体会追光者在-30°C寒夜坚守时内心的信念与感动。\n② AI 能总结"价值观导向作用"的三层含义，但不能替代你自己在生活中面对选择时的价值判断。\n③ AI 的分析基于已有数据，但价值的创造需要人的实践——AI 说不出"下一面定日镜该怎么改进"。\n\n核心启示：AI 是强大的分析工具，能帮我们快速梳理知识结构。但价值判断、价值选择、价值创造，最终需要人来完成。这也是为什么这堂课叫"AI 赋能"而不是"AI 替代"——赋能的是工具，追光的永远是人。'
  },
]
const activeDim = ref(-1)
const aiVisible = ref(false)
const aiResponseText = ref(null)
let typingTween = null

function runAIAnalysis(idx) {
  activeDim.value = idx
  aiVisible.value = true
  const container = aiResponseText.value
  if (!container) return
  // Kill previous typing
  if (typingTween) typingTween.kill()
  container.innerHTML = '<span class="typing-cursor"></span>'
  const text = aiDimensions[idx].text
  const cursor = container.querySelector('.typing-cursor')
  let i = 0
  // Use gsap to simulate typing
  const obj = { progress: 0 }
  typingTween = gsap.to(obj, {
    progress: 1,
    duration: 2.5,
    ease: 'none',
    onUpdate: () => {
      const targetLen = Math.floor(obj.progress * text.length)
      const currentText = text.substring(0, targetLen)
      // Replace \n with <br>
      container.innerHTML = currentText.replace(/\n/g, '<br>') + '<span class="typing-cursor"></span>'
    },
    onComplete: () => {
      container.innerHTML = text.replace(/\n/g, '<br>')
    }
  })
}

// ===== KNOWLEDGE MAP =====
const knowledgeNodes = [
  { icon: '☀️', title: '价值', text: '客体属性满足主体需要的积极功能属性（如阳光满足发电需要）', bg: 'rgba(255,179,71,0.15)' },
  { icon: '📊', title: '价值的特性', text: '客观性（客体真实存在）+ 主体性（因人的需要而显现）+ 社会历史性（随时代变化）', bg: 'rgba(96,165,250,0.15)' },
  { icon: '🧭', title: '价值观', text: '对价值的总的看法和根本观点（如"绿色能源是未来"）', bg: 'rgba(167,139,250,0.15)' },
  { icon: '➡️', title: '导向作用', text: '引导认识活动 + 引导实践活动 + 引导人生道路选择', bg: 'rgba(56,225,212,0.15)' },
  { icon: '🇨🇳', title: '核心价值观', text: '国家层面（富强文明）+ 社会层面（和谐公正）+ 个人层面（敬业爱国）', bg: 'rgba(255,87,87,0.15)' },
  { icon: '🤖', title: 'AI 赋能', text: 'AI 是分析工具，价值判断与创造仍需人来完成', bg: 'rgba(52,232,158,0.15)' },
]
const kmRefs = ref([])

// ===== SCROLL SPY =====
let scrollListener = null
function setupScrollSpy() {
  scrollListener = () => {
    const sections = ['hero', 'data', 'concept', 'guidance', 'values', 'ai', 'summary']
    for (const id of sections) {
      const el = document.getElementById(id)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.top <= 120 && rect.bottom >= 120) {
        activeSection.value = id
        break
      }
    }
  }
  window.addEventListener('scroll', scrollListener)
}

// ===== ANIMATIONS =====
function setupAnimations() {
  // Hero entrance
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  heroTl
    .from(heroTag.value, { y: 30, autoAlpha: 0, duration: 0.6 })
    .from(heroTitle.value, { y: 40, autoAlpha: 0, duration: 0.8 }, '-=0.3')
    .from(heroSub.value, { y: 30, autoAlpha: 0, duration: 0.6 }, '-=0.4')
    .from(heroBtn.value, { y: 20, autoAlpha: 0, duration: 0.5 }, '-=0.3')
    .from('.hero-bg-grid', { autoAlpha: 0, duration: 1 }, 0)

  // Sun pulsing
  gsap.to([sunRef.value, sunCoreRef.value], {
    scale: 1.15,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    transformOrigin: '100px 80px',
  })

  // Tower glow pulsing
  gsap.to(towerGlowRef.value, {
    scale: 1.3,
    autoAlpha: 0.3,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    transformOrigin: '600px 105px',
  })

  // Mirror shimmer
  mirrorRefs.value.forEach((el, i) => {
    if (!el) return
    gsap.to(el, {
      autoAlpha: 0.6,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.2,
    })
  })

  // Data section entrance
  gsap.from([dataLabel.value, dataTitle.value, dataDesc.value], {
    scrollTrigger: {
      trigger: '#data',
      start: 'top 80%',
    },
    y: 40,
    autoAlpha: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
  })

  // Data cards entrance + counter animation
  ScrollTrigger.create({
    trigger: '.data-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.from(dataCardRefs.value, {
        y: 60,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.4)',
      })
      // Count up animation for each card
      dataCards.forEach((card, idx) => {
        const el = counterRefs.value[idx]
        if (!el) return
        const obj = { val: 0 }
        gsap.to(obj, {
          val: card.value,
          duration: 2,
          ease: 'power2.out',
          delay: idx * 0.1,
          onUpdate: () => {
            const v = obj.val
            el.textContent = v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1)
          },
        })
      })
    },
  })

  // Concept section
  gsap.from('#concept .section-label, #concept .section-title, #concept .section-desc', {
    scrollTrigger: { trigger: '#concept', start: 'top 80%' },
    y: 40,
    autoAlpha: 0,
    stagger: 0.15,
    duration: 0.8,
  })

  gsap.from('.flip-card', {
    scrollTrigger: { trigger: '.flip-grid', start: 'top 80%' },
    y: 60,
    autoAlpha: 0,
    stagger: 0.12,
    duration: 0.6,
    ease: 'back.out(1.4)',
  })

  // Guidance section
  gsap.from('#guidance .section-label, #guidance .section-title, #guidance .section-desc', {
    scrollTrigger: { trigger: '#guidance', start: 'top 80%' },
    y: 40,
    autoAlpha: 0,
    stagger: 0.15,
    duration: 0.8,
  })

  gsap.from(teamCard.value, {
    scrollTrigger: { trigger: '.story-container', start: 'top 75%' },
    x: -60,
    autoAlpha: 0,
    duration: 0.8,
    ease: 'power3.out',
  })

  gsap.from(timelineRefs.value, {
    scrollTrigger: { trigger: '.team-timeline', start: 'top 80%' },
    x: 60,
    autoAlpha: 0,
    stagger: 0.15,
    duration: 0.6,
  })

  // Values section
  gsap.from('#values .section-label, #values .section-title, #values .section-desc', {
    scrollTrigger: { trigger: '#values', start: 'top 80%' },
    y: 40,
    autoAlpha: 0,
    stagger: 0.15,
    duration: 0.8,
  })

  gsap.from('.value-map-card', {
    scrollTrigger: { trigger: '.value-map-grid', start: 'top 80%' },
    y: 60,
    autoAlpha: 0,
    stagger: 0.15,
    duration: 0.6,
    ease: 'back.out(1.4)',
  })

  // AI workshop
  gsap.from('.ai-workshop', {
    scrollTrigger: { trigger: '.ai-workshop', start: 'top 80%' },
    y: 60,
    autoAlpha: 0,
    duration: 0.8,
    ease: 'power3.out',
  })

  // Knowledge map
  gsap.from('#summary .section-label, #summary .section-title, #summary .section-desc', {
    scrollTrigger: { trigger: '#summary', start: 'top 80%' },
    y: 40,
    autoAlpha: 0,
    stagger: 0.15,
    duration: 0.8,
  })

  gsap.from(kmRefs.value, {
    scrollTrigger: { trigger: '.knowledge-map', start: 'top 80%' },
    x: -40,
    autoAlpha: 0,
    stagger: 0.1,
    duration: 0.5,
  })
}

// ===== DATA SECTION REFS (need to be after template) =====
const dataLabel = ref(null)
const dataTitle = ref(null)
const dataDesc = ref(null)

onMounted(async () => {
  await nextTick()
  setupScrollSpy()
  // Small delay to ensure DOM is fully ready
  setTimeout(() => {
    setupAnimations()
    ScrollTrigger.refresh()
  }, 100)
})

onUnmounted(() => {
  if (scrollListener) window.removeEventListener('scroll', scrollListener)
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>
