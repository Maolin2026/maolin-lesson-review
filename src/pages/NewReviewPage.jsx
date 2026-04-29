import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import useTeacherStore from "../stores/teacherStore"
import useReviewStore from "../stores/reviewStore"
import useSettingsStore from "../stores/settingsStore"
import { callZhipuReview } from "../api/zhipu"
import { REVIEW_TYPES, REVIEW_DIMENSIONS, PASS_SCORE } from "../data/reviewStandards"
import {
  FileText, Video, Loader2, AlertCircle, CheckCircle2,
  ArrowLeft, ChevronRight, X, Star, Lightbulb, Database, CloudOff
} from "lucide-react"

export default function NewReviewPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const allTeachers = useTeacherStore(s => s.teachers)
  const addReview = useReviewStore(s => s.addReview)
  const passScore = useSettingsStore(s => s.settings.passScore) || 85

  const teachers = useMemo(() => allTeachers.filter(t => t.role !== "admin"), [allTeachers])

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    type: "lesson_plan",
    teacherId: "",
    grade: "",
    classType: "",
    subject: "数学",
    topic: "",
    content: "",
  })
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [progress, setProgress] = useState("")
  const [cloudStatus, setCloudStatus] = useState(null) // null | "saving" | "success" | "error"

  useEffect(() => {
    if (!isAdmin && user?.id && !formData.teacherId) {
      setFormData(prev => ({ ...prev, teacherId: user.id, grade: user.grade }))
    }
  }, [isAdmin, user?.id, formData.teacherId])

  const filteredTeachers = useMemo(
    () => formData.grade ? teachers.filter(t => t.grade === formData.grade) : teachers,
    [teachers, formData.grade]
  )

  const selectedTeacher = teachers.find(t => t.id === formData.teacherId)

  const getTypeLabel = (type) => {
    return REVIEW_TYPES[type] || REVIEW_TYPES[type.toUpperCase()] || type
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.type || !formData.teacherId || !formData.grade || !formData.topic || !formData.classType) {
        setError("请填写完整评课信息（含班型）")
        return
      }
      setError("")
      setStep(2)
    }
  }

  const handleStartReview = async () => {
    if (!formData.content.trim()) {
      setError("请输入评课内容")
      return
    }
    if (formData.content.trim().length < 50) {
      setError("评课内容过少，请至少输入50字")
      return
    }

    setError("")
    setStep(3)
    setIsReviewing(true)
    setCloudStatus(null)
    setProgress("正在连接AI评课系统...")

    try {
      setProgress("AI正在分析评课内容，请耐心等待...")
      const reviewResult = await callZhipuReview({
        type: formData.type,
        teacherName: selectedTeacher?.name || "未知",
        grade: formData.grade,
        subject: formData.subject,
        content: formData.content,
      })

      if (reviewResult.success) {
        // addReview 现在是 async，提交到 D1 数据库
        setCloudStatus("saving")
        const saved = await addReview({
          ...formData,
          teacherName: selectedTeacher?.name,
          reviewerName: user?.name || "系统管理员",
          totalScore: reviewResult.totalScore,
          dimensions: reviewResult.dimensions,
          overallComment: reviewResult.overallComment,
          suggestions: reviewResult.suggestions,
          highlights: reviewResult.highlights,
          passScore: passScore,
        })

        setResult({ ...reviewResult, id: saved.id })
        setStep(4)
        setCloudStatus("success")
      } else {
        setError("AI返回结果格式异常：" + (reviewResult.parseError || "无法解析评分"))
        setStep(2)
      }
    } catch (err) {
      setError("评课失败：" + err.message)
      setStep(2)
    } finally {
      setIsReviewing(false)
      setProgress("")
    }
  }

  const scoreColor = (score) => {
    if (score >= 90) return "text-green-600"
    if (score >= 85) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const scoreBg = (score) => {
    if (score >= 90) return "bg-green-50 border-green-200"
    if (score >= 85) return "bg-blue-50 border-blue-200"
    if (score >= 60) return "bg-yellow-50 border-red-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => step > 1 && step < 3 && setStep(1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className={step >= 1 ? "text-primary-600 font-medium" : "text-gray-400"}>
          1. 评课信息
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className={step >= 2 ? "text-primary-600 font-medium" : "text-gray-400"}>
          2. 填写内容
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className={step >= 4 ? "text-primary-600 font-medium" : "text-gray-400"}>
          3. 评课结果
        </span>
      </div>

      {/* 步骤1: 选择评课信息 */}
      {step === 1 && (
        <div className="card space-y-5">
          <h2 className="section-title">评课信息</h2>

          <div>
            <label className="label-text">类型</label>
            <div className="flex gap-3 mt-2">
              {[
                { value: "lesson_plan", label: "评教案", icon: FileText, desc: "评审教师教案设计" },
                { value: "class_recording", label: "评实录", icon: Video, desc: "评审课堂实录记录" },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setFormData(f => ({ ...f, type: t.value }))}
                  className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                    formData.type === t.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <t.icon className={`w-6 h-6 mb-2 ${formData.type === t.value ? "text-primary-600" : "text-gray-400"}`} />
                  <p className={`font-medium ${formData.type === t.value ? "text-primary-700" : "text-gray-700"}`}>{t.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="label-text">年级</label>
              <select
                value={formData.grade}
                onChange={e => setFormData(f => ({ ...f, grade: e.target.value, teacherId: "" }))}
                className="input-field"
              >
                <option value="">请选择年级</option>
                {["三年级", "四年级", "五年级", "六年级"].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label-text">班型</label>
            <div className="flex gap-3 mt-2">
              {[
                { value: "强", label: "强班", desc: "培优强化的班级" },
                { value: "优", label: "优班", desc: "巩固提升的班级" },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setFormData(f => ({ ...f, classType: t.value }))}
                  className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                    formData.classType === t.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`font-medium text-lg ${formData.classType === t.value ? "text-primary-700" : "text-gray-700"}`}>{t.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {isAdmin ? (
            <div>
              <label className="label-text">被评教师</label>
              <select
                value={formData.teacherId}
                onChange={e => setFormData(f => ({ ...f, teacherId: e.target.value }))}
                className="input-field"
              >
                <option value="">请选择教师</option>
                {filteredTeachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.group ? ` (${t.group})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="label-text">被评教师</label>
              <input
                type="text"
                value={user?.name || ""}
                className="input-field bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">非管理员默认评自己</p>
            </div>
          )}

          <div>
            <label className="label-text">课题名称</label>
            <input
              type="text"
              value={formData.topic}
              onChange={e => setFormData(f => ({ ...f, topic: e.target.value }))}
              className="input-field"
              placeholder="例如：三角形角度计算"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              下一步 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 步骤2: 填写评课内容 */}
      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="section-title">填写评课内容</h2>

          <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <span className="font-medium text-gray-700">{selectedTeacher?.name}</span>
            <span>{formData.grade}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              formData.type === "lesson_plan" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
            }`}>
              {getTypeLabel(formData.type)}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {formData.classType}班
            </span>
            <span className="text-gray-400">{formData.topic}</span>
          </div>

          <div>
            <label className="label-text">评课内容</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
              className="input-field min-h-[300px] resize-y"
              placeholder="请粘贴或输入教案内容/课堂实录...&#10;&#10;支持以下格式：&#10;- 教案文本（教学目标、教学过程、板书设计等）&#10;- 课堂实录（教学活动记录、师生对话等）&#10;&#10;建议内容不少于50字，内容越详细，评课结果越准确。"
            />
            <p className="text-xs text-gray-400 mt-1">
              已输入 {formData.content.length} 字（建议不少于50字）
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> 上一步
            </button>
            <button
              onClick={handleStartReview}
              disabled={isReviewing || !formData.content.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isReviewing ? "评课中..." : "开始AI评课"}
            </button>
          </div>
        </div>
      )}

      {/* 步骤3: AI评课中 */}
      {step === 3 && (
        <div className="card text-center py-16 space-y-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
          <p className="text-gray-600">{progress}</p>
          <p className="text-sm text-gray-400">AI评课通常需要30-60秒，请耐心等待...</p>
        </div>
      )}

      {/* 步骤4: 评课结果 */}
      {step === 4 && result && (
        <div className="space-y-4">
          {/* 总分卡片 */}
          <div className={`rounded-xl border-2 p-6 ${scoreBg(result.totalScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">评课结果</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedTeacher?.name} - {formData.topic}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${scoreColor(result.totalScore)}`}>
                  {result.totalScore}<span className="text-lg">分</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {result.totalScore >= passScore ? (
                    <><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-sm text-green-600 font-medium">达标</span></>
                  ) : (
                    <><X className="w-4 h-4 text-red-500" /><span className="text-sm text-red-500 font-medium">未达标</span></>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 云端同步状态 */}
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            cloudStatus === "success" ? "bg-green-50 border border-green-200 text-green-700" :
            cloudStatus === "error" ? "bg-red-50 border border-red-200 text-red-700" :
            "bg-blue-50 border border-blue-200 text-blue-700"
          }`}>
            <Database className="w-4 h-4 flex-shrink-0" />
            {cloudStatus === "success" ? (
              <span>评课记录已保存到云端数据库，将自动同步到多维表</span>
            ) : cloudStatus === "error" ? (
              <span>云端保存失败，数据仅保留在本地浏览器</span>
            ) : (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>正在保存到云端...</span></>
            )}
          </div>

          {/* 维度评分 */}
          <div className="card space-y-3">
            <h3 className="section-title">维度评分</h3>
            <div className="space-y-3">
              {result.dimensions && result.dimensions.map(dim => (
                <div key={dim.dimensionId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{dim.name}</span>
                    <span className={`font-semibold ${scoreColor(dim.score)}`}>{dim.score}/{dim.maxScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dim.score >= 9 ? "bg-green-500" :
                        dim.score >= 8 ? "bg-blue-500" :
                        dim.score >= 6 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 亮点 */}
          {result.highlights && result.highlights.length > 0 && (
            <div className="card space-y-2">
              <h3 className="section-title flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> 亮点
              </h3>
              <ul className="space-y-1">
                {result.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">-</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 评语 */}
          <div className="card space-y-2">
            <h3 className="section-title">总体评语</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{result.overallComment}</p>
          </div>

          {/* 改进建议 */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="card space-y-2">
              <h3 className="section-title flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary-500" /> 改进建议
              </h3>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-primary-500 font-medium mt-0.5">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/review/history")}
              className="btn-secondary flex-1"
            >
              查看历史记录
            </button>
            <button
              onClick={() => {
                setStep(1)
                setFormData(prev => ({ ...prev, content: "" }))
                setResult(null)
                setCloudStatus(null)
              }}
              className="btn-primary flex-1"
            >
              继续评课
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
