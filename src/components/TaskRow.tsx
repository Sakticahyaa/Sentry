import { useState, useRef, useEffect } from 'react'
import { Square, CheckSquare, ChevronRight } from 'lucide-react'
import { addDays, format } from 'date-fns'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types/task'
import { useBranchColor } from '../hooks/useBranches'
import { Modal } from './ui/Modal'
import { TaskForm } from './TaskForm'

interface TaskRowProps {
  task: Task
  displayId: string
  onToggleDone: (task: Task) => Promise<void>
  onEdit: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TaskRow({ task, displayId, onToggleDone, onEdit, onDelete }: TaskRowProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [swipeDx, setSwipeDx] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const isDone = task.status === 'Done'
  const barColor = useBranchColor(task.branch ?? null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    if (dx > 0) setSwipeDx(Math.min(dx, 80))
  }
  const handleTouchEnd = () => {
    if (swipeDx > 60 && task.assigned_date) {
      const nextDay = format(addDays(new Date(task.assigned_date + 'T00:00:00'), 1), 'yyyy-MM-dd')
      onEdit(task.id, { assigned_date: nextDay })
    }
    setSwipeDx(0)
    touchStartX.current = null
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const meta = [
    task.estimated_time ? `${task.estimated_time}h` : null,
    task.time_block ?? null,
    task.priority ? `P${task.priority}` : null,
  ].filter(Boolean).join(' · ')

  const handleEdit = async (updates: Partial<Task>) => {
    await onEdit(task.id, updates)
    setEditing(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition: swipeDx > 0 ? 'none' : transition,
          opacity: isDragging ? 0.35 : 1,
          minHeight: '36px',
          borderBottom: '1px solid rgba(35,42,46,0.07)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="relative flex items-center select-none cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...attributes}
        {...listeners}
      >
        {/* Swipe-to-next-day background */}
        {swipeDx > 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: '#3b82f6',
            opacity: swipeDx / 80,
            display: 'flex', alignItems: 'center', paddingLeft: 12,
            pointerEvents: 'none',
          }}>
            <ChevronRight size={14} color="white" />
          </div>
        )}
        <div style={{ transform: `translateX(${swipeDx}px)`, transition: swipeDx > 0 ? 'none' : 'transform 0.2s ease', width: '100%', display: 'flex', alignItems: 'center' }}>
        {/* Checkbox — always visible on mobile, slides in on hover on desktop */}
        <div style={{
          width: isMobile || hovered || isDone ? 28 : 0,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onToggleDone(task) }}
            style={{ color: isDone ? '#8a9499' : '#cbd3d6', display: 'flex', alignItems: 'center' }}
          >
            {isDone ? <CheckSquare size={15} /> : <Square size={15} />}
          </button>
        </div>

        {/* Branch color strip */}
        <div style={{
          width: 3, borderRadius: 3,
          backgroundColor: barColor,
          flexShrink: 0,
          alignSelf: 'stretch',
          margin: '5px 10px 5px 0',
        }} />

        {/* Content — click to edit */}
        <div
          className="flex-1 flex flex-col justify-center py-1.5 pr-2 min-w-0"
          onPointerDown={e => e.stopPropagation()}
          onClick={() => setEditing(true)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            lineHeight: 1.4,
            color: isDone ? '#8a9499' : '#232a2e',
            textDecoration: isDone ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {task.title}
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            color: '#8a9499',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayId}{meta ? ` · ${meta}` : ''}
          </span>
        </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editing} onClose={() => { setEditing(false); setDeleting(false) }} title="Edit Task">
        {deleting ? (
          <div>
            <p className="text-sm mb-5" style={{ color: '#232a2e' }}>
              Delete <strong>"{task.title}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setDeleting(false)}>Cancel</button>
              <button
                className="btn text-white"
                style={{ background: '#dc2626' }}
                onClick={() => { setEditing(false); setDeleting(false); onDelete(task.id) }}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <TaskForm
            initial={task}
            onSubmit={handleEdit}
            onCancel={() => setEditing(false)}
            submitLabel="Update"
            onDelete={() => setDeleting(true)}
          />
        )}
      </Modal>
    </>
  )
}
