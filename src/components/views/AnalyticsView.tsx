import { useMemo } from 'react'
import { parseISO, isPast, startOfWeek, startOfMonth, isAfter, isBefore } from 'date-fns'
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
      t.status === 'Done' &&
      t.updated_at &&
      isAfter(parseISO(t.updated_at), weekStart)
    ).length

    const doneThisMonth = tasks.filter(t =>
      t.status === 'Done' &&
      t.updated_at &&
      isAfter(parseISO(t.updated_at), monthStart)
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
    { label: 'Total Tugas', value: stats.total, color: 'text-gray-100' },
    { label: 'Selesai Minggu Ini', value: stats.doneThisWeek, color: 'text-green-400' },
    { label: 'Selesai Bulan Ini', value: stats.doneThisMonth, color: 'text-blue-400' },
    { label: 'Terlambat', value: stats.overdue, color: stats.overdue > 0 ? 'text-red-400' : 'text-gray-400' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold text-gray-100">Analitik</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="card p-4">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Branch completion */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Progres per Branch</h3>
        <div className="space-y-4">
          {stats.branchStats.map(({ branch, total, done, pct, overdue }) => (
            <div key={branch}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: BRANCH_COLORS[branch] }}
                  />
                  <span className="text-sm text-gray-300">{branch}</span>
                  {overdue > 0 && (
                    <span className="text-xs text-red-400 bg-red-950 px-1 py-0.5 rounded">
                      {overdue} terlambat
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{done}/{total}</span>
                  <span className="font-semibold" style={{ color: BRANCH_COLORS[branch] }}>{pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: BRANCH_COLORS[branch] }}
                />
              </div>
            </div>
          ))}
          {stats.branchStats.length === 0 && (
            <p className="text-sm text-gray-700 text-center py-4">Belum ada data</p>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Breakdown Status</h3>
        {(() => {
          const statusCounts = {
            'Not Yet': tasks.filter(t => t.status === 'Not Yet').length,
            'Ongoing': tasks.filter(t => t.status === 'Ongoing').length,
            'Done': tasks.filter(t => t.status === 'Done').length,
          }
          const entries = Object.entries(statusCounts)
          const colors: Record<string, string> = {
            'Not Yet': '#6B7280',
            'Ongoing': '#3498DB',
            'Done': '#1ABC9C',
          }
          const labels: Record<string, string> = {
            'Not Yet': 'Belum',
            'Ongoing': 'Sedang',
            'Done': 'Selesai',
          }
          return (
            <div className="flex items-end gap-3 h-24">
              {entries.map(([status, count]) => {
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
                return (
                  <div key={status} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-bold" style={{ color: colors[status] }}>{count}</span>
                    <div className="w-full rounded-t-md transition-all" style={{
                      height: `${Math.max(pct, 4)}%`,
                      backgroundColor: colors[status] + '50',
                      border: `1px solid ${colors[status]}40`,
                    }} />
                    <span className="text-xs text-gray-600">{labels[status]}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
