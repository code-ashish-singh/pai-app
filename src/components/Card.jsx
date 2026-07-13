export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-2xl p-4 ${onClick ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
