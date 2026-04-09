import { useState } from 'react'
import { GripVertical, Pencil, Trash2, Clock, Calendar, CheckCircle2, Circle, Timer } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types/task'
import { BranchBadge, PriorityBadge } from './ui/Badge'
import { Modal } from './ui/Modal'
import { TaskForm } from './TaskForm'
import { differenceInCalendarDays, parseISO, format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCycle: (task: Task) => Promise<void>
  isDraggable?: boolean
}

export function TaskCard({ task, onEdit, onDelete, onCycle, isDraggable = true }: TaskCardProps) {
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
    if (deadlineDays < 0) return { text: `${Math.abs(deadlineDays)}h lalu`, cls: 'text-red-400' }
    if (deadlineDays === 0) return { text: 'Hari ini', cls: 'text-orange-400' }
    if (deadlineDays === 1) return { text: 'Besok', cls: 'text-yellow-400' }
    return { text: `${deadlineDays}h lagi`, cls: 'text-gray-500' }
  }

  const dl = deadlineLabel()

  const statusIcon = () => {
    if (task.status === 'Done') return <CheckCircle2 size={16} className="text-green-400" />
    if (task.status === 'Ongoing') return <Timer size={16} className="text-blue-400" />
    return <Circle size={16} className="text-gray-600" />
  }

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
        style={style}
        className={`card p-3 group hover:border-gray-700 transition-all ${task.status === 'Done' ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          {isDraggable && (
            <div
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-700 hover:text-gray-500 shrink-0"
            >
              <GripVertical size={14} />
            </div>
          )}

          {/* Status toggle */}
          <button
            onClick={() => onCycle(task)}
            className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
            title={`Status: ${task.status}`}
          >
            {statusIcon()}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-snug ${task.status === 'Done' ? 'line-through text-gray-500' : 'text-gray-100'}`}>
              {task.title}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <PriorityBadge priority={task.priority} />
              {task.branch && <BranchBadge branch={task.branch} />}
              {task.time_block && (
                <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                  {task.time_block}
                </span>
              )}
              {task.estimated_time && (
                <span className="flex items-center gap-0.5 text-xs text-gray-500">
                  <Clock size={10} /> {task.estimated_time}j
                </span>
              )}
              {dl && (
                <span className={`flex items-center gap-0.5 text-xs ${dl.cls}`}>
                  <Calendar size={10} /> {dl.text}
                </span>
              )}
            </div>
            {task.notes && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{task.notes}</p>
            )}
          </div>

          {/* Actions */}
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

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Tugas">
        <TaskForm
          initial={task}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
          submitLabel="Perbarui"
        />
      </Modal>
    </>
  )
}
