interface TropelsPaginationProps {
  currentPage: number
  totalPages: number
  totalElements: number
  size: number
  isLoading: boolean
  onPage: (page: number) => void
}

export function TropelsPagination({
  currentPage,
  totalPages,
  totalElements,
  size,
  isLoading,
  onPage,
}: TropelsPaginationProps) {
  if (totalPages <= 1) return null

  const from = currentPage * size + 1
  const to   = Math.min(currentPage * size + size, totalElements)

  // Build page window: always show first, last, current ±2
  const pages = buildPageWindow(currentPage, totalPages)

  const btnBase =
    'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'
  const btnDefault = `${btnBase} border border-gray-700 bg-gray-900 text-gray-400 hover:border-cyan-700 hover:text-white`
  const btnActive  = `${btnBase} border border-cyan-600 bg-cyan-900/40 text-cyan-300`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2">
      <p className="text-xs text-gray-500">
        {from}–{to} de {totalElements} Tropeles
      </p>

      <nav aria-label="Paginación" className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPage(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className={btnDefault}
          aria-label="Página anterior"
        >
          ←
        </button>

        {/* Page buttons */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-gray-600">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              disabled={isLoading}
              aria-current={p === currentPage ? 'page' : undefined}
              className={p === currentPage ? btnActive : btnDefault}
            >
              {(p as number) + 1}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => onPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className={btnDefault}
          aria-label="Página siguiente"
        >
          →
        </button>
      </nav>
    </div>
  )
}

function buildPageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const pages: (number | '...')[] = []
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n) }

  add(0)
  if (current > 3) pages.push('...')
  for (let i = Math.max(1, current - 2); i <= Math.min(total - 2, current + 2); i++) add(i)
  if (current < total - 4) pages.push('...')
  add(total - 1)

  return pages
}
