export function GET() { return Response.json({ ok: true, service: 'roofing-sales-assistant', demoMode: process.env.DEMO_MODE !== '0' }) }
