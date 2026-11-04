/**
 * GDGconnect - Profile & Settings Section
 * Secure User Profile, Password Management, Self-Editing, and Protected DB Operations
 */

(function () {
  'use strict';

  function render(container) {
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    let mentorInfo = null;
    let menteeCount = 0;
    if (currentRole === 'Ambassador') {
      mentorInfo = currentUser.mentorId ? window.CC.db.getMentorById(currentUser.mentorId) : null;
    } else {
      menteeCount = window.CC.db.getAmbassadorsForMentor(currentUser.id).length;
    }

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('settings')} Profile & Settings</h1>
          <p class="section-subtitle">Manage your personal credentials, contact details, account security, and session.</p>
        </div>
      </div>

      <!-- Current Profile Details Card -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('user')} My Account Information</h3>
          <button class="btn btn-sm btn-outline" id="btn-edit-my-details">${ui.icon('edit-2')} Edit Bio & Phone</button>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem;">
            ${ui.renderAvatar(currentUser.avatar, currentUser.name, 'xl')}
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-main); margin: 0;">${ui.escape(currentUser.name)}</h2>
                <span class="badge ${currentRole === 'Mentor' ? 'badge-green' : 'badge-olive'}">${currentRole}</span>
              </div>
              <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 4px;">
                ${ui.escape(currentUser.department || 'B.Tech')} &bull; ${ui.escape(currentUser.institution || 'IIMT University')}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-family-mono); margin-top: 4px;">
                Unique ID: <strong style="color: var(--brand-primary);">${currentUser.id}</strong>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.88rem; margin-bottom: 1.25rem;">
            <div style="background-color: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <span style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-bottom: 2px;">Email Address</span>
              <div style="font-weight: 600; color: var(--text-main); word-break: break-all;">${ui.escape(currentUser.email)}</div>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <span style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-bottom: 2px;">Phone Number</span>
              <div style="font-weight: 600; color: var(--text-main);">${ui.escape(currentUser.phone || 'Not specified')}</div>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <span style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-bottom: 2px;">Role Assignment</span>
              <div style="font-weight: 600; color: var(--text-main);">
                ${currentRole === 'Mentor' ? `${menteeCount} Assigned Ambassadors` : (mentorInfo ? `Mentor: ${mentorInfo.name}` : 'Mentor Pending')}
              </div>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <span style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-bottom: 2px;">Member Since</span>
              <div style="font-weight: 600; color: var(--text-main);">${currentUser.joinedDate ? ui.formatDate(currentUser.joinedDate) : 'Cohort 2026'}</div>
            </div>
          </div>

          <div>
            <span style="color: var(--text-muted); font-size: 0.78rem; font-weight: 600;">Biography & Strengths</span>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-top: 4px; background: var(--bg-subtle); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              ${ui.escape(currentUser.bio || 'Passionate community builder and tech innovator.')}
            </p>
          </div>
        </div>
      </div>

      <!-- Account Security & Password Management Card -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('lock')} Account Security & Password</h3>
          <span class="badge badge-green">End-to-End Encrypted</span>
        </div>
        <div class="card-body">
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Change your password to keep your dashboard secure. You will need your current password to set a new one.
          </p>

          <form id="form-change-password" style="max-width: 520px;">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" for="input-current-pass">Current Password</label>
              <input type="password" id="input-current-pass" class="form-control" placeholder="Enter your current password" required />
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" for="input-new-pass">New Password</label>
              <input type="password" id="input-new-pass" class="form-control" placeholder="At least 6 characters" required />
            </div>
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" for="input-confirm-pass">Confirm New Password</label>
              <input type="password" id="input-confirm-pass" class="form-control" placeholder="Confirm your new password" required />
            </div>
            <button type="submit" class="btn btn-primary" id="btn-save-password">
              ${ui.icon('check-circle')} Update Password
            </button>
          </form>
        </div>
      </div>

      <!-- Active Session & Sign Out Card -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('log-out')} Active Session & Sign Out</h3>
        </div>
        <div class="card-body">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.92rem; color: var(--text-main);">
                <span style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--status-green); display: inline-block;"></span>
                Active Authorized Session
              </div>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
                You are securely logged into GDGconnect as <strong>${ui.escape(currentUser.name)}</strong> (${currentRole}).
              </p>
            </div>
            <button class="btn btn-outline" id="btn-settings-sign-out" style="color: var(--color-danger); border-color: rgba(234, 67, 53, 0.4);">
              ${ui.icon('log-out')} Sign Out of Portal
            </button>
          </div>
        </div>
      </div>

      <!-- Database Management & Backup Controls (Admin Gatekeeper) -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('database')} Storage & Cloud Synchronization</h3>
          <span class="badge badge-gray">Cloud DB Ready</span>
        </div>
        <div class="card-body">
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Export local database backups or connect Google Sheets Cloud Database. Modifications require the Master Administrator Passkey.
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
            <button class="btn btn-outline" id="btn-export-backup-json">
              ${ui.icon('download')} Export JSON Backup
            </button>
            <button class="btn btn-outline" id="btn-admin-sheets-connect" style="color: #34A853; border-color: rgba(52, 168, 83, 0.4);">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Google Sheets Cloud DB
            </button>
            <button class="btn btn-danger-outline" id="btn-admin-reset-data" style="margin-left: auto;">
              ${ui.icon('trash-2')} Reset Database (Admin)
            </button>
          </div>
        </div>
      </div>

      <!-- Production Architecture & Security Roadmap -->
      <div class="card" style="border-left: 4px solid var(--color-primary);">
        <div class="card-header">
          <h3 class="card-title">${ui.icon('shield')} Security & Privacy Architecture</h3>
          <span class="badge badge-blue">Verified</span>
        </div>
        <div class="card-body" style="font-size: 0.88rem; line-height: 1.6; color: var(--text-secondary);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            <div style="background-color: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <strong style="color: var(--text-main);">1. Strict Isolation:</strong>
              <p style="font-size: 0.82rem; margin-top: 4px;">
                Mentors cannot alter or impersonate ambassador credentials. Ambassadors cannot access faculty review portals.
              </p>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <strong style="color: var(--text-main);">2. Data Privacy:</strong>
              <p style="font-size: 0.82rem; margin-top: 4px;">
                Internal WhatsApp numbers and emails are confidential and used solely for university chapter operations.
              </p>
            </div>
            <div style="background-color: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <strong style="color: var(--text-main);">3. Cloud Synchronization:</strong>
              <p style="font-size: 0.82rem; margin-top: 4px;">
                Bi-directional sync via Google Apps Script with 5 core spreadsheet sheets for mentors, ambassadors, tasks, and sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    const ui = window.CC.ui;
    const db = window.CC.db;
    const role = window.CC.state.role;
    const user = window.CC.state.currentUser;

    // Edit permitted details (Bio & Phone)
    container.querySelector('#btn-edit-my-details')?.addEventListener('click', () => {
      openEditDetailsModal(user, role);
    });

    // Change Password Form
    container.querySelector('#form-change-password')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentPass = container.querySelector('#input-current-pass')?.value;
      const newPass = container.querySelector('#input-new-pass')?.value;
      const confirmPass = container.querySelector('#input-confirm-pass')?.value;

      if (!currentPass || !newPass || !confirmPass) {
        ui.showToast("Please fill in all password fields.", "warning");
        return;
      }

      if (newPass !== confirmPass) {
        ui.showToast("New password and confirmation do not match.", "error", "Mismatch");
        return;
      }

      if (newPass.length < 6) {
        ui.showToast("New password must be at least 6 characters.", "warning");
        return;
      }

      const res = db.updateUserPassword(user.id, role, currentPass, newPass);
      if (res.success) {
        ui.showToast("Password updated successfully! Keep your new password safe.", "success", "Password Updated");
        container.querySelector('#form-change-password').reset();
      } else {
        ui.showToast(res.reason || "Failed to update password.", "error", "Update Failed");
      }
    });

    // Sign out button
    container.querySelector('#btn-settings-sign-out')?.addEventListener('click', () => {
      if (window.CC.community) {
        window.CC.community.signOut();
      }
    });

    // Export JSON Backup
    container.querySelector('#btn-export-backup-json')?.addEventListener('click', () => {
      const json = db.exportJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `gdgconnect_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ui.showToast("Database backup downloaded successfully!", "success", "Backup Downloaded");
    });

    // Google Sheets Cloud DB (Admin Protected)
    container.querySelector('#btn-admin-sheets-connect')?.addEventListener('click', () => {
      if (window.CC.openGoogleSheetsModal) {
        window.CC.openGoogleSheetsModal();
      }
    });

    // Reset Database (Admin Protected)
    container.querySelector('#btn-admin-reset-data')?.addEventListener('click', () => {
      const modalHtml = `
        <div class="modal-backdrop">
          <div class="modal-dialog modal-sm" style="max-width: 400px;">
            <div class="modal-header">
              <h3 class="modal-title">🔐 Admin Authentication</h3>
              <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
            </div>
            <div class="modal-body">
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                Resetting the database restores all seed records. Enter the Master Administrator Passkey to proceed:
              </p>
              <div class="form-group" style="margin-bottom: 1rem;">
                <input type="password" id="input-reset-passkey" class="form-control" placeholder="Admin Passkey" />
              </div>
              <button class="btn btn-danger" id="btn-confirm-admin-reset" style="width: 100%; justify-content: center;">
                Verify &amp; Reset Database
              </button>
            </div>
          </div>
        </div>
      `;
      ui.openModal(modalHtml, (modalHost) => {
        modalHost.querySelector('#btn-confirm-admin-reset')?.addEventListener('click', () => {
          const pass = modalHost.querySelector('#input-reset-passkey')?.value;
          if (db.verifyAdminPasscode(pass)) {
            db.reset();
            window.CC.state.init();
            ui.closeModal();
            ui.showToast("Database reset to factory seed successfully.", "success", "Reset Completed");
            render(container);
          } else {
            ui.showToast("Incorrect Master Administrator Passkey.", "error", "Access Denied");
          }
        });
      });
    });
  }

  function openEditDetailsModal(user, role) {
    const ui = window.CC.ui;
    const db = window.CC.db;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md" style="max-width: 500px;">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('edit-2')} Edit My Information</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="form-edit-self">
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label">Full Name (Read-Only)</label>
                <input type="text" class="form-control" value="${ui.escape(user.name)}" disabled style="opacity: 0.7;" />
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label">Phone / WhatsApp Number</label>
                <input type="tel" id="self-phone" class="form-control" value="${ui.escape(user.phone || '')}" placeholder="+91 98765 43210" required />
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label">LinkedIn Profile URL</label>
                <input type="url" id="self-linkedin" class="form-control" value="${ui.escape(user.linkedin || '')}" placeholder="https://www.linkedin.com/in/username" />
              </div>
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label class="form-label">Biography / One-Line Bio</label>
                <textarea id="self-bio" class="form-textarea" rows="3" placeholder="Tell us about yourself and your passions">${ui.escape(user.bio || '')}</textarea>
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      modalHost.querySelector('#form-edit-self')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = modalHost.querySelector('#self-phone')?.value.trim();
        const linkedin = modalHost.querySelector('#self-linkedin')?.value.trim();
        const bio = modalHost.querySelector('#self-bio')?.value.trim();

        if (role === 'Mentor') {
          db.updateMentor(user.id, { phone, linkedin, bio });
        } else {
          db.updateAmbassador(user.id, { phone, linkedin, bio });
        }
        window.CC.state.refreshCurrentUserData();
        ui.closeModal();
        ui.showToast("Your details have been saved!", "success", "Profile Updated");
        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.profileSettings = { render };
})();
