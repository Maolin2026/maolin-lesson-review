/**
 * POST /api/reviews - 新增评课记录
 * GET  /api/reviews - 获取全部评课记录
 *
 * 使用 jsonblob.com 存储（免费，无需认证，无需 Cloudflare 配置）
 * Blob ID 硬编码在代码中，所有评课数据统一存储
 * Cloudflare Pages Function 代理 jsonblob 请求（解决 CORS）
 */

const JSONBLOB_API = "https://jsonblob.com/api/jsonBlob"
// 数据库 Blob - 首次创建后硬编码此 ID
const BLOB_ID = "019dd88d-a73c-7cda-8ea3-95fb86f6b165"
const BLOB_URL = JSONBLOB_API + "/" + BLOB_ID

/**
 * 读取当前数据库
 */
async function readDB() {
  const resp = await fetch(BLOB_URL)
  if (!resp.ok) throw new Error("读取数据库失败: " + resp.status)
  return resp.json()
}

/**
 * 写入数据库
 */
async function writeDB(data) {
  const resp = await fetch(BLOB_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!resp.ok) throw new Error("写入数据库失败: " + resp.status)
}

export async function onRequestPost(context) {
  const { request } = context

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

    const db = await readDB()
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

    db.reviews.unshift(newRecord)
    await writeDB(db)

    return new Response(JSON.stringify({
      success: true,
      review: {
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
      },
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
  const { request } = context

  try {
    const url = new URL(request.url)
    const grade = url.searchParams.get('grade') || ''
    const type = url.searchParams.get('type') || ''
    const teacherId = url.searchParams.get('teacherId') || ''
    const unsyncedOnly = url.searchParams.get('unsynced') === '1'

    const db = await readDB()
    let reviews = db.reviews || []

    if (grade) reviews = reviews.filter(r => r.grade === grade)
    if (type) reviews = reviews.filter(r => r.type === type)
    if (teacherId) reviews = reviews.filter(r => r.teacher_id === teacherId)
    if (unsyncedOnly) reviews = reviews.filter(r => !r.dbsheet_synced)

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
