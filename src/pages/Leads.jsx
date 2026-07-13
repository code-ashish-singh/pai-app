import { useState, useMemo } from 'react'
import { getData, addItem, deleteItem } from '../utils/storage'
import Card from '../components/Card'
import { Plus, Trash2, X, Target, CalendarDays, BarChart2 } from 'lucide-react'

const RESPONSES = ['Interested', 'Not Interested', 'Call Back', 'Not Answered', 'Wrong Number']
const RESPONSE_COLORS = {
  'Interested': 'bg-accent-green/20 text-accent-green border-accent-green/30',
  'Not Interested': 'bg-rose-400/20 text-rose-300 border-rose-400/30',
  'Call Back': 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  'Not Answered': 'bg-sky-400/20 text-sky-300 border-sky-400/30',
  'Wrong Number': 'bg-white/10 text-white/50 border-white/20'
}

export default function Leads() {
  const [activeTab, setActiveTab] = useState('today') // 'today' | 'analytics'
  const [calls, setCalls] = useState(() => getData('daily_calls', []))
  
  const [dailyTarget, setDailyTarget] = useState(() => {
    const target = localStorage.getItem('dailyTarget')
    return target ? parseInt(target, 10) : 50
  })

  const [showForm, setShowForm] = useState(false)
  const [showTargetForm, setShowTargetForm] = useState(false)
  const [tempTarget, setTempTarget] = useState(dailyTarget)
  
  const [clientName, setClientName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [response, setResponse] = useState('Interested')
  const [description, setDescription] = useState('')

  // Date for analytics (default to today YYYY-MM-DD for input type="date")
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })

  function refresh() {
    setCalls(getData('daily_calls', []))
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!clientName.trim()) return
    addItem('daily_calls', { 
      clientName, 
      contactNumber,
      response, 
      description,
      date: new Date().toISOString() 
    })
    setClientName('')
    setContactNumber('')
    setResponse('Interested')
    setDescription('')
    setShowForm(false)
    refresh()
  }

  function handleDelete(id) {
    deleteItem('daily_calls', id)
    refresh()
  }

  function handleSaveTarget(e) {
    e.preventDefault()
    setDailyTarget(tempTarget)
    localStorage.setItem('dailyTarget', tempTarget)
    setShowTargetForm(false)
  }

  // Memoized filters
  const todayStr = new Date().toLocaleDateString()
  const todaysCalls = useMemo(() => {
    const list = calls.filter(c => new Date(c.date).toLocaleDateString() === todayStr)
    return list.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [calls, todayStr])

  const analyticsCalls = useMemo(() => {
    // selectedDate is YYYY-MM-DD
    const targetDateStr = new Date(selectedDate).toLocaleDateString()
    const list = calls.filter(c => new Date(c.date).toLocaleDateString() === targetDateStr)
    return list.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [calls, selectedDate])

  const progress = Math.min((todaysCalls.length / dailyTarget) * 100, 100) || 0

  // Stats calculation for analytics
  const analyticsStats = useMemo(() => {
    const stats = {}
    RESPONSES.forEach(r => stats[r] = 0)
    analyticsCalls.forEach(c => {
      if (stats[c.response] !== undefined) stats[c.response]++
    })
    return stats
  }, [analyticsCalls])

  const CallItem = ({ call }) => (
    <Card className="flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white font-medium text-sm mb-0.5">{call.clientName}</p>
          {call.contactNumber && (
            <p className="text-white/50 text-xs mb-1.5">{call.contactNumber}</p>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${RESPONSE_COLORS[call.response] || RESPONSE_COLORS['Interested']}`}>
            {call.response}
          </span>
        </div>
        <button 
          onClick={() => handleDelete(call.id)}
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center active:scale-95"
        >
          <Trash2 size={14} className="text-rose-400" />
        </button>
      </div>
      {call.description && (
        <div className="mt-1 bg-black/20 rounded-lg p-2.5 border border-white/5">
          <p className="text-white/60 text-xs leading-relaxed">{call.description}</p>
        </div>
      )}
    </Card>
  )

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-white">Call Tracker</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTargetForm(true)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-95"
          >
            <Target size={18} className="text-white" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="w-9 h-9 rounded-full bg-accent-purple flex items-center justify-center active:scale-95 shadow-[0_0_15px_rgba(139,124,246,0.3)]"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'today' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'
          }`}
        >
          <CalendarDays size={16} /> Today
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'analytics' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'
          }`}
        >
          <BarChart2 size={16} /> Analytics
        </button>
      </div>

      {/* TODAY TAB */}
      {activeTab === 'today' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="mb-6 border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
            <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                <p className="text-white/50 text-xs mb-1 uppercase tracking-wider font-medium">Calls Today</p>
                <p className="text-4xl font-semibold text-white flex items-baseline gap-1">
                  {todaysCalls.length} <span className="text-lg text-white/30 font-medium">/ {dailyTarget}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-accent-green text-sm font-medium bg-accent-green/10 px-2 py-1 rounded-md">
                  {Math.round(progress)}% Hit
                </p>
              </div>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden relative z-10 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-accent-purple to-accent-green rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 blur-3xl rounded-full pointer-events-none" />
          </Card>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white/80 font-medium text-sm">Today's Log</h2>
            <span className="text-xs text-white/30">{todayStr}</span>
          </div>

          {todaysCalls.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-white/30 text-sm">No calls logged today.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="mt-3 text-accent-purple text-xs font-medium bg-accent-purple/10 px-4 py-2 rounded-full"
              >
                Log first call
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysCalls.map((call) => <CallItem key={call.id} call={call} />)}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-6 flex flex-col gap-2">
            <label className="text-xs text-white/50 font-medium pl-1">Select Date to Analyze</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple transition-colors"
            />
          </div>

          <Card className="mb-6">
            <p className="text-center text-white/40 text-xs mb-4 uppercase tracking-wider font-medium">
              Performance Summary
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-3xl font-semibold text-white mb-1">{analyticsCalls.length}</p>
                <p className="text-xs text-white/50">Total Calls</p>
              </div>
              <div className="bg-accent-green/10 rounded-xl p-4 border border-accent-green/20">
                <p className="text-3xl font-semibold text-accent-green mb-1">{analyticsStats['Interested']}</p>
                <p className="text-xs text-accent-green/70">Interested</p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {Object.entries(analyticsStats).map(([resp, count]) => {
                if (resp === 'Interested') return null; // already shown above
                const percentage = analyticsCalls.length > 0 ? (count / analyticsCalls.length) * 100 : 0;
                return (
                  <div key={resp} className="flex items-center gap-3">
                    <span className="text-xs text-white/50 w-24 truncate">{resp}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          resp === 'Not Interested' ? 'bg-rose-400' :
                          resp === 'Call Back' ? 'bg-amber-400' :
                          resp === 'Not Answered' ? 'bg-sky-400' : 'bg-white/40'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/80 font-medium w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white/80 font-medium text-sm">Call Logs</h2>
            <span className="text-xs text-white/30">{new Date(selectedDate).toLocaleDateString()}</span>
          </div>

          {analyticsCalls.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">No records found for this date.</p>
          ) : (
            <div className="space-y-3">
              {analyticsCalls.map((call) => <CallItem key={call.id} call={call} />)}
            </div>
          )}
        </div>
      )}

      {/* Add Call Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end">
          <div className="bg-base-800 w-full rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-medium text-lg">Log a Call</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center active:scale-95"
              >
                <X size={18} className="text-white/50" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Client Name *</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. John Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 outline-none text-sm focus:border-accent-purple transition-colors shadow-inner"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Contact Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 outline-none text-sm focus:border-accent-purple transition-colors shadow-inner"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Response</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESPONSES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResponse(r)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all active:scale-[0.98] ${
                        response === r 
                          ? 'bg-accent-purple border-accent-purple text-white shadow-lg shadow-accent-purple/20' 
                          : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Description / Notes (Optional)</label>
                <textarea
                  placeholder="Write details about the call..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none text-sm focus:border-accent-purple transition-colors shadow-inner resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-accent-purple text-white rounded-xl py-4 mt-2 font-medium active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/20">
                Save Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Target Form Modal */}
      {showTargetForm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-5">
          <div className="bg-base-800 w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-medium text-lg">Set Daily Target</h2>
              <button 
                onClick={() => setShowTargetForm(false)}
                className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center active:scale-95"
              >
                <X size={18} className="text-white/50" />
              </button>
            </div>
            <form onSubmit={handleSaveTarget} className="space-y-5">
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Target Calls Per Day</label>
                <input
                  type="number"
                  autoFocus
                  min="1"
                  required
                  value={tempTarget}
                  onChange={(e) => setTempTarget(Number(e.target.value))}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-semibold text-white outline-none focus:border-accent-green transition-colors shadow-inner"
                />
              </div>
              <button type="submit" className="w-full bg-accent-green text-black rounded-xl py-4 font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-accent-green/20">
                Save Target
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
