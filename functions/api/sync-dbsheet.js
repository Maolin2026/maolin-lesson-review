/**
 * POST /api/sync-dbsheet - 从 D1 读取未同步的评课记录，写入 WPS 多维表
 *
 * 调用方：灵犀 AI 定时任务（或手动触发）
 * 认证：需要 X-Sync-Key 请求头匹配环境变量 SYNC_KEY
 *
 * 成功写入后标记 dbsheet_synced = 1，避免重复写入
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

    // 查询未同步的记录
    const { results } = await DB.prepare(
      'SELECT * FROM reviews WHERE dbsheet_synced = 0 ORDER BY created_at ASC'
    ).all()

    if (!results.length) {
      return new Response(JSON.stringify({
        success: true,
        message: '没有需要同步的记录',
        synced: 0,
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 调用灵犀的 dbsheet 服务写入多维表
    // 实际写入由灵犀代理完成，此处返回需要同步的数据
    const records = results.map(r => ({
      id: r.id,
      topic: r.topic,
      teacherName: r.teacher_name,
      grade: r.grade,
      classType: r.class_type,
      type: r.type,
      reviewerName: r.reviewer_name,
      totalScore: r.total_score,
      passed: r.passed === 1,
      reviewDate: r.created_at ? r.created_at.split('T')[0] : '',
      dimensions: JSON.parse(r.dimensions || '[]'),
      overallComment: r.overall_comment,
      suggestions: JSON.parse(r.suggestions || '[]'),
    }))

    return new Response(JSON.stringify({
      success: true,
      message: `找到 ${records.length} 条待同步记录`,
      records,
      synced: 0,
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

/**
 * POST /api/sync-dbsheet/confirm - 确认已同步，标记记录为已同步
 */
export async function onRequest(context) {
  // 此路由处理 /api/sync-dbsheet/confirm 的 POST 请求
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  // 实际 confirm 逻辑通过单独的路由处理
  return new Response(JSON.stringify({ success: false, error: '请使用 /api/sync-dbsheet/confirm 端点' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}
