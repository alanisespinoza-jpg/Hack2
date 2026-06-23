import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { getTropels } from '../api/tropels'
import type {
  TropelDTO,
  PaginatedResponse,
  Species,
  VitalState,
  TropelSort,
} from '../types/api'

const VALID_SIZES = [10, 20, 50] as const
const VALID_SORTS: TropelSort[] = ['name,asc', 'updatedAt,desc', 'chaosIndex,desc']

function parsePage(raw: string | null): number {
  const n = Number(raw ?? '0')
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function parseSize(raw: string | null): 10 | 20 | 50 {
  const n = Number(raw ?? '20')
  return (VALID_SIZES as readonly number[]).includes(n) ? (n as 10 | 20 | 50) : 20
}

function parseSort(raw: string | null): TropelSort {
  return VALID_SORTS.includes(raw as TropelSort)
    ? (raw as TropelSort)
    : 'updatedAt,desc'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTropels() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive all state from URL — single source of truth
  const page      = parsePage(searchParams.get('page'))
  const size      = parseSize(searchParams.get('size'))
  const sort      = parseSort(searchParams.get('sort'))
  const species   = (searchParams.get('species')   ?? '') as Species | ''
  const vitalState = (searchParams.get('vitalState') ?? '') as VitalState | ''
  const sectorId  = searchParams.get('sectorId') ?? ''
  const q         = searchParams.get('q') ?? ''

  const [data, setData]           = useState<PaginatedResponse<TropelDTO> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)
  // retryKey forces the effect to re-run without changing the URL
  const [retryKey, setRetryKey]   = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    getTropels(
      {
        page,
        size,
        sort,
        // Omit empty strings — axios skips undefined automatically
        species:    species    || undefined,
        vitalState: vitalState || undefined,
        sectorId:   sectorId   || undefined,
        q:          q          || undefined,
      },
      controller.signal,
    )
      .then((res) => {
        setData(res)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        // Ignore aborted requests — they are expected when filters change fast
        if (axios.isCancel(err) || controller.signal.aborted) return
        setError('Error al cargar los Tropeles. Intenta de nuevo.')
        setIsLoading(false)
      })

    return () => controller.abort()
  }, [page, size, sort, species, vitalState, sectorId, q, retryKey])

  // ─── URL updaters ───────────────────────────────────────────────────────────

  /** Updates any subset of URL params. resetPage=true resets page to 0 (used for filter changes). */
  function patch(
    updates: Partial<Record<string, string>>,
    resetPage = true,
  ) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        if (resetPage) next.set('page', '0')
        return next
      },
      { replace: true },
    )
  }

  return {
    // Data
    data,
    isLoading,
    error,
    isFirstLoad: data === null && isLoading,
    isRefetching: data !== null && isLoading,

    // Current params (for controlled inputs)
    page,
    size,
    sort,
    species,
    vitalState,
    sectorId,
    q,

    // Actions
    retry:         ()                  => setRetryKey((k) => k + 1),
    setPage:       (p: number)         => patch({ page: String(p) }, false),
    setSize:       (s: 10 | 20 | 50)   => patch({ size: String(s) }),
    setSort:       (v: TropelSort)     => patch({ sort: v }),
    setSpecies:    (v: Species | '')   => patch({ species: v }),
    setVitalState: (v: VitalState | '') => patch({ vitalState: v }),
    setSectorId:   (v: string)         => patch({ sectorId: v }),
    setQ:          (v: string)         => patch({ q: v }),
    clearFilters:  ()                  =>
      setSearchParams({ page: '0', size: String(size), sort }, { replace: true }),
  }
}
