/**
 * POST /api/reviews - 新增评课记录
 * GET  /api/reviews - 获取评课记录列表（支持 ?grade=&type=&teacherId= 筛选）
 *
 * 数据存储在 Cloudflare D1 数据库中
 */
export async function onRequestPost(context) {
  const { request, env } = context
  const DB = env.DB

  try {
    const body = await request.json()

    // 必填字段校验
    const required = ['topic', 'teacherName', 'grade', 'classType', 'type', 'reviewerName', 'totalScore']
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return new Response(JSON.stringify({ success: false, error: `缺少必填字段: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    const id = `R${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const passed = body.totalScore >= (body.passScore || 85)
    const now = new Date().toISOString()

    // 维度评分 JSON 序列化
    const dimensionsJson = body.dimensions ? JSON.stringify(body.dimensions) : '[]'
    // 建议列表 JSON 序列化
    const suggestionsJson = body.suggestions ? JSON.stringify(body.suggestions) : '[]'

    await DB.prepare(`
      INSERT INTO reviews (
        id, topic, teacher_id, teacher_name, grade, class_type, type,
        subject, reviewer_name, total_score, passed, pass_score,
        dimensions, overall_comment, suggestions, highlights,
        dbsheet_synced, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.topic,
      body.teacherId || '',
      body.teacherName,
      body.grade,
      body.classType,
      body.type,
      body.subject || '数学',
      body.reviewerName,
      body.totalScore,
      passed ? 1 : 0,
      body.passScore || 85,
      dimensionsJson,
      body.overallComment || '',
      suggestionsJson,
      body.highlights ? JSON.stringify(body.highlights) : '[]',
      0,
      now
    ).run()

    return new Response(JSON.stringify({
      success: true,
      review: {
        id,
        ...body,
        passed,
        createdAt: now,
        status: 'completed',
      }
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

export async function onRequestGet(context) {
  const { request, env } = context
  const DB = env.DB

  try {
    const url = new URL(request.url)
    const grade = url.searchParams.get('grade') || ''
    const type = url.searchParams.get('type') || ''
    const teacherId = url.searchParams.get('teacherId') || ''
    const unsyncedOnly = url.searchParams.get('unsynced') === '1'
    const limit = parseInt(url.searchParams.get('limit')) || 200

    let query = 'SELECT * FROM reviews WHERE 1=1'
    const params = []

    if (grade) {
      query += ' AND grade = ?'
      params.push(grade)
    }
    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }
    if (teacherId) {
      query += ' AND teacher_id = ?'
      params.push(teacherId)
    }
    if (unsyncedOnly) {
      query += ' AND dbsheet_synced = 0'
    }

    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)

    const { results } = await DB.prepare(query).bind(...params).all()

    // 解析 JSON 字段
    const reviews = results.map(r => ({
      ...r,
      dimensions: JSON.parse(r.dimensions || '[]'),
      suggestions: JSON.parse(r.suggestions || '[]'),
      highlights: JSON.parse(r.highlights || '[]'),
      passed: r.passed === 1,
    }))

    return new Response(JSON.stringify({ success: true, reviews }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
