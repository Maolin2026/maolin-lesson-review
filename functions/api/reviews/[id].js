/**
 * DELETE /api/reviews/[id] - 删除评课记录（KV 版本）
 */
export async function onRequestDelete(context) {
  const { params, env } = context
  const KV = env.REVIEWS
  const id = params.id

  try {
    const existing = await KV.get("reviews")
    let reviews = []
    try { reviews = existing ? JSON.parse(existing) : [] } catch { reviews = [] }

    const index = reviews.findIndex(r => r.id === id)
    if (index === -1) {
      return new Response(JSON.stringify({ success: false, error: '记录不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    reviews.splice(index, 1)
    await KV.put("reviews", JSON.stringify(reviews))

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
