import { useState } from 'react'
import type { Task, TaskInsert, Branch, Status, TimeBlock, Priority } from '../types/task'
import { useBranchList } from '../hooks/useBranches'
import { TIME_BLOCKS } from '../constants/timeblocks'

interface TaskFormProps {
  initial?: Partial<Task>
  onSubmit: (data: Partial<TaskInsert>) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }: TaskFormProps) {
  const branches = useBranchList()
  const [form, setForm] = useState<Partial<TaskInsert>>({
    title:          initial?.title          ?? '',
    branch:         initial?.branch         ?? null,
    deadline:       initial?.deadline       ?? null,
    priority:       initial?.priority       ?? 3,
    status:         initial?.status         ?? 'Not Yet',
    notes:          initial?.notes          ?? '',
    assigned_date:  initial?.assigned_date  ?? null,
    estimated_time: initial?.estimated_time ?? null,
    time_block:     initial?.time_block     ?? null,
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
        <label className="label">Title *</label>
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
          <label className="label">Priority</label>
          <select className="input" value={form.priority ?? 3} onChange={e => set('priority', Number(e.target.value) as Priority)}>
            {([1, 2, 3, 4, 5] as Priority[]).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status ?? 'Not Yet'} onChange={e => set('status', e.target.value as Status)}>
            <option value="Not Yet">Not Yet</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div>
          <label className="label">Time Block</label>
          <select className="input" value={form.time_block ?? ''} onChange={e => set('time_block', (e.target.value as TimeBlock) || null)}>
            <option value="">— None —</option>
            {TIME_BLOCKS.map(t => (
              <option key={t.value} value={t.value}>{t.label} ({t.range})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Assigned Date</label>
          <input type="date" className="input" value={form.assigned_date ?? ''} onChange={e => set('assigned_date', e.target.value || null)} />
        </div>
        <div>
          <label className="label">Deadline</label>
          <input type="date" className="input" value={form.deadline ?? ''} onChange={e => set('deadline', e.target.value || null)} />
        </div>
      </div>

      <div>
        <label className="label">Estimated Time (hours)</label>
        <input
          type="number"
          className="input"
          placeholder="e.g. 1.5"
          min="0.25"
          max="24"
          step="0.25"
          value={form.estimated_time ?? ''}
          onChange={e => set('estimated_time', e.target.value ? Number(e.target.value) : null)}
        />
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

      <div className="flex gap-2 justify-end pt-2 border-t" style={{ borderColor: 'var(--t-border)' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
