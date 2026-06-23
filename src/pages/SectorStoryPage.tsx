import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import type { SectorStory, StoryStage, Climate } from '../types/api'

// ── Color tokens ──────────────────────────────────────────────────────────────
const TOKEN_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  emerald:  { bg: '#064e3b', accent: '#34d399', text: '#a7f3d0' },
  violet:   { bg: '#2e1065', accent: '#a78bfa', text: '#ddd6fe' },
  rose:     { bg: '#4c0519', accent: '#fb7185', text: '#fecdd3' },
  amber:    { bg: '#451a03', accent: '#fbbf24', text: '#fde68a' },
  sky:      { bg: '#0c4a6e', accent: '#38bdf8', text: '#bae6fd' },
  fuchsia:  { bg: '#4a044e', accent: '#e879f9', text: '#f5d0fe' },
  red:      { bg: '#450a0a', accent: '#f87171', text: '#fecaca' },
  cyan:     { bg: '#083344', accent: '#22d3ee', text: '#a5f3fc' },
}

const DEFAULT_COLOR = TOKEN_COLORS.violet

function getColor(token: string) {
  return TOKEN_COLORS[token.toLowerCase()] ?? DEFAULT_COLOR
}

// ── Climate visuals ───────────────────────────────────────────────────────────
const CLIMATE_SYMBOL: Record<Climate, string> = {
  PIXEL_FOREST:    '🌲',
  NEON_CAVE:       '🔮',
  CLOUD_AQUARIUM:  '🐟',
  RETRO_ARCADE:    '🕹️',
}

