import { useState, useMemo } from 'react'
import { format, addDays, subDays, parseISO, isToday } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, Plus } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import type { Task, TimeBlock } from '../../types/task'
import { TaskCard } from '../TaskCard'
import { TIME_BLOCKS, OVERCOMMIT_HOURS } from '../../constants/timeblocks'
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

  const dayTasks = useMemo(() =>
    tasks.filter(t => t.assigned_date === date)
      .sort((a, b) => a.order - b.order),
    [tasks, date]
  )

  const totalHours = dayTasks.reduce((sum, t) => sum + (t.estimated_time ?? 0), 0)
  const overcommitted = totalHours > OVERCOMMIT_HOURS

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const ids = dayTasks.map(t => t.id)
    const oldIdx = ids.indexOf(active.id as string)
    const newIdx = ids.indexOf(over.id as string)
    const reordered = arrayMove(dayTasks, oldIdx, newIdx)

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

  const dateObj = parseISO(date)
  const isCurrentDay = isToday(dateObj)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Date nav */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd'))} className="btn-ghost p-1.5">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 text-center">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-transparent text-gray-100 font-semibold text-base cursor-pointer outline-none"
          />
          {isCurrentDay && <span className="ml-2 text-xs text-blue-400">Hari ini</span>}
        </div>
        <button onClick={() => setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd'))} className="btn-ghost p-1.5">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Summary bar */}
      <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl border ${overcommitted ? 'border-red-500/40 bg-red-950/20' : 'border-gray-800 bg-gray-900'}`}>
        <Clock size={14} className={overcommitted ? 'text-red-400' : 'text-gray-500'} />
        <span className="text-sm text-gray-400">
          Total: <span className={`font-semibold ${overcommitted ? 'text-red-400' : 'text-gray-100'}`}>{totalHours.toFixed(1)} jam</span>
        </span>
        <span className="text-gray-700">·</span>
        <span className="text-sm text-gray-500">{dayTasks.length} tugas</span>
        {overcommitted && (
          <span className="flex items-center gap-1 text-xs text-red-400 ml-auto">
            <AlertTriangle size={12} /> Overcommit! Max {OVERCOMMIT_HOURS}j
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={groupByBlock}
              onChange={e => setGroupByBlock(e.target.checked)}
              className="accent-blue-500"
            />
            Kelompok blok waktu
          </label>
        </div>
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
                    <span className="text-xs font-bold text-gray-500 uppercase">{block.label}</span>
                    <span className="text-xs text-gray-700">{block.range}</span>
                    <span className="text-xs text-gray-700 ml-auto">{blockTasks.length} tugas</span>
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
                  <span className="text-xs font-bold text-gray-600 uppercase">Tanpa Blok</span>
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
        <div className="text-center py-16 text-gray-700">
          <p className="text-sm">Tidak ada tugas untuk hari ini</p>
        </div>
      )}

      {/* Quick add */}
      <button
        onClick={() => setAdding(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-800 text-gray-700 hover:text-gray-400 hover:border-gray-700 transition-all text-sm"
      >
        <Plus size={14} /> Tambah tugas
      </button>

      <Modal open={adding} onClose={() => setAdding(false)} title="Tugas Baru">
        <TaskForm
          initial={{ assigned_date: date }}
          onSubmit={async data => { await onAdd(data); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </div>
  )
}
