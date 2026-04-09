import { useState } from 'react'
import { format, addDays, isToday } from 'date-fns'
import { Plus } from 'lucide-react'
import type { Task } from '../types/task'
import { TaskRow } from './TaskRow'
import { Modal } from './ui/Modal'
import { TaskForm } from './TaskForm'
import { buildDisplayIds } from '../lib/displayId'

interface TeuxViewProps {
  colCount: 1 | 3 | 7
  startDate: Date
  tasks: Task[]
  onToggleDone: (task: Task) => Promise<void>
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: (data: Partial<Task>) => Promise<void>
}

const BLOCK_ORDER: Record<string, number> = {
  H0: 0, Q1: 1, Q2: 2, H1: 3, Q3: 4, Q4: 5, H2: 6, Q5: 7, Q6: 8, H3: 9,
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === 'Done' ? 1 : 0
    const bDone = b.status === 'Done' ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    const aOrd = a.time_block != null ? (BLOCK_ORDER[a.time_block] ?? 10) : 10
    const bOrd = b.time_block != null ? (BLOCK_ORDER[b.time_block] ?? 10) : 10
    if (aOrd !== bOrd) return aOrd - bOrd
    return a.priority - b.priority
  })
}

interface DayColumnProps {
  date: Date
  tasks: Task[]
  displayIds: Map<string, string>
  onToggleDone: (task: Task) => Promise<void>
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: (date: string) => void
  isLast: boolean
}

function DayColumn({ date, tasks, displayIds, onToggleDone, onEdit, onDelete, onAdd, isLast }: DayColumnProps) {
  const key = format(date, 'yyyy-MM-dd')
  const dayTasks = sortTasks(tasks.filter(t => t.assigned_date === key))
  const today = isToday(date)

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ minWidth: 0 }}
    >
      {/* Day header */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div
          className="text-xs font-semibold uppercase tracking-widest truncate"
          style={{ color: today ? '#000000' : '#232a2e' }}
        >
          {format(date, 'EEEE')}
        </div>
        <div
          className="text-2xl font-bold leading-tight"
          style={{ color: today ? '#000000' : '#232a2e' }}
        >
          {format(date, 'd')}
        </div>
        <div className="text-xs truncate" style={{ color: '#8a9499' }}>
          {format(date, 'MMMM yyyy')}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 px-3 pt-2">
        {dayTasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            displayId={displayIds.get(task.id) ?? '—'}
            onToggleDone={onToggleDone}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {/* Add button */}
        <button
          onClick={() => onAdd(key)}
          className="flex items-center gap-1 w-full py-1.5 mt-1 text-xs transition-colors"
          style={{ color: '#cbd3d6' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#8a9499')}
          onMouseLeave={e => (e.currentTarget.style.color = '#cbd3d6')}
        >
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  )
}

export function TeuxView({ colCount, startDate, tasks, onToggleDone, onEdit, onDelete, onAdd }: TeuxViewProps) {
  const [addingDate, setAddingDate] = useState<string | null>(null)
  const displayIds = buildDisplayIds(tasks)

  const days = Array.from({ length: colCount }, (_, i) => addDays(startDate, i))

  return (
    <div className="flex-1 overflow-auto" style={{ height: 'calc(100vh - 52px)' }}>
      <div
        className="grid h-full"
        style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
      >
        {days.map((day, i) => (
          <DayColumn
            key={format(day, 'yyyy-MM-dd')}
            date={day}
            tasks={tasks}
            displayIds={displayIds}
            onToggleDone={onToggleDone}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdd={(date) => setAddingDate(date)}
            isLast={i === days.length - 1}
          />
        ))}
      </div>

      <Modal open={!!addingDate} onClose={() => setAddingDate(null)} title="New Task">
        <TaskForm
          initial={{ assigned_date: addingDate ?? undefined }}
          onSubmit={async data => { await onAdd(data); setAddingDate(null) }}
          onCancel={() => setAddingDate(null)}
        />
      </Modal>
    </div>
  )
}
