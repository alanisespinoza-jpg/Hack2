import type { TropelDTO } from '../../types/api'
import { Badge } from '../ui/Badge'

interface TropelCardProps {
  tropel: TropelDTO
}

function EnergyBar({ value }: { value: number }) {
  const color =
    value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-700">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  )
}

export function TropelCard({ tropel }: TropelCardProps) {
  const updatedAgo = new Date(tropel.updatedAt).toLocaleString('es', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/80 p-4 transition-colors hover:border-cyan-800 hover:bg-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{tropel.name}</h3>
          <p className="mt-0.5 truncate text-xs text-gray-500">{tropel.sector.name}</p>
        </div>
        <Badge variant="vitalState" value={tropel.vitalState} />
      </div>

      {/* Species */}
      <Badge variant="species" value={tropel.species} className="self-start" />

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Energía</span>
          <span className="font-mono">{tropel.energyLevel}%</span>
        </div>
        <EnergyBar value={tropel.energyLevel} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-gray-800/60 p-2">
          <p className="text-gray-500">Caos</p>
          <p className="font-mono font-semibold text-orange-400">{tropel.chaosIndex}</p>
        </div>
        <div className="rounded-lg bg-gray-800/60 p-2">
          <p className="text-gray-500">Mutación</p>
          <p className="font-mono font-semibold text-violet-400">Stage {tropel.mutationStage}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-800 pt-2 text-xs text-gray-600">
        <span>Guardian: <span className="text-gray-400">{tropel.guardianName}</span></span>
        <time dateTime={tropel.updatedAt}>{updatedAgo}</time>
      </div>
    </article>
  )
}
