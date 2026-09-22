import { command, getState } from '@/lib/demo-store'

export const dynamic = 'force-dynamic'

export async function GET() { return Response.json(getState()) }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return Response.json(await command(body))
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Command failed' }, { status: 400 })
  }
}
