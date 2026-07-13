import { useState } from 'react'
import { getData, addItem, updateItem, deleteItem } from '../utils/storage'
import Card from '../components/Card'
import { Plus, Check, Trash2, X } from 'lucide-react'

const PRIORITY_COLOR = {
  High: 'text-rose-300 bg-rose-400/20',
  Medium: 'text-amber-300 bg-amber-400/20',
  Low: 'text-sky-300 bg-sky-400/20'
}

export default function Tasks() {
  const [tasks, setTasks] = useState(() => getData('tasks', []))
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [deadline, setDeadline] = useState('')

  function refresh() {
    setTasks(getData('tasks', []))
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    addItem('tasks', { title, priority, deadline, completed: false })
    setTitle(''); setPriority('Medium'); setDeadline('')
    setShowForm(false)
    refresh()
  }

  function toggleComplete(id, completed) {
    updateItem('tasks', id, { completed: !completed })
    refresh()
  }

  function handleDelete(id) {
    deleteItem('tasks', id)
    refresh()
  }

  const pending = tasks.filter((t) => !t.completed)
  const done = tasks.filter((t) => t.completed)

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-white">Tasks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-full bg-accent-purple flex items-center justify-center active:scale-95"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>

      <p className="text-white/40 text-xs mb-2">Pending ({pending.length})</p>
      <div className="space-y-2 mb-6">
        {pending.length === 0 && <p className="text-white/30 text-sm">All caught up 🎉</p>}
        {pending.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleComplete(t.id, t.completed)}
                className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center"
              />
              <div>
                <p className="text-white text-sm">{t.title}</p>
                {t.deadline && <p className="text-white/30 text-xs">{t.deadline}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLOR[t.priority]}`}>
                {t.priority}
              </span>
              <button onClick={() => handleDelete(t.id)}>
                <Trash2 size={14} className="text-white/30" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {done.length > 0 && (
        <>
          <p className="text-white/40 text-xs mb-2">Completed ({done.length})</p>
          <div className="space-y-2">
            {done.map((t) => (
              <Card key={t.id} className="flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleComplete(t.id, t.completed)}
                    className="w-5 h-5 rounded-full bg-accent-green flex items-center justify-center"
                  >
                    <Check size={12} className="text-black" />
                  </button>
                  <p className="text-white text-sm line-through">{t.title}</p>
                </div>
                <button onClick={() => handleDelete(t.id)}>
                  <Trash2 size={14} className="text-white/30" />
                </button>
              </Card>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end">
          <div className="bg-base-800 w-full rounded-t-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-medium">New Task</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-white/50" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                required
                autoFocus
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none text-sm"
              />
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-xs ${
                      priority === p ? PRIORITY_COLOR[p] : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
              />
              <button type="submit" className="w-full bg-accent-purple text-white rounded-xl py-3 font-medium">
                Add task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
