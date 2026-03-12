'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AgentPixel, AgentEvent } from '@/types/pixel'
import { AgentSprite } from './AgentSprite'
import { ActivityFeed } from './ActivityFeed'
import { PART_TIME_AGENTS } from '@/lib/agents/registry'

/* ─── Position mapping ─── */

// Home desk positions (where agents sit by default)
const HOME: Record<string, { x: number; y: number }> = {
  ceo:         { x: 12, y: 25 },
  product:     { x: 40, y: 16 },
  engineering: { x: 68, y: 22 },
  marketing:   { x: 12, y: 64 },
  sales:       { x: 70, y: 61 },
  finance:     { x: 44, y: 74 },
}

const PART_TIME_HOME: Record<string, { x: number; y: number }> = {
  'frontend-dev':   { x: 75, y: 28 },
  'backend-arch':   { x: 80, y: 35 },
  'devops':         { x: 87, y: 22 },
  'security-eng':   { x: 70, y: 32 },
  'mobile-builder': { x: 75, y: 40 },
  'qa-tester':      { x: 65, y: 28 },
  'data-engineer':  { x: 83, y: 42 },
  'accessibility':  { x: 70, y: 42 },
  'ui-designer':    { x: 30, y: 22 },
  'ux-researcher':  { x: 36, y: 28 },
  'brand-guardian': { x: 28, y: 32 },
  'content-creator':  { x: 18, y: 70 },
  'growth-hacker':    { x: 8,  y: 75 },
  'social-media':     { x: 22, y: 65 },
  'sprint-planner':   { x: 44, y: 20 },
  'trend-researcher': { x: 50, y: 28 },
  'feedback-synth':   { x: 36, y: 35 },
  'analytics':         { x: 32, y: 75 },
  'legal':             { x: 46, y: 80 },
  'project-shepherd':  { x: 18, y: 40 },
}

const PART_TIME_COLORS: Record<string, string> = {
  'frontend-dev': '#22d3ee', 'backend-arch': '#34d399', 'devops': '#a3e635',
  'security-eng': '#f43f5e', 'mobile-builder': '#818cf8', 'qa-tester': '#fbbf24',
  'data-engineer': '#67e8f9', 'ui-designer': '#e879f9', 'ux-researcher': '#c084fc',
  'brand-guardian': '#fbbf24', 'content-creator': '#f97316', 'growth-hacker': '#ef4444',
  'social-media': '#ec4899', 'sprint-planner': '#0ea5e9', 'trend-researcher': '#06b6d4',
  'feedback-synth': '#2dd4bf', 'analytics': '#10b981', 'legal': '#6ee7b7',
  'project-shepherd': '#a78bfa', 'accessibility': '#86efac',
}

// Named zones
const ZONES = {
  meeting:    { x: 44, y: 46 },
  whiteboard: { x: 54, y: 10 },
  server:     { x: 80, y: 10 },
  coffee:     { x: 84, y: 55 },
  printer:    { x: 50, y: 5 },
  ceo_desk:   HOME.ceo,
  product_desk: HOME.product,
  eng_desk:   HOME.engineering,
  mkt_desk:   HOME.marketing,
  sales_desk: HOME.sales,
  finance_desk: HOME.finance,
}

function getWorkPosition(agentId: string, eventType: string): { x: number; y: number } {
  const t = eventType.toLowerCase()

  // Collaboration → meeting table
  if (t.includes('meet') || t.includes('collab') || t.includes('present') || t.includes('discuss') || t.includes('sync') || t.includes('board')) {
    return ZONES.meeting
  }
  // Code work → engineering bay
  if (t.includes('code') || t.includes('debug') || t.includes('pr') || t.includes('deploy') || t.includes('commit') || t.includes('review_code')) {
    return ZONES.eng_desk
  }
  // Standup / whiteboard work
  if (t.includes('standup') || t.includes('retro') || t.includes('demo')) {
    return ZONES.whiteboard
  }
  // Product work
  if (t.includes('prd') || t.includes('kanban') || t.includes('backlog') || t.includes('sprint') || t.includes('roadmap') || t.includes('feature')) {
    return ZONES.product_desk
  }
  // Marketing
  if (t.includes('content') || t.includes('seo') || t.includes('campaign') || t.includes('copy') || t.includes('blog') || t.includes('ad ') || t.includes('market')) {
    return ZONES.mkt_desk
  }
  // Sales
  if (t.includes('outreach') || t.includes('crm') || t.includes('follow') || t.includes('prospect') || t.includes('call') || t.includes('pitch')) {
    return ZONES.sales_desk
  }
  // Finance
  if (t.includes('budget') || t.includes('p&l') || t.includes('finance') || t.includes('invoice') || t.includes('forecast') || t.includes('revenue') || t.includes('payroll')) {
    return ZONES.finance_desk
  }
  // Strategy → CEO corner
  if (t.includes('strategy') || t.includes('vision') || t.includes('decide') || t.includes('plan') || t.includes('oKR') || t.includes('objective')) {
    return ZONES.ceo_desk
  }
  // Server/infra work
  if (t.includes('infra') || t.includes('server') || t.includes('cloud') || t.includes('devops')) {
    return ZONES.server
  }
  // Default: home desk
  return HOME[agentId] ?? HOME.ceo
}

