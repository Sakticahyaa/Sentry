import { useState, useMemo } from 'react'
import { format, addDays, subDays, parseISO, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import type { Task, TimeBlock } from '../../types/task'
import { TaskCard } from '../TaskCard'
import { TIME_BLOCKS } from '../../constants/timeblocks'
import { Modal } from '../ui/Modal'
import { TaskForm } from '../TaskForm'
import { reorderTasks } from '../../lib/supabase'

interface DailyViewProps {
  tasks: Task[]
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCycle: (task: Task) => Promise<void>
  onAdd: (data: Partial<Task>) => Promise<void>
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

export function DailyView({ tasks, onEdit, onDelete, onCycle, onAdd, setTasks }: DailyViewProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [groupByBlock, setGroupByBlock] = useState(false)
  const [adding, setAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const BLOCK_ORDER: Record<string, number> = {
    H0: 0, Q1: 1, Q2: 2, H1: 3, Q3: 4, Q4: 5, H2: 6, Q5: 7, Q6: 8, H3: 9,
  }

  const dayTasks = useMemo(() =>
    tasks
      .filter(t => t.assigned_date === date)
      .sort((a, b) => {
        const aBlock = a.time_block != null ? (BLOCK_ORDER[a.time_block] ?? 99) : 99
        const bBlock = b.time_block != null ? (BLOCK_ORDER[b.time_block] ?? 99) : 99
        if (aBlock !== bBlock) return aBlock - bBlock
        if (a.priority !== b.priority) return a.priority - b.priority
        return (a.branch ?? '').localeCompare(b.branch ?? '')
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

  const grouped = useMemo(() => {
    if (!groupByBlock) return null
    const map = new Map<TimeBlock | 'none', Task[]>()
    for (const t of dayTasks) {
      const key = t.time_block ?? 'none'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [dayTasks, groupByBlock])

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

      {/* Group by block toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: 'var(--t-text3)' }}>{dayTasks.length} tasks</span>
        <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--t-text3)' }}>
          <input
            type="checkbox"
            checked={groupByBlock}
            onChange={e => setGroupByBlock(e.target.checked)}
            style={{ accentColor: 'var(--t-accent)' }}
          />
          Group by time block
        </label>
      </div>

      {/* Task list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {!groupByBlock ? (
          <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {dayTasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onCycle={onCycle} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="space-y-6">
            {TIME_BLOCKS.map(block => {
              const blockTasks = grouped?.get(block.value) ?? []
              if (blockTasks.length === 0) return null
              return (
                <div key={block.value}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-text3)' }}>{block.label}</span>
                    <span className="text-xs" style={{ color: 'var(--t-text4)' }}>{block.range}</span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--t-text4)' }}>{blockTasks.length} tasks</span>
                  </div>
                  <SortableContext items={blockTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {blockTasks.map(task => (
                        <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onCycle={onCycle} />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )
            })}
            {(grouped?.get('none') ?? []).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-text4)' }}>No Block</span>
                </div>
                <div className="space-y-2">
                  {(grouped?.get('none') ?? []).map(task => (
                    <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onCycle={onCycle} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
