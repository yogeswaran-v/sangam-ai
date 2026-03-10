'use client'

import { useState } from 'react'
import { FULL_TIME_AGENTS, PART_TIME_AGENTS } from '@/lib/agents/registry'
import type { PartTimeAgent, FullTimeAgent } from '@/lib/agents/registry'

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Marketing', 'Product', 'Finance', 'Operations']

function SkillBadge({ skill, color }: { skill: string; color: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
    >
      {skill}
    </span>
  )
}

function DeptBadge({ dept }: { dept: string }) {
  const colors: Record<string, string> = {
    Engineering: '#4ade80', Design: '#e879f9', Marketing: '#fb923c',
    Product: '#38bdf8', Finance: '#14b8a6', Operations: '#a78bfa',
  }
  const c = colors[dept] ?? '#4a566e'
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ color: c, background: `${c}12` }}>
      {dept}
    </span>
  )
}

function FullTimeCard({ agent }: { agent: FullTimeAgent }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200"
      style={{ background: '#0b1018', border: '1px solid #1a2236' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${agent.color}30` }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1a2236' }}
    >
      {/* Avatar circle */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[16px] font-black"
          style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30`, color: agent.color, fontFamily: 'var(--font-bricolage)' }}
        >
          {agent.name.charAt(0)}
        </div>
        <div>
          <div className="text-[14px] font-bold" style={{ color: '#eef2f8', fontFamily: 'var(--font-bricolage)' }}>
            {agent.name}
          </div>
          <div className="text-[12px]" style={{ color: agent.color }}>{agent.role}</div>
        </div>
        {/* Full-time badge */}
        <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: `${agent.color}15`, color: agent.color, border: `1px solid ${agent.color}25` }}>
          Full-time
        </span>
      </div>

      <p className="text-[12px] leading-relaxed" style={{ color: '#8b98b4' }}>{agent.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {agent.skills.map(s => <SkillBadge key={s} skill={s} color={agent.color} />)}
      </div>

      {/* Online indicator */}
      <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: '#1a2236' }}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
          <span className="relative block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[11px]" style={{ color: '#4a566e' }}>Always active</span>
      </div>
    </div>
  )
}

function PartTimeCard({ agent }: { agent: PartTimeAgent }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 cursor-default"
      style={{ background: '#0b1018', border: '1px solid #1a2236' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${agent.color}30` }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1a2236' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Avatar with initials */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-black"
            style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30`, color: agent.color, fontFamily: 'var(--font-bricolage)' }}
          >
            {agent.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-[13px] font-bold leading-tight" style={{ color: '#eef2f8', fontFamily: 'var(--font-bricolage)' }}>
              {agent.name}
            </div>
            <div className="text-[11px]" style={{ color: agent.color }}>{agent.role}</div>
          </div>
        </div>
        <DeptBadge dept={agent.department} />
      </div>

      <p className="text-[11px] leading-relaxed" style={{ color: '#8b98b4' }}>{agent.description}</p>

      <div className="flex flex-wrap gap-1">
        {agent.skills.slice(0, 4).map(s => <SkillBadge key={s} skill={s} color={agent.color} />)}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: '#1a2236' }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#253044' }} />
        <span className="text-[10px]" style={{ color: '#4a566e' }}>Deployed by CEO as needed</span>
      </div>
    </div>
  )
}

export function TeamDirectory() {
  const [deptFilter, setDeptFilter] = useState('All')

  const filtered = deptFilter === 'All'
    ? PART_TIME_AGENTS
    : PART_TIME_AGENTS.filter(a => a.department === deptFilter)

  return (
    <div className="flex flex-col gap-10">
      {/* Full-time section */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div>
            <h2 className="text-[16px] font-bold" style={{ color: '#eef2f8', fontFamily: 'var(--font-bricolage)' }}>
              Core Team
            </h2>
            <p className="text-[12px]" style={{ color: '#4a566e' }}>6 full-time agents · always active</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: '#4a566e' }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
              <span className="relative block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            All systems online
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FULL_TIME_AGENTS.map(a => <FullTimeCard key={a.id} agent={a} />)}
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: '#1a2236' }} />

      {/* Part-time section */}
      <section>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-[16px] font-bold" style={{ color: '#eef2f8', fontFamily: 'var(--font-bricolage)' }}>
              Specialist Roster
            </h2>
            <p className="text-[12px]" style={{ color: '#4a566e' }}>20 part-time specialists · deployed by CEO as needed</p>
          </div>
          {/* Department filters */}
          <div className="flex flex-wrap gap-1.5 justify-end">
            {DEPARTMENTS.map(d => {
              const active = deptFilter === d
              return (
                <button
                  key={d}
                  onClick={() => setDeptFilter(d)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150 cursor-pointer"
                  style={active ? {
                    background: 'rgba(124,58,237,0.12)',
                    color: '#eef2f8',
                    border: '1px solid rgba(167,139,250,0.25)',
                  } : {
                    background: 'transparent',
                    color: '#4a566e',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#8b98b4' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#4a566e' }}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(a => <PartTimeCard key={a.id} agent={a} />)}
        </div>
      </section>
    </div>
  )
}
