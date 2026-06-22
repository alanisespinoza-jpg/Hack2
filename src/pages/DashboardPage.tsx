import { useEffect, useState } from 'react';
import api from '../lib/axios';
import type { DashboardSummary, Severity } from '../types/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_META: Record<Severity, { label: string; color: string; bar: string }> = {
  LEVE:     { label: 'Leve',     color: 'text-sky-400',    bar: 'bg-sky-400'    },
  MODERADO: { label: 'Moderado', color: 'text-yellow-400', bar: 'bg-yellow-400' },
  GRAVE:    { label: 'Grave',    color: 'text-orange-400', bar: 'bg-orange-400' },
  CRITICO:  { label: 'Crítico',  color: 'text-red-400',    bar: 'bg-red-400'    },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}

function KpiCard({ label, value, sub, accent = 'text-white' }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-6 flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`text-4xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-sm text-gray-500">{sub}</p>}
    </div>
  );
}

function SeverityBreakdown({ data }: { data: Record<Severity, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-6 space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Señales por severidad
      </p>

      {(Object.keys(SEVERITY_META) as Severity[]).map((sev) => {
        const count = data[sev] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const { label, color, bar } = SEVERITY_META[sev];

        return (
          <div key={sev} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className={`font-medium ${color}`}>{label}</span>
              <span className="text-gray-400">
                {count.toLocaleString()} <span className="text-gray-600">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
              <div
                className={`h-2 rounded-full ${bar} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-gray-800" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-gray-800" />
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-900 ring-1 ring-red-800 p-12 text-center">
      <p className="text-red-400 font-medium">No se pudo cargar el dashboard</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchSummary() {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get<DashboardSummary>('/dashboard/summary');
      setSummary(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-white">Control Room</h1>
        {summary && (
          <p className="text-xs text-gray-500">
            Actualizado: {formatDate(summary.generatedAt)}
          </p>
        )}
      </div>

      {/* Estados */}
      {loading && <Skeleton />}

      {!loading && error && <ErrorBanner onRetry={fetchSummary} />}

      {!loading && !error && summary && (
        <div className="space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Total Tropeles"
              value={summary.totalTropels}
            />
            <KpiCard
              label="Tropeles Críticos"
              value={summary.criticalTropels}
              accent="text-red-400"
              sub={
                summary.totalTropels > 0
                  ? `${Math.round((summary.criticalTropels / summary.totalTropels) * 100)}% del total`
                  : undefined
              }
            />
            <KpiCard
              label="Señales Abiertas"
              value={summary.openSignals}
              accent="text-yellow-400"
            />
            <KpiCard
              label="Estabilidad Promedio"
              value={`${summary.sectorStabilityAvg}%`}
              accent={
                summary.sectorStabilityAvg >= 70
                  ? 'text-emerald-400'
                  : summary.sectorStabilityAvg >= 40
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }
            />
          </div>

          {/* Severity breakdown */}
          <SeverityBreakdown data={summary.signalsBySeverity} />
        </div>
      )}
    </div>
  );
}
