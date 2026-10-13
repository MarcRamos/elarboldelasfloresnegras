# 🌑 El Árbol de las Flores Negras - Web y Blogs

Web promocional de la trilogía de fantasía oscura *El Árbol de las Flores Negras*, con blogs integrados para seguir el progreso del **Disco de la Trilogía** y el juego **La Quinta Essència**.

## 🏗️ Estructura del proyecto

- `index.html` - Página principal con carrusel de libros
- `blog/` - Blogs estáticos (disco y essencia)
- `articles/` - Fuentes Markdown para las entradas del blog
- `templates/` - Plantillas de 11ty para generar las entradas
- `assets/` - CSS, JS, imágenes
- `sw.js` - Service Worker

## 🚀 Desarrollo con 11ty

El proyecto utiliza [Eleventy (11ty)](https://www.11ty.dev/) para generar las entradas del blog desde Markdown. También incluye scripts para generar y optimizar assets.

### Instalación

```bash
npm install
```

### Comandos disponibles

- `npm run build` - Genera el sitio en `_site/`
- `npm run serve` - Inicia servidor de desarrollo con live reload
- `npm start` - Igual que `serve`

### Generar entradas de blog

Las entradas se escriben en formato Markdown en la carpeta `articles/`. Cada archivo debe incluir front matter con título, fecha, categoría y blog.

```markdown
---
title: "Mi nuevo artículo"
date: 2026-10-12
category: Producción
blog: esencia
---

Contenido del artículo...
```

**Campos obligatorios:**

- `title` - Título del artículo
- `date` - Fecha en formato `YYYY-MM-DD`
- `blog` - `disco` (castellano) o `essencia` (catalán)
- `category` - Categoría del artículo

**Campos opcionales:**

- `description` - Meta description para SEO
- `lang` - Idioma (se infiere automáticamente desde el blog)

Las plantillas se encuentran en `templates/`:

- `article.njk` - Plantilla para entradas de blog
- `base.njk` - Plantilla base HTML
- `post.njk` - Plantilla para posts generados desde articles/

## 🛠️ Herramientas adicionales

- `tools/optimize-images.py` - Genera variantes WebP responsivas (480w, 768w, 1200w)
- `tools/update_post.py` - Generador de posts (obsoleto tras migración a 11ty)

## 🚢 Despliegue

El sitio es estático y se despliega en GitHub Pages. Ejecuta `npm run build` para generar `_site/` con todo el contenido.
