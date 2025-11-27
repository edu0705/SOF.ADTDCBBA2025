import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import inscripcionService from '../services/inscripcionService';
import competenciaService from '../services/competenciaService';
import deportistaService from '../services/deportistaService';
import { FaSave, FaArrowLeft, FaMoneyBillWave, FaListUl, FaUser, FaTrophy, FaCheckCircle } from 'react-icons/fa';

const RegisterInscripcion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // --- Datos Auxiliares ---
  const [competencias, setCompetencias] = useState([]);
  const [deportistas, setDeportistas] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]); // Categorías específicas de la competencia

  // --- Estado del Formulario ---
  const [selectedCompetencia, setSelectedCompetencia] = useState(null);
  const [selectedDeportista, setSelectedDeportista] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [montoPagado, setMontoPagado] = useState('');
  
  // --- Estado Calculado ---
  const [costoTotal, setCostoTotal] = useState(0);

  // 1. Cargar Listas Iniciales (Competencias y Deportistas)
  useEffect(() => {
    const initData = async () => {
        try {
            const [resComp, resDep] = await Promise.all([
                competenciaService.getCompetencias(),
                deportistaService.getDeportistas()
            ]);
            // Filtrar solo competencias activas (No Finalizadas)
            const activeComps = (resComp.data.results || resComp.data).filter(c => c.status !== 'Finalizada');
            setCompetencias(activeComps);
            setDeportistas(resDep.data.results || resDep.data);
        } catch (err) {
            console.error("Error cargando datos base:", err);
        }
    };
    initData();
  }, []);

  // 2. Al seleccionar competencia, cargar sus categorías y costos específicos
  useEffect(() => {
    if (!selectedCompetencia) {
        setCategoriasDisponibles([]);
        setSelectedCategories([]);
        return;
    }
    
    const fetchCategories = async () => {
        try {
            // Consumimos el endpoint nuevo que creamos en el backend para obtener costos reales
            const res = await competenciaService.getCompetenciaCategories(selectedCompetencia.id);
            setCategoriasDisponibles(res.data); 
        } catch (err) {
            console.error("Error cargando categorías:", err);
            setCategoriasDisponibles([]);
        }
    };
    fetchCategories();
  }, [selectedCompetencia]);

  // 3. MOTOR DE CÁLCULO DE COSTOS (Regla de Negocio Frontend)
  useEffect(() => {
    if (!selectedCompetencia) {
        setCostoTotal(0);
        return;
    }

    // Costo base de la competencia (ej. derecho de campo)
    let total = parseFloat(selectedCompetencia.costo_inscripcion_base || 0);
    
    // Sumar costo de cada categoría seleccionada
    selectedCategories.forEach(catId => {
        const cat = categoriasDisponibles.find(c => c.id === catId);
        if (cat) total += parseFloat(cat.costo || 0);
    });

    // Aplicar Techo Máximo Global (Si existe y es mayor a 0)
    const limite = parseFloat(selectedCompetencia.costo_limite_global);
    if (limite > 0 && total > limite) {
        total = limite;
    }

    setCostoTotal(total);
    
    // CORRECCIÓN ESLINT: Usar actualización funcional para evitar dependencia cíclica de 'montoPagado'
    setMontoPagado(prev => {
        // Solo sobrescribimos si está vacío o es 0 (para no borrar lo que el usuario escriba manualmente)
        if (prev === '' || parseFloat(prev) === 0) return total;
        return prev;
    });

  }, [selectedCompetencia, selectedCategories, categoriasDisponibles]); // Dependencias limpias

  // Manejadores
  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev => 
        prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompetencia || !selectedDeportista || selectedCategories.length === 0) {
        return alert("Por favor complete todos los campos y seleccione al menos una categoría.");
    }

    setLoading(true);
    
    // Construimos el payload para el Serializer del Backend
    const payload = {
        competencia: selectedCompetencia.id,
        deportista: selectedDeportista,
        // Mapeamos las categorías al formato que espera InscripcionCreateSerializer
        participaciones: selectedCategories.map(catId => ({ categoria: catId })),
        monto_pagado: montoPagado,
        // Estado automático según pago: APROBADA si paga todo, PENDIENTE si debe
        estado: parseFloat(montoPagado) >= costoTotal ? 'APROBADA' : 'PENDIENTE'
    };

    try {
        await inscripcionService.createInscripcion(payload);
        alert("✅ Inscripción registrada correctamente.");
        navigate('/inscripciones');
    } catch (err) {
        console.error("Error en registro:", err);
        const errorMsg = err.response?.data?.detail || "Error al registrar. Verifique si el deportista cumple los requisitos (Licencia/Arma).";
        alert(errorMsg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          {/* HEADER */}
          <div className="d-flex align-items-center mb-4">
            <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm me-3 hover-scale">
                <FaArrowLeft className="text-muted"/>
            </button>
            <h2 className="fw-bold text-primary mb-0">Nueva Inscripción</h2>
          </div>

          <div className="card-modern border-0 shadow-lg overflow-hidden">
            <div className="card-body p-5">
              <form onSubmit={handleSubmit}>
                
                {/* 1. SELECCIÓN DE COMPETENCIA */}
                <div className="mb-4">
                    <label className="form-label fw-bold text-secondary"><FaTrophy className="me-2"/> Competencia</label>
                    <select 
                        className="form-select form-select-lg bg-light border-0 shadow-none" 
                        onChange={(e) => {
                            const comp = competencias.find(c => c.id.toString() === e.target.value);
                            setSelectedCompetencia(comp);
                            setSelectedCategories([]); // Reiniciar categorías al cambiar evento
                            setMontoPagado(''); // Reiniciar pago
                        }}
                    >
                        <option value="">-- Seleccione Evento --</option>
                        {competencias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    
                    {/* Aviso de Techo Máximo */}
                    {selectedCompetencia?.costo_limite_global > 0 && (
                        <div className="alert alert-success mt-2 d-flex align-items-center py-2 px-3 border-0 bg-success bg-opacity-10 text-success">
                            <FaCheckCircle className="me-2"/>
                            <small className="fw-bold">
                                Costo Máximo Global activo: {selectedCompetencia.costo_limite_global} Bs. 
                                (Inscríbete en todo lo que quieras sin pagar más).
                            </small>
                        </div>
                    )}
                </div>

                {/* 2. SELECCIÓN DE DEPORTISTA */}
                <div className="mb-4">
                    <label className="form-label fw-bold text-secondary"><FaUser className="me-2"/> Deportista</label>
                    <select 
                        className="form-select bg-light border-0 shadow-none" 
                        value={selectedDeportista}
                        onChange={(e) => setSelectedDeportista(e.target.value)}
                    >
                        <option value="">-- Buscar Deportista --</option>
                        {deportistas.map(d => (
                            <option key={d.id} value={d.id}>{d.first_name} {d.apellido_paterno} ({d.ci})</option>
                        ))}
                    </select>
                </div>

                {/* 3. SELECCIÓN DE CATEGORÍAS (Tarjetas Interactivas) */}
                {selectedCompetencia && (
                    <div className="mb-4 animate-slide-up">
                        <label className="form-label fw-bold text-secondary"><FaListUl className="me-2"/> Modalidades y Categorías Disponibles</label>
                        <div className="bg-light p-3 rounded-3 border border-light">
                            {categoriasDisponibles.length > 0 ? (
                                <div className="row g-2">
                                    {categoriasDisponibles.map(cat => (
                                        <div key={cat.id} className="col-md-6">
                                            <div 
                                                className={`p-3 rounded-3 border cursor-pointer transition-all ${
                                                    selectedCategories.includes(cat.id) 
                                                    ? 'bg-primary text-white border-primary shadow-md transform-scale' 
                                                    : 'bg-white border-white hover-shadow-sm'
                                                }`}
                                                onClick={() => handleCategoryToggle(cat.id)}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className={`small ${selectedCategories.includes(cat.id) ? 'text-white-50' : 'text-muted'}`}>
                                                            {cat.modalidad_nombre}
                                                        </div>
                                                        <div className="fw-bold">{cat.name}</div>
                                                    </div>
                                                    <span className={`badge rounded-pill ${
                                                        selectedCategories.includes(cat.id) 
                                                        ? 'bg-white text-primary' 
                                                        : 'bg-secondary bg-opacity-10 text-secondary'
                                                    }`}>
                                                        {parseFloat(cat.costo) === 0 ? 'Gratis' : `${cat.costo} Bs`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-3">
                                    <small>No hay categorías configuradas para esta competencia.</small>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. RESUMEN DE PAGOS */}
                <div className="card bg-primary bg-opacity-10 border-0 p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center text-primary">
                            <FaMoneyBillWave className="me-2 fs-4"/>
                            <h5 className="mb-0 fw-bold">Total a Pagar</h5>
                        </div>
                        <h2 className="mb-0 fw-bold text-dark">{costoTotal} Bs</h2>
                    </div>
                    
                    <div className="form-floating">
                        <input 
                            type="number" 
                            className="form-control border-0 fw-bold fs-5 text-success" 
                            id="montoPagado" 
                            placeholder="Monto"
                            value={montoPagado}
                            onChange={(e) => setMontoPagado(e.target.value)}
                        />
                        <label htmlFor="montoPagado" className="text-muted">Monto Cancelado Ahora (Bs)</label>
                    </div>
                    
                    {parseFloat(montoPagado) < costoTotal && (
                        <div className="text-end mt-2 text-danger small fw-bold">
                            Saldo Pendiente: {costoTotal - (parseFloat(montoPagado) || 0)} Bs
                        </div>
                    )}
                </div>

                <div className="d-flex justify-content-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-light rounded-pill px-4 fw-bold hover-scale">Cancelar</button>
                    <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-lg hover-lift d-flex align-items-center" disabled={loading}>
                        {loading ? 'Procesando...' : <><FaSave className="me-2"/> Confirmar Inscripción</>}
                    </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterInscripcion;