/**
 * POST /api/sync-dbsheet/confirm - 标记记录为已同步（jsonblob 版本）
 *
 * 请求体: { "ids": ["R...", "R...", ...] }
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
    const body = await request.json()
    const ids = body.ids || []

    if (!ids.length) {
      return new Response(JSON.stringify({ success: false, error: 'ids 不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const db = await readDB()
    let marked = 0
    for (const r of (db.reviews || [])) {
      if (ids.includes(r.id)) {
        r.dbsheet_synced = true
        marked++
      }
    }

    await writeDB(db)

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
