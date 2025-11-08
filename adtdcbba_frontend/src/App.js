import React, { useLayoutEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Importaciones de Páginas
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterDeportista from './pages/RegisterDeportista';
import AdminDashboard from './pages/AdminDashboard';
import ManagePoligonos from './pages/ManagePoligonos';
import ManageJueces from './pages/ManageJueces';
import ManageModalidades from './pages/ManageModalidades';
import ManageCompetitions from './pages/ManageCompetitions';
import RegisterInscripcion from './pages/RegisterInscripcion';
import ManageInscripciones from './pages/ManageInscripciones';
import JudgePanel from './pages/JudgePanel'; 
import LiveScoreboard from './pages/LiveScoreboard'; 
import AdminLayout from './components/AdminLayout'; 
import ManageDeportistas from './pages/ManageDeportistas';

// Importa la lógica de autenticación
import { useAuth } from './context/AuthContext'; 


// Componente de Navegación Condicional
const Navigation = () => {
    const { isLoggedIn, hasRole, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light w-100 px-3 border-bottom shadow-sm">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand h1 mb-0 text-primary fw-bold">ADTDCBBA</Link>
                
                <div className="collapse navbar-collapse justify-content-end">
                    <ul className="navbar-nav">
                        
                        {/* 1. ENLACES PÚBLICOS (SOLO LOGIN) */}
                        {!isLoggedIn && (
                            <>
                                {/* El registro se hará desde /admin/register-club */}
                                <li className="nav-item">
                                    <Link to="/login" className="btn btn-primary btn-sm">Iniciar Sesión</Link>
                                </li>
                            </>
                        )}

                        {/* 2. ENLACES PRIVADOS (Filtrados por Rol) */}
                        {isLoggedIn && (
                            <>
                                {/* Club: Inscripción y Dashboard */}
                                {hasRole('Club') && (
                                    <>
                                        <li className="nav-item"><Link to="/dashboard" className="nav-link">Mi Club</Link></li>
                                        <li className="nav-item"><Link to="/register-deportista" className="nav-link">Reg. Deportista</Link></li>
                                        <li className="nav-item"><Link to="/register-inscripcion" className="nav-link">Inscribir</Link></li>
                                    </>
                                )}
                                
                                {/* Administración y Juez */}
                                {(hasRole('Presidente') || hasRole('Tesorero')) && (
                                    <>
                                        <li className="nav-item"><Link to="/admin" className="nav-link">Panel Admin</Link></li>
                                        <li className="nav-item"><Link to="/admin/poligonos" className="nav-link">Polígonos</Link></li>
                                        <li className="nav-item"><Link to="/admin/jueces" className="nav-link">Jueces</Link></li>
                                        <li className="nav-item"><Link to="/admin/competencias" className="nav-link">Cierre Comp.</Link></li>
                                        <li className="nav-item"><Link to="/admin/inscripciones" className="nav-link">Aprobar Insc.</Link></li>
                                        <li className="nav-item"><Link to="/register-club" className="btn btn-outline-success btn-sm ms-2">Reg. Club</Link></li> {/* Enlace para crear club */}
                                    </>
                                )}
                                
                                {hasRole('Juez') && <li className="nav-item"><Link to="/juez" className="nav-link">Panel Juez</Link></li>}
                                
                                {/* Enlaces Comunes */}
                                <li className="nav-item"><Link to="/live-score" className="nav-link">Marcador en Vivo</Link></li>
                                
                                {/* Botón de Logout */}
                                <li className="nav-item ms-3">
                                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Cerrar Sesión</button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};


// Componente para manejar la redirección y rutas privadas (Lógica sin cambios)
const PrivateRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, userRoles, loading } = useAuth();
  const navigate = useNavigate();

  // 1. Hook de Redirección: Se llama incondicionalmente al inicio.
  useLayoutEffect(() => {
    if (!loading) { 
        if (!isLoggedIn) {
            navigate('/login');
        } else if (!userRoles.includes(requiredRole)) {
            navigate('/unauthorized');
        }
    }
  }, [loading, isLoggedIn, userRoles, requiredRole, navigate]);
  
  // 2. Bloquear Renderizado mientras carga o si hay redirección pendiente
  if (loading || !isLoggedIn || !userRoles.includes(requiredRole)) {
      return <div className="text-center mt-5">Cargando o redirigiendo...</div>;
  }

  // 3. Si la autenticación es correcta, renderiza los hijos
  return children;
};


function App() {
  const { loading } = useAuth();
  
  if (loading) {
      return <div className="text-center mt-5">Cargando aplicación...</div>;
  }

  return (
    <Router>
      <div className="App-container">
        <header className="App-header p-0">
            <Navigation /> 
        </header>
        <div className="container-fluid">
            <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/live-score" element={<LiveScoreboard />} /> 
            
            {/* Rutas Protegidas (Gestión de CLUBES) */}
            <Route
                path="/register-club"
                element={<PrivateRoute requiredRole="Presidente"><AdminLayout><Register /></AdminLayout></PrivateRoute>}
            />

            {/* Rutas Protegidas (Club) */}
            <Route
                path="/dashboard"
                element={<PrivateRoute requiredRole="Club"><Dashboard /></PrivateRoute>}
            />
            <Route
                path="/register-deportista"
                element={<PrivateRoute requiredRole="Club"><RegisterDeportista /></PrivateRoute>}
            />
            <Route
                path="/register-inscripcion"
                element={<PrivateRoute requiredRole="Club"><RegisterInscripcion /></PrivateRoute>}
            />
            
            {/* Rutas Protegidas (Administración) */}
            <Route
                path="/admin"
                element={<PrivateRoute requiredRole="Presidente"><AdminLayout><AdminDashboard /></AdminLayout></PrivateRoute>}
            />
            <Route
                path="/admin/poligonos"
                element={<PrivateRoute requiredRole="Presidente"><AdminLayout><ManagePoligonos /></AdminLayout></PrivateRoute>}
            />
            <Route
                path="/admin/jueces"
                element={<PrivateRoute requiredRole="Presidente"><AdminLayout><ManageJueces /></AdminLayout></PrivateRoute>}
            />
            <Route
                path="/admin/modalidades"
                element={<PrivateRoute requiredRole="Presidente"><AdminLayout><ManageModalidades /></AdminLayout></PrivateRoute>}
            />
            <Route
                path="/admin/competencias"
                element={<PrivateRoute requiredRole="Presidente"><AdminLayout><ManageCompetitions /></AdminLayout></PrivateRoute>}
            />
            <Route
                path="/admin/inscripciones"
                element={<PrivateRoute requiredRole="Tesorero"><AdminLayout><ManageInscripciones /></AdminLayout></PrivateRoute>}
            />
            <Route
                path="/admin/deportistas"
                element={<PrivateRoute requiredRole="Presidente"><AdminLayout><ManageDeportistas /></AdminLayout></PrivateRoute>}
            />

            {/* Rutas Protegidas (Juez) */}
            <Route
                path="/juez"
                element={<PrivateRoute requiredRole="Juez"><JudgePanel /></PrivateRoute>}
            />
            
            <Route path="/" element={<Login />} />
            <Route path="/unauthorized" element={<div className="container mt-5 alert alert-warning">No tienes permiso para acceder a esta página.</div>} />
            <Route path="*" element={<div className="container mt-5 alert alert-danger">Página no encontrada.</div>} />
            </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;