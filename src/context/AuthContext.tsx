import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import api, { getToken, setToken, removeToken } from '../lib/axios';
import type { UserDTO, LoginRequest, LoginResponse } from '../types/api';

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface AuthState {
  user: UserDTO | null;
  /** true mientras se verifica el token al arrancar la app */
  isRestoring: boolean;
  /** true durante el POST /auth/login */
  isLoggingIn: boolean;
  loginError: string | null;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Al montar: intentar restaurar la sesión con el token guardado
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsRestoring(false);
      return;
    }

    api
      .get<UserDTO>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => removeToken())
      .finally(() => setIsRestoring(false));
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials);
      setToken(data.token);
      setUser(data.user);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
      ) {
        const data = (err.response as { data: { message?: string } }).data;
        setLoginError(data?.message ?? 'Credenciales inválidas');
      } else {
        setLoginError('No se pudo conectar con el servidor');
      }
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isRestoring, isLoggingIn, loginError, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
