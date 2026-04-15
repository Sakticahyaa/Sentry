import { useState, useEffect } from 'react'
import { LayoutDashboard, Kanban, Tag, LogOut, Columns, Settings, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
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
  // mobile
  mobileOpen?: boolean
  onMobileClose?: () => void
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

export function Sidebar({
  view, onViewChange, activeBranch, onBranchChange,
  onAddTask, onManageBranches, onSwitchToTeux, onSignOut,
  mobileOpen = false, onMobileClose,
}: SidebarProps) {
  const branches = useBranchList()
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const showExpanded = isMobile ? true : expanded
  const W = isMobile ? 220 : (expanded ? 168 : 44)

  const inner = (
    <div className="flex flex-col h-full" style={{ width: W }}>
      {/* Brand + toggle */}
      <div
        className="relative flex items-center shrink-0"
        style={{
          height: 52,
          borderBottom: '1px solid var(--t-border)',
          background: 'var(--t-card)',
          justifyContent: showExpanded ? 'center' : 'center',
        }}
      >
        {showExpanded && (
          <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--t-text)' }}>
            Sentry
          </span>
        )}
        {isMobile ? (
          <button
            onClick={onMobileClose}
            className="absolute right-1.5 btn-ghost p-1"
            style={{ color: 'var(--t-text4)' }}
          >
            <X size={14} />
          </button>
        ) : (
          <button
            onClick={() => setExpanded(e => !e)}
            className="absolute right-1.5 btn-ghost p-1"
            style={{ color: 'var(--t-text4)' }}
            title={expanded ? 'Slim sidebar' : 'Expand sidebar'}
          >
            {expanded ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
          </button>
        )}
      </div>

      {/* Hall shortcut */}
      <div className="px-2 pt-2.5 pb-1.5">
        <button
          onClick={onSwitchToTeux}
          className="w-full flex items-center px-2 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: 'var(--t-accent)', backgroundColor: 'var(--t-accent-sub)', fontWeight: 500, gap: showExpanded ? 6 : 0, justifyContent: showExpanded ? 'flex-start' : 'center' }}
          title="Hall"
        >
          <Columns size={13} />
          {showExpanded && <span>Hall</span>}
        </button>
      </div>

      {/* Separator */}
      <div className="mx-2 mb-1 flex items-center gap-1.5">
        <div className="flex-1 h-px" style={{ background: 'var(--t-border)' }} />
        {showExpanded && <span style={{ color: 'var(--t-text4)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Control</span>}
        <div className="flex-1 h-px" style={{ background: 'var(--t-border)' }} />
      </div>

      {/* New Task */}
      <div className="px-2 pb-1.5">
        <button
          onClick={onAddTask}
          className="btn-dark w-full justify-center text-xs py-1.5"
          title="New Task"
        >
          {showExpanded ? 'New Task' : '+'}
        </button>
      </div>

      {/* Views */}
      <nav className="px-2 space-y-0.5">
        {LEGACY_VIEWS.map(v => {
          const active = view === v.id
          return (
            <button
              key={v.id}
              onClick={() => { onViewChange(v.id); if (isMobile) onMobileClose?.() }}
              className="w-full flex items-center py-1.5 rounded-lg text-xs transition-all"
              style={{
                gap: showExpanded ? 6 : 0,
                justifyContent: showExpanded ? 'flex-start' : 'center',
                paddingLeft: showExpanded ? 8 : 0,
                paddingRight: showExpanded ? 8 : 0,
                backgroundColor: active ? 'var(--t-accent-sub)' : 'transparent',
                color: active ? 'var(--t-accent)' : 'var(--t-text2)',
                fontWeight: active ? 600 : 400,
                borderLeft: showExpanded && active ? '2px solid var(--t-accent)' : '2px solid transparent',
              }}
              title={v.label}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--t-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
            >
              {v.icon}
              {showExpanded && <span style={{ whiteSpace: 'nowrap' }}>{v.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Branches */}
      <div className="px-2 pt-2.5 border-t flex-1 overflow-y-auto mt-1.5" style={{ borderColor: 'var(--t-border)' }}>
        <div className="flex items-center justify-between px-2 mb-1.5">
          {showExpanded && (
            <p style={{ color: 'var(--t-text4)', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              Branches
            </p>
          )}
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
                if (isMobile) onMobileClose?.()
              }}
              className="w-full flex items-center py-1 rounded-lg text-xs transition-all mb-0.5"
              style={{
                gap: showExpanded ? 6 : 0,
                justifyContent: showExpanded ? 'flex-start' : 'center',
                paddingLeft: showExpanded ? 8 : 0,
                paddingRight: showExpanded ? 8 : 0,
                backgroundColor: active ? 'var(--t-accent-sub)' : 'transparent',
                color: active ? 'var(--t-accent)' : 'var(--t-text2)',
                fontWeight: active ? 600 : 400,
                borderLeft: showExpanded && active ? '2px solid var(--t-accent)' : '2px solid transparent',
              }}
              title={b ?? 'All'}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--t-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
            >
              <BranchDot name={b} />
              {showExpanded && <span style={{ whiteSpace: 'nowrap' }}>{b ?? 'All'}</span>}
            </button>
          )
        })}
      </div>

      {/* Sign out */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--t-border)' }}>
        <button
          onClick={onSignOut}
          className="w-full flex items-center py-1.5 rounded-lg text-xs transition-all text-red-500 hover:bg-red-500/10"
          style={{ gap: showExpanded ? 6 : 0, justifyContent: showExpanded ? 'flex-start' : 'center', paddingLeft: showExpanded ? 8 : 0 }}
          title="Sign Out"
        >
          <LogOut size={13} />
          {showExpanded && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(35,42,46,0.4)' }}
            onClick={onMobileClose}
          />
        )}
        {/* Slide-in panel */}
        <div
          className="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden"
          style={{
            width: mobileOpen ? 220 : 0,
            transition: 'width 0.2s ease',
            backgroundColor: 'var(--t-elevated)',
            borderRight: '1px solid var(--t-border)',
          }}
        >
          {mobileOpen && inner}
        </div>
      </>
    )
  }

  return (
    <aside
      className="shrink-0 flex flex-col h-screen sticky top-0 border-r overflow-hidden"
      style={{
        width: expanded ? 168 : 44,
        transition: 'width 0.2s ease',
        backgroundColor: 'var(--t-elevated)',
        borderColor: 'var(--t-border)',
      }}
    >
      {inner}
    </aside>
  )
}
