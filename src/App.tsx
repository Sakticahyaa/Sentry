import { useState, useEffect, useRef } from 'react'
import { startOfWeek, addDays, format, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useBranches, BranchesContext } from './hooks/useBranches'
import { useTheme } from './hooks/useTheme'
import { Login } from './pages/Login'
import { TopBar } from './components/TopBar'
import { TeuxView } from './components/TeuxView'
import { CalendarView } from './components/CalendarView'
import { Backlog } from './components/Backlog'
import { BranchManager } from './components/BranchManager'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { DailyView } from './components/views/DailyView'
import { WeeklyView } from './components/views/WeeklyView'
import { BoardView } from './components/views/BoardView'
import { BranchView } from './components/views/BranchView'
import { AnalyticsView } from './components/views/AnalyticsView'
import type { Branch, ViewType } from './types/task'

type ColCount = 1 | 3 | 7
type ViewMode = 'columns' | 'calendar'
type Layout = 'teux' | 'legacy'

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const [colCount, setColCount]     = useState<ColCount>(7)
  const [view, setView]             = useState<ViewMode>('columns')
  const [startDate, setStartDate]   = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }))

  const handleSetColCount = (n: ColCount) => {
    setColCount(n)
    const today = new Date()
    if (n === 7) setStartDate(startOfWeek(today, { weekStartsOn: 1 }))
    else if (n === 3) setStartDate(addDays(today, -1))
  }

  const handleToday = () => {
    const today = new Date()
    if (colCount === 7) setStartDate(startOfWeek(today, { weekStartsOn: 1 }))
    else if (colCount === 3) setStartDate(addDays(today, -1))
    else setStartDate(today)
  }
  const [showBacklog, setShowBacklog]       = useState(false)
  const [showBranchMgr, setShowBranchMgr]   = useState(false)
  const [layout, setLayout]                 = useState<Layout>('teux')

  // Legacy view state
  const [legacyView, setLegacyView]         = useState<ViewType>('daily')
  const [activeBranch, setActiveBranch]     = useState<Branch | null>(null)
  const [search, setSearch]                 = useState('')

  const { theme, toggle: toggleTheme } = useTheme()
  const rolledOver = useRef(false)

  // Force 1-col on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const apply = (matches: boolean) => {
      if (matches) { setColCount(1); setStartDate(new Date()) }
    }
    apply(mq.matches)
    mq.addEventListener('change', (e) => apply(e.matches))
    return () => mq.removeEventListener('change', (e) => apply(e.matches))
  }, [])
  const { tasks, loading, addTask, editTask, removeTask, cycleStatus, reorder, setTasks } = useTasks(undefined, !!user)
  const { branches, getColor, addBranch, removeBranch, editBranch } = useBranches(!!user)

  // Auto-roll overdue incomplete tasks to today on first load
  useEffect(() => {
    if (loading || rolledOver.current) return
    rolledOver.current = true
    const today = format(new Date(), 'yyyy-MM-dd')
    const overdue = tasks.filter(
      t => t.assigned_date && t.assigned_date < today && t.status !== 'Done'
    )
    overdue.forEach(t => editTask(t.id, { assigned_date: today }))
  }, [loading])

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

  // ── Legacy layout ──────────────────────────────────────────────────────────
  if (layout === 'legacy') {
    const filteredTasks = search
      ? tasks.filter(t =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.notes ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : tasks

    const viewTitles: Record<ViewType, string> = {
      teux: 'Teux', daily: 'Daily', weekly: 'Weekly', board: 'Board',
      branch: 'Branch', analytics: 'Analytics',
    }

    return (
      <BranchesContext.Provider value={{ branches, getColor }}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            view={legacyView}
            onViewChange={setLegacyView}
            activeBranch={activeBranch}
            onBranchChange={setActiveBranch}
            onAddTask={() => {}}
            onSignOut={signOut}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 px-4 shrink-0" style={{ borderBottom: '1px solid var(--t-border)', background: 'var(--t-card)' }}>
              <button
                onClick={() => setLayout('teux')}
                className="text-xs px-2 py-1 rounded transition-all shrink-0"
                style={{ color: 'var(--t-text3)', border: '1px solid var(--t-border)' }}
              >
                ← Teux
              </button>
              <Header
                search={search}
                onSearchChange={setSearch}
                title={viewTitles[legacyView]}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-sm" style={{ color: '#cbd3d6' }}>Loading tasks...</span>
                </div>
              ) : legacyView === 'teux' ? (
                <>
                  {/* Mini nav bar for teux-in-legacy */}
                  <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--t-border)' }}>
                    <button className="btn-ghost px-1.5 py-1" onClick={() => setStartDate(addDays(startDate, -(colCount === 7 ? 7 : 1)))}><ChevronLeft size={14} /></button>
                    <button className="btn-ghost px-1.5 py-1" onClick={() => setStartDate(addDays(startDate, colCount === 7 ? 7 : 1))}><ChevronRight size={14} /></button>
                    <span className="text-xs font-medium flex-1" style={{ color: 'var(--t-text)' }}>
                      {colCount === 1
                        ? format(startDate, 'EEEE, MMMM d, yyyy')
                        : `${format(startDate, 'MMM d')} – ${format(addDays(startDate, colCount - 1), 'MMM d, yyyy')}`}
                    </span>
                    <div className="flex gap-1">
                      {([1, 3, 7] as ColCount[]).map(n => (
                        <button key={n} onClick={() => handleSetColCount(n)} className={`pill ${colCount === n ? 'active' : ''}`}>{n}</button>
                      ))}
                    </div>
                    <button className="btn-ghost text-xs px-2 py-1" onClick={handleToday}>Today</button>
                  </div>
                  <TeuxView
                    colCount={colCount}
                    startDate={startDate}
                    tasks={tasks}
                    onToggleDone={handleToggleDone}
                    onEdit={editTask}
                    onDelete={removeTask}
                    onAdd={addTask}
                    onReorder={reorder}
                  />
                </>
              ) : legacyView === 'daily' ? (
                <DailyView
                  tasks={filteredTasks}
                  onEdit={editTask}
                  onDelete={removeTask}
                  onCycle={cycleStatus}
                  onAdd={addTask}
                  setTasks={setTasks}
                />
              ) : legacyView === 'weekly' ? (
                <WeeklyView
                  tasks={filteredTasks}
                  onEdit={editTask}
                  onCycle={cycleStatus}
                />
              ) : legacyView === 'board' ? (
                <BoardView
                  tasks={filteredTasks}
                  onEdit={editTask}
                  onDelete={removeTask}
                  onCycle={cycleStatus}
                  onAdd={addTask}
                />
              ) : legacyView === 'branch' ? (
                <BranchView
                  tasks={filteredTasks}
                  activeBranch={activeBranch}
                  onEdit={editTask}
                  onDelete={removeTask}
                  onCycle={cycleStatus}
                />
              ) : (
                <AnalyticsView tasks={filteredTasks} />
              )}
            </div>
          </div>
        </div>
      </BranchesContext.Provider>
    )
  }

  // ── Teux layout ────────────────────────────────────────────────────────────
  return (
    <BranchesContext.Provider value={{ branches, getColor }}>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        <TopBar
          colCount={colCount}
          setColCount={handleSetColCount}
          onToday={handleToday}
          view={view}
          setView={setView}
          startDate={startDate}
          setStartDate={setStartDate}
          onBacklog={() => setShowBacklog(true)}
          onBranches={() => setShowBranchMgr(true)}
          onSignOut={signOut}
          backlogCount={backlogCount}
          onLegacy={() => setLayout('legacy')}
          theme={theme}
          onToggleTheme={toggleTheme}
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
            onReorder={reorder}
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
