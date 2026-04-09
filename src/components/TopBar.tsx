import { ChevronLeft, ChevronRight, Calendar, LogOut, GitBranch, Sun, Moon } from 'lucide-react'
import { format, addDays } from 'date-fns'

type ColCount = 1 | 3 | 7
type ViewMode = 'columns' | 'calendar'

interface TopBarProps {
  colCount: ColCount
  setColCount: (n: ColCount) => void
  view: ViewMode
  setView: (v: ViewMode) => void
  startDate: Date
  setStartDate: (d: Date) => void
  onBacklog: () => void
  onBranches: () => void
  onSignOut: () => void
  backlogCount: number
  onLegacy: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded transition-all"
      style={{ color: '#232a2e', border: '1px solid #cbd3d6' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#232a2e')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd3d6')}
    >
      {label}
    </button>
  )
}

export function TopBar({
  colCount, setColCount, view, setView,
  startDate, setStartDate, onBacklog, onBranches, onSignOut, backlogCount, onLegacy,
  theme, onToggleTheme,
}: TopBarProps) {
  const step = colCount === 7 ? 7 : colCount
  const prev = () => setStartDate(addDays(startDate, -step))
  const next = () => setStartDate(addDays(startDate, step))

  const dateLabel = () => {
    if (colCount === 1) return format(startDate, 'EEEE, MMMM d, yyyy')
    const end = addDays(startDate, colCount - 1)
    return `${format(startDate, 'MMMM d')} – ${format(end, 'MMMM d, yyyy')}`
  }

  return (
    <div
      className="flex items-center gap-2 px-5 shrink-0"
      style={{ height: 52, borderBottom: '1px solid #cbd3d6', background: '#ffffff' }}
    >
      {/* Nav arrows */}
      {view === 'columns' && (
        <div className="flex items-center gap-0.5">
          <button onClick={prev} className="btn-ghost px-1.5 py-1"><ChevronLeft size={15} /></button>
          <button onClick={next} className="btn-ghost px-1.5 py-1"><ChevronRight size={15} /></button>
        </div>
      )}

      {/* Date label */}
      <span className="text-sm font-medium" style={{ color: '#232a2e', minWidth: 160 }}>
        {view === 'columns' ? dateLabel() : 'Calendar'}
      </span>

      <div className="flex-1" />

      {/* Col pills */}
      {view === 'columns' && (
        <div className="flex items-center gap-1">
          {([1, 3, 7] as ColCount[]).map(n => (
            <button key={n} onClick={() => setColCount(n)} className={`pill ${colCount === n ? 'active' : ''}`}>
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Calendar toggle */}
      <button
        onClick={() => setView(view === 'calendar' ? 'columns' : 'calendar')}
        className={`pill ${view === 'calendar' ? 'active' : ''}`}
        title="Calendar view"
      >
        <Calendar size={13} />
      </button>

      {/* Today */}
      {view === 'columns' && (
        <button onClick={() => setStartDate(new Date())} className="btn-ghost text-xs px-2 py-1">
          Today
        </button>
      )}

      <div className="w-px h-4 shrink-0" style={{ background: '#cbd3d6' }} />

      {/* Branches */}
      <button
        onClick={onBranches}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded transition-all"
        style={{ color: '#232a2e', border: '1px solid #cbd3d6' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#232a2e')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd3d6')}
      >
        <GitBranch size={12} /> Branches
      </button>

      {/* Backlog */}
      <button
        onClick={onBacklog}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded transition-all"
        style={{ color: '#232a2e', border: '1px solid #cbd3d6' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#232a2e')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd3d6')}
      >
        Backlog
        {backlogCount > 0 && (
          <span
            className="inline-flex items-center justify-center rounded-full text-white"
            style={{ width: 16, height: 16, fontSize: 10, background: '#232a2e' }}
          >
            {backlogCount}
          </span>
        )}
      </button>

      <button
        onClick={onLegacy}
        className="btn-ghost text-xs px-2 py-1"
        title="Switch to legacy view"
      >
        Legacy
      </button>

      <button onClick={onToggleTheme} className="btn-ghost px-2 py-1" title="Toggle theme">
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      <button onClick={onSignOut} className="btn-ghost px-2 py-1" title="Sign out">
        <LogOut size={14} />
      </button>
    </div>
  )
}