const EVENT_SYMBOL: Record<string, string> = {
  HAMBRE:              '🍖',
  ABANDONO:            '👤',
  MUTACION:            '🧬',
  FUGA:                '💨',
  CONFLICTO:           '⚡',
  REPRODUCCION_MASIVA: '🌀',
  SENAL_CORRUPTA:      '📡',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function supportsScrollTimeline(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()')
}

function supportsViewTransition(): boolean {
  return 'startViewTransition' in document
}

// ── Stage Visual ──────────────────────────────────────────────────────────────
function StageVisual({
  stage,
  climate,
  active,
}: {
  stage: StoryStage
  climate: Climate
  active: boolean
}) {
  const color = getColor(stage.colorToken)

  return (
    <div
      role="img"
      aria-label={`Visualización: ${stage.title}`}
      className="relative w-full h-full flex flex-col items-center justify-center rounded-2xl overflow-hidden transition-all duration-700"
      style={{
        background: `radial-gradient(circle at 60% 40%, ${color.accent}22 0%, ${color.bg} 70%)`,
        border: `1.5px solid ${color.accent}44`,
        opacity: active ? 1 : 0.4,
        transform: active ? 'scale(1)' : 'scale(0.97)',
      }}
    >
      {/* Ambient orb */}
      <div
        className="absolute rounded-full blur-3xl transition-all duration-1000"
        style={{
          width: active ? '55%' : '35%',
          height: active ? '55%' : '35%',
          background: color.accent,
          opacity: active ? 0.18 : 0.06,
          top: '15%',
          right: '10%',
        }}
      />

      {/* Climate + Event icons */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <span className="text-6xl md:text-7xl select-none" aria-hidden="true">
          {CLIMATE_SYMBOL[climate]}
        </span>
        <span
          className="text-3xl md:text-4xl select-none transition-all duration-500"
          style={{ filter: active ? 'none' : 'grayscale(1)' }}
          aria-hidden="true"
        >
          {EVENT_SYMBOL[stage.dominantEvent] ?? '🔹'}
        </span>
      </div>

      {/* Metrics */}
      <div className="relative z-10 mt-6 grid grid-cols-3 gap-3 px-6 w-full max-w-xs">
        {(
          [
            ['Estabilidad', stage.metrics.stability, '%'],
            ['Energía', stage.metrics.energy, '%'],
            ['Alertas', stage.metrics.alerts, ''],
          ] as const
        ).map(([label, val, unit]) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl py-2 px-1"
            style={{ background: `${color.accent}18` }}
          >
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: color.accent }}
            >
              {val}{unit}
            </span>
            <span className="text-[10px] text-center mt-0.5" style={{ color: color.text }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mt-5 w-4/5 h-1.5 rounded-full overflow-hidden" style={{ background: `${color.accent}22` }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.round(stage.progress * 100)}%`,
            background: color.accent,
          }}
        />
      </div>

      {/* Stage order badge */}
      <div
        className="absolute top-4 left-4 text-xs font-mono px-2 py-0.5 rounded-full"
        style={{ background: `${color.accent}22`, color: color.accent }}
      >
        {String(stage.order + 1).padStart(2, '0')} / 08
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SectorStoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [story, setStory] = useState<SectorStory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState(0)
  const [showStory, setShowStory] = useState(false)

  const stageRefs = useRef<(HTMLElement | null)[]>([])
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ── Fetch ──
  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    api
      .get<SectorStory>(`/sectors/${id}/story`)
      .then(r => setStory(r.data))
      .catch(() => setError('No se pudo cargar la historia del sector.'))
      .finally(() => setLoading(false))
  }, [id])

  // ── Intersection observer — activate stage on scroll ──
  useEffect(() => {
    if (!story || reducedMotion) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = stageRefs.current.indexOf(entry.target as HTMLElement)
            if (idx !== -1) setActiveStage(idx)
          }
        })
      },
      { threshold: 0.5 }
    )

    stageRefs.current.forEach(el => { if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [story, reducedMotion])

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!story) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        const next = Math.min(activeStage + 1, story.stages.length - 1)
        setActiveStage(next)
        stageRefs.current[next]?.focus()
        stageRefs.current[next]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const prev = Math.max(activeStage - 1, 0)
        setActiveStage(prev)
        stageRefs.current[prev]?.focus()
        stageRefs.current[prev]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
      }
    },
    [activeStage, story, reducedMotion]
  )

  // ── View Transition: resumen → historia ──
  const handleShowStory = () => {
    if (supportsViewTransition() && !reducedMotion) {
      document.startViewTransition(() => { setShowStory(true) })
    } else {
      setShowStory(true)
    }
  }

  // ── View Transition: historia → resumen ──
  const handleBack = () => {
    if (supportsViewTransition() && !reducedMotion) {
      document.startViewTransition(() => { setShowStory(false) })
    } else {
      setShowStory(false)
    }
  }

  // ── Loading / Error ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🌀</div>
          <p>Cargando historia del sector…</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-4">
        <div>
          <p className="text-red-400 mb-4">{error ?? 'Historia no encontrada.'}</p>
          <button
            onClick={() => navigate('/sectors')}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            ← Volver a sectores
          </button>
        </div>
      </div>
    )
  }

  const { sector, stages } = story
  const currentStage = stages[activeStage]

  // ── Summary view ──
  if (!showStory) {
    return (
      <div
        className="min-h-screen bg-gray-950 text-white"
        style={{ viewTransitionName: 'story-root' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link to="/sectors" className="text-gray-400 hover:text-white text-sm">← Sectores</Link>

          <div className="mt-8 mb-6">
            <p className="text-xs font-mono text-indigo-400 mb-1">{sector.climate.replace('_', ' ')}</p>
            <h1 className="text-4xl font-bold mb-3">{sector.name}</h1>
            <p className="text-gray-400 text-sm">
              {stages.length} etapas · Historia del sector
            </p>
          </div>

          {/* Stage previews */}
          <div className="space-y-2 mb-10">
            {stages.map((s, i) => {
              const c = getColor(s.colorToken)
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: `${c.accent}0f`, border: `1px solid ${c.accent}22` }}
                >
                  <span className="text-xs font-mono tabular-nums" style={{ color: c.accent }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-white">{s.title}</span>
                  <span className="ml-auto text-xs" style={{ color: c.text }}>
                    {EVENT_SYMBOL[s.dominantEvent]}
                  </span>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleShowStory}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            aria-label="Comenzar la historia del sector"
          >
            Comenzar historia →
          </button>
        </div>
      </div>
    )
  }

  // ── Story view — scrollytelling ──
  return (
    <div
      className="bg-gray-950 text-white"
      style={{ viewTransitionName: 'story-root' }}
      onKeyDown={handleKeyDown}
    >
      {/* ── Sticky visual panel (desktop) ── */}
      <div className="hidden lg:block fixed top-0 left-0 w-[45vw] h-screen p-8 z-10">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white text-sm"
              aria-label="Volver al resumen"
            >
              ← Resumen
            </button>
            <span className="text-xs font-mono text-gray-500">{sector.name}</span>
          </div>

          {/* Visual */}
          <div className="flex-1">
            <StageVisual stage={currentStage} climate={sector.climate} active />
          </div>

          {/* Overall progress */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span>{activeStage + 1} / {stages.length}</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-gray-600 mt-3 text-center">
            ↑ ↓ para navegar entre etapas
          </p>
        </div>
      </div>

      {/* ── Scrollable stages ── */}
      <div className="lg:ml-[45vw]">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 bg-gray-950/90 backdrop-blur px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <button onClick={handleBack} className="text-gray-400 hover:text-white text-sm">← Resumen</button>
          <span className="text-xs font-mono text-gray-400">{sector.name}</span>
          <span className="text-xs text-indigo-400">{activeStage + 1}/{stages.length}</span>
        </div>

        {/* Mobile progress bar */}
        <div className="lg:hidden h-1 bg-gray-800">
          <div
            className={`h-full bg-indigo-500 transition-all ${reducedMotion ? '' : 'duration-500'}`}
            style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }}
          />
        </div>

        {stages.map((stage, idx) => {
          const color = getColor(stage.colorToken)
          const isActive = idx === activeStage

          return (
            <section
              key={stage.id}
              id={`stage-${idx}`}
              ref={el => { stageRefs.current[idx] = el }}
              tabIndex={0}
              aria-label={`Etapa ${idx + 1}: ${stage.title}`}
              className={[
                'min-h-screen flex flex-col justify-center px-6 py-16 lg:py-24',
                'transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                reducedMotion ? '' : 'duration-700',
                isActive ? 'opacity-100' : 'opacity-40',
              ].join(' ')}
              style={
                supportsScrollTimeline() && !reducedMotion
                  ? {
                      // CSS Scroll-driven animation: fade in as the section enters view
                      animationName: 'stageReveal',
                      animationTimeline: 'view()',
                      animationRange: 'entry 0% entry 40%',
                      animationFillMode: 'both',
                    }
                  : undefined
              }
            >
              {/* Mobile visual */}
              <div className="lg:hidden w-full h-56 mb-8">
                <StageVisual stage={stage} climate={sector.climate} active={isActive} />
              </div>

              <div className="max-w-lg">
                {/* Stage number + event */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${color.accent}22`, color: color.accent }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-gray-400">
                    {EVENT_SYMBOL[stage.dominantEvent]} {stage.dominantEvent.replace('_', ' ')}
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="text-3xl md:text-4xl font-bold mb-5 leading-tight"
                  style={{ color: isActive ? color.accent : 'inherit' }}
                >
                  {stage.title}
                </h2>

                {/* Narrative */}
                <p className="text-gray-300 text-base leading-relaxed mb-8">
                  {stage.narrative}
                </p>

                {/* Metrics — visible on mobile/tablet */}
                <div className="lg:hidden grid grid-cols-3 gap-3 mb-6">
                  {(
                    [
                      ['Estabilidad', stage.metrics.stability, '%'],
                      ['Energía', stage.metrics.energy, '%'],
                      ['Alertas', stage.metrics.alerts, ''],
                    ] as const
                  ).map(([label, val, unit]) => (
                    <div
                      key={label}
                      className="rounded-xl p-3 text-center"
                      style={{ background: `${color.accent}18` }}
                    >
                      <p className="text-xl font-bold tabular-nums" style={{ color: color.accent }}>
                        {val}{unit}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress within stage */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(stage.progress * 100)}%`,
                        background: color.accent,
                        transition: reducedMotion ? 'none' : 'width 0.7s ease',
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums" style={{ color: color.text }}>
                    {Math.round(stage.progress * 100)}%
                  </span>
                </div>

                {/* Navigation buttons — keyboard-accessible alternative */}
                <div className="flex gap-3 mt-8">
                  {idx > 0 && (
                    <button
                      onClick={() => {
                        const prev = idx - 1
                        setActiveStage(prev)
                        stageRefs.current[prev]?.scrollIntoView({
                          behavior: reducedMotion ? 'auto' : 'smooth',
                          block: 'center',
                        })
                      }}
                      className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-600"
                    >
                      ← Anterior
                    </button>
                  )}
                  {idx < stages.length - 1 ? (
                    <button
                      onClick={() => {
                        const next = idx + 1
                        setActiveStage(next)
                        stageRefs.current[next]?.scrollIntoView({
                          behavior: reducedMotion ? 'auto' : 'smooth',
                          block: 'center',
                        })
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: `${color.accent}22`, color: color.accent }}
                    >
                      Siguiente →
                    </button>
                  ) : (
                    <button
                      onClick={handleBack}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                      ✓ Fin de la historia
                    </button>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* CSS Scroll-driven animation keyframes — injected globally */}
      <style>{`
        @keyframes stageReveal {
          from { opacity: 0.2; transform: translateY(24px); }
          to   { opacity: 1;   transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        ::view-transition-old(story-root) {
          animation: 300ms ease both fade-out;
        }
        ::view-transition-new(story-root) {
          animation: 300ms ease both fade-in;
        }

        @keyframes fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes fade-in  { from { opacity: 0 } to { opacity: 1 } }

        @media (prefers-reduced-motion: reduce) {
          ::view-transition-old(story-root),
          ::view-transition-new(story-root) {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
