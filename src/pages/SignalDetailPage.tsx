import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSignalById, updateSignalStatus } from '../api/signals'
import { saveUpdatedSignal } from '../hooks/useSignalsFeed'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import type { SignalDTO, UpdatableSignalStatus } from '../types/api'

const STATUS_LABEL: Record<string, string> = {
  RECIBIDA: 'Recibida', PROCESANDO: 'Procesando', ATENDIDA: 'Atendida',
}

export default function SignalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [signal, setSignal]         = useState<SignalDTO | null>(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [isPatching, setIsPatching]   = useState(false)
  const [patchError, setPatchError]   = useState<string | null>(null)
  const [patchSuccess, setPatchSuccess] = useState(false)

  // ── Load signal ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setIsLoading(true)
    setFetchError(null)

    getSignalById(id)
      .then((s) => {
        if (controller.signal.aborted) return
        setSignal(s)
        setIsLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setFetchError('No se pudo cargar la señal.')
        setIsLoading(false)
      })

    return () => controller.abort()
  }, [id])

  // ── PATCH status ────────────────────────────────────────────────────────────
  async function handleStatusChange(newStatus: UpdatableSignalStatus) {
    if (!signal || isPatching) return
    setIsPatching(true)
    setPatchError(null)
    setPatchSuccess(false)

    try {
      const updated = await updateSignalStatus(signal.id, newStatus)
      setSignal(updated)
      setPatchSuccess(true)
      // Let the feed know about this update when we navigate back
      saveUpdatedSignal(updated)
    } catch {
      setPatchError('Error al actualizar. Intenta de nuevo.')
    } finally {
      setIsPatching(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (fetchError || !signal) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-6 text-sm text-gray-400 hover:text-white">
          ← Volver al feed
        </button>
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-6 text-center text-red-300">
          <p>{fetchError ?? 'Señal no encontrada.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const canProcess = signal.status === 'RECIBIDA'
  const canAttend  = signal.status !== 'ATENDIDA'

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">

      {/* ── Back ─────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 transition-colors hover:text-white"
      >
        ← Volver al feed
      </button>

      {/* ── Detail card ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-white">
            Señal #{signal.id.slice(-6)}
          </h1>
          <span className="font-mono text-xs text-gray-600">{signal.id}</span>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="severity" value={signal.severity} />
          <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-300">
            {signal.signalType.replace('_', ' ')}
          </span>
        </div>

        {/* Tropel info */}
        <div className="rounded-xl bg-gray-800/60 p-4 space-y-1">
          <p className="text-xs text-gray-500">Tropel emisor</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{signal.tropel.name}</span>
            <Badge variant="species" value={signal.tropel.species} />
          </div>
        </div>

        {/* Raw content */}
        <div className="rounded-xl bg-gray-800/60 p-4">
          <p className="mb-1 text-xs text-gray-500">Contenido</p>
          <p className="text-sm leading-relaxed text-gray-200">{signal.rawContent}</p>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div>
            <p>Creada</p>
            <p className="text-gray-300">{new Date(signal.createdAt).toLocaleString('es')}</p>
          </div>
          <div>
            <p>Actualizada</p>
            <p className="text-gray-300">{new Date(signal.updatedAt).toLocaleString('es')}</p>
          </div>
        </div>

        {/* ── Status & actions ───────────────────────────────────────────────── */}
        <div className="space-y-3 border-t border-gray-800 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Estado actual</p>
            <span className="text-sm font-semibold text-white">
              {STATUS_LABEL[signal.status]}
            </span>
          </div>

          {/* Success message */}
          {patchSuccess && (
            <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-300">
              ✓ Estado actualizado correctamente.
            </div>
          )}

          {/* Error message — preserves current state, allows retry */}
          {patchError && (
            <div role="alert" className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-2 text-sm text-red-300">
              ⚠ {patchError}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {canProcess && (
              <button
                onClick={() => handleStatusChange('PROCESANDO')}
                disabled={isPatching}
                className="flex-1 rounded-lg border border-blue-700 bg-blue-900/40 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-900/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPatching ? <Spinner size="sm" className="mx-auto" /> : 'Procesar'}
              </button>
            )}
            {canAttend && (
              <button
                onClick={() => handleStatusChange('ATENDIDA')}
                disabled={isPatching}
                className="flex-1 rounded-lg border border-emerald-700 bg-emerald-900/40 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-900/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPatching ? <Spinner size="sm" className="mx-auto" /> : 'Atender'}
              </button>
            )}
            {!canProcess && !canAttend && (
              <p className="text-sm text-gray-500">Esta señal ya fue atendida.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
