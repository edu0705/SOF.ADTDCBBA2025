import qrcode
import os
from io import BytesIO
from django.conf import settings
from django.utils import timezone
from django.contrib.staticfiles import finders 
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm, mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT

# Definir tamaño de credencial estándar (CR80)
CREDENTIAL_SIZE = (85.60 * mm, 53.98 * mm)

# --- UTILIDADES ---

def _generar_qr(data):
    """Genera imagen QR en memoria"""
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=1)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return ImageReader(buffer)

def get_logo_path():
    """Busca el logo en estáticos o local de forma robusta"""
    # 1. Producción (collectstatic)
    logo_path = os.path.join(settings.STATIC_ROOT, 'img', 'logo.png')
    if os.path.exists(logo_path): return logo_path
    # 2. Desarrollo (finders)
    found = finders.find('img/logo.png')
    if found: return found
    # 3. Fallback local
    local_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'img', 'logo.png')
    if os.path.exists(local_path): return local_path
    return None

# =========================================================================
# 1. CREDENCIAL (CARNET PVC)
# =========================================================================

def generar_credencial_pdf(buffer, deportista):
    c = canvas.Canvas(buffer, pagesize=CREDENTIAL_SIZE)
    width, height = CREDENTIAL_SIZE
    
    # Color según modalidad
    color_barra = colors.darkblue
    if deportista.tipo_modalidad == 'FUEGO': color_barra = colors.darkred
    elif deportista.tipo_modalidad == 'MIXTA': color_barra = colors.purple
        
    # Barra Superior
    c.setFillColor(color_barra)
    c.rect(0, height - 12*mm, width, 12*mm, fill=1, stroke=0)
    
    # Logo
    logo_path = get_logo_path()
    if logo_path:
        try: c.drawImage(logo_path, 2*mm, height - 10*mm, width=8*mm, height=8*mm, mask='auto')
        except: pass

    # Título
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(width / 2 + 4*mm, height - 5*mm, "ASOCIACIÓN DEPTAL. DE TIRO DEPORTIVO")
    c.setFont("Helvetica", 6)
    c.drawCentredString(width / 2 + 4*mm, height - 8*mm, "COCHABAMBA - BOLIVIA")

    # Foto
    foto_x, foto_y, foto_w, foto_h = 4*mm, 15*mm, 22*mm, 25*mm
    c.setStrokeColor(colors.black)
    c.setLineWidth(0.5)
    c.rect(foto_x, foto_y, foto_w, foto_h)
    
    if deportista.foto:
        try: c.drawImage(deportista.foto.path, foto_x, foto_y, width=foto_w, height=foto_h, preserveAspectRatio=True, anchor='c')
        except: 
            c.setFont("Helvetica", 6)
            c.drawCentredString(foto_x + foto_w/2, foto_y + foto_h/2, "S/F")
    else:
        c.setFont("Helvetica", 6)
        c.drawCentredString(foto_x + foto_w/2, foto_y + foto_h/2, "S/F")

    # Datos
    text_x = 30*mm
    start_y = height - 20*mm
    c.setFillColor(colors.black)
    
    c.setFont("Helvetica-Bold", 11)
    nombre = f"{deportista.first_name} {deportista.apellido_paterno}"
    c.drawString(text_x, start_y, nombre.upper())
    
    c.setFont("Helvetica-Bold", 8)
    c.drawString(text_x, start_y - 6*mm, f"CI: {deportista.ci}")
    
    c.setFont("Helvetica", 7)
    c.drawString(text_x, start_y - 11*mm, f"Club: {deportista.club.name if deportista.club else 'Particular'}")
    c.drawString(text_x, start_y - 15*mm, f"Modalidad: {deportista.get_tipo_modalidad_display()}")
    c.drawString(text_x, start_y - 19*mm, f"Código: {deportista.codigo_unico or '---'}")

    # QR
    vence_str = deportista.vencimiento_credencial.strftime('%d/%m/%Y') if deportista.vencimiento_credencial else "PENDIENTE"
    qr_data = f"ADTCBBA\nCI:{deportista.ci}\nCOD:{deportista.codigo_unico}\nVENCE:{vence_str}\nMOD:{deportista.tipo_modalidad}"
    qr_img = _generar_qr(qr_data)
    c.drawImage(qr_img, width - 20*mm, 15*mm, width=16*mm, height=16*mm)

    # Pie
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.red if deportista.tipo_modalidad != 'AIRE' else colors.blue)
    c.drawCentredString(width/2, 6*mm, f"VENCE: {vence_str}")
    
    c.showPage()
    c.save()

