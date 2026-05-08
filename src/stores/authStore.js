import { create } from "zustand"

const STORAGE_KEY = "lr_auth"

function loadAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

function saveAuth(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

const initialUser = loadAuth()

const useAuthStore = create((set, get) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isAdmin: initialUser?.role === "admin",

  login: async (name, password) => {
    // 尝试从 API 获取教师列表（多维表）
    let teachers = []
    try {
      const resp = await fetch("/api/teachers")
      if (resp.ok) {
        const data = await resp.json()
        if (data.success && data.teachers?.length) {
          teachers = data.teachers
          // 缓存到 localStorage 供离线使用
          localStorage.setItem("lr_teachers", JSON.stringify(teachers))
        }
      }
    } catch {
      // API 不可用时 fallback 到本地缓存
    }

    // 本地 fallback
    if (!teachers.length) {
      try {
        const saved = localStorage.getItem("lr_teachers")
        if (saved) teachers = JSON.parse(saved)
      } catch {}
    }

    // 最终 fallback 到初始数据
    if (!teachers.length) {
      const { INITIAL_TEACHERS } = await import("../data/initialTeachers")
      teachers = INITIAL_TEACHERS
    }

    const found = teachers.find(t => t.name === name && t.password === password)
    if (found) {
      const userData = {
        id: found.id,
        name: found.name,
        grade: found.grade,
        role: found.role,
        group: found.group,
      }
      saveAuth(userData)
      set({
        user: userData,
        isAuthenticated: true,
        isAdmin: userData.role === "admin",
      })
      return { success: true, user: userData }
    }
    return { success: false, message: "姓名或密码错误" }
  },

  logout: () => {
    saveAuth(null)
    set({ user: null, isAuthenticated: false, isAdmin: false })
  },
}))

export default useAuthStore
