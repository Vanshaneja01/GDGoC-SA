/**
 * GDGconnect - Reports & Progress Section
 * Weekly progress reports, mentor reviews, and dynamic metric calculations
 */

(function () {
  'use strict';

  function render(container, params = null) {
    if (params && params.action === 'submit') {
      setTimeout(() => openSubmitReportModal(), 50);
    }

    const reports = window.CC.db.getReports();
    const stats = window.CC.db.getStatistics();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('bar-chart-2')} Reports & Progress</h1>
          <p class="section-subtitle">Weekly milestone reporting, outreach statistics, and faculty mentor evaluations.</p>
        </div>
        <div class="section-header-actions">
          ${currentRole === 'Ambassador' ? `
            <button class="btn btn-primary" id="btn-submit-report-top">
              ${ui.icon('plus')} Submit Weekly Report
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Live Dynamic Metric Calculation Cards -->
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Task Completion Rate</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-green-bg); color: var(--status-green);">
              ${ui.icon('check-circle')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${stats.taskCompletionRate}%</span>
            <span class="metric-trend" style="color: var(--status-green);">${stats.completedTasks}/${stats.totalTasks} Done</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Overdue Tasks</span>
            <div class="metric-icon-wrap" style="background-color: ${stats.overdueTasks > 0 ? 'var(--status-red-bg)' : 'var(--bg-subtle)'}; color: ${stats.overdueTasks > 0 ? 'var(--status-red)' : 'var(--text-muted)'};">
              ${ui.icon('alert-circle')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value" style="color: ${stats.overdueTasks > 0 ? 'var(--status-red)' : 'var(--text-main)'};">${stats.overdueTasks}</span>
            <span class="metric-trend" style="color: ${stats.overdueTasks > 0 ? 'var(--status-red)' : 'var(--status-green)'};">
              ${stats.overdueTasks > 0 ? 'Requires attention' : 'On schedule'}
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Registrations Verification</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-blue-bg); color: var(--status-blue);">
              ${ui.icon('user-check')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${stats.verificationRate}%</span>
            <span class="metric-trend" style="color: var(--status-blue);">${stats.verifiedParticipants}/${stats.totalParticipants} Verified</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Progress Reports Filed</span>
            <div class="metric-icon-wrap" style="background-color: #F3E5F5; color: #7B1FA2;">
              ${ui.icon('bar-chart-2')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${stats.totalReports}</span>
            <span class="metric-trend" style="color: #7B1FA2;">${stats.pendingReports} pending review</span>
          </div>
        </div>
      </div>

      <!-- Reports List -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem;">
        ${reports.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${ui.icon('bar-chart-2')}</div>
            <div class="empty-state-title">No Reports Filed Yet</div>
            <div class="empty-state-text">Weekly progress reports submitted by ambassadors will appear here for review.</div>
          </div>
        ` : reports.map(r => {
          const amb = window.CC.db.getAmbassadorById(r.ambassadorId);
          const mentor = window.CC.db.getMentorById(r.mentorId);
          const isAssignedMentor = currentRole === 'Mentor' && currentUser.id === r.mentorId;

          return `
            <div class="report-card">
              <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <span class="badge badge-gray" style="font-family: var(--font-family-mono); font-size: 0.75rem;">${r.id}</span>
                  <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin: 0;">${ui.escape(r.period)}</h3>
                  ${ui.renderStatusBadge(r.status)}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  Submitted ${ui.formatDateTime(r.submittedAt)}
                </div>
              </div>

              <!-- Author & Mentor Chips -->
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; font-size: 0.85rem;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="color: var(--text-muted);">Ambassador:</span>
                  ${amb ? ui.renderAvatar(amb.avatar, amb.name, 'sm') : ''}
                  <strong>${amb ? ui.escape(amb.name) : 'Ambassador'}</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="color: var(--text-muted);">Reviewing Mentor:</span>
                  ${mentor ? ui.renderAvatar(mentor.avatar, mentor.name, 'sm') : ''}
                  <strong>${mentor ? ui.escape(mentor.name) : 'Mentor'}</strong>
                </div>
                <div style="margin-left: auto;">
                  <span class="badge badge-green" style="font-size: 0.75rem;">+${r.registrationsGained || 0} Registrations this week</span>
                </div>
              </div>

              <!-- Report Body Content -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); font-size: 0.85rem; line-height: 1.45;">
                <div>
                  <strong style="color: var(--text-main);">Completed Tasks:</strong>
                  <p style="color: var(--text-secondary); margin-top: 3px;">${ui.escape(r.completedTasks)}</p>
                </div>
                <div>
                  <strong style="color: var(--text-main);">Activities & Sessions:</strong>
                  <p style="color: var(--text-secondary); margin-top: 3px;">${ui.escape(r.activities)}</p>
                </div>
                <div>
                  <strong style="color: var(--text-main);">Challenges Encountered:</strong>
                  <p style="color: var(--text-secondary); margin-top: 3px;">${ui.escape(r.challenges || 'None')}</p>
                </div>
                <div>
                  <strong style="color: var(--text-main);">Next Week's Plan:</strong>
                  <p style="color: var(--text-secondary); margin-top: 3px;">${ui.escape(r.nextSteps || 'Continuing milestones')}</p>
                </div>
              </div>

              <!-- Support Required -->
              ${r.supportRequired ? `
                <div style="font-size: 0.85rem; color: var(--text-main);">
                  <strong>Support Required from Mentor:</strong> <span style="color: var(--color-primary);">${ui.escape(r.supportRequired)}</span>
                </div>
              ` : ''}

              <!-- Mentor Feedback Display -->
              ${r.mentorFeedback ? `
                <div class="report-feedback-box">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <strong style="font-size: 0.85rem; color: var(--text-main);">Faculty Evaluation & Rating:</strong>
                    <div class="rating-stars">
                      ${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}
                    </div>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${ui.escape(r.mentorFeedback)}</p>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Reviewed ${ui.formatDateTime(r.reviewedAt)}</div>
                </div>
              ` : ''}

              <!-- Action Bar (Mentor Review Buttons) -->
              ${isAssignedMentor && (r.status === 'Submitted' || r.status === 'Under Review') ? `
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
                  <button class="btn btn-sm btn-primary" data-review-report="${r.id}">
                    ${ui.icon('check-circle')} Evaluate & Approve Report
                  </button>
                  <button class="btn btn-sm btn-outline" data-request-report-revision="${r.id}">
                    Request Revision
                  </button>
                </div>
              ` : ''}

            </div>
          `;
        }).join('')}
      </div>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    container.querySelector('#btn-submit-report-top')?.addEventListener('click', () => {
      openSubmitReportModal();
    });

    container.querySelectorAll('[data-review-report]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-review-report');
        openReviewReportModal(id);
      });
    });

    container.querySelectorAll('[data-request-report-revision]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-request-report-revision');
        window.CC.db.updateReport(id, { status: 'Changes Requested' });
        window.CC.ui.showToast("Report status changed to Changes Requested.", "info");
        render(container);
      });
    });
  }

  function openSubmitReportModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;
    const mentor = window.CC.db.getMentorForAmbassador(currentUser.id);

    if (!mentor) {
      ui.showToast("Please ensure you are assigned a mentor before submitting a progress report.", "warning");
      return;
    }

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('bar-chart-2')} Submit Weekly Progress Report</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <div style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--color-primary-light); margin-bottom: 1.25rem;">
              Reporting to: <strong>${ui.escape(mentor.name)}</strong> (${ui.escape(mentor.department)})
            </div>

            <form id="submit-report-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Reporting Period</label>
                  <input type="text" class="form-control" name="period" value="Week ${getWeekNumber(new Date())} - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">New Registrations Sourced This Week</label>
                  <input type="number" class="form-control" name="registrationsGained" min="0" value="12" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Completed Tasks & Outreach Summary</label>
                <textarea class="form-textarea" name="completedTasks" placeholder="Key deliverables, lecture announcements, tabling hours..." required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Activities & Workshops Held</label>
                <textarea class="form-textarea" name="activities" placeholder="Session details, attendance numbers, participant interest..." required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Challenges Faced</label>
                <input type="text" class="form-control" name="challenges" placeholder="e.g. Schedule conflicts, lab access issues, flyer printing budget">
              </div>

              <div class="form-group">
                <label class="form-label">Support Required from Faculty Mentor</label>
                <input type="text" class="form-control" name="supportRequired" placeholder="What specific help do you need from your mentor?">
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Next Week's Action Plan</label>
                <textarea class="form-textarea" name="nextSteps" placeholder="Target goals for next week..." required></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#submit-report-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const newReport = window.CC.db.addReport({
          period: formData.get('period').trim(),
          ambassadorId: currentUser.id,
          mentorId: mentor.id,
          completedTasks: formData.get('completedTasks').trim(),
          registrationsGained: parseInt(formData.get('registrationsGained'), 10) || 0,
          activities: formData.get('activities').trim(),
          challenges: formData.get('challenges').trim(),
          supportRequired: formData.get('supportRequired').trim(),
          nextSteps: formData.get('nextSteps').trim(),
          status: 'Submitted'
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          'Ambassador',
          'Submitted Weekly Report',
          `Submitted ${newReport.period} (${newReport.id}) for mentor evaluation.`
        );

        window.CC.db.addNotification(
          mentor.id,
          "New Weekly Report Submitted",
          `${currentUser.name} submitted progress report for ${newReport.period}.`,
          "report_submission",
          newReport.id
        );

        ui.closeModal();
        ui.showToast("Weekly progress report submitted successfully!", "success", "Report Sent");
        
        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  function openReviewReportModal(reportId) {
    const r = window.CC.db.getReportById(reportId);
    if (!r) return;

    const ui = window.CC.ui;
    const amb = window.CC.db.getAmbassadorById(r.ambassadorId);
    const currentUser = window.CC.state.currentUser;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('check-circle')} Evaluate & Approve Report</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Evaluating <strong>${ui.escape(r.period)}</strong> submitted by <strong>${amb ? ui.escape(amb.name) : 'Ambassador'}</strong>.
            </p>

            <form id="review-report-form">
              <div class="form-group">
                <label class="form-label form-label-required">Rating (1 to 5 Stars)</label>
                <select class="form-select" id="report-review-rating" name="rating">
                  <option value="5" selected>★★★★★ 5 Stars (Exceptional Momentum)</option>
                  <option value="4">★★★★☆ 4 Stars (Strong Progress)</option>
                  <option value="3">★★★☆☆ 3 Stars (Satisfactory)</option>
                  <option value="2">★★☆☆☆ 2 Stars (Needs Improvement)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Constructive Faculty Feedback</label>
                <textarea class="form-textarea" id="report-review-comments" placeholder="Highlight strengths, address support requests, and guide next steps..." required>Terrific progress this week! Intranet announcement submitted today. High quality deliverables.</textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Approve Report</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#review-report-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const rating = parseInt(modalHost.querySelector('#report-review-rating').value, 10) || 5;
        const comments = modalHost.querySelector('#report-review-comments').value.trim();

        window.CC.db.updateReport(r.id, {
          status: 'Approved',
          rating,
          mentorFeedback: comments,
          reviewedAt: new Date().toISOString()
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          'Mentor',
          'Approved Progress Report',
          `Approved ${r.period} for ${amb ? amb.name : 'Ambassador'} with ${rating} stars.`
        );

        window.CC.db.addNotification(
          r.ambassadorId,
          "Weekly Report Approved!",
          `Dr./Prof. ${currentUser.name} approved your ${r.period} with a ${rating}-star evaluation.`,
          "report_approval",
          r.id
        );

        ui.closeModal();
        ui.showToast("Report evaluated and approved with positive feedback!", "success", "Approved");

        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.reports = {
    render,
    openSubmitReportModal,
    openReviewReportModal
  };
})();
