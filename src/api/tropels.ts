import client from './client'
import type { TropelDTO, PaginatedResponse, TropelsParams } from '../types/api'

export const getTropels = (
  params: TropelsParams,
  signal?: AbortSignal,
) =>
  client
    .get<PaginatedResponse<TropelDTO>>('/tropels', { params, signal })
    .then((r) => r.data)

export const getTropelById = (id: string) =>
  client.get<TropelDTO>(`/tropels/${id}`).then((r) => r.data)
