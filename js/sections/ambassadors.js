/**
 * CampusConnect - Ambassadors Directory & Profiles Section
 * Dynamic relational link to mentors, mandatory prominent MY MENTOR card, self-editing
 */

(function () {
  'use strict';

  let currentSearch = '';
  let currentYearFilter = 'all';
  let currentMentorFilter = 'all';

  function render(container) {
    const ambassadors = window.CC.db.getAmbassadors();
    const mentors = window.CC.db.getMentors();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const filtered = ambassadors.filter(a => {
      const matchesSearch = !currentSearch ||
        a.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        a.id.toLowerCase().includes(currentSearch.toLowerCase()) ||
        a.department.toLowerCase().includes(currentSearch.toLowerCase()) ||
        (a.skills || []).some(s => s.toLowerCase().includes(currentSearch.toLowerCase()));

      const matchesYear = currentYearFilter === 'all' || a.year.toLowerCase().includes(currentYearFilter.toLowerCase());
      const matchesMentor = currentMentorFilter === 'all' ||
        (currentMentorFilter === 'unassigned' ? !a.mentorId : a.mentorId === currentMentorFilter);

      return matchesSearch && matchesYear && matchesMentor;
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('award')} Ambassador Directory</h1>
          <p class="section-subtitle">Student ambassadors driving outreach, workshops, and lab registrations across campus.</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="filter-search-wrap">
            ${ui.icon('search')}
            <input type="text" class="filter-search-input" id="amb-search-input" 
              placeholder="Search ambassador by name, skill, or ID..." value="${ui.escape(currentSearch)}">
          </div>
          <select class="filter-select" id="amb-filter-year">
            <option value="all" ${currentYearFilter === 'all' ? 'selected' : ''}>All Academic Years</option>
            <option value="Freshman" ${currentYearFilter === 'Freshman' ? 'selected' : ''}>Freshman</option>
            <option value="Sophomore" ${currentYearFilter === 'Sophomore' ? 'selected' : ''}>Sophomore</option>
            <option value="Junior" ${currentYearFilter === 'Junior' ? 'selected' : ''}>Junior</option>
            <option value="Senior" ${currentYearFilter === 'Senior' ? 'selected' : ''}>Senior</option>
          </select>
          <select class="filter-select" id="amb-filter-mentor">
            <option value="all" ${currentMentorFilter === 'all' ? 'selected' : ''}>All Mentors</option>
            <option value="unassigned" ${currentMentorFilter === 'unassigned' ? 'selected' : ''}>⚠️ No Mentor Assigned</option>
            ${mentors.map(m => `
              <option value="${m.id}" ${currentMentorFilter === m.id ? 'selected' : ''}>Mentor: ${ui.escape(m.name)}</option>
            `).join('')}
          </select>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Showing <strong>${filtered.length}</strong> of <strong>${ambassadors.length}</strong> ambassadors
        </div>
      </div>

      <!-- Grid -->
      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${ui.icon('award')}</div>
          <div class="empty-state-title">No Ambassadors Found</div>
          <div class="empty-state-text">No ambassador records matched your active filters. Try adjusting your search query.</div>
        </div>
      ` : `
        <div class="directory-grid">
          ${filtered.map(amb => {
            // Relational dynamic mentor lookup
            const mentor = window.CC.db.getMentorForAmbassador(amb.id);
            const ambTasks = window.CC.db.getTasks().filter(t => t.assigneeId === amb.id);
            const completed = ambTasks.filter(t => t.status === 'Completed').length;
            const total = ambTasks.length;
            const taskPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const regCount = window.CC.db.getParticipants().filter(p => p.ambassadorId === amb.id).length;
            const isMe = currentRole === 'Ambassador' && currentUser.id === amb.id;

            return `
              <div class="profile-card">
                <div class="profile-card-header">
                  ${ui.renderAvatar(amb.avatar, amb.name, 'lg')}
                  <div class="profile-meta-main">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                      <h3 class="profile-name">${ui.escape(amb.name)}</h3>
                      ${ui.renderStatusBadge(amb.status)}
                    </div>
                    <div class="profile-id-tag">${ui.escape(amb.id)} ${isMe ? '<span class="badge badge-olive" style="font-size: 0.65rem;">You</span>' : ''}</div>
                    <div class="profile-institution">${ui.escape(amb.department)} • ${ui.escape(amb.year)}</div>
                  </div>
                </div>

                <!-- Assigned Mentor Chip -->
                <div style="padding: 0.5rem 0.75rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem;">
                    <span style="color: var(--text-muted); font-weight: 500;">Mentor:</span>
                    ${mentor ? `
                      <span style="font-weight: 600; color: var(--color-primary);">${ui.escape(mentor.name)}</span>
                    ` : `
                      <span class="badge badge-amber" style="font-size: 0.7rem;">⚠️ None Assigned</span>
                    `}
                  </div>
                  ${mentor ? `<span style="font-size: 0.7rem; font-family: var(--font-family-mono); color: var(--text-muted);">${ui.escape(mentor.id)}</span>` : ''}
                </div>

                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${ui.escape(amb.bio)}
                </p>

                <!-- Skills -->
                <div class="profile-skills-wrap">
                  ${(amb.skills || []).map(skill => `<span class="skill-pill">${ui.escape(skill)}</span>`).join('')}
                </div>

                <!-- Stats Row -->
                <div class="profile-stats-row">
                  <div class="profile-stat-box">
                    <span class="profile-stat-label">Tasks Progress</span>
                    <span class="profile-stat-value">${completed}/${total} <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">(${taskPercent}%)</span></span>
                  </div>
                  <div class="profile-stat-box">
                    <span class="profile-stat-label">Registrations Sourced</span>
                    <span class="profile-stat-value" style="color: var(--color-primary);">${regCount}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: auto;">
                  <button class="btn btn-sm btn-primary" style="flex: 1;" data-open-ambassador="${amb.id}">
                    ${ui.icon('award')} View Profile
                  </button>
                  <button class="btn btn-sm btn-outline" data-contact-ambassador="${amb.id}" title="Message Ambassador">
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
    const searchInput = container.querySelector('#amb-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        render(container);
      });
    }

    const yearSelect = container.querySelector('#amb-filter-year');
    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        currentYearFilter = e.target.value;
        render(container);
      });
    }

    const mentorSelect = container.querySelector('#amb-filter-mentor');
    if (mentorSelect) {
      mentorSelect.addEventListener('change', (e) => {
        currentMentorFilter = e.target.value;
        render(container);
      });
    }

    container.querySelectorAll('[data-open-ambassador]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-ambassador');
        openAmbassadorModal(id);
      });
    });

    container.querySelectorAll('[data-contact-ambassador]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-contact-ambassador');
        window.CC.state.setSection('communication', { chatWith: id });
      });
    });
  }

  function openAmbassadorModal(ambassadorId) {
    const amb = window.CC.db.getAmbassadorById(ambassadorId);
    if (!amb) return;

    const ui = window.CC.ui;
    // DYNAMIC RELATIONAL LOOKUP
    const mentor = window.CC.db.getMentorForAmbassador(amb.id);
    const tasks = window.CC.db.getTasks().filter(t => t.assigneeId === amb.id);
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const participants = window.CC.db.getParticipants().filter(p => p.ambassadorId === amb.id);
    const sessions = window.CC.db.getAmbassadorSessions().filter(s => s.organizerId === amb.id);
    const reports = window.CC.db.getReports().filter(r => r.ambassadorId === amb.id);

    const isSelf = window.CC.state.role === 'Ambassador' && window.CC.state.currentUser.id === amb.id;
    const isMentor = window.CC.state.role === 'Mentor';

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-xl">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <h3 class="modal-title">${ui.icon('award')} Ambassador Profile</h3>
              <span class="badge badge-gray">${ui.escape(amb.id)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              ${isSelf ? `<button class="btn btn-sm btn-outline" id="btn-edit-amb-profile">${ui.icon('edit-2')} Edit Permitted Details</button>` : ''}
              ${isMentor ? `<button class="btn btn-sm btn-outline" id="btn-reassign-mentor">${ui.icon('repeat')} Assign / Change Mentor</button>` : ''}
              <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
            </div>
          </div>
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Hero Details -->
            <div style="display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 1.25rem;">
                ${ui.renderAvatar(amb.avatar, amb.name, 'xl')}
                <div>
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--text-main);">${ui.escape(amb.name)}</h2>
                    ${ui.renderStatusBadge(amb.status)}
                  </div>
                  <div style="font-size: 0.9rem; color: var(--color-olive); font-weight: 600; margin-top: 2px;">
                    ${ui.escape(amb.department)} • ${ui.escape(amb.year)}
                  </div>
                  <div style="font-size: 0.82rem; color: var(--text-muted);">${ui.escape(amb.institution)}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 8px; font-size: 0.82rem; color: var(--text-secondary);">
                    <span>${ui.icon('mail')} <a href="mailto:${ui.escape(amb.email)}" style="color: var(--color-primary);">${ui.escape(amb.email)}</a></span>
                    <span>${ui.icon('phone')} ${ui.escape(amb.phone)}</span>
                    <span>${ui.icon('calendar')} Joined ${ui.formatDate(amb.joinedDate)}</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="btn btn-secondary btn-sm" id="btn-message-amb">
                  ${ui.icon('message-square')} Send Direct Message
                </button>
                ${isMentor ? `<button class="btn btn-primary btn-sm" id="btn-assign-task-to-amb">${ui.icon('plus')} Assign Task</button>` : ''}
              </div>
            </div>

            <!-- ==========================================================================
                 MANDATORY: PROMINENT MY MENTOR CARD (DYNAMICALLY LINKED VIA MENTOR ID)
                 ========================================================================== -->
            ${mentor ? `
              <div class="my-mentor-card">
                <div class="my-mentor-badge">${ui.icon('shield')} Assigned Faculty Mentor</div>
                <div class="my-mentor-body">
                  <div class="my-mentor-left">
                    ${ui.renderAvatar(mentor.avatar, mentor.name, 'lg')}
                    <div class="my-mentor-info">
                      <div class="my-mentor-name">${ui.escape(mentor.name)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-family-mono);">${ui.escape(mentor.id)} • ${ui.escape(mentor.department)}</div>
                      <div class="my-mentor-contacts" style="margin-top: 4px;">
                        <span class="my-mentor-contact-item">
                          ${ui.icon('mail')} <a href="mailto:${ui.escape(mentor.email)}">${ui.escape(mentor.email)}</a>
                        </span>
                        <span class="my-mentor-contact-item">
                          ${ui.icon('phone')} <span>${ui.escape(mentor.phone)}</span>
                        </span>
                        <span class="my-mentor-contact-item">
                          ${ui.icon('clock')} <span>${ui.escape(mentor.officeHours || 'By Appointment')}</span>
                        </span>
                      </div>
                      <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 6px;">
                        ${(mentor.expertise || []).map(e => `<span class="skill-pill">${ui.escape(e)}</span>`).join('')}
                      </div>
                    </div>
                  </div>
                  <div class="my-mentor-actions">
                    <button class="btn btn-primary btn-sm" id="btn-amb-contact-mentor">
                      ${ui.icon('message-square')} Contact Mentor
                    </button>
                    <button class="btn btn-outline btn-sm" id="btn-amb-view-mentor-profile">
                      ${ui.icon('users')} View Mentor Profile
                    </button>
                  </div>
                </div>
              </div>
            ` : `
              <div class="mentor-alert-missing">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <div style="color: var(--status-amber);">${ui.icon('alert-circle')}</div>
                  <div>
                    <div style="font-weight: 700; color: var(--text-main);">⚠️ No Mentor Assigned</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">This ambassador has not been paired with a faculty mentor. Use the button on the right to assign one.</div>
                  </div>
                </div>
                <button class="btn btn-olive btn-sm" id="btn-assign-mentor-action">Assign Mentor Now</button>
              </div>
            `}

            <!-- Bio & Skills -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
              <div class="card" style="padding: 1.25rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">Ambassador Biography</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${ui.escape(amb.bio)}</p>
              </div>

              <div class="card" style="padding: 1.25rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">Skills & Specialties</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                  ${(amb.skills || []).map(skill => `<span class="badge badge-green">${ui.escape(skill)}</span>`).join('')}
                </div>
              </div>
            </div>

            <!-- Tasks & Registrations Tabs Inside Profile -->
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">${ui.icon('check-square')} Tasks Assigned (${tasks.length})</h4>
                <span class="badge badge-green">${completedTasks.length} Completed</span>
              </div>
              <div class="card-body" style="padding: 0;">
                ${tasks.length === 0 ? `
                  <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    No tasks assigned to this ambassador yet.
                  </div>
                ` : `
                  <div class="table-container" style="border: none;">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Task ID & Title</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Deadline</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${tasks.map(t => `
                          <tr>
                            <td>
                              <div style="font-weight: 600;">${ui.escape(t.title)}</div>
                              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-family-mono);">${t.id}</div>
                            </td>
                            <td>${ui.escape(t.category)}</td>
                            <td>${ui.renderPriorityBadge(t.priority)}</td>
                            <td>${ui.formatDate(t.deadline)}</td>
                            <td>${ui.renderStatusBadge(t.status)}</td>
                            <td>
                              <button class="btn btn-sm btn-outline" data-jump-task="${t.id}">Inspect</button>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `}
              </div>
            </div>

            <!-- Registrations Sourced -->
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">${ui.icon('user-check')} Participant Registrations Contributed (${participants.length})</h4>
              </div>
              <div class="card-body" style="padding: 0;">
                ${participants.length === 0 ? `
                  <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    No participant registrations registered by this ambassador yet.
                  </div>
                ` : `
                  <div class="table-container" style="border: none;">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Participant</th>
                          <th>Lab</th>
                          <th>Registered Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${participants.map(p => `
                          <tr>
                            <td>
                              <div style="font-weight: 600;">${ui.escape(p.name)}</div>
                              <div style="font-size: 0.75rem; color: var(--text-muted);">${ui.escape(p.email)}</div>
                            </td>
                            <td>${ui.escape(p.labId)}</td>
                            <td>${ui.formatDate(p.registeredAt)}</td>
                            <td>${ui.renderStatusBadge(p.verificationStatus)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `}
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
      // My mentor button handlers
      if (mentor) {
        modalHost.querySelector('#btn-amb-contact-mentor')?.addEventListener('click', () => {
          ui.closeModal();
          window.CC.state.setSection('communication', { chatWith: mentor.id });
        });

        modalHost.querySelector('#btn-amb-view-mentor-profile')?.addEventListener('click', () => {
          ui.closeModal();
          window.CC.sections.mentors.openMentorModal(mentor.id);
        });
      }

      modalHost.querySelector('#btn-message-amb')?.addEventListener('click', () => {
        ui.closeModal();
        window.CC.state.setSection('communication', { chatWith: amb.id });
      });

      modalHost.querySelector('#btn-assign-task-to-amb')?.addEventListener('click', () => {
        ui.closeModal();
        window.CC.state.setSection('tasks', { action: 'create', assigneeId: amb.id });
      });

      modalHost.querySelector('#btn-edit-amb-profile')?.addEventListener('click', () => {
        openEditAmbassadorModal(amb);
      });

      const assignMentorHandler = () => {
        openAssignMentorModal(amb);
      };
      modalHost.querySelector('#btn-reassign-mentor')?.addEventListener('click', assignMentorHandler);
      modalHost.querySelector('#btn-assign-mentor-action')?.addEventListener('click', assignMentorHandler);

      modalHost.querySelectorAll('[data-jump-task]').forEach(btn => {
        btn.addEventListener('click', () => {
          const taskId = btn.getAttribute('data-jump-task');
          ui.closeModal();
          window.CC.sections.tasks.openTaskModal(taskId);
        });
      });
    });
  }

  function openEditAmbassadorModal(amb) {
    const ui = window.CC.ui;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('edit-2')} Edit My Ambassador Profile</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="edit-amb-form">
              <div class="form-group">
                <label class="form-label form-label-required">Full Name</label>
                <input type="text" class="form-control" name="name" value="${ui.escape(amb.name)}" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Email Address</label>
                  <input type="email" class="form-control" name="email" value="${ui.escape(amb.email)}" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Phone Number</label>
                  <input type="text" class="form-control" name="phone" value="${ui.escape(amb.phone)}" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Academic Year</label>
                  <select class="form-select" name="year">
                    <option value="Freshman (Year 1)" ${amb.year.includes('Freshman') ? 'selected' : ''}>Freshman (Year 1)</option>
                    <option value="Sophomore (Year 2)" ${amb.year.includes('Sophomore') ? 'selected' : ''}>Sophomore (Year 2)</option>
                    <option value="Junior (Year 3)" ${amb.year.includes('Junior') ? 'selected' : ''}>Junior (Year 3)</option>
                    <option value="Senior (Year 4)" ${amb.year.includes('Senior') ? 'selected' : ''}>Senior (Year 4)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <input type="text" class="form-control" name="department" value="${ui.escape(amb.department)}">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Skills (comma separated)</label>
                <input type="text" class="form-control" name="skills" value="${ui.escape((amb.skills || []).join(', '))}">
              </div>

              <div class="form-group">
                <label class="form-label">Biography</label>
                <textarea class="form-textarea" name="bio">${ui.escape(amb.bio || '')}</textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#edit-amb-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const updates = {
          name: formData.get('name').trim(),
          email: formData.get('email').trim(),
          phone: formData.get('phone').trim(),
          year: formData.get('year'),
          department: formData.get('department').trim(),
          skills: formData.get('skills').split(',').map(s => s.trim()).filter(Boolean),
          bio: formData.get('bio').trim()
        };

        window.CC.db.updateAmbassador(amb.id, updates);
        window.CC.state.refreshCurrentUserData();

        window.CC.db.logActivity(
          amb.id,
          updates.name,
          'Ambassador',
          'Updated Profile',
          `Updated personal contact and bio details.`
        );

        ui.closeModal();
        ui.showToast("Ambassador profile updated successfully!", "success", "Saved");

        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  function openAssignMentorModal(amb) {
    const ui = window.CC.ui;
    const mentors = window.CC.db.getMentors();

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('shield')} Assign Mentor</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Select a faculty mentor for <strong>${ui.escape(amb.name)}</strong>. The ambassador's MY MENTOR card will link to this mentor immediately.
            </p>
            <div class="form-group">
              <label class="form-label form-label-required">Select Mentor</label>
              <select class="form-select" id="select-mentor-id">
                <option value="">-- Choose a Mentor --</option>
                ${mentors.map(m => {
                  const menteeCount = window.CC.db.getAmbassadorsForMentor(m.id).length;
                  return `
                    <option value="${m.id}" ${amb.mentorId === m.id ? 'selected' : ''}>
                      ${ui.escape(m.name)} (${m.department}) - ${menteeCount}/${m.maxMentees} mentees
                    </option>
                  `;
                }).join('')}
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Cancel</button>
            <button class="btn btn-primary" id="btn-save-mentor-assign">Confirm Assignment</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      modalHost.querySelector('#btn-save-mentor-assign')?.addEventListener('click', () => {
        const selectedMentorId = modalHost.querySelector('#select-mentor-id').value;
        if (!selectedMentorId) {
          ui.showToast("Please choose a valid mentor.", "warning");
          return;
        }

        window.CC.db.assignMentorToAmbassador(amb.id, selectedMentorId);
        const mentor = window.CC.db.getMentorById(selectedMentorId);

        window.CC.db.logActivity(
          window.CC.state.currentUser.id,
          window.CC.state.currentUser.name,
          window.CC.state.role,
          'Assigned Mentor',
          `Assigned ${mentor.name} as mentor for ${amb.name}.`
        );

        window.CC.db.addNotification(
          amb.id,
          "Mentor Assigned",
          `Dr./Prof. ${mentor.name} has been assigned as your faculty mentor.`,
          "mentor_assigned",
          mentor.id
        );

        ui.closeModal();
        ui.showToast(`Assigned ${mentor.name} to ${amb.name}!`, "success", "Mentor Linked");

        // Re-open ambassador modal with updated relationship
        openAmbassadorModal(amb.id);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.ambassadors = {
    render,
    openAmbassadorModal,
    openEditAmbassadorModal,
    openAssignMentorModal
  };
})();
