import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !password.trim()) {
      setError("请输入姓名和密码")
      return
    }
    setLoading(true)
    setError("")
    // 短暂延迟让用户感知登录过程
    await new Promise(r => setTimeout(r, 300))
    const result = login(name.trim(), password.trim())
    if (result.success) {
      navigate("/")
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI磨课评课系统</h1>
          <p className="text-primary-200 mt-2">茂林教育 · 小学数学项目组</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">教师登录</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text">姓名</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                placeholder="请输入教师姓名"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label-text">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base"
            >
              {loading ? "登录中..." : "登 录"}
            </button>
          </form>
        </div>

        <p className="text-center text-primary-300 text-xs mt-6">
          茂林教育（湖南常德）教学中心
        </p>
      </div>
    </div>
  )
}