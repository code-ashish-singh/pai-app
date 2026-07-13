import { useState } from 'react'
import { getData, addItem, updateItem, deleteItem } from '../utils/storage'
import { askAI } from '../services/aiService'
import Card from '../components/Card'
import { Pin, Trash2, Search, Link as LinkIcon, Image as ImageIcon, Loader2, Sparkles, BookOpen, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react'

export default function Notes() {
  const [activeTab, setActiveTab] = useState('smart') // 'quick' | 'smart'
  const [notes, setNotes] = useState(() => getData('notes', []))
  const [smartNotes, setSmartNotes] = useState(() => getData('smart_notes', []))
  
  // Quick Notes State
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')

  // Smart Notes State
  const [inputType, setInputType] = useState('url') // 'url' | 'image'
  const [url, setUrl] = useState('')
  const [images, setImages] = useState([]) // base64 strings
  const [quizCount, setQuizCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Smart Notes View State
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [lang, setLang] = useState('en') // 'en' | 'hi'
  const [userAnswers, setUserAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // --- QUICK NOTES LOGIC ---
  function refreshQuick() { setNotes(getData('notes', [])) }
  function handleAddQuick(e) {
    if (e) e.preventDefault()
    if (!text.trim()) return
    addItem('notes', { text, pinned: false })
    setText('')
    refreshQuick()
  }
  function togglePin(id, pinned) { updateItem('notes', id, { pinned: !pinned }); refreshQuick() }
  function handleDeleteQuick(id) { deleteItem('notes', id); refreshQuick() }
  
  const filteredNotes = notes
    .filter((n) => n.text.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1))

  // --- SMART NOTES LOGIC ---
  function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length > 5) return alert('Max 5 images allowed')
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => setImages(prev => [...prev, event.target.result])
      reader.readAsDataURL(file)
    })
  }

  async function handleGenerateSmartNote(e) {
    e.preventDefault()
    if (inputType === 'url' && !url) return setError("URL is required")
    if (inputType === 'image' && images.length === 0) return setError("Please upload at least one image")

    setLoading(true)
    setError('')

    try {
      let extractedText = ""
      if (inputType === 'url') {
        // Fallback proxy if one fails
        const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`)
        if (!res.ok) throw new Error("Could not fetch the URL. The website might be blocking access.")
        const html = await res.text()
        const doc = new DOMParser().parseFromString(html, "text/html")
        // Clean up DOM and extract text
        doc.querySelectorAll('script, style, nav, footer, iframe').forEach(el => el.remove())
        extractedText = doc.body.innerText.replace(/\s+/g, ' ').slice(0, 15000)
      }

      const prompt = `
        You are a smart learning assistant. Analyze the following content/images.
        1. Write a 2-3 paragraph summary in English.
        2. Write a 2-3 paragraph summary in Hindi.
        3. Generate exactly ${quizCount} multiple choice questions based on the content.
        
        Respond STRICTLY in the following JSON format without any markdown formatting wrappers like \`\`\`json:
        {
          "summaryEn": "English summary text...",
          "summaryHi": "Hindi summary text...",
          "quiz": [
            {
              "question": "Question text?",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "correctAnswerIndex": 0,
              "explanation": "Explanation for why this is the correct answer."
            }
          ]
        }
        
        Content to analyze: ${inputType === 'url' ? extractedText : 'See attached images.'}
      `

      const responseJSON = await askAI(prompt, { 
        images: inputType === 'image' ? images : [], 
        jsonMode: true 
      })

      const cleanJSON = responseJSON.replace(/```json/gi, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(cleanJSON)
      
      const newNote = {
        type: inputType,
        source: inputType === 'url' ? url : `${images.length} Images`,
        date: new Date().toISOString(),
        ...parsed
      }

      addItem('smart_notes', newNote)
      setSmartNotes(getData('smart_notes', []))
      setUrl('')
      setImages([])
      
    } catch(e) {
      setError(e.message || 'Failed to parse AI response. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDeleteSmartNote(id) {
    deleteItem('smart_notes', id)
    setSmartNotes(getData('smart_notes', []))
    if (activeNoteId === id) setActiveNoteId(null)
  }

  function handleSelectAnswer(qIndex, optIndex) {
    if (quizSubmitted) return
    setUserAnswers(prev => ({ ...prev, [qIndex]: optIndex }))
  }

  function calculateScore(quiz) {
    return quiz.reduce((score, q, i) => score + (userAnswers[i] === q.correctAnswerIndex ? 1 : 0), 0)
  }

  const activeNote = activeNoteId ? smartNotes.find(n => n.id === activeNoteId) : null

  return (
    <div className="px-5 pt-6 pb-20">
      <h1 className="text-xl font-semibold text-white mb-5">Notes & Learning</h1>

      {/* TABS */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
        <button
          onClick={() => setActiveTab('quick')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'quick' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'
          }`}
        >
          Quick Notes
        </button>
        <button
          onClick={() => setActiveTab('smart')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'smart' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'
          }`}
        >
          <Sparkles size={14} className={activeTab === 'smart' ? 'text-accent-purple' : ''} />
          Smart Notes
        </button>
      </div>

      {/* QUICK NOTES VIEW */}
      {activeTab === 'quick' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-3 shadow-inner">
            <Search size={16} className="text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quick notes..."
              className="bg-transparent outline-none text-sm text-white placeholder-white/30 flex-1"
            />
          </div>

          <form onSubmit={handleAddQuick} className="flex gap-2 mb-6">
            <input
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a note..."
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple transition-colors shadow-inner"
            />
            <button type="submit" className="bg-accent-purple text-white text-sm px-5 rounded-xl font-medium shadow-lg shadow-accent-purple/20 active:scale-95">
              Add
            </button>
          </form>

          <div className="space-y-2.5">
            {filteredNotes.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6 border border-dashed border-white/10 rounded-2xl">No quick notes yet.</p>
            ) : filteredNotes.map((n) => (
              <Card key={n.id} className="flex justify-between items-start py-3">
                <p className="text-white/80 text-sm flex-1 pr-3 leading-relaxed">{n.text}</p>
                <div className="flex items-center gap-1 pt-0.5">
                  <button onClick={() => togglePin(n.id, n.pinned)} className="p-1.5 rounded-md hover:bg-white/5">
                    <Pin size={15} className={n.pinned ? 'text-accent-purple fill-accent-purple' : 'text-white/30'} />
                  </button>
                  <button onClick={() => handleDeleteQuick(n.id)} className="p-1.5 rounded-md hover:bg-white/5">
                    <Trash2 size={15} className="text-white/30 hover:text-rose-400" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SMART NOTES VIEW */}
      {activeTab === 'smart' && !activeNoteId && (
        <div className="animate-in fade-in duration-300">
          <Card className="mb-8 border-white/10 shadow-lg relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 blur-3xl rounded-full pointer-events-none" />
            
            <p className="text-white font-medium text-sm mb-4 relative z-10 flex items-center gap-2">
              <Sparkles size={16} className="text-accent-purple" /> Generate Smart Note
            </p>
            
            <form onSubmit={handleGenerateSmartNote} className="relative z-10 space-y-4">
              <div className="flex bg-black/40 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 ${inputType === 'url' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                >
                  <LinkIcon size={14} /> Website URL
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('image')}
                  className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 ${inputType === 'image' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                >
                  <ImageIcon size={14} /> Images (OCR)
                </button>
              </div>

              {inputType === 'url' ? (
                <input 
                  required
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple transition-colors"
                />
              ) : (
                <div className="border border-dashed border-white/20 rounded-xl p-4 text-center">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer text-accent-purple text-sm font-medium hover:underline">
                    Select Images
                  </label>
                  {images.length > 0 && <p className="text-xs text-white/50 mt-2">{images.length} image(s) selected</p>}
                </div>
              )}

              <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                <span className="text-xs text-white/60">Number of Quiz Questions:</span>
                <select 
                  value={quizCount} 
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="bg-transparent text-white text-sm font-medium outline-none"
                >
                  <option className="bg-base-800 text-white" value={5}>5 Questions</option>
                  <option className="bg-base-800 text-white" value={10}>10 Questions</option>
                  <option className="bg-base-800 text-white" value={15}>15 Questions</option>
                </select>
              </div>

              {error && <p className="text-xs text-rose-400 bg-rose-400/10 p-2 rounded-lg">{error}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent-purple text-white rounded-xl py-3.5 text-sm font-medium active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                {loading ? 'Processing with AI...' : 'Analyze & Generate'}
              </button>
            </form>
          </Card>

          <h2 className="text-white/80 font-medium text-sm mb-3">Your Smart Notes History</h2>
          
          <div className="space-y-3">
            {smartNotes.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6 border border-dashed border-white/10 rounded-2xl">No smart notes generated yet.</p>
            ) : (
              [...smartNotes].reverse().map(note => (
                <Card key={note.id} className="cursor-pointer hover:bg-white/[0.07] transition-colors border-white/5" onClick={() => {
                  setActiveNoteId(note.id)
                  setUserAnswers({})
                  setQuizSubmitted(false)
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                      {note.type === 'url' ? <LinkIcon size={12} /> : <ImageIcon size={12} />}
                      <span>{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSmartNote(note.id) }}
                      className="p-1 hover:bg-white/10 rounded-md"
                    >
                      <Trash2 size={14} className="text-white/30 hover:text-rose-400 transition-colors" />
                    </button>
                  </div>
                  <p className="text-white text-sm font-medium truncate">{note.source}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-[10px] bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full font-medium">Summary</span>
                    <span className="text-[10px] bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-full font-medium">{note.quiz.length} Qs Quiz</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* SMART NOTE DETAIL (Summary & Quiz) */}
      {activeTab === 'smart' && activeNote && (
        <div className="animate-in slide-in-from-right-4 duration-300 pb-10">
          <button 
            onClick={() => setActiveNoteId(null)}
            className="text-xs text-accent-purple mb-4 font-medium flex items-center gap-1 bg-accent-purple/10 px-3 py-1.5 rounded-full hover:bg-accent-purple/20 transition-colors"
          >
            ← Back to Smart Notes
          </button>

          <Card className="mb-6 border-white/10 bg-gradient-to-br from-white/5 to-transparent">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h2 className="text-white font-medium flex items-center gap-2"><BookOpen size={16} className="text-accent-purple"/> AI Summary</h2>
              <div className="flex bg-black/40 p-1 rounded-lg">
                <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${lang === 'en' ? 'bg-white/10 text-white' : 'text-white/40'}`}>EN</button>
                <button onClick={() => setLang('hi')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${lang === 'hi' ? 'bg-white/10 text-white' : 'text-white/40'}`}>HI</button>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
              {lang === 'en' ? activeNote.summaryEn : activeNote.summaryHi}
            </p>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-medium flex items-center gap-2"><BrainCircuit size={16} className="text-accent-green"/> Knowledge Quiz</h2>
            {quizSubmitted && (
              <span className="text-xs font-semibold bg-accent-green/20 text-accent-green px-3 py-1 rounded-full">
                Score: {calculateScore(activeNote.quiz)} / {activeNote.quiz.length}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {activeNote.quiz.map((q, qIndex) => {
              const isCorrect = userAnswers[qIndex] === q.correctAnswerIndex;
              const isWrong = quizSubmitted && userAnswers[qIndex] !== undefined && !isCorrect;
              const unAnswered = quizSubmitted && userAnswers[qIndex] === undefined;

              return (
                <Card key={qIndex} className={`border ${quizSubmitted ? (isCorrect ? 'border-accent-green/30' : (isWrong || unAnswered) ? 'border-rose-400/30' : 'border-white/5') : 'border-white/5'}`}>
                  <p className="text-white text-sm font-medium mb-3">Q{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => {
                      const isSelected = userAnswers[qIndex] === oIndex;
                      const isActualCorrect = quizSubmitted && oIndex === q.correctAnswerIndex;
                      
                      let btnStyle = "bg-black/20 border-white/5 text-white/60 hover:bg-white/5";
                      if (!quizSubmitted && isSelected) btnStyle = "bg-accent-purple/20 border-accent-purple text-white";
                      if (quizSubmitted) {
                        if (isActualCorrect) btnStyle = "bg-accent-green/20 border-accent-green text-white font-medium";
                        else if (isSelected && !isCorrect) btnStyle = "bg-rose-400/20 border-rose-400 text-rose-300";
                        else btnStyle = "bg-black/20 border-transparent text-white/20 opacity-50";
                      }

                      return (
                        <button
                          key={oIndex}
                          onClick={() => handleSelectAnswer(qIndex, oIndex)}
                          disabled={quizSubmitted}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${btnStyle} ${!quizSubmitted && 'active:scale-[0.99]'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{opt}</span>
                            {quizSubmitted && isActualCorrect && <CheckCircle2 size={16} className="text-accent-green" />}
                            {quizSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-400" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className={`mt-4 p-3 rounded-lg text-xs leading-relaxed border ${isCorrect ? 'bg-accent-green/10 border-accent-green/20 text-accent-green/90' : 'bg-rose-400/10 border-rose-400/20 text-rose-300/90'}`}>
                      <span className="font-semibold">{isCorrect ? 'Correct! ' : 'Incorrect! '}</span> 
                      {q.explanation}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {!quizSubmitted && (
            <button 
              onClick={() => setQuizSubmitted(true)}
              disabled={Object.keys(userAnswers).length === 0}
              className="w-full mt-6 bg-accent-green text-black rounded-xl py-4 font-semibold shadow-lg shadow-accent-green/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
            >
              Submit Quiz
            </button>
          )}
        </div>
      )}
    </div>
  )
}
