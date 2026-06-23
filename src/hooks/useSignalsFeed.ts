import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { getSignalsFeed } from '../api/signals'
import type { SignalDTO, SignalType, Severity, SignalStatus } from '../types/api'

// ─── Session snapshot (position + items preserved across navigation) ──────────

const SNAPSHOT_KEY = 'signals_feed_snapshot_v1'
const UPDATED_SIGNAL_KEY = 'signals_updated_v1'

interface FeedSnapshot {
  items: SignalDTO[]
  nextCursor: string | null
  hasMore: boolean
  totalEstimate: number
  seenIds: string[]
  scrollY: number
  // Snapshot is only valid for the same filter set
  filterHash: string
}

function makeFilterHash(
  signalType: string,
  severity: string,
  status: string,
  q: string,
) {
  return [signalType, severity, status, q].join('|')
}

function loadSnapshot(): FeedSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY)
    return raw ? (JSON.parse(raw) as FeedSnapshot) : null
  } catch {
    return null
  }
}

export function saveSnapshot(
  data: Omit<FeedSnapshot, 'scrollY'>,
  scrollY: number,
) {
  try {
    sessionStorage.setItem(
      SNAPSHOT_KEY,
      JSON.stringify({ ...data, scrollY }),
    )
  } catch {
    // sessionStorage full — ignore
  }
}

export function clearSnapshot() {
  sessionStorage.removeItem(SNAPSHOT_KEY)
}

/** Called by SignalDetailPage after a successful PATCH */
export function saveUpdatedSignal(signal: SignalDTO) {
  try {
    sessionStorage.setItem(UPDATED_SIGNAL_KEY, JSON.stringify(signal))
  } catch {
    // ignore
  }
}

function popUpdatedSignal(): SignalDTO | null {
  try {
    const raw = sessionStorage.getItem(UPDATED_SIGNAL_KEY)
    if (!raw) return null
    sessionStorage.removeItem(UPDATED_SIGNAL_KEY)
    return JSON.parse(raw) as SignalDTO
  } catch {
    return null
  }
}

// ─── Initial snapshot resolution (runs once, before any useState) ────────────

/**
 * Reads the current URL search params WITHOUT using React hooks —
 * safe to call inside a useState lazy initializer or before useState calls.
 * Returns the snapshot only if its filterHash matches the current URL state.
 */