function agentNameToId(name: string): string {
  const n = name.toLowerCase()
  // Full-time agents
  if (n.includes('ceo'))        return 'ceo'
  if (n.includes('product'))    return 'product'
  if (n.includes('engineer') && !n.includes('frontend') && !n.includes('backend') && !n.includes('mobile') && !n.includes('data') && !n.includes('security') && !n.includes('devops') && !n.includes('qa') && !n.includes('access'))
    return 'engineering'
  if (n.includes('market') && !n.includes('content') && !n.includes('growth') && !n.includes('social'))
    return 'marketing'
  if (n.includes('sales'))      return 'sales'
  if (n.includes('finance') && !n.includes('analytics') && !n.includes('legal'))
    return 'finance'
  // Part-time agents — match by name fragments
  if (n.includes('alex chen') || n.includes('frontend'))   return 'frontend-dev'
  if (n.includes('ravi kumar') || n.includes('backend'))   return 'backend-arch'
  if (n.includes('sam okafor') || n.includes('devops'))    return 'devops'
  if (n.includes('priya nair') || n.includes('security'))  return 'security-eng'
  if (n.includes('james park') || n.includes('mobile'))    return 'mobile-builder'
  if (n.includes('lisa zhang') || n.includes('qa'))        return 'qa-tester'
  if (n.includes('tatiana') || n.includes('data eng'))     return 'data-engineer'
  if (n.includes('sofia reyes') || n.includes('ui design')) return 'ui-designer'
  if (n.includes('maya iyer') || n.includes('ux research')) return 'ux-researcher'
  if (n.includes('lena') || n.includes('brand'))           return 'brand-guardian'
  if (n.includes('aisha') || n.includes('content'))        return 'content-creator'
  if (n.includes('carlos') || n.includes('growth'))        return 'growth-hacker'
  if (n.includes('yuki') || n.includes('social media'))    return 'social-media'
  if (n.includes('arjun') || n.includes('sprint'))         return 'sprint-planner'
  if (n.includes('nina') || n.includes('trend'))           return 'trend-researcher'
  if (n.includes('omar') || n.includes('feedback'))        return 'feedback-synth'
  if (n.includes('elena') || n.includes('analytics'))      return 'analytics'
  if (n.includes('deepa') || n.includes('legal'))          return 'legal'
  if (n.includes('marcus') || n.includes('shepherd'))      return 'project-shepherd'
  if (n.includes('kwame') || n.includes('accessib'))       return 'accessibility'
  return 'ceo'
}

const AGENT_DEFAULTS: AgentPixel[] = [
  { id: 'ceo',         name: 'CEO',       emoji: '', color: '#a78bfa', status: 'idle', ...HOME.ceo },
  { id: 'product',     name: 'Product',   emoji: '', color: '#38bdf8', status: 'idle', ...HOME.product },
  { id: 'engineering', name: 'Engineer',  emoji: '', color: '#4ade80', status: 'idle', ...HOME.engineering },
  { id: 'marketing',   name: 'Marketing', emoji: '', color: '#fb923c', status: 'idle', ...HOME.marketing },
  { id: 'sales',       name: 'Sales',     emoji: '', color: '#f472b6', status: 'idle', ...HOME.sales },
  { id: 'finance',     name: 'Finance',   emoji: '', color: '#14b8a6', status: 'idle', ...HOME.finance },
]

