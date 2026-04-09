import { useState } from 'react'
import { startOfWeek } from 'date-fns'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useBranches, BranchesContext } from './hooks/useBranches'
import { Login } from './pages/Login'
import { TopBar } from './components/TopBar'
import { TeuxView } from './components/TeuxView'
import { CalendarView } from './components/CalendarView'
import { Backlog } from './components/Backlog'
import { BranchManager } from './components/BranchManager'

type ColCount = 1 | 3 | 7
type ViewMode = 'columns' | 'calendar'

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const [colCount, setColCount]     = useState<ColCount>(7)
  const [view, setView]             = useState<ViewMode>('columns')
  const [startDate, setStartDate]   = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [showBacklog, setShowBacklog]       = useState(false)
  const [showBranchMgr, setShowBranchMgr]   = useState(false)

  const { tasks, loading, addTask, editTask, removeTask } = useTasks(undefined, !!user)
  const { branches, getColor, addBranch, removeBranch, editBranch } = useBranches(!!user)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm" style={{ color: '#cbd3d6' }}>Loading...</span>
      </div>
    )
  }

  if (!user) return <Login onSignIn={signIn} />

  const backlogCount = tasks.filter(t => !t.assigned_date).length

  const handleToggleDone = async (task: typeof tasks[0]) => {
    await editTask(task.id, { status: task.status === 'Done' ? 'Not Yet' : 'Done' })
  }

  const handleCalendarDayClick = (date: string) => {
    setStartDate(new Date(date + 'T00:00:00'))
    setColCount(1)
    setView('columns')
  }

  return (
    <BranchesContext.Provider value={{ branches, getColor }}>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        <TopBar
          colCount={colCount}
          setColCount={setColCount}
          view={view}
          setView={setView}
          startDate={startDate}
          setStartDate={setStartDate}
          onBacklog={() => setShowBacklog(true)}
          onBranches={() => setShowBranchMgr(true)}
          onSignOut={signOut}
          backlogCount={backlogCount}
        />

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm" style={{ color: '#cbd3d6' }}>Loading tasks...</span>
          </div>
        ) : view === 'columns' ? (
          <TeuxView
            colCount={colCount}
            startDate={startDate}
            tasks={tasks}
            onToggleDone={handleToggleDone}
            onEdit={editTask}
            onDelete={removeTask}
            onAdd={addTask}
          />
        ) : (
          <CalendarView tasks={tasks} onDayClick={handleCalendarDayClick} />
        )}

        {showBacklog && (
          <Backlog
            tasks={tasks}
            onToggleDone={handleToggleDone}
            onEdit={editTask}
            onDelete={removeTask}
            onClose={() => setShowBacklog(false)}
          />
        )}

        {showBranchMgr && (
          <BranchManager
            branches={branches}
            onAdd={addBranch}
            onDelete={removeBranch}
            onEdit={editBranch}
            onClose={() => setShowBranchMgr(false)}
          />
        )}
      </div>
    </BranchesContext.Provider>
  )
}
