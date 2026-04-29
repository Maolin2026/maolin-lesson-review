export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // 从环境变量获取 WPS SID，优先使用 Cloudflare 环境变量
    const wpsSid = env.VITE_WPS_SID || "V02SfNMKcDSVeAetGrp5cVY0ZYjVV_w00aba7971003c0fd770";
    if (!wpsSid) {
      return new Response(JSON.stringify({ code: -1, msg: "WPS_SID 未配置" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 解析请求体
    const body = await request.json();
    const { path } = body;
    
    if (!path) {
      return new Response(JSON.stringify({ code: -1, msg: "缺少 path 参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 构建目标 URL
    const targetUrl = `https://api.wps.cn${path}`;

    // 转发请求到 WPS API
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `wps_sid=${wpsSid}; csrf=${wpsSid}`,
        "Origin": "https://365.kdocs.cn",
        "Referer": "https://365.kdocs.cn/woa/im/messages",
      },
      body: JSON.stringify(body.payload || body.records || {}),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ code: -1, msg: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
