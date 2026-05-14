Aquí tienes el contenido para el `README.md` ampliado con instrucciones detalladas para generar nuevas entradas de blog usando el script Python y cómo se integran automáticamente en la web.

```markdown
# 🌑 El Árbol de las Flores Negras - Web y Blogs

Web promocional de la trilogía de fantasía oscura *El Árbol de las Flores Negras*, con blogs integrados para seguir el progreso del **Disco de la Trilogía** y la nueva novela **La Quinta Essència**.

## 🚀 Cómo añadir una nueva entrada al blog

El proyecto incluye un script en Python que convierte archivos Markdown en páginas HTML completas y actualiza automáticamente el índice del blog.

### 1. Requisitos previos

- Python 3.8 o superior instalado.
- Instalar la única dependencia externa (solo la primera vez):
  ```bash
  pip install markdown
  ```
- Tener los siguientes archivos en la raíz del proyecto:
  - `script.py` (el script generador)
  - `article-template.html` (plantilla para las entradas)
  - `blog-data.js` (índice de artículos, se actualizará automáticamente)

### 2. Escribir el artículo en Markdown

Crea un archivo `.md` con el contenido del artículo. Debe incluir un bloque **front matter** al principio, delimitado por `---`, con al menos el título y la fecha:

```markdown
---
title: "Mi nuevo artículo"
date: 2026-05-20
category: Producción
---

Aquí empieza el contenido del artículo en **Markdown**.

## Sección 1

Párrafos, imágenes, etc.
```

**Campos del front matter:**
- `title`: obligatorio. Título del artículo.
- `date`: obligatorio. Fecha en formato `YYYY-MM-DD`. Determina el mes/año en la URL y la posición en el blog.
- `category`: opcional. Se muestra en la etiqueta del artículo. Si no se indica, se usará "General".

### 3. Ejecutar el script

Abre una terminal en la raíz del proyecto y lanza:

```bash
python script.py ruta/al/articulo.md --blog <disco|essencia>
```

**Ejemplos:**

```bash
# Para el blog del disco
python script.py ideas-banda-sonora.md --blog disco

# Para el blog de La Quinta Essència
python script.py borrador-capitulo1.md --blog essencia
```

El argumento `--blog` es obligatorio y solo acepta `disco` o `essencia`. Si se usa otro valor, el script mostrará un error.

### 4. Qué hace el script

- Convierte el contenido Markdown a HTML usando la plantilla `article-template.html`.
- Genera un archivo HTML en la raíz con el siguiente formato de nombre:
  ```
  {blog}-{MM}-{YYYY}-{indice}.html
  ```
  Por ejemplo: `disco-05-2026-1.html` (primer artículo de mayo de 2026 en el blog del disco). Si ya existe otro artículo en el mismo mes y año, el índice se incrementa automáticamente.
- Extrae un resumen del primer párrafo del artículo y lo guarda en `blog-data.js`.
- Actualiza el archivo `blog-data.js` añadiendo la nueva entrada (título, fecha, URL, categoría y resumen) y lo ordena por fecha descendente.

### 5. Resultado inmediato

Al recargar la página del blog correspondiente (ej. `blog-disco.html` o `blog-essencia.html`) verás:

- El nuevo artículo en la **lista principal** (tarjeta con título, fecha, categoría, resumen y botón "Leer más").
- La entrada añadida en el **menú lateral de navegación**, dentro de su año y mes correspondiente, con un enlace directo al artículo completo.

**No necesitas editar manualmente ningún HTML ni JavaScript.**

### 6. Opciones adicionales

- `--force`: Si el archivo HTML de destino ya existe, lo sobrescribe sin preguntar.
  ```bash
  python script.py articulo.md --blog disco --force
  ```

### 7. Solución de problemas comunes

| Problema | Posible causa |
|----------|---------------|
| `Error: Debes instalar la biblioteca 'markdown'` | No has instalado la dependencia. Ejecuta `pip install markdown`. |
| `Error: Falta el título en el front matter` | El archivo `.md` no tiene `title:` en el bloque delimitado por `---`. |
| `Error: Formato de fecha inválido` | La fecha no está en formato `YYYY-MM-DD` o es una fecha imposible. |
| El artículo no aparece en el blog | Revisa que el archivo `.md` esté bien formado y que estás ejecutando el script desde la raíz del proyecto. |
| El archivo HTML ya existe y no se sobrescribe | Usa la opción `--force` o responde `s` cuando pregunte. |
| El menú lateral no carga los artículos | Asegúrate de que los scripts se cargan en este orden: `blog-data.js`, `blog-manager.js`, `blog-scripts.js`. |

---

## 📁 Estructura del proyecto

```
/
├── index.html                # Página principal de la trilogía
├── style.css                 # Estilos generales
├── script.py                 # Generador de artículos
├── article-template.html     # Plantilla para entradas
├── blog-data.js              # Índice de artículos (se actualiza solo)
├── blog-manager.js           # Lógica de navegación y listado
├── blog-scripts.js           # Año automático y efectos
├── blog-disco.html           # Página del blog del Disco
├── blog-essencia.html        # Página del blog La Quinta Essència
├── disco-05-2026-1.html      # Ejemplo de artículo generado
└── essencia-03-2026-2.html   # Ejemplo de artículo generado
```

---
