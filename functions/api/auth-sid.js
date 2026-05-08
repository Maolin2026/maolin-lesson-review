/**
 * CF Pages Function - SID 注入端点
 * 由灵犀调用，将 WPS SID 存储到 KV（或 CF 环境变量）
 * GET  /api/auth-sid?sid=xxx  - 注入 SID（灵犀调用）
 * GET  /api/auth-sid           - 获取当前 SID（前端检查）
 * 
 * 使用 KV 存储：需要在 CF Pages 中绑定 KV namespace
 */

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const sid = url.searchParams.get("sid");

  if (sid && context.env?.TEACHERS_KV) {
    // 存储新 SID
    await context.env.TEACHERS_KV.put("wps_sid", sid, { expirationTtl: 86400 });
    return new Response(JSON.stringify({ success: true, message: "SID 已更新" }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // 读取当前 SID
  let currentSid = null;
  if (context.env?.TEACHERS_KV) {
    currentSid = await context.env.TEACHERS_KV.get("wps_sid");
  }

  return new Response(JSON.stringify({
    success: true,
    hasSid: !!currentSid,
    sidPrefix: currentSid ? currentSid.substring(0, 8) + "..." : null,
  }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
