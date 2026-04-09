import { useMemo, useState } from 'react'
import type { Task, Status, Branch } from '../../types/task'
import { TaskCard } from '../TaskCard'
import { BRANCHES } from '../../constants/branches'
import { Plus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { TaskForm } from '../TaskForm'

interface BoardViewProps {
  tasks: Task[]
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCycle: (task: Task) => Promise<void>
  onAdd: (data: Partial<Task>) => Promise<void>
}

const COLUMNS: { status: Status; label: string; accent: string }[] = [
  { status: 'Not Yet', label: 'Not Yet',  accent: 'var(--t-text4)' },
  { status: 'Ongoing', label: 'Ongoing',  accent: 'var(--t-accent)' },
  { status: 'Done',    label: 'Done',     accent: '#22c55e' },
]

export function BoardView({ tasks, onEdit, onDelete, onCycle, onAdd }: BoardViewProps) {
  const [branchFilter, setBranchFilter] = useState<Branch | null>(null)
  const [addingStatus, setAddingStatus] = useState<Status | null>(null)

  const filtered = useMemo(() =>
    branchFilter ? tasks.filter(t => t.branch === branchFilter) : tasks,
    [tasks, branchFilter]
  )

  const handleDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) await onEdit(taskId, { status })
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Branch filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs" style={{ color: 'var(--t-text4)' }}>Filter:</span>
        {[null, ...BRANCHES].map(b => (
          <button
            key={b ?? 'all'}
            onClick={() => setBranchFilter(b)}
            className="text-xs px-2 py-1 rounded-lg border transition-all"
            style={{
              borderColor: branchFilter === b ? 'var(--t-accent)' : 'var(--t-border)',
              backgroundColor: branchFilter === b ? 'var(--t-accent-sub)' : 'transparent',
              color: branchFilter === b ? 'var(--t-accent)' : 'var(--t-text3)',
            }}
          >
            {b ?? 'All'}
          </button>
        ))}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.status).sort((a, b) => a.order - b.order)

          return (
            <div
              key={col.status}
              className="rounded-xl border p-3 flex flex-col gap-2 min-h-[400px] border-t-2"
              style={{
                backgroundColor: 'var(--t-card)',
                borderColor: 'var(--t-border)',
                borderTopColor: col.accent,
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.status)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>{col.label}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--t-hover)', color: 'var(--t-text3)' }}
                >
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
                  >
                    <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} onCycle={onCycle} isDraggable={false} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setAddingStatus(col.status)}
                className="flex items-center gap-1 text-xs py-1 transition-colors"
                style={{ color: 'var(--t-text4)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text2)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text4)'}
              >
                <Plus size={12} /> Add task
              </button>
            </div>
          )
        })}
      </div>

      <Modal open={!!addingStatus} onClose={() => setAddingStatus(null)} title="New Task">
        <TaskForm
          initial={{ status: addingStatus ?? 'Not Yet', branch: branchFilter ?? undefined }}
          onSubmit={async data => { await onAdd(data); setAddingStatus(null) }}
          onCancel={() => setAddingStatus(null)}
        />
      </Modal>
    </div>
  )
}
