import { ChevronLeft, ChevronRight, Calendar, LogOut } from 'lucide-react'
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
  onSignOut: () => void
  backlogCount: number
}

export function TopBar({
  colCount, setColCount, view, setView,
  startDate, setStartDate, onBacklog, onSignOut, backlogCount,
}: TopBarProps) {

  const step = colCount === 7 ? 7 : colCount
  const prev = () => setStartDate(addDays(startDate, -step))
  const next = () => setStartDate(addDays(startDate, step))

  const dateLabel = () => {
    if (colCount === 1) return format(startDate, 'MMMM d, yyyy')
    const end = addDays(startDate, colCount - 1)
    return `${format(startDate, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
  }

  return (
    <div
      className="flex items-center gap-3 px-5 shrink-0"
      style={{
        height: 52,
        borderBottom: '1px solid #cbd3d6',
        background: '#ffffff',
      }}
    >
      {/* Nav arrows */}
      {view === 'columns' && (
        <div className="flex items-center gap-1">
          <button onClick={prev} className="btn-ghost px-1.5 py-1">
            <ChevronLeft size={15} />
          </button>
          <button onClick={next} className="btn-ghost px-1.5 py-1">
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Date label */}
      {view === 'columns' && (
        <span className="text-sm font-medium" style={{ color: '#232a2e', minWidth: 180 }}>
          {dateLabel()}
        </span>
      )}

      {view === 'calendar' && (
        <span className="text-sm font-medium" style={{ color: '#232a2e' }}>Calendar</span>
      )}

      <div className="flex-1" />

      {/* Col count pills */}
      {view === 'columns' && (
        <div className="flex items-center gap-1">
          {([1, 3, 7] as ColCount[]).map(n => (
            <button
              key={n}
              onClick={() => setColCount(n)}
              className={`pill ${colCount === n ? 'active' : ''}`}
            >
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
        <button
          onClick={() => setStartDate(new Date())}
          className="btn-ghost text-xs px-2 py-1"
        >
          Today
        </button>
      )}

      {/* Backlog */}
      <button
        onClick={onBacklog}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded transition-all"
        style={{
          color: '#232a2e',
          border: '1px solid #cbd3d6',
        }}
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

      {/* Sign out */}
      <button onClick={onSignOut} className="btn-ghost px-2 py-1" title="Sign out">
        <LogOut size={14} />
      </button>
    </div>
  )
}
