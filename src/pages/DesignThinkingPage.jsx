import { useEffect, useRef, useState } from 'react'
import './DesignThinkingPage.css'
import PortfolioMenu from '../components/PortfolioMenu.jsx'

const thinkingItems = [
  {
    question: '智能充电桩｜设计指南',
    type: 'article',
  },
  {
    question: 'AIGC 数字界面｜交互范式拆解',
    type: 'ai-agent',
  },
  {
    question: '设计心理学笔记',
    type: 'design-psychology',
  },
  {
    question: 'AI 搜索体验｜设计避坑',
    type: 'ai-search',
  },
  {
    question: 'AI Agent 交互｜场景体验思考',
    type: 'agent-reflections',
  },
  {
    question: '这里之后会更新哪些内容？',
    answer: '这里将陆续补充项目复盘、方法笔记、设计系统实践与日常观察。',
  },
]

function ThinkingAccordion({ item, index, open, mounted, onToggle }) {
  const panelId = `thinking-panel-${index}`
  const buttonId = `thinking-trigger-${index}`

  return (
    <article
      className={`thinking-item ${open ? 'is-open' : ''}`}
      data-thinking-reveal
      data-visible={index === 0 ? 'true' : undefined}
      style={{ '--item-delay': index === 0 ? '0ms' : `${index * 55}ms` }}
    >
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
          {mounted && (item.type === 'article' ? <ChargingArticle /> : item.type === 'ai-agent' ? <AiAgentArticle /> : item.type === 'design-psychology' ? <DesignPsychologyArticle /> : item.type === 'ai-search' ? <AiSearchArticle /> : item.type === 'agent-reflections' ? <AgentReflectionsArticle /> : <p>{item.answer}</p>)}
        </div>
      </div>
    </article>
  )
}

function IsolationEffectVisual() {
  return (
    <figure className="psychology-visual psychology-isolation" aria-label="冯·雷斯托夫效应可视化">
      <div className="psychology-visual-heading"><strong>相似中的差异，更容易被记住</strong><span>VON RESTORFF EFFECT</span></div>
      <div className="isolation-field" aria-hidden="true">
        {Array.from({ length: 15 }, (_, index) => <i className={index === 8 ? 'is-isolated' : ''} key={index} />)}
      </div>
      <div className="psychology-visual-note"><span>一致背景建立秩序</span><span>单一差异抢夺注意</span><span>形成清晰记忆点</span></div>
    </figure>
  )
}

function ConditioningLoopVisual() {
  return (
    <figure className="psychology-visual psychology-conditioning" aria-label="经典性条件反射可视化">
      <div className="psychology-visual-heading"><strong>刺激与反馈，逐渐形成行为习惯</strong><span>CONDITIONING LOOP</span></div>
      <div className="conditioning-flow">
        <div><i>01</i><strong>刺激</strong><span>声音 · 灯光 · 操作提示</span></div>
        <b aria-hidden="true">→</b>
        <div><i>02</i><strong>重复联结</strong><span>奖赏 · 惩罚 · 情绪反馈</span></div>
        <b aria-hidden="true">→</b>
        <div className="is-accent"><i>03</i><strong>条件反应</strong><span>预期形成 · 行为发生</span></div>
      </div>
    </figure>
  )
}

