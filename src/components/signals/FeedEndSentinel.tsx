import { useEffect, useRef } from 'react'

interface FeedEndSentinelProps {
  onIntersect: () => void
  isEnabled: boolean
}

/**
 * Invisible div at the bottom of the feed list.
 * When it enters the viewport (with a 300px root margin),
 * it calls onIntersect — triggering the next page load.
 *
 * Uses a callbackRef to always call the latest version of
 * onIntersect without re-creating the IntersectionObserver.
 */
export function FeedEndSentinel({ onIntersect, isEnabled }: FeedEndSentinelProps) {
  const sentinelRef  = useRef<HTMLDivElement>(null)
  const callbackRef  = useRef(onIntersect)

  // Keep callback ref current without re-creating the observer
  useEffect(() => {
    callbackRef.current = onIntersect
  })

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !isEnabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callbackRef.current()
        }
      },
      { rootMargin: '300px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isEnabled]) // only re-create when enabled state changes

  return <div ref={sentinelRef} aria-hidden="true" />
}
