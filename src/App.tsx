import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { Login } from './pages/Login'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { DailyView } from './components/views/DailyView'
import { WeeklyView } from './components/views/WeeklyView'
import { BoardView } from './components/views/BoardView'
import { BranchView } from './components/views/BranchView'
import { AnalyticsView } from './components/views/AnalyticsView'
import { Modal } from './components/ui/Modal'
import { TaskForm } from './components/TaskForm'
import type { Branch, ViewType } from './types/task'

const VIEW_LABELS: Record<ViewType, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  board: 'Board',
  branch: 'Branch',
  analytics: 'Analitik',
}

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const [view, setView] = useState<ViewType>('daily')
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const { tasks, loading, filters, addTask, editTask, removeTask, cycleStatus, updateFilter, setTasks } = useTasks(
    activeBranch ? { branch: activeBranch } : undefined
  )

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 text-sm">Memuat...</div>
      </div>
    )
  }

  if (!user) {
    return <Login onSignIn={signIn} />
  }

  const handleBranchChange = (b: Branch | null) => {
    setActiveBranch(b)
    if (b) {
      setView('branch')
    }
  }

  const title = VIEW_LABELS[view as keyof typeof VIEW_LABELS] ?? 'Sentry'

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        view={view}
        onViewChange={setView}
        activeBranch={activeBranch}
        onBranchChange={handleBranchChange}
        onAddTask={() => setShowAdd(true)}
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          search={filters.search}
          onSearchChange={v => updateFilter('search', v)}
          title={title}
        />

        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-700 text-sm">
              Memuat tugas...
            </div>
          ) : (
            <>
              {view === 'daily' && (
                <DailyView
                  tasks={tasks}
                  onEdit={editTask}
                  onDelete={removeTask}
                  onCycle={cycleStatus}
                  onAdd={addTask}
                  setTasks={setTasks}
                />
              )}
              {view === 'weekly' && (
                <WeeklyView
                  tasks={tasks}
                  onEdit={editTask}
                  onCycle={cycleStatus}
                />
              )}
              {view === 'board' && (
                <BoardView
                  tasks={tasks}
                  onEdit={editTask}
                  onDelete={removeTask}
                  onCycle={cycleStatus}
                  onAdd={addTask}
                />
              )}
              {view === 'branch' && (
                <BranchView
                  tasks={tasks}
                  activeBranch={activeBranch}
                  onEdit={editTask}
                  onDelete={removeTask}
                  onCycle={cycleStatus}
                />
              )}
              {view === 'analytics' && (
                <AnalyticsView tasks={tasks} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Add Task Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tugas Baru">
        <TaskForm
          onSubmit={async data => { await addTask(data); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