function DesignPsychologyArticle() {
  return (
    <article className="thinking-article thinking-psychology-article">
      <header className="thinking-article-header">
        <span className="thinking-article-category">DESIGN PSYCHOLOGY · 理论还原与拓展思考</span>
        <h3>《设计心理学》，<br className="thinking-article-title-break" />交互底层逻辑笔记</h3>
        <p className="thinking-article-subtitle">理论还原与拓展思考：从认知抢夺、行为习惯养成到 UI / AI 交互实战</p>
        <div className="thinking-article-meta">
          <div className="thinking-keywords" aria-label="文章关键词">
            <span>认知心理学</span>
            <span>注意力机制</span>
            <span>习惯养成</span>
            <span>交互范式</span>
          </div>
        </div>
      </header>

      <section>
        <span className="thinking-article-section-no">01</span>
        <h3>冯·雷斯托夫效应（隔离效应）</h3>
        <div className="thinking-psychology-subsection">
          <h4>理论介绍</h4>
          <p>当存在多个相似物体时，与众不同的那个更容易被记住。特殊属性能在短时间内快速抢夺人们的注意力，并形成记忆点。</p>
        </div>
        <IsolationEffectVisual />
        <div className="thinking-psychology-subsection">
          <h4>应用场景与案例</h4>
          <ul>
            <li><strong>核心元素呈现：</strong>用来强调或呈现设计的主要元素，相对于普通事件或物体，记住独特、有特色物体的可能性会增大。</li>
            <li><strong>功能与品牌记忆：</strong>首页底部导航栏突出的“+”发布按键；节日 Logo 改变设计，强化用户记忆中的时间特征，让用户更好地记住特定时间点。</li>
          </ul>
        </div>
        <blockquote>
          <strong>拓展知识</strong>
          <p><b>防“过度隔离”反吞噬：</b>若页面试图突出过多元素，背景就会失去统一秩序，引发视觉噪音与认知疲劳。高对比的“隔离”必须建立在背景极度一致性（Grid &amp; Order）的基础之上。</p>
          <p><b>动态与情境隔离（Contextual Timing）：</b>在 AI / Agent 界面中，隔离不再仅是静态的颜色区别，更是动态出现的时机。例如在用户产生长卡顿或输入犹豫时，高亮弹出针对性 Prompt 建议，产生意料之外又情理之中的注意力拉升。</p>
        </blockquote>
      </section>

      <section>
        <span className="thinking-article-section-no">02</span>
        <h3>经典性条件反射</h3>
        <div className="thinking-psychology-subsection">
          <h4>理论介绍</h4>
          <p>人通过一系列的学习，便可以出现对不同声音、灯光、交互提示等刺激的不同行为反应。指一个刺激和另一个带有奖赏或惩罚的无条件刺激多次联结，使用户在单独呈现该刺激时，也能引发类似无条件反应的条件反应。</p>
          <ul>
            <li><strong>刺激泛化：</strong>与条件刺激相似的刺激会引起类似条件反射的现象。</li>
            <li><strong>刺激分化：</strong>通过选择性强化和消退，用户学会对条件刺激和类似的刺激做出不同反应。</li>
          </ul>
        </div>
        <ConditioningLoopVisual />
        <div className="thinking-psychology-subsection">
          <h4>应用场景与案例</h4>
          <ul>
            <li><strong>品牌与情感绑定：</strong>广告中通过注入刺激物引发消费者对企业品牌和产品的联系，从而产生相应情感依赖及行为。</li>
            <li><strong>系统提示音与勿扰模式：</strong>为了帮助用户对不同消息做出不同反应，提供不同提示声音供用户进行设置（刺激分化）；减少条件反射时，可以使用“勿扰模式”。</li>
          </ul>
        </div>
        <blockquote>
          <strong>拓展知识</strong>
          <p><b>无感知微交互（Micro-interactions）构建：</b>产品的“爽快感”大多来源于精心培养的条件反射（如下拉刷新的机械阻尼感与“叮”的一声反馈）。设计时应尽量遵从 OS 默认的“刺激-反应”习惯，切忌随意重置核心手势或常用按键位置。</p>
          <p><b>降低疲劳与心理负担：</b>频繁的红点、强弹窗属于“高刺激联结”，长期使用会导致用户产生防御性无视或焦虑。设计中需要合理引入“刺激消退”机制，帮助用户从过度条件反射中解放。</p>
        </blockquote>
      </section>
    </article>
  )
}

