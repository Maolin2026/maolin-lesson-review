/**
 * DELETE /api/reviews/[id] - 删除评课记录（jsonbox 版本）
 */
export async function onRequestDelete(context) {
  const { params, request, env } = context
  const id = params.id

  try {
    const masterKey = env.JSONBOX_MASTER_KEY || ""
    const JSONBOX_BASE = "https://jsonbox.io"
    const BOX_ID = "box_maolin_reviews_2026"
    const headers = {}
    if (masterKey) headers["X-Master-Key"] = masterKey

    // jsonbox 删除需要用 DELETE 方法 + 记录 _id
    const boxUrl = JSONBOX_BASE + "/" + BOX_ID + "/" + id
    const response = await fetch(boxUrl, { method: "DELETE", headers })

    if (!response.ok && response.status !== 404) {
      throw new Error("jsonbox 删除失败: " + response.status)
    }

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
