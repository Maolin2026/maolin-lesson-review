/**
 * POST /api/sync-dbsheet - 从 KV 获取未同步的评课记录
 * POST /api/sync-dbsheet/confirm - 确认已同步，标记记录
 *
 * 调用方：灵犀 AI 定时任务
 * 认证：X-Sync-Key 请求头匹配环境变量 SYNC_KEY
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

    const existing = await KV.get("reviews")
    let reviews = []
    try { reviews = existing ? JSON.parse(existing) : [] } catch { reviews = [] }

    const unsynced = reviews.filter(r => !r.dbsheet_synced)

    if (!unsynced.length) {
      return new Response(JSON.stringify({
        success: true,
        message: '没有需要同步的记录',
        records: [],
        synced: 0,
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const records = unsynced.map(r => ({
      id: r.id,
      topic: r.topic,
      teacherName: r.teacher_name,
      grade: r.grade,
      classType: r.class_type,
      type: r.type,
      reviewerName: r.reviewer_name,
      totalScore: r.total_score,
      passed: r.passed,
      reviewDate: r.created_at ? r.created_at.split('T')[0] : '',
      dimensions: r.dimensions || [],
      overallComment: r.overall_comment || '',
      suggestions: r.suggestions || [],
    }))

    return new Response(JSON.stringify({
      success: true,
      message: '找到 ' + records.length + ' 条待同步记录',
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