function AiAgentArticle() {
  return (
    <article className="thinking-article thinking-agent-article">
      <header className="thinking-article-header">
        <span className="thinking-article-category">AIGC DESIGN NOTES · 交互专题设计笔记</span>
        <h3>拆解 AIGC 数字界面系统，<br className="thinking-article-title-break" />4 个交互范式与底层逻辑</h3>
        <p className="thinking-article-subtitle">深入解析 HAIX 智慧体：从交互范式、感知边界到 Agent 模式演进的设计思考</p>
        <div className="thinking-article-meta">
          <div className="thinking-keywords" aria-label="文章关键词">
            <span>软硬融合</span>
            <span>交互范式</span>
            <span>Copilot 与 Agent</span>
            <span>体验透明度</span>
          </div>
        </div>
      </header>

      <div className="thinking-article-lead">
        <span>从“操作指令”到“人机共生”</span>
        <p>生成式 AI 正在让 UI/UX 从确定性的点击与拖拽，转向能够理解上下文、预判意图并生成结果的人机协作系统。</p>
        <p>AI 体验设计的核心，是在 AI 的不确定性与用户的掌控感之间建立信任。</p>
      </div>

      <section>
        <span className="thinking-article-section-no">01</span>
        <h3>HAIX 智慧体的 4 大核心交互范式</h3>
        <p>不同任务对注意力、界面承载和 AI 参与程度的要求并不相同。四种范式并非互斥，而是共同组成一套可切换的协作语言。</p>
        <div className="aigc-paradigm-grid">
          <div><span>01 · IMMERSIVE</span><strong>沉浸式</strong><b>AI 即系统本身</b><p>以全景对话或全局协作承载探索与生成任务，用户注意力集中在智慧体。</p></div>
          <div><span>02 · COOPERATIVE</span><strong>协作式</strong><b>双核并行 · Co-pilot</b><p>AI 与业务界面以分屏或侧栏并行，提供数据、建议与决策支持，不打断主流程。</p></div>
          <div><span>03 · CONTEXTUAL</span><strong>情境式</strong><b>随唤随到 · Just-in-time</b><p>通过右键、快捷键、长按或浮动工具栏轻量触发，用完即走，把注意力留给业务。</p></div>
          <div><span>04 · GENERATIVE</span><strong>生成式</strong><b>结果即界面</b><p>在光标位置直接生成，或以弹窗、卡片呈现关联内容，让输出成为界面的一部分。</p></div>
        </div>
        <blockquote>未来的体验不是只选一种范式，而是在范式间无缝过渡：一次情境式右键触发的复杂任务，可以展开为协作式侧栏，并在需要时进入沉浸式画布。</blockquote>
      </section>

      <section>
        <span className="thinking-article-section-no">02</span>
        <h3>人机协作模式的演进路径</h3>
        <p>从 Embedding 到 Copilot，再到 Agent，AI 的参与程度逐步提高，界面也从操作工具转向协作空间与监督面板。</p>
        <div className="aigc-evolution" aria-label="Embedding、Copilot 与 Agent 三种人机协作模式">
          <div className="aigc-evolution-stage is-embedding">
            <span>1.0 · 辅助</span><strong>Embedding 模式</strong>
            <div className="aigc-orbit"><i className="is-human">human</i><i className="is-machine">machine</i></div>
            <p><b>角色：</b>润色、抠图等轻量工具。触发应灵活即时，需要时出现，不需要时隐去。</p>
          </div>
          <div className="aigc-evolution-stage is-copilot">
            <span>2.0 · 共驾</span><strong>Copilot 模式</strong>
            <div className="aigc-orbit"><i className="is-human">human</i><i className="is-machine">machine</i></div>
            <p><b>角色：</b>共同工作的协作者。强调双向交互、实时反馈、思考状态与高效调整入口。</p>
          </div>
          <div className="aigc-evolution-stage is-agent">
            <span>3.0 · 自主</span><strong>Agent 模式</strong>
            <div className="aigc-orbit"><i className="is-machine">machine<i className="is-human">human</i></i></div>
            <p><b>角色：</b>自主拆解任务并调用能力。GUI 转为监督与审查面板，支持介入、追溯和结果验证。</p>
          </div>
        </div>
      </section>

      <section>
        <span className="thinking-article-section-no">03</span>
        <h3>AI 体验设计的 5 大底层原则</h3>
        <div className="aigc-principles">
          <div><span>01</span><strong>自然唤起</strong><p>把 AI 无缝接入既有工作流与习惯，减少阻尼感。</p></div>
          <div><span>02</span><strong>清晰边界</strong><p>明确展示能力上限与局限，避免不切实际的预期。</p></div>
          <div><span>03</span><strong>高效沟通</strong><p>用场景化提示词、自动补齐与输入引导降低 Prompt 门槛。</p></div>
          <div><span>04</span><strong>可控生成</strong><p>提供渐进选择、版本回溯、语义微调与版权数字水印。</p></div>
          <div><span>05</span><strong>可成长的模型</strong><p>用点赞、点踩与修改反馈，推动持续进化与个性化服务。</p></div>
        </div>
      </section>

      <section>
        <span className="thinking-article-section-no">04</span>
        <h3>设计落地的下一步</h3>
        <div className="aigc-next-steps">
          <div><strong>防误触与二次确认机制</strong><p>面对 Agent 的批量或高风险操作，用 Checkpoint 在关键节点拦截并确认。</p></div>
          <div><strong>容错与对话故障修复</strong><p>当 AI 误解或产生幻觉时，提供澄清、替代方案与人工兜底。</p></div>
          <div><strong>多模态反馈的统一性</strong><p>统一卡片、骨架屏、状态微动效与声音反馈，降低等待焦虑。</p></div>
        </div>
      </section>

      <section className="thinking-article-summary">
        <span>总结</span>
        <p>AIGC 界面不是给传统产品加一个聊天框，而是重新组织注意力、行动权与反馈方式。只有让能力边界清晰、生成过程可控、协作状态可理解，AI 才能从“会回答”走向“值得信任地共同工作”。</p>
      </section>
    </article>
  )
}

