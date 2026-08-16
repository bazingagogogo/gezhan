import { useEffect, useRef, useState } from 'react'
import './DesignThinkingPage.css'

const thinkingItems = [
  {
    question: '智能充电桩重构：我梳理出的 3 个底层逻辑',
    type: 'article',
  },
  {
    question: '面对复杂需求，如何确定优先级？',
    answer: '先区分用户阻力、业务目标与实现成本，再用可验证的小步方案推进。后续会在这里放入具体案例与判断依据。',
  },
  {
    question: '视觉表达与产品目标如何平衡？',
    answer: '视觉不是最后的装饰，而是信息层级、品牌感受与操作效率的共同结果。这里将记录方案取舍和设计规范的形成过程。',
  },
  {
    question: '你如何使用 AI 参与设计过程？',
    answer: '我把 AI 当作探索与验证的协作工具，用它拓宽方向、整理信息和加快原型迭代，但关键判断仍来自对用户与场景的理解。',
  },
  {
    question: '如何判断一个方案是否真正有效？',
    answer: '除了界面是否完成，我更关心关键任务是否更顺畅、信息是否更容易理解，以及方案能否被团队持续维护。',
  },
  {
    question: '这里之后会更新哪些内容？',
    answer: '这里将陆续补充项目复盘、方法笔记、设计系统实践与日常观察。当前文字为页面结构占位，之后可直接替换。',
  },
]

function ThinkingAccordion({ item, index, open, onToggle }) {
  const panelId = `thinking-panel-${index}`
  const buttonId = `thinking-trigger-${index}`

  return (
    <article className={`thinking-item ${open ? 'is-open' : ''}`} data-thinking-reveal style={{ '--item-delay': `${index * 55}ms` }}>
      <h2>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="thinking-item-question">{item.question}</span>
          <span className="thinking-item-toggle" aria-hidden="true"><i /><i /></span>
        </button>
      </h2>
      <div id={panelId} className="thinking-answer-grid" role="region" aria-labelledby={buttonId} aria-hidden={!open}>
        <div>
          {item.type === 'article' ? <ChargingArticle /> : <p>{item.answer}</p>}
        </div>
      </div>
    </article>
  )
}

function ChargingArticle() {
  return (
    <article className="thinking-article">
      <header className="thinking-article-header">
        <span className="thinking-article-category">DESIGN THOUGHTS · 学习沉淀与扩展思考</span>
        <h3>听完充电桩设计分享，<br className="thinking-article-title-break" />我梳理出的 3 个底层逻辑</h3>
        <p className="thinking-article-subtitle">优秀案例复盘：从生态博弈、软硬重构到隐形体验的延伸思考</p>
        <div className="thinking-article-meta">
          <div className="thinking-keywords" aria-label="文章关键词">
            <span>软硬融合</span>
            <span>户外导视</span>
            <span>隐形交互 · Zero-UI</span>
            <span>B2B2C 商业视角</span>
          </div>
          <span className="thinking-article-type">设计案例拆解 · 方法论总结</span>
        </div>
      </header>
      <div className="thinking-article-lead">
        <span>案例学习沉淀</span>
        <p>前段时间参加了一场关于“智能充电桩出海体验设计”的分享会。原本以为充电桩只是“插枪、扫码、等待”的简单流程，深入了解后才发现，它背后牵涉制造商、运营商与车主的多方关系，也是物理空间与数字界面高度融合的典型场景。</p>
        <p>我重新整理了这次分享的关键内容，并从体验设计角度提炼出关于软硬一体设计的底层逻辑与延伸思考。</p>
      </div>

      <section>
        <span className="thinking-article-section-no">01</span>
        <h3>先看懂生态，再谈用户体验</h3>
        <p>这类 B2B2C 硬件产品不能只站在终端车主的角度思考，也要站在采购方，也就是运营商的角度计算商业价值。运营商关心价格、性能、品牌信誉和运维成本，而体验设计看似是软指标，实际直接关联着降本增效。</p>
        <p>如果界面不直观、鉴权步骤卡顿，用户会频繁寻求客服帮助，充电枪也可能因操作迟疑而被长期占用，最终降低场站周转率并推高运维成本。</p>
        <figure>
          <img src="/images/thinking/charging/pain-points.png" alt="充电桩硬件设计的三类割裂痛点：软硬件割裂、信息盲盒和交互跑马拉松" />
          <figcaption>硬件体验中的三类典型割裂：软硬脱节、状态隐蔽与跨触点操作。</figcaption>
        </figure>
      </section>

      <section>
        <span className="thinking-article-section-no">02</span>
        <h3>让软件和硬件“长在一起”</h3>
        <p>重构方案的核心可以概括为三句话：软硬融合、一目了然、极简充电。它没有把 12.1 英寸触摸屏当作孤立的显示框，而是把数字界面作为硬件物理特征的延伸。</p>
        <div className="thinking-solution-block">
          <h4>① 物理与数字的“直觉映射”</h4>
          <p>方案没有把那块 12.1 寸的触摸屏当作孤立的显示框，而是将其作为硬件物理特征的延伸：</p>
          <ul>
            <li><strong>灯语联动：</strong>桩体上的星环灯状态（空闲/充电/故障）与屏幕背景色、动态粒子保持高度一致。</li>
            <li><strong>物理按键按需绑定：</strong>欧洲极寒天气下用户戴着厚手套很难精准触控，因此保留了 4 个物理按键。屏幕 UI 直接把按键形状和位置做出了物理位置的对应，形成无需思考的“直觉映射”。</li>
            <li><strong>左右双枪镜像：</strong>UI 界面的左右布局直接对应实体的左右物理枪位，充哪边一目了然。</li>
          </ul>
        </div>
        <div className="thinking-solution-block">
          <h4>② 把屏幕当成“户外导视系统”来设计</h4>
          <p>充电桩在户外绝大多数时间是信息看板，而不是频繁点击的操作屏。因此，设计团队放弃了传统移动端 App 那套精致纤细的 UI 规范，转向了户外导视（Wayfinding System）逻辑：</p>
          <dl className="thinking-wayfinding-table">
            <div><dt>字体选型（Frutiger）</dt><dd>使用了欧洲交通导视系统常用的 Frutiger 字体。作为等宽字体，数字上下滚动时平稳不跳动，驾驶者看一眼就觉得亲切易读。</dd></div>
            <div><dt>人体工学规范</dt><dd>遵守英国 PAS 和德国 DIN 标准，核心可视区控制在 1300mm 以下，关键操作集中在 1200mm 以下，对不同身高及轮椅人群非常友好。</dd></div>
            <div><dt>极限抗反光与昼夜</dt><dd>界面最小文字高度 4.07mm（远超德国 DIN1450 标准的 3.2mm），黑白高对比度，配合光线传感器自动切换昼夜模式。</dd></div>
          </dl>
        </div>
        <div className="thinking-solution-block">
          <h4>③ 极简交互：“不需要触碰屏幕的交互”</h4>
          <p>分享中提到了阿姆斯特丹史基普机场自动托运系统的启发：最好的交互，是用动态指南引导人在物理世界里快速操作，而不是让他在屏幕上点来点去。</p>
        </div>
        <blockquote>理想的充电体验，不应该是用户与屏幕的频繁对话，而是用户与充电桩的默契配合。</blockquote>
      </section>

      <section>
        <span className="thinking-article-section-no">03</span>
        <h3>我的延伸思考与方法论沉淀</h3>
        <p>这次学习带来的最大提醒是：做界面设计时，思维很容易被框在屏幕这块“玻璃”里。面对智能硬件与复杂物理空间，应当把交互媒介、场景约束和商业目标放在一起判断。</p>
        <figure>
          <img src="/images/thinking/charging/method-notes.png" alt="关于隐形交互、场景约束和商业体验的三条方法论" />
          <figcaption>三条可迁移的方法：减少不必要点击、先确认物理约束、把体验转化为可衡量的商业语言。</figcaption>
        </figure>
      </section>

      <section className="thinking-article-summary">
        <span>总结</span>
        <p>好的设计不一定需要炫技。尤其面对智能硬件和复杂物理场景时，应当把复杂留给自己，把自然留给用户。这次分享让我重新审视了软硬协同的边界，也形成了一套可以继续用于复合场景设计的观察框架。</p>
      </section>
    </article>
  )
}

