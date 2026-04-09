import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(35,42,46,0.2)' }}
        onClick={onClose}
      />
      <div
        className={`relative w-full ${widths[size]} rounded-t-xl sm:rounded-lg shadow-xl`}
        style={{ background: '#ffffff', border: '1px solid #cbd3d6' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #cbd3d6' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: '#232a2e' }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: '80dvh' }}>{children}</div>
      </div>
    </div>
  )
}
