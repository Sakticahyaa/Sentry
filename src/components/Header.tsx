import { Search, X, Sun, Moon } from 'lucide-react'
import { format } from 'date-fns'

interface HeaderProps {
  search: string
  onSearchChange: (s: string) => void
  title: string
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Header({ search, onSearchChange, title, theme, onToggleTheme }: HeaderProps) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy")

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 px-6 py-3 backdrop-blur border-b"
      style={{ backgroundColor: 'var(--t-card)', borderColor: 'var(--t-border)' }}
    >
      <div className="flex-1">
        <h1 className="text-base font-semibold" style={{ color: 'var(--t-text)' }}>{title}</h1>
        <p className="text-xs" style={{ color: 'var(--t-text3)' }}>{today}</p>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-text3)' }} />
        <input
          className="input pl-8 pr-8 py-1.5 text-xs"
          placeholder="Search tasks..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--t-text3)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="btn-ghost p-2 rounded-lg"
        title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
      >
        {theme === 'dark'
          ? <Sun size={16} style={{ color: 'var(--t-gold)' }} />
          : <Moon size={16} style={{ color: 'var(--t-accent)' }} />
        }
      </button>
    </header>
  )
}
