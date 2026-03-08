'use client'

import { useEffect, useState } from 'react'
import type { AgentPixel } from '@/types/pixel'

interface Props {
  agent: AgentPixel
}

export function AgentSprite({ agent }: Props) {
  const [pos, setPos] = useState({ x: agent.x, y: agent.y })

  // Wander animation for working agents
  useEffect(() => {
    if (agent.status !== 'working') return
    const interval = setInterval(() => {
      setPos({
        x: Math.max(5, Math.min(85, pos.x + (Math.random() - 0.5) * 8)),
        y: Math.max(5, Math.min(85, pos.y + (Math.random() - 0.5) * 8)),
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [agent.status, pos.x, pos.y])

  const STATUS_RING = {
    idle: 'border-[#4b5563]',
    working: 'border-[#6366f1] animate-pulse',
    complete: 'border-[#10b981]',
  }

  return (
    <div
      className="absolute transition-all duration-[2000ms] ease-in-out flex flex-col items-center gap-1"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className={`w-12 h-12 rounded-xl border-2 ${STATUS_RING[agent.status]} bg-[#12121a] flex items-center justify-center text-2xl shadow-lg`}
        style={{ boxShadow: agent.status === 'working' ? `0 0 20px ${agent.color}40` : undefined }}
      >
        {agent.emoji}
      </div>
      <div className="bg-[#0a0a0f]/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white whitespace-nowrap max-w-28 truncate text-center">
        {agent.name}
      </div>
      {agent.currentTask && (
        <div className="bg-[#6366f1]/20 border border-[#6366f1]/30 px-2 py-0.5 rounded text-xs text-[#818cf8] whitespace-nowrap max-w-36 truncate text-center">
          {agent.currentTask}
        </div>
      )}
    </div>
  )
}
