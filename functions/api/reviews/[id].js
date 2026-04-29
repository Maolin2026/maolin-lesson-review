/**
 * DELETE /api/reviews/[id] - 删除评课记录（jsonblob 版本）
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

export async function onRequestDelete(context) {
  const { params } = context
  const id = params.id

  try {
    const db = await readDB()
    const index = db.reviews.findIndex(r => r.id === id)
    if (index === -1) {
      return new Response(JSON.stringify({ success: false, error: '记录不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    db.reviews.splice(index, 1)
    await writeDB(db)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
