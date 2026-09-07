import { useEffect, useRef, useState } from 'react'

// Reference timing: 50px/s ticker, hover at 40%, mobile advances every 5s.
export default function WorkWays({ items }) {
  const root = useRef(null), viewport = useRef(null), track = useRef(null)
  const controls = useRef({ step() {} })
  const [paused, setPaused] = useState(false)
  const pauseRef = useRef(false)
  useEffect(() => { pauseRef.current = paused }, [paused])
  useEffect(() => {
    let frame = 0, last = 0, offset = 0, inView = false, hover = false, focus = false, holdUntil = 0, advanceAt = 0
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = matchMedia('(max-width: 767px)')
    const rail = viewport.current, strip = track.current
    const hold = () => { holdUntil = performance.now() + 6000 }
    const enter = () => { hover = true }
    const leave = () => { hover = false }
    const focusIn = () => { focus = true }
    const focusOut = () => { focus = false }
    const step = (direction = 1) => {
      hold()
      if (mobile.matches || reduce.matches) {
        const cards = [...strip.children].slice(0, items.length)
        const nearest = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - strip.offsetLeft - rail.scrollLeft) < Math.abs(cards[best].offsetLeft - strip.offsetLeft - rail.scrollLeft) ? i : best, 0)
        const next = cards[(nearest + direction + cards.length) % cards.length]
        rail.scrollTo({ left: next.offsetLeft - strip.offsetLeft, behavior: reduce.matches ? 'auto' : 'smooth' })
      } else offset += direction * (strip.firstElementChild.offsetWidth + 24)
    }
    controls.current.step = step
    function tick(now) {
      frame = 0
      const dt = Math.min((now - (last || now)) / 1000, .05)
      last = now
      if (inView && !document.hidden && !reduce.matches && !pauseRef.current && !focus) {
        if (mobile.matches) {
          strip.style.transform = ''
          if (now > Math.max(advanceAt, holdUntil)) { step(1); holdUntil = 0; advanceAt = now + 5000 }
        } else {
          const span = strip.scrollWidth / 2
          if (now > holdUntil) offset += dt * (hover ? 20 : 50)
          offset = ((offset % span) + span) % span
          strip.style.transform = `translate3d(${-offset}px,0,0)`
        }
      }
      if (inView && !document.hidden && !reduce.matches) frame = requestAnimationFrame(tick)
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = 0; last = 0; if (inView && !document.hidden && !reduce.matches) frame = requestAnimationFrame(tick) }
    const reset = () => { strip.style.transform = ''; rail.scrollLeft = 0; offset = 0; advanceAt = performance.now() + 5000; schedule() }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; advanceAt = performance.now() + 5000; schedule() })
    observer.observe(root.current)
    rail.addEventListener('pointerenter', enter); rail.addEventListener('pointerleave', leave)
    rail.addEventListener('pointerdown', hold); rail.addEventListener('wheel', hold, { passive: true })
    rail.addEventListener('focusin', focusIn); rail.addEventListener('focusout', focusOut)
    document.addEventListener('visibilitychange', schedule)
    mobile.addEventListener('change', reset); reduce.addEventListener('change', reset)
    return () => {
      cancelAnimationFrame(frame); observer.disconnect()
      rail.removeEventListener('pointerenter', enter); rail.removeEventListener('pointerleave', leave)
      rail.removeEventListener('pointerdown', hold); rail.removeEventListener('wheel', hold)
      rail.removeEventListener('focusin', focusIn); rail.removeEventListener('focusout', focusOut)
      document.removeEventListener('visibilitychange', schedule)
      mobile.removeEventListener('change', reset); reduce.removeEventListener('change', reset)
    }
  }, [items])
  return <div className="pb-ways-module" ref={root}>
    <div className="pb-ways-heading"><h3>一起工作时，我在意这些</h3><div>
      <button className="pb-auto-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? '继续自动播放' : '暂停自动播放'}</button>
      <p className="pb-ways-caption">Good work starts with dialogue.</p>
    </div></div>
    <div className="pb-ways-layout">
      <div className="pb-way-lead"><h3>让复杂的问题，<br />变得清楚。</h3><p>我希望设计既经得起推敲，也能在真实使用中发挥作用。</p></div>
      <div className="pb-ways-viewport" ref={viewport} tabIndex={0} aria-label="工作方式，自动轮播可暂停">
        <div className="pb-ways-track" ref={track}>{[...items, ...items].map(([title, body, tag], i) => <article className={`pb-way ${i >= items.length ? 'pb-way-duplicate' : ''}`} aria-hidden={i >= items.length || undefined} key={i}><h3>{title}</h3><p>{body}</p><small>{tag}</small></article>)}</div>
      </div>
    </div>
  </div>
}
