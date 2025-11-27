import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import inscripcionService from '../services/inscripcionService'; // Tu servicio de API
import competenciaService from '../services/competenciaService';
import deportistaService from '../services/deportistaService';
import { FaSave, FaArrowLeft, FaMoneyBillWave, FaListUl, FaUser, FaTrophy } from 'react-icons/fa';

const RegisterInscripcion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Datos Auxiliares
  const [competencias, setCompetencias] = useState([]);
  const [deportistas, setDeportistas] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]); // Categorías de la competencia seleccionada

  // Estado del Formulario
  const [selectedCompetencia, setSelectedCompetencia] = useState(null);
  const [selectedDeportista, setSelectedDeportista] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); // IDs de categorías seleccionadas
  const [montoPagado, setMontoPagado] = useState('');
  
  // Estado Calculado
  const [costoTotal, setCostoTotal] = useState(0);

  // 1. Cargar Listas Iniciales
  useEffect(() => {
    const initData = async () => {
        try {
            const [resComp, resDep] = await Promise.all([
                competenciaService.getCompetencias(),
                deportistaService.getDeportistas()
            ]);
            // Filtrar solo competencias activas
            const activeComps = (resComp.data.results || resComp.data).filter(c => c.status !== 'Finalizada');
            setCompetencias(activeComps);
            setDeportistas(resDep.data.results || resDep.data);
        } catch (err) {
            console.error("Error cargando datos:", err);
        }
    };
    initData();
  }, []);

  // 2. Al seleccionar competencia, cargar sus categorías y costos
  useEffect(() => {
    if (!selectedCompetencia) {
        setCategoriasDisponibles([]);
        setSelectedCategories([]);
        return;
    }
    
    // Aquí deberías tener un endpoint que te de el detalle completo de la competencia con sus categorías
    // Por ahora simulamos que 'selectedCompetencia' ya tiene un array 'categorias_detalle' o hacemos fetch
    const fetchDetails = async () => {
        try {
            // Suponiendo un endpoint: /api/competencias/{id}/
            const res = await competenciaService.getCompetenciaById(selectedCompetencia.id);
            setCategoriasDisponibles(res.data.categorias_detalle || []); 
        } catch (err) {
            console.error("Error cargando detalles competencia:", err);
        }
    };
    fetchDetails();
  }, [selectedCompetencia]);

  // 3. Calculadora de Costos en Vivo (Regla de Negocio Frontend)
  useEffect(() => {
    if (!selectedCompetencia) {
        setCostoTotal(0);
        return;
    }

    let total = parseFloat(selectedCompetencia.costo_inscripcion_base || 0);
    
    // Sumar costo de categorías seleccionadas
    selectedCategories.forEach(catId => {
        const cat = categoriasDisponibles.find(c => c.id === catId);
        if (cat) total += parseFloat(cat.costo || 0);
    });

    // Aplicar Techo Máximo Global
    const limite = parseFloat(selectedCompetencia.costo_limite_global);
    if (limite > 0 && total > limite) {
        total = limite;
    }

    setCostoTotal(total);
    // Sugerir monto pagado igual al total por defecto
    if (!montoPagado) setMontoPagado(total);

  }, [selectedCompetencia, selectedCategories, categoriasDisponibles, montoPagado]);

  // Manejadores
  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev => 
        prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompetencia || !selectedDeportista || selectedCategories.length === 0) {
        return alert("Complete todos los campos obligatorios.");
    }

    setLoading(true);
    const payload = {
        competencia: selectedCompetencia.id,
        deportista: selectedDeportista,
        participaciones: selectedCategories.map(catId => ({ categoria: catId })), // Estructura para backend
        monto_pagado: montoPagado,
        estado: parseFloat(montoPagado) >= costoTotal ? 'APROBADA' : 'PENDIENTE'
    };

    try {
        await inscripcionService.createInscripcion(payload);
        alert("✅ Inscripción registrada correctamente.");
        navigate('/inscripciones');
    } catch (err) {
        console.error(err);
        alert("Error al registrar. Verifique si el deportista cumple los requisitos (Licencia/Arma).");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
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
                        className="form-select form-select-lg bg-light border-0" 
                        onChange={(e) => {
                            const comp = competencias.find(c => c.id.toString() === e.target.value);
                            setSelectedCompetencia(comp);
                        }}
                    >
                        <option value="">-- Seleccione Evento --</option>
                        {competencias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {selectedCompetencia?.costo_limite_global > 0 && (
                        <div className="form-text text-success fw-bold">
                            <FaMoneyBillWave className="me-1"/> ¡Esta competencia tiene un costo máximo de {selectedCompetencia.costo_limite_global} Bs!
                        </div>
                    )}
                </div>

                {/* 2. SELECCIÓN DE DEPORTISTA */}
                <div className="mb-4">
                    <label className="form-label fw-bold text-secondary"><FaUser className="me-2"/> Deportista</label>
                    <select 
                        className="form-select bg-light border-0" 
                        value={selectedDeportista}
                        onChange={(e) => setSelectedDeportista(e.target.value)}
                    >
                        <option value="">-- Buscar Deportista --</option>
                        {deportistas.map(d => (
                            <option key={d.id} value={d.id}>{d.first_name} {d.apellido_paterno} ({d.ci})</option>
                        ))}
                    </select>
                </div>

                {/* 3. SELECCIÓN DE CATEGORÍAS */}
                {selectedCompetencia && (
                    <div className="mb-4 animate-slide-up">
                        <label className="form-label fw-bold text-secondary"><FaListUl className="me-2"/> Modalidades y Categorías</label>
                        <div className="card border-0 bg-light p-3">
                            <div className="row g-2">
                                {categoriasDisponibles.length > 0 ? categoriasDisponibles.map(cat => (
                                    <div key={cat.id} className="col-md-6">
                                        <div 
                                            className={`p-3 rounded border cursor-pointer transition-all ${selectedCategories.includes(cat.id) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-light hover-bg-gray'}`}
                                            onClick={() => handleCategoryToggle(cat.id)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-bold">{cat.modalidad_nombre} - {cat.name}</span>
                                                <span className={`badge ${selectedCategories.includes(cat.id) ? 'bg-white text-primary' : 'bg-secondary'}`}>
                                                    {cat.costo} Bs
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-muted small">Cargando categorías...</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. RESUMEN DE PAGOS */}
                <div className="card bg-primary bg-opacity-10 border-0 p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-bold text-primary">Total a Pagar</h5>
                        <h3 className="mb-0 fw-bold text-dark">{costoTotal} Bs</h3>
                    </div>
                    <div className="form-floating">
                        <input 
                            type="number" 
                            className="form-control border-0 fw-bold" 
                            id="montoPagado" 
                            placeholder="Monto"
                            value={montoPagado}
                            onChange={(e) => setMontoPagado(e.target.value)}
                        />
                        <label htmlFor="montoPagado">Monto Cancelado Ahora (Bs)</label>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-light rounded-pill px-4 fw-bold">Cancelar</button>
                    <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-lg hover-lift" disabled={loading}>
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