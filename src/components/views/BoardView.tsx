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

const COLUMNS: { status: Status; label: string; color: string }[] = [
  { status: 'Not Yet', label: 'Belum', color: 'border-gray-700' },
  { status: 'Ongoing', label: 'Sedang', color: 'border-blue-500/40' },
  { status: 'Done', label: 'Selesai', color: 'border-green-500/40' },
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
        <span className="text-xs text-gray-600">Filter:</span>
        <button
          onClick={() => setBranchFilter(null)}
          className={`text-xs px-2 py-1 rounded-lg border transition-all ${!branchFilter ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-gray-800 text-gray-500 hover:text-gray-300'}`}
        >
          Semua
        </button>
        {BRANCHES.map(b => (
          <button
            key={b}
            onClick={() => setBranchFilter(b)}
            className={`text-xs px-2 py-1 rounded-lg border transition-all ${branchFilter === b ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-gray-800 text-gray-500 hover:text-gray-300'}`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = filtered
            .filter(t => t.status === col.status)
            .sort((a, b) => a.order - b.order)

          return (
            <div
              key={col.status}
              className={`card p-3 flex flex-col gap-2 min-h-[400px] border-t-2 ${col.color}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.status)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-300">{col.label}</span>
                <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{colTasks.length}</span>
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
                className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-400 transition-colors py-1"
              >
                <Plus size={12} /> Tambah
              </button>
            </div>
          )
        })}
      </div>

      <Modal open={!!addingStatus} onClose={() => setAddingStatus(null)} title="Tugas Baru">
        <TaskForm
          initial={{ status: addingStatus ?? 'Not Yet', branch: branchFilter ?? undefined }}
          onSubmit={async data => { await onAdd(data); setAddingStatus(null) }}
          onCancel={() => setAddingStatus(null)}
        />
      </Modal>
    </div>
  )
}
