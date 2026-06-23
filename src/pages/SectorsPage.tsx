import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import type { Sector, SectorsResponse } from '../types/api'

const CLIMATE_LABEL: Record<string, string> = {
  PIXEL_FOREST: '🌲 Pixel Forest',
  NEON_CAVE: '🔮 Neon Cave',
  CLOUD_AQUARIUM: '🐟 Cloud Aquarium',
  RETRO_ARCADE: '🕹️ Retro Arcade',
}

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<SectorsResponse>('/sectors')
      .then(r => setSectors(r.data.items))
      .catch(() => setError('Error cargando sectores.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-2xl font-bold">Sectores</h1>
        </div>

        {loading && <p className="text-gray-400">Cargando sectores…</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && sectors.length === 0 && (
          <p className="text-gray-500">No hay sectores disponibles.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map(sector => (
            <Link
              key={sector.id}
              to={`/sectors/${sector.id}/story`}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-500 font-mono">{sector.sectorCode}</span>
                <span className="text-xs text-gray-400">{CLIMATE_LABEL[sector.climate] ?? sector.climate}</span>
              </div>
              <h2 className="font-semibold text-white group-hover:text-indigo-300 transition-colors mb-3">
                {sector.name}
              </h2>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>Carga: {sector.currentLoad}/{sector.capacity}</span>
                <span>Estabilidad: {sector.stabilityLevel}%</span>
              </div>
              <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${sector.stabilityLevel}%` }}
                />
              </div>
              <p className="text-xs text-indigo-400 mt-3 group-hover:text-indigo-300">Ver historia →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
