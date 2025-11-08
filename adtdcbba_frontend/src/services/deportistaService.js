import authService from './authService';

const deportistaService = {
  // Obtiene todos los deportistas (la vista en Django filtra por rol)
  getDeportistas: () => authService.api.get('deportistas/deportistas/'),
  
  // Crea un nuevo deportista (usado en el registro inicial del Club)
  createDeportista: (data) => authService.api.post('deportistas/deportistas/', data),
  
  getDeportistaDetail: (id) => authService.api.get(`deportistas/deportistas/${id}/`),
  
  // Permite al Presidente/Admin cambiar el estado ('Activo', 'Suspendido')
  updateDeportista: (id, data) => authService.api.patch(`deportistas/deportistas/${id}/`, data),
};

export default deportistaService;