import { useMemo } from 'react'
import { parseISO, isPast, startOfWeek, startOfMonth, isAfter } from 'date-fns'
import type { Task } from '../../types/task'
import { BRANCHES, BRANCH_COLORS } from '../../constants/branches'

interface AnalyticsViewProps {
  tasks: Task[]
}

export function AnalyticsView({ tasks }: AnalyticsViewProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)

    const overdue = tasks.filter(t =>
      t.deadline && isPast(parseISO(t.deadline)) && t.status !== 'Done'
    ).length

    const doneThisWeek = tasks.filter(t =>
      t.status === 'Done' && t.updated_at && isAfter(parseISO(t.updated_at), weekStart)
    ).length

    const doneThisMonth = tasks.filter(t =>
      t.status === 'Done' && t.updated_at && isAfter(parseISO(t.updated_at), monthStart)
    ).length

    const branchStats = BRANCHES.map(branch => {
      const bt = tasks.filter(t => t.branch === branch)
      const done = bt.filter(t => t.status === 'Done').length
      const pct = bt.length > 0 ? Math.round((done / bt.length) * 100) : 0
      const overdueB = bt.filter(t =>
        t.deadline && isPast(parseISO(t.deadline)) && t.status !== 'Done'
      ).length
      return { branch, total: bt.length, done, pct, overdue: overdueB }
    }).filter(b => b.total > 0)

    return { overdue, doneThisWeek, doneThisMonth, branchStats, total: tasks.length }
  }, [tasks])

  const cards = [
    { label: 'Total Tasks',        value: stats.total,         accent: 'var(--t-text)' },
    { label: 'Done This Week',     value: stats.doneThisWeek,  accent: '#22c55e' },
    { label: 'Done This Month',    value: stats.doneThisMonth, accent: 'var(--t-accent)' },
    { label: 'Overdue',            value: stats.overdue,       accent: stats.overdue > 0 ? '#ef4444' : 'var(--t-text3)' },
  ]

  const statusCounts = {
    'Not Yet': tasks.filter(t => t.status === 'Not Yet').length,
    'Ongoing': tasks.filter(t => t.status === 'Ongoing').length,
    'Done':    tasks.filter(t => t.status === 'Done').length,
  }
  const statusColors: Record<string, string> = {
    'Not Yet': 'var(--t-text3)',
    'Ongoing': 'var(--t-accent)',
    'Done':    '#22c55e',
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--t-text)' }}>Analytics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="card p-4">
            <div className="text-2xl font-bold" style={{ color: c.accent }}>{c.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--t-text3)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Branch completion */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--t-text)' }}>Progress by Branch</h3>
        <div className="space-y-4">
          {stats.branchStats.map(({ branch, total, done, pct, overdue }) => (
            <div key={branch}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRANCH_COLORS[branch] }} />
                  <span className="text-sm" style={{ color: 'var(--t-text)' }}>{branch}</span>
                  {overdue > 0 && (
                    <span className="text-xs text-red-500 bg-red-500/10 px-1 py-0.5 rounded">
                      {overdue} overdue
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--t-text3)' }}>
                  <span>{done}/{total}</span>
                  <span className="font-semibold" style={{ color: BRANCH_COLORS[branch] }}>{pct}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--t-hover)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: BRANCH_COLORS[branch] }}
                />
              </div>
            </div>
          ))}
          {stats.branchStats.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--t-text4)' }}>No data yet</p>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--t-text)' }}>Status Breakdown</h3>
        <div className="flex items-end gap-4 h-28">
          {Object.entries(statusCounts).map(([status, count]) => {
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
            return (
              <div key={status} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-bold" style={{ color: statusColors[status] }}>{count}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(pct, 5)}%`,
                    backgroundColor: statusColors[status],
                    opacity: 0.6,
                  }}
                />
                <span className="text-xs" style={{ color: 'var(--t-text3)' }}>{status}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gold highlight — most loaded day */}
      {stats.total > 0 && (
        <div
          className="card p-4 border-l-4"
          style={{ borderLeftColor: 'var(--t-gold)' }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--t-gold)' }}>✦</span>
            <span className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>
              {stats.overdue === 0
                ? 'All caught up — no overdue tasks!'
                : `${stats.overdue} task${stats.overdue > 1 ? 's' : ''} past deadline`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
