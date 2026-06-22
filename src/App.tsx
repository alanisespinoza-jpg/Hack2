import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SectorsPage from './pages/SectorsPage';
const TropelsPage = () => <div className="text-white">Tropeles (integrante B)</div>;
const SignalsPage = () => <div className="text-white">Señales (integrante B)</div>;
const SectorStoryPage = () => <div className="text-white">Sector Story (integrante C)</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protegidas — comparten Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tropels"
            element={
              <ProtectedRoute>
                <Layout><TropelsPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/signals"
            element={
              <ProtectedRoute>
                <Layout><SignalsPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectors"
            element={
              <ProtectedRoute>
                <Layout><SectorsPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectors/:id/story"
            element={
              <ProtectedRoute>
                <Layout><SectorStoryPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
