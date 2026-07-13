import { useState } from 'react'
import { getData, addItem, updateItem, deleteItem } from '../utils/storage'
import { askAI } from '../services/aiService'
import Card from '../components/Card'
import { Plus, Trash2, BrainCircuit, Activity, LineChart, ImageIcon, Loader2, Calendar } from 'lucide-react'

export default function Health() {
  const [logs, setLogs] = useState(() => getData('health_logs', []))
  const [tab, setTab] = useState('log') // 'log' | 'analytics' | 'vision'

  // --- TAB 1: DAILY LOG STATE ---
  const [metrics, setMetrics] = useState([
    { id: 'm1', key: 'Water', value: '' },
    { id: 'm2', key: 'Sleep', value: '' },
    { id: 'm3', key: 'Exercise', value: '' }
  ])
  const [customKey, setCustomKey] = useState('')
  const [logLoading, setLogLoading] = useState(false)
  const [logError, setLogError] = useState('')

  // --- TAB 2: ANALYTICS STATE ---
  const [analysisReport, setAnalysisReport] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  // --- TAB 3: VISION LOG STATE ---
  const [visionImage, setVisionImage] = useState(null)
  const [visionLoading, setVisionLoading] = useState(false)
  const [visionError, setVisionError] = useState('')
  const [visionSummary, setVisionSummary] = useState(null)

  function refreshLogs() { setLogs(getData('health_logs', [])) }

  // --- LOGIC: DAILY LOG ---
  function addCustomMetric() {
    if (!customKey.trim()) return
    setMetrics([...metrics, { id: Date.now().toString(), key: customKey, value: '' }])
    setCustomKey('')
  }

  function updateMetric(id, value) {
    setMetrics(metrics.map(m => m.id === id ? { ...m, value } : m))
  }

  function removeMetric(id) {
    setMetrics(metrics.filter(m => m.id !== id))
  }

  async function handleSaveLog() {
    const validMetrics = metrics.filter(m => m.value.trim() !== '')
    if (validMetrics.length === 0) return setLogError("Please enter at least one metric")
    
    setLogLoading(true)
    setLogError('')
    
    try {
      const metricsObj = validMetrics.reduce((acc, m) => { acc[m.key] = m.value; return acc }, {})
      const prompt = `
        Analyze the following health & lifestyle metrics for today:
        ${JSON.stringify(metricsObj)}
        
        Provide a health score out of 10 and brief, personalized feedback.
        Respond STRICTLY in JSON format without any markdown wrappers:
        {
          "score": 8.5,
          "feedback": "Great job on hydration, but try to get more sleep tonight."
        }
      `
      
      const res = await askAI(prompt, { jsonMode: true })
      const parsed = JSON.parse(res.replace(/```json/gi, '').replace(/```/g, '').trim())
      
      const newLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'manual',
        metrics: metricsObj,
        aiAnalysis: parsed
      }
      
      addItem('health_logs', newLog)
      refreshLogs()
      
      // Reset
      setMetrics([
        { id: 'm1', key: 'Water', value: '' },
        { id: 'm2', key: 'Sleep', value: '' },
        { id: 'm3', key: 'Exercise', value: '' }
      ])
    } catch (e) {
      setLogError(e.message || "Failed to analyze data")
    } finally {
      setLogLoading(false)
    }
  }

  function handleDeleteLog(id) {
    deleteItem('health_logs', id)
    refreshLogs()
  }

  // --- LOGIC: ANALYTICS ---
  async function generateAnalytics(days) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    
    const recentLogs = logs.filter(l => new Date(l.date) >= cutoff)
    if (recentLogs.length === 0) return setAnalysisError(`No logs found for the past ${days} days.`)

    setAnalysisLoading(true)
    setAnalysisError('')
    setAnalysisReport(null)

    try {
      const dataToAnalyze = recentLogs.map(l => ({
        date: new Date(l.date).toLocaleDateString(),
        type: l.type,
        data: l.type === 'manual' ? l.metrics : l.summary
      }))

      const prompt = `
        You are an expert health coach. Analyze the user's past ${days} days of lifestyle logs.
        Data: ${JSON.stringify(dataToAnalyze)}
        
        Provide a comprehensive analysis trend.
        Respond STRICTLY in JSON format without markdown wrappers:
        {
          "trendSummary": "A solid paragraph summarizing their overall trend.",
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Area for improvement 1", "Area for improvement 2"]
        }
      `
      const res = await askAI(prompt, { jsonMode: true })
      const parsed = JSON.parse(res.replace(/```json/gi, '').replace(/```/g, '').trim())
      setAnalysisReport(parsed)
    } catch (e) {
      setAnalysisError(e.message || "Failed to generate report")
    } finally {
      setAnalysisLoading(false)
    }
  }

  // --- LOGIC: VISION LOG ---
  function handleImageSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setVisionImage(event.target.result)
    reader.readAsDataURL(file)
  }

  async function handleAnalyzePhoto() {
    if (!visionImage) return
    setVisionLoading(true)
    setVisionError('')
    setVisionSummary(null)

    try {
      const prompt = `
        Analyze the attached image which is a lifestyle/health update from the user (e.g., a meal, workout, or task).
        What is happening in the photo? How does this impact their day or health?
        Respond STRICTLY in JSON format without markdown wrappers:
        {
          "summary": "Detailed summary of what you see and its context.",
          "estimatedImpact": "Positive/Neutral/Negative",
          "scoreOutOf10": 8
        }
      `
      const res = await askAI(prompt, { images: [visionImage], jsonMode: true })
      const parsed = JSON.parse(res.replace(/```json/gi, '').replace(/```/g, '').trim())
      
      setVisionSummary(parsed)

      // Save to logs automatically
      addItem('health_logs', {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'vision',
        summary: parsed.summary,
        impact: parsed.estimatedImpact,
        aiAnalysis: { score: parsed.scoreOutOf10, feedback: parsed.summary }
      })
      refreshLogs()
      
    } catch (e) {
      setVisionError(e.message || "Failed to analyze photo")
    } finally {
      setVisionLoading(false)
    }
  }

  return (
    <div className="px-5 pt-6 pb-20">
      <h1 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
        <Activity size={24} className="text-accent-purple" /> Lifestyle Tracker
      </h1>

      {/* TABS */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
        <button onClick={() => setTab('log')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex justify-center items-center gap-1.5 ${tab === 'log' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>
          <Plus size={14} /> Daily Log
        </button>
        <button onClick={() => setTab('analytics')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex justify-center items-center gap-1.5 ${tab === 'analytics' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>
          <LineChart size={14} /> Analytics
        </button>
        <button onClick={() => setTab('vision')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex justify-center items-center gap-1.5 ${tab === 'vision' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>
          <ImageIcon size={14} /> Photo Log
        </button>
      </div>

      {/* TAB 1: DAILY LOG */}
      {tab === 'log' && (
        <div className="animate-in fade-in duration-300 space-y-5">
          <Card className="border-white/10 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
            <h2 className="text-white font-medium text-sm mb-4">Log Today's Details</h2>
            
            <div className="space-y-3 mb-5">
              {metrics.map(m => (
                <div key={m.id} className="flex gap-2 items-center">
                  <div className="w-[85px] shrink-0 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white/80 text-xs font-medium text-center shadow-sm">
                    {m.key}
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      placeholder="e.g. 5L, Done" 
                      value={m.value}
                      onChange={(e) => updateMetric(m.id, e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white text-sm outline-none focus:border-accent-purple shadow-inner transition-colors"
                    />
                    <button 
                      onClick={() => removeMetric(m.id)} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addCustomMetric() }} className="flex gap-2 mb-6">
              <input 
                required
                placeholder="New field (e.g. Yoga)" 
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple transition-colors shadow-inner"
              />
              <button 
                type="submit" 
                className="shrink-0 bg-white/10 text-white text-sm px-5 rounded-xl font-medium border border-white/5 active:scale-95 transition-transform"
              >
                Add
              </button>
            </form>

            {logError && <p className="text-xs text-rose-400 bg-rose-400/10 p-2 rounded-lg mb-3">{logError}</p>}

            <button 
              onClick={handleSaveLog} 
              disabled={logLoading}
              className="w-full bg-accent-purple text-white rounded-xl py-3.5 text-sm font-medium active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/20 flex justify-center items-center gap-2"
            >
              {logLoading ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
              {logLoading ? 'Analyzing...' : 'Save & Analyze with AI'}
            </button>
          </Card>

          {/* History Preview */}
          <h2 className="text-white/80 font-medium text-sm mb-2">Recent Logs</h2>
          <div className="space-y-3">
            {logs.slice().reverse().map(l => (
              <Card key={l.id} className="border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-white/40" />
                    <span className="text-white/60 text-xs font-medium">{new Date(l.date).toLocaleDateString()}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">{(l.type || 'legacy').toUpperCase()}</span>
                  </div>
                  <button onClick={() => handleDeleteLog(l.id)}><Trash2 size={14} className="text-white/20 hover:text-rose-400" /></button>
                </div>

                {(!l.type || l.type === 'manual') && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {l.metrics && Object.entries(l.metrics).map(([k, v]) => (
                      <span key={k} className="text-xs bg-black/30 border border-white/5 px-2 py-1 rounded-md text-white/80">
                        <span className="text-white/40">{k}:</span> {v}
                      </span>
                    ))}
                    {!l.metrics && ['weight', 'water', 'exercise', 'sleep'].map(k => l[k] ? (
                      <span key={k} className="text-xs bg-black/30 border border-white/5 px-2 py-1 rounded-md text-white/80">
                        <span className="text-white/40">{k}:</span> {l[k]}
                      </span>
                    ) : null)}
                  </div>
                )}

                {l.type === 'vision' && l.summary && (
                  <p className="text-sm text-white/80 mb-3">{l.summary}</p>
                )}

                {l.aiAnalysis && (
                  <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BrainCircuit size={14} className="text-accent-purple" />
                      <span className="text-accent-purple font-semibold text-sm">AI Score: {l.aiAnalysis.score}/10</span>
                    </div>
                    <p className="text-xs text-accent-purple/80 leading-relaxed">{l.aiAnalysis.feedback}</p>
                  </div>
                )}
              </Card>
            ))}
            {logs.length === 0 && <p className="text-white/30 text-xs text-center py-4">No logs yet.</p>}
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {tab === 'analytics' && (
        <div className="animate-in fade-in duration-300">
          <Card className="mb-6 border-white/10">
            <h2 className="text-white font-medium text-sm mb-4">AI Trend Analysis</h2>
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => generateAnalytics(7)}
                disabled={analysisLoading}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Analyze Last 7 Days
              </button>
              <button 
                onClick={() => generateAnalytics(30)}
                disabled={analysisLoading}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Analyze Last 30 Days
              </button>
            </div>
            
            {analysisLoading && <p className="text-center text-white/50 text-sm py-4 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin"/> Reading past logs...</p>}
            {analysisError && <p className="text-center text-rose-400 text-sm py-2">{analysisError}</p>}

            {analysisReport && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-white/50 text-xs uppercase tracking-wider mb-2">Trend Summary</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{analysisReport.trendSummary}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-3">
                    <h3 className="text-accent-green text-xs font-semibold uppercase tracking-wider mb-2">Strengths</h3>
                    <ul className="space-y-1">
                      {analysisReport.strengths.map((s, i) => <li key={i} className="text-accent-green/90 text-xs flex items-start gap-1"><span className="opacity-50">•</span><span>{s}</span></li>)}
                    </ul>
                  </div>
                  <div className="bg-rose-400/10 border border-rose-400/20 rounded-xl p-3">
                    <h3 className="text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">Needs Focus</h3>
                    <ul className="space-y-1">
                      {analysisReport.weaknesses.map((w, i) => <li key={i} className="text-rose-300/90 text-xs flex items-start gap-1"><span className="opacity-50">•</span><span>{w}</span></li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: VISION LOG */}
      {tab === 'vision' && (
        <div className="animate-in fade-in duration-300">
          <Card className="border-white/10 text-center relative">
            <h2 className="text-white font-medium text-sm mb-2">Photo & Task Log</h2>
            <p className="text-white/50 text-xs mb-5">Upload a photo of your meal, workout, or a completed task, and AI will summarize your day.</p>

            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 mb-4 hover:bg-white/5 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {visionImage ? (
                <img src={visionImage} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover shadow-lg" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/40 py-4">
                  <ImageIcon size={32} />
                  <span className="text-sm font-medium text-accent-purple">Tap to select photo</span>
                </div>
              )}
            </div>

            {visionError && <p className="text-xs text-rose-400 mb-3">{visionError}</p>}

            <button 
              onClick={handleAnalyzePhoto}
              disabled={!visionImage || visionLoading}
              className="w-full bg-accent-purple text-white rounded-xl py-3.5 text-sm font-medium shadow-lg shadow-accent-purple/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              {visionLoading ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
              {visionLoading ? 'AI is looking...' : 'Analyze Photo'}
            </button>

            {visionSummary && (
              <div className="mt-5 p-4 bg-white/5 border border-white/10 rounded-xl text-left animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white text-sm font-medium">AI Summary</h3>
                  <span className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full text-[10px] font-bold">Score: {visionSummary.scoreOutOf10}/10</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{visionSummary.summary}</p>
                <p className="text-white/40 text-xs mt-3 uppercase tracking-wider font-semibold">
                  Impact: <span className={visionSummary.estimatedImpact === 'Positive' ? 'text-accent-green' : visionSummary.estimatedImpact === 'Negative' ? 'text-rose-400' : 'text-white'}>{visionSummary.estimatedImpact}</span>
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  )
}
