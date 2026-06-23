// ─── Enums ────────────────────────────────────────────────────────────────────

export type Species = 'BLOBITO' | 'CHISPA' | 'GRUNON' | 'DORMILON' | 'GLITCHY'

export type VitalState =
  | 'ESTABLE'
  | 'HAMBRIENTO'
  | 'AGITADO'
  | 'MUTANDO'
  | 'CRITICO'

export type SignalType =
  | 'HAMBRE'
  | 'ABANDONO'
  | 'MUTACION'
  | 'FUGA'
  | 'CONFLICTO'
  | 'REPRODUCCION_MASIVA'
  | 'SENAL_CORRUPTA'

export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO'

export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA'

/** Solo los estados aceptados por PATCH /signals/:id/status */
export type UpdatableSignalStatus = 'PROCESANDO' | 'ATENDIDA'

export type Climate =
  | 'PIXEL_FOREST'
  | 'NEON_CAVE'
  | 'CLOUD_AQUARIUM'
  | 'RETRO_ARCADE'

export type TropelSort = 'name,asc' | 'updatedAt,desc' | 'chaosIndex,desc'

// ─── Sector ───────────────────────────────────────────────────────────────────

export interface SectorRef {
  id: string
  name: string
  sectorCode: string
}

export interface SectorDTO {
  id: string
  sectorCode: string
  name: string
  climate: Climate
  capacity: number
  currentLoad: number
  stabilityLevel: number
}

export interface SectorStoryMetrics {
  stability: number
  energy: number
  alerts: number
}

export interface SectorStoryStage {
  id: string
  order: number
  title: string
  narrative: string
  dominantEvent: SignalType
  metrics: SectorStoryMetrics
  assetKey: string
  colorToken: string
  progress: number
}

export interface SectorStoryResponse {
  sector: Pick<SectorDTO, 'id' | 'name' | 'climate'>
  stages: SectorStoryStage[]
}

// ─── Tropel ───────────────────────────────────────────────────────────────────

export interface TropelDTO {
  id: string
  name: string
  species: Species
  vitalState: VitalState
  energyLevel: number
  chaosIndex: number
  mutationStage: number
  guardianName: string
  sector: SectorRef
  createdAt: string
  updatedAt: string
}

// ─── Signal ───────────────────────────────────────────────────────────────────

export interface TropelRef {
  id: string
  name: string
  species: Species
}

export interface SignalDTO {
  id: string
  signalType: SignalType
  severity: Severity
  status: SignalStatus
  rawContent: string
  tropel: TropelRef
  createdAt: string
  updatedAt: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string
  displayName: string
  email: string
  teamCode: string
  role: string
}

export interface LoginRequest {
  teamCode: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  user: UserDTO
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalTropels: number
  criticalTropels: number
  openSignals: number
  sectorStabilityAvg: number
  signalsBySeverity: {
    LEVE: number
    MODERADO: number
    GRAVE: number
    CRITICO: number
  }
  generatedAt: string
}

// ─── Pagination & Feed ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface FeedResponse<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
  totalEstimate: number
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  error: string
  message: string
  timestamp: string
  path: string
  details: Record<string, unknown>
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface TropelsParams {
  page?: number
  size?: 10 | 20 | 50
  species?: Species | ''
  vitalState?: VitalState | ''
  sectorId?: string
  q?: string
  sort?: TropelSort
}

export interface SignalsFeedParams {
  cursor?: string
  limit?: number
  signalType?: SignalType | ''
  severity?: Severity | ''
  status?: SignalStatus | ''
  q?: string
}
