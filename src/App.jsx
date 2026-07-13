import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Tasks from './pages/Tasks'
import Finance from './pages/Finance'
import Health from './pages/Health'
import Expenses from './pages/Expenses'
import AiAssistant from './pages/AiAssistant'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import More from './pages/More'

function PrivateLayout({ children }) {
  const { isLoggedIn } = useApp()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen bg-base-900 pb-20">
      {children}
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
      <Route path="/leads" element={<PrivateLayout><Leads /></PrivateLayout>} />
      <Route path="/tasks" element={<PrivateLayout><Tasks /></PrivateLayout>} />
      <Route path="/finance" element={<PrivateLayout><Finance /></PrivateLayout>} />
      <Route path="/health" element={<PrivateLayout><Health /></PrivateLayout>} />
      <Route path="/expenses" element={<PrivateLayout><Expenses /></PrivateLayout>} />
      <Route path="/ai" element={<PrivateLayout><AiAssistant /></PrivateLayout>} />
      <Route path="/notes" element={<PrivateLayout><Notes /></PrivateLayout>} />
      <Route path="/settings" element={<PrivateLayout><Settings /></PrivateLayout>} />
      <Route path="/more" element={<PrivateLayout><More /></PrivateLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
