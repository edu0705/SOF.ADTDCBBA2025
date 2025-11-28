import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import competenciaService from '../services/competenciaService'; // Asegúrate de que este import sea correcto

// HOOK PERSONALIZADO: Maneja toda la lógica de Competencias
export const useCompetencias = () => {
    const queryClient = useQueryClient();

    // 1. OBTENER (GET) - Con Caché Automático
    const { 
        data: competencias = [], 
        isLoading, 
        isError, 
        error 
    } = useQuery({
        queryKey: ['competencias'], // Clave única para la caché
        queryFn: competenciaService.getAll, // Tu servicio existente
    });

    // 2. CREAR (POST) - Actualiza la lista automáticamente
    const crearCompetencia = useMutation({
        mutationFn: competenciaService.create,
        onSuccess: () => {
            // Cuando se crea con éxito, invalidamos la caché para recargar la lista
            queryClient.invalidateQueries(['competencias']);
            // Opcional: Mostrar Toast de éxito aquí
        },
    });

    // 3. ELIMINAR (DELETE)
    const eliminarCompetencia = useMutation({
        mutationFn: competenciaService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['competencias']);
        },
    });

    return {
        competencias,
        isLoading,
        isError,
        error,
        crearCompetencia,
        eliminarCompetencia
    };
};