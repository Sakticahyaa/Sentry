import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Task } from '../types/task'
import { TaskRow } from './TaskRow'
import { buildDisplayIds } from '../lib/displayId'

interface BacklogProps {
  tasks: Task[]
  onToggleDone: (task: Task) => Promise<void>
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export function Backlog({ tasks, onToggleDone, onEdit, onDelete, onClose }: BacklogProps) {
  const backlogTasks = tasks
    .filter(t => !t.assigned_date)
    .sort((a, b) => (a.branch ?? '').localeCompare(b.branch ?? ''))
  const displayIds = buildDisplayIds(tasks)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(35,42,46,0.15)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 'min(340px, 100vw)',
          background: '#ffffff',
          borderLeft: '1px solid #cbd3d6',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid #cbd3d6' }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: '#232a2e' }}>Backlog</div>
            <div className="text-xs" style={{ color: '#8a9499' }}>
              {backlogTasks.length} unscheduled task{backlogTasks.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={16} />
          </button>
        </div>

        {/* Tasks */}
        <div className="flex-1 overflow-y-auto px-4 pt-3">
          {backlogTasks.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: '#cbd3d6' }}>
              No backlog tasks
            </p>
          ) : (
            backlogTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                displayId={displayIds.get(task.id) ?? '—'}
                onToggleDone={onToggleDone}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>

        <div className="px-5 py-3 text-xs" style={{ color: '#cbd3d6', borderTop: '1px solid #cbd3d6' }}>
          Edit a task to assign it a date
        </div>
      </div>
    </>
  )
}
