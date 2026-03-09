export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#05080f' }}>
      {/* Ambient mesh */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 65%)',
      }} />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.3), transparent)' }} />
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  )
}
