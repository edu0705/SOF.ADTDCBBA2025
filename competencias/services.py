# competencias/services.py
from collections import defaultdict
from django.db.models import Sum, Q
from .models import Competencia, Modalidad, Resultado, Inscripcion

class RankingService:
    """
    Servicio encargado de calcular los Rankings y Datos Estadísticos.
    """
    
    @staticmethod
    def get_ranking_competencia_pdf(competencia):
        """
        Retorna la data optimizada para el reporte PDF de una competencia.
        Evita lógica en la vista.
        """
        # Obtenemos resultados agrupados por inscripción
        # Optimizamos la consulta para evitar N+1
        ranking_data = Resultado.objects.filter(
            inscripcion__competencia=competencia,
            es_descalificado=False
        ).select_related(
            'inscripcion__deportista', 
            'inscripcion__club'
        ).values(
            'inscripcion__deportista__first_name',
            'inscripcion__deportista__apellido_paterno',
            'inscripcion__club__name'
        ).annotate(
            total_score=Sum('puntaje')
        ).order_by('-total_score')
        
        return ranking_data

    @staticmethod
    def calcular_puntos_anuales(year):
        """
        Calcula el ranking anual por modalidad y por clubes.
        """
        ranking_deportistas = defaultdict(lambda: defaultdict(lambda: {
            'puntaje_acumulado': 0, 'eventos': 0, 'nombre': '', 'club': '', 'apellidos': ''
        }))
        ranking_clubes = defaultdict(int)
        
        competencias = Competencia.objects.filter(status='Finalizada', start_date__year=year).prefetch_related('categorias')

        for comp in competencias:
            # Optimizamos trayendo modalidades en batch
            modalidades = Modalidad.objects.filter(categorias__competencias=comp).distinct()
            
            for mod in modalidades:
                resultados = Resultado.objects.filter(
                    inscripcion__competencia=comp, 
                    inscripcion__participaciones__modalidad=mod, 
                    inscripcion__estado='APROBADA',
                    inscripcion__deportista__es_invitado=False,
                    es_descalificado=False
                ).select_related('inscripcion__deportista', 'inscripcion__club')
                
                scores_map = {} 
                for res in resultados:
                    insc_id = res.inscripcion.id
                    if insc_id not in scores_map: 
                        scores_map[insc_id] = {
                            'inscripcion': res.inscripcion, 
                            'total': 0,
                            'sort_key': 0
                        }
                    
                    scores_map[insc_id]['total'] += float(res.puntaje)
                    
                    # Lógica de Desempate
                    if 'sort_key' in res.detalles_json:
                        scores_map[insc_id]['sort_key'] = float(res.detalles_json['sort_key'])
                    else:
                        scores_map[insc_id]['sort_key'] = float(res.puntaje)

                # Ordenar por puntaje/sort_key descendente
                lista_posiciones = sorted(scores_map.values(), key=lambda x: x['sort_key'], reverse=True)
                
                # Reglas de Quórum
                cantidad = len(lista_posiciones)
                top_validos = 0
                if cantidad == 2: top_validos = 1
                elif cantidad == 3: top_validos = 2
                elif cantidad >= 4: top_validos = 999 

                # Tabla Oficial de Puntos (1ro=10, 2do=7, etc.)
                tabla_puntos = [10, 7, 5, 4, 3, 2]

                for i, datos in enumerate(lista_posiciones):
                    if i < top_validos:
                        dep = datos['inscripcion'].deportista
                        club = datos['inscripcion'].club
                        
                        puntos_dep = 1
                        if i < len(tabla_puntos): puntos_dep = tabla_puntos[i]
                        
                        # Acumular Puntos Deportista
                        entry = ranking_deportistas[mod.name][dep.id]
                        entry['nombre'] = dep.first_name
                        entry['apellidos'] = f"{dep.apellido_paterno} {dep.apellido_materno or ''}".strip()
                        entry['club'] = club.name if club else 'Sin Club'
                        entry['puntaje_acumulado'] += puntos_dep
                        entry['eventos'] += 1
                        
                        # Puntos Club (Solo Podio suman al club)
                        if i <= 2 and club: 
                            ranking_clubes[club.name] += 1
                                
        return ranking_deportistas, ranking_clubes


