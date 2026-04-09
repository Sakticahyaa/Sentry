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
  onToday: () => void
}

export function TopBar({
  colCount, setColCount, view, setView,
  startDate, setStartDate, onBacklog, onBranches, onSignOut, backlogCount, onLegacy,
  theme, onToggleTheme, onToday,
}: TopBarProps) {
  const step = colCount === 7 ? 7 : 1
  const prev = () => setStartDate(addDays(startDate, -step))
  const next = () => setStartDate(addDays(startDate, step))

  const dateLabel = () => {
    if (colCount === 1) return format(startDate, 'EEE, MMM d')
    const end = addDays(startDate, colCount - 1)
    return `${format(startDate, 'MMM d')} – ${format(end, 'MMM d')}`
  }

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{ borderBottom: '1px solid #cbd3d6', background: '#ffffff' }}
    >
      {/* Brand — own row on narrow screens, inline on wide */}
      <div className="flex items-center justify-center lg:hidden" style={{ height: 30, borderBottom: '1px solid #f0f2f3' }}>
        <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#232a2e' }}>
          Sentry
        </span>
      </div>

    <div className="relative flex items-center gap-1.5 px-3 sm:px-5" style={{ height: 52 }}>
      {/* Brand — centered inline on wide screens only */}
      <span
        className="hidden lg:block absolute left-1/2 -translate-x-1/2 text-xs font-bold tracking-[0.2em] uppercase pointer-events-none"
        style={{ color: '#232a2e' }}
      >
        Sentry
      </span>

      {/* Nav arrows */}
      {view === 'columns' && (
        <div className="flex items-center gap-0.5">
          <button onClick={prev} className="btn-ghost px-1.5 py-1"><ChevronLeft size={15} /></button>
          <button onClick={next} className="btn-ghost px-1.5 py-1"><ChevronRight size={15} /></button>
        </div>
      )}

      {/* Date label */}
      <span className="text-xs sm:text-sm font-medium" style={{ color: '#232a2e' }}>
        {view === 'columns' ? dateLabel() : 'Calendar'}
      </span>

      <div className="flex-1" />

      {/* Col pills — hidden on mobile */}
      {view === 'columns' && (
        <div className="hidden sm:flex items-center gap-1">
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

      {/* Today — hidden on mobile */}
      {view === 'columns' && (
        <button onClick={onToday} className="hidden sm:block btn-ghost text-xs px-2 py-1">
          Today
        </button>
      )}

      <div className="hidden sm:block w-px h-4 shrink-0" style={{ background: '#cbd3d6' }} />

      {/* Branches — icon only on mobile */}
      <button
        onClick={onBranches}
        className="flex items-center gap-1.5 text-xs font-medium px-2 sm:px-2.5 py-1 rounded transition-all"
        style={{ color: '#232a2e', border: '1px solid #cbd3d6' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#232a2e')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd3d6')}
        title="Branches"
      >
        <GitBranch size={12} />
        <span className="hidden sm:inline">Branches</span>
      </button>

      {/* Backlog */}
      <button
        onClick={onBacklog}
        className="flex items-center gap-1.5 text-xs font-medium px-2 sm:px-2.5 py-1 rounded transition-all"
        style={{ color: '#232a2e', border: '1px solid #cbd3d6' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#232a2e')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd3d6')}
      >
        <span className="hidden sm:inline">Backlog</span>
        {backlogCount > 0 && (
          <span
            className="inline-flex items-center justify-center rounded-full text-white"
            style={{ width: 16, height: 16, fontSize: 10, background: '#232a2e' }}
          >
            {backlogCount}
          </span>
        )}
      </button>

      {/* Legacy — hidden on mobile */}
      <button onClick={onLegacy} className="hidden sm:block btn-ghost text-xs px-2 py-1">
        Legacy
      </button>

      <button onClick={onToggleTheme} className="btn-ghost px-2 py-1" title="Toggle theme">
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      <button onClick={onSignOut} className="btn-ghost px-2 py-1" title="Sign out">
        <LogOut size={14} />
      </button>
    </div>
    </div>
  )
}
