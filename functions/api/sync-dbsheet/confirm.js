/**
 * POST /api/sync-dbsheet/confirm - 标记记录为已同步（jsonbox 版本）
 *
 * 通过更新 jsonbox 中记录的 dbsheet_synced 字段实现
 * 请求体: { "ids": ["R...", "R...", ...] }
 */
const JSONBOX_BASE = "https://jsonbox.io"
const BOX_ID = "box_maolin_reviews_2026"

export async function onRequestPost(context) {
  const { request, env } = context

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

    const masterKey = env.JSONBOX_MASTER_KEY || ""
    const headers = { "Content-Type": "application/json" }
    if (masterKey) headers["X-Master-Key"] = masterKey

    // jsonbox 通过 PUT 更新记录
    // 先读取所有记录，找到需要更新的
    const response = await fetch(JSONBOX_BASE + "/" + BOX_ID, { headers: { "X-Master-Key": masterKey } })
    let reviews = await response.json()
    if (!Array.isArray(reviews)) reviews = []

    let marked = 0
    for (const r of reviews) {
      const rid = r._id || r.id
      if (ids.includes(rid)) {
        r.dbsheet_synced = true
        // 用 PUT 更新
        await fetch(JSONBOX_BASE + "/" + BOX_ID + "/" + rid, {
          method: "PUT",
          headers,
          body: JSON.stringify(r),
        })
        marked++
      }
    }

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
