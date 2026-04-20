import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import type { Task, Branch } from '../../types/task'
import { TaskCard } from '../TaskCard'
import { Plus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { TaskForm } from '../TaskForm'
import { useBranchList } from '../../hooks/useBranches'

interface BoardViewProps {
  tasks: Task[]
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: (data: Partial<Task>) => Promise<void>
}

const COLUMNS: { key: string; label: string; accent: string }[] = [
  { key: 'backlog',   label: 'Backlog',   accent: '#C9A84C' },
  { key: 'upcoming',  label: 'Upcoming',  accent: 'var(--t-text4)' },
  { key: 'today',     label: 'Today',     accent: '#3b82f6' },
  { key: 'done',      label: 'Done',      accent: '#22c55e' },
]

export function BoardView({ tasks, onEdit, onDelete, onAdd }: BoardViewProps) {
  const branches = useBranchList()
  const [branchFilter, setBranchFilter] = useState<Branch | null>(null)
  const [addingCol, setAddingCol] = useState<string | null>(null)

  const filtered = useMemo(() =>
    branchFilter ? tasks.filter(t => t.branch === branchFilter) : tasks,
    [tasks, branchFilter]
  )

  const today = format(new Date(), 'yyyy-MM-dd')

  const getColTasks = (key: string) => {
    if (key === 'backlog')  return filtered.filter(t => !t.assigned_date).sort((a, b) => (a.branch ?? '').localeCompare(b.branch ?? ''))
    if (key === 'upcoming') return filtered.filter(t => t.assigned_date && t.assigned_date > today && t.status !== 'Done').sort((a, b) => a.assigned_date!.localeCompare(b.assigned_date!))
    if (key === 'today')    return filtered.filter(t => t.assigned_date === today && t.status !== 'Done').sort((a, b) => a.order - b.order)
    if (key === 'done')     return filtered.filter(t => t.status === 'Done').sort((a, b) => a.order - b.order)
    return []
  }

  const initialForCol = (key: string): Partial<Task> => {
    if (key === 'today')   return { assigned_date: today }
    if (key === 'backlog') return {}
    return {}
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
          {COLUMNS.map(col => {
            const colTasks = getColTasks(col.key)
            return (
              <div
                key={col.key}
                className="flex flex-col rounded-xl border border-t-2 overflow-hidden"
                style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)', borderTopColor: col.accent }}
              >
                <div className="flex items-center justify-between px-3 py-2 shrink-0">
                  <span className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>{col.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--t-hover)', color: 'var(--t-text3)' }}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-2">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} isDraggable={false} />
                  ))}
                </div>
                <div className="px-3 pb-2 shrink-0">
                  <button
                    onClick={() => setAddingCol(col.key)}
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

      <Modal open={!!addingCol} onClose={() => setAddingCol(null)} title="New Task">
        <TaskForm
          initial={addingCol ? initialForCol(addingCol) : {}}
          onSubmit={async data => { await onAdd(data); setAddingCol(null) }}
          onCancel={() => setAddingCol(null)}
        />
      </Modal>
    </div>
  )
}
