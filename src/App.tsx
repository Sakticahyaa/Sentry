import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
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
  daily: 'Daily',
  weekly: 'Weekly',
  board: 'Board',
  branch: 'Branch',
  analytics: 'Analytics',
}

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const [view, setView] = useState<ViewType>('daily')
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const { tasks, loading, filters, addTask, editTask, removeTask, cycleStatus, updateFilter, setTasks } = useTasks(
    activeBranch ? { branch: activeBranch } : undefined,
    !!user
  )

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--t-surface)' }}>
        <div className="text-sm" style={{ color: 'var(--t-text3)' }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login onSignIn={signIn} />
  }

  const handleBranchChange = (b: Branch | null) => {
    setActiveBranch(b)
    if (b) setView('branch')
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--t-surface)' }}>
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
          title={VIEW_LABELS[view]}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--t-text4)' }}>
              Loading tasks...
            </div>
          ) : (
            <>
              {view === 'daily' && (
                <DailyView tasks={tasks} onEdit={editTask} onDelete={removeTask} onCycle={cycleStatus} onAdd={addTask} setTasks={setTasks} />
              )}
              {view === 'weekly' && (
                <WeeklyView tasks={tasks} onEdit={editTask} onCycle={cycleStatus} />
              )}
              {view === 'board' && (
                <BoardView tasks={tasks} onEdit={editTask} onDelete={removeTask} onCycle={cycleStatus} onAdd={addTask} />
              )}
              {view === 'branch' && (
                <BranchView tasks={tasks} activeBranch={activeBranch} onEdit={editTask} onDelete={removeTask} onCycle={cycleStatus} />
              )}
              {view === 'analytics' && (
                <AnalyticsView tasks={tasks} />
              )}
            </>
          )}
        </main>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Task">
        <TaskForm
          onSubmit={async data => { await addTask(data); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
