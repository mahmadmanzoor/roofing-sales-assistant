# Natural-language chat

The WhatsApp webhook accepts free text, numbered lead choices, native buttons, and report documents. Free text is classified through the OpenAI Responses API with a strict schema; only IDs in the sender's persisted menu can be selected. Mutating requests return a confirmation button and never execute from vague language.

Context is stored per sender in `assistant_contexts`, with a bounded history and a 30-minute menu expiry. Lead snapshots and the active job survive process restarts. The deterministic demo workflow, takeoff pricing, proposal controls, and native WhatsApp buttons remain unchanged.

Checks: `npm test`, `npm run build`, `npm run typecheck`, and `npm run lint`.

## Verification

Baseline: `cb7f92f`. Scope: this application's WhatsApp conversation layer; no Permit Atlas or pricing changes. TripleCheck rule impact is not applicable.

- 15 tests pass, including numbered replies, menu preservation, restored lead snapshots, confirmation, expired menus, sender isolation, and rejection of model-invented prices/links.
- Lint, production build, typecheck, and mock end-to-end workflow pass.
- A real local PostgreSQL check saved an external lead menu in one process and selected it in a fresh process; a different sender could not load it.
- Real OpenAI checks exercised natural lead selection, questions, negation, and outreach confirmation. No real email was sent.
- Independent review flagged AI-selected job creation and unchecked generated facts. AI selections now require confirmation; unsafe generated prices, links, and completion claims fall back to canonical job data.
- Railway rollout and live WhatsApp verification are performed after local checks. Buttons and exact numeric choices work without AI; unavailable AI preserves the current menu with a deterministic reply.
