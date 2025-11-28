from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from django.conf import settings
import os
from .models import AutoridadFirma

# --- UTILIDADES ---

def dibujar_firmas(c, width, y_position):
    """Dibuja hasta 3 firmas activas al pie del documento."""
    autoridades = AutoridadFirma.objects.filter(activo=True)[:3]
    if not autoridades: return

    ancho_zona = width - 100
    espacio = ancho_zona / len(autoridades)
    start_x = 50

    for i, aut in enumerate(autoridades):
        center_x = start_x + (i * espacio) + (espacio / 2)
        
        # Firma (Imagen)
        if aut.firma:
            try:
                path = os.path.join(settings.MEDIA_ROOT, aut.firma.name)
                # Aspecto 2:1 para firma
                c.drawImage(path, center_x - 40, y_position + 15, width=80, height=40, mask='auto', preserveAspectRatio=True)
            except: pass
        
        # Línea y Cargo
        c.setLineWidth(1)
        c.line(center_x - 60, y_position + 15, center_x + 60, y_position + 15)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(center_x, y_position + 5, aut.nombre)
        c.setFont("Helvetica", 8)
        c.drawCentredString(center_x, y_position - 5, aut.cargo)

# --- REPORTES PRINCIPALES ---

def generar_diploma_pdf(response, resultado):
    c = canvas.Canvas(response, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Marco
    c.setLineWidth(5)
    c.setStrokeColor(colors.navy)
    c.rect(20, 20, width-40, height-40)
    
    # Títulos
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width/2, height - 80, "DIPLOMA DE HONOR")
    
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 120, "La Asociación Departamental de Tiro otorga el presente reconocimiento a:")
    
    # Nombre Atleta
    c.setFont("Helvetica-Bold", 24)
    nombre = "Atleta Desconocido"
    if resultado.inscripcion and resultado.inscripcion.deportista:
        nombre = f"{resultado.inscripcion.deportista.first_name} {resultado.inscripcion.deportista.last_name}"
    
    c.drawCentredString(width/2, height - 160, nombre.upper())
    
    # Detalle
    c.setFont("Helvetica", 14)
    competencia_nombre = resultado.inscripcion.competencia.name if resultado.inscripcion else "Competencia"
    texto = f"Por su destacada participación en {competencia_nombre}"
    c.drawCentredString(width/2, height - 200, texto)
    
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width/2, height - 230, f"PUNTAJE: {resultado.puntaje}")

    # Código QR / Verificación
    c.setFont("Courier", 10)
    c.drawString(40, 40, f"ID Verificación: {resultado.codigo_verificacion}")

    # Firmas
    dibujar_firmas(c, width, 60)

    c.showPage()
    c.save()

def generar_credencial_pdf(response, deportista):
    """Genera un carnet de deportista en tamaño tarjeta."""
    card_width = 8.56 * cm
    card_height = 5.4 * cm
    
    c = canvas.Canvas(response, pagesize=(card_width, card_height))
    
    # Fondo / Diseño
    c.setFillColor(colors.navy)
    c.rect(0, 0, card_width, card_height, fill=1)
    
    # Cabecera
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(card_width/2, card_height - 15, "FEDERACIÓN DE TIRO")
    c.setFont("Helvetica", 6)
    c.drawCentredString(card_width/2, card_height - 25, "CREDENCIAL DE ATLETA")
    
    # Foto (Placeholder o Real)
    if deportista.foto:
        try:
            path_foto = os.path.join(settings.MEDIA_ROOT, deportista.foto.name)
            c.drawImage(path_foto, 5, 20, width=40, height=40, preserveAspectRatio=True)
        except:
            c.setFillColor(colors.white)
            c.rect(5, 20, 40, 40, fill=1)
    else:
        c.setFillColor(colors.gray)
        c.rect(5, 20, 40, 40, fill=1)

    # Datos
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    nombre_completo = f"{deportista.first_name} {deportista.last_name}"
    if len(nombre_completo) > 20: c.setFont("Helvetica-Bold", 7)
    
    c.drawString(50, 50, nombre_completo.upper())
    
    c.setFont("Helvetica", 6)
    c.drawString(50, 40, f"CI: {deportista.ci}")
    
    club_nombre = deportista.club.name if deportista.club else "PARTICULAR"
    c.drawString(50, 32, f"CLUB: {club_nombre}")
    
    # Ajuste por si el modelo Deportista no tiene 'categoria_nombre' directamente
    cat = "GENERAL"
    if hasattr(deportista, 'categoria') and deportista.categoria:
        cat = deportista.categoria.name
    c.drawString(50, 24, f"CATEGORÍA: {cat}")

    c.showPage()
    c.save()

def generar_pdf_ranking(response, competencia, ranking_data):
    """
    Genera el reporte de ranking para una competencia.
    ranking_data viene del RankingService.get_ranking_competencia_pdf
    """
    c = canvas.Canvas(response, pagesize=letter)
    width, height = letter
    y = height - 50

    # Título
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, f"RANKING OFICIAL: {competencia.name}")
    y -= 25
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Fecha: {competencia.start_date} | Estado: {competencia.status}")
    y -= 30

    # Cabecera Tabla
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y, "PUESTO")
    c.drawString(100, y, "ATLETA")
    c.drawString(300, y, "CLUB")
    c.drawString(450, y, "PUNTAJE")
    y -= 5
    c.line(50, y, 550, y)
    y -= 15

    # Contenido (ranking_data es un diccionario con 'items' que es el QuerySet)
    resultados = ranking_data.get('items', [])
    
    c.setFont("Helvetica", 10)
    for i, res in enumerate(resultados, 1):
        if y < 100: # Nueva página si se acaba el espacio
            c.showPage()
            y = height - 50
        
        nombre = f"{res.inscripcion.deportista.first_name} {res.inscripcion.deportista.last_name}"
        club = res.inscripcion.club.name if res.inscripcion.club else "Sin Club"
        
        c.drawString(60, y, str(i))
        c.drawString(100, y, nombre)
        c.drawString(300, y, club)
        c.drawString(450, y, str(res.puntaje))
        y -= 20

    # Firmas al final
    dibujar_firmas(c, width, 50)
    
    c.showPage()
    c.save()

def generar_recibo_pdf(response, inscripcion):
    """Genera un recibo simple de inscripción."""
    c = canvas.Canvas(response, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width/2, height - 50, "RECIBO DE INSCRIPCIÓN")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 100, f"Fecha: {inscripcion.fecha_inscripcion.strftime('%d/%m/%Y')}")
    c.drawString(50, height - 120, f"Recibí de: {inscripcion.deportista.first_name} {inscripcion.deportista.last_name}")
    
    monto = inscripcion.monto_pagado
    c.drawString(50, height - 140, f"La suma de: {monto} Bolivianos")
    
    concepto = f"Inscripción a: {inscripcion.competencia.name}"
    c.drawString(50, height - 160, f"Por concepto de: {concepto}")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(400, height - 140, f"TOTAL: {monto} Bs")
    
    # Firma Cajero (Placeholder)
    c.line(350, height - 250, 500, height - 250)
    c.setFont("Helvetica", 8)
    c.drawCentredString(425, height - 260, "Firma y Sello Tesorería")

    c.showPage()
    c.save()