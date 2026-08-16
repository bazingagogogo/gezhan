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
          <span className="thinking-item-index">{String(index + 1).padStart(2, '0')}</span>
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
      <img className="thinking-article-cover" src="/images/thinking/charging/article-cover.png" alt="智能充电桩设计思考文章标题与关键词" />
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
        <div className="thinking-article-points">
          <div><strong>直觉映射</strong><p>星环灯状态与屏幕色彩和动态反馈保持一致；物理按键在界面中按真实位置映射；左右界面直接对应实体双枪位置。</p></div>
          <div><strong>户外导视</strong><p>充电桩更多时候是信息看板。字体、字号、对比度、可视高度与昼夜模式，都要按照远距离和户外环境重新定义。</p></div>
          <div><strong>极简交互</strong><p>最好的交互不是让用户反复点击屏幕，而是用灯语、动态指南和自动识别，引导人在物理世界中完成操作。</p></div>
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
      root?.querySelectorAll('[data-thinking-reveal]').forEach((node) => node.classList.add('is-visible'))
      return undefined
    }

    const readyFrame = window.requestAnimationFrame(() => root.classList.add('is-ready'))
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
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
      <section className="thinking-hero" aria-labelledby="thinking-title">
        <div className="thinking-kicker">
          <span>DESIGN THINKING</span>
          <span>思考与方法</span>
        </div>
        <h1 id="thinking-title" className="thinking-title">
          <span className="thinking-title-muted">设计不只发生在画布上。</span>
          <span>这里记录判断、取舍与方法。</span>
        </h1>
        <p className="thinking-intro">从问题定义到方案落地，把设计过程中不容易被看见的思考整理出来。以下内容暂为结构占位，后续将替换为真实文章与项目复盘。</p>
      </section>

      <section className="thinking-content" aria-label="设计思考内容">
        <div className="thinking-list">
          {thinkingItems.map((item, index) => (
            <ThinkingAccordion
              key={item.question}
              item={item}
              index={index}
              open={openIndex === index}
              onToggle={() => setOpenIndex(index)}
            />
          ))}
        </div>

        <aside className="thinking-aside" data-thinking-reveal>
          <div className="thinking-aside-copy">
            <span className="thinking-aside-label">ABOUT THIS SPACE</span>
            <p>这里会持续收录我的设计判断、工作方法和项目复盘。具体内容正在整理中。</p>
            <a className="thinking-aside-cta" href="/#works">
              <span aria-hidden="true">↗</span>
              <span>先看看项目</span>
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
        <a href="/#top">返回首页 ↗</a>
      </footer>
    </main>
  )
}
