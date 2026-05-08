/**
 * CF Pages Function - 教师管理 API
 * 对接 WPS 多维表 Sheet 3 "教师列表"
 * 
 * GET    /api/teachers       - 获取所有教师
 * POST   /api/teachers       - 添加教师
 * PUT    /api/teachers       - 更新教师（body 含 id）
 * DELETE /api/teachers?id=x  - 删除教师
 * 
 * SID 来源（优先级）：请求头 X-WPS-SID > KV wps_sid > 环境变量 WPS_SID
 */

const FILE_ID = "p9fvqTUxFrMh15crYKb6rxQt8Xs8SRXuW";
const SHEET_ID = 3;
const WPS_API = "https://api.wps.cn";

function wpsHeaders(sid) {
  return {
    "Content-Type": "application/json",
    "Cookie": "wps_sid=" + sid,
    "Origin": "https://365.kdocs.cn",
    "Referer": "https://365.kdocs.cn/",
  };
}

async function resolveSid(context) {
  // 1. Request header (灵犀注入)
  const headerSid = context.request.headers.get("X-WPS-SID");
  if (headerSid) return headerSid;
  // 2. KV storage (通过 /api/auth-sid 设置)
  if (context.env?.TEACHERS_KV) {
    const kvSid = await context.env.TEACHERS_KV.get("wps_sid");
    if (kvSid) return kvSid;
  }
  // 3. Environment variable
  return context.env?.WPS_SID || "";
}

async function listTeachers(sid) {
  const url = `${WPS_API}/v7/dbsheet/${FILE_ID}/sheets/${SHEET_ID}/records?page_size=1000`;
  const resp = await fetch(url, {
    method: "POST",
    headers: wpsHeaders(sid),
    body: JSON.stringify({}),
  });
  if (!resp.ok) throw new Error("WPS API " + resp.status);
  const data = await resp.json();
  if (data.code !== 0) throw new Error(data.msg || "获取失败");
  
  return (data.data?.records || []).map(rec => {
    const f = typeof rec.fields === "string" ? JSON.parse(rec.fields) : (rec.fields || {});
    return {
      id: f["工号"] || rec.record_id || rec.id || "",
      name: f["姓名"] || "",
      grade: f["年级"] || "",
      role: (f["角色"] === "教学主管" || f["角色"] === "管理员") ? "admin" : "teacher",
      group: f["职务"] || "",
      password: f["密码"] || "maolin2026",
      _recordId: rec.record_id || rec.id || "",
    };
  });
}

function toFields(t) {
  return {
    "工号": t.id || "",
    "姓名": t.name || "",
    "密码": t.password || "maolin2026",
    "年级": t.grade || "",
    "角色": t.role === "admin" ? "教学主管" : "教师",
    "职务": t.group || "",
  };
}

function strip(t) { const { _recordId, ...r } = t; return r; }

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

async function findRecId(sid, workId) {
  const list = await listTeachers(sid);
  const found = list.find(t => t.id === workId);
  return found?._recordId || null;
}

export async function onRequestGet(context) {
  try {
    const sid = await resolveSid(context);
    if (!sid) return json({ success: false, error: "未授权：缺少 SID（请联系管理员配置）" }, 401);
    const teachers = await listTeachers(sid);
    return json({ success: true, teachers: teachers.map(strip) });
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const sid = await resolveSid(context);
    if (!sid) return json({ success: false, error: "未授权" }, 401);
    const body = await context.request.json();
    if (!body.name) return json({ success: false, error: "姓名不能为空" }, 400);

    const url = `${WPS_API}/v7/dbsheet/${FILE_ID}/sheets/${SHEET_ID}/records/batch_create`;
    const resp = await fetch(url, {
      method: "POST",
      headers: wpsHeaders(sid),
      body: JSON.stringify({ records: [{ fields_value: JSON.stringify(toFields(body)) }] }),
    });
    const data = await resp.json();
    if (data.code !== 0) throw new Error(data.msg || "创建失败");
    return json({ success: true, recordId: data.data?.records?.[0]?.record_id });
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPut(context) {
  try {
    const sid = await resolveSid(context);
    if (!sid) return json({ success: false, error: "未授权" }, 401);
    const body = await context.request.json();
    if (!body.id) return json({ success: false, error: "缺少工号" }, 400);

    const recordId = await findRecId(sid, body.id);
    if (!recordId) return json({ success: false, error: "未找到教师" }, 404);

    const url = `${WPS_API}/v7/dbsheet/${FILE_ID}/sheets/${SHEET_ID}/records/batch_update`;
    const resp = await fetch(url, {
      method: "POST",
      headers: wpsHeaders(sid),
      body: JSON.stringify({ records: [{ record_id: recordId, fields_value: JSON.stringify(toFields(body)) }] }),
    });
    const data = await resp.json();
    if (data.code !== 0) throw new Error(data.msg || "更新失败");
    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const sid = await resolveSid(context);
    if (!sid) return json({ success: false, error: "未授权" }, 401);
    const teacherId = new URL(context.request.url).searchParams.get("id");
    if (!teacherId) return json({ success: false, error: "缺少工号" }, 400);

    const recordId = await findRecId(sid, teacherId);
    if (!recordId) return json({ success: false, error: "未找到教师" }, 404);

    const url = `${WPS_API}/v7/dbsheet/${FILE_ID}/sheets/${SHEET_ID}/records/batch_delete`;
    const resp = await fetch(url, {
      method: "POST",
      headers: wpsHeaders(sid),
      body: JSON.stringify({ record_ids: [recordId] }),
    });
    const data = await resp.json();
    if (data.code !== 0) throw new Error(data.msg || "删除失败");
    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-WPS-SID",
    },
  });
}
