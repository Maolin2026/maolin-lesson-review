import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import useReviewStore from "../stores/reviewStore"
import { REVIEW_TYPES, PASS_SCORE } from "../data/reviewStandards"
import { ClipboardCheck, Search, ChevronDown, ChevronUp, Trash2, Eye } from "lucide-react"

export default function ReviewHistoryPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const reviews = useReviewStore(s => s.reviews)
  const deleteReview = useReviewStore(s => s.deleteReview)
  const isSynced = useReviewStore(s => s.isSynced)

  const [search, setSearch] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [filterType, setFilterType] = useState("")
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    let list = isAdmin ? reviews : reviews.filter(r => r.teacherId === user?.id)
    if (search) {
      const kw = search.toLowerCase()
      list = list.filter(r =>
        r.teacherName?.toLowerCase().includes(kw) ||
        r.topic?.toLowerCase().includes(kw)
      )
    }
    if (filterGrade) list = list.filter(r => r.grade === filterGrade)
    if (filterType) list = list.filter(r => r.type === filterType)
    return list
  }, [reviews, search, filterGrade, filterType, isAdmin, user])

  const scoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 85) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const handleDelete = async (id) => {
    if (confirm("确定要删除这条评课记录吗？此操作不可恢复。")) {
      await deleteReview(id)
      if (expandedId === id) setExpandedId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">评课记录</h1>
        <button onClick={() => navigate("/review/new")} className="btn-primary">
          新建评课
        </button>
      </div>

      {/* 数据同步状态 */}
      {!isSynced && (
        <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
          当前显示的是本地缓存数据，无法连接云端数据库
        </div>
      )}

      {/* 筛选栏 */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
              placeholder="搜索教师姓名或课题..."
            />
          </div>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="input-field w-auto">
            <option value="">全部年级</option>
            {["三年级", "四年级", "五年级", "六年级"].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field w-auto">
            <option value="">全部类型</option>
            <option value="lesson_plan">评教案</option>
            <option value="class_recording">评实录</option>
          </select>
        </div>
      </div>

      {/* 记录列表 */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">暂无评课记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card hover:shadow-md transition-shadow">
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <div className={`text-xl font-bold min-w-[60px] text-center px-3 py-1 rounded-lg border ${scoreColor(r.totalScore)}`}>
                  {r.totalScore}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{r.teacherName}</span>
                    <span className="text-sm text-gray-400">{r.grade}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      r.type === "lesson_plan" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {REVIEW_TYPES[r.type] || REVIEW_TYPES[r.type?.toUpperCase()] || r.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{r.topic}</p>
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString("zh-CN")}
                </span>
                {expandedId === r.id
                  ? <ChevronUp className="w-5 h-5 text-gray-400" />
                  : <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </div>

              {expandedId === r.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {r.dimensions && r.dimensions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">维度评分</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {r.dimensions.map(dim => (
                          <div key={dim.dimensionId} className="bg-gray-50 rounded-lg p-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{dim.name}</span>
                              <span className="font-medium">{dim.score}/{dim.maxScore}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="h-full rounded-full bg-primary-500"
                                style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.overallComment && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">总体评语</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{r.overallComment}</p>
                    </div>
                  )}
                  {r.suggestions && r.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">改进建议</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {r.suggestions.map((s, i) => <li key={i}>{i + 1}. {s}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
                      className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> 删除记录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        共 {filtered.length} 条记录
        {isAdmin && reviews.length !== filtered.length && ` (筛选自 ${reviews.length} 条)`}
        {isSynced && " | 数据已同步"}
      </div>
    </div>
  )
}