class ResultsService:
    """
    Servicio para procesar resultados oficiales y data para la web.
    """
    @staticmethod
    def get_official_results_data(competencia):
        pdf_url = competencia.resultados_pdf.url if competencia.resultados_pdf else None
        response_data = {
            'competencia': competencia.name, 
            'fecha': competencia.start_date, 
            'estado': competencia.status, 
            'pdf_url': pdf_url, 
            'modalidades': []
        }
        
        # PREFETCH OPTIMIZADO: Traemos todo lo necesario en una sola query grande
        inscripciones = Inscripcion.objects.filter(competencia=competencia, estado='APROBADA')\
            .select_related('deportista', 'club')\
            .prefetch_related('resultados', 'participaciones__modalidad', 'participaciones__arma_utilizada')
            
        modalidades_activas = Modalidad.objects.filter(categorias__competencias=competencia).distinct()

        for modalidad in modalidades_activas:
            mod_data = {'nombre': modalidad.name, 'categorias': []}
            
            # Filtramos categorías de esta competencia y modalidad
            categorias = competencia.categorias.filter(modalidad=modalidad)
            
            for categoria in categorias:
                cat_data = {'nombre': categoria.name, 'resultados': []}
                resultados_temp = []
                
                for inscripcion in inscripciones:
                    # Buscamos en memoria (ya pre-cargado)
                    participacion = next((p for p in inscripcion.participaciones.all() if p.modalidad_id == modalidad.id), None)
                    
                    if participacion:
                        all_results = list(inscripcion.resultados.all())
                        # Lógica para encontrar el resultado "Final"
                        res_obj = next((r for r in all_results if "Final" in r.ronda_o_serie), None) or (all_results[-1] if all_results else None)
                        
                        total_score = sum(float(r.puntaje) for r in all_results)
                        
                        if total_score > 0 or (res_obj and res_obj.es_descalificado):
                            detalles = res_obj.detalles_json if res_obj else {}
                            match_percent = detalles.get('match_percent', '')
                            
                            # Sort Key
                            sort_key = float(total_score)
                            if "FBI" in modalidad.name.upper() and res_obj and not res_obj.es_descalificado:
                                impactos = float(detalles.get('final_hits_5', 0))
                                tiempo_r1 = float(detalles.get('tiempo_r1', 99.99))
                                tiempo_inv = 100 - tiempo_r1
                                sort_key = float(total_score) + (impactos * 0.01) + (tiempo_inv * 0.0001)

                            resultados_temp.append({
                                'id': res_obj.id if res_obj else 0,
                                'deportista': f"{inscripcion.deportista.first_name} {inscripcion.deportista.apellido_paterno}",
                                'club': inscripcion.club.name if inscripcion.club else 'Sin Club',
                                'es_invitado': inscripcion.deportista.es_invitado,
                                'origen': inscripcion.deportista.departamento_origen if inscripcion.deportista.es_invitado else inscripcion.club.name,
                                'arma': participacion.arma_utilizada.modelo if participacion.arma_utilizada else 'N/A',
                                'puntaje': 0 if res_obj and res_obj.es_descalificado else float(total_score),
                                'es_descalificado': res_obj.es_descalificado if res_obj else False,
                                'motivo_dq': res_obj.motivo_descalificacion if res_obj else '',
                                'extra_info': f"{match_percent}%" if match_percent else "",
                                'sort_key': -999 if res_obj and res_obj.es_descalificado else sort_key
                            })
                
                cat_data['resultados'] = sorted(resultados_temp, key=lambda x: x['sort_key'], reverse=True)
                if cat_data['resultados']: mod_data['categorias'].append(cat_data)
            
            if mod_data['categorias']: response_data['modalidades'].append(mod_data)
            
        return response_data