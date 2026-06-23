import client from './client'
import type { LoginRequest, LoginResponse, UserDTO } from '../types/api'

export const login = (body: LoginRequest) =>
  client.post<LoginResponse>('/auth/login', body).then((r) => r.data)

export const getMe = () =>
  client.get<UserDTO>('/auth/me').then((r) => r.data)
