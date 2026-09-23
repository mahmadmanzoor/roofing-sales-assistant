import { afterEach, expect, it, vi } from 'vitest'
import { handleChat } from '../lib/chat-orchestrator'
import { getJob } from '../lib/demo-store'
import { loadContext, saveContext } from '../lib/persistence'

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers() })

it('numbered reply refers to the latest action menu and does not send outreach', async () => {
  vi.stubEnv('DEMO_MODE', '1')
  await handleChat({ from: 'boundary-number', actionId: 'latest-leads' })
  const selected = await handleChat({ from: 'boundary-number', text: '1' })

  const result = await handleChat({ from: 'boundary-number', text: '1' })

  expect(result.actions?.[0].title).toBe('Approve outreach')
  expect(result.message.toLowerCase()).toContain('confirm')
  expect((await getJob(selected.job!.id))?.emailStatus).toBe('draft')
})

it('selects an external lead from persisted context without an in-process search cache', async () => {
  vi.stubEnv('DEMO_MODE', '1')
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-09-23T12:00:00Z'))
  await saveContext('boundary-restored', { menuUpdatedAt: 1790164800000, displayedActions: [], history: [], displayedLeads: [{ id: 'external-roof-556', address: '556 Example Drive', city: 'Austin', state: 'TX', zip: '78701', permitType: 'Roofing', issuedAt: '2026-09-23', contactName: '', contactEmail: '' }] })

  const result = await handleChat({ from: 'boundary-restored', text: '1' })

  expect(result.job?.lead.id).toBe('external-roof-556')
  expect(result.job?.contractorPhone).toBe('boundary-restored')
  expect(result.job?.stage).toBe('outreach')
})

it('an AI conversation preserves the displayed lead menu and uses its natural reply', async () => {
  vi.stubEnv('DEMO_MODE', '1')
  await handleChat({ from: 'boundary-question', actionId: 'latest-leads' })
  vi.stubEnv('DEMO_MODE', '0')
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'reasoning' }, { type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ intent: 'conversation', optionId: null, location: null, reply: 'The first option is the Wild Prairie demo property. Which property would you like to review?' }) }] }] })))

  const result = await handleChat({ from: 'boundary-question', text: 'What is the first option?' })

  expect(result.message).toContain('The first option is the Wild Prairie demo property.')
  expect(result.leads?.[0].id).toBe('demo-1048')
  expect((await loadContext('boundary-question'))?.displayedLeads[0].id).toBe('demo-1048')
})

it('gives AI real active-job facts and preserves its natural confirmation without executing outreach', async () => {
  vi.stubEnv('DEMO_MODE', '1')
  await handleChat({ from: 'boundary-ai-action', actionId: 'latest-leads' })
  const selected = await handleChat({ from: 'boundary-ai-action', text: '1' })
  vi.stubEnv('DEMO_MODE', '0')
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
  const aiFetch = vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ intent: 'action', optionId: selected.actions![0].id, location: null, reply: 'I can prepare that outreach for this property.' }) }] }] }))
  vi.stubGlobal('fetch', aiFetch)

  const result = await handleChat({ from: 'boundary-ai-action', text: 'Please email this homeowner' })

  expect(result.message).toContain('I can prepare that outreach for this property.')
  expect(result.actions?.[0].title).toBe('Approve outreach')
  expect((await getJob(selected.job!.id))?.emailStatus).toBe('draft')
  const request = JSON.parse(String((aiFetch.mock.calls[0] as unknown as [string, RequestInit])[1].body))
  const sentContext = JSON.parse(request.input[1].content)
  expect(sentContext.activeJob.stage).toBe('outreach')
  expect(JSON.stringify(sentContext.activeJob)).toContain('1048 Wild Prairie Drive')
})

it('does not let an AI selection bypass expiry of the displayed menu', async () => {
  vi.stubEnv('DEMO_MODE', '0')
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-09-23T12:00:00Z'))
  await saveContext('boundary-expired', { menuUpdatedAt: 1790161200000, displayedActions: [], history: [], displayedLeads: [{ id: 'demo-1048', address: '1048 Wild Prairie Drive', city: 'Iowa City', state: 'IA', zip: '52246', permitType: 'Roofing', issuedAt: '2026-09-23', contactName: '', contactEmail: '' }] })
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ intent: 'select', optionId: 'lead:demo-1048:select', location: null, reply: 'The first property.' }) }] }] })))

  const result = await handleChat({ from: 'boundary-expired', text: 'the first house please' })

  expect(result.job).toBeUndefined()
  expect(result.actions?.[0].id).toBe('latest-leads')
  expect(result.leads ?? []).toHaveLength(0)
  expect((await loadContext('boundary-expired'))?.displayedLeads).toHaveLength(0)
})

it('rejects a model-supplied action belonging to another contractor without losing the current menu', async () => {
  vi.stubEnv('DEMO_MODE', '1')
  await handleChat({ from: 'boundary-isolation-a', actionId: 'latest-leads' })
  const ownJob = await handleChat({ from: 'boundary-isolation-a', text: '1' })
  await handleChat({ from: 'boundary-isolation-b', actionId: 'latest-leads' })
  const otherJob = await handleChat({ from: 'boundary-isolation-b', text: '1' })
  vi.stubEnv('DEMO_MODE', '0')
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ intent: 'action', optionId: otherJob.actions![0].id, location: null, reply: 'Send the other job.' }) }] }] })))

  const result = await handleChat({ from: 'boundary-isolation-a', text: 'Send the other job' })

  expect(result.actions?.[0].id).toBe(ownJob.actions![0].id)
  expect((await getJob(ownJob.job!.id))?.emailStatus).toBe('draft')
  expect((await getJob(otherJob.job!.id))?.emailStatus).toBe('draft')
})

it('does not send AI-invented prices or links to the contractor', async () => {
  vi.stubEnv('DEMO_MODE', '1')
  await handleChat({ from: 'boundary-facts', actionId: 'latest-leads' })
  vi.stubEnv('DEMO_MODE', '0')
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ intent: 'conversation', optionId: null, location: null, reply: 'Your proposal is $9,999 at https://evil.example' }) }] }] })))

  const result = await handleChat({ from: 'boundary-facts', text: 'How much is the proposal?' })

  expect(result.message).not.toContain('$9,999')
  expect(result.message).not.toContain('evil.example')
  expect(result.leads?.[0].id).toBe('demo-1048')
})

it('asks for confirmation of an AI-inferred lead without creating a job', async () => {
  vi.stubEnv('DEMO_MODE', '1')
  await handleChat({ from: 'boundary-ai-select', actionId: 'latest-leads' })
  vi.stubEnv('DEMO_MODE', '0')
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ intent: 'select', optionId: 'lead:demo-1048:select', location: null, reply: 'Do you mean the Wild Prairie property?' }) }] }] })))

  const result = await handleChat({ from: 'boundary-ai-select', text: 'the first house please' })

  expect(result.job).toBeUndefined()
  expect(result.message).toContain('confirm')
  expect(result.leads?.[0].id).toBe('demo-1048')
  expect((await loadContext('boundary-ai-select'))?.activeJobId).toBeUndefined()
})
