import { useState } from 'react'
import { Trash2, Circle, CheckCircle } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types/task'
import { useBranchColor } from '../hooks/useBranches'
import { Modal } from './ui/Modal'
import { TaskForm } from './TaskForm'

interface TaskRowProps {
  task: Task
  displayId: string
  onToggleDone: (task: Task) => Promise<void>
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TaskRow({ task, displayId, onToggleDone, onEdit, onDelete }: TaskRowProps) {
  const [editing, setEditing] = useState(false)
  const [hovered, setHovered] = useState(false)

  const isDone = task.status === 'Done'
  const barColor = useBranchColor(task.branch ?? null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const meta = [
    task.estimated_time ? `${task.estimated_time}h` : null,
    task.time_block ?? null,
    task.priority ? `P${task.priority}` : null,
  ].filter(Boolean).join(' · ')

  const handleEdit = async (updates: Partial<Task>) => {
    await onEdit(task.id, updates)
    setEditing(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.35 : 1,
          minHeight: '36px',
          borderBottom: '1px solid rgba(35,42,46,0.07)',
        }}
        className="relative flex items-center select-none cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...attributes}
        {...listeners}
      >
        {/* Checkbox — click toggles done, stopPropagation prevents drag */}
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onToggleDone(task) }}
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 28, height: '100%', minHeight: 36,
            opacity: hovered || isDone ? 1 : 0,
            transition: 'opacity 0.1s',
            color: isDone ? '#8a9499' : '#cbd3d6',
          }}
        >
          {isDone
            ? <CheckCircle size={13} />
            : <Circle size={13} />
          }
        </button>

        {/* Branch color strip */}
        <div
          style={{
            width: 3, borderRadius: 3,
            backgroundColor: barColor,
            flexShrink: 0,
            alignSelf: 'stretch',
            margin: '5px 10px 5px 0',
          }}
        />

        {/* Content — click to edit */}
        <div
          className="flex-1 flex flex-col justify-center py-1.5 pr-1 min-w-0"
          onPointerDown={e => e.stopPropagation()}
          onClick={() => setEditing(true)}
          style={{ cursor: 'pointer' }}
        >
          <span
            className="text-sm leading-snug truncate"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: isDone ? '#8a9499' : '#232a2e',
              textDecoration: isDone ? 'line-through' : 'none',
              fontWeight: 400,
            }}
          >
            {task.title}
          </span>
          {meta && (
            <span className="text-xs truncate" style={{ color: '#cbd3d6', fontFamily: "'Space Grotesk', sans-serif" }}>
              {displayId} · {meta}
            </span>
          )}
          {!meta && (
            <span className="text-xs truncate" style={{ color: '#cbd3d6', fontFamily: "'Space Grotesk', sans-serif" }}>
              {displayId}
            </span>
          )}
        </div>

        {/* Delete on hover */}
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(task.id) }}
          className="shrink-0 p-1 rounded transition-colors hover:bg-red-50"
          style={{
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.1s',
            color: '#cbd3d6',
          }}
          title="Delete"
        >
          <Trash2 size={11} />
        </button>
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
