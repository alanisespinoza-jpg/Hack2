import client from './client'
import type {
  SignalDTO,
  FeedResponse,
  SignalsFeedParams,
  UpdatableSignalStatus,
} from '../types/api'

export const getSignalsFeed = (
  params: SignalsFeedParams,
  signal?: AbortSignal,
) =>
  client
    .get<FeedResponse<SignalDTO>>('/signals/feed', { params, signal })
    .then((r) => r.data)

export const getSignalById = (id: string) =>
  client.get<SignalDTO>(`/signals/${id}`).then((r) => r.data)

export const updateSignalStatus = (id: string, status: UpdatableSignalStatus) =>
  client
    .patch<SignalDTO>(`/signals/${id}/status`, { status })
    .then((r) => r.data)
