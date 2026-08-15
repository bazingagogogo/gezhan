import { useEffect, useRef, useState } from 'react'
import OptionWheel from './components/OptionWheel.jsx'
import ZoomableBoard from './components/ZoomableBoard.jsx'

/* ---------- 滚动进场动效 ---------- */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ---------- Hero 动态背景（Canvas 粒子网格，视频缺失时的兜底） ---------- */
function HeroCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w, h, raf
    let pts = []
    const mouse = { x: -9999, y: -9999 }

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio
      h = canvas.height = canvas.offsetHeight * devicePixelRatio
      const gap = 90 * devicePixelRatio
      pts = []
      for (let x = 0; x < w + gap; x += gap)
        for (let y = 0; y < h + gap; y += gap)
          pts.push({ ox: x, oy: y, x, y, ph: Math.random() * Math.PI * 2 })
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) * devicePixelRatio
      mouse.y = (e.clientY - r.top) * devicePixelRatio
    }
    window.addEventListener('mousemove', onMove)

    let t = 0
    const draw = () => {
      t += 0.008
      ctx.clearRect(0, 0, w, h)
      // 背景渐变光晕
      const g = ctx.createRadialGradient(w * 0.75, h * 0.3, 0, w * 0.75, h * 0.3, w * 0.5)
      g.addColorStop(0, 'rgba(58,76,140,0.20)')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      const R = 160 * devicePixelRatio
      for (const p of pts) {
        const dx = p.ox - mouse.x
        const dy = p.oy - mouse.y
        const d = Math.hypot(dx, dy)
        let ox = 0, oy = 0
        if (d < R) {
          const f = (1 - d / R) * 26 * devicePixelRatio
          ox = (dx / (d || 1)) * f
          oy = (dy / (d || 1)) * f
        }
        p.x = p.ox + ox + Math.sin(t + p.ph) * 3 * devicePixelRatio
        p.y = p.oy + oy + Math.cos(t * 0.8 + p.ph) * 3 * devicePixelRatio
        const near = d < R
        ctx.fillStyle = near ? 'rgba(25,141,255,0.8)' : 'rgba(255,255,255,0.14)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, (near ? 1.8 : 1.1) * devicePixelRatio, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0 }} />
}

/* ---------- 点击复制按钮（邮箱 / 手机号） ---------- */
function CopyButton({ value, className = '', children }) {
  const [ok, setOk] = useState(false)
  const timer = useRef(null)
  const copy = async (e) => {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setOk(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOk(false), 1600)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <button type="button" onClick={copy} className={`${className} copy-btn`} title="点击复制">
      {children}
      <span className={`copy-toast ${ok ? 'show' : ''}`}>已复制</span>
    </button>
  )
}

/* ---------- 导航 ---------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-pill">
        <a href="/#about">个人介绍</a>
        <a href="/#works">项目作品</a>
        <a href="/#top" className="nav-logo" aria-label="回到顶部">
          <img src="/images/logo.png" alt="许咏芳 Portfolio Logo" />
        </a>
        <a href="/#strengths">设计思考</a>
        <a href="/xuyongfang-portfolio.pdf" download="许咏芳-UIUX设计师-作品集.pdf">简历下载</a>
      </div>
    </nav>
  )
}

/* ---------- Hero ---------- */
function Hero() {
  const [videoOk, setVideoOk] = useState(true)
  return (
    <header className="hero" id="top">
      <div className="hero-media">
        {videoOk && (
          <video
            autoPlay muted loop playsInline
            style={{ position: 'absolute', inset: 0 }}
          >
            <source src="/hero-bg.mp4" type="video/mp4" onError={() => setVideoOk(false)} />
          </video>
        )}
        {!videoOk && <HeroCanvas />}
        <div className="hero-lines">
          <span style={{ left: '20%' }} />
          <span style={{ left: '40%' }} />
          <span style={{ left: '60%' }} />
          <span style={{ left: '80%' }} />
        </div>
        <div className="hero-film-grain" aria-hidden="true" />
      </div>
      <div className="wrap hero-content">
        <h1 className="hero-title">
          <span className="row"><span>
            我是许咏芳，
            <i className="t-img pill"><img src="/images/welink-cover.jpg" alt="WeLink 智能笔记" /></i>
            探索
          </span></span>
          <span className="row"><span>
            未来生产力工具的<em>体验边界</em>
          </span></span>
        </h1>
        <div className="hero-foot">
          <div className="hero-actions">
            <a className="btn-primary" href="/xuyongfang-portfolio.pdf" download="作品集-许咏芳-UXUI.pdf">下载PDF作品集</a>
            <CopyButton value="17611540569" className="btn-ghost">联系我</CopyButton>
          </div>
          <div className="hero-who">
            <span className="who-label">关于我</span>
            <p>
              <span className="who-star">✳</span> 我把视觉表达、产品思维和 AI 工作流揉成一套能落地的设计能力，
              擅长企业级 SaaS 与 AI 产品的体验设计 —— 不只输出高保真图，更参与决策。
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

/* ---------- 关于 / 经历（WORK EXPERIENCE 结构） ---------- */
function About() {
  const [activeExp, setActiveExp] = useState(0)
  const [visibleMessages, setVisibleMessages] = useState(1)
  const chatRef = useRef(null)
  const wheelLockRef = useRef(false)
  const wheelDeltaRef = useRef(0)
  const releaseTimerRef = useRef(null)
  const messageCountRef = useRef(visibleMessages)
  const profileMessages = [
    { type: 'system', text: '你好，我是许咏芳的个人介绍助手。' },
    { type: 'answer', text: '我是一名聚焦企业级 SaaS 与 AI 产品的 UI/UX 设计师。' },
    { type: 'question', text: '你擅长什么？' },
    { type: 'answer', text: '擅长从 0 到 1 梳理复杂产品，将用户研究、信息架构、交互与视觉统一到可落地的体验中。' },
    { type: 'question', text: '最近在做什么？' },
    { type: 'answer', text: '正在探索 AI 智能笔记、B/C 端组件库和数据驱动的产品设计。' },
    { type: 'answer', text: '我相信设计不只是画面，而是把复杂的事情变得清晰、高效且有记忆点。' },
  ]
  const displayMessages = profileMessages.slice(1)
  useEffect(() => { messageCountRef.current = visibleMessages }, [visibleMessages])
  useEffect(() => {
    const onWheel = (event) => {
      const panel = document.querySelector('.profile-interface')
      if (!panel) return
      const rect = panel.getBoundingClientRect()
      const nav = document.querySelector('.nav-pill')
      const targetTop = (nav?.getBoundingClientRect().bottom || 0) + 80
      const inHoldZone = rect.top <= targetTop + 120 && rect.bottom >= Math.min(window.innerHeight - 32, targetTop + 260)
      if (!inHoldZone) return

      const direction = Math.sign(event.deltaY)
      const atEnd = visibleMessages >= displayMessages.length
      const atStart = visibleMessages <= 1
      if ((direction > 0 && atEnd) || (direction < 0 && atStart) || direction === 0) return

      event.preventDefault()
      wheelDeltaRef.current += Math.min(Math.abs(event.deltaY), 100)
      if (wheelLockRef.current || wheelDeltaRef.current < 18) return
      wheelDeltaRef.current = 0
      wheelLockRef.current = true
      setVisibleMessages((count) => {
        const next = Math.max(1, Math.min(count + direction, displayMessages.length))
        if (next >= displayMessages.length) {
          window.clearTimeout(releaseTimerRef.current)
          releaseTimerRef.current = window.setTimeout(() => { wheelLockRef.current = false }, 120)
        }
        return next
      })
      window.setTimeout(() => { wheelLockRef.current = false }, 110)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.clearTimeout(releaseTimerRef.current)
    }
  }, [visibleMessages, displayMessages.length])
  useEffect(() => {
    if (!chatRef.current) return
    chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [visibleMessages])
  const exps = [
    { period: '2024.02 — 至今', co: '软通动力', role: 'UI 设计师', desc: '企业级 SaaS 产品设计（邮件 / 笔记 / 搜索 / 云知识），主导 AI 智能笔记的交互与视觉落地。' },
    { period: '2023.09 — 2023.12', co: '深圳壹木航科技', role: '产品助理实习', desc: '参与产品需求梳理与交互支持，协助从 0 到 1 搭建功能流程。' },
    { period: '2022.09 — 2022.11', co: 'Flat Incubator', role: '设计助理实习', desc: '负责视觉与品牌设计支持，输出运营视觉与素材规范。', dim: true },
  ]
  return (
    <section className="section about-cinematic" id="about">
      <div className="about-aurora" aria-hidden="true" />
      <div className="wrap about-shell">
        <div className="about-stage">
          <div className="about-copy reveal">
            <span className="section-index">01 / ABOUT ME</span>
            <h2>从想法到落地，<br />设计不只是画面</h2>
            <p>
              我是许咏芳，一名聚焦企业级 SaaS 与 AI 产品的设计师。
              我把视觉表达、产品思维和 AI 工作流组合起来，让复杂工具更清晰、更高效，也更有记忆点。
            </p>
            <div className="about-actions">
              <a className="about-cta solid" href="#works">查看项目 <span>↗</span></a>
              <CopyButton value="1403790559@qq.com" className="about-cta btn-ghost">联系我 <span>↗</span></CopyButton>
            </div>
          </div>

          <div className="profile-interface liquid-glass reveal" aria-label="许咏芳的个人介绍">
            <div className="profile-windowbar">
            </div>
            <div className="profile-columns">
              <div className="profile-chat">
                <div className="profile-chat-head">
                  <span className="profile-avatar">XYF</span>
                  <span><strong>个人助手</strong><small>上下滚动查看更多信息</small></span>
                </div>
                <div className="profile-chat-scroll" ref={chatRef}>
                  {displayMessages.slice(0, visibleMessages).map((message, index) => (
                    <div className={`profile-bubble ${message.type}`} key={`${message.type}-${index}`}>
                      {message.text}
                    </div>
                  ))}
                  {visibleMessages < displayMessages.length && <span className="typing-dots"><i /><i /><i /></span>}
                </div>
                <div className="profile-input"><span>继续了解我…</span><b>↑</b></div>
              </div>
              <div className="profile-video-placeholder">
                <img src="/images/personal-video-cover.png" alt="个人视频封面" />
                <div className="video-placeholder-glow" />
                <button type="button" aria-label="个人视频占位">▶</button>
              </div>
            </div>
          </div>
        </div>

        <div className="about-experience-shell liquid-glass reveal">
          <div className="experience-heading"><span>WORK EXPERIENCE</span><small>2022 — NOW</small></div>
          <div className="about-experience">
            {exps.map((e, index) => (
              <div
                className={`experience-card ${activeExp === index ? 'active' : ''}`}
                key={e.co}
                onMouseEnter={() => setActiveExp(index)}
              >
                <span className="experience-period">{e.period}</span>
                <h3>{e.co}</h3>
                <span className="experience-role">{e.role}</span>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 精选项目（GAM 式排版） ---------- */
const WORKS = [
  {
    idx: '(01)',
    title: 'WeLink 智能笔记',
    desc: 'AI 增强的企业知识管理工具。通过智能结构化与上下文关联，解决信息碎片化与团队知识孤岛问题 —— 将核心操作路径缩短 40%，信息查找效率提升 60%，助力个人与组织高效沉淀、流转知识资产。',
    cols: [
      { k: '行业', v: '企业级 SaaS' },
      { k: '平台', v: '移动端 + PC' },
      { k: '交付', v: '交互 / 视觉 / 组件库' },
      { k: '年份', v: '2024 — 2026' },
    ],
    tag: 'AI / KNOWLEDGE',
    image: '/images/welink-project-cover.png',
    href: '/projects/welink',
  },
  {
    idx: '(02)',
    title: '念屿 · 高校心理健康平台',
    desc: '面向高校大学生的心理健康线上平台。基于对校内心理咨询服务的深入研究，识别现有服务的痛点与机会点，通过数字化手段优化咨询预约与陪伴体验，平衡学校管理需求与学生实际诉求。',
    cols: [
      { k: '行业', v: '高校心理服务' },
      { k: '平台', v: '移动端' },
      { k: '交付', v: '服务设计 / 用户研究 / UI' },
      { k: '年份', v: '2023' },
    ],
    tag: 'SERVICE / WELLNESS',
    image: '/images/nianyu-cover.jpg',
    href: '/projects/nianyu',
  },
]

function Works() {
  return (
    <section className="section" id="works" style={{ background: 'var(--bg-elev)' }}>
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <span className="section-index">02 / SELECTED WORKS</span>
            <h2 className="section-title">精选项目</h2>
          </div>
          <p className="section-note">两个完整项目，体现我在用户洞察、流程梳理与界面表达上的综合能力。</p>
        </div>
        <div className="works works-gallery">
          {WORKS.map((w) => (
            <article className="work-card reveal" key={w.idx}>
              <a className="work-card-link" href={w.href} aria-label={`查看 ${w.title} 项目详情`} />
              <div className="work-visual">
                <img className="art-img" src={w.image} alt={w.title} />
                <div className="work-caption">
                  <h3>{w.title}</h3>
                  <span>{w.cols.find((item) => item.k === '年份')?.v}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function WelinkProject() {
  const [showProjectMenu, setShowProjectMenu] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => {
    const background = document.getElementById('project-background')
    if (!background) return
    const onScroll = () => setShowProjectMenu(background.getBoundingClientRect().top <= window.innerHeight * 0.72)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <main className="project-detail project-detail-welink">
      <header className="project-detail-bar">
        <a href="/" className="project-back"><img src="/icons/chevron-left.svg" alt="" aria-hidden="true" />返回主页</a>
        <span className="project-detail-name">WeLink · 智能笔记</span>
        <span className="project-detail-count">01 / SELECTED WORKS</span>
      </header>
      <div className={`project-option-wheel ${showProjectMenu ? 'is-visible' : ''}`}>
        <OptionWheel
          items={['项目封面', '项目背景', '核心洞察', '设计过程', '最终方案']}
          defaultSelected={0}
          textColor="#a6a6a6"
          activeColor="#ffffff"
          side="right"
          fontSize={1}
          spacing={1.55}
          curve={0.1}
          tilt={2}
          blur={1}
          fade={0.25}
          smoothing={200}
          inset={80}
          loop={false}
          draggable
          soundUrl="/sounds/click-soft.mp3"
          soundVolume={0.5}
          onChange={(index) => {
            const ids = ['project-cover', 'project-background', 'project-insight', 'project-process', 'project-solution']
            document.getElementById(ids[index])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        />
      </div>
      <section className="project-overview" aria-label="项目概览">
        <span className="project-overview-year">2024 — 2026</span>
        <h1>WeLink 智能笔记</h1>
        <p>面向企业协作场景的 AI 笔记升级，通过智能创作、知识关联与多触点推荐，<br />让碎片记录转化为可复用的知识资产。</p>
        <dl>
          <div><dt>我的角色</dt><dd>UI / UX 设计师</dd></div>
          <div><dt>负责内容</dt><dd>交互 · 视觉 · 组件库</dd></div>
          <div><dt>产品平台</dt><dd>移动端 + PC + 网页</dd></div>
        </dl>
      </section>
      <ZoomableBoard className="project-cover" id="project-cover" label="WeLink 智能笔记项目封面" src="/images/projects/welink/cover-01.png" alt="WeLink 智能笔记，云笔记全新智能升级" eager />
      <ZoomableBoard className="project-board project-board-background" id="project-background" label="WeLink 项目背景" src="/images/projects/welink/background-02.png" alt="WeLink 项目背景、行业困境与升级方向" />
      <ZoomableBoard className="project-board project-board-insight" id="project-insight" label="WeLink 核心洞察与北极星指标" src="/images/projects/welink/insight-03.png" alt="WeLink 北极星指标与用户产品体验触点" />
      <ZoomableBoard className="project-board project-board-process" id="project-process" label="WeLink 产品体验与用户触点分析" src="/images/projects/welink/process-04.png" alt="WeLink 知识循环系统、产品体验与用户触点分析" />
      <ZoomableBoard className="project-board project-board-journey" label="WeLink 用户体验旅程与痛点机会分析" src="/images/projects/welink/journey-05.png" alt="WeLink 用户体验旅程、痛点与设计机会分析" />
      <ZoomableBoard className="project-board project-board-deconstruction" label="WeLink 三阶段知识闭环" src="/images/projects/welink/deconstruction-06.png" alt="WeLink 三阶段知识闭环与设计思路" />
      <ZoomableBoard className="project-board project-board-immersive-journey" label="WeLink 沉浸式创作旅程" src="/images/projects/welink/immersive-journey-07.png" alt="WeLink 沉浸式创作旅程与痛点拆解" />
      <ZoomableBoard className="project-board project-board-immersive-solution" label="WeLink 沉浸式创作方案" src="/images/projects/welink/immersive-solution-08.png" alt="WeLink 沉浸式创作交互方案" />
      <ZoomableBoard className="project-board project-board-immersive-validation" label="WeLink 沉浸式创作验证" src="/images/projects/welink/immersive-validation-09.png" alt="WeLink 沉浸式创作设计难点与用户验证" />
      <ZoomableBoard className="project-board project-board-rebirth-insight" label="WeLink 智能再生洞察" src="/images/projects/welink/intelligent-rebirth-insight-10.png" alt="WeLink 智能再生用户洞察" />
      <ZoomableBoard className="project-board project-board-rebirth-solution" label="WeLink 智能再生方案" src="/images/projects/welink/intelligent-rebirth-solution-11.png" alt="WeLink 智能再生交互方案" />
      <ZoomableBoard className="project-board project-board-knowledge-transition" label="WeLink 协同流转承接" src="/images/projects/welink/knowledge-flow-transition-12.png" alt="WeLink 协同流转章节承接" />
      <ZoomableBoard className="project-board project-board-knowledge-solution" label="WeLink 协同流转方案" src="/images/projects/welink/knowledge-flow-solution-13.png" alt="WeLink 协同流转交互方案" />
      <ZoomableBoard className="project-board project-board-knowledge-scenarios" label="WeLink 协同流转场景" src="/images/projects/welink/knowledge-flow-scenarios-14.png" alt="WeLink 协同流转场景策略" />
      <ZoomableBoard className="project-board project-board-visual-intro" id="project-solution" label="WeLink 视觉推导" src="/images/projects/welink/visual-derivation-intro-15.png" alt="WeLink 视觉推导章节" />
      <ZoomableBoard className="project-board project-board-visual-language" label="WeLink 设计语言" src="/images/projects/welink/visual-language-16.png" alt="WeLink 设计语言与设计原则" />
      <ZoomableBoard className="project-board project-board-design-vision" label="WeLink 设计愿景" src="/images/projects/welink/design-vision-17.png" alt="WeLink 智能零感协作体验设计愿景" />
      <ZoomableBoard className="project-board project-board-symbol-exploration" label="WeLink 元素探索" src="/images/projects/welink/symbol-exploration-18.png" alt="WeLink 智能笔记图形元素探索" />
      <ZoomableBoard className="project-board project-board-visual-application" label="WeLink 视觉应用" src="/images/projects/welink/visual-application-19.png" alt="WeLink 视觉语言与界面应用" />
      <ZoomableBoard className="project-board project-board-visual-summary" label="WeLink 视觉总结" src="/images/projects/welink/visual-summary-20.png" alt="WeLink 视觉推导总结" />
      <ZoomableBoard className="project-board project-board-final-showcase" label="WeLink 最终成果" src="/images/projects/welink/final-showcase-21.png" alt="WeLink 最终设计成果展示" />
      <ZoomableBoard className="project-board project-board-page-exploration" label="WeLink 页面方案探索" src="/images/projects/welink/page-exploration-22.png" alt="WeLink 页面设计方案探索" />
      <ZoomableBoard className="project-board project-board-visual-strategy" label="WeLink 视觉策略" src="/images/projects/welink/visual-strategy-23.png" alt="WeLink 设计语言与核心场景" />
      <ZoomableBoard className="project-board project-board-home-design" label="WeLink 首页设计" src="/images/projects/welink/home-design-24.png" alt="WeLink 笔记首页设计思路" />
      <ZoomableBoard className="project-board project-board-home-comparison" label="WeLink 首页升级对比" src="/images/projects/welink/home-comparison-25.png" alt="WeLink 笔记首页升级前后对比" />
      <ZoomableBoard className="project-board project-board-editor-upgrade" label="WeLink 编辑页升级" src="/images/projects/welink/editor-upgrade-26.png" alt="WeLink 智能创作编辑页升级" />
      <ZoomableBoard className="project-board project-board-editor-comparison" label="WeLink 编辑页对比" src="/images/projects/welink/editor-comparison-27.png" alt="WeLink 编辑页面升级前后对比" />
      <ZoomableBoard className="project-board project-board-ai-dual-mode" label="WeLink AI 双模式" src="/images/projects/welink/ai-dual-mode-28.png" alt="WeLink AI 帮写与知识问答双模式" />
      <ZoomableBoard className="project-board project-board-search-paradigm" label="WeLink 搜索范式" src="/images/projects/welink/search-paradigm-29.png" alt="WeLink 关键词搜索与自然语言问答" />
      <ZoomableBoard className="project-board project-board-voice-intelligence" label="WeLink 语音智能处理" src="/images/projects/welink/voice-intelligence-30.png" alt="WeLink 实时语音智能处理" />
      <ZoomableBoard className="project-board project-board-team-intelligence" label="WeLink 团队智慧生命体" src="/images/projects/welink/team-intelligence-31.png" alt="WeLink 嵌入式智能协作空间" />
      <ZoomableBoard className="project-board project-board-knowledge-recommendation" label="WeLink 知识推荐系统" src="/images/projects/welink/knowledge-recommendation-32.png" alt="WeLink 多触点知识推荐系统" />
      <ZoomableBoard className="project-board project-board-sharing-value" label="WeLink 分享与价值反馈" src="/images/projects/welink/sharing-value-33.png" alt="WeLink 分层分享与价值反馈" />
      <ZoomableBoard className="project-board project-board-closing" label="WeLink 项目结束" src="/images/projects/welink/closing-45.png" alt="WeLink 项目感谢观看" />
      <button className="project-to-top" type="button" aria-label="返回顶部" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span aria-hidden="true">↑</span>
      </button>
    </main>
  )
}

function NianyuProject() {
  const [showProjectMenu, setShowProjectMenu] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const background = document.getElementById('project-background')
    if (!background) return
    const onScroll = () => setShowProjectMenu(background.getBoundingClientRect().top <= window.innerHeight * 0.72)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="project-detail project-detail-nianyu">
      <header className="project-detail-bar">
        <a href="/" className="project-back"><img src="/icons/chevron-left.svg" alt="" aria-hidden="true" />返回主页</a>
        <span className="project-detail-name">念屿 · 高校心理健康平台</span>
        <span className="project-detail-count">02 / SELECTED WORKS</span>
      </header>

      <div className={`project-option-wheel ${showProjectMenu ? 'is-visible' : ''}`}>
        <OptionWheel
          items={['项目封面', '项目背景', '核心洞察', '设计方案', '项目复盘']}
          defaultSelected={0}
          textColor="#a6a6a6"
          activeColor="#ffffff"
          side="right"
          fontSize={1}
          spacing={1.55}
          curve={0.1}
          tilt={2}
          blur={1}
          fade={0.25}
          smoothing={200}
          inset={80}
          loop={false}
          draggable
          soundUrl="/sounds/click-soft.mp3"
          soundVolume={0.5}
          onChange={(index) => {
            const ids = ['project-cover', 'project-background', 'project-insight', 'project-process', 'project-solution']
            document.getElementById(ids[index])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        />
      </div>

      <section className="project-overview" aria-label="项目概览">
        <span className="project-overview-year">2023</span>
        <h1>念屿 · 高校心理健康平台</h1>
        <p>面向高校大学生的心理健康服务平台，通过智能匹配、隐私保护、持续档案与快速求助机制，连接线上咨询和线下服务，让心理支持更专业、更及时，也更有温度。</p>
        <dl>
          <div><dt>我的角色</dt><dd>UI / UX 设计师</dd></div>
          <div><dt>负责内容</dt><dd>用户研究 · 服务设计 · UI</dd></div>
          <div><dt>产品平台</dt><dd>移动端</dd></div>
        </dl>
      </section>

      <ZoomableBoard className="project-cover" id="project-cover" label="念屿项目封面" src="/images/projects/nianyu/cover-01.png" alt="念屿高校心理健康平台项目封面" eager />
      <ZoomableBoard className="project-board project-board-background" id="project-background" label="念屿项目背景" src="/images/projects/nianyu/background-02.png" alt="念屿心理咨询平台项目背景与服务生态" />
      <ZoomableBoard className="project-board project-board-insight" id="project-insight" label="念屿核心洞察" src="/images/projects/nianyu/journey-03.png" alt="念屿核心设计挑战、用户旅程与机会点" />
      <ZoomableBoard className="project-board project-board-process" id="project-process" label="念屿在线预约方案" src="/images/projects/nianyu/appointment-04.png" alt="念屿高效在线心理咨询预约方案" />
      <ZoomableBoard className="project-board" label="念屿隐私与线下服务" src="/images/projects/nianyu/privacy-service-05.png" alt="念屿隐私保护与线上线下咨询服务体验" />
      <ZoomableBoard className="project-board" label="念屿心理档案" src="/images/projects/nianyu/profile-tracking-06.png" alt="念屿专业心理档案分析与持续追踪" />
      <ZoomableBoard className="project-board" label="念屿快速求助" src="/images/projects/nianyu/emergency-support-07.png" alt="念屿一键快速求助与自救方案" />
      <ZoomableBoard className="project-board" id="project-solution" label="念屿项目复盘" src="/images/projects/nianyu/role-reflection-08.png" alt="念屿项目角色、设计过程与项目复盘" />
      <ZoomableBoard className="project-board project-board-closing" label="念屿项目结束" src="/images/projects/nianyu/closing-09.png" alt="念屿项目感谢观看" />

      <button className="project-to-top" type="button" aria-label="返回顶部" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span aria-hidden="true">↑</span>
      </button>
    </main>
  )
}

/* ---------- 更多项目（编号列表 + 悬停出图） ---------- */
const MORE = [
  { no: '(01)', h: '寺庙 · 场景渲染', p: '暗夜东方建筑场景的建模、材质、灯光与氛围表达。', img: '/images/more-projects/01-temple.png' },
  { no: '(02)', h: '智能手环 · 产品设计', p: '智能穿戴设备的产品造型、材质与动态视觉呈现。', img: '/images/more-projects/02-bracelet.png' },
  { no: '(03)', h: '机械手臂 · 动态实验', p: '机械装置与磨砂颗粒语言结合的循环动画实验。', img: '/images/more-projects/03-robot-arm.gif' },
  { no: '(04)', h: '破碎 Logo · 动效设计', p: '围绕品牌标识展开的破碎、聚合与循环动态探索。', img: '/images/more-projects/04-logo.gif' },
  { no: '(05)', h: '安克开学季 · 视觉设计', p: '面向海外开学季活动的电商主视觉与营销表达。', img: '/images/more-projects/05-back-to-school.png' },
]

function MoreWorks() {
  const [activeMore, setActiveMore] = useState(0)
  const cardRefs = useRef([])
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveMore(Number(entry.target.dataset.index))
      })
    }, { threshold: 0.58 })
    cardRefs.current.forEach((card) => card && observer.observe(card))
    return () => observer.disconnect()
  }, [])
  return (
    <section className="section gallery-section" id="more">
      <div className="wrap more-layout">
        <aside className="more-sticky reveal">
          <div className="more-sticky-top">
            <span className="section-index">03 / MORE WORKS</span>
            <h2 className="section-title">更多项目</h2>
            <p className="section-note">过程稿与界面呈现，让设计逻辑更清晰。</p>
            <nav className="more-nav" aria-label="更多项目导航">
              {MORE.map((m, index) => (
                <button className={activeMore === index ? 'active' : ''} key={m.no} onClick={() => cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>{m.h}</button>
              ))}
            </nav>
          </div>
        </aside>
        <div className="more-cards">
          {MORE.map((m, index) => (
            <article className="more-feature-card reveal" data-index={index} ref={(node) => { cardRefs.current[index] = node }} key={m.no}>
              <span className="more-mark">✦</span>
              <div className="more-card-heading"><h3>{m.h}</h3></div>
              <div className="more-card-media"><img src={m.img} alt={m.h} /></div>
              <p>{m.p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- 个人优势（2+3 卡片 + 品牌插图） ---------- */
const STRENGTHS = [
  {
    no: '01', tag: 'CORE', h: '全链路设计', img: '/images/strengths/fullstack.png',
    chips: ['交互拆解到视觉落地', '全链路决策', '体验一致性与落地效率'],
  },
  {
    no: '02', tag: 'CORE', h: '视觉语言搭建', img: '/images/strengths/visual.png',
    chips: ['品牌视觉语言构建与落地', '平面 / 3D / 动效', '视觉规范与延展'],
  },
  {
    no: '03', tag: 'SYSTEM', h: 'AI 设计提效', img: '/images/strengths/ai.png',
    chips: ['AI 辅助竞品分析与洞察', '初稿原型快速验证', '测试归纳总结'],
  },
  {
    no: '04', tag: 'SYSTEM', h: '用户研究', img: '/images/strengths/research.png',
    chips: ['用户画像与旅程地图绘制', '访谈与可用性测试', '洞察驱动设计机会点'],
  },
  {
    no: '05', tag: 'SYSTEM', h: '跨职能协作', img: '/images/strengths/collab.png',
    chips: ['高效沟通推进产品落地', 'B/C 端双端组件库', '产品数据验证分析'],
  },
]

function Strengths() {
  return (
    <section className="section" id="strengths">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <span className="section-index">04 / STRENGTHS</span>
            <h2 className="section-title">我能做的事</h2>
          </div>
          <p className="section-note">与其观望 AI，不如先动手试 —— 试了才知道哪里是真的深。</p>
        </div>
        <div className="strength-grid">
          {STRENGTHS.map((s) => (
            <div className="strength-card reveal" key={s.no}>
              <div className="sc-top">
                <span className="sc-no">{s.no}</span>
                <span className="sc-tag">{s.tag}</span>
              </div>
              <h4>{s.h}<span className="dot">.</span></h4>
              <div className="sc-art"><img src={s.img} alt="" /></div>
              <div className="sc-chips">
                {s.chips.map((c, j) => (
                  <span
                    key={c}
                    className={`chip ${j % 2 === 1 ? 'dark' : ''}`}
                    style={{ '--r': `${(j % 2 === 0 ? -1 : 1) * (3 + j)}deg`, '--d': `${j * 0.06}s` }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- 底部联系 ---------- */
function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="reveal">
          <h2 className="contact-title">
            LET'S <span className="cn">聊聊</span>
          </h2>
          <p className="contact-sub">
            正在寻找新的机会与合作 —— 无论是产品设计的全职岗位，还是有趣的项目委托，
            <br />都欢迎随时联系我。
          </p>
          <div className="contact-links">
            <CopyButton value="1403790559@qq.com">1403790559@qq.com</CopyButton>
            <CopyButton value="17611540569">176 1154 0569</CopyButton>
            <a href="#top">回到顶部 ↑</a>
          </div>
        </div>
        <div className="footer-bar">
          <span>© 2026 XU YONGFANG — PORTFOLIO</span>
          <span>VISUAL / AI / BRAND DESIGNER</span>
          <span>SHENZHEN, CN</span>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  useReveal()
  const pathname = window.location.pathname.replace(/\/$/, '')
  if (pathname === '/projects/welink') {
    return <WelinkProject />
  }
  if (pathname === '/projects/nianyu') {
    return <NianyuProject />
  }
  return (
    <>
      <Nav />
      <Hero />
      <About />
      <Works />
      <MoreWorks />
      <Strengths />
      <Contact />
    </>
  )
}
