import { useTropels } from '../hooks/useTropels'
import { TropelsFilters } from '../components/tropels/TropelsFilters'
import { TropelCard } from '../components/tropels/TropelCard'
import { TropelCardSkeleton } from '../components/tropels/TropelCardSkeleton'
import { TropelsPagination } from '../components/tropels/TropelsPagination'
import { Spinner } from '../components/ui/Spinner'

const SKELETON_COUNT = 12

export default function TropelsPage() {
  const {
    data, isLoading, error, isFirstLoad, isRefetching,
    page, size, sort, species, vitalState, sectorId, q,
    retry, setPage, setSize, setSort, setSpecies, setVitalState, setSectorId, setQ,
    clearFilters,
  } = useTropels()

  const hasActiveFilters = !!(species || vitalState || sectorId || q)

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Atlas de Tropeles
          </h1>
          {data && !isFirstLoad && (
            <p className="mt-1 text-sm text-gray-500">
              {data.totalElements} Tropeles — página {data.currentPage + 1} de{' '}
              {data.totalPages}
              {isRefetching && (
                <Spinner size="sm" className="ml-2 inline-block align-middle" />
              )}
            </p>
          )}
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <TropelsFilters
        q={q}
        species={species}
        vitalState={vitalState}
        sectorId={sectorId}
        sort={sort}
        size={size}
        onQ={setQ}
        onSpecies={setSpecies}
        onVitalState={setVitalState}
        onSectorId={setSectorId}
        onSort={setSort}
        onSize={setSize}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── Error banner — never removes existing content ────────────────── */}
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

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {/*
        Key design decision:
        – isFirstLoad  → full skeleton (no data yet)
        – isRefetching → keep existing cards, reduce opacity (no layout shift)
        – error + no data → empty state
      */}
      <div
        className={`grid grid-cols-1 gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
          isRefetching ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}
        // Keep min-height stable to avoid layout jump during refetch
        style={{ minHeight: `${Math.ceil(size / 4) * 220}px` }}
      >
        {isFirstLoad
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <TropelCardSkeleton key={i} />
            ))
          : data?.content.map((tropel) => (
              <TropelCard key={tropel.id} tropel={tropel} />
            ))}
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!isLoading && !error && data?.content.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-500">
          <span className="text-5xl">🔍</span>
          <p className="text-sm">
            Sin resultados para los filtros actuales.
          </p>
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

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {data && (
        <TropelsPagination
          currentPage={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={size}
          isLoading={isLoading}
          onPage={setPage}
        />
      )}
    </div>
  )
}
