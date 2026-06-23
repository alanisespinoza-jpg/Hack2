import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TropelsPage from './pages/TropelsPage';
import SignalsFeedPage from './pages/SignalsFeedPage';
import SignalDetailPage from './pages/SignalDetailPage';
import SectorsPage from './pages/SectorsPage';
import SectorStoryPage from './pages/SectorStoryPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protegidas — comparten Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
          } />
          <Route path="/tropels" element={
            <ProtectedRoute><Layout><TropelsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/signals" element={
            <ProtectedRoute><Layout><SignalsFeedPage /></Layout></ProtectedRoute>
          } />
          <Route path="/signals/:id" element={
            <ProtectedRoute><Layout><SignalDetailPage /></Layout></ProtectedRoute>
          } />
          <Route path="/sectors" element={
            <ProtectedRoute><Layout><SectorsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/sectors/:id/story" element={
            <ProtectedRoute><Layout><SectorStoryPage /></Layout></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