function resolveInitialSnapshot(): FeedSnapshot | null {
  const snap = loadSnapshot()
  if (!snap) return null
  const params = new URLSearchParams(window.location.search)
  const currentHash = makeFilterHash(
    params.get('signalType') ?? '',
    params.get('severity')   ?? '',
    params.get('status')     ?? '',
    params.get('q')          ?? '',
  )
  return snap.filterHash === currentHash ? snap : null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSignalsFeed() {
  const [searchParams, setSearchParams] = useSearchParams()

  const signalType = (searchParams.get('signalType') ?? '') as SignalType | ''
  const severity   = (searchParams.get('severity')   ?? '') as Severity | ''
  const status     = (searchParams.get('status')     ?? '') as SignalStatus | ''
  const q          = searchParams.get('q') ?? ''

  const filterHash = useMemo(
    () => makeFilterHash(signalType, severity, status, q),
    [signalType, severity, status, q],
  )

  // ── Bootstrap from snapshot (instant re-hydration when returning from detail) ─
  // Computed with a ref so it runs exactly once across re-renders
  const initialSnapRef = useRef<FeedSnapshot | null | undefined>(undefined)
  if (initialSnapRef.current === undefined) {
    initialSnapRef.current = resolveInitialSnapshot()
  }
  const initialSnap = initialSnapRef.current

  const [items, setItems]         = useState<SignalDTO[]>(initialSnap?.items ?? [])
  const [nextCursor, setNextCursor] = useState<string | null>(initialSnap?.nextCursor ?? null)
  const [hasMore, setHasMore]     = useState(initialSnap?.hasMore ?? true)
  const [totalEstimate, setTotalEstimate] = useState(initialSnap?.totalEstimate ?? 0)
  // If we have a valid snapshot, skip the loading spinner entirely
  const [isInitialLoading, setIsInitialLoading] = useState(!initialSnap)
  const [isLoadingMore, setIsLoadingMore]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // ── Refs: logic control, never causes re-renders ──────────────────────────────

  const abortRef    = useRef<AbortController | null>(null)
  const seenIdsRef  = useRef(
    initialSnap ? new Set<string>(initialSnap.seenIds) : new Set<string>(),
  )
  const inFlightRef = useRef(false)
  const cursorRef   = useRef<string | null>(initialSnap?.nextCursor ?? null)

  // ── Core fetch ───────────────────────────────────────────────────────────────

  const doFetch = useCallback(
    (cursor: string | null, isInitial: boolean) => {
      // Prevent two page loads running simultaneously
      if (!isInitial && inFlightRef.current) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current  = controller
      inFlightRef.current = true

      if (isInitial) setIsInitialLoading(true)
      else setIsLoadingMore(true)
      setError(null)

      getSignalsFeed(
        {
          cursor:     cursor     ?? undefined,
          limit:      15,
          signalType: signalType || undefined,
          severity:   severity   || undefined,
          status:     status     || undefined,
          q:          q          || undefined,
        },
        controller.signal,
      )
        .then((res) => {
          if (controller.signal.aborted) return

          // Deduplicate — never add an ID we have seen before
          const fresh = res.items.filter(
            (item) => !seenIdsRef.current.has(item.id),
          )
          fresh.forEach((item) => seenIdsRef.current.add(item.id))

          setItems((prev) => (isInitial ? fresh : [...prev, ...fresh]))
          setNextCursor(res.nextCursor)
          cursorRef.current = res.nextCursor
          setHasMore(res.hasMore)
          setTotalEstimate(res.totalEstimate)
        })
        .catch((err: unknown) => {
          if (axios.isCancel(err) || controller.signal.aborted) return
          // Error keeps existing items — CP3 requirement
          setError('No se pudieron cargar las señales.')
        })
        .finally(() => {
          if (controller.signal.aborted) return
          setIsInitialLoading(false)
          setIsLoadingMore(false)
          inFlightRef.current = false
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterHash], // recreate only when filters change
  )

  // ── Reset + initial fetch when filters change ─────────────────────────────

  // Track whether the very first effect run already has data from the initialSnap
  const isFirstRunRef = useRef(true)

  useEffect(() => {
    // On the very first run: if we bootstrapped from initialSnap, skip the
    // fetch and only clean up the sessionStorage + apply any pending patch.
    if (isFirstRunRef.current && initialSnap) {
      isFirstRunRef.current = false
      sessionStorage.removeItem(SNAPSHOT_KEY)

      const updated = popUpdatedSignal()
      if (updated) {
        setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      }
      return () => { abortRef.current?.abort() }
    }

    isFirstRunRef.current = false

    // Full reset — filters changed or no snapshot available
    seenIdsRef.current  = new Set()
    cursorRef.current   = null
    inFlightRef.current = false
    setItems([])
    setNextCursor(null)
    setHasMore(true)
    setTotalEstimate(0)
    setError(null)
    doFetch(null, true)

    return () => {
      abortRef.current?.abort()
    }
  }, [doFetch, filterHash, initialSnap])

  // ── Public API ────────────────────────────────────────────────────────────────

  const loadMore = useCallback(() => {
    if (!hasMore || inFlightRef.current) return
    doFetch(cursorRef.current, false)
  }, [hasMore, doFetch])

  const retry = useCallback(() => {
    if (inFlightRef.current) return
    doFetch(cursorRef.current, false)
  }, [doFetch])

  function patch(updates: Partial<Record<string, string>>) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { replace: true },
    )
  }

  /** Snapshot the feed state before navigating to a detail page */
  function snapshotForNavigation() {
    saveSnapshot(
      {
        items,
        nextCursor,
        hasMore,
        totalEstimate,
        seenIds: [...seenIdsRef.current],
        filterHash,
      },
      window.scrollY,
    )
  }

  return {
    items,
    hasMore,
    totalEstimate,
    isInitialLoading,
    isLoadingMore,
    error,
    loadMore,
    retry,
    snapshotForNavigation,
    // Filters
    signalType, severity, status, q,
    setSignalType: (v: SignalType | '')  => patch({ signalType: v }),
    setSeverity:   (v: Severity | '')    => patch({ severity: v }),
    setStatus:     (v: SignalStatus | '') => patch({ status: v }),
    setQ:          (v: string)           => patch({ q: v }),
    clearFilters:  () => setSearchParams({}, { replace: true }),
  }
}
