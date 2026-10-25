/**
 * GDGconnect - Resources & Learning Hub
 * Categorized manuals, SOPs, pitch decks, FAQs & mentor upload sharing
 */

(function () {
  'use strict';

  let currentCategory = 'all';
  let currentSearch = '';

  const CATEGORIES = [
    "Onboarding", "Registration", "Lab Manuals",
    "Training", "Outreach", "Reporting Templates", "FAQs"
  ];

  function render(container, params = null) {
    if (params && params.action === 'create') {
      setTimeout(() => openShareResourceModal(), 50);
    }

    const resources = window.CC.db.getResources();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const filtered = resources.filter(r => {
      const matchesSearch = !currentSearch ||
        r.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
        r.author.toLowerCase().includes(currentSearch.toLowerCase());

      const matchesCat = currentCategory === 'all' || r.category === currentCategory;

      return matchesSearch && matchesCat;
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('book-open')} Resources & Learning Hub</h1>
          <p class="section-subtitle">SOP guidelines, curriculum decks, lab manuals, and outreach toolkits.</p>
        </div>
        <div class="section-header-actions">
          ${currentRole === 'Mentor' ? `
            <button class="btn btn-primary" id="btn-share-resource">
              ${ui.icon('plus')} Upload / Share Resource
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="filter-search-wrap">
            ${ui.icon('search')}
            <input type="text" class="filter-search-input" id="res-search-input" 
              placeholder="Search resources, manuals, slides..." value="${ui.escape(currentSearch)}">
          </div>
          <select class="filter-select" id="res-filter-category">
            <option value="all" ${currentCategory === 'all' ? 'selected' : ''}>All Categories</option>
            ${CATEGORIES.map(c => `<option value="${c}" ${currentCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Showing <strong>${filtered.length}</strong> resources
        </div>
      </div>

      <!-- Resources Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${filtered.length === 0 ? `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">${ui.icon('book-open')}</div>
            <div class="empty-state-title">No Resources Found</div>
            <div class="empty-state-text">No documents matched your search criteria.</div>
          </div>
        ` : filtered.map(r => {
          return `
            <div class="card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.85rem;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;">
                <span class="badge badge-green">${ui.escape(r.category)}</span>
                <span class="badge badge-gray" style="font-family: var(--font-family-mono); font-size: 0.68rem;">${ui.escape(r.format)} • ${ui.escape(r.size)}</span>
              </div>

              <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); line-height: 1.35;">
                ${ui.escape(r.title)}
              </h3>

              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; flex: 1;">
                ${ui.escape(r.description)}
              </p>

              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                <div>By <strong>${ui.escape(r.author)}</strong></div>
                <div>${r.downloads || 0} downloads</div>
              </div>

              <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
                <button class="btn btn-sm btn-primary" style="flex: 1;" data-download-res="${r.id}">
                  ${ui.icon('download')} Download
                </button>
                <button class="btn btn-sm btn-outline" data-preview-res="${r.id}" title="View Details">
                  ${ui.icon('info')}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    const searchInput = container.querySelector('#res-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        render(container);
      });
    }

    const catSelect = container.querySelector('#res-filter-category');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        render(container);
      });
    }

    container.querySelector('#btn-share-resource')?.addEventListener('click', () => {
      openShareResourceModal();
    });

    container.querySelectorAll('[data-download-res]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-download-res');
        const r = window.CC.db.getResources().find(x => x.id === id);
        if (r) {
          r.downloads = (r.downloads || 0) + 1;
          window.CC.db.save();
          window.CC.ui.showToast(`Downloading '${r.title}' (${r.format})...`, "success", "Download Started");
        }
      });
    });

    container.querySelectorAll('[data-preview-res]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-preview-res');
        const r = window.CC.db.getResources().find(x => x.id === id);
        if (r) {
          window.CC.ui.openModal(`
            <div class="modal-backdrop">
              <div class="modal-dialog modal-sm">
                <div class="modal-header">
                  <h3 class="modal-title">${window.CC.ui.icon('book-open')} Resource Details</h3>
                  <button class="btn-icon" data-close-modal>${window.CC.ui.icon('x')}</button>
                </div>
                <div class="modal-body" style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem;">
                  <h4 style="font-size: 1.05rem; font-weight: 700;">${window.CC.ui.escape(r.title)}</h4>
                  <p style="color: var(--text-secondary); line-height: 1.4;">${window.CC.ui.escape(r.description)}</p>
                  <div style="background-color: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-md);">
                    <div><strong>Category:</strong> ${window.CC.ui.escape(r.category)}</div>
                    <div><strong>Format:</strong> ${window.CC.ui.escape(r.format)} (${window.CC.ui.escape(r.size)})</div>
                    <div><strong>Author:</strong> ${window.CC.ui.escape(r.author)}</div>
                    <div><strong>Updated:</strong> ${r.updatedAt}</div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-secondary" data-close-modal>Close</button>
                </div>
              </div>
            </div>
          `);
        }
      });
    });
  }

  function openShareResourceModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('book-open')} Share New Resource</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="share-res-form">
              <div class="form-group">
                <label class="form-label form-label-required">Document Title</label>
                <input type="text" class="form-control" name="title" placeholder="e.g. AI Lab 101 Lecture Pitch Slide Deck" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Category</label>
                  <select class="form-select" name="category" required>
                    ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">File Type / Format</label>
                  <select class="form-select" name="format" required>
                    <option value="PDF">PDF Document</option>
                    <option value="PPTX">PowerPoint Deck</option>
                    <option value="DOCX">Word Document</option>
                    <option value="XLSX">Excel Spreadsheet</option>
                    <option value="ZIP">ZIP Bundle</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Approx Size</label>
                  <input type="text" class="form-control" name="size" value="2.5 MB">
                </div>
                <div class="form-group">
                  <label class="form-label">Author Name</label>
                  <input type="text" class="form-control" name="author" value="${ui.escape(currentUser.name)}" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Description & Guidelines</label>
                <textarea class="form-textarea" name="description" placeholder="Explain how ambassadors should utilize this document..." required></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Publish to Hub</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#share-res-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const newRes = window.CC.db.addResource({
          title: formData.get('title').trim(),
          category: formData.get('category'),
          format: formData.get('format'),
          size: formData.get('size').trim() || '1.5 MB',
          author: formData.get('author').trim(),
          description: formData.get('description').trim()
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          'Mentor',
          'Shared Resource',
          `Uploaded '${newRes.title}' to ${newRes.category}.`
        );

        ui.closeModal();
        ui.showToast(`Resource '${newRes.title}' shared to the hub!`, "success", "Published");

        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.resources = {
    render,
    openShareResourceModal
  };
})();