function AiSearchArticle() {
  return (
    <article className="thinking-article thinking-search-article">
      <header className="thinking-article-header">
        <span className="thinking-article-category">AI SEARCH UX NOTE · 设计随手记</span>
        <h3>AI 搜东西到底该怎么做？<br className="thinking-article-title-break" />聊聊主流浏览器的设计坑</h3>
        <p className="thinking-article-subtitle">从“找网页”到“直接给答案”，重新理解人机合作搜索的界面</p>
        <div className="thinking-article-meta">
          <div className="thinking-keywords" aria-label="文章关键词">
            <span>AI 搜索</span><span>信任设计</span><span>追问引导</span><span>结构化答案</span>
          </div>
        </div>
      </header>

      <div className="thinking-article-lead">
        <span>从“找网页”到“直接给答案”</span>
        <p>传统搜索把一串网页链接交给用户，需要自己逐个打开、判断和拼接信息。AI 搜索更像身边的助手：理解自然语言，把分散内容看完、总结，再交付一份可以继续追问的答案。</p>
        <p>但“直接给答案”也带来了新的问题：怎样让人相信内容、知道下一步问什么，并且不被大段文字淹没？</p>
      </div>

      <section>
        <span className="thinking-article-section-no">01</span>
        <h3>市面上常见的两种产品形态</h3>
        <div className="search-mode-compare">
          <div>
            <span>CONVERSATIONAL</span><strong>聊天式对答框</strong><b>New Bing / Perplexity</b>
            <dl><dt>顺手之处</dt><dd>可以用大白话提问，承接上下文继续追问，历史记录也便于回看。</dd><dt>体验风险</dt><dd>连续追问容易跑偏；大段气泡文字阅读压力高，也容易让人怀疑答案是否可靠。</dd></dl>
          </div>
          <div>
            <span>ANSWER CARD</span><strong>置顶 AI 答案卡</strong><b>Google SGE</b>
            <dl><dt>顺手之处</dt><dd>保留传统搜索习惯，AI 总结在上、网页链接在下，用户可以快速核验来源。</dd><dt>体验风险</dt><dd>连续追问和上下文承接较弱；置顶卡片如果太像广告，也可能被习惯性忽略。</dd></dl>
          </div>
        </div>
      </section>

      <section>
        <span className="thinking-article-section-no">02</span>
        <h3>做设计时，我总结的 3 个实用解法</h3>
        <div className="search-solutions">
          <div><span>01</span><strong>别让用户觉得 AI 在“瞎编”</strong><p>每一段关键结论都应提供脚标或来源卡片，点击即可查看参考网页。让答案可验证，才能把判断权交还给用户。</p></div>
          <div><span>02</span><strong>教用户怎么“提好问题”</strong><p>用“猜你想问”的追问胶囊、快捷模板和自动补全降低提问门槛，避免用户对着输入框发呆或漫无目的地闲聊。</p></div>
          <div><span>03</span><strong>别全用文字，改用结构化展示</strong><p>对比型搜索自动生成表格，教程型内容整理成步骤卡片。让答案选择合适的组件，而不是永远输出一堵文字墙。</p></div>
        </div>
      </section>

      <section className="thinking-article-summary">
        <span>一句话总结</span>
        <p>AI 搜索的终极形态，不是在搜索框旁贴一个“AI”标签，而是帮助用户把事情办完：搜代码可以进入调试环境，搜攻略可以生成旅行清单。好的设计既要让 AI 显得聪明，也不能让用户失去控制感。</p>
      </section>
    </article>
  )
}

