import { useMemo, useState } from 'react'
import type { Task, Status, Branch } from '../../types/task'
import { TaskCard } from '../TaskCard'
import { Plus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { TaskForm } from '../TaskForm'
import { useBranchList } from '../../hooks/useBranches'

interface BoardViewProps {
  tasks: Task[]
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCycle: (task: Task) => Promise<void>
  onAdd: (data: Partial<Task>) => Promise<void>
}

const STATUS_COLUMNS: { status: Status; label: string; accent: string }[] = [
  { status: 'Not Yet', label: 'Not Yet', accent: 'var(--t-text4)' },
  { status: 'Ongoing', label: 'Ongoing', accent: 'var(--t-accent)' },
  { status: 'Done',    label: 'Done',    accent: '#22c55e' },
]

export function BoardView({ tasks, onEdit, onDelete, onCycle, onAdd }: BoardViewProps) {
  const branches = useBranchList()
  const [branchFilter, setBranchFilter] = useState<Branch | null>(null)
  const [addingStatus, setAddingStatus] = useState<Status | null>(null)
  const [addingBacklog, setAddingBacklog] = useState(false)

  const filtered = useMemo(() =>
    branchFilter ? tasks.filter(t => t.branch === branchFilter) : tasks,
    [tasks, branchFilter]
  )

  const backlogTasks = filtered.filter(t => !t.assigned_date).sort((a, b) => a.order - b.order)

  const handleDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) await onEdit(taskId, { status })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Branch filter */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--t-border)' }}>
        <span className="text-xs" style={{ color: 'var(--t-text4)' }}>Branch:</span>
        {[null, ...branches.map(b => b.name)].map(b => (
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
      <div className="flex-1 overflow-hidden grid gap-3 p-4" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>

        {/* Backlog column */}
        <div
          className="flex flex-col rounded-xl border border-t-2 overflow-hidden"
          style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)', borderTopColor: '#C9A84C' }}
        >
          <div className="flex items-center justify-between px-3 py-2 shrink-0">
            <span className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>Backlog</span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--t-hover)', color: 'var(--t-text3)' }}>
              {backlogTasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-2">
            {backlogTasks.map(task => (
              <div key={task.id} draggable onDragStart={e => e.dataTransfer.setData('taskId', task.id)}>
                <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} onCycle={onCycle} isDraggable={false} />
              </div>
            ))}
          </div>
          <div className="px-3 pb-2 shrink-0">
            <button
              onClick={() => setAddingBacklog(true)}
              className="flex items-center gap-1 text-xs py-1 transition-colors"
              style={{ color: 'var(--t-text4)' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text2)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text4)'}
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>

        {/* Status columns */}
        {STATUS_COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.status && t.assigned_date).sort((a, b) => a.order - b.order)

          return (
            <div
              key={col.status}
              className="flex flex-col rounded-xl border border-t-2 overflow-hidden"
              style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)', borderTopColor: col.accent }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.status)}
            >
              <div className="flex items-center justify-between px-3 py-2 shrink-0">
                <span className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>{col.label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--t-hover)', color: 'var(--t-text3)' }}>
                  {colTasks.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-2">
                {colTasks.map(task => (
                  <div key={task.id} draggable onDragStart={e => e.dataTransfer.setData('taskId', task.id)}>
                    <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} onCycle={onCycle} isDraggable={false} />
                  </div>
                ))}
              </div>
              <div className="px-3 pb-2 shrink-0">
                <button
                  onClick={() => setAddingStatus(col.status)}
                  className="flex items-center gap-1 text-xs py-1 transition-colors"
                  style={{ color: 'var(--t-text4)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text4)'}
                >
                  <Plus size={12} /> Add
                </button>
              </div>
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

      <Modal open={addingBacklog} onClose={() => setAddingBacklog(false)} title="New Backlog Task">
        <TaskForm
          initial={{ branch: branchFilter ?? undefined }}
          onSubmit={async data => { await onAdd(data); setAddingBacklog(false) }}
          onCancel={() => setAddingBacklog(false)}
        />
      </Modal>
    </div>
  )
}
