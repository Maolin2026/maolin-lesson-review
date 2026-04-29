import { create } from "zustand"

const STORAGE_KEY = "lr_reviews"
const API_BASE = "/api/reviews"

function loadReviews() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
}

const useReviewStore = create((set, get) => ({
  reviews: loadReviews(),
  isLoading: false,
  isSynced: false,
  syncError: null,

  fetchReviews: async () => {
    set({ isLoading: true, syncError: null })
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error("加载失败 (" + response.status + ")")
      }
      const data = await response.json()
      if (data.success) {
        const reviews = data.reviews.map(r => ({
          id: r.id,
          topic: r.topic,
          teacherId: r.teacher_id,
          teacherName: r.teacher_name,
          grade: r.grade,
          classType: r.class_type,
          type: r.type,
          subject: r.subject,
          totalScore: r.total_score,
          dimensions: r.dimensions,
          overallComment: r.overall_comment,
          suggestions: r.suggestions,
          highlights: r.highlights,
          createdAt: r.created_at,
          status: "completed",
        }))
        saveReviews(reviews)
        set({ reviews, isSynced: true })
        return reviews
      } else {
        throw new Error(data.error || "加载失败")
      }
    } catch (err) {
      console.warn("从 D1 加载评课记录失败，使用本地缓存:", err.message)
      set({ syncError: err.message, isSynced: false })
      return get().reviews
    } finally {
      set({ isLoading: false })
    }
  },

  addReview: async (review) => {
    const newReview = {
      ...review,
      id: "R" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "completed",
    }

    const reviews = [newReview, ...get().reviews]
    saveReviews(reviews)
    set({ reviews })

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: review.topic,
          teacherId: review.teacherId || "",
          teacherName: review.teacherName,
          grade: review.grade,
          classType: review.classType,
          type: review.type,
          subject: review.subject || "数学",
          reviewerName: review.reviewerName,
          totalScore: review.totalScore,
          passScore: review.passScore || 85,
          dimensions: review.dimensions,
          overallComment: review.overallComment,
          suggestions: review.suggestions,
          highlights: review.highlights,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          newReview.id = data.review.id
          newReview.createdAt = data.review.createdAt
          const updated = [newReview, ...get().reviews.filter(r => r.id !== newReview.id)]
          saveReviews(updated)
          set({ reviews: updated })
        }
      }
    } catch (err) {
      console.warn("评课记录提交到 D1 失败，已保留本地缓存:", err.message)
    }

    return newReview
  },

  deleteReview: async (id) => {
    const reviews = get().reviews.filter(r => r.id !== id)
    saveReviews(reviews)
    set({ reviews })

    try {
      await fetch(API_BASE + "/" + id, { method: "DELETE" })
    } catch (err) {
      console.warn("从 D1 删除失败:", err.message)
    }
  },

  getById: (id) => get().reviews.find(r => r.id === id),

  getByTeacher: (teacherId) => get().reviews.filter(r => r.teacherId === teacherId),

  getByGrade: (grade) => get().reviews.filter(r => r.grade === grade),

  getRecent: (limit = 10) => get().reviews.slice(0, limit),

  getStats: () => {
    const reviews = get().reviews
    const total = reviews.length
    const passScore = 85
    const passed = reviews.filter(r => r.totalScore >= passScore).length
    const avgScore = total > 0
      ? (reviews.reduce((sum, r) => sum + r.totalScore, 0) / total).toFixed(1)
      : 0
    const byType = {
      lesson_plan: reviews.filter(r => r.type === "lesson_plan").length,
      class_recording: reviews.filter(r => r.type === "class_recording").length,
    }
    const byGrade = {}
    for (const r of reviews) {
      if (!byGrade[r.grade]) byGrade[r.grade] = { total: 0, avg: 0, passed: 0 }
      byGrade[r.grade].total++
      byGrade[r.grade].avg += r.totalScore
      if (r.totalScore >= passScore) byGrade[r.grade].passed++
    }
    for (const g in byGrade) {
      byGrade[g].avg = (byGrade[g].avg / byGrade[g].total).toFixed(1)
    }
    return { total, passed, passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0, avgScore, byType, byGrade }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}))

export default useReviewStore
