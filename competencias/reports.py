import os
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import date

def draw_logo(canvas_obj, x, y, width, height):
    """Dibuja el logo si existe."""
    try:
        logo_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'img', 'logo.png')
        if os.path.exists(logo_path):
            canvas_obj.drawImage(logo_path, x, y, width=width, height=height, mask='auto')
    except Exception as e:
        print(f"Error cargando logo: {e}")

def generar_pdf_ranking(response, competencia, ranking_data):
    """
    Genera el PDF de ranking interno (lógica simplificada para admin).
    """
    c = canvas.Canvas(response, pagesize=A4)
    w, h = A4
    
    draw_logo(c, 1*inch, h - 1.5*inch, 1*inch, 1*inch)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(w/2, h - 1*inch, f"Ranking: {competencia.name}")
    
    y = h - 2*inch
    c.setFont("Helvetica", 12)
    
    for idx, item in enumerate(ranking_data, 1):
        nombre = f"{item['inscripcion__deportista__first_name']} {item['inscripcion__deportista__apellido_paterno']}"
        club = item['inscripcion__club__name']
        score = item['total_score']
        c.drawString(1*inch, y, f"{idx}. {nombre} ({club}) - {score} pts")
        y -= 20
        if y < 1*inch:
            c.showPage()
            y = h - 1*inch

    c.save()

def generar_recibo_pdf(response, inscripcion):
    """Genera el Recibo de Inscripción."""
    c = canvas.Canvas(response, pagesize=A4)
    w, h = A4
    
    draw_logo(c, 1*inch, h - 1.5*inch, 1.2*inch, 1.2*inch)

    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(w/2, h - 1*inch, "RECIBO DE INGRESO")
    c.setFont("Helvetica", 10)
    c.drawCentredString(w/2, h - 1.3*inch, "Asociación Departamental de Tiro Deportivo")
    
    y = h - 2.5*inch
    x = 1*inch
    c.setStrokeColor(colors.grey)
    c.rect(x-10, y-150, w-2*inch+20, 170, fill=0)
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x, y, f"Nro. Transacción: {inscripcion.id:06d}")
    c.drawRightString(w-x, y, f"Fecha: {date.today().strftime('%d/%m/%Y')}")
    y -= 30
    c.setFont("Helvetica", 11)
    c.drawString(x, y, f"Recibimos de: {inscripcion.deportista.first_name} {inscripcion.deportista.apellido_paterno}")
    y -= 20
    c.drawString(x, y, f"La suma de: {inscripcion.monto_pagado} Bolivianos")
    y -= 20
    c.drawString(x, y, f"Por concepto de: Inscripción a {inscripcion.competencia.name}")
    y -= 30
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(x, y, f"Observaciones: {inscripcion.observaciones_pago or 'Ninguna'}")

    y -= 40
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x, y, "Detalle:")
    y -= 20
    c.setFont("Helvetica", 10)
    
    for part in inscripcion.participaciones.all():
        cat_name = part.categoria.name if part.categoria else part.modalidad.name
        c.drawString(x+20, y, f"• {cat_name}")
        c.drawRightString(w-x-20, y, f"{part.costo_cobrado} Bs")
        y -= 15
        
    y -= 10
    c.line(x, y, w-x, y)
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x, y, "TOTAL PAGADO")
    c.drawRightString(w-x, y, f"{inscripcion.monto_pagado} Bs")

    y_firma = 2*inch
    c.line(x+20, y_firma, x+200, y_firma)
    c.drawString(x+50, y_firma-15, "Entregué Conforme")
    c.line(x+250, y_firma, x+450, y_firma)
    c.drawString(x+300, y_firma-15, "Recibí Conforme (Tesorería)")
    c.save()

def generar_diploma_pdf(response, resultado):
    """Genera el Diploma de Honor."""
    inscripcion = resultado.inscripcion
    deportista = f"{inscripcion.deportista.first_name} {inscripcion.deportista.apellido_paterno}"
    competencia = inscripcion.competencia.name
    fecha = inscripcion.competencia.start_date.strftime("%d de %B de %Y")
    part = inscripcion.participaciones.first()
    modalidad = part.modalidad.name if part else "Tiro Deportivo"
    categoria = part.categoria.name if part and part.categoria else "General"

    c = canvas.Canvas(response, pagesize=landscape(A4))
    w, h = landscape(A4)
    
    c.setStrokeColorRGB(0.8, 0.6, 0.2)
    c.setLineWidth(5)
    c.rect(30, 30, w-60, h-60)
    
    draw_logo(c, w/2 - 50, h - 130, 100, 100)

    c.setFont("Times-Bold", 36)
    c.drawCentredString(w/2, h - 160, "DIPLOMA DE HONOR")
    c.setFont("Times-Roman", 16)
    c.drawCentredString(w/2, h - 200, "La Asociación Departamental de Tiro Deportivo")
    c.drawCentredString(w/2, h - 220, "Confiere el presente reconocimiento a:")
    
    c.setFont("Times-BoldItalic", 30)
    c.setFillColorRGB(0.1, 0.1, 0.5)
    c.drawCentredString(w/2, h - 270, deportista.upper())
    c.setFillColorRGB(0, 0, 0)
    
    c.setFont("Times-Roman", 16)
    c.drawCentredString(w/2, h - 320, f"Por su participación en {modalidad.upper()} - {categoria.upper()}")
    c.drawCentredString(w/2, h - 345, f"Evento: {competencia}")
    c.setFont("Helvetica", 12)
    c.drawCentredString(w/2, 130, f"Cochabamba, {fecha}")
    
    y_firma = 60
    c.line(w/4 - 50, y_firma, w/4 + 100, y_firma)
    c.drawString(w/4, y_firma - 15, "Presidente")
    c.line(w*0.75 - 100, y_firma, w*0.75 + 50, y_firma)
    c.drawString(w*0.75 - 30, y_firma - 15, "Director Técnico")
    
    c.showPage()
    c.save()