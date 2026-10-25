/**
 * CampusConnect - Announcements Section
 * Pinned updates, audience targeting, priority badges & mentor authoring
 */

(function () {
  'use strict';

  let currentAudience = 'all';
  let currentSearch = '';

  function render(container, params = null) {
    if (params && params.action === 'create') {
      setTimeout(() => openCreateAnnouncementModal(), 50);
    }

    const announcements = window.CC.db.getAnnouncements();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const filtered = announcements.filter(a => {
      const matchesSearch = !currentSearch ||
        a.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        a.content.toLowerCase().includes(currentSearch.toLowerCase());

      const matchesAudience = currentAudience === 'all' || a.audience === 'All' || a.audience === currentAudience;

      return matchesSearch && matchesAudience;
    });

    // Pinned first, then by date
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('bell')} Campus Announcements</h1>
          <p class="section-subtitle">Official program notices, operational updates, and event invitations.</p>
        </div>
        <div class="section-header-actions">
          ${currentRole === 'Mentor' ? `
            <button class="btn btn-primary" id="btn-create-announcement">
              ${ui.icon('plus')} Post Announcement
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="filter-search-wrap">
            ${ui.icon('search')}
            <input type="text" class="filter-search-input" id="ann-search-input" 
              placeholder="Search announcements..." value="${ui.escape(currentSearch)}">
          </div>
          <select class="filter-select" id="ann-filter-audience">
            <option value="all" ${currentAudience === 'all' ? 'selected' : ''}>All Audiences</option>
            <option value="Ambassadors" ${currentAudience === 'Ambassadors' ? 'selected' : ''}>Ambassadors Only</option>
            <option value="Mentors" ${currentAudience === 'Mentors' ? 'selected' : ''}>Mentors Only</option>
          </select>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Showing <strong>${filtered.length}</strong> announcements
        </div>
      </div>

      <!-- Announcements Feed -->
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${filtered.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${ui.icon('bell')}</div>
            <div class="empty-state-title">No Announcements</div>
            <div class="empty-state-text">There are no announcements matching your current filter.</div>
          </div>
        ` : filtered.map(a => {
          const isRead = (a.readBy || []).includes(currentUser.id);

          return `
            <div class="card" style="padding: 1.5rem; ${a.pinned ? 'border-left: 4px solid var(--color-primary);' : ''} ${!isRead ? 'background-color: var(--bg-surface); box-shadow: 0 2px 8px rgba(32,75,36,0.06);' : ''}">
              <div style="display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  ${a.pinned ? `<span class="badge badge-green">${ui.icon('star')} Pinned</span>` : ''}
                  ${ui.renderPriorityBadge(a.priority)}
                  <span class="badge badge-gray">Audience: ${ui.escape(a.audience)}</span>
                  ${!isRead ? '<span class="badge badge-amber">Unread</span>' : ''}
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">
                  Posted ${ui.formatDateTime(a.createdAt)} ${a.expiresAt ? `• Expires ${ui.formatDate(a.expiresAt)}` : ''}
                </div>
              </div>

              <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; line-height: 1.3;">
                ${ui.escape(a.title)}
              </h2>

              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.55; white-space: pre-line; margin-bottom: 1rem;">
                ${ui.escape(a.content)}
              </p>

              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                <div style="color: var(--text-secondary);">
                  Author: <strong style="color: var(--text-main);">${ui.escape(a.authorName)}</strong>
                </div>
                ${!isRead ? `
                  <button class="btn btn-sm btn-outline" data-mark-read="${a.id}">
                    ${ui.icon('check-circle')} Mark as Read
                  </button>
                ` : `
                  <span style="color: var(--text-muted); font-size: 0.75rem;">✓ Read</span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    const searchInput = container.querySelector('#ann-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        render(container);
      });
    }

    const audSelect = container.querySelector('#ann-filter-audience');
    if (audSelect) {
      audSelect.addEventListener('change', (e) => {
        currentAudience = e.target.value;
        render(container);
      });
    }

    container.querySelector('#btn-create-announcement')?.addEventListener('click', () => {
      openCreateAnnouncementModal();
    });

    container.querySelectorAll('[data-mark-read]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-mark-read');
        window.CC.db.markAnnouncementRead(id, window.CC.state.currentUser.id);
        render(container);
      });
    });
  }

  function openCreateAnnouncementModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('bell')} Post Campus Announcement</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="create-ann-form">
              <div class="form-group">
                <label class="form-label form-label-required">Announcement Headline</label>
                <input type="text" class="form-control" name="title" placeholder="e.g. Lab Registration Target Extension & Awards" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Priority</label>
                  <select class="form-select" name="priority">
                    <option value="Normal">Normal</option>
                    <option value="Important" selected>Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Target Audience</label>
                  <select class="form-select" name="audience">
                    <option value="All" selected>All (Mentors & Ambassadors)</option>
                    <option value="Ambassadors">Ambassadors Only</option>
                    <option value="Mentors">Mentors Only</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Expiration Date (Optional)</label>
                  <input type="date" class="form-control" name="expiresAt">
                </div>
                <div class="form-group" style="justify-content: center;">
                  <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-top: 1.5rem; font-size: 0.88rem; font-weight: 500;">
                    <input type="checkbox" name="pinned" value="true">
                    Pin Announcement to Top
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Announcement Message</label>
                <textarea class="form-textarea" name="content" style="min-height: 120px;" placeholder="Write clear, actionable details for mentors and ambassadors..." required></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Publish Announcement</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#create-ann-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const newAnn = window.CC.db.addAnnouncement({
          title: formData.get('title').trim(),
          priority: formData.get('priority'),
          audience: formData.get('audience'),
          expiresAt: formData.get('expiresAt') || null,
          pinned: formData.get('pinned') === 'true',
          content: formData.get('content').trim(),
          authorName: currentUser.name,
          authorId: currentUser.id
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          'Mentor',
          'Published Announcement',
          `Posted '${newAnn.title}'.`
        );

        window.CC.db.addNotification(
          "ALL",
          "New Announcement Published",
          `Dr./Prof. ${currentUser.name}: '${newAnn.title}'.`,
          "announcement",
          newAnn.id
        );

        ui.closeModal();
        ui.showToast("Announcement published successfully!", "success", "Published");
        
        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.announcements = {
    render,
    openCreateAnnouncementModal
  };
})();
