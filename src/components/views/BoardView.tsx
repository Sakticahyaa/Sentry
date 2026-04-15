import { useMemo, useState } from 'react'
import { format } from 'date-fns'
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

const STATUS_COLUMNS: { key: string; label: string; accent: string }[] = [
  { key: 'notyet', label: 'Not Yet', accent: 'var(--t-text4)' },
  { key: 'today',  label: 'Today',   accent: '#C9A84C' },
  { key: 'done',   label: 'Done',    accent: '#22c55e' },
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

  const today = format(new Date(), 'yyyy-MM-dd')
  const backlogTasks = filtered.filter(t => !t.assigned_date).sort((a, b) => a.order - b.order)

  const getColTasks = (key: string) => {
    if (key === 'notyet') return filtered.filter(t => t.assigned_date && t.assigned_date !== today && t.status === 'Not Yet').sort((a, b) => a.order - b.order)
    if (key === 'today')  return filtered.filter(t => t.assigned_date === today && t.status !== 'Done').sort((a, b) => a.order - b.order)
    if (key === 'done')   return filtered.filter(t => t.status === 'Done').sort((a, b) => a.order - b.order)
    return []
  }

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
      <div className="flex-1 overflow-auto">
      <div className="grid gap-3 p-4 h-full" style={{ gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))' }}>

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
          const colTasks = getColTasks(col.key)

          return (
            <div
              key={col.key}
              className="flex flex-col rounded-xl border border-t-2 overflow-hidden"
              style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)', borderTopColor: col.accent }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.key === 'done' ? 'Done' : col.key === 'today' ? 'Ongoing' : 'Not Yet')}
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
                  onClick={() => setAddingStatus(col.key === 'done' ? 'Done' : col.key === 'today' ? 'Ongoing' : 'Not Yet')}
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
