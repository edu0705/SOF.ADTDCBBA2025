import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import competenciaService from '../services/competenciaService';
import { WS_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const LiveScoreboard = () => {
  const [selectedCompetencia, setSelectedCompetencia] = useState('');
  const [scores, setScores] = useState({});
  const [wsStatus, setWsStatus] = useState('Desconectado');
  
  // Ahora sí usaremos 'loading' para mejorar la UX inicial
  const { isLoggedIn, loading } = useAuth();

  // 1. Carga de Competencias (Solo activas)
  const { data: competencias = [] } = useQuery({
    queryKey: ['competencias'],
    queryFn: async () => {
      const res = await competenciaService.getCompetencias();
      const data = (res.data && res.data.results) ? res.data.results : res.data;
      return data.filter(comp => comp.status !== 'Finalizada');
    },
    enabled: isLoggedIn, 
    staleTime: 1000 * 60 * 5, 
  });

  const handleCompetenciaChange = (e) => {
    const compId = e.target.value;
    setSelectedCompetencia(compId);
    setScores({}); // Limpiamos la pizarra al cambiar
    
    // El cambio de estado disparará el useEffect automáticamente
    if (!compId) {
      setWsStatus('Desconectado');
    }
  };

  // 2. Lógica de Conexión WebSocket (Refactorizada y Corregida)
  useEffect(() => {
    // Si no hay competencia o el usuario no está logueado, no hacemos nada
    if (!selectedCompetencia || !isLoggedIn) return;

    let ws = null;
    let reconnectTimeout = null;
    let isMounted = true; // Bandera para evitar actualizaciones en componentes desmontados

    // Definimos la función connect DENTRO del efecto para evitar referencias circulares
    const connect = () => {
      // Limpieza preventiva
      if (reconnectTimeout) clearTimeout(reconnectTimeout);

      const WS_URL = `${WS_BASE_URL}/competencia/${selectedCompetencia}/`;
      console.log(`🔌 Conectando a: ${WS_URL}`);
      
      if (isMounted) setWsStatus('Conectando...');

      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        if (isMounted) {
            setWsStatus('Conectado');
            console.log('✅ WebSocket Conectado');
        }
      };

      ws.onmessage = (e) => {
        try {
          const message = JSON.parse(e.data);
          
          if (message.type === 'score_update' && message.payload) {
              const data = message.payload;
              
              if (isMounted) {
                setScores(prevScores => ({
                  ...prevScores,
                  [data.id]: {
                    deportista: data.deportista,
                    puntaje: data.puntaje_total,
                    club: data.club,
                    x_count: data.x_count
                  }
                }));
              }
          }
        } catch (err) {
          console.error("⚠️ Error procesando mensaje WS:", err);
        }
      };

      ws.onclose = (e) => {
        console.log(`🔒 WS Cerrado: ${e.code}`);
        if (isMounted) {
            // Si el cierre no fue normal (código 1000), intentamos reconectar
            if (e.code !== 1000) {
                setWsStatus('Reconectando...');
                // Llamada recursiva segura (dentro del scope local)
                reconnectTimeout = setTimeout(connect, 3000);
            } else {
                setWsStatus('Desconectado');
            }
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WS Error", err);
        if (ws) ws.close(); // Forzar cierre para activar onclose y reintento
      };
    };

    // Iniciar conexión
    connect();

    // Cleanup function: Se ejecuta al cambiar competencia o desmontar
    return () => {
      isMounted = false;
      if (ws) ws.close(1000); // Cierre normal
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [selectedCompetencia, isLoggedIn]); // Dependencias limpias y sencillas


  // Ordenar resultados: Mayor puntaje arriba
  const sortedScores = Object.values(scores).sort((a, b) => {
      const diff = parseFloat(b.puntaje) - parseFloat(a.puntaje);
      if (diff === 0) return b.x_count - a.x_count; // Desempate por X
      return diff;
  });

  // Lógica de UI (Badges y Loading)
  let badgeClass = 'bg-secondary';
  let statusText = wsStatus;

  if (loading) {
      statusText = 'Cargando usuario...';
      badgeClass = 'bg-info text-dark';
  } else if (wsStatus === 'Conectado') {
      badgeClass = 'bg-success';
  } else if (wsStatus === 'Conectando...' || wsStatus === 'Reconectando...') {
      badgeClass = 'bg-warning text-dark';
  } else if (wsStatus === 'Error') {
      badgeClass = 'bg-danger';
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📡 Tablero en Vivo</h2>
        <div>
            <span className={`badge ${badgeClass} p-2`}>
                {statusText === 'Conectado' ? '● EN VIVO' : statusText}
            </span>
        </div>
      </div>

      {!isLoggedIn && !loading ? (
          <div className="alert alert-warning">
              Debes iniciar sesión para acceder a la transmisión de datos.
          </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body bg-light">
            <div className="mb-3">
              <label className="form-label fw-bold text-secondary">Seleccionar Competencia:</label>
              <select 
                className="form-select form-select-lg" 
                onChange={handleCompetenciaChange} 
                value={selectedCompetencia}
                disabled={loading}
              >
                <option value="">-- Seleccione para conectar --</option>
                {competencias.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedCompetencia && (
        <div className="table-responsive mt-3 shadow rounded bg-white">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white">
              <tr>
                <th className="py-3 ps-3">Pos</th>
                <th className="py-3">Deportista</th>
                <th className="py-3">Club</th>
                <th className="py-3 text-center">X</th>
                <th className="py-3 pe-3 text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedScores.length > 0 ? (
                sortedScores.map((score, index) => (
                  <tr key={index} className={index === 0 ? "table-warning fw-bold" : ""}>
                    <td className="ps-3 text-center" style={{width: '60px'}}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td>{score.deportista}</td>
                    <td className="text-muted small">{score.club}</td>
                    <td className="text-center text-primary">{score.x_count}</td>
                    <td className="pe-3 text-end fs-4 font-monospace text-dark">
                        {parseFloat(score.puntaje).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="spinner-grow text-secondary mb-2" role="status" style={{width: '1rem', height: '1rem'}}></div>
                    <p className="mb-0 small">Esperando datos en tiempo real...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveScoreboard;