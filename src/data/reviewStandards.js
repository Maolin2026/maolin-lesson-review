// 茂林磨课19条评分标准（满分100分）
// 涵盖：教学准备、教学内容、教学方法、教学效果、教师素养 五大维度

export const REVIEW_DIMENSIONS = [
  {
    id: "preparation",
    name: "教学准备",
    weight: 15,
    standards: [
      { id: "p1", name: "教学目标明确", description: "教学目标符合课标要求，准确、具体、可检测", maxScore: 5 },
      { id: "p2", name: "重点难点把握", description: "准确把握教材重点难点，处理得当", maxScore: 5 },
      { id: "p3", name: "教学准备充分", description: "教具、课件、板书设计等准备充分，符合教学需要", maxScore: 5 },
    ]
  },
  {
    id: "content",
    name: "教学内容",
    weight: 25,
    standards: [
      { id: "c1", name: "内容准确无误", description: "教学内容科学准确，无知识性错误", maxScore: 5 },
      { id: "c2", name: "知识结构清晰", description: "知识讲解条理清晰，逻辑性强，层次分明", maxScore: 5 },
      { id: "c3", name: "教材处理得当", description: "对教材内容的处理和重组合理有效", maxScore: 5 },
      { id: "c4", name: "例题选择恰当", description: "例题典型、梯度合理，有助于学生理解", maxScore: 5 },
      { id: "c5", name: "练习设计有效", description: "课堂练习设计有针对性、层次性和拓展性", maxScore: 5 },
    ]
  },
  {
    id: "method",
    name: "教学方法",
    weight: 25,
    standards: [
      { id: "m1", name: "教学方法灵活", description: "根据教学内容和学生实际灵活选择教学方法", maxScore: 5 },
      { id: "m2", name: "启发式教学", description: "善于启发引导，注重培养学生的思维能力和探究意识", maxScore: 5 },
      { id: "m3", name: "互动有效", description: "师生互动、生生互动充分有效，课堂氛围活跃", maxScore: 5 },
      { id: "m4", name: "时间分配合理", description: "各教学环节时间分配合理，节奏把控得当", maxScore: 5 },
      { id: "m5", name: "信息技术运用", description: "合理运用信息技术手段辅助教学，效果良好", maxScore: 5 },
    ]
  },
  {
    id: "effect",
    name: "教学效果",
    weight: 20,
    standards: [
      { id: "e1", name: "学生参与度高", description: "学生积极主动参与课堂学习活动", maxScore: 5 },
      { id: "e2", name: "目标达成度高", description: "教学目标达成度高，学生掌握效果好", maxScore: 5 },
      { id: "e3", name: "反馈及时有效", description: "能及时获取学生反馈并做出针对性调整", maxScore: 5 },
      { id: "e4", name: "分层教学落实", description: "关注不同层次学生的学习需求，因材施教", maxScore: 5 },
    ]
  },
  {
    id: "literacy",
    name: "教师素养",
    weight: 15,
    standards: [
      { id: "l1", name: "语言表达规范", description: "教学语言准确、简洁、生动，富有感染力", maxScore: 5 },
      { id: "l2", name: "板书设计合理", description: "板书设计规范、美观，突出教学重点", maxScore: 5 },
    ]
  }
]

// 获取所有标准的扁平列表
export function getAllStandards() {
  return REVIEW_DIMENSIONS.flatMap(dim =>
    dim.standards.map(s => ({ ...s, dimension: dim.name, dimensionId: dim.id }))
  )
}

// 验证总分是否为100
export const TOTAL_MAX_SCORE = getAllStandards().reduce((sum, s) => sum + s.maxScore, 0)

// 评课类型
export const REVIEW_TYPES = {
  LESSON_PLAN: "评教案",
  CLASS_RECORDING: "评实录",
  lesson_plan: "评教案",
  class_recording: "评实录"
}

// 达标线
export const PASS_SCORE = 85

// AI评课提示词模板
export function buildReviewPrompt(type, teacherName, grade, subject, content) {
  const allStandards = getAllStandards()
  const standardList = allStandards.map((s, i) =>
    `${i + 1}. ${s.name}（${s.dimension}）：${s.description}（满分${s.maxScore}分）`
  ).join("\n")

  return `你是一位经验丰富的小学数学教学评审专家。请根据茂林磨课标准，对以下${type === "lesson_plan" ? "教案" : "课堂实录"}进行专业评审。

评审教师：${teacherName}
年级：${grade}
学科：数学
${type === "lesson_plan" ? "教案内容" : "课堂实录内容"}：
${content}

请严格按照以下19条标准逐项评分（每项0-5分），并给出综合评价。

${standardList}

请按以下JSON格式返回评课结果（不要包含其他内容）：
{
  "totalScore": <总分0-100>,
  "dimensions": [
    {
      "dimensionId": "<维度ID>",
      "name": "<维度名称>",
      "score": <维度得分>,
      "maxScore": <维度满分>,
      "standards": [
        {
          "id": "<标准ID>",
          "name": "<标准名称>",
          "score": <得分0-5>,
          "maxScore": 5,
          "comment": "<简要评语>"
        }
      ],
      "comment": "<维度综合评语>"
    }
  ],
  "overallComment": "<总体评语>",
  "suggestions": ["<改进建议1>", "<改进建议2>", "<改进建议3>"],
  "highlights": ["<亮点1>", "<亮点2>"]
}`
}
