'use client'
import { useEffect, useState } from 'react'
import type { Job, Lead } from '@/lib/types'
import { formatMoney } from '@/lib/pricing'
import styles from './page.module.css'

export default function Home() {
  const [state, setState] = useState<{ leads: Lead[]; jobs: Job[] }>({ leads: [], jobs: [] })
  const [messages, setMessages] = useState(['RidgePilot is ready. Ask for the latest leads near your service area.'])
  const [input, setInput] = useState('latest leads')
  const [busy, setBusy] = useState(false)
  async function send(command: string, leadId?: string) {
    setBusy(true)
    const response = await fetch('/api/demo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ command, leadId }) })
    const data = await response.json()
    setMessages((current) => [...current, `You: ${command}`, data.message ?? data.error])
    if (data.leads) setState((current) => ({ ...current, leads: data.leads }))
    if (data.job) setState((current) => ({ ...current, jobs: [data.job] }))
    setBusy(false)
  }
  useEffect(() => { fetch('/api/demo').then((response) => response.json()).then(setState) }, [])
  const job = state.jobs[0]
  return <main className={styles.shell}>
    <section className={styles.hero}><div><p className={styles.eyebrow}>RIDGEPILOT WORKSPACE</p><h1>From permit lead to proposal, inside WhatsApp.</h1><p className={styles.subhead}>Discover leads, manage outreach, review roof reports, price the job, and deliver a proposal.</p></div><div className={styles.badge}>● Connected</div></section>
    <section className={styles.grid}>
      <div className={styles.phone}><div className={styles.phoneTop}><span>‹</span><strong>Roofing Assistant</strong><span>⋮</span></div><div className={styles.chat}>{messages.map((message, index) => <div key={`${message}-${index}`} className={message.startsWith('You:') ? styles.outgoing : styles.incoming}>{message}</div>)}</div><form className={styles.composer} onSubmit={(event) => { event.preventDefault(); void send(input); setInput('') }}><input value={input} onChange={(event) => setInput(event.target.value)} aria-label="WhatsApp command"/><button disabled={busy}>Send</button></form></div>
      <div className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.eyebrow}>LIVE WORKSPACE</p><h2>Lead pipeline</h2></div><button className={styles.secondary} onClick={() => void send('latest leads')}>Refresh leads</button></div><div className={styles.leads}>{state.leads.map((lead) => <article className={styles.card} key={lead.id}><div><span className={styles.pill}>{lead.permitType}</span><h3>{lead.address}</h3><p>{lead.city}, {lead.state} {lead.zip} · issued {lead.issuedAt}</p><p className={styles.muted}>{lead.contactName}</p></div><button onClick={() => void send(`qualify ${lead.id}`, lead.id)}>Qualify</button></article>)}</div>{job && <div className={styles.job}><div className={styles.panelHeader}><div><p className={styles.eyebrow}>ACTIVE JOB</p><h2>{job.lead.address}</h2></div><span className={styles.stage}>{job.stage}</span></div><div className={styles.steps}>{['outreach', 'green-light', 'report', 'measurements', 'takeoff', 'proposal'].map((step) => <span className={job.stage === step ? styles.activeStep : ''} key={step}>{step}</span>)}</div><div className={styles.actions}><button onClick={() => void send('send outreach')}>Send outreach</button><button onClick={() => void send('green light')}>Green light</button><button onClick={() => void send('upload report')}>Upload report</button><button onClick={() => void send('calculate takeoff')}>Takeoff</button><button onClick={() => void send('generate proposal')}>Proposal</button></div>{job.takeoff && <div className={styles.total}><span>Proposal total</span><strong>{formatMoney(job.takeoff.totalCents)}</strong></div>}</div>}</div>
    </section>
  </main>
}
