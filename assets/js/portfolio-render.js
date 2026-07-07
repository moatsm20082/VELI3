(function () {
  function projectCard(p) {
    const cover = p.cover
      ? `<img src="${p.cover}" alt="${escapeAttr(p.title)}">`
      : `<div class="browser-chrome"><span></span><span></span><span></span></div><div class="project-scene ${escapeAttr(p.category || '').toLowerCase().replace(/[^a-z]/g,'')}"><div class="project-scene-text"><span class="tag">${escapeAttr(p.category || 'Project')}</span><h4>${escapeAttr(p.title)}</h4></div></div>`;
    return `
      <a href="project.html?id=${encodeURIComponent(p.id)}" class="project-card" data-reveal data-category="${escapeAttr(p.category || '')}">
        <div class="project-thumb ${p.cover ? 'has-image' : ''}">
          ${p.featured ? '<span class="featured-pill">Featured</span>' : ''}
          ${cover}
        </div>
        <div class="project-info">
          <div><h4>${escapeAttr(p.title)}</h4><p>${escapeAttr((p.description || '').slice(0, 90))}${(p.description||'').length>90?'…':''}</p></div>
          <span class="service-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
        </div>
      </a>`;
  }

  function escapeAttr(str) {
    return (str || '').toString().replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  function renderFeaturedPreview() {
    const mount = document.querySelector('#portfolio .portfolio-grid');
    if (!mount || !window.VELIX) return;
    const projects = VELIX.projects.featured().length ? VELIX.projects.featured() : VELIX.projects.all();
    mount.innerHTML = projects.slice(0, 3).map(projectCard).join('') || '<p class="portfolio-empty">No projects yet — add your first one in the Admin Dashboard.</p>';
  }

  function renderFullPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    const filtersMount = document.getElementById('portfolioFilters');
    if (!grid || !window.VELIX) return;

    const all = VELIX.projects.all();
    const categories = VELIX.projects.categories();

    filtersMount.innerHTML = ['All'].concat(categories).map((c, i) =>
      `<button data-cat="${c === 'All' ? '' : escapeAttr(c)}" class="${i === 0 ? 'active' : ''}">${c}</button>`
    ).join('');

    function paint(list) {
      grid.innerHTML = list.length
        ? list.map(projectCard).join('')
        : '<p class="portfolio-empty">No projects in this category yet.</p>';
    }
    paint(all);

    filtersMount.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersMount.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        paint(cat ? VELIX.projects.byCategory(cat) : all);
      });
    });
  }

  function init() {
    renderFeaturedPreview();
    renderFullPortfolio();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
