/**
 * CampusConnect - Role-Based Dashboard Section
 * Contextual KPI cards, quick actions, and tailored overview for Mentor and Ambassador roles
 */

(function () {
  'use strict';

  function renderDashboard(container) {
    const role = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;
    const stats = window.CC.db.getStatistics();
    const ui = window.CC.ui;

    if (role === 'Mentor') {
      renderMentorDashboard(container, currentUser, stats, ui);
    } else {
      renderAmbassadorDashboard(container, currentUser, stats, ui);
    }
  }

  function renderMentorDashboard(container, mentor, stats, ui) {
    const assignedAmbassadors = window.CC.db.getAmbassadorsForMentor(mentor.id);
    const mentorTasks = window.CC.db.getTasks().filter(t => t.creatorId === mentor.id);
    const pendingSubmissions = mentorTasks.filter(t => t.status === 'Submitted' || t.status === 'Under Review');
    const upcomingSessions = window.CC.db.getMentorSessions().filter(s => s.mentorId === mentor.id && s.status === 'Approved');
    const pendingSessionRequests = window.CC.db.getMentorSessions().filter(s => s.mentorId === mentor.id && s.status === 'Requested');
    const pendingAmbSessionProposals = window.CC.db.getAmbassadorSessions().filter(s => s.mentorId === mentor.id && s.status === 'Pending Mentor Approval');
    const pendingReports = window.CC.db.getReports().filter(r => r.mentorId === mentor.id && (r.status === 'Submitted' || r.status === 'Under Review'));
    const tickets = window.CC.db.getTickets().filter(t => t.assignedMentorId === mentor.id && t.status !== 'Closed');
    const recentLogs = window.CC.db.data.activityLogs.slice(0, 5);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <div class="badge badge-green" style="margin-bottom: 6px; width: fit-content;">
            ${ui.icon('shield')} Mentor Command Center
          </div>
          <h1 class="section-title">Welcome back, ${ui.escape(mentor.name)}</h1>
          <p class="section-subtitle">${ui.escape(mentor.department)} • ${ui.escape(mentor.institution)}</p>
        </div>
        <div class="section-header-actions">
          <button class="btn btn-primary" id="btn-quick-create-task">
            ${ui.icon('plus')} Create Task
          </button>
          <button class="btn btn-secondary" id="btn-quick-schedule-session">
            ${ui.icon('video')} Schedule Session
          </button>
        </div>
      </div>

      <!-- Metric KPI Cards -->
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Assigned Ambassadors</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-blue-bg); color: var(--status-blue);">
              ${ui.icon('users')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${assignedAmbassadors.length}</span>
            <span class="metric-trend" style="color: var(--status-blue);">Active Mentees</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Submissions to Review</span>
            <div class="metric-icon-wrap" style="background-color: ${pendingSubmissions.length > 0 ? 'var(--status-amber-bg)' : 'var(--bg-subtle)'}; color: ${pendingSubmissions.length > 0 ? 'var(--status-amber)' : 'var(--text-muted)'};">
              ${ui.icon('check-square')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${pendingSubmissions.length}</span>
            <span class="metric-trend" style="color: var(--status-amber);">${pendingSubmissions.length > 0 ? 'Action required' : 'All clear'}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Upcoming Mentor Sessions</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-green-bg); color: var(--status-green);">
              ${ui.icon('video')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${upcomingSessions.length}</span>
            <span class="metric-trend" style="color: var(--status-green);">${pendingSessionRequests.length} pending request(s)</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Session Proposals</span>
            <div class="metric-icon-wrap" style="background-color: #F3E5F5; color: #7B1FA2;">
              ${ui.icon('presentation')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${pendingAmbSessionProposals.length}</span>
            <span class="metric-trend" style="color: #7B1FA2;">Awaiting sign-off</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Pill Bar -->
      <div class="card" style="margin-bottom: 1.75rem; padding: 1rem 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
            Mentor Quick Actions:
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <button class="btn btn-sm btn-outline" id="qa-view-ambassadors">${ui.icon('users')} View Ambassadors</button>
            <button class="btn btn-sm btn-outline" id="qa-review-tasks">${ui.icon('check-square')} Review Tasks (${pendingSubmissions.length})</button>
            <button class="btn btn-sm btn-outline" id="qa-review-proposals">${ui.icon('presentation')} Review Proposals (${pendingAmbSessionProposals.length})</button>
            <button class="btn btn-sm btn-outline" id="qa-review-reports">${ui.icon('bar-chart-2')} Review Reports (${pendingReports.length})</button>
            <button class="btn btn-sm btn-outline" id="qa-share-resource">${ui.icon('book-open')} Share Resource</button>
            <button class="btn btn-sm btn-outline" id="qa-post-announcement">${ui.icon('bell')} Post Announcement</button>
          </div>
        </div>
      </div>

      <!-- Split Columns Layout -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        
        <!-- Assigned Ambassadors Roster -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${ui.icon('users')} Assigned Ambassadors (${assignedAmbassadors.length})</h3>
            <button class="btn btn-sm btn-outline" id="btn-goto-ambassadors">View All</button>
          </div>
          <div class="card-body" style="padding: 0;">
            ${assignedAmbassadors.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">${ui.icon('users')}</div>
                <div class="empty-state-title">No Ambassadors Assigned</div>
                <div class="empty-state-text">You currently do not have any student ambassadors assigned to your cohort.</div>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column;">
                ${assignedAmbassadors.map(amb => {
                  const ambTasks = window.CC.db.getTasks().filter(t => t.assigneeId === amb.id);
                  const completed = ambTasks.filter(t => t.status === 'Completed').length;
                  const total = ambTasks.length;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--border-subtle);">
                      <div style="display: flex; align-items: center; gap: 0.85rem;">
                        ${ui.renderAvatar(amb.avatar, amb.name, 'md')}
                        <div>
                          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">${ui.escape(amb.name)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-family-mono);">${ui.escape(amb.id)} • ${ui.escape(amb.year)}</div>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="text-align: right;">
                          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">Task Progress</div>
                          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary);">${completed}/${total} (${percent}%)</div>
                        </div>
                        <button class="btn btn-sm btn-outline" data-view-ambassador="${amb.id}">Profile</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Pending Items Needing Mentor Attention -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${ui.icon('alert-circle')} Action Queue</h3>
            <span class="badge badge-amber">${pendingSubmissions.length + pendingSessionRequests.length + pendingAmbSessionProposals.length} Pending</span>
          </div>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${(pendingSubmissions.length === 0 && pendingSessionRequests.length === 0 && pendingAmbSessionProposals.length === 0) ? `
              <div class="empty-state">
                <div class="empty-state-icon" style="color: var(--status-green);">${ui.icon('check-circle')}</div>
                <div class="empty-state-title">You're All Caught Up!</div>
                <div class="empty-state-text">No pending task submissions, session requests, or proposals awaiting your sign-off.</div>
              </div>
            ` : `
              ${pendingSubmissions.map(t => `
                <div style="padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 2px;">
                      <span class="badge badge-blue">Task Submission</span>
                      <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-family-mono);">${t.id}</span>
                    </div>
                    <div style="font-size: 0.88rem; font-weight: 600;">${ui.escape(t.title)}</div>
                  </div>
                  <button class="btn btn-sm btn-primary" data-review-task="${t.id}">Review</button>
                </div>
              `).join('')}

              ${pendingSessionRequests.map(s => `
                <div style="padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 2px;">
                      <span class="badge badge-green">1-on-1 Request</span>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${ui.formatDate(s.date)}</span>
                    </div>
                    <div style="font-size: 0.88rem; font-weight: 600;">${ui.escape(s.title)}</div>
                  </div>
                  <button class="btn btn-sm btn-olive" data-review-session="${s.id}">Respond</button>
                </div>
              `).join('')}

              ${pendingAmbSessionProposals.map(p => `
                <div style="padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 2px;">
                      <span class="badge badge-orange">Workshop Proposal</span>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${ui.formatDate(p.date)}</span>
                    </div>
                    <div style="font-size: 0.88rem; font-weight: 600;">${ui.escape(p.title)}</div>
                  </div>
                  <button class="btn btn-sm btn-primary" data-review-proposal="${p.id}">Inspect</button>
                </div>
              `).join('')}
            `}
          </div>
        </div>

      </div>

      <!-- Recent System Activity Log -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('clock')} Recent Activity Log</h3>
        </div>
        <div class="card-body" style="padding: 0;">
          <div style="display: flex; flex-direction: column;">
            ${recentLogs.map(log => `
              <div style="padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span class="badge badge-gray">${ui.escape(log.actorRole)}</span>
                  <div>
                    <span style="font-weight: 600; color: var(--text-main);">${ui.escape(log.actorName)}</span>
                    <span style="color: var(--text-secondary); margin: 0 4px;">•</span>
                    <span style="color: var(--color-primary); font-weight: 500;">${ui.escape(log.action)}</span>:
                    <span style="color: var(--text-secondary);">${ui.escape(log.details)}</span>
                  </div>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap;">${ui.formatDateTime(log.timestamp)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    bindMentorDashboardEvents(container, mentor);
  }

  function renderAmbassadorDashboard(container, ambassador, stats, ui) {
    const mentor = window.CC.db.getMentorForAmbassador(ambassador.id);
    const myTasks = window.CC.db.getTasks().filter(t => t.assigneeId === ambassador.id);
    const completedTasks = myTasks.filter(t => t.status === 'Completed');
    const pendingTasks = myTasks.filter(t => t.status !== 'Completed');
    const overdueTasks = myTasks.filter(t => t.status === 'Overdue' || t.isOverdue);
    const upcomingMentorSessions = window.CC.db.getMentorSessions().filter(
      s => (s.ambassadorIds || []).includes(ambassador.id) && s.status === 'Approved'
    );
    const myAmbSessions = window.CC.db.getAmbassadorSessions().filter(s => s.organizerId === ambassador.id);
    const myRegistrations = window.CC.db.getParticipants().filter(p => p.ambassadorId === ambassador.id);
    const verifiedRegistrations = myRegistrations.filter(p => p.verificationStatus === 'Verified');
    const myReports = window.CC.db.getReports().filter(r => r.ambassadorId === ambassador.id);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <div class="badge badge-olive" style="margin-bottom: 6px; width: fit-content;">
            ${ui.icon('award')} Ambassador Portal
          </div>
          <h1 class="section-title">Hello, ${ui.escape(ambassador.name)}</h1>
          <p class="section-subtitle">${ui.escape(ambassador.department)} • ${ui.escape(ambassador.year)}</p>
        </div>
        <div class="section-header-actions">
          <button class="btn btn-primary" id="btn-quick-request-session">
            ${ui.icon('video')} Request Mentor Session
          </button>
          <button class="btn btn-secondary" id="btn-quick-propose-session">
            ${ui.icon('presentation')} Propose Workshop
          </button>
        </div>
      </div>

      <!-- ==========================================================================
           MANDATORY: PROMINENT MY MENTOR CARD ON AMBASSADOR DASHBOARD
           ========================================================================== -->
      ${mentor ? `
        <div class="my-mentor-card">
          <div class="my-mentor-badge">${ui.icon('shield')} My Assigned Mentor</div>
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
                  ${(mentor.expertise || []).map(exp => `<span class="skill-pill">${ui.escape(exp)}</span>`).join('')}
                </div>
              </div>
            </div>
            <div class="my-mentor-actions">
              <button class="btn btn-primary btn-sm" id="btn-contact-my-mentor">
                ${ui.icon('message-square')} Contact Mentor
              </button>
              <button class="btn btn-outline btn-sm" id="btn-view-my-mentor-profile">
                ${ui.icon('users')} View Full Profile
              </button>
            </div>
          </div>
        </div>
      ` : `
        <div class="mentor-alert-missing">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="color: var(--status-amber);">${ui.icon('alert-circle')}</div>
            <div>
              <div style="font-weight: 700; color: var(--text-main);">No Mentor Assigned Yet</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">You do not currently have a faculty mentor assigned to guide your campus activities.</div>
            </div>
          </div>
          <button class="btn btn-olive btn-sm" id="btn-request-mentor-assign">Request Mentor Assignment</button>
        </div>
      `}

      <!-- Metric KPI Cards -->
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Assigned Tasks</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-blue-bg); color: var(--status-blue);">
              ${ui.icon('check-square')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${pendingTasks.length}</span>
            <span class="metric-trend" style="color: ${overdueTasks.length > 0 ? 'var(--status-red)' : 'var(--status-green)'};">
              ${overdueTasks.length > 0 ? `${overdueTasks.length} Overdue!` : `${completedTasks.length} Completed`}
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Verified Registrations</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-green-bg); color: var(--status-green);">
              ${ui.icon('user-check')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${verifiedRegistrations.length}</span>
            <span class="metric-trend" style="color: var(--status-green);">of ${myRegistrations.length} total signups</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Upcoming Mentor Sessions</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-green-bg); color: var(--status-green);">
              ${ui.icon('video')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${upcomingMentorSessions.length}</span>
            <span class="metric-trend" style="color: var(--color-primary);">Scheduled</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Ambassador Workshops</span>
            <div class="metric-icon-wrap" style="background-color: #F3E5F5; color: #7B1FA2;">
              ${ui.icon('presentation')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${myAmbSessions.length}</span>
            <span class="metric-trend" style="color: #7B1FA2;">Organized/Proposed</span>
          </div>
        </div>
      </div>

      <!-- Ambassador Quick Actions Bar -->
      <div class="card" style="margin-bottom: 1.75rem; padding: 1rem 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
            Ambassador Quick Actions:
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <button class="btn btn-sm btn-outline" id="qa-amb-view-tasks">${ui.icon('check-square')} Open Tasks</button>
            <button class="btn btn-sm btn-outline" id="qa-amb-add-reg">${ui.icon('plus')} Add Registration</button>
            <button class="btn btn-sm btn-outline" id="qa-amb-submit-report">${ui.icon('bar-chart-2')} Submit Report</button>
            <button class="btn btn-sm btn-outline" id="qa-amb-request-help">${ui.icon('message-square')} Request Support</button>
          </div>
        </div>
      </div>

      <!-- Split Columns Layout -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.5rem;">
        
        <!-- Assigned Tasks To-Do -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${ui.icon('check-square')} My Active Tasks</h3>
            <button class="btn btn-sm btn-outline" id="btn-goto-tasks">Open Board</button>
          </div>
          <div class="card-body" style="padding: 0;">
            ${pendingTasks.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon" style="color: var(--status-green);">${ui.icon('check-circle')}</div>
                <div class="empty-state-title">No Pending Tasks</div>
                <div class="empty-state-text">You have completed all assigned tasks! Check with your mentor for new initiatives.</div>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column;">
                ${pendingTasks.map(task => `
                  <div style="padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 2px;">
                        ${ui.renderPriorityBadge(task.priority)}
                        ${ui.renderStatusBadge(task.status)}
                      </div>
                      <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-main);">${ui.escape(task.title)}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        Due: ${ui.formatDate(task.deadline)} ${task.isOverdue ? '<span style="color: var(--status-red); font-weight: 700;">(OVERDUE)</span>' : ''}
                      </div>
                    </div>
                    <button class="btn btn-sm btn-outline" data-open-task="${task.id}">Details</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Upcoming Sessions & Deadlines -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${ui.icon('calendar')} Upcoming Sessions</h3>
            <button class="btn btn-sm btn-outline" id="btn-goto-sessions">View All</button>
          </div>
          <div class="card-body" style="padding: 0;">
            ${upcomingMentorSessions.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">${ui.icon('video')}</div>
                <div class="empty-state-title">No Sessions Scheduled</div>
                <div class="empty-state-text">Request a 1-on-1 session with your mentor to get guidance on your semester goals.</div>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column;">
                ${upcomingMentorSessions.map(s => `
                  <div style="padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div class="badge badge-green" style="margin-bottom: 3px;">${ui.escape(s.meetingType)}</div>
                      <div style="font-weight: 600; font-size: 0.88rem;">${ui.escape(s.title)}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        ${ui.formatDate(s.date)} • ${ui.escape(s.startTime)} - ${ui.escape(s.endTime)}
                      </div>
                    </div>
                    <button class="btn btn-sm btn-outline" data-view-session="${s.id}">Join/View</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

      </div>
    `;

    bindAmbassadorDashboardEvents(container, ambassador, mentor);
  }

  function bindMentorDashboardEvents(container, mentor) {
    // Quick Actions
    container.querySelector('#btn-quick-create-task')?.addEventListener('click', () => {
      window.CC.state.setSection('tasks', { action: 'create' });
    });

    container.querySelector('#btn-quick-schedule-session')?.addEventListener('click', () => {
      window.CC.state.setSection('mentor-sessions', { action: 'create' });
    });

    container.querySelector('#qa-view-ambassadors')?.addEventListener('click', () => {
      window.CC.state.setSection('ambassadors');
    });

    container.querySelector('#btn-goto-ambassadors')?.addEventListener('click', () => {
      window.CC.state.setSection('ambassadors');
    });

    container.querySelector('#qa-review-tasks')?.addEventListener('click', () => {
      window.CC.state.setSection('tasks', { filterStatus: 'Submitted' });
    });

    container.querySelector('#qa-review-proposals')?.addEventListener('click', () => {
      window.CC.state.setSection('ambassador-sessions', { filterStatus: 'Pending Mentor Approval' });
    });

    container.querySelector('#qa-review-reports')?.addEventListener('click', () => {
      window.CC.state.setSection('reports');
    });

    container.querySelector('#qa-share-resource')?.addEventListener('click', () => {
      window.CC.state.setSection('resources', { action: 'create' });
    });

    container.querySelector('#qa-post-announcement')?.addEventListener('click', () => {
      window.CC.state.setSection('announcements', { action: 'create' });
    });

    // Dynamic buttons
    container.querySelectorAll('[data-view-ambassador]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-view-ambassador');
        window.CC.sections.ambassadors.openAmbassadorModal(id);
      });
    });

    container.querySelectorAll('[data-review-task]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-review-task');
        window.CC.sections.tasks.openTaskModal(id);
      });
    });

    container.querySelectorAll('[data-review-session]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-review-session');
        window.CC.sections.mentorSessions.openSessionModal(id);
      });
    });

    container.querySelectorAll('[data-review-proposal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-review-proposal');
        window.CC.sections.ambassadorSessions.openSessionModal(id);
      });
    });
  }

  function bindAmbassadorDashboardEvents(container, ambassador, mentor) {
    if (mentor) {
      container.querySelector('#btn-contact-my-mentor')?.addEventListener('click', () => {
        window.CC.state.setSection('communication', { chatWith: mentor.id });
      });

      container.querySelector('#btn-view-my-mentor-profile')?.addEventListener('click', () => {
        window.CC.sections.mentors.openMentorModal(mentor.id);
      });
    }

    container.querySelector('#btn-quick-request-session')?.addEventListener('click', () => {
      window.CC.state.setSection('mentor-sessions', { action: 'request' });
    });

    container.querySelector('#btn-quick-propose-session')?.addEventListener('click', () => {
      window.CC.state.setSection('ambassador-sessions', { action: 'propose' });
    });

    container.querySelector('#qa-amb-view-tasks')?.addEventListener('click', () => {
      window.CC.state.setSection('tasks');
    });

    container.querySelector('#btn-goto-tasks')?.addEventListener('click', () => {
      window.CC.state.setSection('tasks');
    });

    container.querySelector('#qa-amb-add-reg')?.addEventListener('click', () => {
      window.CC.state.setSection('labs-registrations', { action: 'add-participant' });
    });

    container.querySelector('#qa-amb-submit-report')?.addEventListener('click', () => {
      window.CC.state.setSection('reports', { action: 'submit' });
    });

    container.querySelector('#qa-amb-request-help')?.addEventListener('click', () => {
      window.CC.state.setSection('communication', { tab: 'tickets', action: 'create' });
    });

    container.querySelector('#btn-goto-sessions')?.addEventListener('click', () => {
      window.CC.state.setSection('mentor-sessions');
    });

    container.querySelector('#btn-request-mentor-assign')?.addEventListener('click', () => {
      window.CC.ui.showToast("Assignment request logged. A faculty director will assign your mentor.", "info", "Request Sent");
    });

    container.querySelectorAll('[data-open-task]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-task');
        window.CC.sections.tasks.openTaskModal(id);
      });
    });

    container.querySelectorAll('[data-view-session]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-view-session');
        window.CC.sections.mentorSessions.openSessionModal(id);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.dashboard = { render: renderDashboard };
})();
