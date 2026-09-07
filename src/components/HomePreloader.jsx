import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './HomePreloader.css'

const SESSION_KEY = 'xyf-critical-preloader-seen-v2'

// The percentage represents only what visitors need first: hero assets and the
// first case image. Everything below that point remains free to lazy-load.
export default function HomePreloader() {
  const canvas = useRef(null), root = useRef(null)
  const [shouldShow] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('intro') === '0') return false
    if (params.get('intro') === '1') return true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try { return sessionStorage.getItem(SESSION_KEY) !== '1' } catch { return true }
  })
  const [finished, setFinished] = useState(!shouldShow)

  useEffect(() => {
    if (!shouldShow) return undefined
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch {}

    const element = root.current, surface = canvas.current
    const ctx = surface?.getContext('2d')
    if (!ctx) { setFinished(true); return undefined }
    let disposed = false, exiting = false, assetTarget = 0
    let heroReady = false, criticalReady = false
    let width = 0, height = 0, dpr = 1
    const state = { progress: 0, assets: 0, hero: 0, critical: 0, morph: 0, exit: 0 }
    const digits = [0, 0, 0]
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const oldOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const content = document.querySelector('.home-content')
    if (content) content.inert = true

    const finish = () => {
      if (disposed) return
      gsap.ticker.remove(render)
      clearTimeout(watchdog)
      document.documentElement.style.overflow = oldOverflow
      if (content) content.inert = false
      setFinished(true)
      window.dispatchEvent(new Event('resize'))
    }
    const timeline = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' }, onComplete: finish })
    timeline.to(state, { morph: 1, duration: reduced ? .01 : 1 }, 0)
      .to(state, { exit: 1, duration: reduced ? .15 : 1 }, reduced ? .01 : 1)

    const resize = () => {
      width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2)
      surface.width = Math.ceil(width * dpr); surface.height = Math.ceil(height * dpr)
    }
    resize()
    const progress = event => { assetTarget = Math.max(assetTarget, event.detail || 0) }
    const observeHero = new MutationObserver(() => {
      if (document.querySelector('.noomo-ready')) { heroReady = true; assetTarget = 1 }
    })
    const hero = document.querySelector('.noomo-hero')
    if (hero) observeHero.observe(hero, { attributes: true, attributeFilter: ['class'] })
    if (document.querySelector('.noomo-ready')) { heroReady = true; assetTarget = 1 }

    const criticalImage = document.querySelector('[data-preload-critical]')
    const markCriticalReady = () => { criticalReady = true }
    if (!criticalImage || (criticalImage.complete && criticalImage.naturalWidth > 0)) markCriticalReady()
    else {
      criticalImage.addEventListener('load', markCriticalReady, { once: true })
      criticalImage.addEventListener('error', markCriticalReady, { once: true })
    }

    const release = () => { heroReady = true; criticalReady = true; assetTarget = 1 }
    window.addEventListener('noomo:load-progress', progress)
    window.addEventListener('noomo:load-error', release)
    window.addEventListener('resize', resize)
    // Non-critical gallery assets keep loading after this eight-second cap.
    const watchdog = setTimeout(release, 4500)
    const expo = gsap.parseEase('expo.inOut')

    function render(_time, delta) {
      if (disposed) return
      const dt = Math.min(delta / 1000, .05)
      state.assets = Math.min(assetTarget, state.assets + dt * 1.6)
      if (heroReady) state.hero = Math.min(1, state.hero + dt / .25)
      if (criticalReady) state.critical = Math.min(1, state.critical + dt / .2)
      state.progress = state.assets * .7 + state.hero * .2 + state.critical * .1
      if (state.progress >= .999 && !exiting) { state.progress = 1; exiting = true; timeline.play() }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height)
      const unit = Math.floor(Math.min(42, width / 30))
      const f = state.exit
      ctx.save(); ctx.translate(width / 2, height / 2)
      if (!exiting) {
        ctx.fillStyle = '#333'; ctx.fillRect(-2.5 * unit, -.5 * unit, 5 * unit, unit)
        ctx.fillStyle = '#fff'; ctx.fillRect(-2.5 * unit, -.5 * unit, 5 * unit * state.progress, unit)
      } else {
        ctx.rotate(f)
        const scale = 1 + f * Math.hypot(width, height) / unit
        ctx.scale(scale, scale)
        for (const sign of [-1, 1]) {
          ctx.save(); ctx.rotate(sign * state.morph * Math.PI / 4)
          ctx.beginPath(); ctx.roundRect(-unit * .5, -unit * 1.85, unit, unit * 3.7, unit * .5)
          ctx.globalCompositeOperation = 'destination-out'; ctx.fill()
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 - f; ctx.fillStyle = '#fff'; ctx.fill()
          ctx.restore()
        }
      }
      ctx.restore()

      const fontSize = Math.min(160, Math.max(64, width * .078))
      ctx.font = `400 ${fontSize}px "Noomo Montreal", Arial, sans-serif`
      ctx.textBaseline = 'top'; ctx.fillStyle = '#fff'
      const digitWidth = ctx.measureText('0').width
      for (let i = 0; i < 3; i++) {
        const desired = Math.floor(state.progress * 100 / 10 ** (2 - i))
        digits[i] += (desired - digits[i]) * (1 - Math.exp(-7 * dt))
        if (desired - digits[i] < .01) digits[i] = desired
        const val = digits[i] % 10, frac = val % 1
        const leave = expo(Math.max(0, Math.min(1, f * 1.2 - .1 * i)))
        ctx.save(); ctx.beginPath(); ctx.rect(8 + i * digitWidth, height - fontSize, digitWidth + 1, fontSize); ctx.clip()
        const y = height - fontSize - frac * fontSize + leave * fontSize
        ctx.fillText(Math.floor(val), 8 + i * digitWidth, y)
        ctx.fillText((Math.floor(val) + 1) % 10, 8 + i * digitWidth, y + fontSize)
        ctx.restore()
      }
      element.dataset.phase = exiting ? (state.exit > 0 ? 'reveal' : 'morph') : 'loading'
    }

    render(0, 0)
    gsap.ticker.add(render)
    return () => {
      disposed = true; timeline.kill(); gsap.ticker.remove(render); clearTimeout(watchdog); observeHero.disconnect()
      criticalImage?.removeEventListener('load', markCriticalReady)
      criticalImage?.removeEventListener('error', markCriticalReady)
      window.removeEventListener('noomo:load-progress', progress)
      window.removeEventListener('noomo:load-error', release)
      window.removeEventListener('resize', resize)
      document.documentElement.style.overflow = oldOverflow
      if (content) content.inert = false
    }
  }, [shouldShow])

  return finished ? null : <div className="home-preloader" ref={root} role="status" aria-label="正在加载作品集"><canvas ref={canvas} aria-hidden="true" /></div>
}
