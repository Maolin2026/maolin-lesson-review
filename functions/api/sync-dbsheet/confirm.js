/**
 * POST /api/sync-dbsheet/confirm - 标记记录为已同步（KV 版本）
 *
 * 请求体: { "ids": ["R...", "R...", ...] }
 * 认证: X-Sync-Key 请求头
 */
export async function onRequestPost(context) {
  const { request, env } = context
  const KV = env.REVIEWS

  try {
    const syncKey = request.headers.get('X-Sync-Key')
    if (!syncKey || syncKey !== (env.SYNC_KEY || 'maolin-sync-2026')) {
      return new Response(JSON.stringify({ success: false, error: '认证失败' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const ids = body.ids || []

    if (!ids.length) {
      return new Response(JSON.stringify({ success: false, error: 'ids 不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const existing = await KV.get("reviews")
    let reviews = []
    try { reviews = existing ? JSON.parse(existing) : [] } catch { reviews = [] }

    let marked = 0
    for (const r of reviews) {
      if (ids.includes(r.id)) {
        r.dbsheet_synced = true
        marked++
      }
    }

    await KV.put("reviews", JSON.stringify(reviews))

    return new Response(JSON.stringify({
      success: true,
      message: '已标记 ' + marked + ' 条记录为已同步',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
