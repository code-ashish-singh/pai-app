import { useState } from 'react'
import { getData, addItem, updateItem, deleteItem } from '../utils/storage'
import Card from '../components/Card'
import { Trash2, Plus, Clock, IndianRupee, ArrowRight, X } from 'lucide-react'

// --- EXISTING COMPONENTS ---
function EMICalculator() {
  const [principal, setPrincipal] = useState('')
  const [rate, setRate] = useState('')
  const [tenure, setTenure] = useState('')

  const P = parseFloat(principal), R = parseFloat(rate) / 12 / 100, N = parseFloat(tenure)
  const emi = P && R && N ? (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1) : null

  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</span>
        <input placeholder="Principal Amount" value={principal} onChange={(e) => setPrincipal(e.target.value)} type="number"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none focus:border-accent-purple" />
      </div>
      <input placeholder="Annual interest rate (%)" value={rate} onChange={(e) => setRate(e.target.value)} type="number"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple" />
      <input placeholder="Tenure (months)" value={tenure} onChange={(e) => setTenure(e.target.value)} type="number"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple" />
      {emi && (
        <div className="mt-4 p-4 bg-accent-green/10 border border-accent-green/20 rounded-xl">
          <p className="text-accent-green text-sm font-medium">Monthly EMI</p>
          <p className="text-2xl font-bold text-accent-green">₹{emi.toFixed(2)}</p>
        </div>
      )}
    </div>
  )
}

function ROICalculator() {
  const [gain, setGain] = useState('')
  const [cost, setCost] = useState('')
  const roi = gain && cost ? (((gain - cost) / cost) * 100).toFixed(2) : null
  
  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</span>
        <input placeholder="Current Value / Gain" value={gain} onChange={(e) => setGain(e.target.value)} type="number"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none focus:border-accent-purple" />
      </div>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</span>
        <input placeholder="Original Cost of investment" value={cost} onChange={(e) => setCost(e.target.value)} type="number"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none focus:border-accent-purple" />
      </div>
      {roi && (
        <div className="mt-4 p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-xl">
          <p className="text-accent-purple text-sm font-medium">Return on Investment (ROI)</p>
          <p className="text-2xl font-bold text-accent-purple">{roi}%</p>
        </div>
      )}
    </div>
  )
}

