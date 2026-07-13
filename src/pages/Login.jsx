import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { User, Mail, Camera, Check } from 'lucide-react'

export default function Login() {
  const { setProfile } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photo, setPhoto] = useState(null)
  const [remember, setRemember] = useState(false)

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
    <div className="min-h-screen flex flex-col justify-center px-8 bg-[#181824] font-sans">
      <div className="max-w-sm mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-bold text-white mb-2 tracking-tight">Welcome</h1>
          <p className="text-white/60 text-sm">
            Hi, it's time for you to sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Photo Upload (Optional but kept for local profile logic) */}
          <div className="flex justify-center mb-2">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-[#1f1f2e] flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[#5858d6] transition-colors shadow-lg">
                {photo ? (
                  <img src={photo} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-white/30" size={24} />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          {/* Name Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User size={18} className="text-white/40" />
            </div>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full bg-[#1f1f2e] text-white text-sm rounded-2xl pl-11 pr-4 py-4 outline-none focus:ring-1 focus:ring-[#5858d6] transition-shadow placeholder-white/40"
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-white/40" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-[#1f1f2e] text-white text-sm rounded-2xl pl-11 pr-4 py-4 outline-none focus:ring-1 focus:ring-[#5858d6] transition-shadow placeholder-white/40"
            />
          </div>

          {/* Options row */}
          <div className="flex items-center justify-between text-xs px-1 pt-2 pb-2">
            <label className="flex items-center gap-2 cursor-pointer" onClick={() => setRemember(!remember)}>
              <div className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors ${remember ? 'bg-[#5858d6] border-[#5858d6]' : 'border-white/20 bg-transparent'}`}>
                 {remember && <Check size={12} className="text-white" />}
              </div>
              <span className="text-white/50">Remember me</span>
            </label>
            <button type="button" className="text-white/80 font-medium hover:text-white transition-colors">
              Forgot Password
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#4a4ac2] hover:bg-[#5858d6] text-white font-semibold rounded-2xl py-4 mt-4 active:scale-[0.98] transition-all shadow-lg shadow-[#4a4ac2]/20"
          >
            Sign in
          </button>
          
          {/* Footer Link */}
          <p className="text-center text-xs text-white/50 mt-6">
            Don't have an account? <button type="button" className="text-[#6b6bff] font-medium hover:underline ml-1">Register</button>
          </p>
        </form>
      </div>
    </div>
  )
}
