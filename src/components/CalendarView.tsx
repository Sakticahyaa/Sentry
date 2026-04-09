import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, addDays,
  isSameMonth, isToday, parseISO
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '../types/task'
import { BRANCH_COLORS } from '../constants/branches'

interface CalendarViewProps {
  tasks: Task[]
  onDayClick: (date: string) => void
}

export function CalendarView({ tasks, onDayClick }: CalendarViewProps) {
  const [month, setMonth] = useState(new Date())

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfMonth(month)
  const days: Date[] = []
  let cur = start
  while (cur <= end || days.length % 7 !== 0 || days.length < 35) {
    days.push(cur)
    cur = addDays(cur, 1)
    if (cur > end && days.length % 7 === 0) break
  }

  const tasksByDay = new Map<string, Task[]>()
  for (const task of tasks) {
    if (!task.assigned_date) continue
    const existing = tasksByDay.get(task.assigned_date) ?? []
    tasksByDay.set(task.assigned_date, [...existing, task])
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Month nav */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))}
          className="btn-ghost p-1"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-base font-semibold" style={{ color: '#232a2e', minWidth: 140, textAlign: 'center' }}>
          {format(month, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))}
          className="btn-ghost p-1"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => setMonth(new Date())}
          className="btn-ghost text-xs"
        >
          Today
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px" style={{ border: '1px solid #cbd3d6', borderRadius: 8, overflow: 'hidden' }}>
        {/* Week headers */}
        {weekDays.map(d => (
          <div
            key={d}
            className="text-xs font-semibold uppercase tracking-wider text-center py-2"
            style={{ background: '#f4f6f7', color: '#8a9499' }}
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayTasks = tasksByDay.get(key) ?? []
          const inMonth = isSameMonth(day, month)
          const today = isToday(day)

          return (
            <div
              key={i}
              onClick={() => onDayClick(key)}
              className="cursor-pointer transition-colors"
              style={{
                minHeight: 80,
                background: today ? '#f4f6f7' : '#ffffff',
                padding: '6px 8px',
                opacity: inMonth ? 1 : 0.35,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f4f6f7')}
              onMouseLeave={e => (e.currentTarget.style.background = today ? '#f4f6f7' : '#ffffff')}
            >
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: today ? '#232a2e' : '#8a9499' }}
              >
                {format(day, 'd')}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-1 text-xs truncate"
                    style={{ color: task.status === 'Done' ? '#cbd3d6' : '#232a2e' }}
                  >
                    <span
                      style={{
                        width: 3,
                        height: 10,
                        borderRadius: 3,
                        backgroundColor: task.branch ? BRANCH_COLORS[task.branch] : '#cbd3d6',
                        flexShrink: 0,
                      }}
                    />
                    <span className="truncate" style={{ textDecoration: task.status === 'Done' ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs" style={{ color: '#cbd3d6' }}>
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
