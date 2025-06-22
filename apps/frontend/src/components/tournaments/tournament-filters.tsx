'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TournamentFiltersProps {
  currentFilter: 'all' | 'upcoming' | 'active' | 'completed'
  onFilterChange: (filter: 'all' | 'upcoming' | 'active' | 'completed') => void
}

export function TournamentFilters({ currentFilter, onFilterChange }: TournamentFiltersProps) {
  const filters = [
    { key: 'all' as const, label: 'All Tournaments' },
    { key: 'upcoming' as const, label: 'Upcoming' },
    { key: 'active' as const, label: 'Active' },
    { key: 'completed' as const, label: 'Completed' },
  ]

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={currentFilter === filter.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className={cn(
            'whitespace-nowrap',
            currentFilter === filter.key && 'bg-gaming-primary hover:bg-gaming-primary/90'
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}