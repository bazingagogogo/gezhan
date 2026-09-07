import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './PortfolioBody.css'
import WorkWays from './WorkWays.jsx'
import PortfolioMenu from './PortfolioMenu.jsx'

const experiences = [
  ['2024.02 - 2026.04', '软通动力', 'UI 设计师', '参与企业级 SaaS 产品设计，覆盖邮件、笔记、搜索与云知识，主导 AI 智能笔记的交互与视觉落地。'],
  ['2023.09 - 2023.12', '深圳壹木航科技', '产品助理实习', '参与需求梳理与交互支持，协助从 0 到 1 搭建功能流程。'],
  ['2022.09 - 2022.11', 'Flat Incubator', '设计助理实习', '负责视觉与品牌设计支持，输出运营视觉与素材规范。'],
]
const ways = [
  ['先问清楚，再开始设计', '比起马上画界面，我更愿意确认用户为什么卡住，以及团队真正需要解决什么。', '用户研究 / 产品思考'],
  ['让分散的信息形成共识', '主动同步过程，听取不同意见，把复杂项目中的分散信息整理成可讨论、可落地的方案。', '跨职能协作 / 设计落地'],
  ['用 AI 扩展探索，而非替代判断', '通过 AI 加快探索与验证，最终的设计判断仍然来自对用户、任务与场景的理解。', 'AI 工作流 / 快速验证'],
]
const articles = [
  ['智能充电桩', '设计指南', '从设备、场景与用户任务出发，梳理智能充电体验的设计要点。', 'PRODUCT DESIGN', 0],
  ['AIGC 数字界面', '交互范式拆解', '当系统从执行指令走向生成结果，界面如何帮助用户建立预期与掌控感？', 'AI INTERACTION', 1],
  ['设计心理学', '理论与实践笔记', '把认知、注意力与行为习惯的理论，放回具体的交互设计问题中。', 'DESIGN PSYCHOLOGY', 2],
  ['AI 搜索体验', '设计避坑', '关注生成式搜索中的信息组织、理解成本与结果反馈。', 'SEARCH EXPERIENCE', 3],
  ['AI Agent 交互', '场景体验思考', '从真实任务出发，思考人与智能体之间的分工和反馈。', 'AGENT EXPERIENCE', 4],
]
const summaries = [
  '让碎片化信息成为可沉淀、可查找、可协作的企业知识，串联 AI 能力、交互流程与多端视觉规范。',
  '从高校心理咨询的真实场景出发，优化预约与陪伴体验，连接学生诉求与学校服务。',
]

function Arrow({ diagonal = false }) { return <span className="pb-arrow" aria-hidden="true">{diagonal ? '↗' : '→'}</span> }
function Action({ href, children, download }) { return <a className="pb-action" href={href} download={download}><Arrow /><span>{children}</span></a> }
function CopyAction({ onClick, children }) { return <button className="pb-action pb-copy-action" type="button" onClick={onClick}><Arrow /><span>{children}</span></button> }
function FillTitle({ children, className = '' }) {
  const text = Array.isArray(children) ? children.join('') : String(children)
  return <h2 className={`pb-fill-title ${className}`} aria-label={text.replaceAll('\n', '')}>{Array.from(text).map((char, i) => char === '\n' ? <br key={i} /> : <span aria-hidden="true" key={i}>{char}</span>)}</h2>
}
function SectionSteps() { return <div className="pb-section-steps" aria-hidden="true">{[.24,.52,1,.43,.12].map((height, i) => <i key={i} style={{ '--step-height': height }} />)}</div> }

