/**
 * POST /api/sync-dbsheet/confirm - 确认记录已写入多维表，标记为已同步
 *
 * 请求体: { "ids": ["R...", "R...", ...] }
 * 认证: X-Sync-Key 请求头
 */
export async function onRequestPost(context) {
  const { request, env } = context
  const DB = env.DB

  try {
    // 认证检查
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

    // 批量标记为已同步
    for (const id of ids) {
      await DB.prepare('UPDATE reviews SET dbsheet_synced = 1 WHERE id = ?').bind(id).run()
    }

    return new Response(JSON.stringify({
      success: true,
      message: `已标记 ${ids.length} 条记录为已同步`,
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
