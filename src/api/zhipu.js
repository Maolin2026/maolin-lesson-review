import useSettingsStore from "../stores/settingsStore"
import { buildReviewPrompt } from "../data/reviewStandards"

/**
 * 调用智谱AI进行评课
 * @param {Object} params - 评课参数
 * @param {string} params.type - "lesson_plan" | "class_recording"
 * @param {string} params.teacherName - 教师姓名
 * @param {string} params.grade - 年级
 * @param {string} params.subject - 学科
 * @param {string} params.content - 教案或实录内容
 * @param {Function} params.onStream - 流式回调（可选）
 * @returns {Promise<Object>} 评课结果
 */
export async function callZhipuReview({ type, teacherName, grade, subject, content, onStream }) {
  const settings = useSettingsStore.getState()

  if (!settings.settings.zhipuApiKey) {
    throw new Error("未配置智谱AI API Key，请在系统设置中配置")
  }

  const prompt = buildReviewPrompt(
    type,
    teacherName,
    grade,
    subject,
    content
  )

  const systemPrompt = `你是茂林教育小学数学项目组的AI评课助手。请严格按照茂林磨课19条标准进行专业评课，评分客观公正，评语具体有针对性。返回JSON格式结果，不要包含markdown代码块标记。`

  const requestBody = {
    model: settings.settings.zhipuModel || "glm-4-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    top_p: 0.7,
    max_tokens: 4096,
  }

  const response = await fetch(settings.settings.zhipuApiUrl || "https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${settings.settings.zhipuApiKey}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API请求失败 (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const resultText = data.choices?.[0]?.message?.content || ""

  // 尝试解析JSON结果
  try {
    // 清理可能的markdown代码块标记
    let cleanText = resultText.trim()
    if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7)
    if (cleanText.startsWith("```")) cleanText = cleanText.slice(3)
    if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3)
    cleanText = cleanText.trim()

    const result = JSON.parse(cleanText)
    return {
      success: true,
      totalScore: result.totalScore || 0,
      dimensions: result.dimensions || [],
      overallComment: result.overallComment || "",
      suggestions: result.suggestions || [],
      highlights: result.highlights || [],
      rawText: resultText
    }
  } catch (parseError) {
    // JSON解析失败，返回原始文本
    return {
      success: false,
      totalScore: 0,
      dimensions: [],
      overallComment: "AI返回结果格式异常，无法解析评分",
      suggestions: [],
      highlights: [],
      rawText: resultText,
      parseError: parseError.message
    }
  }
}

/**
 * 测试API Key是否有效
 */
export async function testZhipuApiKey(apiKey) {
  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [{ role: "user", content: "你好，请回复测试成功" }],
        max_tokens: 20,
      })
    })
    return response.ok
  } catch {
    return false
  }
}