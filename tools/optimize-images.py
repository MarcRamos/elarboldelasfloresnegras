#!/usr/bin/env python3
"""
Genera variantes WebP responsivas para todas las imágenes del proyecto.
Variantes: 480w, 768w, 1200w (mantiene la original como la más grande).

Uso:
  python tools/optimize-images.py                    # todas las imágenes
  python tools/optimize-images.py ruta/imagen.webp   # una imagen específica
  python tools/optimize-images.py --dry-run          # muestra qué haría sin ejecutar
"""

import sys
import os
from pathlib import Path
from PIL import Image

EXTENSIONS = {'.webp', '.jpeg', '.jpg', '.png'}
BREAKPOINTS = [480, 768, 1200]
ASSETS_DIR = Path('assets/images')

def get_variant_path(original_path, width):
    stem = original_path.stem
    # quitar sufijo de ancho si ya existe (ej: "imagen-480w" -> "imagen")
    for bp in BREAKPOINTS:
        if stem.endswith(f'-{bp}w'):
            stem = stem[:-(len(str(bp)) + 2)]
            break
    return original_path.with_name(f'{stem}-{width}w.webp')

def optimize_image(img_path, dry_run=False):
    try:
        img = Image.open(img_path)
    except Exception as e:
        print(f"  Error abriendo {img_path.name}: {e}")
        return []

    orig_w, orig_h = img.width, img.height
    variants = []

    for width in BREAKPOINTS:
        if width >= orig_w:
            continue
        variant_path = get_variant_path(img_path, width)
        if dry_run:
            print(f"  Crearía: {variant_path.name} ({width}w)")
            variants.append(variant_path)
            continue
        ratio = width / orig_w
        height = round(orig_h * ratio)
        resized = img.resize((width, height), Image.LANCZOS)
        resized.save(variant_path, 'webp', quality=82, method=6)
        size_kb = os.path.getsize(variant_path) / 1024
        print(f"  Creado: {variant_path.name} ({width}w, {size_kb:.0f}K)")
        variants.append(variant_path)

    if not dry_run:
        orig_kb = os.path.getsize(img_path) / 1024
        print(f"  Original: {img_path.name} ({orig_w}x{orig_h}, {orig_kb:.0f}K)")
        total_saved = sum(os.path.getsize(v) for v in variants)
        print(f"  Total variantes: {len(variants)} archivos, {total_saved / 1024:.0f}K combinados")

    return variants

def collect_images(target=None):
    if target:
        path = Path(target)
        if path.is_file() and path.suffix.lower() in EXTENSIONS:
            return [path]
        print(f"Error: '{target}' no es una imagen válida")
        sys.exit(1)

    images = []
    for ext in EXTENSIONS:
        images.extend(ASSETS_DIR.rglob(f'*{ext}'))
    return [img for img in images if not any(
        f'-{bp}w' in img.stem for bp in BREAKPOINTS
    )]

def main():
    dry_run = '--dry-run' in sys.argv
    target = None
    for arg in sys.argv[1:]:
        if arg != '--dry-run':
            target = arg
            break

    images = collect_images(target)

    if not images:
        print("No se encontraron imágenes para procesar.")
        return

    print(f"{'[DRY RUN] ' if dry_run else ''}Procesando {len(images)} imágenes...\n")

    for img_path in sorted(images):
        rel = img_path.relative_to(ASSETS_DIR.parent) if ASSETS_DIR.parent in img_path.parents else img_path
        print(f"→ {rel}")
        optimize_image(img_path, dry_run)
        print()

    print("✅ Listo!" if not dry_run else "🔍 Dry run completado. Ejecuta sin --dry-run para generar.")

if __name__ == '__main__':
    main()
