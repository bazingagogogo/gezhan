import { useEffect, useRef, useState } from 'react'
import './PortfolioMenu.css'

export default function PortfolioMenu({ dark = false, subpage = false }) {
  const homeLink = hash => subpage ? `/${hash}` : hash
  const [open, setOpen] = useState(false)
  const root = useRef(null), toggle = useRef(null)
  useEffect(() => {
    if (!open) return
    const dismiss = e => { if (!root.current.contains(e.target)) setOpen(false) }
    const escape = e => { if (e.key === 'Escape') { setOpen(false); toggle.current.focus() } }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) }
  }, [open])
  const copyValue = value => async event => {
    event.preventDefault()
    await navigator.clipboard.writeText(value)
    setOpen(false)
  }
  return <div ref={root} data-visible={subpage ? 'true' : undefined} className={`portfolio-menu ${dark ? 'noomo-menu pm-dark' : 'pb-nav'} ${open ? 'pm-open' : ''}`}>
    <div className="pm-top"><a className="pm-brand" href={homeLink('#top')} onClick={() => setOpen(false)}>XU YONGFANG <i /></a>
      <button ref={toggle} aria-expanded={open} aria-controls={dark ? 'hero-menu-panel' : 'body-menu-panel'} onClick={() => setOpen(v => !v)}><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="6" cy="6" r="4"/><circle cx="14" cy="6" r="4"/><circle cx="6" cy="14" r="4"/><circle cx="14" cy="14" r="4"/></svg><span>菜单</span></button>
    </div>
    <div className="pm-reveal" inert={!open} id={dark ? 'hero-menu-panel' : 'body-menu-panel'}><div className="pm-content">
      <small>Menu</small><nav className="pm-links" aria-label={dark ? '首屏导航' : '内容导航'} onClick={() => setOpen(false)}>
        {[['#top','首页'],['#works','项目与探索'],['/about','关于我'],['/thinking','设计思考']].map(([href,label]) => <a key={href} href={href.startsWith('/') ? href : homeLink(href)}><span>{label}</span><span aria-hidden="true">{label}</span></a>)}
      </nav>
      <div className="pm-bottom" onClick={() => setOpen(false)}><div><small>Downloads</small><a href="/xuyongfang-portfolio.pdf" download>下载作品集</a><a href="/downloads/xuyongfang-resume-uiux.pdf" download>下载简历</a></div><div><small>Contact</small><a href="tel:17611540569" onClick={copyValue('17611540569')}>联系我</a><a href="mailto:1403790559@qq.com" onClick={copyValue('1403790559@qq.com')}>1403790559@qq.com</a></div></div>
    </div></div>
  </div>
}
