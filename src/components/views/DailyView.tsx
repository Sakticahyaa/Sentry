import { useState, useMemo } from 'react'
import { format, addDays, subDays, parseISO, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import type { Task } from '../../types/task'
import { TaskCard } from '../TaskCard'
import { Modal } from '../ui/Modal'
import { TaskForm } from '../TaskForm'
import { reorderTasks } from '../../lib/supabase'

interface DailyViewProps {
  tasks: Task[]
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: (data: Partial<Task>) => Promise<void>
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

export function DailyView({ tasks, onEdit, onDelete, onAdd, setTasks }: DailyViewProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [adding, setAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const dayTasks = useMemo(() =>
    tasks
      .filter(t => t.assigned_date === date)
      .sort((a, b) => {
        const aDone = a.status === 'Done' ? 1 : 0
        const bDone = b.status === 'Done' ? 1 : 0
        if (aDone !== bDone) return aDone - bDone
        return a.order - b.order
      }),
    [tasks, date]
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const ids = dayTasks.map(t => t.id)
    const reordered = arrayMove(dayTasks, ids.indexOf(active.id as string), ids.indexOf(over.id as string))

    setTasks(prev => {
      const others = prev.filter(t => t.assigned_date !== date)
      return [...others, ...reordered.map((t, i) => ({ ...t, order: i }))]
    })
    await reorderTasks(reordered.map((t, i) => ({ id: t.id, order: i })))
  }

  const isCurrentDay = isToday(parseISO(date))

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Date nav */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))} className="btn-ghost p-1.5">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 text-center relative">
          <label className="cursor-pointer">
            <span className="font-semibold text-base" style={{ color: 'var(--t-text)' }}>
              {format(parseISO(date), 'EEEE, d MMMM yyyy')}
            </span>
            {isCurrentDay && (
              <span className="ml-2 text-xs font-medium" style={{ color: 'var(--t-accent)' }}>Today</span>
            )}
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </label>
        </div>
        <button onClick={() => setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'))} className="btn-ghost p-1.5">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mb-4">
        <span className="text-xs" style={{ color: 'var(--t-text3)' }}>{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Task list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {dayTasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {dayTasks.length === 0 && (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--t-text4)' }}>
          No tasks for this day
        </div>
      )}

      {/* Quick add */}
      <button
        onClick={() => setAdding(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed text-sm transition-all"
        style={{ borderColor: 'var(--t-border)', color: 'var(--t-text4)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--t-text3)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text4)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--t-border)' }}
      >
        <Plus size={14} /> Add task
      </button>

      <Modal open={adding} onClose={() => setAdding(false)} title="New Task">
        <TaskForm
          initial={{ assigned_date: date }}
          onSubmit={async data => { await onAdd(data); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </div>
  )
}
