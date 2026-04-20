export type Branch = string   // dynamic — stored in branches table
export type ViewType = 'daily' | 'board' | 'branch' | 'teux'
export type Status = 'Not Yet' | 'Done'

export interface BranchRecord {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  branch: Branch | null
  status: Status
  notes: string | null
  assigned_date: string | null
  order: number
  created_at: string
  updated_at: string
}

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<TaskInsert>

export interface Filters {
  branch: Branch | null
  status: Status | null
  search: string
  assigned_date_from: string | null
  assigned_date_to: string | null
}
