import { create } from "zustand"
import { INITIAL_TEACHERS } from "../data/initialTeachers"

const STORAGE_KEY = "lr_teachers"

function loadTeachers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return INITIAL_TEACHERS
}

function saveTeachers(teachers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers))
}

const useTeacherStore = create((set, get) => ({
  teachers: loadTeachers(),

  getByGrade: (grade) => get().teachers.filter(t => t.grade === grade),

  getGroupLeaders: () => get().teachers.filter(t => t.group === "组长"),

  getById: (id) => get().teachers.find(t => t.id === id),

  addTeacher: (teacher) => {
    const teachers = [...get().teachers, { ...teacher, id: teacher.id || `ML${Date.now()}` }]
    saveTeachers(teachers)
    set({ teachers })
    return teachers[teachers.length - 1]
  },

  updateTeacher: (id, updates) => {
    const teachers = get().teachers.map(t => t.id === id ? { ...t, ...updates } : t)
    saveTeachers(teachers)
    set({ teachers })
  },

  deleteTeacher: (id) => {
    const teachers = get().teachers.filter(t => t.id !== id)
    saveTeachers(teachers)
    set({ teachers })
  },

  resetToDefault: () => {
    saveTeachers(INITIAL_TEACHERS)
    set({ teachers: INITIAL_TEACHERS })
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
  }
}))

export default useTeacherStore