import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskInsert, TaskUpdate, Filters } from '../types/task'
import { fetchTasks, createTask, updateTask, deleteTask, bulkUpdateTasks } from '../lib/supabase'

const defaultFilters: Filters = {
  branch: null,
  status: null,
  time_block: null,
  priority: null,
  search: '',
  assigned_date_from: null,
  assigned_date_to: null,
}

export function useTasks(initialFilters?: Partial<Filters>) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters, ...initialFilters })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTasks(filters)
      setTasks(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  const addTask = async (task: Partial<TaskInsert>): Promise<void> => {
    const created = await createTask(task)
    setTasks(prev => [created, ...prev])
  }

  const editTask = async (id: string, updates: TaskUpdate): Promise<void> => {
    const updated = await updateTask(id, updates)
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
  }

  const removeTask = async (id: string) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const bulkUpdate = async (ids: string[], updates: TaskUpdate) => {
    await bulkUpdateTasks(ids, updates)
    setTasks(prev =>
      prev.map(t => (ids.includes(t.id) ? { ...t, ...updates } : t))
    )
  }

  const cycleStatus = async (task: Task) => {
    const next: Record<Task['status'], Task['status']> = {
      'Not Yet': 'Ongoing',
      'Ongoing': 'Done',
      'Done': 'Not Yet',
    }
    await editTask(task.id, { status: next[task.status] })
  }

  const updateFilter = (key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => setFilters(defaultFilters)

  return {
    tasks,
    loading,
    error,
    filters,
    reload: load,
    addTask,
    editTask,
    removeTask,
    bulkUpdate,
    cycleStatus,
    updateFilter,
    clearFilters,
    setTasks,
  }
}
