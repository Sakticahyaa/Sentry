import type { TimeBlock } from '../types/task'

export const TIME_BLOCKS: { value: TimeBlock; label: string; range: string }[] = [
  { value: 'Q1', label: 'Q1', range: '06:00–09:00' },
  { value: 'Q2', label: 'Q2', range: '09:00–12:00' },
  { value: 'Q3', label: 'Q3', range: '12:00–15:00' },
  { value: 'Q4', label: 'Q4', range: '15:00–18:00' },
  { value: 'Q5', label: 'Q5', range: '18:00–21:00' },
  { value: 'Q6', label: 'Q6', range: '21:00–00:00' },
  { value: 'H0', label: 'H0', range: '00:00–06:00' },
  { value: 'H1', label: 'H1 (Pagi)', range: '06:00–12:00' },
  { value: 'H2', label: 'H2 (Siang)', range: '12:00–18:00' },
  { value: 'H3', label: 'H3 (Malam)', range: '18:00–00:00' },
]

export const PRIORITY_CONFIG = [
  { value: 1, label: 'Kritis', icon: '🔴' },
  { value: 2, label: 'Tinggi', icon: '🟠' },
  { value: 3, label: 'Sedang', icon: '🟡' },
  { value: 4, label: 'Rendah', icon: '🔵' },
  { value: 5, label: 'Opsional', icon: '⚪' },
]

export const OVERCOMMIT_HOURS = 12
