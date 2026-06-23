import type { Species, VitalState, Severity } from '../../types/api'

// ─── VitalState ───────────────────────────────────────────────────────────────

const vitalColors: Record<VitalState, string> = {
  ESTABLE:    'bg-emerald-900/60 text-emerald-300 border border-emerald-700',
  HAMBRIENTO: 'bg-yellow-900/60  text-yellow-300  border border-yellow-700',
  AGITADO:    'bg-orange-900/60  text-orange-300  border border-orange-700',
  MUTANDO:    'bg-violet-900/60  text-violet-300  border border-violet-700',
  CRITICO:    'bg-red-900/60     text-red-300     border border-red-700',
}

const vitalLabels: Record<VitalState, string> = {
  ESTABLE:    'Estable',
  HAMBRIENTO: 'Hambriento',
  AGITADO:    'Agitado',
  MUTANDO:    'Mutando',
  CRITICO:    'Crítico',
}

// ─── Species ─────────────────────────────────────────────────────────────────

const speciesColors: Record<Species, string> = {
  BLOBITO:  'bg-sky-900/60     text-sky-300     border border-sky-700',
  CHISPA:   'bg-yellow-900/60  text-yellow-300  border border-yellow-700',
  GRUNON:   'bg-orange-900/60  text-orange-300  border border-orange-700',
  DORMILON: 'bg-indigo-900/60  text-indigo-300  border border-indigo-700',
  GLITCHY:  'bg-fuchsia-900/60 text-fuchsia-300 border border-fuchsia-700',
}

// ─── Severity ─────────────────────────────────────────────────────────────────

const severityColors: Record<Severity, string> = {
  LEVE:     'bg-slate-800   text-slate-300  border border-slate-600',
  MODERADO: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700',
  GRAVE:    'bg-orange-900/60 text-orange-300 border border-orange-700',
  CRITICO:  'bg-red-900/60    text-red-300    border border-red-700',
}

// ─── Component ───────────────────────────────────────────────────────────────

interface BadgeProps {
  variant: 'vitalState' | 'species' | 'severity'
  value: VitalState | Species | Severity
  className?: string
}

export function Badge({ variant, value, className = '' }: BadgeProps) {
  let colorClass = ''
  let label = value as string

  if (variant === 'vitalState') {
    colorClass = vitalColors[value as VitalState]
    label = vitalLabels[value as VitalState]
  } else if (variant === 'species') {
    colorClass = speciesColors[value as Species]
  } else if (variant === 'severity') {
    colorClass = severityColors[value as Severity]
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide ${colorClass} ${className}`}
    >
      {label}
    </span>
  )
}