/* ─── Office furniture components ─── */

function Desk({ x, y, color, label, rotate = 0 }: { x: string; y: string; color: string; label?: string; rotate?: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y, transform: `rotate(${rotate}deg)` }}>
      {/* Chair */}
      <div className="absolute" style={{ left: 14, top: -14, width: 22, height: 14, borderRadius: '50% 50% 0 0', background: '#141c26', border: '1px solid #1a2236' }} />
      {/* Desk surface */}
      <div style={{ width: 64, height: 40, background: '#0e1520', border: `1px solid ${color}25`, borderRadius: 4, position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        {/* Monitor */}
        <div style={{ width: 32, height: 22, background: '#05080f', border: `1px solid ${color}35`, borderRadius: 2, margin: '4px auto 0', position: 'relative', overflow: 'hidden' }} className="screen-glow">
          <div style={{ position: 'absolute', inset: 2, borderRadius: 1, background: `linear-gradient(135deg, ${color}12, ${color}06)` }} />
          {/* fake code lines */}
          {[0,1,2,3].map(i => (
            <div key={i} style={{ height: 1.5, borderRadius: 1, background: `${color}30`, margin: `${3 + i * 4}px ${4 + i * 2}px 0` }} />
          ))}
        </div>
        {/* Keyboard */}
        <div style={{ width: 28, height: 5, background: '#1a2236', borderRadius: 1, margin: '2px auto 0' }} />
        {/* Mouse */}
        <div style={{ width: 5, height: 8, background: '#141c26', borderRadius: 3, position: 'absolute', right: 5, bottom: 5, border: '1px solid #253044' }} />
        {/* Coffee cup */}
        <div style={{ width: 7, height: 8, background: '#251b05', borderRadius: '0 0 2px 2px', position: 'absolute', right: 13, top: 4, borderBottom: '1px solid #3d2d08' }}>
          <div style={{ width: 5, height: 1, background: '#8b6914', borderRadius: 1, margin: '2px auto' }} />
        </div>
      </div>
      {/* Desk leg/base */}
      <div style={{ width: 10, height: 3, background: '#1a2236', borderRadius: 2, margin: '0 auto' }} />
      {label && (
        <div style={{ textAlign: 'center', fontSize: 8, color, opacity: 0.5, marginTop: 2, fontFamily: 'var(--font-bricolage)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
    </div>
  )
}

function Plant({ x, y, size = 1 }: { x: string; y: string; size?: number }) {
  const s = size * 28
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      <svg width={s} height={s} viewBox="0 0 28 32" fill="none">
        {/* Pot */}
        <path d="M8 22 L10 30 L18 30 L20 22Z" fill="#6b3a1f" />
        <rect x="7" y="20" width="14" height="3" rx="1.5" fill="#7c4a28" />
        {/* Soil */}
        <rect x="9" y="21" width="10" height="2" rx="1" fill="#3d2008" />
        {/* Stems */}
        <line x1="14" y1="20" x2="10" y2="10" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="20" x2="18" y2="8" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="18" x2="14" y2="6" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx="10" cy="9" rx="4" ry="3" fill="#16a34a" transform="rotate(-25 10 9)" />
        <ellipse cx="18" cy="7" rx="4.5" ry="3" fill="#15803d" transform="rotate(20 18 7)" />
        <ellipse cx="14" cy="5" rx="3.5" ry="4" fill="#16a34a" />
        {/* Leaf highlights */}
        <line x1="10" y1="7" x2="10" y2="11" stroke="#22c55e" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        <line x1="18" y1="5" x2="18" y2="9" stroke="#22c55e" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
  )
}

function ServerRack({ x, y }: { x: string; y: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      <div style={{ width: 36, height: 64, background: '#0b1018', border: '1px solid #253044', borderRadius: 3, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
        {/* Top trim */}
        <div style={{ height: 4, background: '#1a2236', borderBottom: '1px solid #253044' }} />
        {/* Server units */}
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ height: 8, margin: '2px 2px', background: '#0d1520', border: '1px solid #1a2236', borderRadius: 1, display: 'flex', alignItems: 'center', padding: '0 3px', gap: 2 }}>
            <div className={i % 3 === 0 ? 'blink-fast' : 'blink-slow'} style={{ width: 3, height: 3, borderRadius: '50%', background: i % 3 === 0 ? '#4ade80' : '#38bdf8', flexShrink: 0 }} />
            <div style={{ flex: 1, height: 2, background: '#1a2236', borderRadius: 1 }} />
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#fb923c', opacity: 0.6, flexShrink: 0 }} />
          </div>
        ))}
        {/* Bottom trim */}
        <div style={{ height: 4, background: '#1a2236', borderTop: '1px solid #253044', position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      </div>
      <div style={{ textAlign: 'center', fontSize: 7, color: '#4ade80', opacity: 0.5, marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>servers</div>
    </div>
  )
}

function Whiteboard({ x, y }: { x: string; y: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {/* Board frame */}
      <div style={{ width: 80, height: 50, background: '#f1f5f9', border: '3px solid #253044', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        {/* Marker scribbles */}
        <svg width="74" height="44" viewBox="0 0 74 44" style={{ position: 'absolute', left: 3, top: 3 }}>
          <path d="M5 20 Q20 10 35 20 Q50 30 65 15" stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round" />
          <rect x="5" y="5" width="16" height="3" rx="1.5" fill="#1e1b4b" opacity="0.3" />
          <rect x="5" y="10" width="22" height="3" rx="1.5" fill="#1e1b4b" opacity="0.3" />
          <rect x="5" y="15" width="12" height="3" rx="1.5" fill="#1e1b4b" opacity="0.3" />
          {/* Boxes for sprint tasks */}
          <rect x="38" y="5" width="12" height="12" rx="1" stroke="#1e40af" strokeWidth="1" fill="none" opacity="0.4" />
          <rect x="53" y="5" width="12" height="12" rx="1" stroke="#166534" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M40 11 L43 14 L49 8" stroke="#166534" strokeWidth="1.2" fill="none" opacity="0.5" />
          {/* Circle/arc */}
          <circle cx="25" cy="35" r="7" stroke="#b45309" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M25 28 L25 35 L30 35" stroke="#b45309" strokeWidth="1" fill="none" opacity="0.4" />
        </svg>
        {/* Eraser smudge */}
        <div style={{ position: 'absolute', right: 4, bottom: 4, width: 12, height: 5, background: '#e2e8f0', borderRadius: 2 }} />
      </div>
      {/* Tray */}
      <div style={{ width: 84, height: 5, background: '#1a2236', borderRadius: '0 0 2px 2px', marginLeft: -2 }} />
      {/* Marker on tray */}
      <div style={{ position: 'absolute', bottom: 1, left: 10, width: 3, height: 5, borderRadius: 2, background: '#7c3aed' }} />
      <div style={{ position: 'absolute', bottom: 1, left: 16, width: 3, height: 5, borderRadius: 2, background: '#16a34a' }} />
      <div style={{ textAlign: 'center', fontSize: 7, color: '#4a566e', marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>sprint board</div>
    </div>
  )
}

function CoffeeStation({ x, y }: { x: string; y: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {/* Counter */}
      <div style={{ width: 52, height: 36, background: '#0e1520', border: '1px solid #253044', borderRadius: 4, position: 'relative', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
        {/* Coffee machine */}
        <div style={{ width: 22, height: 28, background: '#141c26', border: '1px solid #253044', borderRadius: 3, position: 'absolute', left: 4, top: 4 }}>
          <div style={{ width: 12, height: 8, background: '#0b1018', border: '1px solid #1a2236', borderRadius: 2, margin: '4px auto' }} />
          <div style={{ width: 8, height: 6, background: '#161616', borderRadius: '0 0 3px 3px', margin: '0 auto', border: '1px solid #1a2236' }} />
          {/* Light */}
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ade80', margin: '2px auto' }} className="blink-slow" />
        </div>
        {/* Cups */}
        <div style={{ position: 'absolute', right: 6, top: 6, width: 8, height: 10, borderRadius: '0 0 3px 3px', background: '#fff', border: '1px solid #e2e8f0', opacity: 0.9 }}>
          <div style={{ width: 6, height: 4, background: '#6b3a1f', borderRadius: 1, margin: '3px auto' }} />
        </div>
        <div style={{ position: 'absolute', right: 16, top: 10, width: 8, height: 10, borderRadius: '0 0 3px 3px', background: '#fff', border: '1px solid #e2e8f0', opacity: 0.7 }}>
          <div style={{ width: 6, height: 4, background: '#6b3a1f', borderRadius: 1, margin: '3px auto' }} />
        </div>
      </div>
      {/* Stools */}
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        {[0,1].map(i => (
          <div key={i} style={{ width: 20, height: 3, background: '#141c26', border: '1px solid #1a2236', borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 7, color: '#fb923c', opacity: 0.5, marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>break</div>
    </div>
  )
}

function WaterCooler({ x, y }: { x: string; y: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      <div style={{ width: 18, height: 42, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Water jug */}
        <div style={{ width: 14, height: 16, background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '50% 50% 0 0', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 2, borderRadius: '50% 50% 0 0', background: 'rgba(56,189,248,0.1)' }} />
        </div>
        {/* Body */}
        <div style={{ width: 16, height: 22, background: '#0e1520', border: '1px solid #253044', borderRadius: '0 0 3px 3px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', opacity: 0.7 }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f43f5e', opacity: 0.7 }} />
        </div>
        {/* Base */}
        <div style={{ width: 18, height: 4, background: '#141c26', borderRadius: 2 }} />
      </div>
    </div>
  )
}

function ConferenceTable({ x, y }: { x: string; y: string }) {
  const chairs = [
    { angle: 0 }, { angle: 60 }, { angle: 120 },
    { angle: 180 }, { angle: 240 }, { angle: 300 },
  ]
  return (
    <div className="absolute" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      <svg width="140" height="90" viewBox="0 0 140 90" fill="none">
        {/* Table shadow */}
        <ellipse cx="70" cy="52" rx="58" ry="32" fill="rgba(0,0,0,0.3)" />
        {/* Table surface */}
        <ellipse cx="70" cy="46" rx="58" ry="30" fill="#0e1520" stroke="#1a2236" strokeWidth="1.5" />
        {/* Table grain */}
        <ellipse cx="70" cy="46" rx="40" ry="18" stroke="#141c26" strokeWidth="1" fill="none" />
        {/* Center label */}
        <text x="70" y="50" textAnchor="middle" fontSize="7" fill="#4a566e" fontFamily="var(--font-bricolage)" letterSpacing="2" textDecoration="uppercase">HQ</text>
        {/* Chairs */}
        {chairs.map((c, i) => {
          const rad = (c.angle * Math.PI) / 180
          const cx = 70 + Math.cos(rad) * 62
          const cy = 46 + Math.sin(rad) * 34
          return (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx="7" ry="5.5" fill="#141c26" stroke="#253044" strokeWidth="1" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function Window({ x, y }: { x: string; y: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      <div style={{ width: 56, height: 40, background: 'rgba(56,189,248,0.04)', border: '2px solid #253044', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        {/* Sky gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(56,189,248,0.08), rgba(124,58,237,0.04))' }} />
        {/* Window cross */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1.5, background: '#253044' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1.5, background: '#253044' }} />
        {/* Light shaft */}
        <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '100%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)' }} />
      </div>
    </div>
  )
}

function Printer({ x, y }: { x: string; y: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      <div style={{ width: 42, height: 26, background: '#0e1520', border: '1px solid #253044', borderRadius: 3, position: 'relative' }}>
        {/* Paper slot */}
        <div style={{ position: 'absolute', top: 7, left: 4, right: 4, height: 3, background: '#1a2236', borderRadius: 1 }} />
        {/* Output tray */}
        <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, height: 4, background: '#141c26', borderRadius: 1 }}>
          {/* Paper */}
          <div style={{ position: 'absolute', right: 3, top: -2, width: 14, height: 8, background: '#e2e8f0', borderRadius: 1, opacity: 0.9 }} />
        </div>
        {/* Status light */}
        <div style={{ position: 'absolute', top: 5, right: 5, width: 4, height: 4, borderRadius: '50%', background: '#4ade80' }} className="blink-slow" />
      </div>
      <div style={{ textAlign: 'center', fontSize: 7, color: '#4a566e', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>printer</div>
    </div>
  )
}

/* ─── Zone area (subtle background tint) ─── */
function ZoneArea({ x, y, w, h, color, label }: { x: string; y: string; w: string; h: string; color: string; label: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, width: w, height: h }}>
      <div style={{ width: '100%', height: '100%', background: `${color}08`, border: `1px solid #253044`, borderRadius: 8 }} />
      <div style={{
        position: 'absolute', top: -9, left: 10,
        fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        fontFamily: 'var(--font-bricolage)',
        color: '#8b98b4',
        background: '#0b1018',
        border: '1px solid #253044',
        borderRadius: 4,
        padding: '1px 6px',
      }}>
        {label}
      </div>
    </div>
  )
}

/* ─── Ceiling light fixture ─── */
function CeilingLight({ x, y, color = '#a78bfa' }: { x: string; y: string; color?: string }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, transform: 'translate(-50%, 0)' }}>
      <div style={{ width: 32, height: 4, background: '#1a2236', borderRadius: 2, boxShadow: `0 4px 24px ${color}18, 0 8px 48px ${color}08` }} />
      <div style={{ width: 60, height: 24, borderRadius: '0 0 50% 50%', background: `radial-gradient(ellipse at top, ${color}06, transparent)`, marginLeft: -14 }} />
    </div>
  )
}

/* ─── Main PixelWorld component ─── */
export function PixelWorld() {
  const [agents, setAgents] = useState<AgentPixel[]>(AGENT_DEFAULTS)
  const [partTimeAgents, setPartTimeAgents] = useState<AgentPixel[]>([])
  const [events, setEvents] = useState<AgentEvent[]>([])
  const supabase = createClient()

  const fetchRecentEvents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).single()
    if (!customer) return

    const { data } = await supabase
      .from('agent_events')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const evts = (data ?? []) as AgentEvent[]
    setEvents(evts)

    if (evts.length > 0) {
      const recentByAgent: Record<string, AgentEvent> = {}
      evts.forEach(e => { if (!recentByAgent[e.agent_name]) recentByAgent[e.agent_name] = e })

      setAgents(prev => prev.map(a => {
        const evt = Object.values(recentByAgent).find(e => agentNameToId(e.agent_name) === a.id)
        if (!evt) return a
        const ageMs = Date.now() - new Date(evt.created_at).getTime()
        if (ageMs >= 300_000) return { ...a, status: 'idle', ...HOME[a.id] }
        const pos = getWorkPosition(a.id, evt.event_type)
        return { ...a, status: 'working', currentTask: evt.event_type, ...pos }
      }))
    }

    // Fetch active part-time deployments
    const { data: deployments } = await supabase
      .from('part_time_deployments')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'active')
      .order('deployed_at', { ascending: false })

    if (deployments && deployments.length > 0) {
      const activePartTime: AgentPixel[] = deployments.map((dep: { agent_id: string; task_description?: string }) => {
        const home = PART_TIME_HOME[dep.agent_id] ?? { x: 50, y: 50 }
        const color = PART_TIME_COLORS[dep.agent_id] ?? '#a78bfa'
        const agentInfo = PART_TIME_AGENTS.find(a => a.id === dep.agent_id)
        return {
          id: dep.agent_id,
          name: agentInfo?.name ?? dep.agent_id,
          emoji: '',
          color,
          status: 'working' as const,
          currentTask: dep.task_description ?? 'working',
          ...home,
        }
      })
      setPartTimeAgents(activePartTime)
    } else {
      setPartTimeAgents([])
    }
  }, [supabase])

  useEffect(() => { fetchRecentEvents() }, [fetchRecentEvents])

  useEffect(() => {
    const channel = supabase.channel('agent_events_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_events' }, payload => {
        const evt = payload.new as AgentEvent
        setEvents(prev => [evt, ...prev].slice(0, 20))
        setAgents(prev => prev.map(a => {
          if (agentNameToId(evt.agent_name) !== a.id) return a
          const pos = getWorkPosition(a.id, evt.event_type)
          return { ...a, status: 'working', currentTask: evt.event_type, ...pos }
        }))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  useEffect(() => {
    const channel = supabase.channel('part_time_deployments_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'part_time_deployments' }, () => fetchRecentEvents())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchRecentEvents])

  return (
    <div className="flex rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 8rem)', border: '1px solid #253044' }}>
      {/* ─── Office canvas ─── */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#080c14' }}>

        {/* Floor base */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(26,34,54,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(26,34,54,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Ambient ceiling light pools */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 30% 20% at 18% 15%, rgba(167,139,250,0.04) 0%, transparent 70%), radial-gradient(ellipse 25% 18% at 50% 12%, rgba(56,189,248,0.03) 0%, transparent 70%), radial-gradient(ellipse 28% 20% at 78% 15%, rgba(74,222,128,0.04) 0%, transparent 70%)',
        }} />

        {/* ─── Zone areas ─── */}
        <ZoneArea x="1%" y="1%" w="26%" h="46%" color="#a78bfa" label="Leadership" />
        <ZoneArea x="28%" y="1%" w="32%" h="34%" color="#38bdf8" label="Product" />
        <ZoneArea x="61%" y="1%" w="38%" h="46%" color="#4ade80" label="Engineering" />
        <ZoneArea x="1%" y="50%" w="26%" h="48%" color="#fb923c" label="Marketing" />
        <ZoneArea x="28%" y="38%" w="32%" h="26%" color="#a78bfa" label="Conference" />
        <ZoneArea x="61%" y="50%" w="38%" h="48%" color="#f472b6" label="Sales" />
        <ZoneArea x="28%" y="65%" w="32%" h="34%" color="#14b8a6" label="Finance" />

        {/* ─── Ceiling lights ─── */}
        <CeilingLight x="18%" y="2%" color="#a78bfa" />
        <CeilingLight x="50%" y="2%" color="#38bdf8" />
        <CeilingLight x="78%" y="2%" color="#4ade80" />
        <CeilingLight x="18%" y="54%" color="#fb923c" />
        <CeilingLight x="78%" y="54%" color="#f472b6" />

        {/* ─── Windows (top wall) ─── */}
        <Window x="6%"  y="0%" />
        <Window x="40%" y="0%" />
        <Window x="72%" y="0%" />

        {/* ─── Desks ─── */}
        <Desk x="7%"  y="20%" color="#a78bfa" label="CEO" />
        <Desk x="35%" y="13%" color="#38bdf8" label="Product" />
        <Desk x="62%" y="18%" color="#4ade80" label="Engineer" />
        <Desk x="7%"  y="58%" color="#fb923c" label="Marketing" />
        <Desk x="63%" y="55%" color="#f472b6" label="Sales" />
        <Desk x="37%" y="68%" color="#14b8a6" label="Finance" />

        {/* ─── Conference table ─── */}
        <ConferenceTable x="46%" y="50%" />

        {/* ─── Whiteboard (product/eng zone) ─── */}
        <Whiteboard x="49%" y="4%" />

        {/* ─── Server rack (engineering corner) ─── */}
        <ServerRack x="88%" y="5%" />

        {/* ─── Coffee station (break corner) ─── */}
        <CoffeeStation x="80%" y="52%" />

        {/* ─── Water cooler ─── */}
        <WaterCooler x="2%" y="45%" />

        {/* ─── Printer ─── */}
        <Printer x="27%" y="2%" />

        {/* ─── Plants ─── */}
        <Plant x="0%" y="0%" size={0.9} />
        <Plant x="93%" y="1%" size={0.8} />
        <Plant x="0%" y="83%" size={0.85} />
        <Plant x="92%" y="84%" size={0.9} />

        {/* ─── Agent sprites ─── */}
        {agents.map(agent => (
          <AgentSprite key={agent.id} agent={agent} />
        ))}
        {partTimeAgents.map(agent => (
          <AgentSprite key={`pt_${agent.id}`} agent={agent} />
        ))}

        {/* ─── Legend ─── */}
        <div className="absolute bottom-3 right-3 flex items-center gap-4" style={{ fontSize: 10, color: '#4a566e' }}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#253044' }} /> Idle
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#a78bfa' }} /> Working
          </div>
        </div>

        {/* ─── Version tag ─── */}
        <div className="absolute bottom-3 left-3" style={{ fontSize: 9, color: '#2e3b52', fontFamily: 'var(--font-bricolage)', letterSpacing: '0.06em' }}>
          Sangam HQ · v0.2
        </div>
      </div>

      {/* ─── Activity feed ─── */}
      <ActivityFeed events={events} agents={agents} />
    </div>
  )
}
