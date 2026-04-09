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

  const pillBtn: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.05em',
    padding: '2px 7px',
    borderRadius: 4,
    whiteSpace: 'nowrap',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    color: '#fff',
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
        {/* Done pill — left */}
        <div style={{
          width: hovered ? 50 : 0,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.13s ease',
          display: 'flex',
          alignItems: 'center',
          paddingRight: hovered ? 6 : 0,
        }}>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onToggleDone(task) }}
            style={{
              ...pillBtn,
              background: isDone
                ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                : 'linear-gradient(135deg, #16a34a, #4ade80)',
            }}
          >
            {isDone ? 'Undo' : 'Done'}
          </button>
        </div>

        {/* Branch color strip */}
        <div style={{
          width: 3, borderRadius: 3,
          backgroundColor: barColor,
          flexShrink: 0,
          alignSelf: 'stretch',
          margin: '5px 10px 5px 0',
        }} />

        {/* Content — click to edit */}
        <div
          className="flex-1 flex flex-col justify-center py-1.5 min-w-0"
          onPointerDown={e => e.stopPropagation()}
          onClick={() => setEditing(true)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            lineHeight: 1.4,
            color: isDone ? '#8a9499' : '#232a2e',
            textDecoration: isDone ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {task.title}
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            color: '#cbd3d6',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayId}{meta ? ` · ${meta}` : ''}
          </span>
        </div>

        {/* Del pill — right */}
        <div style={{
          width: hovered ? 46 : 0,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.13s ease',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: hovered ? 6 : 0,
        }}>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            style={{
              ...pillBtn,
              background: 'linear-gradient(135deg, #dc2626, #f87171)',
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
