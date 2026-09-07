import { useEffect } from 'react'
import PortfolioMenu from '../components/PortfolioMenu.jsx'
import './AboutDetailPage.css'

const roles = [
  { company: '软通动力信息技术（集团）股份有限公司', role: 'UI/UX 设计师', date: '2024.02 — 2026.04', body: '负责企业级 SaaS 产品体验升级与设计系统建设，覆盖邮件、云笔记、云空间、智能搜索与云知识等 App、PC、Web 和后台产品。通过用户反馈、竞品深度调研和用户旅程梳理推进复杂流程优化，并独立负责云知识、智能搜索等核心模块的高保真设计与交互优化。', result: '核心任务操作效率提升，相关负面反馈减少约 5%；方案验证中的任务完成率提升约 15%；建立并维护覆盖 B/C 端的设计系统。' },
  { company: '深圳壹木航科技有限公司', role: '产品助理实习', date: '2023.09 — 2023.12', body: '负责数据分析后台二级功能的产品需求文档与数据埋点方案设计；独立主导公司官网 UI/UX 改版，优化信息架构和视觉呈现，并改善部分页面的交互流程。' },
  { company: 'Flat Incubator', role: '设计助理实习', date: '2022.09 — 2022.11', body: '参与面向中东市场的网盘产品视觉迭代与多页面一致性改造；协助建立组件库，支持后续页面复用与设计提效，并负责海外版页面及运营视频与单条视频最高获赞 1000+。' },
]

export default function AboutDetailPage() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-about-reveal]')
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.setAttribute('data-visible', 'true')), { threshold: .12 })
    nodes.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [])
  return <main className="about-detail">
    <PortfolioMenu subpage />
    <header className="ad-heading" data-about-reveal>
      <span>PROFILE / 2026</span><span>SHENZHEN, CN</span>
      <h1>关于我</h1>
      <p>把复杂业务梳理成清晰、可验证、可持续迭代的产品体验。</p>
    </header>
    <div className="ad-grid">
      <aside className="ad-receipt" data-about-reveal>
        <div className="ad-photo-ring"><img src="/images/about-ascii-portrait.png" alt="许咏芳" /></div>
        <pre>*** XU YONGFANG ***</pre>
        <p>“DESIGN IS NOT ONLY<br />WHAT IT LOOKS LIKE,<br />BUT HOW IT WORKS.”</p>
        <div className="ad-ticket-meta"><span>UI / UX DESIGNER</span><span>近 3 年经验</span><span>深圳（可广州）</span><span>本科 / 广东技术师范大学</span></div>
        <div className="ad-downloads"><a href="/downloads/xuyongfang-resume-uiux.pdf" download>下载简历</a><a href="/xuyongfang-portfolio.pdf" download>下载作品集</a></div>
        <div className="ad-qr"><span>扫一扫，联系我</span><img src="/images/wechat-qr.png" alt="许咏芳的微信二维码" /></div>
        <small>THANKS FOR VISITING!</small>
      </aside>
      <section className="ad-column ad-overview" data-about-reveal>
        <h2>职业概述</h2>
        <p>近 3 年 UI/UX 项目与工作经验，聚焦企业级 SaaS 及 App、Web、PC、后台等多端产品。擅长复杂业务流程梳理、交互优化与设计系统建设，能够从需求理解、高保真设计持续跟进至研发走查和上线验证，并具备海外产品适配经验。</p>
        <h2>目标方向</h2>
        <dl><div><dt>目标岗位</dt><dd>UI/UX 设计师</dd></div><div><dt>求职状态</dt><dd>一周内可到岗</dd></div><div><dt>联系电话</dt><dd>176 1154 0569</dd></div><div><dt>电子邮箱</dt><dd>1403790559@qq.com</dd></div></dl>
      </section>
      <section className="ad-column ad-skills" data-about-reveal>
        <h2>个人能力</h2>
        <div><b>01</b><h3>UI/UX 设计</h3><p>跨平台设计规范、响应式设计、高保真原型、交互流程优化、用户研究、竞品分析与可用性测试。</p></div>
        <div><b>02</b><h3>设计系统</h3><p>独立构建与维护移动端、PC 端多端设计系统及组件库。</p></div>
        <div><b>03</b><h3>产品思维</h3><p>需求理解、功能定义辅助、PRD、埋点方案与数据敏感度。</p></div>
        <div><b>04</b><h3>协作落地</h3><p>设计评审、研发走查、还原验收与跨团队推进。</p></div>
        <h2>核心工具</h2><p>Figma / Blender / After Effects / Midjourney</p>
      </section>
      <section className="ad-column ad-experience" data-about-reveal>
        <h2>工作 / 项目经历</h2>
        {roles.map((item, index) => <article key={item.company}><span>{String(index + 1).padStart(2, '0')}</span><time>{item.date}</time><h3>{item.company}</h3><em>{item.role}</em><p>{item.body}</p>{item.result && <p className="ad-result"><strong>结果</strong>{item.result}</p>}</article>)}
      </section>
    </div>
    <footer className="ad-footer"><span>© 2026 XU YONGFANG</span><a href="/">返回首页 ↑</a></footer>
  </main>
}
