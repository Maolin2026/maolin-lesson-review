import { useState } from "react"
import useSettingsStore, { DEFAULT_SETTINGS } from "../stores/settingsStore"
import { testZhipuApiKey } from "../api/zhipu"
import { Settings, Key, Save, RotateCcw, CheckCircle2, XCircle, Loader2, Info, Database } from "lucide-react"

export default function SettingsPage() {
  const settings = useSettingsStore(s => s.settings)
  const updateSettings = useSettingsStore(s => s.updateSettings)
  const resetToDefault = useSettingsStore(s => s.resetToDefault)

  const [localSettings, setLocalSettings] = useState({ ...settings })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleTest = async () => {
    if (!localSettings.zhipuApiKey) {
      setTestResult({ success: false, message: "请先输入API Key" })
      return
    }
    setTesting(true)
    setTestResult(null)
    const ok = await testZhipuApiKey(localSettings.zhipuApiKey)
    setTestResult({
      success: ok,
      message: ok ? "连接成功，API Key有效" : "连接失败，请检查API Key是否正确"
    })
    setTesting(false)
  }

  const handleSave = () => {
    updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm("确定要恢复默认设置吗？")) {
      resetToDefault()
      setLocalSettings({ ...DEFAULT_SETTINGS })
      setTestResult(null)
    }
  }

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Settings className="w-7 h-7" /> 系统设置
        </h1>
        <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-1">
          <RotateCcw className="w-4 h-4" /> 恢复默认
        </button>
      </div>

      {/* 智谱AI配置 */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary-600" />
          <h3 className="section-title">智谱AI配置</h3>
        </div>
        <p className="text-sm text-gray-500">
          配置智谱AI的API Key用于AI评课功能。系统已内置默认Key，通常无需修改。
        </p>

        <div>
          <label className="label-text">API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={localSettings.zhipuApiKey}
              onChange={e => setLocalSettings(s => ({ ...s, zhipuApiKey: e.target.value }))}
              className="input-field flex-1 font-mono text-sm"
              placeholder="请输入智谱AI API Key"
            />
            <button
              onClick={handleTest}
              disabled={testing}
              className="btn-secondary flex items-center gap-1"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {testing ? "测试中" : "测试连接"}
            </button>
          </div>
          {testResult && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              testResult.success ? "text-green-600" : "text-red-600"
            }`}>
              {testResult.success
                ? <CheckCircle2 className="w-4 h-4" />
                : <XCircle className="w-4 h-4" />
              }
              {testResult.message}
            </div>
          )}
        </div>

        <div>
          <label className="label-text">API地址</label>
          <input
            type="text"
            value={localSettings.zhipuApiUrl}
            onChange={e => setLocalSettings(s => ({ ...s, zhipuApiUrl: e.target.value }))}
            className="input-field font-mono text-sm"
          />
        </div>

        <div>
          <label className="label-text">模型</label>
          <input
            type="text"
            value={localSettings.zhipuModel}
            onChange={e => setLocalSettings(s => ({ ...s, zhipuModel: e.target.value }))}
            className="input-field font-mono text-sm"
          />
        </div>
      </div>

      {/* 评课设置 */}
      <div className="card space-y-4">
        <h3 className="section-title">评课设置</h3>
        <div>
          <label className="label-text">达标分数线</label>
          <input
            type="number"
            min="0"
            max="100"
            value={localSettings.passScore}
            onChange={e => setLocalSettings(s => ({ ...s, passScore: parseInt(e.target.value) || 80 }))}
            className="input-field w-32"
          />
          <p className="text-xs text-gray-400 mt-1">评课总分达到此分数即为达标</p>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="card space-y-4">
        <h3 className="section-title">数据管理</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">评课数据已启用云端存储</p>
            <p className="mt-1">所有评课记录统一存储在云端数据库，支持多人同时使用。数据将自动同步至 WPS 多维表。</p>
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="btn-primary flex items-center gap-2"
        >
          {saved ? (
            <><CheckCircle2 className="w-4 h-4" /> 已保存</>
          ) : (
            <><Save className="w-4 h-4" /> 保存设置</>
          )}
        </button>
      </div>
    </div>
  )
}
