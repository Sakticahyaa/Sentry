import type { Task } from '../types/task'

function branchPrefix(branch: string | null): string {
  if (!branch) return 'TSK'
  return branch.slice(0, 3).toUpperCase()
}

/** Returns a map of task.id → display ID like "MER-001" */
export function buildDisplayIds(tasks: Task[]): Map<string, string> {
  // Group by branch, sorted by created_at ascending within each group
  const groups = new Map<string, Task[]>()

  for (const task of tasks) {
    const key = task.branch ?? '__none__'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(task)
  }

  const result = new Map<string, string>()

  for (const [key, group] of groups) {
    const branch = key === '__none__' ? null : key
    const prefix = branchPrefix(branch)
    const sorted = [...group].sort((a, b) =>
      a.created_at.localeCompare(b.created_at)
    )
    sorted.forEach((task, i) => {
      result.set(task.id, `${prefix}-${String(i + 1).padStart(3, '0')}`)
    })
  }

  return result
}
