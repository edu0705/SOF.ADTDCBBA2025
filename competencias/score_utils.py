# competencias/score_utils.py

def calculate_round_score(modalidad_nombre, score_data):
    """
    Calcula el puntaje de una ronda basado en el nombre de la modalidad
    y los datos recibidos (JSON).
    """
    # Si no hay datos, devolvemos 0
    if not score_data:
        return 0.0

    nombre = modalidad_nombre.upper()
    puntaje = 0.0

    # --- CASO 1: SILUETA METÁLICA ---
    # Regla: Pájaro=1, Chancho=1.5, Pava=2, Carnero=2.5
    if "SILUETA" in nombre or "METÁLICA" in nombre:
        pajaros = float(score_data.get('pajaros', 0))
        chanchos = float(score_data.get('chanchos', 0))
        pavas = float(score_data.get('pavas', 0))
        carneros = float(score_data.get('carneros', 0))
        
        puntaje = (pajaros * 1.0) + (chanchos * 1.5) + (pavas * 2.0) + (carneros * 2.5)

    # --- CASO 2: FBI ---
    # Regla: Los impactos valen el número de su zona (5, 4, 3, 2)
    elif "FBI" in nombre:
        imp_5 = float(score_data.get('impactos_5', 0))
        imp_4 = float(score_data.get('impactos_4', 0))
        imp_3 = float(score_data.get('impactos_3', 0))
        imp_2 = float(score_data.get('impactos_2', 0))
        
        puntaje = (imp_5 * 5) + (imp_4 * 4) + (imp_3 * 3) + (imp_2 * 2)

    # --- CASO 3: MODALIDADES DIRECTAS (Default) ---
    # Para Escopeta, Bench Rest, etc., el juez envía el total ya calculado.
    else:
        puntaje = float(score_data.get('puntaje_total_ronda', 0.0))

    return puntaje