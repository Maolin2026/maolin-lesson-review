/**
 * POST /api/sync-dbsheet - 从 jsonbox 获取未同步的评课记录
 *
 * 调用方：灵犀 AI 定时任务
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

    const masterKey = env.JSONBOX_MASTER_KEY || ""
    const headers = {}
    if (masterKey) headers["X-Master-Key"] = masterKey

    const response = await fetch(JSONBOX_BASE + "/" + BOX_ID, { headers })
    if (!response.ok) {
      throw new Error("jsonbox 读取失败: " + response.status)
    }

    let reviews = await response.json()
    if (!Array.isArray(reviews)) reviews = []

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
      id: r._id || r.id,
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
