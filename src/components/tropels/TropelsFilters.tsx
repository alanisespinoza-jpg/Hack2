import { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { useSectors } from '../../hooks/useSectors'
import type { Species, VitalState, TropelSort } from '../../types/api'

const SPECIES_OPTIONS: { value: Species | ''; label: string }[] = [
  { value: '', label: 'Todas las especies' },
  { value: 'BLOBITO',  label: 'Blobito' },
  { value: 'CHISPA',   label: 'Chispa' },
  { value: 'GRUNON',   label: 'Gruñon' },
  { value: 'DORMILON', label: 'Dormilón' },
  { value: 'GLITCHY',  label: 'Glitchy' },
]

const VITAL_OPTIONS: { value: VitalState | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'ESTABLE',    label: 'Estable' },
  { value: 'HAMBRIENTO', label: 'Hambriento' },
  { value: 'AGITADO',    label: 'Agitado' },
  { value: 'MUTANDO',    label: 'Mutando' },
  { value: 'CRITICO',    label: 'Crítico' },
]

const SORT_OPTIONS: { value: TropelSort; label: string }[] = [
  { value: 'updatedAt,desc',  label: 'Más recientes' },
  { value: 'name,asc',        label: 'Nombre A-Z' },
  { value: 'chaosIndex,desc', label: 'Mayor caos' },
]

const SIZE_OPTIONS: { value: 10 | 20 | 50; label: string }[] = [
  { value: 10, label: '10 / pág' },
  { value: 20, label: '20 / pág' },
  { value: 50, label: '50 / pág' },
]

// Shared select style
const SELECT =
  'rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-cyan-600 focus:outline-none'

interface TropelsFiltersProps {
  q: string
  species: Species | ''
  vitalState: VitalState | ''
  sectorId: string
  sort: TropelSort
  size: 10 | 20 | 50
  onQ: (v: string) => void
  onSpecies: (v: Species | '') => void
  onVitalState: (v: VitalState | '') => void
  onSectorId: (v: string) => void
  onSort: (v: TropelSort) => void
  onSize: (v: 10 | 20 | 50) => void
  onClear: () => void
  hasActiveFilters: boolean
}

export function TropelsFilters({
  q, species, vitalState, sectorId, sort, size,
  onQ, onSpecies, onVitalState, onSectorId, onSort, onSize,
  onClear, hasActiveFilters,
}: TropelsFiltersProps) {
  const { sectors } = useSectors()

  // Local search state with debounce — prevents a request per keystroke
  const [localQ, setLocalQ] = useState(q)
  const debouncedQ = useDebounce(localQ, 400)

  // Sync URL → local when URL changes externally (e.g. back button)
  useEffect(() => {
    setLocalQ(q)
  }, [q])

  // Push debounced value to URL
  useEffect(() => {
    if (debouncedQ !== q) onQ(debouncedQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  return (
    <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
      {/* Row 1: Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          placeholder="Buscar Tropel..."
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          maxLength={80}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-600 focus:outline-none"
        />
      </div>

      {/* Row 2: Filters + sort + size */}
      <div className="flex flex-wrap gap-2">
        <select
          value={species}
          onChange={(e) => onSpecies(e.target.value as Species | '')}
          className={SELECT}
        >
          {SPECIES_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={vitalState}
          onChange={(e) => onVitalState(e.target.value as VitalState | '')}
          className={SELECT}
        >
          {VITAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={sectorId}
          onChange={(e) => onSectorId(e.target.value)}
          className={SELECT}
        >
          <option value="">Todos los sectores</option>
          {sectors.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as TropelSort)}
            className={SELECT}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={size}
            onChange={(e) => onSize(Number(e.target.value) as 10 | 20 | 50)}
            className={SELECT}
          >
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-400 transition-colors hover:border-red-700 hover:text-red-400"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
