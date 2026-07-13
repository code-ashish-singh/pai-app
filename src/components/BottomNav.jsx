import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, ListChecks, Wallet, MoreHorizontal } from 'lucide-react'

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/tasks', icon: ListChecks, label: 'Tasks' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '/more', icon: MoreHorizontal, label: 'More' }
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 h-full active:scale-95 transition-transform ${
                isActive ? 'text-accent-purple' : 'text-white/40'
              }`
            }
          >
            <Icon size={22} strokeWidth={2.2} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
