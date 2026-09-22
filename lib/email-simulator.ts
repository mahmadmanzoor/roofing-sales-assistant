import { randomUUID } from 'node:crypto'

export type ReplyScenario = 'interested' | 'not_interested' | 'asks_for_call' | 'needs_more_information'

const replies: Record<ReplyScenario, string> = {
  interested: 'Hi, yes — we would like to review an estimate for the roof replacement.',
  not_interested: 'Thanks, but we are not looking for a contractor right now.',
  asks_for_call: 'Could you call me tomorrow afternoon to discuss the project?',
  needs_more_information: 'Can you send a little more information about your company and warranty?',
}

export async function sendDemoEmail(input: { to: string; subject: string; body: string; scenario?: ReplyScenario }) {
  return { providerMessageId: `demo_${randomUUID().replaceAll('-', '')}`, status: 'sent' as const, delivered: true, reply: replies[input.scenario ?? 'interested'] }
}
