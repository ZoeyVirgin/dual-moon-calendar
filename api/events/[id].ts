import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

const AUTHOR_PASSWORD = process.env.AUTHOR_PASSWORD || ''

function verifyAuth(req: VercelRequest): boolean {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return decoded === AUTHOR_PASSWORD
  } catch {
    return false
  }
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: '未授权' })
  }

  try {
    const id = req.query.id as string
    const body = req.body

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

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('[PUT /api/events]', error)
    return res.status(500).json({ error: '更新失败' })
  }
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  if (!verifyAuth(req)) {
    return res.status(401).json({ error: '未授权' })
  }

  try {
    const id = req.query.id as string
    await sql`DELETE FROM events WHERE id = ${id}`
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/events]', error)
    return res.status(500).json({ error: '删除失败' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case 'PUT':
      return handlePut(req, res)
    case 'DELETE':
      return handleDelete(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}
