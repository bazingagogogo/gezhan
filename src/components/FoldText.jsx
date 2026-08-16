import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import './FoldText.css'

export default function FoldText({ text, splitBy = 'char', className = '' }) {
  const rootRef = useRef(null)
  const segments = useMemo(() => {
    if (splitBy === 'line') return text.split('\n').map((line, index) => ({ text: line, line: true, key: `line-${index}` }))
    return Array.from(text).map((char, index) => ({ text: char === ' ' ? '\u00a0' : char, key: `char-${index}` }))
  }, [text, splitBy])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const pieces = root.querySelectorAll('.fold-text-piece')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(pieces, { opacity: 1, rotateX: 0, clearProps: 'transform' })
      return undefined
    }
    gsap.set(pieces, { opacity: 0, rotateX: -92, '--fold-crease': .55, transformOrigin: '50% 0%' })
    let animation
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animation = gsap.to(pieces, {
        opacity: 1,
        rotateX: 0,
        '--fold-crease': 0,
        duration: .65,
        stagger: splitBy === 'line' ? .1 : .045,
        ease: 'power3.out',
        clearProps: 'willChange',
      })
      observer.disconnect()
    }, { threshold: .18, rootMargin: '0px 0px -12% 0px' })
    observer.observe(root)
    return () => {
      observer.disconnect()
      animation?.kill()
      gsap.killTweensOf(pieces)
    }
  }, [text, splitBy])

  return (
    <span ref={rootRef} className={`fold-text ${className}`.trim()}>
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {segments.map((segment) => (
          <span className={segment.line ? 'fold-text-line' : 'fold-text-segment'} key={segment.key}>
            <span className="fold-text-piece">{segment.text}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
