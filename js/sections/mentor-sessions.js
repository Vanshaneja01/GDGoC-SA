/**
 * GDGconnect - Mentor Sessions Section (One-to-One & Group Mentoring)
 * Distinct from Ambassador Sessions: manages faculty mentorship check-ins, requests & approvals
 */

(function () {
  'use strict';

  let currentTab = 'upcoming'; // 'upcoming', 'today', 'pending', 'completed'
  let currentSearch = '';

  function render(container, params = null) {
    if (params) {
      if (params.action === 'request') {
        setTimeout(() => openRequestSessionModal(), 50);
      } else if (params.action === 'create') {
        setTimeout(() => openCreateSessionModal(params.mentorId), 50);
      }
    }

    const sessions = window.CC.db.getMentorSessions();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const todayStr = new Date().toISOString().split('T')[0];

    const tabFiltered = sessions.filter(s => {
      if (currentTab === 'today') {
        return s.date === todayStr && s.status !== 'Cancelled';
      } else if (currentTab === 'pending') {
        return s.status === 'Requested';
      } else if (currentTab === 'completed') {
        return s.status === 'Completed';
      } else {
        // upcoming
        return (s.status === 'Approved' || s.status === 'Rescheduled') && s.date >= todayStr;
      }
    });

    const filtered = tabFiltered.filter(s => {
      return !currentSearch ||
        s.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        s.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(currentSearch.toLowerCase());
    });

    const pendingCount = sessions.filter(s => s.status === 'Requested').length;

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('video')} Mentor Sessions</h1>
          <p class="section-subtitle">Dedicated 1-on-1 and group faculty mentoring, project check-ins, and career advisement.</p>
        </div>
        <div class="section-header-actions">
          ${currentRole === 'Ambassador' ? `
            <button class="btn btn-primary" id="btn-request-session-top">
              ${ui.icon('plus')} Request 1-on-1 Mentoring
            </button>
          ` : `
            <button class="btn btn-primary" id="btn-schedule-session-top">
              ${ui.icon('plus')} Schedule Mentoring Session
            </button>
          `}
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button class="tab-btn ${currentTab === 'upcoming' ? 'active' : ''}" data-tab="upcoming">
          ${ui.icon('calendar')} Upcoming Sessions
        </button>
        <button class="tab-btn ${currentTab === 'today' ? 'active' : ''}" data-tab="today">
          ${ui.icon('clock')} Today's Sessions
        </button>
        <button class="tab-btn ${currentTab === 'pending' ? 'active' : ''}" data-tab="pending">
          ${ui.icon('alert-circle')} Pending Requests
          ${pendingCount > 0 ? `<span class="badge badge-amber" style="margin-left: 4px;">${pendingCount}</span>` : ''}
        </button>
        <button class="tab-btn ${currentTab === 'completed' ? 'active' : ''}" data-tab="completed">
          ${ui.icon('check-circle')} Completed History
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="filter-search-wrap">
            ${ui.icon('search')}
            <input type="text" class="filter-search-input" id="session-search-input" 
              placeholder="Search session title, topic, ID..." value="${ui.escape(currentSearch)}">
          </div>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Showing <strong>${filtered.length}</strong> sessions
        </div>
      </div>

      <!-- Sessions Grid -->
      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${ui.icon('video')}</div>
          <div class="empty-state-title">No Sessions in this View</div>
          <div class="empty-state-text">No mentoring sessions found under the selected tab. ${currentRole === 'Ambassador' ? 'Click "Request 1-on-1 Mentoring" to schedule time with your mentor.' : 'Click "Schedule Mentoring Session" to invite mentees.'}</div>
        </div>
      ` : `
        <div class="sessions-grid">
          ${filtered.map(s => {
            const mentor = window.CC.db.getMentorById(s.mentorId);
            const ambassadors = (s.ambassadorIds || []).map(id => window.CC.db.getAmbassadorById(id)).filter(Boolean);

            return `
              <div class="session-card">
                <div class="session-header-row">
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="badge badge-gray" style="font-family: var(--font-family-mono); font-size: 0.7rem;">${s.id}</span>
                    <span class="badge badge-blue">${ui.escape(s.meetingType)}</span>
                  </div>
                  ${ui.renderStatusBadge(s.status)}
                </div>

                <h3 class="session-title">${ui.escape(s.title)}</h3>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${ui.escape(s.description)}
                </p>

                <!-- Date & Time Row -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
                  <div class="session-time-pill">
                    ${ui.icon('clock')} ${ui.formatDate(s.date)} • ${ui.escape(s.startTime)} - ${ui.escape(s.endTime)}
                  </div>
                </div>

                <!-- Location / Link -->
                <div class="session-location">
                  ${s.meetingType === 'Virtual' ? ui.icon('video') : ui.icon('map-pin')}
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ui.escape(s.location)}</span>
                </div>

                <!-- Participants Preview -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${mentor ? ui.renderAvatar(mentor.avatar, mentor.name, 'sm') : ''}
                    <div style="font-size: 0.78rem;">
                      <span style="color: var(--text-muted);">Lead:</span>
                      <strong>${mentor ? ui.escape(mentor.name) : 'Mentor'}</strong>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline" data-open-session="${s.id}">
                    Details / Actions
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
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTab = btn.getAttribute('data-tab');
        render(container);
      });
    });

    const searchInput = container.querySelector('#session-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        render(container);
      });
    }

    container.querySelector('#btn-request-session-top')?.addEventListener('click', () => {
      openRequestSessionModal();
    });

    container.querySelector('#btn-schedule-session-top')?.addEventListener('click', () => {
      openCreateSessionModal();
    });

    container.querySelectorAll('[data-open-session]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-session');
        openSessionModal(id);
      });
    });
  }

  function openSessionModal(sessionId) {
    const s = window.CC.db.getMentorSessionById(sessionId);
    if (!s) return;

    const ui = window.CC.ui;
    const mentor = window.CC.db.getMentorById(s.mentorId);
    const ambassadors = (s.ambassadorIds || []).map(id => window.CC.db.getAmbassadorById(id)).filter(Boolean);
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const isMentor = currentRole === 'Mentor' && currentUser.id === s.mentorId;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="badge badge-gray" style="font-family: var(--font-family-mono);">${s.id}</span>
              <h3 class="modal-title">${ui.escape(s.title)}</h3>
            </div>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Status and Timing -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                ${ui.renderStatusBadge(s.status)}
                <span class="badge badge-blue">${ui.escape(s.meetingType)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 600; color: var(--color-primary);">
                ${ui.icon('clock')} ${ui.formatDate(s.date)} • ${ui.escape(s.startTime)} - ${ui.escape(s.endTime)}
              </div>
            </div>

            <!-- Participants Box -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
              <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Faculty Mentor</div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 4px;">
                  ${mentor ? ui.renderAvatar(mentor.avatar, mentor.name, 'sm') : ''}
                  <div>
                    <div style="font-weight: 600;">${mentor ? ui.escape(mentor.name) : 'Mentor'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${mentor ? ui.escape(mentor.email) : ''}</div>
                  </div>
                </div>
              </div>

              <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Participating Ambassadors (${ambassadors.length})</div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 4px;">
                  ${ambassadors.map(a => `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      ${ui.renderAvatar(a.avatar, a.name, 'sm')}
                      <span style="font-size: 0.85rem; font-weight: 500;">${ui.escape(a.name)} (${a.id})</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Description & Location -->
            <div>
              <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.35rem;">Objective & Topic</h4>
              <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">${ui.escape(s.description)}</p>
            </div>

            <div style="background-color: var(--bg-subtle); padding: 0.85rem 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem;">
                ${s.meetingType === 'Virtual' ? ui.icon('video') : ui.icon('map-pin')}
                <strong>Location/Link:</strong>
                <span style="color: var(--color-primary);">${ui.escape(s.location)}</span>
              </div>
              ${s.meetingType === 'Virtual' ? `
                <a href="${ui.escape(s.location.includes('http') ? s.location : '#')}" target="_blank" class="btn btn-sm btn-primary">
                  ${ui.icon('external-link')} Join Room
                </a>
              ` : ''}
            </div>

            <!-- Agenda & Prep Instructions -->
            <div>
              <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">Meeting Agenda</h4>
              <div style="font-size: 0.85rem; color: var(--text-secondary); white-space: pre-line; line-height: 1.5;">${ui.escape(s.agenda || 'General progress check-in.')}</div>
            </div>

            ${s.prepInstructions ? `
              <div style="background-color: var(--color-olive-light); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.82rem; color: var(--text-main);">
                <strong>Preparation Note:</strong> ${ui.escape(s.prepInstructions)}
              </div>
            ` : ''}

            <!-- Mentor Notes & Follow-up Actions (Visible to mentor, and follow-up visible to all) -->
            ${(s.notes || s.followUp || isMentor) ? `
              <div class="card" style="padding: 1.25rem; background-color: var(--bg-subtle);">
                <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">Mentoring Outcomes & Follow-Up</h4>
                
                ${isMentor ? `
                  <div class="form-group">
                    <label class="form-label">Private Mentor Notes (Confidential)</label>
                    <textarea class="form-textarea" id="session-mentor-notes" placeholder="Notes on mentee progress, challenges, next steps...">${ui.escape(s.notes || '')}</textarea>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Action Items / Follow-Up</label>
                    <input type="text" class="form-control" id="session-follow-up" value="${ui.escape(s.followUp || '')}" placeholder="e.g. Mentor to email department chair; Mentee to revise slides">
                  </div>
                  <button class="btn btn-sm btn-primary" id="btn-save-session-notes" style="align-self: flex-start;">
                    Save Notes & Action Items
                  </button>
                ` : `
                  ${s.followUp ? `
                    <div style="font-size: 0.85rem; color: var(--text-main);">
                      <strong>Action Items:</strong> ${ui.escape(s.followUp)}
                    </div>
                  ` : '<div style="font-size: 0.82rem; color: var(--text-muted);">No follow-up action items recorded yet.</div>'}
                `}
              </div>
            ` : ''}

            <!-- Status Controls for Mentor -->
            ${isMentor && s.status === 'Requested' ? `
              <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-radius: var(--radius-md); background-color: var(--status-amber-bg); border: 1px solid rgba(183,129,3,0.3);">
                <div style="flex: 1; font-size: 0.85rem; color: var(--text-main);">
                  This session request from your ambassador requires your approval.
                </div>
                <button class="btn btn-sm btn-primary" id="btn-approve-session">Approve</button>
                <button class="btn btn-sm btn-secondary" id="btn-reschedule-session">Reschedule</button>
                <button class="btn btn-sm btn-danger-outline" id="btn-reject-session">Decline</button>
              </div>
            ` : ''}

            ${isMentor && (s.status === 'Approved' || s.status === 'Rescheduled') ? `
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <button class="btn btn-sm btn-olive" id="btn-mark-session-completed">
                  ${ui.icon('check-circle')} Mark Session Completed
                </button>
                <button class="btn btn-sm btn-danger-outline" id="btn-cancel-session">
                  Cancel Session
                </button>
              </div>
            ` : ''}

          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      // Approve session
      modalHost.querySelector('#btn-approve-session')?.addEventListener('click', () => {
        window.CC.db.updateMentorSession(s.id, { status: 'Approved' });
        window.CC.db.logActivity(currentUser.id, currentUser.name, 'Mentor', 'Approved Mentoring Session', `Approved '${s.title}' (${s.id}).`);
        
        (s.ambassadorIds || []).forEach(ambId => {
          window.CC.db.addNotification(ambId, "Session Approved", `Dr./Prof. ${currentUser.name} approved your session '${s.title}'.`, "session_approved", s.id);
        });

        ui.closeModal();
        ui.showToast("Session approved and confirmed on the calendar!", "success", "Approved");
        refreshSessionsView();
      });

      // Mark completed
      modalHost.querySelector('#btn-mark-session-completed')?.addEventListener('click', () => {
        window.CC.db.updateMentorSession(s.id, { status: 'Completed' });
        window.CC.db.logActivity(currentUser.id, currentUser.name, 'Mentor', 'Completed Mentoring Session', `Concluded session '${s.title}' (${s.id}).`);
        ui.closeModal();
        ui.showToast("Session marked as completed!", "success", "Completed");
        refreshSessionsView();
      });

      // Save Notes
      modalHost.querySelector('#btn-save-session-notes')?.addEventListener('click', () => {
        const notes = modalHost.querySelector('#session-mentor-notes').value.trim();
        const followUp = modalHost.querySelector('#session-follow-up').value.trim();
        window.CC.db.updateMentorSession(s.id, { notes, followUp });
        ui.showToast("Session notes saved.", "success");
      });

      // Cancel
      modalHost.querySelector('#btn-cancel-session')?.addEventListener('click', () => {
        window.CC.db.updateMentorSession(s.id, { status: 'Cancelled' });
        ui.closeModal();
        ui.showToast("Session cancelled.", "info");
        refreshSessionsView();
      });
    });
  }

  function openRequestSessionModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;
    const mentor = window.CC.db.getMentorForAmbassador(currentUser.id);

    if (!mentor) {
      ui.showToast("You do not currently have an assigned mentor. Please request a mentor assignment first.", "warning", "No Mentor");
      return;
    }

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('video')} Request 1-on-1 Mentoring</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--color-primary-light); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem;">
              ${ui.renderAvatar(mentor.avatar, mentor.name, 'sm')}
              <div style="font-size: 0.85rem;">
                Requesting session with <strong>${ui.escape(mentor.name)}</strong> (${ui.escape(mentor.department)})
              </div>
            </div>

            <form id="request-session-form">
              <div class="form-group">
                <label class="form-label form-label-required">Session Topic / Objective</label>
                <input type="text" class="form-control" name="title" placeholder="e.g. Review Lab 101 workshop agenda & slides" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Preferred Date</label>
                  <input type="date" class="form-control" name="date" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Preferred Time</label>
                  <input type="time" class="form-control" name="startTime" value="15:00" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Meeting Type</label>
                  <select class="form-select" name="meetingType">
                    <option value="Virtual">Virtual (Video Room)</option>
                    <option value="In-Person">In-Person (Faculty Office)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Duration</label>
                  <select class="form-select" name="duration">
                    <option value="30">30 minutes</option>
                    <option value="45" selected>45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Details / Specific Questions for Mentor</label>
                <textarea class="form-textarea" name="description" placeholder="Share context on what you want advice on..." required></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#request-session-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const startTime = formData.get('startTime');
        const durationMin = parseInt(formData.get('duration'), 10) || 45;
        // calculate endTime
        const [h, m] = startTime.split(':').map(Number);
        const endTotal = h * 60 + m + durationMin;
        const endH = String(Math.floor(endTotal / 60) % 24).padStart(2, '0');
        const endM = String(endTotal % 60).padStart(2, '0');
        const endTime = `${endH}:${endM}`;

        const newSession = window.CC.db.addMentorSession({
          title: formData.get('title').trim(),
          description: formData.get('description').trim(),
          mentorId: mentor.id,
          ambassadorIds: [currentUser.id],
          date: formData.get('date'),
          startTime: startTime,
          endTime: endTime,
          meetingType: formData.get('meetingType'),
          location: formData.get('meetingType') === 'Virtual' ? `meet.gdgconnect.edu/${mentor.id.toLowerCase()}-${currentUser.id.toLowerCase()}` : (mentor.officeLocation || 'Faculty Office'),
          agenda: formData.get('description').trim(),
          status: 'Requested'
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          'Ambassador',
          'Requested Mentor Session',
          `Requested 1-on-1 session with ${mentor.name} for ${newSession.date}.`
        );

        window.CC.db.addNotification(
          mentor.id,
          "New 1-on-1 Mentoring Request",
          `${currentUser.name} requested a 1-on-1 session for ${newSession.date}.`,
          "session_request",
          newSession.id
        );

        ui.closeModal();
        ui.showToast("Mentoring session requested! Dr./Prof. " + mentor.name + " will review your request.", "success", "Request Sent");
        refreshSessionsView();
      });
    });
  }

  function openCreateSessionModal(defaultMentorId = null) {
    const ui = window.CC.ui;
    const mentors = window.CC.db.getMentors();
    const ambassadors = window.CC.db.getAmbassadors();
    const currentUser = window.CC.state.currentUser;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('video')} Schedule Mentoring Session</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="create-session-form">
              <div class="form-group">
                <label class="form-label form-label-required">Session Title</label>
                <input type="text" class="form-control" name="title" placeholder="e.g. Quarterly Strategic Growth & Milestone Review" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Mentor Lead</label>
                  <select class="form-select" name="mentorId" required>
                    ${mentors.map(m => `
                      <option value="${m.id}" ${(defaultMentorId === m.id || currentUser.id === m.id) ? 'selected' : ''}>
                        ${ui.escape(m.name)} (${m.department})
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Invite Ambassador(s)</label>
                  <select class="form-select" name="ambassadorId" required>
                    <option value="">-- Choose Ambassador --</option>
                    ${ambassadors.map(a => `
                      <option value="${a.id}">${ui.escape(a.name)} (${a.id}) - ${ui.escape(a.department)}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Date</label>
                  <input type="date" class="form-control" name="date" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Start Time</label>
                  <input type="time" class="form-control" name="startTime" value="14:00" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">End Time</label>
                  <input type="time" class="form-control" name="endTime" value="15:00" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Meeting Type</label>
                  <select class="form-select" name="meetingType">
                    <option value="Virtual">Virtual</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Location or Virtual Link</label>
                  <input type="text" class="form-control" name="location" value="GDGconnect Meet (meet.gdgconnect.edu/session)" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Description & Topic</label>
                <textarea class="form-textarea" name="description" placeholder="Topic to be covered..." required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Agenda & Preparation Instructions</label>
                <textarea class="form-textarea" name="agenda" placeholder="1. Review registrations&#10;2. Q&A"></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Schedule Session</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#create-session-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const ambId = formData.get('ambassadorId');
        const newSession = window.CC.db.addMentorSession({
          title: formData.get('title').trim(),
          description: formData.get('description').trim(),
          mentorId: formData.get('mentorId'),
          ambassadorIds: [ambId],
          date: formData.get('date'),
          startTime: formData.get('startTime'),
          endTime: formData.get('endTime'),
          meetingType: formData.get('meetingType'),
          location: formData.get('location').trim(),
          agenda: formData.get('agenda').trim(),
          status: 'Approved'
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          'Mentor',
          'Scheduled Mentoring Session',
          `Scheduled '${newSession.title}' with ${ambId} for ${newSession.date}.`
        );

        window.CC.db.addNotification(
          ambId,
          "New Mentoring Session Scheduled",
          `Dr./Prof. ${currentUser.name} scheduled '${newSession.title}' for ${newSession.date} at ${newSession.startTime}.`,
          "session_scheduled",
          newSession.id
        );

        ui.closeModal();
        ui.showToast("Mentoring session scheduled successfully!", "success", "Scheduled");
        refreshSessionsView();
      });
    });
  }

  function refreshSessionsView() {
    const mainContainer = document.querySelector('#main-content-viewport');
    if (mainContainer) render(mainContainer);
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.mentorSessions = {
    render,
    openSessionModal,
    openRequestSessionModal,
    openCreateSessionModal
  };
})();
