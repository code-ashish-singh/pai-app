import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getData } from '../utils/storage'
import Card from '../components/Card'
import { Sparkles, Users, ListChecks, HeartPulse, GraduationCap, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useApp()
  const navigate = useNavigate()

  const tasks = getData('tasks', [])
  const leads = getData('leads', [])
  const health = getData('health_logs', [])

  const todayTasks = tasks.filter((t) => !t.completed)
  const upcomingFollowups = leads.filter((l) => l.followUpDate)
  const todayHealth = health[health.length - 1]

  const firstName = profile?.name?.split(' ')[0] || 'there'

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 text-sm">Welcome back</p>
          <h1 className="text-xl font-semibold text-white">{firstName} 👋</h1>
        </div>
        {profile?.photo ? (
          <img src={profile.photo} className="w-10 h-10 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10" />
        )}
      </div>

      {/* AI shortcut - hero card */}
      <Card
        onClick={() => navigate('/ai')}
        className="mb-4 bg-gradient-to-br from-accent-purple/20 to-transparent flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center">
            <Sparkles size={18} className="text-accent-purple" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Ask AI Assistant</p>
            <p className="text-white/40 text-xs">Draft, explain, plan</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-white/30" />
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card onClick={() => navigate('/tasks')}>
          <ListChecks size={18} className="text-accent-green mb-2" />
          <p className="text-2xl font-semibold text-white">{todayTasks.length}</p>
          <p className="text-white/40 text-xs">Tasks pending</p>
        </Card>
        <Card onClick={() => navigate('/leads')}>
          <Users size={18} className="text-accent-purple mb-2" />
          <p className="text-2xl font-semibold text-white">{leads.length}</p>
          <p className="text-white/40 text-xs">Total leads</p>
        </Card>
      </div>

      <Card onClick={() => navigate('/leads')} className="mb-4">
        <p className="text-white font-medium text-sm mb-2">Follow-up reminders</p>
        {upcomingFollowups.length === 0 ? (
          <p className="text-white/30 text-xs">No follow-ups scheduled</p>
        ) : (
          <div className="space-y-2">
            {upcomingFollowups.slice(0, 3).map((l) => (
              <div key={l.id} className="flex justify-between text-xs">
                <span className="text-white/70">{l.name}</span>
                <span className="text-white/40">{l.followUpDate}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card onClick={() => navigate('/health')}>
          <HeartPulse size={18} className="text-rose-400 mb-2" />
          <p className="text-white text-sm font-medium">Health</p>
          <p className="text-white/40 text-xs">
            {todayHealth ? `Last log: ${todayHealth.date}` : 'No logs yet'}
          </p>
        </Card>
        <Card onClick={() => navigate('/finance')}>
          <GraduationCap size={18} className="text-amber-400 mb-2" />
          <p className="text-white text-sm font-medium">Finance</p>
          <p className="text-white/40 text-xs">Continue learning</p>
        </Card>
      </div>
    </div>
  )
}
