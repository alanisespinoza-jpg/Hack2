import type { SignalDTO, SignalType, SignalStatus } from '../../types/api'
import { Badge } from '../ui/Badge'

const typeLabels: Record<SignalType, string> = {
  HAMBRE:             'Hambre',
  ABANDONO:           'Abandono',
  MUTACION:           'Mutación',
  FUGA:               'Fuga',
  CONFLICTO:          'Conflicto',
  REPRODUCCION_MASIVA:'Reprod. Masiva',
  SENAL_CORRUPTA:     'Señal Corrupta',
}

const statusStyles: Record<SignalStatus, string> = {
  RECIBIDA:   'bg-slate-800 text-slate-400 border border-slate-600',
  PROCESANDO: 'bg-blue-900/60 text-blue-300 border border-blue-700',
  ATENDIDA:   'bg-emerald-900/60 text-emerald-300 border border-emerald-700',
}

const statusLabels: Record<SignalStatus, string> = {
  RECIBIDA:   'Recibida',
  PROCESANDO: 'Procesando',
  ATENDIDA:   'Atendida',
}

interface SignalCardProps {
  signal: SignalDTO
  onClick: (id: string) => void
}

export function SignalCard({ signal, onClick }: SignalCardProps) {
  const time = new Date(signal.createdAt).toLocaleString('es', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(signal.id)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(signal.id)}
      className="flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/80 p-4 transition-colors hover:border-cyan-800 hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500"
    >
      {/* Top row: type + severity */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-300">
          {typeLabels[signal.signalType]}
        </span>
        <Badge variant="severity" value={signal.severity} />
      </div>

      {/* Tropel info */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">
          {signal.tropel.name}
        </span>
        <Badge variant="species" value={signal.tropel.species} />
      </div>

      {/* Raw content */}
      <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
        {signal.rawContent}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-800 pt-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[signal.status]}`}
        >
          {statusLabels[signal.status]}
        </span>
        <time dateTime={signal.createdAt} className="text-xs text-gray-600">
          {time}
        </time>
      </div>
    </article>
  )
}
