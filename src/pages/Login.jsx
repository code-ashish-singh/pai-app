import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { User } from 'lucide-react'

export default function Login() {
  const { setProfile } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photo, setPhoto] = useState(null)

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setProfile({ name: name.trim(), email: email.trim(), photo })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-base-900">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-semibold text-white mb-1">Welcome</h1>
        <p className="text-white/50 text-sm mb-8">
          Set up your local profile. Nothing leaves this device.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col items-center gap-2 mb-2 cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
              {photo ? (
                <img src={photo} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-white/30" size={28} />
              )}
            </div>
            <span className="text-xs text-accent-purple">Add photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>

          <div>
            <label className="text-xs text-white/50 mb-1 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-accent-purple"
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-accent-purple"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent-purple text-white font-medium rounded-xl py-3 mt-4 active:scale-[0.98] transition-transform"
          >
            Get started
          </button>
        </form>
      </div>
    </div>
  )
}
