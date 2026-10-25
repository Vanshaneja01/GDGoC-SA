/**
 * GDGconnect - Application Controller & Bootstrap
 * Orchestrates navigation, global search, notifications flyout, theme switching, and keyboard shortcuts
 */

(function () {
  'use strict';

  // Navigation Items in EXACT REQUIRED ORDER:
  // 1. Mentors
  // 2. Ambassadors
  // 3. Tasks
  // 4. Mentor Sessions
  // 5. Ambassador Sessions
  // 6. Labs & Registrations
  // 7. Reports & Progress
  // 8. Announcements
  // 9. Resources & Learning
  // 10. Communication & Help Desk
  // 11. Achievements & Recognition
  // 12. Calendar
  // 13. Profile & Settings
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', isOverview: true },
    { id: 'mentors', label: '1. Mentors', icon: 'users', sectionKey: 'mentors' },
    { id: 'ambassadors', label: '2. Ambassadors', icon: 'award', sectionKey: 'ambassadors' },
    { id: 'tasks', label: '3. Tasks', icon: 'check-square', sectionKey: 'tasks' },
    { id: 'mentor-sessions', label: '4. Mentor Sessions', icon: 'video', sectionKey: 'mentorSessions' },
    { id: 'ambassador-sessions', label: '5. Ambassador Sessions', icon: 'presentation', sectionKey: 'ambassadorSessions' },
    { id: 'labs-registrations', label: '6. Labs & Registrations', icon: 'flask', sectionKey: 'labsRegistrations' },
    { id: 'reports', label: '7. Reports & Progress', icon: 'bar-chart-2', sectionKey: 'reports' },
    { id: 'announcements', label: '8. Announcements', icon: 'bell', sectionKey: 'announcements' },
    { id: 'resources', label: '9. Resources & Learning', icon: 'book-open', sectionKey: 'resources' },
    { id: 'communication', label: '10. Communication & Help Desk', icon: 'message-square', sectionKey: 'communication' },
    { id: 'achievements', label: '11. Achievements & Recognition', icon: 'award', sectionKey: 'achievements' },
    { id: 'calendar', label: '12. Calendar', icon: 'calendar', sectionKey: 'calendar' },
    { id: 'profile-settings', label: '13. Profile & Settings', icon: 'settings', sectionKey: 'profileSettings' }
  ];

  function initApp() {
    renderSidebarNav();
    updateUserDisplays();
    updateThemeIcon();
    bindGlobalEvents();

    // Listen to state changes
    window.CC.state.on('sectionChanged', ({ section, params }) => {
      renderActiveSection(section, params);
      updateNavHighlight(section);
      closeMobileSidebar();
    });

    window.CC.state.on('userChanged', () => {
      updateUserDisplays();
      renderActiveSection(window.CC.state.activeSection);
      updateNotificationBadge();
    });

    window.CC.state.on('themeChanged', () => {
      updateThemeIcon();
    });

    // Initial render
    renderActiveSection(window.CC.state.activeSection);
    updateNotificationBadge();
  }

  function renderSidebarNav() {
    const navContainer = document.getElementById('sidebar-nav-list');
    if (!navContainer) return;

    const ui = window.CC.ui;

    navContainer.innerHTML = `
      <div class="nav-section-title">Overview</div>
      ${renderNavItem(NAV_ITEMS[0], ui)}

      <div class="nav-section-title">Management & Operations</div>
      ${NAV_ITEMS.slice(1, 7).map(item => renderNavItem(item, ui)).join('')}

      <div class="nav-section-title">Outreach & Community</div>
      ${NAV_ITEMS.slice(7).map(item => renderNavItem(item, ui)).join('')}
    `;

    // Bind nav click events
    navContainer.querySelectorAll('[data-nav-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-nav-target');
        window.CC.state.setSection(targetSection);
      });
    });
  }

  function renderNavItem(item, ui) {
    const isActive = window.CC.state.activeSection === item.id;
    return `
      <a href="#${item.id}" class="nav-item ${isActive ? 'active' : ''}" data-nav-target="${item.id}">
        <span class="nav-item-icon">${ui.icon(item.icon)}</span>
        <span>${ui.escape(item.label)}</span>
      </a>
    `;
  }

  function updateNavHighlight(sectionId) {
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      if (link.getAttribute('data-nav-target') === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function renderActiveSection(sectionId, params = null) {
    const mainContainer = document.getElementById('main-content-viewport');
    if (!mainContainer) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const item = NAV_ITEMS.find(n => n.id === sectionId);
    if (!item) {
      window.CC.sections.dashboard.render(mainContainer);
      return;
    }

    if (item.id === 'dashboard') {
      window.CC.sections.dashboard.render(mainContainer);
    } else {
      const sectionModule = window.CC.sections[item.sectionKey];
      if (sectionModule && typeof sectionModule.render === 'function') {
        sectionModule.render(mainContainer, params);
      } else {
        mainContainer.innerHTML = `<div class="empty-state">Section not found.</div>`;
      }
    }
  }

  function updateUserDisplays() {
    const user = window.CC.state.currentUser;
    const role = window.CC.state.role;
    const ui = window.CC.ui;

    // Sidebar user card
    const roleCardHeader = document.getElementById('sidebar-role-indicator');
    if (roleCardHeader) {
      roleCardHeader.className = `role-pill ${role === 'Mentor' ? 'role-pill-mentor' : 'role-pill-ambassador'}`;
      roleCardHeader.textContent = `${role} Mode`;
    }

    const roleUserName = document.getElementById('sidebar-user-name');
    if (roleUserName) roleUserName.textContent = user.name;

    const roleUserId = document.getElementById('sidebar-user-id');
    if (roleUserId) roleUserId.textContent = user.id;

    const avatarHost = document.getElementById('sidebar-user-avatar');
    if (avatarHost) {
      avatarHost.innerHTML = ui.renderAvatar(user.avatar, user.name, 'md');
    }

    // Topbar role switch buttons
    const mentorBtn = document.getElementById('role-btn-mentor');
    const ambBtn = document.getElementById('role-btn-ambassador');
    if (mentorBtn && ambBtn) {
      if (role === 'Mentor') {
        mentorBtn.classList.add('active');
        ambBtn.classList.remove('active');
      } else {
        ambBtn.classList.add('active');
        mentorBtn.classList.remove('active');
      }
    }

    // Topbar user trigger
    const topUserName = document.getElementById('topbar-user-name');
    if (topUserName) topUserName.textContent = user.name;

    const topUserRole = document.getElementById('topbar-user-role');
    if (topUserRole) topUserRole.textContent = `${role} • ${user.id}`;

    const topUserAvatar = document.getElementById('topbar-user-avatar');
    if (topUserAvatar) {
      topUserAvatar.innerHTML = ui.renderAvatar(user.avatar, user.name, 'sm');
    }
  }

  function updateThemeIcon() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      const isDark = window.CC.state.theme === 'dark';
      themeBtn.innerHTML = window.CC.ui.icon(isDark ? 'sun' : 'moon');
      themeBtn.setAttribute('title', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    }
  }

  function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    const notifs = window.CC.db.getNotificationsForUser(window.CC.state.currentUser.id);
    const unread = notifs.filter(n => !n.read).length;

    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  function bindGlobalEvents() {
    const ui = window.CC.ui;

    // Theme toggle
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      window.CC.state.toggleTheme();
    });

    // Topbar quick role switcher
    document.getElementById('role-btn-mentor')?.addEventListener('click', () => {
      window.CC.state.switchRole('Mentor');
      ui.showToast("Switched to Faculty Mentor Dashboard", "info", "Role Active");
    });

    document.getElementById('role-btn-ambassador')?.addEventListener('click', () => {
      window.CC.state.switchRole('Ambassador');
      ui.showToast("Switched to Student Ambassador Dashboard", "info", "Role Active");
    });

    // User profile quick trigger
    document.getElementById('user-menu-trigger')?.addEventListener('click', () => {
      openAccountSwitcherModal();
    });

    // Mobile sidebar toggle
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuBtn = document.getElementById('mobile-menu-btn');

    menuBtn?.addEventListener('click', () => {
      sidebar?.classList.toggle('sidebar-open');
      overlay?.classList.toggle('active');
    });

    overlay?.addEventListener('click', () => {
      closeMobileSidebar();
    });

    // Global Search Input
    const globalSearchInput = document.getElementById('global-search-input');
    globalSearchInput?.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        showGlobalSearchModal(query);
      }
    });

    globalSearchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) showGlobalSearchModal(query);
      }
    });

    // Notifications Button Flyout
    document.getElementById('notifications-btn')?.addEventListener('click', () => {
      openNotificationsModal();
    });

    // Keyboard Shortcuts (/ for global search, Escape for modal)
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        globalSearchInput?.focus();
      }
    });
  }

  function closeMobileSidebar() {
    document.getElementById('app-sidebar')?.classList.remove('sidebar-open');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
  }

  // Global Search Modal
  function showGlobalSearchModal(query) {
    const ui = window.CC.ui;
    const q = query.toLowerCase();

    const mentors = window.CC.db.getMentors().filter(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.department.toLowerCase().includes(q));
    const ambassadors = window.CC.db.getAmbassadors().filter(a => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.department.toLowerCase().includes(q));
    const tasks = window.CC.db.getTasks().filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    const mentorSessions = window.CC.db.getMentorSessions().filter(s => s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    const ambSessions = window.CC.db.getAmbassadorSessions().filter(s => s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    const labs = window.CC.db.getLabs().filter(l => l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q));
    const resources = window.CC.db.getResources().filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));

    const totalResults = mentors.length + ambassadors.length + tasks.length + mentorSessions.length + ambSessions.length + labs.length + resources.length;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('search')} Global Search: "${ui.escape(query)}"</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body" style="max-height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;">
            ${totalResults === 0 ? `
              <div class="empty-state">
                <div class="empty-state-title">No Matches Found</div>
                <div class="empty-state-text">No records matched "${ui.escape(query)}". Try another search term.</div>
              </div>
            ` : `
              <!-- Mentors Matches -->
              ${mentors.length > 0 ? `
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-primary); margin-bottom: 0.4rem;">
                    Mentors (${mentors.length})
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                    ${mentors.map(m => `
                      <div style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between; cursor: pointer;" data-jump-mentor="${m.id}">
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                          ${ui.renderAvatar(m.avatar, m.name, 'sm')}
                          <div>
                            <div style="font-weight: 600; font-size: 0.88rem;">${ui.escape(m.name)}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${m.id} • ${ui.escape(m.department)}</div>
                          </div>
                        </div>
                        <button class="btn btn-sm btn-outline">Profile</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Ambassadors Matches -->
              ${ambassadors.length > 0 ? `
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-olive); margin-bottom: 0.4rem;">
                    Ambassadors (${ambassadors.length})
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                    ${ambassadors.map(a => `
                      <div style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between; cursor: pointer;" data-jump-ambassador="${a.id}">
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                          ${ui.renderAvatar(a.avatar, a.name, 'sm')}
                          <div>
                            <div style="font-weight: 600; font-size: 0.88rem;">${ui.escape(a.name)}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${a.id} • ${ui.escape(a.department)}</div>
                          </div>
                        </div>
                        <button class="btn btn-sm btn-outline">Profile</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Tasks Matches -->
              ${tasks.length > 0 ? `
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--status-blue); margin-bottom: 0.4rem;">
                    Tasks (${tasks.length})
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                    ${tasks.map(t => `
                      <div style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between; cursor: pointer;" data-jump-task="${t.id}">
                        <div>
                          <div style="font-weight: 600; font-size: 0.88rem;">${ui.escape(t.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${t.id} • ${t.category} • ${t.status}</div>
                        </div>
                        <button class="btn btn-sm btn-outline">Open Task</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Sessions Matches -->
              ${(mentorSessions.length > 0 || ambSessions.length > 0) ? `
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #7B1FA2; margin-bottom: 0.4rem;">
                    Sessions (${mentorSessions.length + ambSessions.length})
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                    ${mentorSessions.map(s => `
                      <div style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between; cursor: pointer;" data-jump-mentor-session="${s.id}">
                        <div>
                          <span class="badge badge-green" style="font-size: 0.65rem;">Mentor Session</span>
                          <div style="font-weight: 600; font-size: 0.88rem; margin-top: 2px;">${ui.escape(s.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${s.id} • ${s.date}</div>
                        </div>
                        <button class="btn btn-sm btn-outline">Details</button>
                      </div>
                    `).join('')}
                    ${ambSessions.map(s => `
                      <div style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between; cursor: pointer;" data-jump-amb-session="${s.id}">
                        <div>
                          <span class="badge badge-olive" style="font-size: 0.65rem;">Ambassador Workshop</span>
                          <div style="font-weight: 600; font-size: 0.88rem; margin-top: 2px;">${ui.escape(s.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${s.id} • ${s.date}</div>
                        </div>
                        <button class="btn btn-sm btn-outline">Details</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Labs Matches -->
              ${labs.length > 0 ? `
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--status-amber); margin-bottom: 0.4rem;">
                    Innovation Labs (${labs.length})
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                    ${labs.map(l => `
                      <div style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between; cursor: pointer;" data-jump-lab="${l.id}">
                        <div>
                          <div style="font-weight: 600; font-size: 0.88rem;">${ui.escape(l.name)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${l.id} • Target: ${l.target}</div>
                        </div>
                        <button class="btn btn-sm btn-outline">View Lab</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            `}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      modalHost.querySelectorAll('[data-jump-mentor]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-jump-mentor');
          ui.closeModal();
          window.CC.sections.mentors.openMentorModal(id);
        });
      });

      modalHost.querySelectorAll('[data-jump-ambassador]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-jump-ambassador');
          ui.closeModal();
          window.CC.sections.ambassadors.openAmbassadorModal(id);
        });
      });

      modalHost.querySelectorAll('[data-jump-task]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-jump-task');
          ui.closeModal();
          window.CC.sections.tasks.openTaskModal(id);
        });
      });

      modalHost.querySelectorAll('[data-jump-mentor-session]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-jump-mentor-session');
          ui.closeModal();
          window.CC.sections.mentorSessions.openSessionModal(id);
        });
      });

      modalHost.querySelectorAll('[data-jump-amb-session]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-jump-amb-session');
          ui.closeModal();
          window.CC.sections.ambassadorSessions.openSessionModal(id);
        });
      });

      modalHost.querySelectorAll('[data-jump-lab]').forEach(btn => {
        btn.addEventListener('click', () => {
          ui.closeModal();
          window.CC.state.setSection('labs-registrations');
        });
      });
    });
  }

  // Account Switcher & ID Login Modal
  function openAccountSwitcherModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;
    const currentRole = window.CC.state.role;
    const mentors = window.CC.db.getMentors();
    const ambassadors = window.CC.db.getAmbassadors();
    const currentUrl = `${window.location.origin}${window.location.pathname}?user=${currentUser.id}`;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <h3 class="modal-title">${ui.icon('users')} Account & Identity Switcher</h3>
              <span class="badge ${currentRole === 'Mentor' ? 'badge-green' : 'badge-olive'}">${currentRole} Active</span>
            </div>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>

          <div class="modal-body">
            <!-- Active Persona Card -->
            <div style="padding: 1rem 1.25rem; background: linear-gradient(135deg, rgba(66, 133, 244, 0.08), rgba(52, 168, 83, 0.08)); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                ${ui.renderAvatar(currentUser.avatar, currentUser.name, 'lg')}
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 700; font-size: 1.1rem; color: var(--text-main);">${ui.escape(currentUser.name)}</span>
                    <span class="badge ${currentRole === 'Mentor' ? 'badge-green' : 'badge-olive'}">${currentRole}</span>
                  </div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                    ${ui.escape(currentUser.email)} • ID: <strong style="font-family: var(--font-family-mono);">${currentUser.id}</strong>
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn btn-sm btn-outline" id="btn-copy-direct-link" title="Copy URL to directly log into this user's dashboard">
                  ${ui.icon('link')} Copy Direct Link
                </button>
              </div>
            </div>

            <!-- Login / Access by ID Form -->
            <div style="margin-bottom: 1.5rem; padding: 1rem; border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); background: var(--bg-surface);">
              <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 0.5rem;">
                Access Dashboard by Unique ID or Email
              </label>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="input-account-id" class="form-control" placeholder="e.g. MTR-101, AMB-201, or email address" style="flex: 1;" />
                <button class="btn btn-primary" id="btn-switch-by-id">
                  ${ui.icon('log-in')} Access Dashboard
                </button>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; display: block;">
                Enter any Mentor ID (MTR-101 to 104) or Ambassador ID (AMB-201 to 206) to instantly switch dashboards.
              </span>
            </div>

            <!-- Fast Select Persona Grid -->
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <strong style="font-size: 0.88rem; color: var(--text-main);">Quick Switch by Person:</strong>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                <!-- Mentors Column -->
                <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; color: var(--color-primary);">
                    ${ui.icon('shield')} Faculty Mentors (4)
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${mentors.map(m => `
                      <button type="button" class="btn btn-sm btn-outline ${currentUser.id === m.id ? 'active' : ''}" data-switch-to="Mentor:${m.id}" style="display: flex; align-items: center; justify-content: space-between; text-align: left; padding: 0.6rem 0.75rem; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          ${ui.renderAvatar(m.avatar, m.name, 'sm')}
                          <div>
                            <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-main);">${ui.escape(m.name)}</div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-family-mono);">${m.id}</div>
                          </div>
                        </div>
                        <span class="badge badge-green" style="font-size: 0.68rem;">Mentor</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Ambassadors Column -->
                <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; color: #7B1FA2;">
                    ${ui.icon('award')} Student Ambassadors (6)
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 240px; overflow-y: auto;">
                    ${ambassadors.map(a => `
                      <button type="button" class="btn btn-sm btn-outline ${currentUser.id === a.id ? 'active' : ''}" data-switch-to="Ambassador:${a.id}" style="display: flex; align-items: center; justify-content: space-between; text-align: left; padding: 0.6rem 0.75rem; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          ${ui.renderAvatar(a.avatar, a.name, 'sm')}
                          <div>
                            <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-main);">${ui.escape(a.name)}</div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-family-mono);">${a.id}</div>
                          </div>
                        </div>
                        <span class="badge badge-olive" style="font-size: 0.68rem;">Ambassador</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-secondary" id="btn-modal-goto-profile">
              ${ui.icon('settings')} View Full Profile & Settings
            </button>
            <button class="btn btn-outline" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      // Switch by clicking persona
      modalHost.querySelectorAll('[data-switch-to]').forEach(btn => {
        btn.addEventListener('click', () => {
          const [role, id] = btn.getAttribute('data-switch-to').split(':');
          window.CC.state.setRoleAndUser(role, id);
          ui.closeModal();
          ui.showToast(`Switched active view to ${role}: ${id}`, "success", "Welcome");
        });
      });

      // Switch by manual ID input
      const inputId = modalHost.querySelector('#input-account-id');
      const submitBtn = modalHost.querySelector('#btn-switch-by-id');
      const handleManualSwitch = () => {
        const query = (inputId?.value || '').trim();
        if (!query) return;
        const upper = query.toUpperCase();

        const mentor = window.CC.db.getMentorById(upper) || window.CC.db.getMentors().find(m => m.email.toLowerCase() === query.toLowerCase());
        if (mentor) {
          window.CC.state.setRoleAndUser('Mentor', mentor.id);
          ui.closeModal();
          ui.showToast(`Logged in as Mentor: ${mentor.name} (${mentor.id})`, "success", "Dashboard Ready");
          return;
        }

        const ambassador = window.CC.db.getAmbassadorById(upper) || window.CC.db.getAmbassadors().find(a => a.email.toLowerCase() === query.toLowerCase());
        if (ambassador) {
          window.CC.state.setRoleAndUser('Ambassador', ambassador.id);
          ui.closeModal();
          ui.showToast(`Logged in as Ambassador: ${ambassador.name} (${ambassador.id})`, "success", "Dashboard Ready");
          return;
        }

        ui.showToast(`No user found with ID or email "${query}". Try MTR-101 or AMB-201.`, "error", "Invalid ID");
      };

      submitBtn?.addEventListener('click', handleManualSwitch);
      inputId?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleManualSwitch();
      });

      // Copy direct link
      modalHost.querySelector('#btn-copy-direct-link')?.addEventListener('click', () => {
        navigator.clipboard.writeText(currentUrl).then(() => {
          ui.showToast("Direct access link copied to clipboard!", "success", "Link Copied");
        }).catch(() => {
          ui.showToast(currentUrl, "info", "Shareable Link");
        });
      });

      // Go to profile settings
      modalHost.querySelector('#btn-modal-goto-profile')?.addEventListener('click', () => {
        ui.closeModal();
        window.CC.state.setSection('profile-settings');
      });
    });
  }

  // Notifications Modal
  function openNotificationsModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;
    const notifs = window.CC.db.getNotificationsForUser(currentUser.id);

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <h3 class="modal-title">${ui.icon('bell')} Notifications</h3>
              <span class="badge badge-gray">${notifs.length}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn btn-sm btn-outline" id="btn-mark-all-notifs-read">Mark All as Read</button>
              <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
            </div>
          </div>
          <div class="modal-body" style="max-height: 420px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem;">
            ${notifs.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">${ui.icon('check-circle')}</div>
                <div class="empty-state-title">No Notifications</div>
                <div class="empty-state-text">You are all caught up on alerts, task updates, and announcements.</div>
              </div>
            ` : notifs.map(n => `
              <div style="padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background-color: ${n.read ? 'var(--bg-subtle)' : 'var(--color-primary-light)'}; display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 2px;">
                    <span class="badge ${n.read ? 'badge-gray' : 'badge-green'}" style="font-size: 0.65rem;">
                      ${n.read ? 'Read' : 'New'}
                    </span>
                    <strong style="font-size: 0.88rem; color: var(--text-main);">${ui.escape(n.title)}</strong>
                  </div>
                  <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.35; margin-top: 2px;">
                    ${ui.escape(n.message)}
                  </p>
                  <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                    ${ui.formatDateTime(n.timestamp)}
                  </div>
                </div>
                ${!n.read ? `
                  <button class="btn btn-sm btn-outline" data-read-notif="${n.id}">Mark Read</button>
                ` : ''}
              </div>
            `).join('')}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      modalHost.querySelector('#btn-mark-all-notifs-read')?.addEventListener('click', () => {
        window.CC.db.markAllNotificationsRead(currentUser.id);
        updateNotificationBadge();
        ui.closeModal();
        ui.showToast("All notifications marked as read.", "info");
      });

      modalHost.querySelectorAll('[data-read-notif]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-read-notif');
          window.CC.db.markNotificationRead(id);
          updateNotificationBadge();
          openNotificationsModal();
        });
      });
    });
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  window.CC = window.CC || {};
  window.CC.app = { init: initApp };
})();
