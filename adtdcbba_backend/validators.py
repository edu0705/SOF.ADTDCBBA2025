import os
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_file_integrity(file):
    """
    Valida que el archivo sea realmente una imagen o PDF analizando sus cabeceras (Magic Bytes).
    Evita que se suban scripts maliciosos renombrados.
    """
    # 1. Validación de Extensión (Primer filtro)
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    
    if ext not in valid_extensions:
        raise ValidationError(_('Extensión no permitida. Solo se aceptan: .jpg, .png, .pdf'))

    # 2. Validación de Contenido (Magic Bytes)
    # Leemos los primeros bytes del archivo para ver su firma real
    file.seek(0)
    header = file.read(4)
    file.seek(0)  # Reseteamos el cursor para que Django pueda guardar el archivo después

    # Firmas hexadecimales de archivos comunes
    # JPEG: FF D8 FF
    # PNG: 89 50 4E 47
    # PDF: 25 50 44 46 (%PDF)
    
    hex_header = header.hex().upper()
    
    is_jpeg = hex_header.startswith('FFD8FF')
    is_png = hex_header.startswith('89504E47')
    is_pdf = hex_header.startswith('25504446')

    if not (is_jpeg or is_png or is_pdf):
        raise ValidationError(_('El archivo parece estar corrupto o es un tipo no permitido disfrazado.'))

    # 3. Validación de Tamaño (Máximo 5MB)
    limit_mb = 5
    if file.size > limit_mb * 1024 * 1024:
        raise ValidationError(_(f'El archivo es demasiado grande. Máximo {limit_mb}MB allowed.'))