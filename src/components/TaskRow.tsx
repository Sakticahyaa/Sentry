import { useState } from 'react'
import { Pencil } from 'lucide-react'
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
  const [confirming, setConfirming] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
        onClick={() => onToggleDone(task)}
        {...attributes}
        {...listeners}
      >
        {/* Branch color strip */}
        <div style={{
          width: 3, borderRadius: 3,
          backgroundColor: barColor,
          flexShrink: 0,
          alignSelf: 'stretch',
          margin: '5px 10px 5px 13px',
        }} />

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center py-1.5 min-w-0">
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

        {/* Hover actions */}
        <div
          className="flex items-center gap-0.5 px-1 shrink-0"
          style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.1s' }}
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded transition-colors hover:bg-[#f0f0f0]"
            style={{ color: '#8a9499' }}
            title="Edit"
          >
            <Pencil size={11} />
          </button>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editing} onClose={() => { setEditing(false); setDeleting(false) }} title="Edit Task">
        {deleting ? (
          <div>
            <p className="text-sm mb-5" style={{ color: '#232a2e' }}>
              Delete <strong>"{task.title}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setDeleting(false)}>Cancel</button>
              <button
                className="btn text-white"
                style={{ background: '#dc2626' }}
                onClick={() => { setEditing(false); setDeleting(false); onDelete(task.id) }}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <TaskForm
            initial={task}
            onSubmit={handleEdit}
            onCancel={() => setEditing(false)}
            submitLabel="Update"
            onDelete={() => setDeleting(true)}
          />
        )}
      </Modal>
    </>
  )
}
