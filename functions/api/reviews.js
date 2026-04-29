/**
 * POST /api/reviews - 新增评课记录（存入 KV）
 * GET  /api/reviews - 获取全部评课记录（KV list）
 *   支持 ?grade=&type=&teacherId= 筛选
 *
 * 数据存储在 Cloudflare KV 中
 * KV namespace binding: REVIEWS
 * 键设计: reviews - 存储所有记录的 JSON 数组
 */

export async function onRequestPost(context) {
  const { request, env } = context
  const KV = env.REVIEWS

  try {
    const body = await request.json()

    const required = ['topic', 'teacherName', 'grade', 'classType', 'type', 'reviewerName', 'totalScore']
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return new Response(JSON.stringify({ success: false, error: "缺少必填字段: " + field }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    const id = "R" + Date.now() + "_" + Math.random().toString(36).substr(2, 6)
    const passed = body.totalScore >= (body.passScore || 85)
    const now = new Date().toISOString()

    const newRecord = {
      id,
      topic: body.topic,
      teacher_id: body.teacherId || '',
      teacher_name: body.teacherName,
      grade: body.grade,
      class_type: body.classType,
      type: body.type,
      subject: body.subject || '数学',
      reviewer_name: body.reviewerName,
      total_score: body.totalScore,
      passed,
      pass_score: body.passScore || 85,
      dimensions: body.dimensions || [],
      overall_comment: body.overallComment || '',
      suggestions: body.suggestions || [],
      highlights: body.highlights || [],
      dbsheet_synced: false,
      created_at: now,
    }

    // 读取现有记录，追加新记录
    const existing = await KV.get("reviews")
    let reviews = []
    try { reviews = existing ? JSON.parse(existing) : [] } catch { reviews = [] }

    reviews.unshift(newRecord)

    // 写回 KV
    await KV.put("reviews", JSON.stringify(reviews))

    const reviewResponse = {
      id,
      topic: newRecord.topic,
      teacherId: newRecord.teacher_id,
      teacherName: newRecord.teacher_name,
      grade: newRecord.grade,
      classType: newRecord.class_type,
      type: newRecord.type,
      subject: newRecord.subject,
      reviewerName: newRecord.reviewer_name,
      totalScore: newRecord.total_score,
      dimensions: newRecord.dimensions,
      overallComment: newRecord.overall_comment,
      suggestions: newRecord.suggestions,
      highlights: newRecord.highlights,
      createdAt: now,
      status: 'completed',
    }

    return new Response(JSON.stringify({ success: true, review: reviewResponse }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function onRequestGet(context) {
  const { request, env } = context
  const KV = env.REVIEWS

  try {
    const url = new URL(request.url)
    const grade = url.searchParams.get('grade') || ''
    const type = url.searchParams.get('type') || ''
    const teacherId = url.searchParams.get('teacherId') || ''
    const unsyncedOnly = url.searchParams.get('unsynced') === '1'

    const existing = await KV.get("reviews")
    let reviews = []
    try { reviews = existing ? JSON.parse(existing) : [] } catch { reviews = [] }

    // 筛选
    if (grade) reviews = reviews.filter(r => r.grade === grade)
    if (type) reviews = reviews.filter(r => r.type === type)
    if (teacherId) reviews = reviews.filter(r => r.teacher_id === teacherId)
    if (unsyncedOnly) reviews = reviews.filter(r => !r.dbsheet_synced)

    // 转换为前端格式
    const result = reviews.map(r => ({
      id: r.id,
      topic: r.topic,
      teacher_id: r.teacher_id,
      teacher_name: r.teacher_name,
      grade: r.grade,
      class_type: r.class_type,
      type: r.type,
      subject: r.subject,
      total_score: r.total_score,
      dimensions: r.dimensions || [],
      overall_comment: r.overall_comment || '',
      suggestions: r.suggestions || [],
      highlights: r.highlights || [],
      dbsheet_synced: r.dbsheet_synced || false,
      created_at: r.created_at,
    }))

    return new Response(JSON.stringify({ success: true, reviews: result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