function AgentReflectionsArticle() {
  return (
    <article className="thinking-article thinking-text-article">
      <header className="thinking-article-header">
        <span className="thinking-article-category">AI AGENT · 场景化交互体验</span>
        <h3>从“人找服务”到“服务找人”</h3>
        <p className="thinking-article-subtitle">更自然、接地气的交互思考笔记</p>
        <div className="thinking-article-meta">
          <div className="thinking-keywords" aria-label="文章关键词">
            <span>AI Agent</span><span>场景化服务</span><span>多端协同</span><span>系统逻辑</span>
          </div>
        </div>
      </header>

      <div className="thinking-article-lead">
        <span>分享后的设计复盘</span>
        <p>以前做设计，常常琢磨怎样把界面画得更好看、怎样把跳转流程缩短一两步。但 AI 正在改变很多底层规则。这篇笔记把分享中的要点与日常产品经验放在一起，记录真正能落到工作里的思考。</p>
      </div>

      <section><span className="thinking-article-section-no">01</span><h3>APP 不重要了，把事情搞定才重要</h3><p>以前使用手机完全是“人找 APP”。比如明早去外地开会，需要依次打开机票、打车和点餐软件；只要航班延误，中间步骤又要全部手动调整。</p><p>AI 智慧体让软件边界逐渐模糊。用户真正要的不是打开某个 APP，而是“搞定出行和早餐”。未来的交互更像一位贴心助手：用户表达目标，系统把各类服务串联起来，直接交付方案。交互重点不再是教人点哪里，而是让系统听懂人真正想做什么。</p></section>

      <section><span className="thinking-article-section-no">02</span><h3>把满屏 Icon 变成随用随走的卡片</h3><p>当 APP 被解构，手机界面也不必继续面对一排静态图标。智慧看板 Board 用“场景”和“时间”驱动内容，把快捷操作与时间轴结合起来。</p><p>早上准备出门，界面可以出现通勤时间和咖啡预订；到了机场，则切换为机票二维码、登机口提醒和目的地天气。正在进行、接下来要做和未来计划一目了然。对用户来说，概念越少、完成当前任务所需的心思越少，体验就越顺畅。</p></section>

      <section><span className="thinking-article-section-no">03</span><h3>AI 也会猜错，设计要给它“留余地”</h3><p>传统 UI 的按钮结果通常确定，AI 却可能猜错偏好，或给出不准确的建议。因此设计需要建立“分级边界”：静默同步行程等低风险操作可以自动完成；订票、改签等关键操作必须保留清晰的协商与确认，把选择权交还给用户。</p><p>系统如何记住偏好、为什么推荐这项内容，也应当方便查看与修改。只有 AI 表现得透明、听话，用户才敢放心把事情交给它。</p></section>

      <section><span className="thinking-article-section-no">04</span><h3>跨设备协同，不是把手机界面拉大拉小</h3><p>真正的多端协同，要判断用户在什么场景使用什么设备。驾驶时不适合盯着大屏找按钮，车机应尽量降低视觉操作，以语音和清晰地图为主；手机上的目的地应无缝接续到车机，停车后再自动推荐停车场并完成无感支付。</p><p>客厅大屏则从“个人”转为“全家共享”，需要兼顾家庭通话、全家出行通知和休闲娱乐。设备不同，提供的服务切面也应不同，这才是以人为中心。</p></section>

      <section><span className="thinking-article-section-no">05</span><h3>交互设计师以后要设计什么？</h3><p>当 AI 把繁琐的操作步骤抹平，交互设计师不能只盯着像素和流程图，而要开始设计系统逻辑与场景规则：系统在不同场景中应使用语音、手势还是点击，复杂 AI 能力怎样形成易懂的规范，技术与人的习惯如何取得平衡。</p><p>技术会变，但设计的本质没有变：用最自然、最不折腾的方式，帮人把生活过得更顺心。</p></section>
    </article>
  )
}

