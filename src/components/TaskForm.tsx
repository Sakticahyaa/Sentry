import { useState } from 'react'
import type { Task, TaskInsert, Branch } from '../types/task'
import { useBranchList } from '../hooks/useBranches'

interface TaskFormProps {
  initial?: Partial<Task>
  onSubmit: (data: Partial<TaskInsert>) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  onDelete?: () => void
}

export function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Save', onDelete }: TaskFormProps) {
  const branches = useBranchList()
  const [form, setForm] = useState<Partial<TaskInsert>>({
    title:         initial?.title         ?? '',
    branch:        initial?.branch        ?? null,
    notes:         initial?.notes         ?? '',
    assigned_date: initial?.assigned_date ?? null,
    status:        initial?.status        ?? 'Not Yet',
  })
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof TaskInsert>(key: K, value: TaskInsert[K] | null) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) return
    setSubmitting(true)
    try { await onSubmit(form) }
    finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Task *</label>
        <input
          className="input"
          placeholder="Task name..."
          value={form.title ?? ''}
          onChange={e => set('title', e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Branch</label>
          <select className="input" value={form.branch ?? ''} onChange={e => set('branch', (e.target.value as Branch) || null)}>
            <option value="">— None —</option>
            {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Assigned Date</label>
          <input type="date" className="input" value={form.assigned_date ?? ''} onChange={e => set('assigned_date', e.target.value || null)} />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Additional notes..."
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value || null)}
        />
      </div>

      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--t-border)' }}>
        {onDelete && (
          <button type="button" className="btn text-white mr-auto" style={{ background: '#dc2626', fontSize: 12 }} onClick={onDelete}>
            Delete
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
