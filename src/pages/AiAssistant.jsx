import { useState } from 'react'
import { askAI } from '../services/aiService'
import Card from '../components/Card'
import { Sparkles, Send } from 'lucide-react'

const QUICK_ACTIONS = [
  'Write a follow-up message for a lead who went quiet',
  'Draft a professional email introducing our product',
  'Explain the concept of compound interest simply',
  'Create a 1-week study plan for finance basics',
  'Give me 3 productivity tips for today'
]

export default function AiAssistant() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAsk(text) {
    const query = text ?? prompt
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResponse('')
    try {
      const result = await askAI(query)
      setResponse(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-accent-purple" />
        <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa}
            onClick={() => { setPrompt(qa); handleAsk(qa) }}
            className="text-xs bg-white/5 text-white/60 px-3 py-2 rounded-xl whitespace-nowrap"
          >
            {qa}
          </button>
        ))}
      </div>

      <Card className="mb-4 min-h-[120px]">
        {loading && <p className="text-white/40 text-sm">Thinking...</p>}
        {error && <p className="text-rose-400 text-sm">{error}</p>}
        {!loading && !error && response && (
          <p className="text-white/80 text-sm whitespace-pre-wrap">{response}</p>
        )}
        {!loading && !error && !response && (
          <p className="text-white/30 text-sm">Ask anything — sales messages, finance concepts, study plans, or productivity help.</p>
        )}
      </Card>

      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Type your question..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none text-sm"
        />
        <button
          onClick={() => handleAsk()}
          className="w-12 h-12 bg-accent-purple rounded-xl flex items-center justify-center active:scale-95"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  )
}