# =========================================================================
# 2. CERTIFICADO (DIPLOMA)
# =========================================================================

def generar_diploma_pdf(buffer, resultado):
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    # Marcos
    c.setStrokeColor(colors.gold)
    c.setLineWidth(5)
    c.rect(20, 20, width-40, height-40)
    c.setStrokeColor(colors.darkblue)
    c.setLineWidth(2)
    c.rect(25, 25, width-50, height-50)

    # Logo
    logo_path = get_logo_path()
    if logo_path:
        try: c.drawImage(logo_path, width/2 - 40, height - 110, 80, 80, mask='auto')
        except: pass

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width/2, height - 130, "ASOCIACIÓN DEPARTAMENTAL DE TIRO DEPORTIVO")
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, height - 150, "COCHABAMBA - BOLIVIA")

    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 220, "DIPLOMA DE HONOR")

    c.setFont("Helvetica", 16)
    c.drawCentredString(width/2, height - 260, "Otorgado a:")
    
    nombre = f"{resultado.inscripcion.deportista.first_name} {resultado.inscripcion.deportista.apellido_paterno}"
    c.setFont("Times-BoldItalic", 32)
    c.setFillColor(colors.darkblue)
    c.drawCentredString(width/2, height - 310, nombre.upper())
    
    c.setFont("Helvetica", 16)
    c.setFillColor(colors.black)
    c.drawCentredString(width/2, height - 360, f"Por obtener {resultado.puntaje} puntos en la competencia:")
    
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, height - 390, f"\"{resultado.inscripcion.competencia.name.upper()}\"")
    
    # Fecha
    fecha = resultado.inscripcion.competencia.start_date
    meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    fecha_str = f"Cochabamba, {fecha.day} de {meses[fecha.month-1]} de {fecha.year}"
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, 180, fecha_str)

    # Firmas
    c.setLineWidth(1)
    c.line(width/4 - 60, 100, width/4 + 60, 100)
    c.line(3*width/4 - 60, 100, 3*width/4 + 60, 100)
    c.setFont("Helvetica", 10)
    c.drawCentredString(width/4, 85, "PRESIDENTE ADTCBBA")
    c.drawCentredString(3*width/4, 85, "DIRECTOR COMPETENCIA")

    # QR
    qr_data = f"VALIDACION:{resultado.codigo_verificacion}"
    qr_img = _generar_qr(qr_data)
    c.drawImage(qr_img, 40, 40, 3*cm, 3*cm)

    c.showPage()
    c.save()

# =========================================================================
# 3. REPORTE TRIMESTRAL
# =========================================================================

