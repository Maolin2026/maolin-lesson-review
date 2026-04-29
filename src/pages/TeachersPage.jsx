import { useState } from "react"
import useTeacherStore from "../stores/teacherStore"
import { GRADES } from "../data/initialTeachers"
import { Users, Plus, Edit2, Trash2, Search, X, UserPlus, Shield } from "lucide-react"

export default function TeachersPage() {
  const teachers = useTeacherStore(s => s.teachers)
  const addTeacher = useTeacherStore(s => s.addTeacher)
  const updateTeacher = useTeacherStore(s => s.updateTeacher)
  const deleteTeacher = useTeacherStore(s => s.deleteTeacher)
  const resetToDefault = useTeacherStore(s => s.resetToDefault)

  const [search, setSearch] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [form, setForm] = useState({ name: "", id: "", grade: "三年级", role: "teacher", group: "", password: "maolin2026" })

  const filtered = teachers.filter(t => {
    if (t.role === "admin") return false
    if (search && !t.name.includes(search)) return false
    if (filterGrade && t.grade !== filterGrade) return false
    return true
  })

  const gradeGroups = GRADES.reduce((acc, g) => {
    acc[g] = filtered.filter(t => t.grade === g)
    return acc
  }, {})

  const handleAdd = () => {
    setEditingTeacher(null)
    setForm({ name: "", id: "", grade: "三年级", role: "teacher", group: "", password: "maolin2026" })
    setShowModal(true)
  }

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
    setForm({ name: teacher.name, id: teacher.id, grade: teacher.grade, role: teacher.role, group: teacher.group, password: teacher.password })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, { name: form.name.trim(), grade: form.grade, group: form.group, password: form.password })
    } else {
      addTeacher({ name: form.name.trim(), grade: form.grade, role: "teacher", group: form.group, password: form.password })
    }
    setShowModal(false)
  }

  const handleDelete = (teacher) => {
    if (confirm(`确定要删除教师 ${teacher.name} 吗？`)) {
      deleteTeacher(teacher.id)
    }
  }

  const handleReset = () => {
    if (confirm("确定要恢复默认教师名单吗？此操作将覆盖所有修改。")) {
      resetToDefault()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Users className="w-7 h-7" /> 教师管理
        </h1>
        <div className="flex gap-2">
          <button onClick={handleReset} className="btn-secondary text-sm">
            恢复默认
          </button>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-1">
            <Plus className="w-4 h-4" /> 添加教师
          </button>
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {GRADES.map(g => {
          const count = teachers.filter(t => t.grade === g && t.role !== "admin").length
          return (
            <div key={g} className="card text-center py-3">
              <p className="text-2xl font-bold text-primary-600">{count}</p>
              <p className="text-sm text-gray-500">{g}</p>
            </div>
          )
        })}
      </div>

      {/* 搜索 */}
      <div className="card">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
              placeholder="搜索教师姓名..."
            />
          </div>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="input-field w-auto">
            <option value="">全部年级</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* 教师列表（按年级分组） */}
      {GRADES.map(grade => {
        const group = gradeGroups[grade]
        if (!group || group.length === 0) return null
        return (
          <div key={grade} className="card">
            <h3 className="section-title mb-3">{grade}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">编号</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">姓名</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">职务</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map(t => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-400">{t.id}</td>
                      <td className="py-2 px-3 font-medium">{t.name}</td>
                      <td className="py-2 px-3">
                        {t.group === "组长" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            <Shield className="w-3 h-3" /> 组长
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">教师</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-primary-600 hover:text-primary-700 p-1"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="text-red-500 hover:text-red-700 p-1 ml-2"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">未找到匹配的教师</p>
        </div>
      )}

      {/* 添加/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingTeacher ? "编辑教师" : "添加教师"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-text">姓名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder="教师姓名"
                />
              </div>
              <div>
                <label className="label-text">年级</label>
                <select
                  value={form.grade}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  className="input-field"
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">职务</label>
                <select
                  value={form.group}
                  onChange={e => setForm(f => ({ ...f, group: e.target.value }))}
                  className="input-field"
                >
                  <option value="">普通教师</option>
                  <option value="组长">组长</option>
                </select>
              </div>
              <div>
                <label className="label-text">密码</label>
                <input
                  type="text"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field"
                  placeholder="登录密码"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                取消
              </button>
              <button onClick={handleSave} className="btn-primary flex-1" disabled={!form.name.trim()}>
                {editingTeacher ? "保存修改" : "添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}