'use client'

import React from 'react'
import type { AgentPixel } from '@/types/pixel'

interface Props {
  agent: AgentPixel
}

/* ─── Inline task icons ─── */
const IconCode  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
const IconWrite = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
const IconMeet  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconChart = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconPlan  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
const IconCheck = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconZap   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>

function getTaskMeta(eventType: string): { label: string; Icon: () => React.ReactElement } {
  const t = eventType.toLowerCase()
  if (t.includes('code') || t.includes('debug') || t.includes('pr') || t.includes('deploy') || t.includes('commit'))
    return { label: 'Coding', Icon: IconCode }
  if (t.includes('meet') || t.includes('discuss') || t.includes('sync') || t.includes('collab') || t.includes('standup'))
    return { label: 'Meeting', Icon: IconMeet }
  if (t.includes('write') || t.includes('content') || t.includes('prd') || t.includes('copy') || t.includes('seo') || t.includes('blog'))
    return { label: 'Writing', Icon: IconWrite }
  if (t.includes('budget') || t.includes('finance') || t.includes('p&l') || t.includes('forecast') || t.includes('invoice'))
    return { label: 'Analysis', Icon: IconChart }
  if (t.includes('plan') || t.includes('strategy') || t.includes('roadmap') || t.includes('vision') || t.includes('backlog'))
    return { label: 'Planning', Icon: IconPlan }
  if (t.includes('review') || t.includes('approv') || t.includes('check'))
    return { label: 'Reviewing', Icon: IconCheck }
  if (t.includes('outreach') || t.includes('crm') || t.includes('call') || t.includes('prospect'))
    return { label: 'Sales', Icon: IconZap }
  const label = eventType.split('_').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ').slice(0, 14)
  return { label, Icon: IconZap }
}

/* ─── Per-agent avatar configs ─── */
interface AvatarConfig {
  skinColor: string
  hairColor: string
  hair: React.ReactElement
  shirtColor: string
  pantsColor: string
  shoeColor: string
  eyeColor: string
  accentColor: string
  glasses?: boolean
  earpiece?: boolean
}

