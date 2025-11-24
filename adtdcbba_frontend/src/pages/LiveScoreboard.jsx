import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import competenciaService from '../services/competenciaService';
import { WS_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext'; // Importamos el contexto

const LiveScoreboard = () => {
  const [selectedCompetencia, setSelectedCompetencia] = useState('');
  const [scores, setScores] = useState({});
  const [wsStatus, setWsStatus] = useState('Desconectado');
  
  // Usamos el estado global de autenticación en lugar de localStorage
  const { isLoggedIn, loading } = useAuth();
  
  const wsRef = useRef(null);

  // 1. Carga de Competencias
  const { data: competencias = [] } = useQuery({
    queryKey: ['competencias'],
    queryFn: async () => {
      const res = await competenciaService.getCompetencias();
      const data = (res.data && res.data.results) ? res.data.results : res.data;
      return data.filter(comp => comp.status !== 'Finalizada');
    },
    // Solo intentamos cargar si el usuario está logueado
    enabled: isLoggedIn, 
    staleTime: 1000 * 60 * 5, 
  });

  const handleCompetenciaChange = (e) => {
    const compId = e.target.value;
    setSelectedCompetencia(compId);
    setScores({}); 
    
    if (compId) {
      setWsStatus('Conectando...');
    } else {
      setWsStatus('Desconectado');
    }
  };

  // 2. Lógica de WebSocket Segura (Sin Token en URL)
  useEffect(() => {
    // Requisitos: Competencia seleccionada y Usuario Autenticado
    if (!selectedCompetencia || !isLoggedIn) return;

    // Limpieza previa
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // NUEVA URL: Ya no exponemos el token aquí. 
    // La cookie 'access' viajará automáticamente con el handshake.
    const WS_URL = `${WS_BASE_URL}/competencia/${selectedCompetencia}/`;
    
    console.log(`Iniciando conexión segura WS a: ${WS_URL}`);
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('Conectado');
      console.log(`WebSocket conectado (Cookie Secure): ${selectedCompetencia}`);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.error) {
           console.error("Error del servidor:", data.error);
           return;
        }

        setScores(prevScores => ({
          ...prevScores,
          [data.inscripcion_id]: {
            deportista: data.deportista,
            puntaje: data.puntaje,
            arma: data.arma
          }
        }));
      } catch (err) {
        console.error("Error parseando mensaje WS:", err);
      }
    };

    ws.onclose = (e) => {
       console.log("WS Cerrado code:", e.code);
       if (selectedCompetencia) {
           // Si el código es 4403 (Forbidden) u otro error de cierre...
           setWsStatus('Desconectado'); 
       }
    };

    ws.onerror = (err) => {
      console.error("Error de WebSocket:", err);
      setWsStatus('Error de conexión');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedCompetencia, isLoggedIn]); // Se re-ejecuta si cambia la competencia o el estado de login

  const sortedScores = Object.values(scores).sort((a, b) => parseFloat(b.puntaje) - parseFloat(a.puntaje));

  // Lógica visual del Badge
  let badgeClass = 'bg-secondary';
  let statusText = wsStatus;

  if (loading) {
     statusText = 'Cargando...';
  } else if (!isLoggedIn) {
     statusText = 'Requiere Login';
     badgeClass = 'bg-danger';
  } else if (wsStatus === 'Conectado') {
     badgeClass = 'bg-success';
  } else if (wsStatus === 'Conectando...') {
     badgeClass = 'bg-warning text-dark';
  } else if (wsStatus === 'Error de conexión') {
     badgeClass = 'bg-danger';
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Marcador en Vivo (Live Scoring)</h2>
      
      <div className="mb-3">
        <strong>Estado: </strong> 
        <span className={`badge ${badgeClass}`} style={{ fontSize: '1em' }}>
          {statusText}
        </span>
      </div>

      {!isLoggedIn ? (
          <div className="alert alert-warning">
              Por favor inicia sesión para ver los resultados en vivo.
          </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="form-label fw-bold">Seleccionar Competencia:</label>
            <select 
              className="form-select" 
              onChange={handleCompetenciaChange} 
              value={selectedCompetencia}
            >
              <option value="">-- Seleccione una competencia --</option>
              {competencias.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
          </div>

          {selectedCompetencia && (
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-striped table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Posición</th>
                    <th>Deportista</th>
                    <th>Arma</th>
                    <th className="text-end">Puntaje</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScores.length > 0 ? (
                    sortedScores.map((score, index) => (
                      <tr key={index}>
                        <td className="fw-bold text-center">{index + 1}</td>
                        <td>{score.deportista}</td>
                        <td>{score.arma}</td>
                        <td className="text-end fw-bold fs-5">{score.puntaje}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Esperando datos en tiempo real...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LiveScoreboard;