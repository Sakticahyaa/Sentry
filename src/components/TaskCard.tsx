import { useState } from 'react'
import { GripVertical, Pencil, Trash2, Clock, Calendar } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types/task'
import { BranchBadge, PriorityBadge } from './ui/Badge'
import { Modal } from './ui/Modal'
import { TaskForm } from './TaskForm'
import { differenceInCalendarDays, parseISO } from 'date-fns'

interface TaskCardProps {
  task: Task
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCycle?: (task: Task) => Promise<void>
  isDraggable?: boolean
}

export function TaskCard({ task, onEdit, onDelete, isDraggable = true }: TaskCardProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const deadlineDays = task.deadline
    ? differenceInCalendarDays(parseISO(task.deadline), new Date())
    : null

  const deadlineLabel = () => {
    if (deadlineDays === null) return null
    if (deadlineDays < 0)  return { text: `${Math.abs(deadlineDays)}d overdue`, cls: 'text-red-500' }
    if (deadlineDays === 0) return { text: 'Today',    cls: 'text-orange-500' }
    if (deadlineDays === 1) return { text: 'Tomorrow', cls: 'text-amber-500' }
    return { text: `${deadlineDays}d left`, cls: '' }
  }

  const dl = deadlineLabel()

  const handleEdit = async (updates: Partial<Task>) => {
    await onEdit(task.id, updates)
    setEditing(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(task.id)
    setDeleting(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...style }}
        className={`card p-3 group transition-all hover:shadow-sm ${task.status === 'Done' ? 'opacity-55' : ''}`}
      >
        <div className="flex items-start gap-2">
          {isDraggable && (
            <div
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing shrink-0"
              style={{ color: 'var(--t-text4)' }}
            >
              <GripVertical size={14} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium leading-snug line-clamp-2 ${task.status === 'Done' ? 'line-through' : ''}`}
              style={{ color: task.status === 'Done' ? 'var(--t-text3)' : 'var(--t-text)' }}
            >
              {task.title}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <PriorityBadge priority={task.priority} />
              {task.branch && <BranchBadge branch={task.branch} />}
              {task.time_block && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--t-hover)', color: 'var(--t-text3)' }}
                >
                  {task.time_block}
                </span>
              )}
              {task.estimated_time && (
                <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--t-text3)' }}>
                  <Clock size={10} /> {task.estimated_time}h
                </span>
              )}
              {dl && (
                <span className={`flex items-center gap-0.5 text-xs ${dl.cls}`} style={!dl.cls ? { color: 'var(--t-text3)' } : {}}>
                  <Calendar size={10} /> {dl.text}
                </span>
              )}
            </div>

            {task.notes && (
              <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--t-text4)' }}>{task.notes}</p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => setEditing(true)} className="btn-ghost p-1">
              <Pencil size={12} />
            </button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger p-1">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Task">
        <TaskForm
          initial={task}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
          submitLabel="Update"
        />
      </Modal>
    </>
  )
}
