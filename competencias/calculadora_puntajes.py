def calculate_round_score(modalidad_nombre, score_data):
    # --- DEBUG LOGS (Para ver en GitHub Actions) ---
    print(f"DEBUG: Calculando puntaje para: {modalidad_nombre}")
    print(f"DEBUG: Datos recibidos: {score_data}")
    # -----------------------------------------------

    if not score_data:
        print("DEBUG: Datos vacíos -> Retorna 0.0")
        return 0.0

    nombre = modalidad_nombre.upper()
    puntaje = 0.0

    # --- CASO 1: SILUETA METÁLICA ---
    if "SILUETA" in nombre or "METÁLICA" in nombre:
        print("DEBUG: Detectado modo SILUETA")
        pajaros = float(score_data.get('pajaros', 0))
        chanchos = float(score_data.get('chanchos', 0))
        pavas = float(score_data.get('pavas', 0))
        carneros = float(score_data.get('carneros', 0))
        
        puntaje = (pajaros * 1.0) + (chanchos * 1.5) + (pavas * 2.0) + (carneros * 2.5)

    # --- CASO 2: FBI ---
    elif "FBI" in nombre:
        print("DEBUG: Detectado modo FBI")
        imp_5 = float(score_data.get('impactos_5', 0))
        imp_4 = float(score_data.get('impactos_4', 0))
        imp_3 = float(score_data.get('impactos_3', 0))
        imp_2 = float(score_data.get('impactos_2', 0))
        
        puntaje = (imp_5 * 5) + (imp_4 * 4) + (imp_3 * 3) + (imp_2 * 2)

    # --- CASO 3: POR DEFECTO ---
    else:
        print("DEBUG: Detectado modo DEFAULT (Puntaje directo)")
        puntaje = float(score_data.get('puntaje_total_ronda', 0.0))

    print(f"DEBUG: Puntaje Final Calculado: {puntaje}")
    return puntaje