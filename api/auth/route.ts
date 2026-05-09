const AUTHOR_PASSWORD = process.env.AUTHOR_PASSWORD || ''

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return Response.json({ success: false, error: '口令不能为空' }, { status: 400 })
    }

    if (password !== AUTHOR_PASSWORD) {
      return Response.json({ success: false, error: '口令错误' }, { status: 401 })
    }

    const token = Buffer.from(password).toString('base64')

    return Response.json({ success: true, token })
  } catch {
    return Response.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
