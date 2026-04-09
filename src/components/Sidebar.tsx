import { useState } from 'react'
import { LayoutDashboard, Kanban, Tag, LogOut, Columns, Settings, ChevronRight, ChevronLeft, PanelLeftClose } from 'lucide-react'
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
  { id: 'daily',  label: 'Daily',  icon: <LayoutDashboard size={14} /> },
  { id: 'board',  label: 'Board',  icon: <Kanban size={14} /> },
  { id: 'branch', label: 'Branch', icon: <Tag size={14} /> },
]

function BranchDot({ name }: { name: string | null }) {
  const color = useBranchColor(name)
  return <span style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
}

export function Sidebar({ view, onViewChange, activeBranch, onBranchChange, onAddTask, onManageBranches, onSwitchToTeux, onSignOut }: SidebarProps) {
  const branches = useBranchList()
  const [open, setOpen] = useState(true)

  return (
    <>
      {/* Collapsed tab */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center rounded-r-lg shadow-md"
          style={{
            width: 20, height: 48,
            background: 'var(--t-card)',
            borderTop: '1px solid var(--t-border)',
            borderRight: '1px solid var(--t-border)',
            borderBottom: '1px solid var(--t-border)',
            color: 'var(--t-text3)',
          }}
          title="Open sidebar"
        >
          <ChevronRight size={12} />
        </button>
      )}

      <aside
        className="shrink-0 flex flex-col h-screen sticky top-0 border-r overflow-hidden"
        style={{
          width: open ? 168 : 0,
          transition: 'width 0.2s ease',
          backgroundColor: 'var(--t-elevated)',
          borderColor: 'var(--t-border)',
        }}
      >
        {/* Brand + collapse button */}
        <div
          className="relative flex items-center justify-center px-3 shrink-0"
          style={{ height: 52, borderBottom: '1px solid var(--t-border)', background: 'var(--t-card)' }}
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--t-text)' }}>
            Sentry
          </span>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-2 btn-ghost p-1"
            style={{ color: 'var(--t-text4)' }}
            title="Collapse sidebar"
          >
            <PanelLeftClose size={13} />
          </button>
        </div>

        {/* Hall shortcut */}
        <div className="px-2 pt-2.5 pb-1.5">
          <button
            onClick={onSwitchToTeux}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all"
            style={{ color: 'var(--t-accent)', backgroundColor: 'var(--t-accent-sub)', fontWeight: 500 }}
          >
            <Columns size={13} /> Hall
          </button>
        </div>

        {/* Separator */}
        <div className="mx-2 mb-1 flex items-center gap-1.5">
          <div className="flex-1 h-px" style={{ background: 'var(--t-border)' }} />
          <span style={{ color: 'var(--t-text4)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Control</span>
          <div className="flex-1 h-px" style={{ background: 'var(--t-border)' }} />
        </div>

        {/* New Task */}
        <div className="px-2 pb-1.5">
          <button onClick={onAddTask} className="btn-dark w-full justify-center text-xs py-1.5">
            New Task
          </button>
        </div>

        {/* Views */}
        <nav className="px-2 space-y-0.5">
          {LEGACY_VIEWS.map(v => {
            const active = view === v.id
            return (
              <button
                key={v.id}
                onClick={() => onViewChange(v.id)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  backgroundColor: active ? 'var(--t-accent-sub)' : 'transparent',
                  color: active ? 'var(--t-accent)' : 'var(--t-text2)',
                  fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap',
                  borderLeft: active ? '2px solid var(--t-accent)' : '2px solid transparent',
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
        <div className="px-2 pt-2.5 border-t flex-1 overflow-y-auto mt-1.5" style={{ borderColor: 'var(--t-border)' }}>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <p style={{ color: 'var(--t-text4)', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              Branches
            </p>
            <button onClick={onManageBranches} title="Manage branches" style={{ color: 'var(--t-text4)' }} className="btn-ghost p-0.5">
              <Settings size={11} />
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
                className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all mb-0.5"
                style={{
                  backgroundColor: active ? 'var(--t-accent-sub)' : 'transparent',
                  color: active ? 'var(--t-accent)' : 'var(--t-text2)',
                  fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap',
                  borderLeft: active ? '2px solid var(--t-accent)' : '2px solid transparent',
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
        <div className="p-2 border-t" style={{ borderColor: 'var(--t-border)' }}>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all text-red-500 hover:bg-red-500/10"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
