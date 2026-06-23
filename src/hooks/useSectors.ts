import { useState, useEffect } from 'react'
import { getSectors } from '../api/sectors'
import type { SectorDTO } from '../types/api'

export function useSectors() {
  const [sectors, setSectors] = useState<SectorDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSectors()
      .then(setSectors)
      .catch(() => {
        // Sector filter degraded gracefully — not blocking
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { sectors, isLoading }
}
