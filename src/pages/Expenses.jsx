import { useState } from 'react'
import { getData, addItem, deleteItem } from '../utils/storage'
import Card from '../components/Card'
import { Trash2 } from 'lucide-react'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Education', 'Other']

export default function Expenses() {
  const [expenses, setExpenses] = useState(() => getData('expenses', []))
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')

  function refresh() { setExpenses(getData('expenses', [])) }

  function handleAdd(e) {
    e.preventDefault()
    if (!amount || !title.trim()) return
    addItem('expenses', { 
      title, 
      amount: parseFloat(amount), 
      category, 
      date: new Date().toLocaleDateString() 
    })
    setAmount('')
    setTitle('')
    refresh()
  }

  function handleDelete(id) {
    deleteItem('expenses', id)
    refresh()
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    total: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0)
  })).filter((c) => c.total > 0)

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-semibold text-white mb-5">Expense Tracker</h1>

      <Card className="mb-5 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-1">Total Spent</p>
          <p className="text-4xl font-semibold text-white flex items-baseline gap-1">
            <span className="text-2xl text-white/50 font-normal">₹</span>
            {total.toFixed(2)}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 blur-3xl rounded-full pointer-events-none" />
      </Card>

      <Card className="mb-6 border-white/10">
        <p className="text-white/80 font-medium text-sm mb-4">Add new expense</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-4">
          <input 
            required
            placeholder="Expense title (e.g., Dinner, Uber)" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent-purple transition-colors shadow-inner" 
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">₹</span>
              <input 
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none focus:border-accent-purple transition-colors shadow-inner" 
              />
            </div>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-accent-purple transition-colors min-w-[120px] shadow-inner"
            >
              {CATEGORIES.map((c) => <option key={c} value={c} className="bg-base-800 text-white">{c}</option>)}
            </select>
          </div>
          <button 
            type="submit"
            className="w-full bg-accent-purple text-white rounded-xl py-3.5 text-sm font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/20 mt-1"
          >
            Add Expense
          </button>
        </form>
      </Card>

      {byCategory.length > 0 && (
        <Card className="mb-6 border-white/5">
          <p className="text-white/80 font-medium text-sm mb-4">Spending by category</p>
          <div className="space-y-3.5">
            {byCategory.map((c) => (
              <div key={c.category} className="flex items-center gap-3 text-sm">
                <span className="text-white/60 w-20 font-medium">{c.category}</span>
                <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-accent-purple to-accent-green rounded-full" style={{ width: `${(c.total / total) * 100}%` }} />
                </div>
                <span className="text-white/80 font-medium w-16 text-right">₹{c.total.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-white/80 font-medium text-sm">Recent Expenses</h2>
      </div>

      {expenses.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-6 border border-dashed border-white/10 rounded-2xl">No expenses recorded yet.</p>
      ) : (
        <div className="space-y-2.5">
          {expenses.slice().reverse().map((e) => (
            <Card key={e.id} className="flex justify-between items-center py-3">
              <div>
                <p className="text-white font-medium text-sm mb-1">{e.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wide bg-white/10 px-2 py-0.5 rounded-md text-white/70">
                    {e.category}
                  </span>
                  <span className="text-white/30 text-[10px]">{e.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold text-sm">₹{e.amount.toFixed(2)}</span>
                <button 
                  onClick={() => handleDelete(e.id)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center active:scale-95 transition-transform hover:bg-rose-500/20 group"
                >
                  <Trash2 size={14} className="text-white/30 group-hover:text-rose-400 transition-colors" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
