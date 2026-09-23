import { afterEach, expect, it, vi } from 'vitest'
import { sendWhatsAppInteractive } from '../lib/meta'

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

it('reports numeric Meta error details without exposing provider message content', async () => {
  vi.stubEnv('DEMO_MODE', '0')
  vi.stubEnv('META_ACCESS_TOKEN', 'test-token')
  vi.stubEnv('META_PHONE_NUMBER_ID', 'test-phone')
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: { code: 200, error_subcode: 123, fbtrace_id: 'trace_123', message: 'private provider details' } }, { status: 403 })))

  const result = sendWhatsAppInteractive('test-recipient', { type: 'interactive', interactive: { type: 'button', body: { text: 'test' }, action: { buttons: [{ type: 'reply', reply: { id: 'latest-leads', title: 'New leads' } }] } } })

  await expect(result).rejects.toThrow('Meta returned 403, code 200, subcode 123, trace trace_123')
})
