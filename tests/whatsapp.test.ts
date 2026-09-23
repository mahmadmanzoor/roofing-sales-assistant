import { beforeEach, describe, expect, it, vi } from 'vitest'
import { command } from '../lib/demo-store'
import { formatReply } from '../lib/whatsapp-reply'

const phone = '+1555000'
const action = (result: { actions?: Array<{ id: string }> }, index = 0) => result.actions?.[index]?.id ?? (() => { throw new Error('missing action') })()
const firstLeadId = (result: ReturnType<typeof formatReply>) => { const row = result.interactive.action.sections?.[0]?.rows[0]; if (!row) throw new Error('missing lead'); return row.id }

describe('WhatsApp interactive workflow', () => {
  it('uses emitted list and button IDs through the fixed demo proposal flow', async () => {
    const leads = await command({ command: 'latest leads', from: phone })
    const list = formatReply(leads)
    expect(list.interactive.type).toBe('list')
    const leadId = list.interactive.action.sections?.[0].rows[0].id
    expect(leadId).toBe('lead:demo-1048:select')
    let result = await command({ command: '', actionId: leadId, from: phone })
    result = await command({ command: '', actionId: action(result), from: phone })
    result = await command({ command: '', actionId: action(result), from: phone })
    result = await command({ command: '', actionId: action(result), from: phone })
    result = await command({ command: '', actionId: action(result), from: phone })
    expect(result.actions?.[0].title).toBe('Use demo report')
    result = await command({ command: '', actionId: action(result), from: phone })
    expect(result.message).toContain('9572')
    const before = result.job?.measurements
    result = await command({ command: '', actionId: action(result), from: phone })
    expect(result.job?.stage).toBe('takeoff')
    expect(result.job?.measurements).toEqual(before)
    result = await command({ command: '', actionId: action(result), from: phone })
    result = await command({ command: '', actionId: action(result, 1), from: phone })
    expect(result.message).toContain('$37,763.84')
    result = await command({ command: '', actionId: action(result), from: phone })
    result = await command({ command: '', actionId: action(result), from: phone })
    expect(result.job?.stage).toBe('sent')
  })

  it('scopes jobs and rejects stale or cross-sender actions', async () => {
    const a = await command({ command: 'latest leads', from: 'A' }); const lead = firstLeadId(formatReply(a))
    const aJob = await command({ command: '', actionId: lead, from: 'A' }); const b = await command({ command: 'latest leads', from: 'B' }); const bJob = await command({ command: '', actionId: firstLeadId(formatReply(b)), from: 'B' })
    expect(aJob.job?.id).not.toBe(bJob.job?.id)
    await expect(command({ command: '', actionId: action(aJob), from: 'B' })).rejects.toThrow()
    let result = await command({ command: '', actionId: action(aJob), from: 'A' }); result = await command({ command: '', actionId: action(result), from: 'A' }); const green = action(result); result = await command({ command: '', actionId: green, from: 'A' }); await expect(command({ command: '', actionId: green, from: 'A' })).rejects.toThrow()
    const upload = action(result); result = await command({ command: '', actionId: upload, from: 'A' }); const approve = action(result); result = await command({ command: '', actionId: approve, from: 'A' }); await expect(command({ command: '', actionId: approve, from: 'A' })).rejects.toThrow()
    await expect(command({ command: '', actionId: 'job:not-real:approve-measurements', from: 'A' })).rejects.toThrow()
  })

  it('limits interactive payloads and recovers empty lead lists with buttons', () => {
    const empty = formatReply({ message: 'none', leads: [] }); expect(empty.interactive.type).toBe('button'); expect(empty.interactive.action.buttons?.[0].reply.title).toBe('New leads')
    const reply = formatReply({ message: 'x'.repeat(2000), actions: Array.from({ length: 5 }, (_, i) => ({ id: `x${i}`, title: 'a'.repeat(30) })) }); const buttons = reply.interactive.action.buttons!
    expect(buttons).toHaveLength(3); expect(buttons.every((b) => b.reply.title.length <= 20)).toBe(true); expect(reply.interactive.body.text.length).toBeLessThanOrEqual(1024)
  })

  it('does not fabricate non-demo reports and preserves approved custom measurements', async () => {
    let result = await command({ command: 'latest leads', from: 'C' }); result = await command({ command: 'qualify permit-1001', leadId: 'permit-1001', from: 'C' }); const jobId = result.job!.id
    await expect(command({ command: '', actionId: `job:${jobId}:use-demo-report`, from: 'C' })).rejects.toThrow()
    result = await command({ command: 'latest leads', from: 'D' }); result = await command({ command: '', actionId: firstLeadId(formatReply(result)), from: 'D' }); result = await command({ command: '', actionId: action(result), from: 'D' }); result = await command({ command: '', actionId: action(result), from: 'D' }); result = await command({ command: '', actionId: action(result), from: 'D' }); result = await command({ command: '', actionId: action(result), from: 'D' }); result = await command({ command: '', actionId: action(result), from: 'D' }); result.job!.measurements!.totalAreaSqFt = 1234
    result = await command({ command: '', actionId: action(result), from: 'D' }); expect(result.job?.measurements?.totalAreaSqFt).toBe(1234)
  })
})

describe('webhook interactive round trip', () => {
  beforeEach(() => { process.env.DEMO_MODE = '0'; process.env.META_PHONE_NUMBER_ID = 'phone'; process.env.META_ACCESS_TOKEN = 'token'; vi.resetModules() })
  it('parses list_reply and button_reply and emits native payloads', async () => {
    const sent: unknown[] = []; vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => { if (init?.body) sent.push(JSON.parse(String(init.body))); return new Response(JSON.stringify({ messages: [{ id: 'out' }] }), { status: 200 }) }))
    const { POST } = await import('../app/api/webhooks/meta/whatsapp/route')
    const send = (message: unknown) => POST(new Request('http://localhost/api/webhooks/meta/whatsapp', { method: 'POST', body: JSON.stringify({ entry: [{ changes: [{ value: { messages: [message] } }] }] }) }))
    process.env.DEMO_MODE = '0'; process.env.PERMIT_ATLAS_API_URL = ''; process.env.PERMIT_ATLAS_API_KEY = ''; await send({ id: 'in1', from: 'E', type: 'text', text: { body: 'latest leads' } }); const first = sent.at(-1) as { interactive: { action: { sections: Array<{ rows: Array<{ id: string }> }> } } }; const lead = first.interactive.action.sections[0].rows[0].id
    await send({ id: 'in2', from: 'E', type: 'interactive', interactive: { list_reply: { id: lead } } }); const second = sent.at(-1) as { interactive: { action: { buttons: Array<{ reply: { id: string } }> } } }; expect(second.interactive.action.buttons[0].reply.id).toContain('preview-outreach')
    await send({ id: 'in3', from: 'E', type: 'interactive', interactive: { button_reply: { id: second.interactive.action.buttons[0].reply.id } } }); expect(sent.at(-1)).toBeTruthy()
  })
})
