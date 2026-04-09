import { useState } from 'react'
import { X, Trash2, Pencil, Check } from 'lucide-react'
import type { BranchRecord } from '../types/task'

const PRESET_COLORS = [
  '#E74C3C', '#E67E22', '#F39C12', '#C9A84C',
  '#2ECC71', '#1ABC9C', '#26A69A', '#3498DB',
  '#5B6B8A', '#2980B9', '#9B59B6', '#8E44AD',
  '#E91E63', '#795548', '#607D8B', '#232a2e',
]

interface BranchManagerProps {
  branches: BranchRecord[]
  onAdd: (name: string, color: string) => Promise<void>
  onDelete: (id: string, name: string) => Promise<void>
  onEdit: (id: string, updates: Partial<Pick<BranchRecord, 'name' | 'color'>>) => Promise<void>
  onClose: () => void
}

export function BranchManager({ branches, onAdd, onDelete, onEdit, onClose }: BranchManagerProps) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#5B6B8A')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editColor, setEditColor] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    try {
      await onAdd(newName.trim(), newColor)
      setNewName('')
      setNewColor('#5B6B8A')
    } finally {
      setAdding(false)
    }
  }

  const handleEditSave = async (id: string) => {
    await onEdit(id, { color: editColor })
    setEditingId(null)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(35,42,46,0.15)' }} onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 320, background: '#ffffff', borderLeft: '1px solid #cbd3d6' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #cbd3d6' }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#232a2e' }}>Branches</div>
            <div className="text-xs" style={{ color: '#8a9499' }}>{branches.length} branches</div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>

        {/* Branch list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {branches.map(branch => (
            <div
              key={branch.id}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: '1px solid #f0f0f0' }}
            >
              {/* Color swatch */}
              <div
                className="shrink-0"
                style={{ width: 4, height: 28, borderRadius: 3, backgroundColor: branch.color }}
              />

              <span className="flex-1 text-sm font-medium" style={{ color: '#232a2e' }}>
                {branch.name}
              </span>

              {/* Edit color */}
              {editingId === branch.id ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-wrap gap-1" style={{ maxWidth: 120 }}>
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className="rounded"
                        style={{
                          width: 14, height: 14,
                          backgroundColor: c,
                          outline: editColor === c ? `2px solid #232a2e` : 'none',
                          outlineOffset: 1,
                        }}
                      />
                    ))}
                  </div>
                  <button onClick={() => handleEditSave(branch.id)} className="btn-ghost p-1">
                    <Check size={12} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-ghost p-1">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100" style={{ opacity: 1 }}>
                  <button
                    onClick={() => { setEditingId(branch.id); setEditColor(branch.color) }}
                    className="btn-ghost p-1"
                    title="Edit color"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${branch.name}"? Tasks in this branch will become unassigned.`))
                        onDelete(branch.id, branch.name)
                    }}
                    className="p-1 rounded transition-colors hover:bg-red-50 text-red-400"
                    title="Delete branch"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new branch */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #cbd3d6' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8a9499' }}>
            New Branch
          </p>

          <input
            className="input text-sm mb-3"
            placeholder="Branch name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          />

          {/* Color picker */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="rounded transition-all"
                style={{
                  width: 20, height: 20,
                  backgroundColor: c,
                  outline: newColor === c ? `2px solid #232a2e` : 'none',
                  outlineOffset: 1,
                }}
              />
            ))}
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 mb-3">
            <div style={{ width: 4, height: 24, borderRadius: 3, backgroundColor: newColor }} />
            <span className="text-sm" style={{ color: newName ? '#232a2e' : '#cbd3d6' }}>
              {newName || 'Branch name'}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!newName.trim() || adding}
            className="btn-dark w-full justify-center py-2 text-sm disabled:opacity-40"
          >
            {adding ? 'Adding...' : 'Add Branch'}
          </button>
        </div>
      </div>
    </>
  )
}
