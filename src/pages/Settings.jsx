import { useApp } from '../context/AppContext'
import { clearData, exportAllData, importAllData } from '../utils/storage'
import Card from '../components/Card'
import { Moon, Sun, Download, Upload, Trash2, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'

export default function Settings() {
  const { theme, setTheme, logout, profile } = useApp()
  const navigate = useNavigate()
  const fileInput = useRef(null)

  function handleExport() {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pai-assistant-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importAllData(JSON.parse(reader.result))
        window.location.reload()
      } catch {
        alert('Invalid backup file')
      }
    }
    reader.readAsText(file)
  }

  function handleClear() {
    if (confirm('This will permanently delete all local data. Continue?')) {
      clearData()
      window.location.reload()
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-semibold text-white mb-4">Settings</h1>

      <Card className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-medium">{profile?.name}</p>
          <p className="text-white/40 text-xs">{profile?.email}</p>
        </div>
      </Card>

      <Card className="mb-3 flex items-center justify-between" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        <div className="flex items-center gap-2">
          {theme === 'dark' ? <Moon size={16} className="text-white/60" /> : <Sun size={16} className="text-white/60" />}
          <p className="text-white text-sm">Dark mode</p>
        </div>
        <div className={`w-10 h-6 rounded-full flex items-center px-0.5 ${theme === 'dark' ? 'bg-accent-purple justify-end' : 'bg-white/10 justify-start'}`}>
          <div className="w-5 h-5 bg-white rounded-full" />
        </div>
      </Card>

      <Card className="mb-3" onClick={handleExport}>
        <div className="flex items-center gap-2">
          <Download size={16} className="text-white/60" />
          <p className="text-white text-sm">Export data as JSON</p>
        </div>
      </Card>

      <Card className="mb-3" onClick={() => fileInput.current?.click()}>
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-white/60" />
          <p className="text-white text-sm">Import data</p>
        </div>
        <input type="file" accept="application/json" ref={fileInput} onChange={handleImportFile} className="hidden" />
      </Card>

      <Card className="mb-3" onClick={handleClear}>
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-rose-400" />
          <p className="text-rose-400 text-sm">Clear all data</p>
        </div>
      </Card>

      <Card onClick={handleLogout}>
        <div className="flex items-center gap-2">
          <LogOut size={16} className="text-white/60" />
          <p className="text-white text-sm">Log out</p>
        </div>
      </Card>
    </div>
  )
}
