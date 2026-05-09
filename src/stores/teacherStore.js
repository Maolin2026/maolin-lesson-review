import { create } from "zustand"
import { INITIAL_TEACHERS } from "../data/initialTeachers"

const STORAGE_KEY = "lr_teachers"

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return null
}

function saveLocal(teachers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers))
}

const useTeacherStore = create((set, get) => ({
  teachers: [],
  loading: false,
  initialized: false,
  error: null,
  lastSync: null,

  /**
   * 加载教师列表
   * 优先级: localStorage > API > INITIAL_TEACHERS
   * localStorage 是主数据源，手动增删改的教师不会因 API 重启而丢失
   */
  fetchTeachers: async () => {
    if (get().loading) return

    set({ loading: true, error: null })

    // 1. 先加载本地数据（即使没有网络也能用）
    const local = loadLocal()
    if (local) {
      set({ teachers: local, initialized: true })
    } else {
      // 首次使用：用初始数据初始化
      saveLocal(INITIAL_TEACHERS)
      set({ teachers: INITIAL_TEACHERS, initialized: true })
    }

    // 2. 后台同步 API（不阻塞 UI）
    try {
      const resp = await fetch("/api/teachers")
      const data = await resp.json()
      if (data.success && data.teachers && data.teachers.length > 0) {
        // 仅当 API 返回的数据比本地多时才替换（避免手动添加的数据被覆盖）
        const localLen = get().teachers.length
        if (data.teachers.length > localLen) {
          saveLocal(data.teachers)
          set({ teachers: data.teachers, lastSync: Date.now() })
        }
      }
    } catch (err) {
      // API 不可用时，本地数据已加载，不影响使用
      console.warn("API 同步教师数据失败（使用本地缓存）:", err.message)
    } finally {
      set({ loading: false })
    }
  },

  getByGrade: (grade) => get().teachers.filter(t => t.grade === grade),
  getGroupLeaders: () => get().teachers.filter(t => t.group === "组长"),
  getById: (id) => get().teachers.find(t => t.id === id),

  addTeacher: async (teacher) => {
    const newTeacher = { ...teacher, id: teacher.id || `ML${Date.now()}` }
    const updated = [...get().teachers, newTeacher]
    saveLocal(updated)
    set({ teachers: updated })

    // 尝试同步到 API（不阻塞）
    try {
      await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher),
      })
    } catch {}

    return newTeacher
  },

  updateTeacher: async (id, updates) => {
    const updated = get().teachers.map(t => t.id === id ? { ...t, ...updates } : t)
    saveLocal(updated)
    set({ teachers: updated })

    try {
      await fetch("/api/teachers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })
    } catch {}
  },

  deleteTeacher: async (id) => {
    const updated = get().teachers.filter(t => t.id !== id)
    saveLocal(updated)
    set({ teachers: updated })

    try {
      await fetch(`/api/teachers?id=${id}`, { method: "DELETE" })
    } catch {}
  },

  getGradeStats: () => {
    const teachers = get().teachers.filter(t => t.role !== "admin")
    const stats = {}
    for (const t of teachers) {
      if (!stats[t.grade]) stats[t.grade] = { total: 0, leaders: 0 }
      stats[t.grade].total++
      if (t.group === "组长") stats[t.grade].leaders++
    }
    return stats
  },
}))

export default useTeacherStore