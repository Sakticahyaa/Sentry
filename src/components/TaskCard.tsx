import { useState } from 'react'
import { GripVertical, Pencil, Trash2, Square, CheckSquare } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types/task'
import { useBranchColor } from '../hooks/useBranches'
import { Modal } from './ui/Modal'
import { TaskForm } from './TaskForm'

interface TaskCardProps {
  task: Task
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isDraggable?: boolean
}

function BranchStrip({ branch }: { branch: string | null }) {
  const color = useBranchColor(branch)
  if (!branch) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--t-text2)' }}>
      <span style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
      {branch}
    </span>
  )
}

export function TaskCard({ task, onEdit, onDelete, isDraggable = true }: TaskCardProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hovered, setHovered] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isDone = task.status === 'Done'

  const handleEdit = async (updates: Partial<Task>) => {
    await onEdit(task.id, updates)
    setEditing(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(task.id)
    setDeleting(false)
  }

  const handleToggleDone = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await onEdit(task.id, { status: isDone ? 'Not Yet' : 'Done' })
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...style, border: '1px solid var(--t-border)' }}
        className={`group transition-all rounded-lg overflow-hidden ${isDone ? 'opacity-55' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-stretch">

          {/* Sliding checkbox */}
          <div style={{
            width: hovered || isDone ? 32 : 0,
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'width 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--t-hover)',
          }}>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={handleToggleDone}
              style={{ color: isDone ? 'var(--t-accent)' : 'var(--t-text4)', display: 'flex', alignItems: 'center' }}
            >
              {isDone ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 min-w-0 flex items-start gap-2">
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
                className={`text-sm font-medium leading-snug line-clamp-2 ${isDone ? 'line-through' : ''}`}
                style={{ color: isDone ? 'var(--t-text3)' : 'var(--t-text)' }}
              >
                {task.title}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <BranchStrip branch={task.branch} />
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
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Task">
        <TaskForm
          initial={task}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
          submitLabel="Update"
          onDelete={() => { setEditing(false); handleDelete() }}
        />
      </Modal>
    </>
  )
}
