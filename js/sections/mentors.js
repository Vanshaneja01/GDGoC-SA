/**
 * CampusConnect - Mentors Directory & Profiles Section
 * Searchable directory, detailed mentor profile drawer, permitted self-editing
 */

(function () {
  'use strict';

  let currentSearch = '';
  let currentAvailability = 'all';

  function render(container) {
    const mentors = window.CC.db.getMentors();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const filtered = mentors.filter(m => {
      const matchesSearch = !currentSearch ||
        m.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        m.id.toLowerCase().includes(currentSearch.toLowerCase()) ||
        m.department.toLowerCase().includes(currentSearch.toLowerCase()) ||
        (m.expertise || []).some(e => e.toLowerCase().includes(currentSearch.toLowerCase()));

      const matchesAvail = currentAvailability === 'all' || m.availability === currentAvailability;

      return matchesSearch && matchesAvail;
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('users')} Mentor Directory</h1>
          <p class="section-subtitle">Connect with experienced faculty leaders and directors guiding campus initiatives.</p>
        </div>
      </div>

      <!-- Filter & Search Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="filter-search-wrap">
            ${ui.icon('search')}
            <input type="text" class="filter-search-input" id="mentor-search-input" 
              placeholder="Search mentor by name, skill, or ID..." value="${ui.escape(currentSearch)}">
          </div>
          <select class="filter-select" id="mentor-filter-avail">
            <option value="all" ${currentAvailability === 'all' ? 'selected' : ''}>All Availability</option>
            <option value="Available" ${currentAvailability === 'Available' ? 'selected' : ''}>Available</option>
            <option value="Limited Slots" ${currentAvailability === 'Limited Slots' ? 'selected' : ''}>Limited Slots</option>
            <option value="Busy" ${currentAvailability === 'Busy' ? 'selected' : ''}>Busy</option>
          </select>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Showing <strong>${filtered.length}</strong> of <strong>${mentors.length}</strong> mentors
        </div>
      </div>

      <!-- Mentors Grid -->
      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${ui.icon('users')}</div>
          <div class="empty-state-title">No Mentors Found</div>
          <div class="empty-state-text">No mentor records matched your search filters. Try clearing your search keyword.</div>
        </div>
      ` : `
        <div class="directory-grid">
          ${filtered.map(mentor => {
            const mentees = window.CC.db.getAmbassadorsForMentor(mentor.id);
            const mentorTasks = window.CC.db.getTasks().filter(t => t.creatorId === mentor.id);
            const pendingReviews = mentorTasks.filter(t => t.status === 'Submitted' || t.status === 'Under Review').length;
            const isMe = currentRole === 'Mentor' && currentUser.id === mentor.id;

            return `
              <div class="profile-card">
                <div class="profile-card-header">
                  ${ui.renderAvatar(mentor.avatar, mentor.name, 'lg')}
                  <div class="profile-meta-main">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                      <h3 class="profile-name">${ui.escape(mentor.name)}</h3>
                      ${ui.renderStatusBadge(mentor.availability)}
                    </div>
                    <div class="profile-id-tag">${ui.escape(mentor.id)} ${isMe ? '<span class="badge badge-green" style="font-size: 0.65rem;">You</span>' : ''}</div>
                    <div class="profile-institution">${ui.escape(mentor.department)}</div>
                  </div>
                </div>

                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${ui.escape(mentor.bio)}
                </p>

                <!-- Expertise Tags -->
                <div class="profile-skills-wrap">
                  ${(mentor.expertise || []).map(exp => `<span class="skill-pill">${ui.escape(exp)}</span>`).join('')}
                </div>

                <!-- Stats Row -->
                <div class="profile-stats-row">
                  <div class="profile-stat-box">
                    <span class="profile-stat-label">Assigned Ambassadors</span>
                    <span class="profile-stat-value">${mentees.length} <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">/ ${mentor.maxMentees}</span></span>
                  </div>
                  <div class="profile-stat-box">
                    <span class="profile-stat-label">Pending Reviews</span>
                    <span class="profile-stat-value" style="color: ${pendingReviews > 0 ? 'var(--status-amber)' : 'var(--text-main)'};">${pendingReviews}</span>
                  </div>
                </div>

                <!-- Contact & Action Footer -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: auto;">
                  <button class="btn btn-sm btn-primary" style="flex: 1;" data-open-mentor="${mentor.id}">
                    ${ui.icon('users')} View Profile
                  </button>
                  <button class="btn btn-sm btn-outline" data-contact-mentor="${mentor.id}" title="Message Mentor">
                    ${ui.icon('message-square')}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    const searchInput = container.querySelector('#mentor-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        render(container);
      });
    }

    const availSelect = container.querySelector('#mentor-filter-avail');
    if (availSelect) {
      availSelect.addEventListener('change', (e) => {
        currentAvailability = e.target.value;
        render(container);
      });
    }

    container.querySelectorAll('[data-open-mentor]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-mentor');
        openMentorModal(id);
      });
    });

    container.querySelectorAll('[data-contact-mentor]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-contact-mentor');
        window.CC.state.setSection('communication', { chatWith: id });
      });
    });
  }

  function openMentorModal(mentorId) {
    const mentor = window.CC.db.getMentorById(mentorId);
    if (!mentor) return;

    const ui = window.CC.ui;
    const mentees = window.CC.db.getAmbassadorsForMentor(mentor.id);
    const tasks = window.CC.db.getTasks().filter(t => t.creatorId === mentor.id);
    const activeTasks = tasks.filter(t => t.status !== 'Completed');
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const sessions = window.CC.db.getMentorSessions().filter(s => s.mentorId === mentor.id);
    const pendingReviews = tasks.filter(t => t.status === 'Submitted' || t.status === 'Under Review');

    const isSelf = window.CC.state.role === 'Mentor' && window.CC.state.currentUser.id === mentor.id;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-xl">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <h3 class="modal-title">${ui.icon('users')} Mentor Profile</h3>
              <span class="badge badge-gray">${ui.escape(mentor.id)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              ${isSelf ? `<button class="btn btn-sm btn-outline" id="btn-edit-mentor-profile">${ui.icon('edit-2')} Edit Permitted Details</button>` : ''}
              <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
            </div>
          </div>
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Hero Header Box -->
            <div style="display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 1.25rem;">
                ${ui.renderAvatar(mentor.avatar, mentor.name, 'xl')}
                <div>
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--text-main);">${ui.escape(mentor.name)}</h2>
                    ${ui.renderStatusBadge(mentor.availability)}
                  </div>
                  <div style="font-size: 0.9rem; color: var(--color-primary); font-weight: 600; margin-top: 2px;">
                    ${ui.escape(mentor.department)}
                  </div>
                  <div style="font-size: 0.82rem; color: var(--text-muted);">${ui.escape(mentor.institution)}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 8px; font-size: 0.82rem; color: var(--text-secondary);">
                    <span>${ui.icon('mail')} <a href="mailto:${ui.escape(mentor.email)}" style="color: var(--color-primary);">${ui.escape(mentor.email)}</a></span>
                    <span>${ui.icon('phone')} ${ui.escape(mentor.phone)}</span>
                    <span>${ui.icon('clock')} ${ui.escape(mentor.officeHours || 'N/A')}</span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="btn btn-primary btn-sm" id="btn-profile-schedule-session">
                  ${ui.icon('video')} Schedule Session
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-profile-send-message">
                  ${ui.icon('message-square')} Send Message
                </button>
              </div>
            </div>

            <!-- Bio & Expertise -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
              <div class="card" style="padding: 1.25rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">Biography & Background</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${ui.escape(mentor.bio)}</p>
                <div style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--text-muted);">
                  <strong>Office Location:</strong> ${ui.escape(mentor.officeLocation || 'Main Campus')}
                </div>
              </div>

              <div class="card" style="padding: 1.25rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">Areas of Expertise</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem;">
                  ${(mentor.expertise || []).map(exp => `<span class="badge badge-green">${ui.escape(exp)}</span>`).join('')}
                </div>
                <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;">Honors & Badges</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                  <span class="badge badge-amber">${ui.icon('award')} 5-Year Faculty Mentor</span>
                  <span class="badge badge-blue">${ui.icon('check-circle')} Master Evaluator</span>
                </div>
              </div>
            </div>

            <!-- Assigned Ambassadors Sub-Roster -->
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">${ui.icon('users')} Assigned Ambassadors (${mentees.length} / ${mentor.maxMentees})</h4>
                ${isSelf ? `<button class="btn btn-sm btn-outline" id="btn-modal-assign-task">${ui.icon('plus')} Assign Task to Mentee</button>` : ''}
              </div>
              <div class="card-body" style="padding: 0;">
                ${mentees.length === 0 ? `
                  <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    No student ambassadors currently assigned.
                  </div>
                ` : `
                  <div class="table-container" style="border: none;">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Ambassador</th>
                          <th>Department & Year</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${mentees.map(m => `
                          <tr>
                            <td>
                              <div style="display: flex; align-items: center; gap: 0.6rem;">
                                ${ui.renderAvatar(m.avatar, m.name, 'sm')}
                                <div>
                                  <div style="font-weight: 600;">${ui.escape(m.name)}</div>
                                  <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-family-mono);">${ui.escape(m.id)}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>${ui.escape(m.department)}</div>
                              <div style="font-size: 0.75rem; color: var(--text-muted);">${ui.escape(m.year)}</div>
                            </td>
                            <td>${ui.renderStatusBadge(m.status)}</td>
                            <td>
                              <button class="btn btn-sm btn-outline" data-jump-ambassador="${m.id}">View Profile</button>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `}
              </div>
            </div>

            <!-- Sessions & Tasks Split -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
              <div class="card">
                <div class="card-header">
                  <h4 class="card-title">${ui.icon('video')} Mentoring Sessions (${sessions.length})</h4>
                </div>
                <div class="card-body" style="display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem;">
                  ${sessions.length === 0 ? `<div style="font-size: 0.85rem; color: var(--text-muted);">No sessions recorded.</div>` : `
                    ${sessions.map(s => `
                      <div style="padding: 0.75rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
                        <div>
                          <div style="font-size: 0.85rem; font-weight: 600;">${ui.escape(s.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${ui.formatDate(s.date)} • ${ui.escape(s.startTime)}</div>
                        </div>
                        ${ui.renderStatusBadge(s.status)}
                      </div>
                    `).join('')}
                  `}
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <h4 class="card-title">${ui.icon('check-square')} Tasks Created (${tasks.length})</h4>
                </div>
                <div class="card-body" style="display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem;">
                  ${tasks.length === 0 ? `<div style="font-size: 0.85rem; color: var(--text-muted);">No tasks created yet.</div>` : `
                    ${tasks.slice(0, 5).map(t => `
                      <div style="padding: 0.75rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
                        <div>
                          <div style="font-size: 0.85rem; font-weight: 600;">${ui.escape(t.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">Due: ${ui.formatDate(t.deadline)}</div>
                        </div>
                        ${ui.renderStatusBadge(t.status)}
                      </div>
                    `).join('')}
                  `}
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      // Edit button handler
      modalHost.querySelector('#btn-edit-mentor-profile')?.addEventListener('click', () => {
        openEditMentorModal(mentor);
      });

      modalHost.querySelector('#btn-profile-schedule-session')?.addEventListener('click', () => {
        ui.closeModal();
        window.CC.state.setSection('mentor-sessions', { action: 'create', mentorId: mentor.id });
      });

      modalHost.querySelector('#btn-profile-send-message')?.addEventListener('click', () => {
        ui.closeModal();
        window.CC.state.setSection('communication', { chatWith: mentor.id });
      });

      modalHost.querySelector('#btn-modal-assign-task')?.addEventListener('click', () => {
        ui.closeModal();
        window.CC.state.setSection('tasks', { action: 'create', creatorId: mentor.id });
      });

      modalHost.querySelectorAll('[data-jump-ambassador]').forEach(btn => {
        btn.addEventListener('click', () => {
          const ambId = btn.getAttribute('data-jump-ambassador');
          ui.closeModal();
          window.CC.sections.ambassadors.openAmbassadorModal(ambId);
        });
      });
    });
  }

  function openEditMentorModal(mentor) {
    const ui = window.CC.ui;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('edit-2')} Edit My Mentor Profile</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="edit-mentor-form">
              <div class="form-group">
                <label class="form-label form-label-required">Full Name</label>
                <input type="text" class="form-control" name="name" value="${ui.escape(mentor.name)}" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Email Address</label>
                  <input type="email" class="form-control" name="email" value="${ui.escape(mentor.email)}" required>
                  <span class="form-hint">Updates automatically across assigned mentees' MY MENTOR cards.</span>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Phone Number</label>
                  <input type="text" class="form-control" name="phone" value="${ui.escape(mentor.phone)}" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Availability Status</label>
                  <select class="form-select" name="availability">
                    <option value="Available" ${mentor.availability === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="Limited Slots" ${mentor.availability === 'Limited Slots' ? 'selected' : ''}>Limited Slots</option>
                    <option value="Busy" ${mentor.availability === 'Busy' ? 'selected' : ''}>Busy</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Max Mentees</label>
                  <input type="number" class="form-control" name="maxMentees" value="${mentor.maxMentees || 8}" min="1" max="20">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Office Hours & Location</label>
                <input type="text" class="form-control" name="officeHours" value="${ui.escape(mentor.officeHours || '')}" placeholder="e.g. Tue & Thu 2-4 PM">
              </div>

              <div class="form-group">
                <label class="form-label">Expertise (comma separated)</label>
                <input type="text" class="form-control" name="expertise" value="${ui.escape((mentor.expertise || []).join(', '))}">
              </div>

              <div class="form-group">
                <label class="form-label">Biography</label>
                <textarea class="form-textarea" name="bio">${ui.escape(mentor.bio || '')}</textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#edit-mentor-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const updates = {
          name: formData.get('name').trim(),
          email: formData.get('email').trim(),
          phone: formData.get('phone').trim(),
          availability: formData.get('availability'),
          maxMentees: parseInt(formData.get('maxMentees'), 10) || 8,
          officeHours: formData.get('officeHours').trim(),
          expertise: formData.get('expertise').split(',').map(s => s.trim()).filter(Boolean),
          bio: formData.get('bio').trim()
        };

        const updated = window.CC.db.updateMentor(mentor.id, updates);
        window.CC.state.refreshCurrentUserData();

        window.CC.db.logActivity(
          mentor.id,
          updates.name,
          'Mentor',
          'Updated Profile',
          `Updated mentor contact and availability details.`
        );

        ui.closeModal();
        ui.showToast("Mentor profile successfully updated! Changes are reflected dynamically on all assigned ambassadors' cards.", "success", "Profile Updated");
        
        // Re-render directory
        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.mentors = {
    render,
    openMentorModal,
    openEditMentorModal
  };
})();