def generar_reporte_trimestral_pdf(buffer, data, year, quarter):
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    elements = []
    styles = getSampleStyleSheet()
    
    logo_path = get_logo_path()
    if logo_path:
        im = Image(logo_path, width=2*cm, height=2*cm)
        im.hAlign = 'CENTER'
        elements.append(im)

    elements.append(Paragraph("ASOCIACIÓN DEPARTAMENTAL DE TIRO DEPORTIVO", styles['Title']))
    elements.append(Paragraph(f"INFORME TRIMESTRAL Q{quarter}/{year}", styles['Heading2']))
    elements.append(Spacer(1, 20))

    # Tabla Finanzas
    finanzas = data['resumen_financiero']
    d = [
        ["CONCEPTO", "MONTO (Bs)"],
        ["Ingresos Inscripciones", f"{finanzas['ingresos_brutos']:.2f}"],
        ["Gastos Operativos", f"{finanzas['gastos_registrados']:.2f}"],
        ["BALANCE NETO", f"{finanzas['balance_neto']:.2f}"]
    ]
    t = Table(d, colWidths=[10*cm, 4*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.darkblue),
        ('TEXTCOLOR', (0,0), (1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))
    elements.append(t)
    doc.build(elements)

# =========================================================================
# 4. CONVOCATORIA OFICIAL (REPLICA EXACTA DEL FORMATO)
# =========================================================================

def generar_convocatoria_pdf(buffer, competencia):
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2.5*cm, leftMargin=2.5*cm, topMargin=1.5*cm, bottomMargin=2*cm)
    elements = []
    styles = getSampleStyleSheet()
    
    # -- Estilos Personalizados (Basados en el documento subido) --
    s_titulo = ParagraphStyle('Titulo', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=14, spaceAfter=4, textColor=colors.black)
    s_sub = ParagraphStyle('Sub', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=11, spaceAfter=10, alignment=TA_CENTER, textColor=colors.black)
    s_normal = ParagraphStyle('Norm', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=13, alignment=TA_JUSTIFY, spaceAfter=6)
    s_lista = ParagraphStyle('List', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=13, leftIndent=20, spaceAfter=3)
    s_negrita = ParagraphStyle('Bold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, spaceAfter=4)

    # 1. MEMBRETE
    logo_path = get_logo_path()
    if logo_path:
        im = Image(logo_path, width=1.8*cm, height=1.8*cm)
        im.hAlign = 'CENTER'
        elements.append(im)
    
    elements.append(Paragraph("ASOCIACIÓN DEPARTAMENTAL DE TIRO DEPORTIVO COCHABAMBA", s_sub))
    elements.append(Paragraph(f"Convocatoria N° {competencia.numero_convocatoria or '___'}/{competencia.start_date.year}", s_sub))
    elements.append(Spacer(1, 10))

    # 2. TÍTULO
    meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    fecha = competencia.start_date
    fecha_texto = f"SÁBADO {fecha.day} DE {meses[fecha.month-1].upper()} DE {fecha.year}"

    elements.append(Paragraph("CONVOCATORIA", s_titulo))
    elements.append(Paragraph(f"CAMPEONATO {competencia.type.upper()}", s_sub))
    elements.append(Paragraph(f"MODALIDAD: {competencia.name.upper()}", s_sub))
    elements.append(Paragraph(fecha_texto, s_sub))
    elements.append(Spacer(1, 10))

    # 3. INTRODUCCIÓN
    texto_intro = f"""
    La Asociación Departamental de Tiro Deportivo de Cochabamba, convoca a todos los clubes afiliados, 
    así como a deportistas invitados, al <b>{competencia.name}</b> de la Gestión {fecha.year}, 
    que se llevará a cabo bajo las normas y reglamentos vigentes.
    """
    elements.append(Paragraph(texto_intro, s_normal))

    # 4. DETALLES DEL EVENTO
    lugar = competencia.poligono.address if competencia.poligono else "Por definir"
    poligono = competencia.poligono.name if competencia.poligono else "Por definir"
    
    data_detalles = [
        [Paragraph("<b>Lugar:</b>", s_normal), Paragraph(lugar, s_normal)],
        [Paragraph("<b>Fecha:</b>", s_normal), Paragraph(fecha_texto, s_normal)],
        [Paragraph("<b>Polígono:</b>", s_normal), Paragraph(poligono, s_normal)],
    ]
    t = Table(data_detalles, colWidths=[3*cm, 12*cm])
    t.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(t)
    elements.append(Spacer(1, 10))

    # 5. INSCRIPCIONES Y HORARIOS
    elements.append(Paragraph("INSCRIPCIONES Y HORARIOS:", s_negrita))
    
    h_apertura = competencia.hora_competencia.strftime('%H:%M')
    if hasattr(competencia, 'hora_apertura'): h_apertura = competencia.hora_apertura.strftime('%H:%M')
    
    # Lógica de info bancaria: Si está vacía, no la mostramos o ponemos 'A coordinar'
    banco_texto = competencia.banco_info if competencia.banco_info else "Coordinar con Secretaría"
    
    puntos = [
        f"1. El día de la competencia, el polígono estará abierto para céreo de armas a partir de horas <b>{h_apertura}</b>.",
        f"2. El inicio de la prueba será a horas <b>{competencia.hora_competencia.strftime('%H:%M')}</b>, de acuerdo a la coordinación técnica.",
        f"3. El costo de inscripción por tirador será de <b>Bs. {competencia.costo_inscripcion_base:.2f}</b>.",
        f"4. Método de Pago / Cuenta: <b>{banco_texto}</b>."
    ]

    # Agregar la nota del costo máximo si aplica
    if competencia.costo_limite_global and competencia.costo_limite_global > 0:
        puntos.append(f"<b>* OBSERVACIÓN IMPORTANTE:</b> El costo máximo que pagará el deportista será de <b>Bs. {competencia.costo_limite_global:.2f}</b>, independientemente de la cantidad de categorías en las que participe.")

    for p in puntos:
        elements.append(Paragraph(p, s_lista))
    
    elements.append(Spacer(1, 10))

    # 6. MODALIDADES (Dinámico desde BD)
    elements.append(Paragraph("DE LAS MODALIDADES Y CATEGORÍAS:", s_negrita))
    
    # Importación local para evitar ciclo
    from .models import CategoriaCompetencia
    cats = CategoriaCompetencia.objects.filter(competencia=competencia).select_related('categoria', 'categoria__modalidad')
    
    if cats.exists():
        idx = 1
        for cc in cats:
            mod_name = cc.categoria.modalidad.name
            cat_name = cc.categoria.name
            calibre = f"(Calibre: {cc.categoria.calibre_permitido})" if cc.categoria.calibre_permitido else ""
            costo_extra = f" - Bs. {cc.costo:.2f}" if cc.costo > 0 else ""
            
            texto_cat = f"{idx}. <b>{mod_name}</b> - {cat_name} {calibre}{costo_extra}"
            elements.append(Paragraph(texto_cat, s_lista))
            idx += 1
    else:
        elements.append(Paragraph("Se habilitarán todas las categorías según reglamento vigente.", s_lista))
    
    elements.append(Paragraph("• Tiempo y blancos según reglamento ISSF/Federación.", s_lista))
    elements.append(Spacer(1, 10))

    # 7. RANKING Y PREMIACIÓN
    elements.append(Paragraph("DEL RANKING Y LA PREMIACIÓN:", s_negrita))
    texto_rank = """
    El campeonato se constituye válido para el ranking Departamental. 
    Del mismo modo, se considerarán los puntajes individuales más altos de los deportistas en representación de sus Clubes, 
    para puntuar en el ranking interclubes y a efectos de premiación anual.
    """
    elements.append(Paragraph(texto_rank, s_normal))
    elements.append(Spacer(1, 10))

    # 8. CONTACTO
    contact = getattr(competencia, 'contacto_telefono', '78338378')
    nombre_contact = getattr(competencia, 'contacto_nombre', 'Secretaría')
    if contact or nombre_contact:
        elements.append(Paragraph(f"Cualquier consulta será atendida por: <b>{nombre_contact} ({contact})</b>.", s_normal))

    # 9. FIRMAS
    elements.append(Spacer(1, 3*cm))
    elements.append(Paragraph("LA DIRECTIVA", ParagraphStyle('CenterBold', parent=s_normal, alignment=TA_CENTER, fontName='Helvetica-Bold')))

    doc.build(elements)

# --- Funciones Legacy vacías para evitar errores si se llaman ---
def generar_recibo_pdf(response, inscripcion): pass
def generar_pdf_ranking(response, competencia, data): pass