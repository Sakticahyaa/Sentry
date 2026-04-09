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

type Zone = 'left' | 'center' | 'right' | null

export function TaskRow({ task, displayId, onToggleDone, onEdit, onDelete }: TaskRowProps) {
  const [editing, setEditing] = useState(false)
  const [zone, setZone] = useState<Zone>(null)

  const isDone = task.status === 'Done'
  const barColor = useBranchColor(task.branch ?? null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const meta = [
    task.estimated_time ? `${task.estimated_time}h` : null,
    task.time_block ?? null,
    task.priority ? `P${task.priority}` : null,
  ].filter(Boolean).join(' · ')

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const w = rect.width
    if (x < 58) setZone('left')
    else if (x > w - 52) setZone('right')
    else setZone('center')
  }

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
          cursor: zone === 'center' ? 'pointer' : 'grab',
        }}
        className="relative flex items-center select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZone(null)}
        {...attributes}
        {...listeners}
      >
        {/* Done pill — left zone */}
        <div style={{
          width: zone === 'left' ? 50 : 0,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.13s ease',
          display: 'flex',
          alignItems: 'center',
          paddingRight: zone === 'left' ? 6 : 0,
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

        {/* Content — click to edit only from center zone */}
        <div
          className="flex-1 flex flex-col justify-center py-1.5 min-w-0"
          onPointerDown={e => e.stopPropagation()}
          onClick={() => { if (zone === 'center') setEditing(true) }}
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

        {/* Del pill — right zone */}
        <div style={{
          width: zone === 'right' ? 46 : 0,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.13s ease',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: zone === 'right' ? 6 : 0,
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
