import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, isRestoring, login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();

  const [teamCode, setTeamCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Si ya tiene sesión activa, ir directo al dashboard
  if (!isRestoring && user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login({ teamCode: teamCode.trim().toUpperCase(), email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch {
      // El error ya está en loginError — no hacer nada más
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-400 tracking-tight">
            TropelCare
          </h1>
          <p className="mt-1 text-sm text-gray-400">Control Room — Pizza Protocol</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-gray-900 p-8 space-y-5 shadow-xl ring-1 ring-gray-800"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Team Code
            </label>
            <input
              type="text"
              required
              placeholder="TEAM-001"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-white placeholder-gray-600
                         border border-gray-700 focus:border-emerald-500 focus:outline-none
                         focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="operator@tuckersoft.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-white placeholder-gray-600
                         border border-gray-700 focus:border-emerald-500 focus:outline-none
                         focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-white placeholder-gray-600
                         border border-gray-700 focus:border-emerald-500 focus:outline-none
                         focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Error */}
          {loginError && (
            <p className="rounded-lg bg-red-900/40 px-4 py-2.5 text-sm text-red-400 border border-red-800">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white
                       hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isLoggingIn ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
