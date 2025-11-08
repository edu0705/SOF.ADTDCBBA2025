// src/services/armaService.js
import authService from './authService';

const armaService = {
  getArmas: () => authService.api.get('deportistas/armas/'),
  // ... (otros métodos si los tienes)
};

export default armaService;