// --- NEW PAYMENTS TRACKER COMPONENT ---
function PaymentsTracker() {
  const [payments, setPayments] = useState(() => getData('finance_payments', []))
  
  // Modals state
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [activePaymentId, setActivePaymentId] = useState(null) // For the "Pay Now" modal
  const [historyVisibleId, setHistoryVisibleId] = useState(null) // To toggle history view
  
  // New Goal Form State
  const [title, setTitle] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [totalMonths, setTotalMonths] = useState('')

  // Pay Now Form State
  const [payAmount, setPayAmount] = useState('')
  const [payNote, setPayNote] = useState('')

  function refresh() { setPayments(getData('finance_payments', [])) }

  function handleAddGoal(e) {
    e.preventDefault()
    if (!title || !totalAmount) return
    addItem('finance_payments', {
      title,
      totalAmount: parseFloat(totalAmount),
      totalMonths: totalMonths ? parseInt(totalMonths) : null,
      history: []
    })
    setTitle(''); setTotalAmount(''); setTotalMonths('')
    setShowGoalForm(false)
    refresh()
  }

  function handleMakePayment(e) {
    e.preventDefault()
    if (!payAmount) return
    const goal = payments.find(p => p.id === activePaymentId)
    if (!goal) return

    const newHistory = [...goal.history, {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: parseFloat(payAmount),
      note: payNote
    }]

    updateItem('finance_payments', activePaymentId, { history: newHistory })
    
    setPayAmount(''); setPayNote('')
    setActivePaymentId(null)
    refresh()
  }

  function handleDeleteGoal(id) {
    deleteItem('finance_payments', id)
    refresh()
  }

  function handleDeleteTransaction(goalId, txId) {
    const goal = payments.find(p => p.id === goalId)
    if (!goal) return
    const newHistory = goal.history.filter(tx => tx.id !== txId)
    updateItem('finance_payments', goalId, { history: newHistory })
    refresh()
  }

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
          <p className="text-white/30 text-sm mb-3">No payment goals tracked yet.</p>
          <button 
            onClick={() => setShowGoalForm(true)}
            className="text-accent-purple text-sm font-medium bg-accent-purple/10 px-5 py-2.5 rounded-full inline-flex items-center gap-2 hover:bg-accent-purple/20 transition-colors"
          >
            <Plus size={16} /> Track New Payment
          </button>
        </div>
      ) : (
        <>
          <button 
            onClick={() => setShowGoalForm(true)}
            className="w-full border border-dashed border-white/20 text-white/70 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Track Another Payment
          </button>
          
          <div className="space-y-4 mt-2">
            {payments.slice().reverse().map(goal => {
              const paidAmount = goal.history.reduce((sum, tx) => sum + tx.amount, 0)
              const remaining = goal.totalAmount - paidAmount
              const progress = Math.min((paidAmount / goal.totalAmount) * 100, 100)
              const isCompleted = remaining <= 0

              return (
                <Card key={goal.id} className="border-white/10 overflow-hidden relative">
                  {/* Goal Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{goal.title}</h3>
                      <p className="text-white/40 text-xs mt-0.5">Total: ₹{goal.totalAmount.toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 rounded-md hover:bg-white/5">
                      <Trash2 size={16} className="text-white/30 hover:text-rose-400 transition-colors" />
                    </button>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-5">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-white/60 text-sm font-medium">Paid: ₹{paidAmount.toLocaleString()}</p>
                      {isCompleted ? (
                        <span className="text-xs bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-md font-medium">Completed</span>
                      ) : (
                        <p className="text-rose-300 text-xs font-medium">Left: ₹{remaining.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-accent-green' : 'bg-gradient-to-r from-accent-purple to-accent-green'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isCompleted && (
                      <button 
                        onClick={() => setActivePaymentId(goal.id)}
                        className="flex-1 bg-accent-purple/10 text-accent-purple border border-accent-purple/20 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent-purple/20 transition-colors"
                      >
                        <IndianRupee size={14} /> Pay Now
                      </button>
                    )}
                    <button 
                      onClick={() => setHistoryVisibleId(historyVisibleId === goal.id ? null : goal.id)}
                      className="flex-1 bg-white/5 text-white/70 border border-white/5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      <Clock size={14} /> {historyVisibleId === goal.id ? 'Hide History' : 'History'}
                    </button>
                  </div>

                  {/* History View */}
                  {historyVisibleId === goal.id && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                      <h4 className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">Transaction History</h4>
                      {goal.history.length === 0 ? (
                        <p className="text-xs text-white/30 text-center italic py-2">No payments made yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {[...goal.history].reverse().map(tx => (
                            <div key={tx.id} className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                              <div>
                                <p className="text-white text-sm font-medium">₹{tx.amount.toLocaleString()}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-white/40">
                                  <span>{new Date(tx.date).toLocaleDateString()}</span>
                                  {tx.note && <><span>•</span><span className="truncate max-w-[100px]">{tx.note}</span></>}
                                </div>
                              </div>
                              <button onClick={() => handleDeleteTransaction(goal.id, tx.id)} className="p-1 hover:bg-white/5 rounded">
                                <Trash2 size={12} className="text-white/20 hover:text-rose-400 transition-colors" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* MODALS */}
      
      {/* 1. New Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end">
          <div className="bg-base-800 w-full rounded-t-3xl p-5 border-t border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-medium text-lg">Track New Payment</h2>
              <button onClick={() => setShowGoalForm(false)} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><X size={18} className="text-white/50" /></button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Title (e.g., College Fee, Car EMI) *</label>
                <input required autoFocus placeholder="Goal Name" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple shadow-inner" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Total Amount to Pay (₹) *</label>
                <input required type="number" min="1" step="0.01" placeholder="500000" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple shadow-inner" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Total Months (Optional)</label>
                <input type="number" min="1" step="1" placeholder="48" value={totalMonths} onChange={(e) => setTotalMonths(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple shadow-inner" />
              </div>
              <button type="submit" className="w-full bg-accent-purple text-white rounded-xl py-4 mt-2 font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/20">
                Create Tracker
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Make Payment Modal */}
      {activePaymentId && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-5">
          <div className="bg-base-800 w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-white font-medium text-lg">Make Payment</h2>
              <button onClick={() => setActivePaymentId(null)} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><X size={18} className="text-white/50" /></button>
            </div>
            <form onSubmit={handleMakePayment} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Amount Paid Today (₹) *</label>
                <input required autoFocus type="number" min="0.01" step="0.01" placeholder="10000" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-semibold text-white outline-none focus:border-accent-green shadow-inner" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5 pl-1">Note (Optional)</label>
                <input placeholder="e.g., 1st Semester Fee" value={payNote} onChange={(e) => setPayNote(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-green shadow-inner" />
              </div>
              <button type="submit" className="w-full bg-accent-green text-black rounded-xl py-4 font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-accent-green/20">
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// --- MAIN FINANCE COMPONENT ---
export default function Finance() {
  const [tab, setTab] = useState('Dues')
  const [notes, setNotes] = useState(() => getData('finance_notes', []))
  const [noteText, setNoteText] = useState('')

  function addNote(e) {
    if (e) e.preventDefault()
    if (!noteText.trim()) return
    addItem('finance_notes', { text: noteText })
    setNoteText('')
    setNotes(getData('finance_notes', []))
  }

  function removeNote(id) {
    deleteItem('finance_notes', id)
    setNotes(getData('finance_notes', []))
  }

  return (
    <div className="px-5 pt-6 pb-20">
      <h1 className="text-xl font-semibold text-white mb-5">Finance</h1>

      <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
        {['Dues', 'EMI', 'ROI', 'Notes'].map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {tab === 'Dues' && <PaymentsTracker />}
        {tab === 'EMI' && <Card className="border-white/10"><EMICalculator /></Card>}
        {tab === 'ROI' && <Card className="border-white/10"><ROICalculator /></Card>}
        {tab === 'Notes' && (
          <div>
            <form onSubmit={addNote} className="flex gap-2 mb-5">
              <input
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a finance note..."
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple shadow-inner"
              />
              <button type="submit" className="bg-accent-purple text-white text-sm px-5 rounded-xl font-medium shadow-lg shadow-accent-purple/20 active:scale-95">Add</button>
            </form>
            <div className="space-y-2.5">
              {notes.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-6 border border-dashed border-white/10 rounded-2xl">No finance notes yet.</p>
              ) : notes.slice().reverse().map((n) => (
                <Card key={n.id} className="flex justify-between items-start py-3 border-white/5">
                  <p className="text-white/80 text-sm leading-relaxed pr-3">{n.text}</p>
                  <button onClick={() => removeNote(n.id)} className="p-1.5 hover:bg-white/5 rounded-md mt-0.5">
                    <Trash2 size={15} className="text-white/30 hover:text-rose-400 transition-colors" />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
