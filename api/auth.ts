import type { VercelRequest, VercelResponse } from '@vercel/node'

const AUTHOR_PASSWORD = process.env.AUTHOR_PASSWORD || ''

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { password } = req.body

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: '口令不能为空' })
    }

    if (password !== AUTHOR_PASSWORD) {
      return res.status(401).json({ success: false, error: '口令错误' })
    }

    const token = Buffer.from(password).toString('base64')
    return res.status(200).json({ success: true, token })
  } catch {
    return res.status(500).json({ success: false, error: '服务器错误' })
  }
}
