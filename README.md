# Roofing Sales Assistant

WhatsApp-first roofing sales workflow demo. The local demo uses fixture leads, a deterministic demo price book, fixture roof measurements, a simulated email provider, and a generated proposal PDF. `DEMO_MODE=1` prevents outbound provider calls.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Use the command box or buttons to run: latest leads → select demo-1048 → approve outreach → green light → homeowner/upload → Use demo report → approve measurements → takeoff → proposal.

## Checks

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e:mock
```

Live Meta, Permit Atlas, and OpenAI values are intentionally empty. Provider setup is required before `DEMO_MODE=0` and is not part of the local demo.
