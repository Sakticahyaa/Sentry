import { createClient } from '@supabase/supabase-js'
import type { Task, TaskInsert, TaskUpdate, Filters } from '../types/task'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  },
})

// ─── Tasks API ────────────────────────────────────────────────────────────────

export async function fetchTasks(filters?: Partial<Filters>): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('order', { ascending: true })
    .order('created_at', { ascending: false })

  if (filters?.branch) query = query.eq('branch', filters.branch)
  if (filters?.status) query = query.eq('status', filters.status)
if (filters?.assigned_date_from) query = query.gte('assigned_date', filters.assigned_date_from)
  if (filters?.assigned_date_to) query = query.lte('assigned_date', filters.assigned_date_to)
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Task[]
}

export async function createTask(task: Partial<TaskInsert>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single()
  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function bulkUpdateTasks(ids: string[], updates: TaskUpdate): Promise<void> {
  const { error } = await supabase.from('tasks').update(updates).in('id', ids)
  if (error) throw error
}

export async function reorderTasks(updates: { id: string; order: number }[]): Promise<void> {
  const promises = updates.map(({ id, order }) =>
    supabase.from('tasks').update({ order }).eq('id', id)
  )
  await Promise.all(promises)
}

// ─── Branches API ─────────────────────────────────────────────────────────────

import type { BranchRecord } from '../types/task'

export async function fetchBranches(): Promise<BranchRecord[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as BranchRecord[]
}

export async function createBranch(name: string, color: string): Promise<BranchRecord> {
  const { data, error } = await supabase
    .from('branches')
    .insert([{ name, color }])
    .select()
    .single()
  if (error) throw error
  return data as BranchRecord
}

export async function deleteBranch(id: string, name: string): Promise<void> {
  // Nullify branch on all tasks that had this branch
  await supabase.from('tasks').update({ branch: null }).eq('branch', name)
  const { error } = await supabase.from('branches').delete().eq('id', id)
  if (error) throw error
}

export async function updateBranch(id: string, updates: Partial<Pick<BranchRecord, 'name' | 'color'>>): Promise<BranchRecord> {
  const { data, error } = await supabase
    .from('branches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as BranchRecord
}
