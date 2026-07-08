// /assets/js/blog-manager.js
document.addEventListener('DOMContentLoaded', function () {
    // Sidebar
    const navContainer = document.getElementById('blog-nav');
    // Lista de artículos
    const listContainer = document.getElementById('blog-list');

    if (!navContainer && !listContainer) return;

    const blogType = document.body.dataset.blog;
    if (!blogType || (blogType !== 'disco' && blogType !== 'essencia')) {
        if (navContainer) navContainer.innerHTML = '<p class="nav-empty">Tipo de blog no especificado.</p>';
        if (listContainer) listContainer.innerHTML = '';
        return;
    }

    let articulos = [];
    if (blogType === 'disco') {
        articulos = window.articulosDisco || [];
    } else if (blogType === 'essencia') {
        articulos = window.articulosEssencia || [];
    }

    // Generar sidebar si existe
    if (navContainer) buildSidebar(articulos, navContainer);

    // Generar lista de artículos si existe
    if (listContainer) buildArticleList(articulos, listContainer);
});

function buildSidebar(articulos, container) {
    if (!articulos.length) {
        container.innerHTML = '<p class="nav-empty">No hay artículos todavía.</p>';
        return;
    }

    const tree = {};
    articulos.forEach(art => {
        const fecha = new Date(art.fecha);
        if (isNaN(fecha.getTime())) return;
        const year = fecha.getFullYear();
        const month = fecha.getMonth();
        const monthName = fecha.toLocaleDateString('es-ES', { month: 'long' });
        const yearKey = year.toString();
        const monthKey = month.toString();

        if (!tree[yearKey]) tree[yearKey] = {};
        if (!tree[yearKey][monthKey]) {
            tree[yearKey][monthKey] = { nombre: monthName, articulos: [] };
        }
        tree[yearKey][monthKey].articulos.push(art);
    });

    let html = '<ul class="nav-tree">';
    const years = Object.keys(tree).sort((a, b) => b - a);
    years.forEach(year => {
        const months = tree[year];
        const monthKeys = Object.keys(months).sort((a, b) => parseInt(b) - parseInt(a));
        const totalYearArticles = monthKeys.reduce((acc, m) => acc + months[m].articulos.length, 0);

        html += `<li class="nav-year">
            <button class="nav-toggle" aria-expanded="true" data-target="year-${year}">
                <span class="toggle-icon" style="transform: rotate(90deg);">▸</span>
                <span class="nav-label">${year}</span>
                <span class="nav-count">(${totalYearArticles})</span>
            </button>
            <ul class="nav-months" id="year-${year}">`;

        monthKeys.forEach(monthIndex => {
            const monthData = months[monthIndex];
            const monthId = `month-${year}-${monthIndex}`;
            html += `<li class="nav-month">
                <button class="nav-toggle" aria-expanded="true" data-target="${monthId}">
                    <span class="toggle-icon" style="transform: rotate(90deg);">▸</span>
                    <span class="nav-label">${monthData.nombre}</span>
                    <span class="nav-count">(${monthData.articulos.length})</span>
                </button>
                <ul class="nav-articles" id="${monthId}">`;

            monthData.articulos.forEach(art => {
                html += `<li class="nav-article"><a href="${art.url}">${art.titulo}</a></li>`;
            });

            html += '</ul></li>';
        });

        html += '</ul></li>';
    });
    html += '</ul>';
    container.innerHTML = html;

    // Toggle interactividad
    container.addEventListener('click', function (e) {
        const toggle = e.target.closest('.nav-toggle');
        if (!toggle) return;
        const targetId = toggle.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (!target) return;

        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
        target.hidden = expanded;
        const icon = toggle.querySelector('.toggle-icon');
        if (icon) icon.style.transform = expanded ? 'rotate(0deg)' : 'rotate(90deg)';
    });
}

function buildArticleList(articulos, container) {
    if (!articulos.length) {
        container.innerHTML = '<p class="nav-empty">No hay artículos todavía.</p>';
        return;
    }

    // Ordenados por fecha descendente (ya lo están desde el script, pero por si acaso)
    const sorted = [...articulos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    let html = '';
    sorted.forEach(art => {
        const fecha = new Date(art.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        const resumen = art.resumen || 'Sin resumen';
        html += `
        <article class="blog-card">
            <header class="card-header">
                <h3><a href="${art.url}">${art.titulo}</a></h3>
                <time datetime="${art.fecha}">${fechaFormateada}</time>
                <span class="card-category">${art.categoria || 'General'}</span>
            </header>
            <p class="card-excerpt">${resumen}</p>
            <a href="${art.url}" class="read-more-link" aria-label="${art.titulo}">Leer más →</a>
        </article>`;
    });
    container.innerHTML = html;
}