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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAuth(request)) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = params

    await sql`
      UPDATE events SET
        title = ${body.title},
        description = ${body.description || ''},
        type = ${body.type},
        updated_at = ${body.updatedAt || Date.now()},
        display_color = ${body.display?.color || '#6366F1'},
        display_priority = ${body.display?.priority || 3}
      WHERE id = ${id}
    `

    return Response.json({ success: true })
  } catch (error) {
    console.error('[PUT /api/events]', error)
    return Response.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAuth(request)) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = params

    await sql`DELETE FROM events WHERE id = ${id}`

    return Response.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/events]', error)
    return Response.json({ error: '删除失败' }, { status: 500 })
  }
}
