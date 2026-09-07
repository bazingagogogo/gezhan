import { useEffect, useRef, useState } from 'react'
import './NoomoHero.css'
import PortfolioMenu from './PortfolioMenu.jsx'

export default function NoomoHero() {
  const root = useRef(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const scene = useRef(null)

  useEffect(() => {
    const element = root.current
    let active = true
    const fit = () => {
      if (!active) return
      const lines = [...element.querySelectorAll('.noomo-line')]
      if (window.matchMedia('(max-width: 1100px)').matches) {
        lines.forEach((line) => { line.style.fontSize = '' })
        const title = element.querySelector('.noomo-title')
        const available = Math.max(120, window.innerHeight - element.querySelector('.noomo-nav').offsetHeight - element.querySelector('.noomo-bottom').offsetHeight - 96)
        let low = 12, high = element.clientWidth * .16
        for (let i = 0; i < 12; i++) {
          const mid = (low + high) / 2
          title.style.setProperty('--compact-title-size', `${mid}px`)
          if (title.offsetHeight <= available && title.scrollWidth <= title.clientWidth + 1) low = mid
          else high = mid
        }
        title.style.setProperty('--compact-title-size', `${low}px`)
        element.dispatchEvent(new Event('noomo:title-layout'))
        return
      }
      // Measure actual glyph widths, not viewport-width guesses. Preserve
      // natural glyph proportions and word spacing at every viewport size.
      for (const line of lines) {
        let low = 12, high = element.clientHeight * .115
        for (let i = 0; i < 12; i++) {
          const size = (low + high) / 2
          line.style.fontSize = `${size}px`
          const natural = [...line.children].reduce((sum, word) => sum + word.getBoundingClientRect().width, 0)
          const gaps = parseFloat(getComputedStyle(line).columnGap) * (line.children.length - 1)
          if (natural + gaps <= line.clientWidth - 2) low = size
          else high = size
        }
        line.style.fontSize = `${low}px`
      }
      element.dispatchEvent(new Event('noomo:title-layout'))
    }
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    window.addEventListener('resize', fit)
    document.fonts.ready.then(fit)
    fit()
    return () => { active = false; observer.disconnect(); window.removeEventListener('resize', fit) }
  }, [])

  useEffect(() => {
    const abort = new AbortController()
    let dispose
    import('./noomoScene.js').then(async ({ createNoomoScene }) => {
      if (abort.signal.aborted) return
      const result = await createNoomoScene(root.current, abort.signal, () => setReady(true))
      if (abort.signal.aborted) result?.dispose()
      else { scene.current = result; dispose = result?.dispose }
    }).catch((error) => {
      if (!abort.signal.aborted) {
        console.warn('Interactive hero unavailable; keeping accessible text.', error)
        window.dispatchEvent(new Event('noomo:load-error'))
      }
    })
    return () => { abort.abort(); dispose?.(); scene.current = null }
  }, [])

  function toggleMotion() {
    const next = !paused
    setPaused(next)
    scene.current?.setPaused(next)
  }
  async function copyPhone(event) {
    event.preventDefault()
    await navigator.clipboard.writeText('17611540569')
  }

  return (
    <section ref={root} id="top" className={`noomo-hero${ready ? ' noomo-ready' : ''}`} aria-label="许咏芳，UI/UX 设计师">
      <a className="noomo-skip" href="#works">跳到作品</a>
      <div className="noomo-canvas" aria-hidden="true" />
      <header className="noomo-nav">
        <a href="#top" className="noomo-brand" aria-label="许咏芳，首页">XU<br />YONGFANG</a>
        <nav aria-label="主导航">
          <a href="#top">首页</a>
          <a href="#works">项目与探索</a>
          <a href="/about">关于我</a>
          <a href="/thinking">设计思考</a>
        </nav>
        <a className="noomo-email" href="/downloads/xuyongfang-resume-uiux.pdf" download>下载简历 <span aria-hidden="true">↗</span></a>
        <PortfolioMenu dark />
      </header>

      <div className="noomo-title-wrap">
        <h1 className="noomo-title" aria-label="I turn complexity into clear digital experiences, with product thinking, visual design and AI, and people at the center.">
          <span className="noomo-line"><span>I</span><span>TURN</span><span className="noomo-identity"><span>UI / UX DESIGNER</span><span>VISUAL DESIGN & AI</span><span>XU YONGFANG</span></span><strong>COMPLEXITY</strong><span>INTO</span></span>
          <span className="noomo-line"><strong>CLEAR</strong><span>DIGITAL</span><strong>EXPERIENCES.</strong></span>
          <span className="noomo-line"><span>WITH</span><strong>PRODUCT</strong><span>THINKING,</span></span>
          <span className="noomo-line"><span>VISUAL</span><strong>DESIGN</strong><span>&</span><strong>AI.</strong></span>
          <span className="noomo-line"><span>AND</span><strong>PEOPLE</strong><span>AT</span><span>THE</span><span>CENTER.</span></span>
        </h1>
      </div>

      <footer className="noomo-bottom">
        <div className="noomo-intro"><span className="noomo-caption">许咏芳 / UI · UX DESIGNER</span><p>探索未来数字产品的体验边界。<br />以产品思维、视觉表达与 AI 工作流，<br className="noomo-mobile-break" />让复杂的 SaaS 与 AI 产品变得清晰、易用。</p></div>
        <a className="noomo-explore" href="#works"><span>EXPLORE MY WORK</span><span className="noomo-arrow" aria-hidden="true">↓</span></a>
        <div className="noomo-tools"><a href="tel:17611540569" onClick={copyPhone}>联系我 <span aria-hidden="true">↗</span></a><button onClick={toggleMotion} aria-pressed={paused} disabled={!ready}>{paused ? '继续动态' : '暂停动态'} <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span></button></div>
      </footer>
    </section>
  )
}
