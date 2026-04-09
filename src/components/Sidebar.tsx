import { LayoutDashboard, Kanban, Tag, LogOut, Columns, Settings } from 'lucide-react'
import type { Branch, ViewType } from '../types/task'
import { useBranchList, useBranchColor } from '../hooks/useBranches'

interface SidebarProps {
  view: ViewType
  onViewChange: (v: ViewType) => void
  activeBranch: Branch | null
  onBranchChange: (b: Branch | null) => void
  onAddTask: () => void
  onManageBranches: () => void
  onSwitchToTeux: () => void
  onSignOut: () => void
}

const LEGACY_VIEWS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'daily',  label: 'Daily',  icon: <LayoutDashboard size={15} /> },
  { id: 'board',  label: 'Board',  icon: <Kanban size={15} /> },
  { id: 'branch', label: 'Branch', icon: <Tag size={15} /> },
]

function BranchDot({ name }: { name: string | null }) {
  const color = useBranchColor(name)
  return <span style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
}

export function Sidebar({ view, onViewChange, activeBranch, onBranchChange, onAddTask, onManageBranches, onSwitchToTeux, onSignOut }: SidebarProps) {
  const branches = useBranchList()

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ backgroundColor: 'var(--t-elevated)', borderColor: 'var(--t-border)' }}
    >
      {/* Brand — same style as TopBar */}
      <div className="relative flex items-center justify-center px-4 shrink-0" style={{ height: 52, borderBottom: '1px solid var(--t-border)', background: 'var(--t-card)' }}>
        <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--t-text)' }}>
          Sentry
        </span>
      </div>

      {/* Teux shortcut — above the separator */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onSwitchToTeux}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'var(--t-accent)', backgroundColor: 'var(--t-accent-sub)', fontWeight: 500 }}
        >
          <Columns size={15} /> Hall
        </button>
      </div>

      {/* Separator */}
      <div className="mx-3 mb-1 flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: 'var(--t-border)' }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--t-text4)', fontSize: 9 }}>Legacy</span>
        <div className="flex-1 h-px" style={{ background: 'var(--t-border)' }} />
      </div>

      {/* Add task */}
      <div className="px-3 pb-2">
        <button onClick={onAddTask} className="btn-dark w-full justify-center text-sm">
          New Task
        </button>
      </div>

      {/* Views */}
      <nav className="px-3 space-y-0.5">
        {LEGACY_VIEWS.map(v => {
          const active = view === v.id
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: active ? 'var(--t-hover)' : 'transparent',
                color: active ? 'var(--t-text)' : 'var(--t-text2)',
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
      <div className="px-3 pt-3 border-t flex-1 overflow-y-auto mt-2" style={{ borderColor: 'var(--t-border)' }}>
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
              onClick={() => {
                onBranchChange(b)
                if (b !== null) onViewChange('branch')
              }}
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
