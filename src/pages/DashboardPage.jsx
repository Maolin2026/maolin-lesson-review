import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import useAuthStore from "../stores/authStore"
import useReviewStore from "../stores/reviewStore"
import useTeacherStore from "../stores/teacherStore"
import {
  BarChart3, Users, ClipboardCheck, TrendingUp,
  ArrowRight, CheckCircle2, AlertCircle
} from "lucide-react"
import { REVIEW_TYPES, PASS_SCORE } from "../data/reviewStandards"

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const reviews = useReviewStore(s => s.reviews)
  const allTeachers = useTeacherStore(s => s.teachers)

  const stats = useMemo(() => useReviewStore.getState().getStats(), [reviews])
  const recentReviews = useMemo(() => useReviewStore.getState().getRecent(5), [reviews])
  const gradeStats = useMemo(() => useTeacherStore.getState().getGradeStats(), [allTeachers])

  const scoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 85) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const gradeDistribution = [
    { label: "90+", range: [90, 100], color: "bg-green-500" },
    { label: "80-89", range: [80, 89], color: "bg-blue-500" },
    { label: "60-79", range: [60, 79], color: "bg-yellow-500" },
    { label: "<60", range: [0, 59], color: "bg-red-500" },
  ]

  const distCounts = gradeDistribution.map(g =>
    reviews.filter(r => r.totalScore >= g.range[0] && r.totalScore <= g.range[1]).length
  )
  const maxCount = Math.max(...distCounts, 1)

  return (
    <div className="space-y-6">
      {/* 欢迎横幅 */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          {isAdmin ? `欢迎回来，${user?.name}老师` : `${user?.name}老师，您好`}
        </h1>
        <p className="text-primary-200 mt-1">
          {isAdmin ? "教学主管工作台" : `${user?.grade} · AI磨课评课`}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <ClipboardCheck className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">评课总数</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">达标率</p>
            <p className="text-2xl font-bold">{stats.passRate}%</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">平均分</p>
            <p className="text-2xl font-bold">{stats.avgScore}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">教师人数</p>
            <p className="text-2xl font-bold">{useTeacherStore.getState().teachers.filter(t => t.role !== "admin").length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 成绩分布 */}
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> 成绩分布
          </h3>
          {stats.total === 0 ? (
            <p className="text-gray-400 text-center py-8">暂无评课数据</p>
          ) : (
            <div className="space-y-3">
              {gradeDistribution.map((g, i) => (
                <div key={g.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{g.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className={`${g.color} h-full rounded-full transition-all flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max((distCounts[i] / maxCount) * 100, 8)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{distCounts[i]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 最近评课 */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" /> 最近评课
            </h3>
            <button
              onClick={() => navigate("/review/history")}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {recentReviews.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">暂无评课记录</p>
              <button
                onClick={() => navigate("/review/new")}
                className="btn-primary mt-4"
              >
                开始评课
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">教师</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">年级</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">类型</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">分数</th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReviews.map(r => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2">{r.teacherName}</td>
                      <td className="py-2 px-2">{r.grade}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          r.type === "lesson_plan" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}>
                          {REVIEW_TYPES[r.type] || REVIEW_TYPES[r.type?.toUpperCase()] || r.type}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${
                          scoreColor(r.totalScore)
                        }`}>
                          {r.totalScore}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-500">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/review/new")}
          className="card hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">新建评课</h3>
              <p className="text-sm text-gray-500 mt-1">AI评教案 / AI评实录</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </button>
        <button
          onClick={() => navigate("/review/history")}
          className="card hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">评课记录</h3>
              <p className="text-sm text-gray-500 mt-1">查看历史评课结果</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </button>
        {isAdmin && (
          <button
            onClick={() => navigate("/teachers")}
            className="card hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">教师管理</h3>
                <p className="text-sm text-gray-500 mt-1">管理教师信息</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}