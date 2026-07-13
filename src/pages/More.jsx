import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { HeartPulse, Receipt, Sparkles, StickyNote, Settings as SettingsIcon, ChevronRight } from 'lucide-react'

const links = [
  { to: '/health', icon: HeartPulse, label: 'Health Tracker', color: 'text-rose-400' },
  { to: '/expenses', icon: Receipt, label: 'Expense Tracker', color: 'text-amber-400' },
  { to: '/ai', icon: Sparkles, label: 'AI Assistant', color: 'text-accent-purple' },
  { to: '/notes', icon: StickyNote, label: 'Notes', color: 'text-sky-400' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings', color: 'text-white/60' }
]

export default function More() {
  const navigate = useNavigate()
  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-semibold text-white mb-4">More</h1>
      <div className="space-y-2">
        {links.map(({ to, icon: Icon, label, color }) => (
          <Card key={to} onClick={() => navigate(to)} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon size={18} className={color} />
              <p className="text-white text-sm">{label}</p>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </Card>
        ))}
      </div>
    </div>
  )
}
