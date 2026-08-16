import { useEffect, useRef, useState } from 'react'
import './DesignThinkingPage.css'

const thinkingItems = [
  {
    question: '你通常如何开始一个设计问题？',
    answer: '我会先确认问题发生的场景、影响的人，以及团队真正需要达成的结果。这里将补充从需求澄清到设计假设形成的完整思考过程。',
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
          <p>{item.answer}</p>
        </div>
      </div>
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
