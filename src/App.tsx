import { useState, useEffect, useRef } from 'react'
import { startOfWeek, addDays, format } from 'date-fns'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
import { DailyView } from './components/views/DailyView'
import { BoardView } from './components/views/BoardView'
import { BranchView } from './components/views/BranchView'
import { Modal } from './components/ui/Modal'
import { TaskForm } from './components/TaskForm'
import type { Branch, ViewType } from './types/task'

type ColCount = 1 | 3 | 7
type ViewMode = 'columns' | 'calendar'

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const navigate = useNavigate()

  const [colCount, setColCount]   = useState<ColCount>(7)
  const [view, setView]           = useState<ViewMode>('columns')
  const [startDate, setStartDate] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }))

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

  const [showBacklog, setShowBacklog]     = useState(false)
  const [showBranchMgr, setShowBranchMgr] = useState(false)

  // Legacy view state
  const [legacyView, setLegacyView]     = useState<ViewType>('daily')
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null)
  const [search, setSearch]             = useState('')
  const [showLegacyAdd, setShowLegacyAdd] = useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)

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
    const overdue = tasks.filter(t => t.assigned_date && t.assigned_date < today && t.status !== 'Done')
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

  return (
    <BranchesContext.Provider value={{ branches, getColor }}>
      <Routes>

        {/* ── Teux layout ──────────────────────────────────────────────────── */}
        <Route path="/hall" element={
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
              onLegacy={() => navigate('/control')}
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
                onPrev={() => setStartDate(addDays(startDate, colCount === 7 ? -7 : -1))}
                onNext={() => setStartDate(addDays(startDate, colCount === 7 ? 7 : 1))}
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
        } />

        {/* ── Legacy layout ─────────────────────────────────────────────────── */}
        <Route path="/control" element={(() => {
          const filteredTasks = search
            ? tasks.filter(t =>
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                (t.notes ?? '').toLowerCase().includes(search.toLowerCase())
              )
            : tasks

          return (
            <div className="flex h-screen overflow-hidden">
              <Sidebar
                view={legacyView}
                onViewChange={setLegacyView}
                activeBranch={activeBranch}
                onBranchChange={setActiveBranch}
                onAddTask={() => setShowLegacyAdd(true)}
                onManageBranches={() => setShowBranchMgr(true)}
                onSwitchToTeux={() => navigate('/hall')}
                onSignOut={signOut}
                mobileOpen={mobileSidebar}
                onMobileClose={() => setMobileSidebar(false)}
              />

              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top bar */}
                <div
                  className="relative flex items-center gap-2 px-4 shrink-0"
                  style={{ height: 52, borderBottom: '1px solid var(--t-border)', background: 'var(--t-card)' }}
                >
                  {/* Hamburger — mobile only */}
                  <button
                    className="sm:hidden btn-ghost p-1.5 mr-1"
                    onClick={() => setMobileSidebar(true)}
                    style={{ color: 'var(--t-text3)' }}
                  >
                    <Menu size={16} />
                  </button>
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-xs font-bold tracking-[0.2em] uppercase pointer-events-none"
                    style={{ color: 'var(--t-text)' }}
                  >
                    Sentry
                  </span>
                  <div className="flex-1" />
                  <div className="relative w-48">
                    <input
                      className="input pl-3 pr-3 py-1 text-xs w-full"
                      placeholder="Search..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <button onClick={toggleTheme} className="btn-ghost p-2">
                    {theme === 'dark'
                      ? <span style={{ color: '#C9A84C', fontSize: 14 }}>☀</span>
                      : <span style={{ color: 'var(--t-accent)', fontSize: 14 }}>☾</span>
                    }
                  </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-sm" style={{ color: '#cbd3d6' }}>Loading tasks...</span>
                    </div>
                  ) : legacyView === 'teux' ? (
                    <>
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
                    <DailyView tasks={filteredTasks} onEdit={editTask} onDelete={removeTask} onCycle={cycleStatus} onAdd={addTask} setTasks={setTasks} />
                  ) : legacyView === 'board' ? (
                    <BoardView tasks={filteredTasks} onEdit={editTask} onDelete={removeTask} onCycle={cycleStatus} onAdd={addTask} />
                  ) : (
                    <BranchView tasks={filteredTasks} activeBranch={activeBranch} onEdit={editTask} onDelete={removeTask} onCycle={cycleStatus} />
                  )}
                </div>
              </div>

              {showBranchMgr && (
                <BranchManager
                  branches={branches}
                  onAdd={addBranch}
                  onDelete={removeBranch}
                  onEdit={editBranch}
                  onClose={() => setShowBranchMgr(false)}
                />
              )}

              {showLegacyAdd && (
                <Modal open onClose={() => setShowLegacyAdd(false)} title="New Task">
                  <TaskForm
                    initial={{ branch: activeBranch ?? undefined }}
                    onSubmit={async data => { await addTask(data); setShowLegacyAdd(false) }}
                    onCancel={() => setShowLegacyAdd(false)}
                  />
                </Modal>
              )}
            </div>
          )
        })()} />

        <Route path="*" element={<Navigate to="/hall" replace />} />
      </Routes>
    </BranchesContext.Provider>
  )
}
