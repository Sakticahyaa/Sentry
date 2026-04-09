import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
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

  const parts = [
    task.title,
    task.estimated_time ? `${task.estimated_time}h` : null,
    task.time_block ?? null,
  ].filter(Boolean)

  const label = parts.join(' · ')

  const handleClick = async (e: React.MouseEvent) => {
    // Don't toggle if clicking action buttons
    if ((e.target as HTMLElement).closest('.task-actions')) return
    await onToggleDone(task)
  }

  const handleEdit = async (updates: Partial<Task>) => {
    await onEdit(task.id, updates)
    setEditing(false)
  }

  return (
    <>
      <div
        className="relative flex items-stretch cursor-pointer select-none"
        style={{ minHeight: '34px', borderBottom: '1px solid rgba(35,42,46,0.08)', marginLeft: 13, marginRight: 8 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* Branch color strip */}
        <div
          style={{
            width: '3px',
            borderRadius: '3px',
            backgroundColor: barColor,
            flexShrink: 0,
            margin: '4px 10px 4px 0',
          }}
        />

        {/* Task label */}
        <div
          className="flex-1 flex items-center gap-2 text-sm py-1 pr-2 leading-snug"
          style={{
            color: isDone ? '#8a9499' : '#232a2e',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          <span className="shrink-0 text-xs font-mono" style={{ color: '#cbd3d6', textDecoration: 'none' }}>
            {displayId}
          </span>
          {label}
        </div>

        {/* Hover actions */}
        <div
          className="task-actions flex flex-col items-center justify-center gap-0.5 px-1 shrink-0"
          style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.1s' }}
        >
          <button
            onClick={e => { e.stopPropagation(); setEditing(true) }}
            className="p-0.5 rounded transition-colors hover:bg-[#e8eced]"
            style={{ color: '#8a9499' }}
            title="Edit"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            className="p-0.5 rounded transition-colors hover:bg-red-50"
            style={{ color: '#8a9499' }}
            title="Delete"
          >
            <Trash2 size={11} />
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
