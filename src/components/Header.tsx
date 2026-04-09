import { Search, X } from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface HeaderProps {
  search: string
  onSearchChange: (s: string) => void
  title: string
}

export function Header({ search, onSearchChange, title }: HeaderProps) {
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-6 py-3 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-gray-100">{title}</h1>
        <p className="text-xs text-gray-500">{today}</p>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="input pl-8 pr-8 py-1.5 text-xs"
          placeholder="Cari tugas..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </header>
  )
}
