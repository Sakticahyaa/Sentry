export type Branch = string   // dynamic — stored in branches table
export type ViewType = 'daily' | 'weekly' | 'board' | 'branch' | 'analytics' | 'teux'
export type Status = 'Not Yet' | 'Ongoing' | 'Done'
export type TimeBlock = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'H0' | 'H1' | 'H2' | 'H3'
export type Priority = 1 | 2 | 3 | 4 | 5

export interface BranchRecord {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  branch: Branch | null
  deadline: string | null
  priority: Priority
  status: Status
  notes: string | null
  assigned_date: string | null
  estimated_time: number | null
  time_block: TimeBlock | null
  order: number
  created_at: string
  updated_at: string
}

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<TaskInsert>

export interface Filters {
  branch: Branch | null
  status: Status | null
  time_block: TimeBlock | null
  priority: Priority | null
  search: string
  assigned_date_from: string | null
  assigned_date_to: string | null
}
