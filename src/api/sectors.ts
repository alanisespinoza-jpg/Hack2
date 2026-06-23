import client from './client'
import type { SectorDTO, SectorStoryResponse } from '../types/api'

export const getSectors = () =>
  client.get<{ items: SectorDTO[] }>('/sectors').then((r) => r.data.items)

export const getSectorStory = (id: string) =>
  client.get<SectorStoryResponse>(`/sectors/${id}/story`).then((r) => r.data)
