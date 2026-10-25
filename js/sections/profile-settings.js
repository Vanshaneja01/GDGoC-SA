/**
 * CampusConnect - Profile & Settings Section
 * Identity switcher, user self-editing, JSON backup & restore, and production architecture documentation
 */

(function () {
  'use strict';

  function render(container) {
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;
    const mentors = window.CC.db.getMentors();
    const ambassadors = window.CC.db.getAmbassadors();
    const stats = window.CC.db.getStatistics();

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('settings')} Profile & Settings</h1>
          <p class="section-subtitle">Manage your personal credentials, switch demo identities, configure preferences, and manage database state.</p>
        </div>
      </div>

      <!-- Quick Identity & Role Switcher Card (FOR DEMO TESTING BOTH ROLES) -->
      <div class="card" style="margin-bottom: 2rem; border: 2px solid var(--color-primary-ring);">
        <div class="card-header" style="background-color: var(--color-primary-light);">
          <h3 class="card-title" style="color: var(--color-primary);">
            ${ui.icon('repeat')} Demo Role & Persona Switcher
          </h3>
          <span class="badge badge-green">Live Role: ${currentRole}</span>
        </div>
        <div class="card-body">
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Test the entire portal from either perspective with instant role-based permissions and interface customization.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            
            <!-- Mentors List -->
            <div style="padding: 1rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--color-primary); margin-bottom: 0.75rem;">
                Faculty Mentors (Reviewer Role)
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${mentors.map(m => `
                  <button class="btn btn-sm ${currentRole === 'Mentor' && currentUser.id === m.id ? 'btn-primary' : 'btn-outline'}" 
                    style="justify-content: flex-start; text-align: left;" data-switch-user="Mentor:${m.id}">
                    ${ui.renderAvatar(m.avatar, m.name, 'sm')}
                    <div style="margin-left: 0.5rem; overflow: hidden; text-overflow: ellipsis;">
                      <strong>${ui.escape(m.name)}</strong> (${m.id})
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Ambassadors List -->
            <div style="padding: 1rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--color-olive); margin-bottom: 0.75rem;">
                Student Ambassadors (Outreach Role)
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${ambassadors.map(a => `
                  <button class="btn btn-sm ${currentRole === 'Ambassador' && currentUser.id === a.id ? 'btn-olive' : 'btn-outline'}" 
                    style="justify-content: flex-start; text-align: left;" data-switch-user="Ambassador:${a.id}">
                    ${ui.renderAvatar(a.avatar, a.name, 'sm')}
                    <div style="margin-left: 0.5rem; overflow: hidden; text-overflow: ellipsis;">
                      <strong>${ui.escape(a.name)}</strong> (${a.id})
                      ${!a.mentorId ? '<span class="badge badge-amber" style="font-size: 0.65rem; margin-left: 4px;">No Mentor</span>' : ''}
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Current Profile Details & Permitted Self-Editing -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('users')} My Active Account Information</h3>
          <button class="btn btn-sm btn-outline" id="btn-edit-my-details">${ui.icon('edit-2')} Edit Permitted Info</button>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; margin-bottom: 1.25rem;">
            ${ui.renderAvatar(currentUser.avatar, currentUser.name, 'xl')}
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <h2 style="font-size: 1.35rem; font-weight: 700;">${ui.escape(currentUser.name)}</h2>
                <span class="badge ${currentRole === 'Mentor' ? 'badge-green' : 'badge-olive'}">${currentRole}</span>
              </div>
              <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 2px;">
                ${ui.escape(currentUser.department)} • ${ui.escape(currentUser.institution)}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-family-mono); margin-top: 2px;">
                Unique ID: ${currentUser.id}
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; font-size: 0.88rem;">
            <div style="background-color: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md);">
              <span style="color: var(--text-muted); font-size: 0.75rem;">Email Address</span>
              <div style="font-weight: 600; color: var(--text-main); margin-top: 2px;">${ui.escape(currentUser.email)}</div>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md);">
              <span style="color: var(--text-muted); font-size: 0.75rem;">Phone Number</span>
              <div style="font-weight: 600; color: var(--text-main); margin-top: 2px;">${ui.escape(currentUser.phone)}</div>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md);">
              <span style="color: var(--text-muted); font-size: 0.75rem;">Member Since</span>
              <div style="font-weight: 600; color: var(--text-main); margin-top: 2px;">${ui.formatDate(currentUser.joinedDate)}</div>
            </div>
          </div>

          <div style="margin-top: 1.25rem;">
            <span style="color: var(--text-muted); font-size: 0.78rem;">Biography</span>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-top: 3px;">
              ${ui.escape(currentUser.bio)}
            </p>
          </div>
        </div>
      </div>

      <!-- Database Management & Backup Controls -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('settings')} Storage & Data Management</h3>
          <span class="badge badge-gray">localStorage Connected</span>
        </div>
        <div class="card-body">
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            All entities (mentors, ambassadors, tasks, sessions, labs, participants, and logs) are dynamically persisted in your browser's local storage.
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
            <button class="btn btn-primary" id="btn-export-backup-json">
              ${ui.icon('download')} Export Full Database (JSON)
            </button>
            <button class="btn btn-outline" id="btn-import-backup-json">
              ${ui.icon('upload')} Restore / Import Backup (JSON)
            </button>
            <button class="btn btn-danger-outline" id="btn-reset-sample-data" style="margin-left: auto;">
              ${ui.icon('trash-2')} Reset to Fresh Sample Data
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================================================
           PRODUCTION ARCHITECTURE & SECURITY SPECIFICATIONS
           ========================================================================== -->
      <div class="card" style="border-left: 4px solid var(--color-primary);">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('shield')} Production Architecture & Security Roadmap</h3>
          <span class="badge badge-blue">SaaS Specification</span>
        </div>
        <div class="card-body" style="font-size: 0.88rem; line-height: 1.6; color: var(--text-secondary);">
          <p style="margin-bottom: 0.75rem;">
            This prototype delivers an end-to-end, fully functional UI and state machine using browser <code>localStorage</code>. For enterprise campus deployment, the application is architected to transition to a cloud backend (e.g., Supabase / Firebase / Node.js + PostgreSQL) with the following safeguards:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div style="background-color: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <strong style="color: var(--text-main);">1. Strict Authentication & RLS:</strong>
              <p style="font-size: 0.82rem; margin-top: 4px;">
                Row-Level Security policies on participant tables to enforce that student ambassadors only view and edit participants enrolled under their assigned labs.
              </p>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <strong style="color: var(--text-main);">2. FERPA & Student Data Protection:</strong>
              <p style="font-size: 0.82rem; margin-top: 4px;">
                Participant phone numbers and emails are encrypted at rest with AES-256 and subject to university data retention schedules.
              </p>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <strong style="color: var(--text-main);">3. Real-Time WebSockets:</strong>
              <p style="font-size: 0.82rem; margin-top: 4px;">
                Direct messaging, task approval triggers, and schedule notifications synchronized instantaneously via WebSocket channels.
              </p>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <strong style="color: var(--text-main);">4. Object Storage for Deliverables:</strong>
              <p style="font-size: 0.82rem; margin-top: 4px;">
                Task submission attachments, lecture slide decks, and waiver documents stored via S3-compatible buckets with pre-signed upload URLs.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    // Identity switcher buttons
    container.querySelectorAll('[data-switch-user]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [role, id] = btn.getAttribute('data-switch-user').split(':');
        window.CC.state.setRoleAndUser(role, id);
        window.CC.ui.showToast(`Switched active view to ${role}: ${id}`, "success", "Role Switched");
        render(container);
      });
    });

    // Edit permitted details
    container.querySelector('#btn-edit-my-details')?.addEventListener('click', () => {
      const role = window.CC.state.role;
      const user = window.CC.state.currentUser;
      if (role === 'Mentor') {
        window.CC.sections.mentors.openEditMentorModal(user);
      } else {
        window.CC.sections.ambassadors.openEditAmbassadorModal(user);
      }
    });

    // Export JSON
    container.querySelector('#btn-export-backup-json')?.addEventListener('click', () => {
      const json = window.CC.db.exportJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `campusconnect_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.CC.ui.showToast("Database backup downloaded!", "success", "JSON Exported");
    });

    // Import JSON
    container.querySelector('#btn-import-backup-json')?.addEventListener('click', () => {
      openImportJSONModal();
    });

    // Reset sample data
    container.querySelector('#btn-reset-sample-data')?.addEventListener('click', () => {
      window.CC.ui.confirm(
        "Are you sure you want to reset all data back to the default sample seed? Any newly created tasks, participants, and messages will be reset.",
        () => {
          window.CC.db.reset();
          window.CC.state.init();
          window.CC.ui.showToast("Sample database restored successfully!", "success", "Reset Completed");
          render(container);
        },
        "Reset Sample Data",
        "Yes, Reset Everything"
      );
    });
  }

  function openImportJSONModal() {
    const ui = window.CC.ui;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('upload')} Restore Database from JSON</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Select JSON Backup File</label>
              <input type="file" class="form-control" id="json-backup-file" accept=".json,application/json">
            </div>
            <div class="form-group">
              <label class="form-label">Or Paste JSON String</label>
              <textarea class="form-textarea" id="json-backup-text" placeholder='{"mentors": [...], "ambassadors": [...]}'></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Cancel</button>
            <button class="btn btn-primary" id="btn-restore-json-confirm">Restore Database</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const fileInput = modalHost.querySelector('#json-backup-file');
      const textInput = modalHost.querySelector('#json-backup-text');

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            textInput.value = event.target.result;
          };
          reader.readAsText(file);
        }
      });

      modalHost.querySelector('#btn-restore-json-confirm')?.addEventListener('click', () => {
        const json = textInput.value.trim();
        if (!json) {
          ui.showToast("Please provide JSON backup content.", "warning");
          return;
        }

        const res = window.CC.db.importJSON(json);
        if (res.success) {
          window.CC.state.init();
          ui.closeModal();
          ui.showToast("Database successfully restored from backup!", "success", "Restore Complete");
          const mainContainer = document.querySelector('#main-content-viewport');
          if (mainContainer) render(mainContainer);
        } else {
          ui.showToast(`Import failed: ${res.error}`, "error", "Invalid JSON");
        }
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.profileSettings = { render };
})();
