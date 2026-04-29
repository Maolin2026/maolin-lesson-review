/**
 * POST /api/sync-dbsheet - 从 jsonblob 获取未同步的评课记录
 *
 * 调用方：灵犀 AI 定时任务
 * 灵犀读取此接口获取待同步数据 → 调用 WPS API 写入多维表 → 调用 confirm 标记已同步
 */

const JSONBLOB_API = "https://jsonblob.com/api/jsonBlob"
const BLOB_ID = "019dd88d-a73c-7cda-8ea3-95fb86f6b165"
const BLOB_URL = JSONBLOB_API + "/" + BLOB_ID

async function readDB() {
  const resp = await fetch(BLOB_URL)
  if (!resp.ok) throw new Error("读取数据库失败: " + resp.status)
  return resp.json()
}

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
    const db = await readDB()
    const unsynced = (db.reviews || []).filter(r => !r.dbsheet_synced)

    if (!unsynced.length) {
      return new Response(JSON.stringify({
        success: true,
        message: '没有需要同步的记录',
        records: [],
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
