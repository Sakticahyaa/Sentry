import { useState } from 'react'
import type { Task, TaskInsert, Branch, Status, TimeBlock, Priority } from '../types/task'
import { BRANCHES } from '../constants/branches'
import { TIME_BLOCKS, PRIORITY_CONFIG } from '../constants/timeblocks'

interface TaskFormProps {
  initial?: Partial<Task>
  onSubmit: (data: Partial<TaskInsert>) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Simpan' }: TaskFormProps) {
  const [form, setForm] = useState<Partial<TaskInsert>>({
    title: initial?.title ?? '',
    branch: initial?.branch ?? null,
    deadline: initial?.deadline ?? null,
    priority: initial?.priority ?? 3,
    status: initial?.status ?? 'Not Yet',
    notes: initial?.notes ?? '',
    assigned_date: initial?.assigned_date ?? null,
    estimated_time: initial?.estimated_time ?? null,
    time_block: initial?.time_block ?? null,
  })
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof TaskInsert>(key: K, value: TaskInsert[K] | null) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="label">Judul *</label>
        <input
          className="input"
          placeholder="Nama tugas..."
          value={form.title ?? ''}
          onChange={e => set('title', e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Branch */}
        <div>
          <label className="label">Branch</label>
          <select
            className="input"
            value={form.branch ?? ''}
            onChange={e => set('branch', (e.target.value as Branch) || null)}
          >
            <option value="">— Tidak ada —</option>
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="label">Prioritas</label>
          <select
            className="input"
            value={form.priority ?? 3}
            onChange={e => set('priority', Number(e.target.value) as Priority)}
          >
            {PRIORITY_CONFIG.map(p => (
              <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Status */}
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={form.status ?? 'Not Yet'}
            onChange={e => set('status', e.target.value as Status)}
          >
            <option value="Not Yet">Belum</option>
            <option value="Ongoing">Sedang</option>
            <option value="Done">Selesai</option>
          </select>
        </div>

        {/* Time Block */}
        <div>
          <label className="label">Time Block</label>
          <select
            className="input"
            value={form.time_block ?? ''}
            onChange={e => set('time_block', (e.target.value as TimeBlock) || null)}
          >
            <option value="">— Tidak ada —</option>
            {TIME_BLOCKS.map(t => (
              <option key={t.value} value={t.value}>{t.label} ({t.range})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Assigned Date */}
        <div>
          <label className="label">Tanggal Kerjakan</label>
          <input
            type="date"
            className="input"
            value={form.assigned_date ?? ''}
            onChange={e => set('assigned_date', e.target.value || null)}
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="label">Deadline</label>
          <input
            type="date"
            className="input"
            value={form.deadline ?? ''}
            onChange={e => set('deadline', e.target.value || null)}
          />
        </div>
      </div>

      {/* Estimated Time */}
      <div>
        <label className="label">Estimasi Waktu (jam)</label>
        <input
          type="number"
          className="input"
          placeholder="misal: 1.5"
          min="0.25"
          max="24"
          step="0.25"
          value={form.estimated_time ?? ''}
          onChange={e => set('estimated_time', e.target.value ? Number(e.target.value) : null)}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="label">Catatan</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Catatan tambahan..."
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value || null)}
        />
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-gray-800">
        <button type="button" className="btn-ghost" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
