import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

const steps = [
  ['01', 'Find the right roofs', 'Ask for fresh permit leads near you. RidgePilot returns a clean, selectable list inside WhatsApp.'],
  ['02', 'Win the conversation', 'Qualify the homeowner, approve outreach, and keep every reply in the same thread.'],
  ['03', 'Build the job', 'Add a roof report, review measurements, choose pricing, and generate a complete takeoff.'],
  ['04', 'Send the proposal', 'Approve the final email and share a polished proposal PDF—without switching tools.'],
]

const documents = [
  ['Material takeoff', 'Clean quantities and measurements'],
  ['Priced takeoff', 'Labor and material costing'],
  ['Customer proposal', 'Margin-ready selling document'],
]

export default function Home() {
  return <>
    <a className={styles.skip} href="#main">Skip to content</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="RidgePilot home"><Image src="/ridgepilot-icon.png" alt="" width={38} height={38} priority/><span>RidgePilot</span></Link>
      <nav aria-label="Main navigation"><a href="#workflow">How it works</a><a href="#documents">Documents</a><Link className={styles.navCta} href="/workspace">Open workspace</Link></nav>
    </header>
    <main id="main">
      <section className={styles.hero}>
        <div className={styles.gridTexture}/>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><span/> Sales assistant for roofing contractors</p>
          <h1>Your next roofing job is already in <em>WhatsApp.</em></h1>
          <p className={styles.lede}>Find permit leads, contact homeowners, build material takeoffs, apply pricing, and send proposals from the chat you already use.</p>
          <div className={styles.heroActions}><Link className={styles.primary} href="/workspace">Try the live workspace <span>↗</span></Link><a className={styles.textLink} href="#workflow">See the full workflow <span>↓</span></a></div>
          <div className={styles.signal}><span className={styles.signalDot}/><strong>Built for the field.</strong> No new app to learn.</div>
        </div>
        <div className={styles.phoneWrap} aria-label="Example RidgePilot WhatsApp conversation">
          <div className={styles.phoneGlow}/>
          <div className={styles.phone}>
            <div className={styles.phoneHeader}><span className={styles.back}>‹</span><Image src="/ridgepilot-icon.png" alt="" width={34} height={34}/><div><strong>RidgePilot</strong><small>online</small></div><span className={styles.dots}>•••</span></div>
            <div className={styles.messages}>
              <div className={styles.userMessage}>Show me the latest roofing leads near Iowa City.<time>9:41</time></div>
              <div className={styles.botMessage}><b>3 new opportunities found</b><span>1. 1048 Wild Prairie Drive<br/>Roof replacement · Issued today</span><button>Choose lead</button><time>9:41</time></div>
              <div className={styles.userMessage}>Use the first one.<time>9:42</time></div>
              <div className={styles.botMessage}><b>Lead qualified.</b><span>Ready to draft homeowner outreach?</span><div className={styles.quickReplies}><i>Preview email</i><i>View lead</i></div><time>9:42</time></div>
            </div>
            <div className={styles.composer}><span>Message</span><b>➤</b></div>
          </div>
          <aside className={styles.floatingCard}><small>PROPOSAL READY</small><strong>$37,763.84</strong><span>Margin included · PDF generated</span></aside>
        </div>
      </section>

      <section className={styles.marquee} aria-label="RidgePilot capabilities"><div>LEADS <span>✦</span> OUTREACH <span>✦</span> ROOF REPORTS <span>✦</span> TAKEOFFS <span>✦</span> PRICING <span>✦</span> PROPOSALS <span>✦</span></div></section>

      <section className={styles.problem}>
        <p className={styles.sectionLabel}>THE FIELD DESK</p>
        <div><h2>Less tab hunting.<br/>More roofs won.</h2><p>RidgePilot connects the scattered steps between finding a permit and sending a price. The contractor stays in WhatsApp while the assistant handles the workflow behind the conversation.</p></div>
        <div className={styles.stats}><article><strong>1</strong><span>conversation from lead to proposal</span></article><article><strong>3</strong><span>sales-ready project documents</span></article><article><strong>0</strong><span>new software screens in the field</span></article></div>
      </section>

      <section className={styles.workflow} id="workflow">
        <div className={styles.sectionIntro}><p className={styles.sectionLabel}>HOW RIDGEPILOT WORKS</p><h2>A complete sales workflow.<br/>One familiar conversation.</h2></div>
        <div className={styles.stepGrid}>{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
      </section>

      <section className={styles.documents} id="documents">
        <div className={styles.documentVisual}>
          <div className={styles.paperBack}/><div className={styles.paperMid}/>
          <div className={styles.paper}><header><Image src="/ridgepilot-icon.png" alt="" width={34} height={34}/><span>RIDGEPILOT<br/><small>ROOFING PROPOSAL</small></span></header><div className={styles.paperAddress}>1048 Wild Prairie Drive<br/><span>Iowa City, IA 52246</span></div><div className={styles.paperLines}>{[82,96,68,91,74].map((width) => <i key={width} style={{width: `${width}%`}}/>)}</div><div className={styles.paperTotal}><span>Proposal total</span><strong>$37,763.84</strong></div></div>
        </div>
        <div className={styles.documentCopy}><p className={styles.sectionLabel}>THE PAPERWORK, HANDLED</p><h2>From roof measurements to a proposal worth signing.</h2><p>Every document is clean, customer-ready, and linked directly in WhatsApp. Pricing stays where it belongs, and your contractor margin appears only in the final proposal.</p><div className={styles.documentList}>{documents.map(([title, copy], index) => <div key={title}><span>0{index + 1}</span><p><strong>{title}</strong><small>{copy}</small></p><b>✓</b></div>)}</div></div>
      </section>

      <section className={styles.featureBand}>
        <div><span>⌁</span><h3>Natural conversation</h3><p>Type the way you talk. RidgePilot understands the request and moves the job forward.</p></div>
        <div><span>◎</span><h3>Approval before action</h3><p>Review emails, measurements, pricing, and proposals before anything is sent.</p></div>
        <div><span>↗</span><h3>Portal handoffs</h3><p>Open EagleView when needed, then bring the report back into the same workflow.</p></div>
      </section>

      <section className={styles.cta}>
        <Image src="/ridgepilot-icon.png" alt="RidgePilot" width={82} height={82}/><p className={styles.sectionLabel}>YOUR NEXT JOB STARTS HERE</p><h2>Put your roofing sales desk<br/>inside WhatsApp.</h2><p>See the complete lead-to-proposal workflow with the live RidgePilot workspace.</p><Link className={styles.primary} href="/workspace">Open RidgePilot <span>↗</span></Link>
      </section>
    </main>
    <footer className={styles.footer}><Link className={styles.brand} href="/"><Image src="/ridgepilot-icon.png" alt="" width={34} height={34}/><span>RidgePilot</span></Link><p>Built for roofing contractors who sell from the field.</p><nav><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/data-deletion">Data deletion</Link></nav></footer>
  </>
}
