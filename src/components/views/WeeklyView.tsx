import { useState, useMemo } from 'react'
import { format, startOfWeek, addDays, parseISO, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, AlertTriangle, Clock } from 'lucide-react'
import type { Task } from '../../types/task'
import { BranchBadge, PriorityBadge } from '../ui/Badge'
import { OVERCOMMIT_HOURS } from '../../constants/timeblocks'
import { BRANCH_COLORS } from '../../constants/branches'

interface WeeklyViewProps {
  tasks: Task[]
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onCycle: (task: Task) => Promise<void>
}

export function WeeklyView({ tasks, onEdit, onCycle }: WeeklyViewProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd')
      map.set(key, tasks.filter(t => t.assigned_date === key).sort((a, b) => a.order - b.order))
    }
    return map
  }, [tasks, days])

  const handleDrop = async (taskId: string, newDate: string) => {
    await onEdit(taskId, { assigned_date: newDate })
  }

  return (
    <div className="p-4">
      {/* Week nav */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setWeekStart(d => addDays(d, -7))} className="btn-ghost p-1.5">
          <ChevronLeft size={16} />
        </button>
        <span className="flex-1 text-center text-sm font-semibold" style={{ color: 'var(--t-text)' }}>
          {format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <button onClick={() => setWeekStart(d => addDays(d, 7))} className="btn-ghost p-1.5">
          <ChevronRight size={16} />
        </button>
        <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="btn-ghost text-xs">
          This week
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2 min-h-[60vh]">
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayTasks = tasksByDay.get(key) ?? []
          const totalHours = dayTasks.reduce((s, t) => s + (t.estimated_time ?? 0), 0)
          const over = totalHours > OVERCOMMIT_HOURS
          const today = isToday(day)

          return (
            <div
              key={key}
              className="rounded-xl border p-2 flex flex-col gap-1.5 min-h-[200px]"
              style={{
                backgroundColor: 'var(--t-card)',
                borderColor: today ? 'var(--t-accent)' : 'var(--t-border)',
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const tid = e.dataTransfer.getData('taskId'); if (tid) handleDrop(tid, key) }}
            >
              {/* Day header */}
              <div
                className="text-center mb-1 pb-1 border-b"
                style={{ borderColor: 'var(--t-border)', color: today ? 'var(--t-accent)' : 'var(--t-text3)' }}
              >
                <div className="text-xs font-semibold uppercase">{format(day, 'EEE')}</div>
                <div className="text-lg font-bold" style={{ color: today ? 'var(--t-accent)' : 'var(--t-text)' }}>
                  {format(day, 'd')}
                </div>
                <div className="flex items-center justify-center gap-0.5 text-xs" style={{ color: over ? '#ef4444' : 'var(--t-text4)' }}>
                  <Clock size={9} /> {totalHours.toFixed(1)}h
                  {over && <AlertTriangle size={9} className="ml-0.5" />}
                </div>
              </div>

              {/* Tasks */}
              {dayTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
                  onClick={() => onCycle(task)}
                  className={`p-1.5 rounded-lg border cursor-pointer text-xs transition-all hover:opacity-75 ${task.status === 'Done' ? 'opacity-40 line-through' : ''}`}
                  style={{
                    borderColor: task.branch ? BRANCH_COLORS[task.branch] + '40' : 'var(--t-border)',
                    backgroundColor: task.branch ? BRANCH_COLORS[task.branch] + '12' : 'var(--t-hover)',
                  }}
                >
                  <div className="flex items-start gap-1">
                    <PriorityBadge priority={task.priority} />
                    <span className="line-clamp-2 flex-1" style={{ color: 'var(--t-text)' }}>{task.title}</span>
                  </div>
                  {task.branch && <div className="mt-1"><BranchBadge branch={task.branch} /></div>}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