export default function PortfolioBody({ works, more }) {
  const root = useRef(null)
  const dialog = useRef(null)
  const lastFocus = useRef(null)
  const [selected, setSelected] = useState(null)
  const [copyState, setCopyState] = useState('复制邮箱')
  const [phoneState, setPhoneState] = useState('立刻联系我')
  const copyTimer = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const el = root.current
    // Locally generated monochrome grain; no third-party image assets reused.
    const tile = document.createElement('canvas')
    tile.width = tile.height = 192
    const ctx2d = tile.getContext('2d')
    const pixels = ctx2d.createImageData(192, 192)
    let seed = 43
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      const value = seed >>> 24
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value
      pixels.data[i + 3] = 85
    }
    ctx2d.putImageData(pixels, 0, 0)
    el.style.setProperty('--pb-grain', `url(${tile.toDataURL()})`)
    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      const links = [...el.querySelectorAll('[data-case-link]')]
      const activate = (id) => links.forEach(link => {
        if (link.dataset.caseLink === id) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      })
      el.querySelectorAll('[data-case]').forEach(card => {
        ScrollTrigger.create({ trigger: card, start: 'top 55%', end: 'bottom 55%', onEnter: () => activate(card.id), onEnterBack: () => activate(card.id) })
      })
      ScrollTrigger.create({ trigger: el, start: 'top 70px', end: 'bottom top', onToggle: self => { el.querySelector('.pb-nav').dataset.visible = String(self.isActive) } })
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const hero = document.querySelector('.hero-exit-shell')
        if (hero) gsap.to(hero, { scale: .96, borderRadius: 24, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .35 } })
        const thinking = el.querySelector('.pb-thinking')
        if (thinking) gsap.to(thinking, { scale: .96, borderRadius: 24, transformOrigin: 'center bottom', ease: 'none', scrollTrigger: { trigger: thinking, start: 'bottom bottom', end: 'bottom top', scrub: .35 } })
        el.querySelectorAll('.pb-section-steps').forEach(steps => {
          gsap.fromTo(steps.children, { scaleY: 0 }, { scaleY: 1, stagger: .08, duration: .5, ease: 'none', scrollTrigger: { trigger: steps.parentElement, start: 'top bottom', end: 'top 45%', scrub: .25 } })
        })
        el.querySelectorAll('[data-pb-reveal]').forEach(item => {
          gsap.from(item, { y: 36, opacity: .15, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 94%', once: true } })
        })
        el.querySelectorAll('.pb-media').forEach(item => {
          gsap.fromTo(item.querySelector('.pb-media-mask'), { scaleY: 1 }, { scaleY: 0, duration: 1.15, ease: 'power3.inOut', scrollTrigger: { trigger: item, start: 'top 90%', once: true } })
        })
        el.querySelectorAll('.pb-fill-title').forEach(title => {
          const chars = [...title.children]
          const count = chars.length, overlap = 4
          const progress = { value: 0 }
          gsap.to(progress, { value: 1, ease: 'none', scrollTrigger: { trigger: title, start: 'top 90%', end: 'bottom 50%', scrub: true }, onUpdate: () => {
            chars.forEach((char, i) => {
              const start = i / count, end = Math.min(1, (i + overlap) / count)
              char.style.opacity = .1 + .9 * Math.max(0, Math.min(1, (progress.value - start) / (end - start)))
            })
          } })
          chars.forEach(char => { char.style.opacity = .1 })
        })
        gsap.fromTo('.pb-contact-light', { xPercent: -12, rotation: -20 }, { xPercent: 15, rotation: 5, ease: 'none', scrollTrigger: { trigger: '.pb-contact', start: 'top bottom', end: 'bottom top', scrub: 1.2 } })
        const arc = el.querySelector('.pb-about-arc-path')
        if (arc) {
          const length = arc.getTotalLength()
          gsap.set(arc, { strokeDasharray: length, strokeDashoffset: length })
          gsap.to(arc, { strokeDashoffset: 0, ease: 'power1.inOut', scrollTrigger: { trigger: '.pb-about', start: 'top 88%', end: 'bottom 22%', scrub: .8, invalidateOnRefresh: true } })
          gsap.fromTo('.pb-about-arc-svg', { rotation: -7, scale: .94 }, { rotation: 4, scale: 1.04, transformOrigin: '100% 0%', ease: 'none', scrollTrigger: { trigger: '.pb-about', start: 'top bottom', end: 'bottom top', scrub: 1.1 } })
        }
      }, el)
    }, el)
    const refresh = () => ScrollTrigger.refresh()
    el.querySelectorAll('img').forEach(img => img.addEventListener('load', refresh))
    let live = true
    document.fonts.ready.then(() => { if (live) refresh() })
    refresh()
    return () => {
      live = false
      el.querySelectorAll('img').forEach(img => img.removeEventListener('load', refresh))
      media.revert(); context.revert(); clearTimeout(copyTimer.current)
    }
  }, [])

  useEffect(() => {
    if (selected) dialog.current?.showModal()
    else if (dialog.current?.open) dialog.current.close()
  }, [selected])
  const closePreview = () => { setSelected(null); lastFocus.current?.focus() }
  async function copyEmail() {
    try { await navigator.clipboard.writeText('1403790559@qq.com'); setCopyState('邮箱已复制') }
    catch { setCopyState('请复制：1403790559@qq.com') }
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopyState('复制邮箱'), 4000)
  }
  async function copyPhone() {
    try { await navigator.clipboard.writeText('17611540569'); setPhoneState('电话已复制') }
    catch { setPhoneState('请复制：176 1154 0569') }
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setPhoneState('立刻联系我'), 4000)
  }

  return <main className="pb" ref={root}>
    <PortfolioMenu />

    <section id="works" className="pb-projects pb-paper">
      <div className="pb-shell pb-project-layout">
        <aside className="pb-project-aside">
          <span className="pb-label">Selected Work & Explorations</span>
          <h2>每一个项目，<br />都从一个真实<br />的问题开始。</h2>
          <p>从完整产品案例，到视觉、三维与动态实验。看看我如何理解问题，并把想法推进到落地。</p>
          <nav className="pb-case-index" aria-label="项目索引">
            {works.map((work, i) => <a href={`#case-${i}`} data-case-link={`case-${i}`} key={work.title}>
              <img src={work.image} alt="" loading="lazy" /><span><small>{work.cols[0].v}</small><strong>{work.title}</strong><em>{i === 0 ? 'AI 增强的企业知识管理' : '以学生为中心的心理服务'}</em></span><b aria-hidden="true">＋</b>
            </a>)}
            <a href="#more" data-case-link="more"><img src={more[0].img} alt="" loading="lazy" /><span><small>VISUAL / 3D / MOTION</small><strong>更多视觉与动态探索</strong><em>五个补充作品</em></span><b aria-hidden="true">＋</b></a>
          </nav>
          <a className="pb-text-link" href="/xuyongfang-portfolio.pdf" download>下载完整作品集 <Arrow diagonal /></a>
        </aside>
        <div className="pb-project-content">
          {works.map((work, i) => <article className="pb-case" id={`case-${i}`} data-case key={work.title}>
            <a href={work.href} className="pb-case-link">
              <div className="pb-media pb-case-media"><img src={work.image} alt={work.title} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined} data-preload-critical={i === 0 ? '' : undefined} /><span className="pb-media-mask" />
                <span className="pb-case-preview"><img src={work.previewImage || work.image} alt={`${work.title} 项目预览`} loading="lazy" /><span className="pb-preview-cta">查看完整案例 <Arrow diagonal /></span></span>
              </div>
              <div className="pb-case-copy"><small>{work.tag}</small><h3>{work.title}</h3><p>{summaries[i]}</p><span className="pb-case-plus" aria-hidden="true">＋</span>
                <div className="pb-case-meta"><span>{work.cols[1].v}</span><span>{work.cols[2].v}</span></div>
              </div>
            </a>
          </article>)}
          <div id="more" data-case className="pb-explorations">
            <div className="pb-group-heading"><span className="pb-label">Beyond the Interface</span><p>视觉、三维与动态表达的持续探索</p></div>
            <div className="pb-small-grid">{more.map((item, i) => <button className={`pb-small-card ${i === more.length - 1 ? 'pb-wide-card' : ''}`} key={item.h} onClick={e => { lastFocus.current = e.currentTarget; setSelected(item) }}>
              <div className="pb-media"><img src={item.img} alt={item.h} loading="lazy" /><span className="pb-media-mask" /><span className="pb-view">放大查看 <Arrow diagonal /></span></div>
              <div className="pb-small-copy"><small>{['3D SCENE','PRODUCT DESIGN','MOTION EXPERIMENT','BRAND MOTION','CAMPAIGN DESIGN'][i]}</small><h3>{item.h}</h3><p>{item.p}</p><span className="pb-case-plus" aria-hidden="true">＋</span></div>
            </button>)}</div>
          </div>
        </div>
      </div>
    </section>

    <section id="about" className="pb-about pb-dark">
      <SectionSteps />
      <div className="pb-about-arc" aria-hidden="true"><svg className="pb-about-arc-svg" viewBox="0 0 1000 718" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="pb-about-line-gradient" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2a38ee" /><stop offset="52%" stopColor="#405df5" /><stop offset="100%" stopColor="#5a90ff" /></linearGradient></defs><path className="pb-about-arc-path" d="M1010 7.2C996 9 970 14 956.9 17.6C930 25 900 35 880.4 44.3C850 59 820 78 788.3 100.4C760 122 735 150 717.4 181.4C695 222 678 275 676 308.9C674 350 677 390 694.3 441.5C710 479 744 510 793.1 526.8C835 540 884 520 909.1 479.9C931 442 911 397 872.9 359.9C827 320 770 306 696.6 302.4C630 300 570 312 509.5 326.4C450 341 405 377 375.4 414.1C344 452 323 480 273.3 490.3C235 495 205 463 169.2 464.3C120 467 102 507 94.2 559.6C89 610 76 656 52.1 684.8C38 701 20 711 8.1 715.8" /></svg></div>
      <div className="pb-shell">
        <span className="pb-label">A Little About Me</span>
        <FillTitle>从想法到落地，设计{`\n`}不只是画面。</FillTitle>
        <img className="pb-about-symbol" src="/images/about-symbol.png" alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="pb-about-intro" data-pb-reveal>
          <div className="pb-about-bio"><img className="pb-avatar" src="/images/profile-avatar.png?v=2" alt="许咏芳" loading="lazy" /><p>我是许咏芳，一名拥有 3 年经验的 UI/UX 设计师。我参与移动端、PC、Web 与后台产品的<br className="pb-desktop-break" />体验设计，也负责用户研究、交互优化和多端设计系统建设。</p><Action href="/about">查看详情</Action></div>
          <div className="pb-practice"><div><b aria-hidden="true">a</b><span><strong>理解问题</strong><p>用户研究、流程梳理、产品思考</p></span></div><div><b aria-hidden="true">b</b><span><strong>推进落地</strong><p>交互设计、视觉表达、多端设计系统</p></span></div></div>
        </div>
        <div className="pb-experience" data-pb-reveal>
          <h3>我的经历</h3>
          <div>{experiences.map(([period, company, role, desc]) => <details key={company} open={company === '软通动力'}><summary><span>{period}</span><strong>{company}</strong><span>{role}</span><b aria-hidden="true">＋</b></summary><p>{desc}</p></details>)}</div>
        </div>
        <WorkWays items={ways} />
        <div className="pb-life" data-pb-reveal><img src="/images/personal-video-cover.webp" alt="工作之外的许咏芳" loading="lazy" /><div><h3>工作之外，也保持好奇</h3><p>独立游戏、积木、手作和 3D 打印，让我持续观察声音、画面与交互<br className="pb-life-desktop-break" />，也享受把想法做成实物的过程。</p></div></div>
      </div>
    </section>

    <section id="thinking" className="pb-thinking pb-paper">
      <SectionSteps />
      <div className="pb-shell">
        <span className="pb-label">Notes & Perspectives</span>
        <FillTitle>不止展示设计结果，也记录我如何分析问题。</FillTitle>
        <p className="pb-thinking-intro">从产品场景、认知心理到 AI 交互，把实践中的问题整理成可以反复讨论和验证的设计笔记。</p>
        <div className="pb-article-grid">{articles.slice(0, 3).map((article, i) => <a className={`pb-article pb-article-${i}`} key={article[0]} href={`/thinking#thinking-trigger-${article[4]}`} data-pb-reveal><small>{article[3]}</small><h3>{article[0]}<br />{article[1]}</h3><p>{article[2]}</p><span className="pb-article-action"><Arrow /> 阅读文章</span><div className="pb-article-bottom">{['场景研究 / 设备体验','生成式界面 / 反馈机制','认知机制 / 行为设计'][i]}</div></a>)}</div>
        <div className="pb-article-list">{articles.slice(3).map(article => <a href={`/thinking#thinking-trigger-${article[4]}`} key={article[0]}><span>{article[3]}</span><h3>{article[0]} · {article[1]}</h3><Arrow diagonal /></a>)}</div>
        <a className="pb-text-link" href="/thinking">查看全部设计思考 <Arrow diagonal /></a>
      </div>
    </section>

    <footer id="contact" className="pb-contact pb-dark">
      <div className="pb-contact-backdrop" aria-hidden="true"><div className="pb-contact-light" />
        {Array.from({ length: 14 }, (_, i) => <i className="pb-contact-dust" key={i} style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 23 + 7) % 85}%`, animationDelay: `${-i * 1.7}s`, animationDuration: `${12 + i % 5}s` }} />)}
      </div>
      <div className="pb-shell">
        <FillTitle>有值得解决的问题？一起聊聊。</FillTitle>
        <div className="pb-contact-top"><p>正在寻找新的机会与合作。无论是产品设计的全职岗位，还是有趣的项目委托，都欢迎联系我。</p><CopyAction onClick={copyPhone}>{phoneState}</CopyAction></div>
        <div className="pb-contact-grid">
          <div><h3>许咏芳</h3><p>UI / UX DESIGNER<br />产品思考、视觉表达与 AI 工作流</p><button className="pb-copy-value" onClick={copyEmail} aria-live="polite">1403790559@qq.com</button><button className="pb-copy-value" onClick={copyPhone}>176 1154 0569</button><button onClick={copyEmail} aria-live="polite">{copyState}</button></div>
          <nav aria-label="页尾页面导航"><h3>继续浏览</h3><a href="#top">首页</a><a href="#works">项目与探索</a><a href="#about">关于我</a><a href="/thinking">设计思考</a></nav>
          <nav aria-label="文件下载"><h3>下载</h3><a href="/xuyongfang-portfolio.pdf" download>完整作品集 ↗</a><a href="/downloads/xuyongfang-resume-uiux.pdf" download>个人简历 ↗</a></nav>
        </div>
        <div className="pb-signature" aria-hidden="true">XU YONGFANG</div>
        <div className="pb-footer-bottom"><span>© 2026 许咏芳</span><a href="#top">回到顶部 ↑</a></div>
      </div>
    </footer>
    <dialog className="pb-lightbox" ref={dialog} onCancel={closePreview} onClose={() => { if (selected) closePreview() }} onClick={e => { if (e.target === e.currentTarget) closePreview() }}>
      <button className="pb-lightbox-close" onClick={closePreview} aria-label="关闭作品预览" autoFocus>关闭 ×</button>
      {selected && <figure><img src={selected.img} alt={selected.h} /><figcaption><h2>{selected.h}</h2><p>{selected.p}</p></figcaption></figure>}
    </dialog>
  </main>
}
