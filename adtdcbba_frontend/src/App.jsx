import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- Layouts & System Pages ---
import AdminLayout from './components/AdminLayout';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// --- Páginas Públicas ---
import Login from './pages/Login';
import Register from './pages/Register';
import LiveScoreboard from './pages/LiveScoreboard';
import VerificationPortal from './pages/VerificationPortal';
import ResultsList from './pages/ResultsList';
import AnnualRanking from './pages/AnnualRanking';
import ClubRanking from './pages/ClubRanking';
import RecordsView from './pages/RecordsView';

// --- Páginas de Usuario ---
import Dashboard from './pages/Dashboard';
import MiPerfil from './pages/MiPerfil';
import ChangePassword from './pages/ChangePassword';
import RegisterInscripcion from './pages/RegisterInscripcion';
import CompetitionResults from './pages/CompetitionResults';
import StartList from './pages/StartList';
import RegisterDeportista from './pages/RegisterDeportista';

// --- Páginas de Administración ---
import AdminDashboard from './pages/AdminDashboard';
import ManageCompetitions from './pages/ManageCompetitions';
import CreateCompetencia from './pages/CreateCompetencia';
import ManageDeportistas from './pages/ManageDeportistas';
import DeportistaDetail from './pages/DeportistaDetail';
import ManageClubs from './pages/ManageClubs';
import ManageInscripciones from './pages/ManageInscripciones';
import ManageArmas from './pages/ManageArmas';
import ManageJueces from './pages/ManageJueces';
import ManagePoligonos from './pages/ManagePoligonos';
import ManageModalidades from './pages/ManageModalidades';
import SystemReports from './pages/SystemReports';
import CompetitionStats from './pages/CompetitionStats';
import CompetitionFinancials from './pages/CompetitionFinancials';

// --- Páginas de Jueces ---
import JudgePanel from './pages/JudgePanel';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ================= PÚBLICAS ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/403" element={<Unauthorized />} />

          {/* Vistas Públicas (Pantallas) */}
          <Route path="/live/:competenciaId" element={<LiveScoreboard />} />
          <Route path="/resultados" element={<ResultsList />} />
          <Route path="/ranking/anual" element={<AnnualRanking />} />
          <Route path="/ranking/clubes" element={<ClubRanking />} />
          <Route path="/records" element={<RecordsView />} />
          <Route path="/verificar/:codigo" element={<VerificationPortal />} />
          <Route path="/verificar" element={<VerificationPortal />} />

          {/* ================= PRIVADAS ================= */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />
          <Route path="/cambiar-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          
          <Route path="/inscripcion/nueva" element={<ProtectedRoute><RegisterInscripcion /></ProtectedRoute>} />
          <Route path="/mi-registro-deportista" element={<ProtectedRoute><RegisterDeportista /></ProtectedRoute>} />
          <Route path="/competencia/:id/resultados" element={<ProtectedRoute><CompetitionResults /></ProtectedRoute>} />
          <Route path="/competencia/:id/startlist" element={<ProtectedRoute><StartList /></ProtectedRoute>} />

          {/* ================= JUECES ================= */}
          <Route path="/juez/panel" element={<ProtectedRoute requiredRole="juez"><JudgePanel /></ProtectedRoute>} />

          {/* ================= ADMIN ================= */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            
            <Route path="competencias" element={<ManageCompetitions />} />
            <Route path="competencias/crear" element={<CreateCompetencia />} />
            <Route path="competencias/:id/stats" element={<CompetitionStats />} />
            <Route path="competencias/:id/financials" element={<CompetitionFinancials />} />

            <Route path="deportistas" element={<ManageDeportistas />} />
            <Route path="deportistas/nuevo" element={<RegisterDeportista />} />
            <Route path="deportistas/:id" element={<DeportistaDetail />} />
            
            <Route path="clubs" element={<ManageClubs />} />
            <Route path="inscripciones" element={<ManageInscripciones />} />
            <Route path="armas" element={<ManageArmas />} />
            <Route path="jueces" element={<ManageJueces />} />
            <Route path="poligonos" element={<ManagePoligonos />} />
            <Route path="modalidades" element={<ManageModalidades />} />
            <Route path="reportes" element={<SystemReports />} />
          </Route>

          {/* ================= 404 ================= */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;