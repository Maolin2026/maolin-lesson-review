/**
 * POST /api/reviews - 新增评课记录
 * GET  /api/reviews - 获取全部评课记录
 *
 * 使用 jsonbox.io 作为存储后端（免费，无需配置）
 * 数据通过 Cloudflare Pages Function 代理访问 jsonbox
 */

const JSONBOX_BASE = "https://jsonbox.io"

// jsonbox.io box ID - 创建后填入
// 如果需要更换，修改此常量即可
const BOX_ID = "box_maolin_reviews_2026"

/**
 * 从请求头或环境变量获取 jsonbox master key
 */
function getMasterKey(request, env) {
  // 优先从请求头获取（前端提交时带上）
  const headerKey = request.headers.get("X-Jsonbox-Key")
  if (headerKey) return headerKey
  // 其次从环境变量获取
  return env.JSONBOX_MASTER_KEY || ""
}

export async function onRequestPost(context) {
  const { request, env } = context

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

    const record = {
      _id: id,
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

    // 写入 jsonbox
    const masterKey = getMasterKey(request, env)
    const boxUrl = JSONBOX_BASE + "/" + BOX_ID
    const headers = { "Content-Type": "application/json" }
    if (masterKey) headers["X-Master-Key"] = masterKey

    const response = await fetch(boxUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error("jsonbox 写入失败: " + response.status + " " + errText)
    }

    const reviewResponse = {
      id,
      topic: record.topic,
      teacherId: record.teacher_id,
      teacherName: record.teacher_name,
      grade: record.grade,
      classType: record.class_type,
      type: record.type,
      subject: record.subject,
      reviewerName: record.reviewer_name,
      totalScore: record.total_score,
      dimensions: record.dimensions,
      overallComment: record.overall_comment,
      suggestions: record.suggestions,
      highlights: record.highlights,
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

  try {
    const url = new URL(request.url)
    const grade = url.searchParams.get('grade') || ''
    const type = url.searchParams.get('type') || ''
    const teacherId = url.searchParams.get('teacherId') || ''
    const unsyncedOnly = url.searchParams.get('unsynced') === '1'

    const masterKey = getMasterKey(request, env)
    const boxUrl = JSONBOX_BASE + "/" + BOX_ID
    const headers = {}
    if (masterKey) headers["X-Master-Key"] = masterKey

    const response = await fetch(boxUrl, { headers })
    if (!response.ok) {
      throw new Error("jsonbox 读取失败: " + response.status)
    }

    let reviews = await response.json()
    // jsonbox 返回的是数组
    if (!Array.isArray(reviews)) reviews = []

    // 筛选
    if (grade) reviews = reviews.filter(r => r.grade === grade)
    if (type) reviews = reviews.filter(r => r.type === type)
    if (teacherId) reviews = reviews.filter(r => r.teacher_id === teacherId)
    if (unsyncedOnly) reviews = reviews.filter(r => !r.dbsheet_synced)

    // 按创建时间倒序
    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

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
