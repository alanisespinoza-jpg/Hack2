import { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import type { SignalType, Severity, SignalStatus } from '../../types/api'

const TYPE_OPTIONS: { value: SignalType | ''; label: string }[] = [
  { value: '',                   label: 'Todos los tipos' },
  { value: 'HAMBRE',             label: 'Hambre' },
  { value: 'ABANDONO',           label: 'Abandono' },
  { value: 'MUTACION',           label: 'Mutación' },
  { value: 'FUGA',               label: 'Fuga' },
  { value: 'CONFLICTO',          label: 'Conflicto' },
  { value: 'REPRODUCCION_MASIVA',label: 'Reprod. Masiva' },
  { value: 'SENAL_CORRUPTA',     label: 'Señal Corrupta' },
]

const SEVERITY_OPTIONS: { value: Severity | ''; label: string }[] = [
  { value: '',         label: 'Todas las severidades' },
  { value: 'LEVE',     label: 'Leve' },
  { value: 'MODERADO', label: 'Moderado' },
  { value: 'GRAVE',    label: 'Grave' },
  { value: 'CRITICO',  label: 'Crítico' },
]

const STATUS_OPTIONS: { value: SignalStatus | ''; label: string }[] = [
  { value: '',           label: 'Todos los estados' },
  { value: 'RECIBIDA',   label: 'Recibida' },
  { value: 'PROCESANDO', label: 'Procesando' },
  { value: 'ATENDIDA',   label: 'Atendida' },
]

const SELECT =
  'rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-cyan-600 focus:outline-none'

interface SignalsFeedFiltersProps {
  q: string
  signalType: SignalType | ''
  severity: Severity | ''
  status: SignalStatus | ''
  hasActiveFilters: boolean
  onQ: (v: string) => void
  onSignalType: (v: SignalType | '') => void
  onSeverity: (v: Severity | '') => void
  onStatus: (v: SignalStatus | '') => void
  onClear: () => void
}

export function SignalsFeedFilters({
  q, signalType, severity, status, hasActiveFilters,
  onQ, onSignalType, onSeverity, onStatus, onClear,
}: SignalsFeedFiltersProps) {
  const [localQ, setLocalQ] = useState(q)
  const debouncedQ = useDebounce(localQ, 400)

  useEffect(() => { setLocalQ(q) }, [q])

  useEffect(() => {
    if (debouncedQ !== q) onQ(debouncedQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  return (
    <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
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
          placeholder="Buscar señal..."
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          maxLength={80}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={signalType}
          onChange={(e) => onSignalType(e.target.value as SignalType | '')}
          className={SELECT}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={severity}
          onChange={(e) => onSeverity(e.target.value as Severity | '')}
          className={SELECT}
        >
          {SEVERITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => onStatus(e.target.value as SignalStatus | '')}
          className={SELECT}
        >
          {STATUS_OPTIONS.map((o) => (
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
  )
}