const AVATARS: Record<string, AvatarConfig> = {
  ceo: {
    skinColor: '#d4956a',
    hairColor: '#9ca3af',
    hair: (
      <path d="M12 14 Q12 2 22 2 Q32 2 32 13 Q29 4 22 4 Q15 4 12 14Z" fill="#9ca3af" />
    ),
    shirtColor: '#4c1d95',
    accentColor: '#a78bfa',
    pantsColor: '#312e81',
    shoeColor: '#1e1b4b',
    eyeColor: '#4b5563',
    earpiece: true,
  },
  product: {
    skinColor: '#f0c49e',
    hairColor: '#5c3d2e',
    hair: (
      <path d="M12 15 Q11 1 22 1 Q33 1 32 12 Q30 3 22 3 Q14 3 12 15Z" fill="#5c3d2e" />
    ),
    shirtColor: '#1e40af',
    accentColor: '#38bdf8',
    pantsColor: '#1e3a8a',
    shoeColor: '#1e293b',
    eyeColor: '#7c4c3d',
    glasses: false,
  },
  engineering: {
    skinColor: '#c8a87a',
    hairColor: '#1f2937',
    hair: (
      <>
        <path d="M12 18 Q12 1 22 1 Q32 1 32 16 Q30 4 22 4 Q14 4 12 18Z" fill="#1f2937" />
        {/* Sideburn detail */}
        <rect x="11" y="14" width="2.5" height="6" rx="1" fill="#1f2937" />
        <rect x="30.5" y="14" width="2.5" height="6" rx="1" fill="#1f2937" />
      </>
    ),
    shirtColor: '#14532d',
    accentColor: '#4ade80',
    pantsColor: '#1e3a2a',
    shoeColor: '#374151',
    eyeColor: '#374151',
    glasses: true,
  },
  marketing: {
    skinColor: '#e8b59a',
    hairColor: '#c8922a',
    hair: (
      <>
        <path d="M12 14 Q10 0 22 0 Q34 0 32 12 Q29 2 22 2 Q15 2 12 14Z" fill="#c8922a" />
        {/* Side volume */}
        <path d="M11 13 Q8 18 9 24" stroke="#c8922a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M33 13 Q36 18 35 24" stroke="#c8922a" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
    shirtColor: '#9a3412',
    accentColor: '#fb923c',
    pantsColor: '#44403c',
    shoeColor: '#292524',
    eyeColor: '#7c3d1e',
  },
  sales: {
    skinColor: '#a67c52',
    hairColor: '#1c1917',
    hair: (
      <path d="M13 16 Q14 1 22 1 Q30 1 31 14 Q27 4 22 4 Q17 4 13 16Z" fill="#1c1917" />
    ),
    shirtColor: '#831843',
    accentColor: '#f472b6',
    pantsColor: '#4a1942',
    shoeColor: '#1c1917',
    eyeColor: '#6b4c2a',
  },
  finance: {
    skinColor: '#d4956a',
    hairColor: '#6b3a1f',
    hair: (
      <path d="M13 14 Q13 3 22 3 Q31 3 31 14 Q28 5 22 5 Q16 5 13 14Z" fill="#6b3a1f" />
    ),
    shirtColor: '#134e4a',
    accentColor: '#14b8a6',
    pantsColor: '#164e63',
    shoeColor: '#0a1618',
    eyeColor: '#6b4a2a',
  },
}

// Generate a pseudo-unique avatar from agent ID
export function getAvatarConfig(agentId: string): AvatarConfig {
  if (AVATARS[agentId]) return AVATARS[agentId]

  // Deterministic skin tones
  const skins = ['#f5c6a0', '#d4956a', '#c8a87a', '#a67c52', '#8d5524', '#6b4226', '#e8b59a', '#f0c49e']
  const hairs = ['#1f2937', '#1c1917', '#5c3d2e', '#c8922a', '#0a0a0a', '#374151', '#6b3a1f', '#111827']
  const shirts = ['#1e40af', '#4c1d95', '#134e4a', '#14532d', '#9a3412', '#831843', '#1e3a5f', '#3b1f6e']
  const pants = ['#1e3a8a', '#312e81', '#164e63', '#1e3a2a', '#44403c', '#4a1942', '#1e3a5f', '#1a2236']
  const eyeColors = ['#4b5563', '#374151', '#7c4c3d', '#6b4c2a', '#6b4226', '#4a3728']

  // hash the agent id to pick consistent values
  let hash = 0
  for (let i = 0; i < agentId.length; i++) hash = (hash * 31 + agentId.charCodeAt(i)) >>> 0

  const skinColor = skins[hash % skins.length]
  const hairColor = hairs[(hash >> 3) % hairs.length]
  const shirtColor = shirts[(hash >> 6) % shirts.length]
  const pantsColor = pants[(hash >> 9) % pants.length]
  const eyeColor = eyeColors[(hash >> 12) % eyeColors.length]
  const hasGlasses = (hash >> 15) % 5 === 0

  // Pick a hair style based on hash
  const hairStyle = (hash >> 18) % 3
  let hair: React.ReactElement
  if (hairStyle === 0) {
    hair = <path d="M12 14 Q12 2 22 2 Q32 2 32 13 Q29 4 22 4 Q15 4 12 14Z" fill={hairColor} />
  } else if (hairStyle === 1) {
    hair = <path d="M13 16 Q14 1 22 1 Q30 1 31 14 Q27 4 22 4 Q17 4 13 16Z" fill={hairColor} />
  } else {
    hair = (
      <>
        <path d="M12 14 Q10 0 22 0 Q34 0 32 12 Q29 2 22 2 Q15 2 12 14Z" fill={hairColor} />
        <path d="M11 13 Q8 18 9 24" stroke={hairColor} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M33 13 Q36 18 35 24" stroke={hairColor} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    )
  }

  return { skinColor, hairColor, hair, shirtColor, pantsColor, shoeColor: '#1a2236', eyeColor, accentColor: '#a78bfa', glasses: hasGlasses }
}

/* ─── Human SVG avatar ─── */
export function HumanAvatar({ agentId, color, status }: { agentId: string; color: string; status: string }) {
  const c = getAvatarConfig(agentId)
  const isWorking = status === 'working'

  return (
    <svg width="44" height="62" viewBox="0 0 44 62" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 6px ${color}bb) drop-shadow(0 0 14px ${color}44)` }}>
      {/* Ground shadow */}
      <ellipse cx="22" cy="60" rx="11" ry="3.5" fill="rgba(0,0,0,0.35)" />

      {/* Work glow ring */}
      {isWorking && (
        <ellipse cx="22" cy="60" rx="14" ry="4.5" fill={color} opacity="0.2" />
      )}

      {/* Shoes */}
      <rect x="11" y="51" width="9" height="7" rx="3.5" fill={c.shoeColor} />
      <rect x="24" y="51" width="9" height="7" rx="3.5" fill={c.shoeColor} />

      {/* Pants/legs */}
      <rect x="12" y="38" width="7.5" height="15" rx="2" fill={c.pantsColor} />
      <rect x="24.5" y="38" width="7.5" height="15" rx="2" fill={c.pantsColor} />

      {/* Shirt body */}
      <rect x="9" y="24" width="26" height="16" rx="4" fill={c.shirtColor} />

      {/* Shirt crease accent */}
      <path d="M19.5 24 L22 30.5 L24.5 24" fill={c.accentColor} opacity="0.45" />

      {/* Left arm */}
      <rect x="2" y="25" width="8" height="13" rx="4" fill={c.shirtColor} />
      {/* Right arm — waves when idle */}
      <g style={!isWorking ? {
        transformOrigin: '38px 28px',
        transformBox: 'fill-box',
        animationName: 'agent-wave',
        animationDuration: '2s',
        animationIterationCount: 'infinite',
        animationDelay: '0s',
      } : {}}>
        <rect x="34" y="25" width="8" height="13" rx="4" fill={c.shirtColor} />
        <circle cx="38" cy="39" r="4" fill={c.skinColor} />
      </g>
      {/* Left hand */}
      <circle cx="6" cy="39" r="4" fill={c.skinColor} />

      {/* Neck */}
      <rect x="18" y="19" width="8" height="7" rx="2" fill={c.skinColor} />

      {/* Head */}
      <circle cx="22" cy="13" r="11" fill={c.skinColor} />

      {/* Head shadow underside */}
      <path d="M11 16 Q22 26 33 16" fill={c.skinColor} style={{ filter: 'brightness(0.9)' }} opacity="0.5" />

      {/* Hair */}
      {c.hair}

      {/* Eyebrows */}
      <path d="M15.5 9.5 Q17.5 8.2 19.5 9.5" stroke={c.hairColor} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M24.5 9.5 Q26.5 8.2 28.5 9.5" stroke={c.hairColor} strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* Eyes — with blink animation */}
      <g style={{ transformOrigin: '17.5px 13.5px', animationName: 'eye-blink', animationDuration: `${3.5 + (agentId.charCodeAt(0) % 3)}s`, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}>
        <ellipse cx="17.5" cy="13.5" rx="2.8" ry="2.5" fill="white" />
        <circle cx="18" cy="13.8" r="1.7" fill={c.eyeColor} />
        <circle cx="18.4" cy="14.1" r="0.85" fill="#0a0a0f" />
        <circle cx="17.7" cy="13.0" r="0.45" fill="white" opacity="0.9" />
      </g>
      <g style={{ transformOrigin: '26.5px 13.5px', animationName: 'eye-blink', animationDuration: `${3.5 + (agentId.charCodeAt(0) % 3)}s`, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}>
        <ellipse cx="26.5" cy="13.5" rx="2.8" ry="2.5" fill="white" />
        <circle cx="27" cy="13.8" r="1.7" fill={c.eyeColor} />
        <circle cx="27.4" cy="14.1" r="0.85" fill="#0a0a0f" />
        <circle cx="26.7" cy="13.0" r="0.45" fill="white" opacity="0.9" />
      </g>

      {/* Nose */}
      <path d="M21 16 Q22 17.5 23 16" stroke={c.skinColor} strokeWidth="1" fill="none" style={{ filter: 'brightness(0.8)' }} strokeLinecap="round" />

      {/* Mouth — slight smile when working, neutral otherwise */}
      {isWorking
        ? <path d="M18.5 18.5 Q22 21 25.5 18.5" stroke="#8B6348" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        : <path d="M19 18.5 Q22 20 25 18.5" stroke="#9a7560" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      }

      {/* Glasses (engineer) */}
      {c.glasses && (
        <>
          <rect x="13.5" y="10.5" width="8" height="6" rx="2.5" stroke="#6b7280" strokeWidth="0.9" fill="rgba(56,189,248,0.06)" />
          <rect x="22.5" y="10.5" width="8" height="6" rx="2.5" stroke="#6b7280" strokeWidth="0.9" fill="rgba(56,189,248,0.06)" />
          <line x1="21.5" y1="13.5" x2="22.5" y2="13.5" stroke="#6b7280" strokeWidth="0.8" />
          <line x1="13" y1="13" x2="11" y2="12" stroke="#6b7280" strokeWidth="0.7" />
          <line x1="30.5" y1="13" x2="32.5" y2="12" stroke="#6b7280" strokeWidth="0.7" />
        </>
      )}

      {/* Earpiece (CEO) */}
      {c.earpiece && (
        <>
          <circle cx="32.5" cy="13.5" r="1.8" fill="#374151" stroke="#6b7280" strokeWidth="0.6" />
          <line x1="33.5" y1="12" x2="34.5" y2="9" stroke="#4b5563" strokeWidth="0.7" />
        </>
      )}

      {/* Shirt pocket */}
      <rect x="14" y="27" width="7" height="5" rx="1" fill="transparent" stroke={c.accentColor} strokeWidth="0.6" opacity="0.4" />

      {/* Name badge clip */}
      <rect x="21" y="27" width="6" height="4" rx="1" fill={c.accentColor} opacity="0.3" />
    </svg>
  )
}

/* ─── Main AgentSprite component ─── */
export function AgentSprite({ agent }: Props) {
  const isWorking = agent.status === 'working'
  const taskMeta = agent.currentTask ? getTaskMeta(agent.currentTask) : null

  return (
    <div
      className={`absolute ${isWorking ? 'agent-working' : 'agent-idle'}`}
      style={{
        left: `${agent.x}%`,
        top: `${agent.y}%`,
        transform: 'translate(-50%, -100%)',
        transition: 'left 1.8s cubic-bezier(0.4,0,0.2,1), top 1.8s cubic-bezier(0.4,0,0.2,1)',
        zIndex: isWorking ? 10 : 5,
        filter: isWorking ? 'none' : 'grayscale(20%) brightness(0.85)',
      }}
    >
      {/* Working pulse ring */}
      {isWorking && (
        <>
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: 6,
              width: 50, height: 16, borderRadius: '50%',
              background: agent.color,
              opacity: 0.55,
              animation: 'agent-breathe 1.5s ease-in-out infinite',
              filter: `blur(6px)`,
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: 4,
              width: 70, height: 20, borderRadius: '50%',
              background: agent.color,
              opacity: 0.2,
              animation: 'agent-breathe 1.5s ease-in-out infinite',
              animationDelay: '0.2s',
              filter: `blur(10px)`,
            }}
          />
        </>
      )}

      {/* Task bubble */}
      {isWorking && taskMeta && (
        <div
          className="task-bubble absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{
            background: 'rgba(11,16,24,0.95)',
            border: `1px solid ${agent.color}40`,
            color: agent.color,
            fontSize: 10,
            fontFamily: 'var(--font-jakarta, sans-serif)',
            fontWeight: 600,
            boxShadow: `0 2px 12px ${agent.color}20`,
            letterSpacing: '0.03em',
          }}
        >
          <taskMeta.Icon />
          <span>{taskMeta.label}</span>
        </div>
      )}

      {/* Avatar */}
      <HumanAvatar agentId={agent.id} color={agent.color} status={agent.status} />

      {/* Name label */}
      <div
        className="absolute left-1/2 -translate-x-1/2 mt-0.5 px-2 py-0.5 rounded whitespace-nowrap text-center"
        style={{
          top: '100%',
          fontSize: 9,
          fontFamily: 'var(--font-bricolage, sans-serif)',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: isWorking ? agent.color : `${agent.color}99`,
          background: 'rgba(5,8,15,0.8)',
        }}
      >
        {agent.name}
      </div>
    </div>
  )
}