function ChargingArticle() {
  return (
    <article className="thinking-article">
      <header className="thinking-article-header">
        <span className="thinking-article-category">PRODUCT DESIGN NOTES · 软硬件融合体验设计</span>
        <h3>智能充电桩不只是一块大屏，<br className="thinking-article-title-break" />这类产品应该怎样设计？</h3>
        <p className="thinking-article-subtitle">从完整任务、户外场景、软硬协同到异常与运营效率的设计框架</p>
        <div className="thinking-article-meta">
          <div className="thinking-keywords" aria-label="文章关键词">
            <span>场景约束</span>
            <span>软硬协同</span>
            <span>户外可读性</span>
            <span>异常与运维</span>
            <span>B2B2C</span>
          </div>
        </div>
      </header>
      <div className="thinking-article-lead">
        <span>先重新定义设计对象</span>
        <p>充电体验不是从用户看见屏幕开始，而是从驶入场站、判断设备是否可用、停入对应车位开始，直到充电结束、完成结算并确认可以离场。屏幕只是这条服务链路中的一个触点。</p>
        <p>设计这类产品，需要同时处理真实环境、软硬件状态和商业运营三层问题：用户要快速完成任务，设备要准确表达状态，运营方则要控制周转、客服与维护成本。界面只有放回完整系统中，设计判断才会成立。</p>
      </div>

      <section>
        <span className="thinking-article-section-no">01</span>
        <h3>第一步不是画界面，而是定义完整任务</h3>
        <p>如果只研究“扫码以后发生什么”，就会遗漏真正影响体验的前后环节。设计前应先把一次充电拆成完整任务链路，并标出每个阶段的用户目标、设备状态和失败风险。</p>
        <div className="thinking-solution-block">
          <h4>一条完整链路至少包含 5 个阶段</h4>
          <ul>
            <li><strong>到达与判断：</strong>用户能否在几米外看出设备是否空闲、故障，以及应该驶向哪个车位。</li>
            <li><strong>停车与取枪：</strong>车位、枪位和车辆充电口是否匹配，线缆是否容易拿取和归位。</li>
            <li><strong>鉴权与启动：</strong>刷卡、扫码、账号或即插即充是否有清晰的主次关系，启动失败能否快速恢复。</li>
            <li><strong>等待与监控：</strong>用户是否能随时确认充电状态、预计时间、费用和异常提醒。</li>
            <li><strong>结束与离场：</strong>停止、拔枪、结算、退款和占位规则是否明确，用户是否知道任务已经真正结束。</li>
          </ul>
        </div>
        <p>同时还要把运营商和维护人员纳入系统：运营商关心设备周转率、客服量和支付成功率；维护人员需要快速定位故障、确认影响范围并恢复服务。终端界面、运营后台和设备状态不是三个独立产品，而是同一套服务的不同视角。</p>
        <figure>
          <img src="/images/thinking/charging/pain-points.png" alt="充电桩硬件设计的三类割裂痛点：软硬件割裂、信息盲盒和交互跑马拉松" fetchPriority="high" decoding="async" />
          <figcaption>当链路没有被整体设计时，问题通常表现为软硬脱节、状态隐蔽和跨触点操作过长。</figcaption>
        </figure>
        <blockquote>设计的起点不是“这块屏幕应该放什么”，而是“用户此刻要完成什么，系统需要给出什么确定性”。</blockquote>
      </section>

      <section>
        <span className="thinking-article-section-no">02</span>
        <h3>场景约束，应该先于视觉风格</h3>
        <p>充电桩是户外公共设备，不是被用户捧在手里的手机。强光、夜间、雨雪、厚手套、陌生用户、不同身高与临时网络中断，都会直接改变界面的字号、对比度、触控方式和信息优先级。</p>
        <p>因此，一块屏幕需要同时服务两种观看距离：用户在几米外先判断“能不能用”，走近后才完成“怎么开始”。远距状态和近距操作不能混在同一个信息层级里。</p>
        <dl className="thinking-wayfinding-table">
          <div><dt>远距状态层</dt><dd>用高对比灯光、图形和短文本表达空闲、占用、充电、完成、故障与离线。颜色不能成为唯一判断依据。</dd></div>
          <div><dt>近距任务层</dt><dd>屏幕只保留当前步骤、下一步动作和关键费用信息。按钮要适应站立操作、戴手套和低精度触控。</dd></div>
          <div><dt>数字与动态信息</dt><dd>电量、金额、时间等高频变化数据使用稳定字宽与对齐方式，避免数字变化时产生跳动和误读。</dd></div>
          <div><dt>无障碍与全球化</dt><dd>关键操作放在易触达区域，同时考虑轮椅视角、多语言长度、图标理解和声音不可用的情况。</dd></div>
        </dl>
        <blockquote>户外界面的“精致”，不是塞入更多细节，而是在最差环境下依然看得见、读得懂、操作得准。</blockquote>
      </section>

      <section>
        <span className="thinking-article-section-no">03</span>
        <h3>让软件和硬件表达同一个状态</h3>
        <p>软硬融合的关键并不是让屏幕看起来像设备，而是建立一套跨触点一致的状态语言。屏幕、灯带、充电枪、物理按键、声音和手机端必须对“现在发生了什么”给出相同答案。</p>
        <div className="thinking-solution-block">
          <h4>建立状态矩阵，而不是分别设计每个界面</h4>
          <p>先统一空闲、已连接、鉴权中、充电中、暂停、完成、故障和离线等核心状态，再为每个状态定义各触点的表达：</p>
          <ul>
            <li><strong>灯光负责远距判断：</strong>让用户不走近屏幕也能识别可用、充电或故障，但同时配合图形和文字，避免只依赖颜色。</li>
            <li><strong>屏幕负责解释与行动：</strong>告诉用户当前状态、为什么会这样，以及下一步应该做什么。</li>
            <li><strong>物理位置与数字布局对应：</strong>左右双枪在界面中保持左右镜像；实体按键与屏幕选项建立直接的位置映射。</li>
            <li><strong>多端状态同步：</strong>桩端、手机端和运营后台使用同一状态源，避免屏幕显示充电、手机却显示启动失败。</li>
          </ul>
        </div>
        <p>动画也应该服务状态变化。例如连接成功后，动效可以从实体枪位方向进入对应屏幕区域，帮助用户理解“这把枪已经与这个任务绑定”；而不是添加与物理动作无关的装饰动画。</p>
      </section>

      <section>
        <span className="thinking-article-section-no">04</span>
        <h3>缩短主路径，同时保留清晰的降级路径</h3>
        <p>高频公共设备不应该要求用户学习复杂系统。设计目标不是把所有能力放进首页，而是让最常见的充电任务尽可能少做决定。</p>
        <div className="thinking-solution-block">
          <h4>主路径与备用路径必须同时被设计</h4>
          <ul>
            <li><strong>主路径：</strong>插枪后自动识别设备和车辆，优先呈现最直接的鉴权方式，启动后立即反馈是否成功。</li>
            <li><strong>备用鉴权：</strong>刷卡、扫码、账号输入等方式按使用概率分层，不让多个同级入口同时竞争。</li>
            <li><strong>弱网与离线：</strong>明确哪些操作仍可继续、数据何时同步，以及用户是否会被重复扣费。</li>
            <li><strong>跨端接力：</strong>如果必须跳转手机，桩端要保留任务状态与返回指引，不能让用户在两个界面之间反复确认。</li>
          </ul>
        </div>
        <p>所谓 Zero-UI 不是取消屏幕，而是减少不必要的屏幕交互。当插枪、刷卡等物理动作已经表达了明确意图，系统应直接反馈结果；只有发生选择、风险或异常时，才要求用户进一步操作。</p>
        <blockquote>理想状态不是让用户与屏幕频繁对话，而是让设备理解动作、及时反馈，并在需要时提供可见的控制权。</blockquote>
      </section>

      <section>
        <span className="thinking-article-section-no">05</span>
        <h3>异常体验，决定用户是否真正信任系统</h3>
        <p>充电涉及实体设备、能源、支付和时间成本，用户最焦虑的往往不是正常流程，而是“不知道是否已经开始”“中断后是否扣费”“拔不出枪该怎么办”。因此异常不能只用一个错误码结束。</p>
        <div className="thinking-solution-block">
          <h4>一条有效的异常信息需要回答 5 个问题</h4>
          <ul>
            <li><strong>发生了什么：</strong>用用户语言描述当前状态，而不是只显示内部错误代码。</li>
            <li><strong>设备是否安全：</strong>明确车辆、充电枪和支付当前是否处于安全状态。</li>
            <li><strong>用户能做什么：</strong>给出唯一、可执行的下一步，并说明是否可以重试。</li>
            <li><strong>费用如何处理：</strong>说明是否已经计费、是否会退款，以及预计处理时间。</li>
            <li><strong>何时转人工：</strong>在用户无法自助恢复时，直接提供带设备编号和故障上下文的求助入口。</li>
          </ul>
        </div>
        <p>对运营方而言，体验价值也需要被衡量。可以关注启动成功率、平均启动时长、求助率、异常自助恢复率、支付完成率和车位周转时间。设计优化只有与这些指标关联，才能从“界面更好看”转化为可验证的商业价值。</p>
        <figure>
          <img src="/images/thinking/charging/method-notes.png" alt="关于隐形交互、场景约束和商业体验的三条方法论" loading="lazy" decoding="async" />
          <figcaption>可迁移的方法：先研究场景约束，再统一跨触点状态，最后用任务与运营指标验证设计。</figcaption>
        </figure>
      </section>

      <section className="thinking-article-summary">
        <span>总结</span>
        <p>设计智能充电桩这类软硬件产品，可以沿着“完整任务 → 场景约束 → 状态系统 → 主路径与降级 → 异常与指标”逐层推进。它要求设计师走出屏幕，把物理动作、设备反馈、数字界面和运营系统组织成同一种体验语言。好的结果不是让用户注意到界面，而是让他在陌生环境里依然清楚下一步、相信系统正在正确工作。</p>
      </section>
    </article>
  )
}

