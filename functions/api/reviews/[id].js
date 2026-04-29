/**
 * DELETE /api/reviews/[id] - 删除评课记录
 */
export async function onRequestDelete(context) {
  const { params, env } = context
  const DB = env.DB
  const id = params.id

  try {
    const { results } = await DB.prepare('SELECT id FROM reviews WHERE id = ?').bind(id).all()
    if (!results.length) {
      return new Response(JSON.stringify({ success: false, error: '记录不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run()

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
