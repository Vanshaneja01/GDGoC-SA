/**
 * CampusConnect - Labs & Registrations Section
 * Dedicated lab targets, participant CRUD, duplicate detection, CSV export & import, bulk verification
 */

(function () {
  'use strict';

  let currentLabFilter = 'all';
  let currentStatusFilter = 'all';
  let currentSearch = '';
  let selectedParticipantIds = new Set();

  function render(container, params = null) {
    if (params && params.action === 'add-participant') {
      setTimeout(() => openAddParticipantModal(), 50);
    }

    const labs = window.CC.db.getLabs();
    const participants = window.CC.db.getParticipants();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const filtered = participants.filter(p => {
      const matchesSearch = !currentSearch ||
        p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(currentSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(currentSearch.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(currentSearch.toLowerCase());

      const matchesLab = currentLabFilter === 'all' || p.labId === currentLabFilter;
      const matchesStatus = currentStatusFilter === 'all' || p.verificationStatus === currentStatusFilter;

      return matchesSearch && matchesLab && matchesStatus;
    });

    const totalReg = participants.length;
    const verifiedReg = participants.filter(p => p.verificationStatus === 'Verified').length;
    const pendingReg = participants.filter(p => p.verificationStatus === 'Pending Verification').length;
    const incompleteReg = participants.filter(p => p.verificationStatus === 'Incomplete' || p.verificationStatus === 'Awaiting Information').length;
    const verRate = totalReg > 0 ? Math.round((verifiedReg / totalReg) * 100) : 0;

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('flask')} Labs & Participant Registrations</h1>
          <p class="section-subtitle">Manage campus innovation labs, track student participant rosters, and verify credentials.</p>
        </div>
        <div class="section-header-actions">
          <button class="btn btn-outline" id="btn-export-csv">
            ${ui.icon('download')} Export CSV
          </button>
          <button class="btn btn-outline" id="btn-import-csv">
            ${ui.icon('upload')} Import CSV
          </button>
          <button class="btn btn-primary" id="btn-add-participant-top">
            ${ui.icon('plus')} Register Participant
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Total Registrations</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-blue-bg); color: var(--status-blue);">
              ${ui.icon('users')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${totalReg}</span>
            <span class="metric-trend" style="color: var(--status-blue);">Across ${labs.length} Labs</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Verified Participants</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-green-bg); color: var(--status-green);">
              ${ui.icon('check-circle')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${verifiedReg}</span>
            <span class="metric-trend" style="color: var(--status-green);">${verRate}% Verification Rate</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Pending Verification</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-amber-bg); color: var(--status-amber);">
              ${ui.icon('clock')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${pendingReg}</span>
            <span class="metric-trend" style="color: var(--status-amber);">Needs Review</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Incomplete / Follow-up</span>
            <div class="metric-icon-wrap" style="background-color: var(--status-orange-bg); color: var(--status-orange);">
              ${ui.icon('alert-circle')}
            </div>
          </div>
          <div class="metric-value-row">
            <span class="metric-value">${incompleteReg}</span>
            <span class="metric-trend" style="color: var(--status-orange);">Missing Info</span>
          </div>
        </div>
      </div>

      <!-- Labs Overview Row (Target Completion Bars) -->
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.85rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
        ${ui.icon('flask')} Active Labs & Enrollment Targets
      </h3>
      <div class="labs-summary-grid">
        ${labs.map(lab => {
          const labParts = participants.filter(p => p.labId === lab.id);
          const labVerified = labParts.filter(p => p.verificationStatus === 'Verified').length;
          const target = lab.target || 100;
          const percent = Math.min(100, Math.round((labParts.length / target) * 100));
          const mentor = window.CC.db.getMentorById(lab.mentorId);

          return `
            <div class="lab-summary-card">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;">
                <div>
                  <span class="badge badge-gray" style="font-family: var(--font-family-mono); font-size: 0.68rem;">${lab.id}</span>
                  <div style="font-weight: 700; font-size: 0.95rem; margin-top: 3px; color: var(--text-main);">${ui.escape(lab.name)}</div>
                </div>
                ${ui.renderStatusBadge(lab.status)}
              </div>

              <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.35;">
                ${ui.escape(lab.description)}
              </div>

              <div style="font-size: 0.75rem; color: var(--text-muted);">
                <strong>Faculty Lead:</strong> ${mentor ? ui.escape(mentor.name) : 'Mentor'}
              </div>

              <!-- Target progress bar -->
              <div style="margin-top: auto; display: flex; flex-direction: column; gap: 0.3rem;">
                <div class="lab-target-row">
                  <span style="color: var(--text-secondary);">Enrollment: <strong>${labParts.length} / ${target}</strong></span>
                  <span style="font-weight: 700; color: var(--color-primary);">${percent}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${percent}%;"></div>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                  <span>Verified: ${labVerified}</span>
                  <span>Schedule: ${ui.escape(lab.schedule || 'TBA')}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Filter Bar for Participant Table -->
      <div class="filter-bar" style="margin-top: 1.5rem;">
        <div class="filter-group">
          <div class="filter-search-wrap">
            ${ui.icon('search')}
            <input type="text" class="filter-search-input" id="part-search-input" 
              placeholder="Search participant by name, email, ID..." value="${ui.escape(currentSearch)}">
          </div>
          <select class="filter-select" id="part-filter-lab">
            <option value="all" ${currentLabFilter === 'all' ? 'selected' : ''}>All Labs</option>
            ${labs.map(l => `<option value="${l.id}" ${currentLabFilter === l.id ? 'selected' : ''}>${l.id}: ${ui.escape(l.name)}</option>`).join('')}
          </select>
          <select class="filter-select" id="part-filter-status">
            <option value="all" ${currentStatusFilter === 'all' ? 'selected' : ''}>All Verification Statuses</option>
            <option value="Verified" ${currentStatusFilter === 'Verified' ? 'selected' : ''}>Verified</option>
            <option value="Pending Verification" ${currentStatusFilter === 'Pending Verification' ? 'selected' : ''}>Pending Verification</option>
            <option value="Incomplete" ${currentStatusFilter === 'Incomplete' ? 'selected' : ''}>Incomplete</option>
            <option value="Awaiting Information" ${currentStatusFilter === 'Awaiting Information' ? 'selected' : ''}>Awaiting Information</option>
            <option value="Rejected" ${currentStatusFilter === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>

        <!-- Bulk Action Controls -->
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted);" id="bulk-selection-count">
            ${selectedParticipantIds.size} selected
          </span>
          <button class="btn btn-sm btn-primary" id="btn-bulk-verify" ${selectedParticipantIds.size === 0 ? 'disabled' : ''}>
            ${ui.icon('check-circle')} Bulk Verify
          </button>
          <button class="btn btn-sm btn-outline" id="btn-bulk-reject" ${selectedParticipantIds.size === 0 ? 'disabled' : ''}>
            Bulk Reject
          </button>
          <button class="btn btn-sm btn-danger-outline" id="btn-bulk-delete" ${selectedParticipantIds.size === 0 ? 'disabled' : ''}>
            ${ui.icon('trash-2')}
          </button>
        </div>
      </div>

      <!-- Participant Roster Table -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px;">
                <input type="checkbox" id="checkbox-select-all" ${filtered.length > 0 && selectedParticipantIds.size === filtered.length ? 'checked' : ''}>
              </th>
              <th>Participant ID & Name</th>
              <th>Email & Contact</th>
              <th>Assigned Lab</th>
              <th>Sourcing Ambassador</th>
              <th>Verification Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                  No participant registrations match the current filters.
                </td>
              </tr>
            ` : filtered.map(p => {
              const amb = window.CC.db.getAmbassadorById(p.ambassadorId);
              const isChecked = selectedParticipantIds.has(p.id);

              return `
                <tr>
                  <td>
                    <input type="checkbox" class="part-row-checkbox" data-part-id="${p.id}" ${isChecked ? 'checked' : ''}>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${ui.escape(p.name)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-family-mono);">${p.id}</div>
                  </td>
                  <td>
                    <div><a href="mailto:${ui.escape(p.email)}" style="color: var(--color-primary);">${ui.escape(p.email)}</a></div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${ui.escape(p.phone || 'No phone provided')}</div>
                  </td>
                  <td>
                    <span class="badge badge-gray" style="font-weight: 600;">${ui.escape(p.labId)}</span>
                  </td>
                  <td>
                    ${amb ? `
                      <span style="font-size: 0.85rem; font-weight: 500;">${ui.escape(amb.name)}</span>
                    ` : '<span style="color: var(--text-muted);">Direct</span>'}
                  </td>
                  <td>
                    ${ui.renderStatusBadge(p.verificationStatus)}
                  </td>
                  <td>
                    <div style="font-size: 0.82rem;">${ui.formatDate(p.registeredAt)}</div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <button class="btn btn-sm btn-outline" data-edit-part="${p.id}" title="Edit Registration">
                        ${ui.icon('edit-2')}
                      </button>
                      <button class="btn btn-sm btn-outline" data-inspect-part="${p.id}" title="View Notes">
                        ${ui.icon('info')}
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindEvents(container, filtered);
  }

  function bindEvents(container, filtered) {
    const searchInput = container.querySelector('#part-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        render(container);
      });
    }

    const labSelect = container.querySelector('#part-filter-lab');
    if (labSelect) {
      labSelect.addEventListener('change', (e) => {
        currentLabFilter = e.target.value;
        render(container);
      });
    }

    const statusSelect = container.querySelector('#part-filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        currentStatusFilter = e.target.value;
        render(container);
      });
    }

    // Top buttons
    container.querySelector('#btn-add-participant-top')?.addEventListener('click', () => {
      openAddParticipantModal();
    });

    container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
      exportParticipantsCSV(filtered);
    });

    container.querySelector('#btn-import-csv')?.addEventListener('click', () => {
      openImportCSVModal();
    });

    // Checkbox multi-select
    const selectAllCheckbox = container.querySelector('#checkbox-select-all');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          filtered.forEach(p => selectedParticipantIds.add(p.id));
        } else {
          selectedParticipantIds.clear();
        }
        render(container);
      });
    }

    container.querySelectorAll('.part-row-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = cb.getAttribute('data-part-id');
        if (e.target.checked) {
          selectedParticipantIds.add(id);
        } else {
          selectedParticipantIds.delete(id);
        }
        render(container);
      });
    });

    // Bulk actions
    container.querySelector('#btn-bulk-verify')?.addEventListener('click', () => {
      const count = window.CC.db.bulkUpdateParticipantStatus(Array.from(selectedParticipantIds), 'Verified');
      window.CC.ui.showToast(`Verified ${count} participant registrations!`, "success", "Bulk Update");
      selectedParticipantIds.clear();
      render(container);
    });

    container.querySelector('#btn-bulk-reject')?.addEventListener('click', () => {
      const count = window.CC.db.bulkUpdateParticipantStatus(Array.from(selectedParticipantIds), 'Rejected');
      window.CC.ui.showToast(`Rejected ${count} participant registrations.`, "info", "Bulk Update");
      selectedParticipantIds.clear();
      render(container);
    });

    container.querySelector('#btn-bulk-delete')?.addEventListener('click', () => {
      window.CC.ui.confirm(
        `Are you sure you want to delete ${selectedParticipantIds.size} participant records? This cannot be undone.`,
        () => {
          selectedParticipantIds.forEach(id => window.CC.db.deleteParticipant(id));
          window.CC.ui.showToast("Selected registrations deleted.", "info");
          selectedParticipantIds.clear();
          render(container);
        },
        "Delete Registrations"
      );
    });

    // Row actions
    container.querySelectorAll('[data-edit-part]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-part');
        openEditParticipantModal(id);
      });
    });

    container.querySelectorAll('[data-inspect-part]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-inspect-part');
        openInspectParticipantModal(id);
      });
    });
  }

  function openAddParticipantModal() {
    const ui = window.CC.ui;
    const labs = window.CC.db.getLabs();
    const currentUser = window.CC.state.currentUser;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('plus')} Register New Lab Participant</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <div id="duplicate-warning" style="display: none; padding: 0.75rem 1rem; border-radius: var(--radius-md); background-color: var(--status-red-bg); color: var(--status-red); font-size: 0.85rem; margin-bottom: 1rem;">
            </div>

            <form id="add-participant-form">
              <div class="form-group">
                <label class="form-label form-label-required">Full Name</label>
                <input type="text" class="form-control" name="name" placeholder="Student first and last name" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Email Address</label>
                  <input type="email" class="form-control" id="new-part-email" name="email" placeholder="student@campusconnect.edu" required>
                  <span class="form-hint">Used for automatic duplicate detection within each lab.</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="text" class="form-control" name="phone" placeholder="+1 (555) 000-0000">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Assign to Lab</label>
                  <select class="form-select" id="new-part-lab" name="labId" required>
                    ${labs.map(l => `<option value="${l.id}">${l.id}: ${ui.escape(l.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Verification Status</label>
                  <select class="form-select" name="verificationStatus" required>
                    <option value="Pending Verification" selected>Pending Verification</option>
                    <option value="Verified">Verified</option>
                    <option value="Incomplete">Incomplete</option>
                    <option value="Awaiting Information">Awaiting Information</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Notes / Academic Prerequisites</label>
                <textarea class="form-textarea" name="notes" placeholder="Major, year of study, prerequisites completed..."></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Save Registration</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#add-participant-form');
      const warningBox = modalHost.querySelector('#duplicate-warning');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const email = formData.get('email').trim();
        const labId = formData.get('labId');

        const result = window.CC.db.addParticipant({
          name: formData.get('name').trim(),
          email,
          phone: formData.get('phone').trim(),
          labId,
          ambassadorId: currentUser.id,
          verificationStatus: formData.get('verificationStatus'),
          notes: formData.get('notes').trim()
        });

        if (!result.success) {
          warningBox.style.display = 'block';
          warningBox.innerHTML = `${ui.icon('alert-circle')} <strong>Duplicate Detected:</strong> ${ui.escape(result.error)}`;
          return;
        }

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          window.CC.state.role,
          'Added Participant',
          `Registered ${result.data.name} into ${labId}.`
        );

        ui.closeModal();
        ui.showToast(`Participant ${result.data.name} added successfully!`, "success", "Registration Saved");
        
        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  function openEditParticipantModal(partId) {
    const p = window.CC.db.getParticipantById(partId);
    if (!p) return;

    const ui = window.CC.ui;
    const labs = window.CC.db.getLabs();

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('edit-2')} Edit Participant Registration</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="edit-participant-form">
              <div class="form-group">
                <label class="form-label form-label-required">Full Name</label>
                <input type="text" class="form-control" name="name" value="${ui.escape(p.name)}" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Email Address</label>
                  <input type="email" class="form-control" name="email" value="${ui.escape(p.email)}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input type="text" class="form-control" name="phone" value="${ui.escape(p.phone || '')}">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Lab</label>
                  <select class="form-select" name="labId" required>
                    ${labs.map(l => `<option value="${l.id}" ${p.labId === l.id ? 'selected' : ''}>${l.id}: ${ui.escape(l.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Verification Status</label>
                  <select class="form-select" name="verificationStatus" required>
                    <option value="Verified" ${p.verificationStatus === 'Verified' ? 'selected' : ''}>Verified</option>
                    <option value="Pending Verification" ${p.verificationStatus === 'Pending Verification' ? 'selected' : ''}>Pending Verification</option>
                    <option value="Incomplete" ${p.verificationStatus === 'Incomplete' ? 'selected' : ''}>Incomplete</option>
                    <option value="Awaiting Information" ${p.verificationStatus === 'Awaiting Information' ? 'selected' : ''}>Awaiting Information</option>
                    <option value="Rejected" ${p.verificationStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Notes & Comments</label>
                <textarea class="form-textarea" name="notes">${ui.escape(p.notes || '')}</textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Update Record</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#edit-participant-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        window.CC.db.updateParticipant(p.id, {
          name: formData.get('name').trim(),
          email: formData.get('email').trim(),
          phone: formData.get('phone').trim(),
          labId: formData.get('labId'),
          verificationStatus: formData.get('verificationStatus'),
          notes: formData.get('notes').trim()
        });

        ui.closeModal();
        ui.showToast(`Updated record for ${p.name}!`, "success", "Saved");
        
        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  function openInspectParticipantModal(partId) {
    const p = window.CC.db.getParticipantById(partId);
    if (!p) return;

    const ui = window.CC.ui;
    const amb = window.CC.db.getAmbassadorById(p.ambassadorId);
    const lab = window.CC.db.getLabById(p.labId);

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('info')} Participant Record Details</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body" style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-family-mono);">${p.id}</div>
              <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${ui.escape(p.name)}</h4>
            </div>

            <div style="padding: 0.75rem; border-radius: var(--radius-md); background-color: var(--bg-subtle);">
              <div><strong>Email:</strong> ${ui.escape(p.email)}</div>
              <div><strong>Phone:</strong> ${ui.escape(p.phone || 'N/A')}</div>
              <div><strong>Lab:</strong> ${lab ? ui.escape(lab.name) : p.labId}</div>
              <div><strong>Status:</strong> ${ui.renderStatusBadge(p.verificationStatus)}</div>
            </div>

            <div>
              <strong>Sourcing Ambassador:</strong> ${amb ? ui.escape(amb.name) : 'Direct'}
            </div>
            <div>
              <strong>Registered Date:</strong> ${ui.formatDateTime(p.registeredAt)}
            </div>
            <div>
              <strong>Last Updated:</strong> ${ui.formatDateTime(p.lastUpdated)}
            </div>

            <div style="margin-top: 0.5rem;">
              <strong>Notes & Verification Log:</strong>
              <div style="background-color: var(--bg-subtle); padding: 0.6rem; border-radius: var(--radius-sm); margin-top: 3px; font-style: italic;">
                ${ui.escape(p.notes || 'No extra notes recorded.')}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml);
  }

  // CSV Export
  function exportParticipantsCSV(participantsList) {
    const headers = ["ID", "Name", "Email", "Phone", "LabId", "AmbassadorId", "VerificationStatus", "RegisteredAt", "Notes"];
    const rows = participantsList.map(p => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.email.replace(/"/g, '""')}"`,
      `"${(p.phone || '').replace(/"/g, '""')}"`,
      `"${p.labId}"`,
      `"${p.ambassadorId || ''}"`,
      `"${p.verificationStatus}"`,
      `"${p.registeredAt}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campusconnect_participants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.CC.ui.showToast("CSV export downloaded successfully!", "success", "Export Complete");
  }

  // CSV Import Modal
  function openImportCSVModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('upload')} Import Participants via CSV</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
              Paste CSV rows or choose a CSV file. Expected columns:
              <code>Name, Email, Phone, LabId, Status, Notes</code>
            </p>

            <div class="form-group">
              <label class="form-label">Upload CSV File</label>
              <input type="file" class="form-control" id="csv-file-input" accept=".csv,text/csv">
            </div>

            <div class="form-group">
              <label class="form-label">Or Paste CSV Text</label>
              <textarea class="form-textarea" id="csv-text-input" placeholder="Name, Email, Phone, LabId, Status, Notes&#10;Alice Wang, alice@campusconnect.edu, +15550001, LAB-101, Verified, CS Major"></textarea>
            </div>

            <div id="import-preview-box" style="display: none; padding: 0.75rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); font-size: 0.8rem; margin-top: 0.5rem;">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Cancel</button>
            <button class="btn btn-primary" id="btn-process-csv-import">Import Rows</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const fileInput = modalHost.querySelector('#csv-file-input');
      const textInput = modalHost.querySelector('#csv-text-input');

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

      modalHost.querySelector('#btn-process-csv-import')?.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
          ui.showToast("Please provide CSV content to import.", "warning");
          return;
        }

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        let imported = 0;
        let skipped = 0;

        // Skip header if contains 'Name' or 'Email'
        const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          if (parts.length >= 2) {
            const name = parts[0];
            const email = parts[1];
            const phone = parts[2] || '';
            const labId = parts[3] || 'LAB-101';
            const status = parts[4] || 'Pending Verification';
            const notes = parts[5] || 'Imported via CSV batch';

            const res = window.CC.db.addParticipant({
              name,
              email,
              phone,
              labId,
              ambassadorId: currentUser.id,
              verificationStatus: status,
              notes
            });

            if (res.success) imported++;
            else skipped++;
          }
        }

        ui.closeModal();
        ui.showToast(`Imported ${imported} participants. Skipped ${skipped} duplicates.`, "success", "Import Finished");

        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.labsRegistrations = {
    render,
    openAddParticipantModal,
    openEditParticipantModal,
    openInspectParticipantModal
  };
})();
