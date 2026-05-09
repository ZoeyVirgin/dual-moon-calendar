import { sql } from '@vercel/postgres'

const AUTHOR_PASSWORD = process.env.AUTHOR_PASSWORD || ''

function verifyAuth(request: Request): boolean {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ', '')
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return decoded === AUTHOR_PASSWORD
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const absParam = searchParams.get('abs')

    if (absParam !== null) {
      const abs = parseInt(absParam, 10)
      const result = await sql`
        SELECT * FROM events WHERE date_anchor_abs = ${abs} ORDER BY created_at DESC
      `
      return Response.json(result.rows.map(mapRow))
    }

    const result = await sql`SELECT * FROM events ORDER BY created_at DESC`
    return Response.json(result.rows.map(mapRow))
  } catch (error) {
    console.error('[GET /api/events]', error)
    return Response.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const body = await request.json()

    await sql`
      INSERT INTO events (
        id, title, description, type, created_at, updated_at,
        date_anchor_abs, date_anchor_solar, date_anchor_lunar_primary,
        display_color, display_priority, recurrence
      ) VALUES (
        ${body.id}, ${body.title}, ${body.description || ''}, ${body.type},
        ${body.createdAt}, ${body.updatedAt},
        ${body.dateAnchor.abs},
        ${JSON.stringify(body.dateAnchor.solar || {})},
        ${JSON.stringify(body.dateAnchor.lunarPrimary || {})},
        ${body.display?.color || '#6366F1'}, ${body.display?.priority || 3},
        ${body.recurrence ? JSON.stringify(body.recurrence) : null}
      )
    `

    return Response.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/events]', error)
    return Response.json({ error: '创建失败' }, { status: 500 })
  }
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    dateAnchor: {
      abs: Number(row.date_anchor_abs),
      solar: typeof row.date_anchor_solar === 'string' ? JSON.parse(row.date_anchor_solar as string) : row.date_anchor_solar,
      lunarPrimary: typeof row.date_anchor_lunar_primary === 'string' ? JSON.parse(row.date_anchor_lunar_primary as string) : row.date_anchor_lunar_primary,
    },
    display: {
      color: row.display_color,
      isVisible: true,
      priority: Number(row.display_priority),
    },
    recurrence: typeof row.recurrence === 'string' ? JSON.parse(row.recurrence as string) : row.recurrence,
  }
}
