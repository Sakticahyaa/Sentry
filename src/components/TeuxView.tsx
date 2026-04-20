import { useState } from 'react'
import { format, addDays, isToday } from 'date-fns'
import { Plus } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
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
  onReorder: (updates: { id: string; order: number }[]) => Promise<void>
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === 'Done' ? 1 : 0
    const bDone = b.status === 'Done' ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    return a.order - b.order
  })
}

interface DayColumnProps {
  date: Date
  tasks: Task[]
  displayIds: Map<string, string>
  hoverable?: boolean
  onToggleDone: (task: Task) => Promise<void>
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: (date: string) => void
  onReorder: (updates: { id: string; order: number }[]) => Promise<void>
}

function DayColumn({ date, tasks, displayIds, hoverable, onToggleDone, onEdit, onDelete, onAdd, onReorder }: DayColumnProps) {
  const key = format(date, 'yyyy-MM-dd')
  const dayTasks = sortTasks(tasks.filter(t => t.assigned_date === key))
  const today = isToday(date)
  const [hovered, setHovered] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = dayTasks.findIndex(t => t.id === active.id)
    const newIdx = dayTasks.findIndex(t => t.id === over.id)
    const reordered = arrayMove(dayTasks, oldIdx, newIdx)
    await onReorder(reordered.map((t, i) => ({ id: t.id, order: i })))
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{
        minWidth: 0,
        transition: 'background-color 0.15s ease',
        backgroundColor: hoverable && hovered ? 'rgba(35,42,46,0.025)' : 'transparent',
      }}
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
    >
      {/* Day header */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div
          className="text-xs font-semibold uppercase tracking-widest truncate"
          style={{ color: today ? '#C9A84C' : '#232a2e' }}
        >
          {format(date, 'EEEE')}
        </div>
        <div
          className="text-2xl font-bold leading-tight"
          style={{ color: today ? '#C9A84C' : '#232a2e' }}
        >
          {format(date, 'd')}
        </div>
        <div className="text-xs truncate" style={{ color: '#8a9499' }}>
          {format(date, 'MMMM yyyy')}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 pt-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
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
          </SortableContext>
        </DndContext>

        <button
          onClick={() => onAdd(key)}
          className="flex items-center gap-1 w-full py-2.5 mt-1 text-xs transition-colors"
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

export function TeuxView({ colCount, startDate, tasks, onToggleDone, onEdit, onDelete, onAdd, onReorder }: TeuxViewProps) {
  const [addingDate, setAddingDate] = useState<string | null>(null)
  const displayIds = buildDisplayIds(tasks)

  const days = Array.from({ length: colCount }, (_, i) => addDays(startDate, i))

  const dayColumns = days.map(day => (
    <DayColumn
      key={format(day, 'yyyy-MM-dd')}
      date={day}
      tasks={tasks}
      displayIds={displayIds}
      hoverable={colCount === 3}
      onToggleDone={onToggleDone}
      onEdit={onEdit}
      onDelete={onDelete}
      onAdd={date => setAddingDate(date)}
      onReorder={onReorder}
    />
  ))

  return (
    <div className="flex-1 overflow-auto" style={{ height: 'calc(100vh - 52px)' }}>
      <div
        className="grid h-full"
        style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
      >
        {dayColumns}
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
