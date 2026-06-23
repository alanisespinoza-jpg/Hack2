import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignalsFeed } from '../hooks/useSignalsFeed'
import { SignalCard } from '../components/signals/SignalCard'
import { SignalCardSkeleton } from '../components/signals/SignalCardSkeleton'
import { SignalsFeedFilters } from '../components/signals/SignalsFeedFilters'
import { FeedEndSentinel } from '../components/signals/FeedEndSentinel'
import { Spinner } from '../components/ui/Spinner'

const INITIAL_SKELETONS = 8

export default function SignalsFeedPage() {
  const navigate = useNavigate()
  const {
    items, hasMore, totalEstimate, isInitialLoading, isLoadingMore, error,
    loadMore, retry, snapshotForNavigation,
    signalType, severity, status, q,
    setSignalType, setSeverity, setStatus, setQ, clearFilters,
  } = useSignalsFeed()

  const hasActiveFilters = !!(signalType || severity || status || q)

  // ── Restore scroll position after snapshot re-hydration ───────────────────
  useEffect(() => {
    if (isInitialLoading) return

    const scrollY = sessionStorage.getItem('signals_scroll_restore_v1')
    if (!scrollY) return

    sessionStorage.removeItem('signals_scroll_restore_v1')
    // Two rAFs ensure React has painted before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: Number(scrollY), behavior: 'instant' })
      })
    })
  }, [isInitialLoading])

  function handleSignalClick(id: string) {
    // Save scroll position separately from the snapshot
    sessionStorage.setItem('signals_scroll_restore_v1', String(window.scrollY))
    snapshotForNavigation()
    navigate(`/signals/${id}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Feed de Señales
          </h1>
          {!isInitialLoading && totalEstimate > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              ~{totalEstimate} señales en total · {items.length} cargadas
            </p>
          )}
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <SignalsFeedFilters
        q={q}
        signalType={signalType}
        severity={severity}
        status={status}
        hasActiveFilters={hasActiveFilters}
        onQ={setQ}
        onSignalType={setSignalType}
        onSeverity={setSeverity}
        onStatus={setStatus}
        onClear={clearFilters}
      />

      {/* ── Error banner — keeps existing items intact ─────────────────────── */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          <span>⚠</span>
          <span>{error}</span>
          <button
            onClick={retry}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Feed list ──────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {isInitialLoading
          ? Array.from({ length: INITIAL_SKELETONS }).map((_, i) => (
              <SignalCardSkeleton key={i} />
            ))
          : items.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onClick={handleSignalClick}
              />
            ))}
      </div>

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!isInitialLoading && !error && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-500">
          <span className="text-5xl">📭</span>
          <p className="text-sm">Sin señales para los filtros actuales.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-1 text-xs text-cyan-500 underline hover:no-underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Loading more spinner ───────────────────────────────────────────── */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Spinner size="md" />
        </div>
      )}

      {/* ── End of list ────────────────────────────────────────────────────── */}
      {!isInitialLoading && !hasMore && items.length > 0 && (
        <p className="py-4 text-center text-xs text-gray-600">
          — Has llegado al final del feed —
        </p>
      )}

      {/* ── IntersectionObserver sentinel ─────────────────────────────────── */}
      <FeedEndSentinel
        onIntersect={loadMore}
        isEnabled={hasMore && !isLoadingMore && !isInitialLoading && !error}
      />
    </div>
  )
}
