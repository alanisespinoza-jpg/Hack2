import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Spinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isRestoring } = useAuth();

  // Todavía verificando el token guardado — no redirigir todavía
  if (isRestoring) return <Spinner />;

  // Sin sesión → login
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
