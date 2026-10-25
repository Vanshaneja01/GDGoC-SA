/**
 * CampusConnect - Ambassador Sessions Section
 * Workshops, lab orientations, registration drives, proposals & post-session reporting
 */

(function () {
  'use strict';

  let currentCategory = 'all';
  let currentStatus = 'all';
  let currentSearch = '';

  const CATEGORIES = [
    "Workshop", "Lab Orientation", "Registration Drive",
    "Outreach Activity", "Training", "Awareness Session", "Team Meeting"
  ];

  function render(container, params = null) {
    if (params) {
      if (params.filterStatus) currentStatus = params.filterStatus;
      if (params.action === 'propose') {
        setTimeout(() => openProposeSessionModal(), 50);
      }
    }

    const sessions = window.CC.db.getAmbassadorSessions();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const filtered = sessions.filter(s => {
      const matchesSearch = !currentSearch ||
        s.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        s.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(currentSearch.toLowerCase());

      const matchesCat = currentCategory === 'all' || s.category === currentCategory;
      const matchesStat = currentStatus === 'all' || s.status === currentStatus;

      return matchesSearch && matchesCat && matchesStat;
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('presentation')} Ambassador Sessions & Workshops</h1>
          <p class="section-subtitle">Student-led lab workshops, campus outreach drives, tech bootcamps, and peer tutorials.</p>
        </div>
        <div class="section-header-actions">
          ${currentRole === 'Ambassador' ? `
            <button class="btn btn-primary" id="btn-propose-session-top">
              ${ui.icon('plus')} Propose Workshop / Drive
            </button>
          ` : `
            <button class="btn btn-secondary" id="btn-filter-proposals">
              ${ui.icon('alert-circle')} View Proposals Needing Review
            </button>
          `}
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="filter-search-wrap">
            ${ui.icon('search')}
            <input type="text" class="filter-search-input" id="amb-session-search" 
              placeholder="Search session title, ID..." value="${ui.escape(currentSearch)}">
          </div>
          <select class="filter-select" id="amb-session-category">
            <option value="all" ${currentCategory === 'all' ? 'selected' : ''}>All Categories</option>
            ${CATEGORIES.map(c => `<option value="${c}" ${currentCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <select class="filter-select" id="amb-session-status">
            <option value="all" ${currentStatus === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="Pending Mentor Approval" ${currentStatus === 'Pending Mentor Approval' ? 'selected' : ''}>Pending Mentor Approval</option>
            <option value="Approved" ${currentStatus === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Draft" ${currentStatus === 'Draft' ? 'selected' : ''}>Draft</option>
            <option value="Cancelled" ${currentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Showing <strong>${filtered.length}</strong> sessions
        </div>
      </div>

      <!-- Sessions Grid -->
      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${ui.icon('presentation')}</div>
          <div class="empty-state-title">No Sessions Found</div>
          <div class="empty-state-text">No ambassador events matched your filters. Click "Propose Workshop / Drive" to organize a new activity.</div>
        </div>
      ` : `
        <div class="sessions-grid">
          ${filtered.map(s => {
            const organizer = window.CC.db.getAmbassadorById(s.organizerId);
            const mentor = window.CC.db.getMentorById(s.mentorId);

            return `
              <div class="session-card">
                <div class="session-header-row">
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="badge badge-gray" style="font-family: var(--font-family-mono); font-size: 0.7rem;">${s.id}</span>
                    <span class="badge badge-green">${ui.escape(s.category)}</span>
                  </div>
                  ${ui.renderStatusBadge(s.status)}
                </div>

                <h3 class="session-title">${ui.escape(s.title)}</h3>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${ui.escape(s.description)}
                </p>

                <!-- Date & Venue -->
                <div style="display: flex; flex-direction: column; gap: 0.35rem; padding: 0.5rem 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); font-size: 0.82rem;">
                  <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--color-primary); font-weight: 600;">
                    ${ui.icon('clock')} ${ui.formatDate(s.date)} • ${ui.escape(s.startTime)} - ${ui.escape(s.endTime)}
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--text-secondary);">
                    ${ui.icon('map-pin')} <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ui.escape(s.venue)}</span>
                  </div>
                </div>

                <!-- Registration Capacity Progress -->
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem;">
                    <span style="color: var(--text-secondary);">RSVP Capacity</span>
                    <strong>${s.registeredCount || 0} / ${s.registrationLimit} students</strong>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, Math.round(((s.registeredCount || 0) / s.registrationLimit) * 100))}%;"></div>
                  </div>
                </div>

                <!-- Footer with Organizer and Inspect Button -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${organizer ? ui.renderAvatar(organizer.avatar, organizer.name, 'sm') : ''}
                    <div style="font-size: 0.78rem;">
                      <span style="color: var(--text-muted);">Lead:</span>
                      <strong>${organizer ? ui.escape(organizer.name) : 'Ambassador'}</strong>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline" data-open-amb-session="${s.id}">
                    Manage / Details
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
    const searchInput = container.querySelector('#amb-session-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        render(container);
      });
    }

    const catSelect = container.querySelector('#amb-session-category');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        render(container);
      });
    }

    const statSelect = container.querySelector('#amb-session-status');
    if (statSelect) {
      statSelect.addEventListener('change', (e) => {
        currentStatus = e.target.value;
        render(container);
      });
    }

    container.querySelector('#btn-propose-session-top')?.addEventListener('click', () => {
      openProposeSessionModal();
    });

    container.querySelector('#btn-filter-proposals')?.addEventListener('click', () => {
      currentStatus = 'Pending Mentor Approval';
      render(container);
    });

    container.querySelectorAll('[data-open-amb-session]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-amb-session');
        openSessionModal(id);
      });
    });
  }

  function openSessionModal(sessionId) {
    const s = window.CC.db.getAmbassadorSessionById(sessionId);
    if (!s) return;

    const ui = window.CC.ui;
    const organizer = window.CC.db.getAmbassadorById(s.organizerId);
    const mentor = window.CC.db.getMentorById(s.mentorId);
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const isMentor = currentRole === 'Mentor';
    const isOrganizer = currentRole === 'Ambassador' && currentUser.id === s.organizerId;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-xl">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="badge badge-gray" style="font-family: var(--font-family-mono);">${s.id}</span>
              <h3 class="modal-title">${ui.escape(s.title)}</h3>
            </div>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Header Badges & Actions -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                ${ui.renderStatusBadge(s.status)}
                <span class="badge badge-green">${ui.escape(s.category)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; font-weight: 600; color: var(--color-primary);">
                ${ui.icon('clock')} ${ui.formatDate(s.date)} • ${ui.escape(s.startTime)} - ${ui.escape(s.endTime)}
              </div>
            </div>

            <!-- Organizer and Mentor Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
              <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Student Organizer</div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 4px;">
                  ${organizer ? ui.renderAvatar(organizer.avatar, organizer.name, 'sm') : ''}
                  <div>
                    <div style="font-weight: 600;">${organizer ? ui.escape(organizer.name) : 'Ambassador'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${organizer ? ui.escape(organizer.department) : ''}</div>
                  </div>
                </div>
              </div>

              <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Assigned Mentor (Reviewer)</div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 4px;">
                  ${mentor ? ui.renderAvatar(mentor.avatar, mentor.name, 'sm') : ''}
                  <div>
                    <div style="font-weight: 600;">${mentor ? ui.escape(mentor.name) : 'Mentor'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${mentor ? ui.escape(mentor.department) : ''}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description & Venue -->
            <div>
              <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.35rem;">Session Description</h4>
              <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">${ui.escape(s.description)}</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
              <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle); font-size: 0.85rem;">
                <strong>Venue / Room:</strong> ${ui.escape(s.venue)}
              </div>
              <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle); font-size: 0.85rem;">
                <strong>Target Audience:</strong> ${ui.escape(s.targetAudience || 'Open to all STEM students')}
              </div>
              <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle); font-size: 0.85rem;">
                <strong>Capacity:</strong> ${s.registeredCount || 0} / ${s.registrationLimit} students
              </div>
            </div>

            ${s.expectedOutcomes ? `
              <div>
                <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">Expected Learning Outcomes</h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${ui.escape(s.expectedOutcomes)}</div>
              </div>
            ` : ''}

            <!-- Shareable Registration Link Box -->
            <div style="padding: 0.85rem 1.15rem; border-radius: var(--radius-md); background-color: var(--color-primary-light); display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem;">
                ${ui.icon('external-link')}
                <strong>Public RSVP URL:</strong>
                <span style="font-family: var(--font-family-mono); color: var(--color-primary);">https://campusconnect.edu/events/${s.id.toLowerCase()}</span>
              </div>
              <button class="btn btn-sm btn-primary" id="btn-copy-rsvp-link">
                ${ui.icon('copy')} Copy Link
              </button>
            </div>

            <!-- Mentor Proposal Review Banner (if Pending Approval) -->
            ${isMentor && s.status === 'Pending Mentor Approval' ? `
              <div style="padding: 1.25rem; border-radius: var(--radius-md); background-color: var(--status-amber-bg); border: 1px solid rgba(183,129,3,0.3); display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">
                  Mentor Sign-Off Required for Proposal
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">
                  Review the proposed room booking, curriculum materials, and expected attendance.
                </p>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <button class="btn btn-primary btn-sm" id="btn-approve-proposal">
                    ${ui.icon('check-circle')} Approve Proposal
                  </button>
                  <button class="btn btn-secondary btn-sm" id="btn-request-proposal-changes">
                    Request Proposal Changes
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- ==========================================================================
                 POST-SESSION REPORT & ATTENDANCE RECORDING
                 ========================================================================== -->
            <div class="card" style="padding: 1.25rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
                  ${ui.icon('check-square')} Post-Session Report & Outcomes
                </h4>
                ${s.postSessionReport ? `<span class="badge badge-green">Report Submitted</span>` : '<span class="badge badge-gray">Pending Post-Event Report</span>'}
              </div>

              ${s.postSessionReport ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 0.75rem;">
                  <div style="background-color: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-md);">
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Actual Attendance</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--color-primary);">${s.postSessionReport.attendedCount} students</div>
                  </div>
                  <div style="background-color: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-md);">
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Feedback Rating</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--color-accent-gold);">★ ${s.postSessionReport.feedbackRating || '4.8'} / 5.0</div>
                  </div>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                  <strong>Outcomes Achieved:</strong> ${ui.escape(s.postSessionReport.outcomesAchieved || 'Session objectives met.')}
                </div>
                ${s.postSessionReport.challenges ? `
                  <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; margin-top: 4px;">
                    <strong>Challenges / Notes:</strong> ${ui.escape(s.postSessionReport.challenges)}
                  </div>
                ` : ''}
              ` : `
                ${isOrganizer || isMentor ? `
                  <form id="post-report-form" style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label form-label-required">Actual Attendees Count</label>
                        <input type="number" class="form-control" id="post-attendees" min="0" placeholder="e.g. 45" required>
                      </div>
                      <div class="form-group">
                        <label class="form-label form-label-required">Participant Feedback Rating (1-5)</label>
                        <input type="number" class="form-control" id="post-rating" min="1" max="5" step="0.1" value="4.8" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label form-label-required">Outcomes Achieved</label>
                      <textarea class="form-textarea" id="post-outcomes" placeholder="Summary of what attendees built, learned, or registered for..." required></textarea>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Challenges Faced & Follow-Up</label>
                      <input type="text" class="form-control" id="post-challenges" placeholder="e.g. Projector cable latency, high demand for follow-up part 2">
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm" style="align-self: flex-start;">
                      Submit Post-Session Report & Mark Complete
                    </button>
                  </form>
                ` : `
                  <p style="font-size: 0.85rem; color: var(--text-muted);">Post-session debrief has not been submitted yet.</p>
                `}
              `}
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      modalHost.querySelector('#btn-copy-rsvp-link')?.addEventListener('click', () => {
        ui.showToast("Public RSVP URL copied to clipboard!", "success", "Link Copied");
      });

      // Mentor Approve proposal
      modalHost.querySelector('#btn-approve-proposal')?.addEventListener('click', () => {
        window.CC.db.updateAmbassadorSession(s.id, { status: 'Approved' });
        window.CC.db.logActivity(currentUser.id, currentUser.name, 'Mentor', 'Approved Session Proposal', `Approved '${s.title}' (${s.id}).`);
        
        window.CC.db.addNotification(
          s.organizerId,
          "Session Proposal Approved!",
          `Dr./Prof. ${currentUser.name} approved your workshop '${s.title}'.`,
          "proposal_approved",
          s.id
        );

        ui.closeModal();
        ui.showToast("Workshop proposal approved! It is now active on the student calendar.", "success", "Approved");
        refreshAmbSessionsView();
      });

      // Mentor Request Changes on proposal
      modalHost.querySelector('#btn-request-proposal-changes')?.addEventListener('click', () => {
        window.CC.db.updateAmbassadorSession(s.id, { status: 'Draft' });
        ui.closeModal();
        ui.showToast("Proposal returned to Draft with change request.", "info", "Revision Needed");
        refreshAmbSessionsView();
      });

      // Post-Session Report Submit
      modalHost.querySelector('#post-report-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const attendedCount = parseInt(modalHost.querySelector('#post-attendees').value, 10) || 0;
        const feedbackRating = parseFloat(modalHost.querySelector('#post-rating').value) || 5.0;
        const outcomesAchieved = modalHost.querySelector('#post-outcomes').value.trim();
        const challenges = modalHost.querySelector('#post-challenges').value.trim();

        const updates = {
          status: 'Completed',
          registeredCount: Math.max(s.registeredCount, attendedCount),
          postSessionReport: {
            attendedCount,
            feedbackRating,
            outcomesAchieved,
            challenges,
            submittedAt: new Date().toISOString()
          }
        };

        window.CC.db.updateAmbassadorSession(s.id, updates);
        window.CC.db.logActivity(currentUser.id, currentUser.name, currentRole, 'Completed Ambassador Session', `Submitted post-session debrief for '${s.title}' with ${attendedCount} attendees.`);

        window.CC.db.addNotification(
          s.mentorId,
          "Post-Session Debrief Filed",
          `${currentUser.name} submitted post-session report for '${s.title}'.`,
          "post_session_report",
          s.id
        );

        ui.closeModal();
        ui.showToast("Post-session report submitted! Status set to Completed.", "success", "Report Logged");
        refreshAmbSessionsView();
      });
    });
  }

  function openProposeSessionModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;
    const mentors = window.CC.db.getMentors();
    const assignedMentor = window.CC.db.getMentorForAmbassador(currentUser.id);

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('presentation')} Propose Ambassador Workshop / Drive</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="propose-session-form">
              <div class="form-group">
                <label class="form-label form-label-required">Event Title</label>
                <input type="text" class="form-control" name="title" placeholder="e.g. Hands-on PyTorch & Neural Networks Lab Workshop" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Category</label>
                  <select class="form-select" name="category" required>
                    ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Assigned Faculty Mentor</label>
                  <select class="form-select" name="mentorId" required>
                    ${mentors.map(m => `
                      <option value="${m.id}" ${(assignedMentor && assignedMentor.id === m.id) ? 'selected' : ''}>
                        ${ui.escape(m.name)} (${m.department})
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Proposed Date</label>
                  <input type="date" class="form-control" name="date" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Start Time</label>
                  <input type="time" class="form-control" name="startTime" value="16:00" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">End Time</label>
                  <input type="time" class="form-control" name="endTime" value="18:00" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Venue / Room / Platform</label>
                  <input type="text" class="form-control" name="venue" placeholder="e.g. Turing Science Hall Rm 402 & Zoom" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Registration Capacity Limit</label>
                  <input type="number" class="form-control" name="registrationLimit" min="5" max="300" value="50" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Target Audience</label>
                <input type="text" class="form-control" name="targetAudience" placeholder="e.g. Undergrad CS & Data Science sophomores" required>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Description & Agenda</label>
                <textarea class="form-textarea" name="description" placeholder="Summarize the plan, demos, and prerequisites..." required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Expected Outcomes & Takeaways</label>
                <textarea class="form-textarea" name="expectedOutcomes" placeholder="What will participants achieve by the end of the workshop?"></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Submit for Mentor Approval</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#propose-session-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const newSession = window.CC.db.addAmbassadorSession({
          title: formData.get('title').trim(),
          category: formData.get('category'),
          organizerId: currentUser.id,
          mentorId: formData.get('mentorId'),
          date: formData.get('date'),
          startTime: formData.get('startTime'),
          endTime: formData.get('endTime'),
          venue: formData.get('venue').trim(),
          registrationLimit: parseInt(formData.get('registrationLimit'), 10) || 50,
          targetAudience: formData.get('targetAudience').trim(),
          description: formData.get('description').trim(),
          expectedOutcomes: formData.get('expectedOutcomes').trim(),
          status: 'Pending Mentor Approval'
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          'Ambassador',
          'Proposed Ambassador Session',
          `Proposed '${newSession.title}' (${newSession.id}) for mentor review.`
        );

        window.CC.db.addNotification(
          newSession.mentorId,
          "New Workshop Proposal Submitted",
          `${currentUser.name} submitted '${newSession.title}' for your review.`,
          "proposal_submission",
          newSession.id
        );

        ui.closeModal();
        ui.showToast("Workshop proposal submitted! Your mentor will review and grant approval.", "success", "Proposal Sent");
        refreshAmbSessionsView();
      });
    });
  }

  function refreshAmbSessionsView() {
    const mainContainer = document.querySelector('#main-content-viewport');
    if (mainContainer) render(mainContainer);
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.ambassadorSessions = {
    render,
    openSessionModal,
    openProposeSessionModal
  };
})();
