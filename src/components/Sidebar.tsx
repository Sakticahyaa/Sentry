import { LayoutDashboard, Calendar, Kanban, Tag, Plus, LogOut, TrendingUp } from 'lucide-react'
import type { Branch, ViewType } from '../types/task'
import { BRANCHES, BRANCH_COLORS } from '../constants/branches'

interface SidebarProps {
  view: ViewType
  onViewChange: (v: ViewType) => void
  activeBranch: Branch | null
  onBranchChange: (b: Branch | null) => void
  onAddTask: () => void
  onSignOut: () => void
  collapsed?: boolean
}

const VIEWS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'daily', label: 'Harian', icon: <LayoutDashboard size={16} /> },
  { id: 'weekly', label: 'Mingguan', icon: <Calendar size={16} /> },
  { id: 'board', label: 'Board', icon: <Kanban size={16} /> },
  { id: 'branch', label: 'Branch', icon: <Tag size={16} /> },
  { id: 'analytics', label: 'Analitik', icon: <TrendingUp size={16} /> },
]

export function Sidebar({ view, onViewChange, activeBranch, onBranchChange, onAddTask, onSignOut }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 flex flex-col bg-gray-950 border-r border-gray-800 h-screen sticky top-0">
      {/* Brand */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-hyke flex items-center justify-center text-white text-xs font-bold">S</div>
          <span className="font-semibold text-gray-100 text-sm">Sentry</span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5">Task Manager</p>
      </div>

      {/* Add task */}
      <div className="p-3 border-b border-gray-800">
        <button onClick={onAddTask} className="btn-primary w-full justify-center">
          <Plus size={14} /> Tugas Baru
        </button>
      </div>

      {/* Views */}
      <nav className="p-3 space-y-0.5">
        <p className="text-xs font-medium text-gray-600 px-2 mb-2 uppercase tracking-wider">Tampilan</p>
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all ${
              view === v.id
                ? 'bg-hyke/20 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
            }`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </nav>

      {/* Branches */}
      <div className="p-3 border-t border-gray-800 flex-1">
        <p className="text-xs font-medium text-gray-600 px-2 mb-2 uppercase tracking-wider">Branch</p>
        <button
          onClick={() => onBranchChange(null)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all mb-0.5 ${
            !activeBranch ? 'bg-gray-800 text-gray-100' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-gray-600 shrink-0" />
          Semua
        </button>
        {BRANCHES.map(b => (
          <button
            key={b}
            onClick={() => onBranchChange(b)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all mb-0.5 ${
              activeBranch === b ? 'bg-gray-800 text-gray-100' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: BRANCH_COLORS[b] }}
            />
            {b}
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-800 space-y-0.5">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-950 transition-all"
        >
          <LogOut size={14} /> Keluar
        </button>
      </div>
    </aside>
  )
}
