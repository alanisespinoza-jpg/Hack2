// ─── Enums ────────────────────────────────────────────────────────────────────

export type Species =
  | 'BLOBITO'
  | 'CHISPA'
  | 'GRUNON'
  | 'DORMILON'
  | 'GLITCHY';

export type VitalState =
  | 'ESTABLE'
  | 'HAMBRIENTO'
  | 'AGITADO'
  | 'MUTANDO'
  | 'CRITICO';

export type SignalType =
  | 'HAMBRE'
  | 'ABANDONO'
  | 'MUTACION'
  | 'FUGA'
  | 'CONFLICTO'
  | 'REPRODUCCION_MASIVA'
  | 'SENAL_CORRUPTA';

export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO';

export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA';

export type Climate =
  | 'PIXEL_FOREST'
  | 'NEON_CAVE'
  | 'CLOUD_AQUARIUM'
  | 'RETRO_ARCADE';

export type UserRole = 'OPERATOR';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  teamCode: string;
  email: string;
  password: string;
}

export interface UserDTO {
  id: string;
  displayName: string;
  email: string;
  teamCode: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserDTO;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalTropels: number;
  criticalTropels: number;
  openSignals: number;
  sectorStabilityAvg: number;
  signalsBySeverity: Record<Severity, number>;
  generatedAt: string;
}

// ─── Tropels ──────────────────────────────────────────────────────────────────

export interface SectorRef {
  id: string;
  name: string;
  sectorCode: string;
}

export interface TropelDTO {
  id: string;
  name: string;
  species: Species;
  vitalState: VitalState;
  energyLevel: number;
  chaosIndex: number;
  mutationStage: number;
  guardianName: string;
  sector: SectorRef;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTropels {
  content: TropelDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export type TropelSort = 'name,asc' | 'updatedAt,desc' | 'chaosIndex,desc';

export interface TropelsQueryParams {
  page?: number;
  size?: 10 | 20 | 50;
  species?: Species | '';
  vitalState?: VitalState | '';
  sectorId?: string;
  q?: string;
  sort?: TropelSort;
}

// ─── Signals ──────────────────────────────────────────────────────────────────

export interface TropelRef {
  id: string;
  name: string;
  species: Species;
}

export interface SignalDTO {
  id: string;
  signalType: SignalType;
  severity: Severity;
  status: SignalStatus;
  rawContent: string;
  tropel: TropelRef;
  createdAt: string;
  updatedAt: string;
}

export interface SignalFeedResponse {
  items: SignalDTO[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface SignalFeedParams {
  cursor?: string;
  limit?: number;
  signalType?: SignalType | '';
  severity?: Severity | '';
  status?: SignalStatus | '';
  q?: string;
}

export interface UpdateSignalStatusRequest {
  status: 'PROCESANDO' | 'ATENDIDA';
}

// ─── Sectors ──────────────────────────────────────────────────────────────────

export interface SectorLight {
  id: string;
  sectorCode: string;
  name: string;
  climate: Climate;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
}

export interface SectorsResponse {
  items: SectorLight[];
}

export interface StageMetrics {
  stability: number;
  energy: number;
  alerts: number;
}

export interface StoryStage {
  id: string;
  order: number;
  title: string;
  narrative: string;
  dominantEvent: SignalType;
  metrics: StageMetrics;
  assetKey: string;
  colorToken: string;
  progress: number;
}

export interface SectorStoryResponse {
  sector: {
    id: string;
    name: string;
    climate: Climate;
  };
  stages: StoryStage[];
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  path: string;
  details: Record<string, unknown>;
}
