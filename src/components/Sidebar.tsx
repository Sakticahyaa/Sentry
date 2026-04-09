import { LayoutDashboard, Calendar, Kanban, Tag, Plus, LogOut, TrendingUp, Columns, Settings } from 'lucide-react'
import type { Branch, ViewType } from '../types/task'
import { useBranchList, useBranchColor } from '../hooks/useBranches'

interface SidebarProps {
  view: ViewType
  onViewChange: (v: ViewType) => void
  activeBranch: Branch | null
  onBranchChange: (b: Branch | null) => void
  onAddTask: () => void
  onManageBranches: () => void
  onSignOut: () => void
}

const VIEWS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'teux',      label: 'Teux',      icon: <Columns size={15} /> },
  { id: 'daily',     label: 'Daily',     icon: <LayoutDashboard size={15} /> },
  { id: 'weekly',    label: 'Weekly',    icon: <Calendar size={15} /> },
  { id: 'board',     label: 'Board',     icon: <Kanban size={15} /> },
  { id: 'branch',    label: 'Branch',    icon: <Tag size={15} /> },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={15} /> },
]

function BranchDot({ name }: { name: string | null }) {
  const color = useBranchColor(name)
  return <span style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
}

export function Sidebar({ view, onViewChange, activeBranch, onBranchChange, onAddTask, onManageBranches, onSignOut }: SidebarProps) {
  const branches = useBranchList()

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ backgroundColor: 'var(--t-elevated)', borderColor: 'var(--t-border)' }}
    >
      {/* Brand */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--t-border)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: '#C9A84C' }}
          >
            S
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--t-text)' }}>Sentry</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--t-text4)' }}>Task Manager</p>
      </div>

      {/* Add task */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--t-border)' }}>
        <button onClick={onAddTask} className="btn-dark w-full justify-center text-sm">
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Views */}
      <nav className="p-3 space-y-0.5">
        <p className="text-xs font-semibold px-2 mb-2 uppercase tracking-wider" style={{ color: 'var(--t-text4)' }}>Views</p>
        {VIEWS.map(v => {
          const active = view === v.id
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: active ? 'var(--t-accent-sub)' : 'transparent',
                color: active ? 'var(--t-accent)' : 'var(--t-text2)',
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--t-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
            >
              {v.icon} {v.label}
            </button>
          )
        })}
      </nav>

      {/* Branches */}
      <div className="p-3 border-t flex-1 overflow-y-auto" style={{ borderColor: 'var(--t-border)' }}>
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--t-text4)' }}>Branches</p>
          <button onClick={onManageBranches} title="Manage branches" style={{ color: 'var(--t-text4)' }} className="btn-ghost p-0.5">
            <Settings size={12} />
          </button>
        </div>
        {[null, ...branches.map(b => b.name)].map(b => {
          const active = activeBranch === b
          return (
            <button
              key={b ?? 'all'}
              onClick={() => onBranchChange(b)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all mb-0.5"
              style={{
                backgroundColor: active ? 'var(--t-hover)' : 'transparent',
                color: active ? 'var(--t-text)' : 'var(--t-text2)',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--t-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
            >
              <BranchDot name={b} />
              {b ?? 'All'}
            </button>
          )
        })}
      </div>

      {/* Sign out */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--t-border)' }}>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all text-red-500 hover:bg-red-500/10"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
