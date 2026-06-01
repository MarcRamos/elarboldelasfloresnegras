#!/usr/bin/env python3
"""
Convierte un artículo en Markdown a HTML para el blog y actualiza /assets/js/blog-data.js.
Uso: python script.py articulo.md --blog disco|essencia [--force]

El nombre del archivo HTML sigue el formato: {blog}-{MM}-{YYYY}-{indice}.html
El índice se calcula automáticamente por mes y año.
"""

import argparse
import os
import re
import json
from datetime import date, datetime
from pathlib import Path

try:
    import markdown
except ImportError:
    print("Error: Debes instalar la biblioteca 'markdown'. Ejecuta: pip install markdown")
    exit(1)

TEMPLATE_FILE = 'templates/article-template.html'
DATA_FILE = 'assets/js/blog-data.js'
OUTPUT_DIR = 'blog'  # base

def parse_front_matter(content):
    if not content.startswith('---'):
        return {}, content
    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content
    header = parts[1].strip()
    body = parts[2].strip()
    front_matter = {}
    for line in header.splitlines():
        if ':' in line:
            key, _, value = line.partition(':')
            front_matter[key.strip()] = value.strip()
    return front_matter, body

def load_data_js(data_path):
    """Carga los artículos de disco y essencia desde /assets/js/blog-data.js."""
    if not data_path.exists():
        return [], []
    with open(data_path, 'r', encoding='utf-8') as f:
        content = f.read()
    disco_match = re.search(r'var\s+articulosDisco\s*=\s*(\[[^\]]*\])\s*;', content, re.DOTALL)
    essencia_match = re.search(r'var\s+articulosEssencia\s*=\s*(\[[^\]]*\])\s*;', content, re.DOTALL)
    disco = json.loads(disco_match.group(1)) if disco_match else []
    essencia = json.loads(essencia_match.group(1)) if essencia_match else []
    return disco, essencia

def write_data_js(data_path, disco, essencia):
    disco_json = json.dumps(disco, indent=4, ensure_ascii=False)
    essencia_json = json.dumps(essencia, indent=4, ensure_ascii=False)
    js_content = f'''// /assets/js/blog-data.js (generado automáticamente por script.py)
var articulosDisco = {disco_json};

var articulosEssencia = {essencia_json};
'''
    with open(data_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

def get_next_index(articulos, year, month):
    """Calcula el siguiente índice para artículos del mismo año y mes."""
    count = 0
    prefix = f"{month:02d}-{year}"
    for art in articulos:
        # Esperamos que la url contenga 'disco-MM-YYYY-indice.html' o 'essencia-MM-YYYY-indice.html'
        if prefix in art.get('url', ''):
            match = re.search(r'-(\d+)\.html$', art['url'])
            if match:
                idx = int(match.group(1))
                if idx > count:
                    count = idx
    return count + 1

def extract_resumen(md_html):
    """Extrae el primer párrafo de texto legible (sin HTML) que no sea un encabezado."""
    plain = re.sub(r'<[^>]+>', '', md_html)
    lines = [line.strip() for line in plain.split('\n') if line.strip()]
    for line in lines:
        if not line.startswith('#') and len(line) > 10:
            return line[:200] + '...' if len(line) > 200 else line
    return 'Sin resumen'

def main():
    parser = argparse.ArgumentParser(description='Convierte Markdown a artículo HTML del blog.')
    parser.add_argument('input', help='Archivo Markdown de entrada')
    parser.add_argument('--blog', choices=['disco', 'essencia'], required=True, help='Tipo de blog')
    parser.add_argument('--force', action='store_true', help='Sobrescribir archivo HTML si ya existe')
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.is_file():
        print(f"Error: El archivo '{input_path}' no existe.")
        return

    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    front_matter, md_body = parse_front_matter(content)

    title = front_matter.get('title')
    if not title:
        print("Error: Falta el título en el front matter (title: ...)")
        return

    fecha_str = front_matter.get('date')
    if not fecha_str:
        print("Error: Falta la fecha en el front matter (date: YYYY-MM-DD)")
        return

    try:
        fecha = datetime.fromisoformat(fecha_str).date()
    except ValueError:
        print(f"Error: Formato de fecha inválido '{fecha_str}'. Usa YYYY-MM-DD.")
        return

    category = front_matter.get('category', 'General')

    # Cargar datos existentes para calcular índice
    disco_articulos, essencia_articulos = load_data_js(Path(DATA_FILE))
    if args.blog == 'disco':
        articulos_blog = disco_articulos
        lang = "es"
    else:
        articulos_blog = essencia_articulos
        lang = "ca"

    year = fecha.year
    month = fecha.month
    index = get_next_index(articulos_blog, year, month)

    # Nombre del archivo HTML
    html_filename = f"{args.blog}-{month:02d}-{year}-{index}.html"
    blog_folder = f"{OUTPUT_DIR}/{args.blog}/posts"
    os.makedirs(blog_folder, exist_ok=True)
    html_path = Path(blog_folder) / html_filename
    
    url_relativa = f"posts/{html_filename}"

    if html_path.exists() and not args.force:
        overwrite = input(f"El archivo '{html_filename}' ya existe. ¿Sobrescribir? (s/n): ").lower()
        if overwrite != 's':
            print("Operación cancelada.")
            return

    # Convertir Markdown a HTML
    md_html = markdown.markdown(md_body, extensions=['extra', 'codehilite'])

    # Cargar plantilla
    template_path = Path(TEMPLATE_FILE)
    if not template_path.is_file():
        print(f"Error: Plantilla '{TEMPLATE_FILE}' no encontrada en el directorio actual.")
        return

    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
   
    # Ruta absoluta: f'/blog/{args.blog}/'
    back_link = f'/blog/{args.blog}/'

    date_iso = fecha.isoformat()
    months_es = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    date_formatted = f'{fecha.day} de {months_es[fecha.month-1]} de {fecha.year}'

    article_html = template \
        .replace('{{TITLE}}', title) \
        .replace('{{DATE_ISO}}', date_iso) \
        .replace('{{DATE_FORMATTED}}', date_formatted) \
        .replace('{{CATEGORY}}', category) \
        .replace('{{CONTENT}}', md_html) \
        .replace('{{BACK_LINK}}', back_link) \
        .replace('{{LANG}}', lang)

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(article_html)
    print(f"Artículo HTML creado: {html_filename}")

    # Extraer resumen
    resumen = extract_resumen(md_html)

    # Nueva entrada
    new_entry = {
        "titulo": title,
        "fecha": date_iso,
        "url": url_relativa,
        "categoria": category,
        "resumen": resumen
    }

    if args.blog == 'disco':
        disco_articulos.append(new_entry)
        disco_articulos.sort(key=lambda x: x['fecha'], reverse=True)
    else:
        essencia_articulos.append(new_entry)
        essencia_articulos.sort(key=lambda x: x['fecha'], reverse=True)

    write_data_js(Path(DATA_FILE), disco_articulos, essencia_articulos)
    print(f"Datos actualizados en {DATA_FILE}")
    print(f"Índice asignado: {index} para {month:02d}-{year}")

if __name__ == '__main__':
    main()