export default function DesignThinkingPage() {
  const initialArticle = Number(window.location.hash.match(/^#thinking-trigger-([0-4])$/)?.[1] ?? 0)
  const [openIndex, setOpenIndex] = useState(initialArticle)
  const [mountedIndexes, setMountedIndexes] = useState(() => new Set([initialArticle]))
  const pageRef = useRef(null)
  const accordionFrameRef = useRef(0)

  const handleAccordionToggle = (index, event) => {
    const item = event.currentTarget.closest('.thinking-item')
    const keepHeaderInPlace = openIndex >= 0 && openIndex !== index && item
    const headerTop = keepHeaderInPlace ? item.getBoundingClientRect().top : 0

    setMountedIndexes((current) => {
      if (current.has(index)) return current
      const next = new Set(current)
      next.add(index)
      return next
    })
    setOpenIndex((current) => current === index ? -1 : index)

    if (!keepHeaderInPlace) return
    window.cancelAnimationFrame(accordionFrameRef.current)
    const startedAt = performance.now()
    const holdClickedHeader = (now) => {
      if (!item.isConnected) return
      const delta = item.getBoundingClientRect().top - headerTop
      if (Math.abs(delta) > 0.1) window.scrollTo(0, window.scrollY + delta)
      if (now - startedAt < 540) accordionFrameRef.current = requestAnimationFrame(holdClickedHeader)
      else accordionFrameRef.current = 0
    }
    accordionFrameRef.current = requestAnimationFrame(holdClickedHeader)
  }

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
      window.cancelAnimationFrame(accordionFrameRef.current)
      observer.disconnect()
    }
  }, [])

  return (
    <main
      ref={pageRef}
      className="thinking-page"
      id="top"
      onContextMenu={(event) => { if (event.target.closest('.thinking-article img')) event.preventDefault() }}
      onDragStart={(event) => { if (event.target.closest('.thinking-article img')) event.preventDefault() }}
    >
      <PortfolioMenu subpage />
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
              mounted={mountedIndexes.has(index)}
              onToggle={(event) => handleAccordionToggle(index, event)}
            />
          ))}
        </div>

        <aside className="thinking-aside" data-thinking-reveal>
          <div className="thinking-aside-copy">
            <span className="thinking-aside-label">ABOUT THIS SPACE</span>
            <p>这里会持续收录我的设计判断、工作方法和项目复盘。</p>
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
