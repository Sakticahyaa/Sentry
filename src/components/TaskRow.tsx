import { useState } from 'react'
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
        {/* Done — slides in from left */}
        <div
          style={{
            width: hovered ? 48 : 0,
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'width 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            paddingRight: hovered ? 6 : 0,
          }}
        >
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onToggleDone(task) }}
            style={{
              background: isDone
                ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                : 'linear-gradient(135deg, #16a34a, #4ade80)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.05em',
              padding: '2px 7px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {isDone ? 'Undo' : 'Done'}
          </button>
        </div>

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
          className="flex-1 flex flex-col justify-center py-1.5 min-w-0"
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
          <span className="text-xs truncate" style={{ color: '#cbd3d6', fontFamily: "'Space Grotesk', sans-serif" }}>
            {displayId}{meta ? ` · ${meta}` : ''}
          </span>
        </div>

        {/* Del — slides in from right */}
        <div
          style={{
            width: hovered ? 44 : 0,
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'width 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: hovered ? 6 : 0,
          }}
        >
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #f87171)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.05em',
              padding: '2px 7px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Del
          </button>
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