export default function DesignThinkingPage() {
  const [openIndex, setOpenIndex] = useState(0)
  const pageRef = useRef(null)

  useEffect(() => {
    document.title = '设计思考 · 许咏芳作品集'
    window.scrollTo(0, 0)
    const root = pageRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!root || reduceMotion) {
      root?.classList.add('is-ready')
      root?.querySelectorAll('[data-thinking-reveal]').forEach((node) => { node.dataset.visible = 'true' })
      return undefined
    }

    const readyFrame = window.requestAnimationFrame(() => root.classList.add('is-ready'))
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.dataset.visible = 'true'
        observer.unobserve(entry.target)
      }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    root.querySelectorAll('[data-thinking-reveal]').forEach((node) => observer.observe(node))
    return () => {
      window.cancelAnimationFrame(readyFrame)
      observer.disconnect()
    }
  }, [])

  return (
    <main ref={pageRef} className="thinking-page" id="top">
      <header className="project-detail-bar thinking-detail-bar">
        <a href="/" className="project-back"><img src="/icons/chevron-left.svg" alt="" aria-hidden="true" />返回主页</a>
        <span className="project-detail-name">设计思考</span>
        <span className="project-detail-count">DESIGN NOTES</span>
      </header>
      <section className="thinking-hero" aria-labelledby="thinking-title">
        <div className="thinking-kicker">
          <span>DESIGN THINKING</span>
          <span>思考与方法</span>
        </div>
        <h1 id="thinking-title" className="thinking-title">
          <span className="thinking-title-muted">设计不只发生在画布上，</span>
          <span>这里记录判断、取舍与方法。</span>
        </h1>
        <p className="thinking-intro">从问题定义到方案落地，把设计过程中不容易被看见的思考整理出来。这里持续记录我对产品、体验与技术的观察，并将项目中的判断与取舍沉淀为可复用的方法。</p>
      </section>

      <section className="thinking-content" aria-label="设计思考内容">
        <div className="thinking-list">
          {thinkingItems.map((item, index) => (
            <ThinkingAccordion
              key={item.question}
              item={item}
              index={index}
              open={openIndex === index}
              onToggle={() => setOpenIndex((current) => current === index ? -1 : index)}
            />
          ))}
        </div>

        <aside className="thinking-aside" data-thinking-reveal>
          <div className="thinking-aside-copy">
            <span className="thinking-aside-label">ABOUT THIS SPACE</span>
            <p>这里会持续收录我的设计判断、工作方法和项目复盘。具体内容正在整理中。</p>
            <a className="thinking-aside-cta" href="/#works">
              <span aria-hidden="true">↗</span>
              <span>去看看项目</span>
            </a>
          </div>
          <div className="thinking-aside-card" aria-hidden="true">
            <span className="thinking-aside-number">01—06</span>
            <div className="thinking-orbit"><i /><i /><i /></div>
            <strong>THINK<br />THEN<br />MAKE</strong>
          </div>
        </aside>
      </section>

      <footer className="thinking-footer">
        <span>© 2026 XU YONGFANG</span>
      </footer>
    </main>
  )
}
