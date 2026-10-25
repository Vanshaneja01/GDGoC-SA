/**
 * GDGconnect - Task Management Section
 * Kanban Board, Table View, Task Creation, Submission Workflow, Mentor Reviews & Approvals
 */

(function () {
  'use strict';

  let currentView = 'kanban'; // 'kanban' or 'table'
  let currentCategory = 'all';
  let currentPriority = 'all';
  let currentStatus = 'all';
  let currentSearch = '';

  const CATEGORIES = [
    "Registration", "Lab Management", "Outreach", "Communication",
    "Event Coordination", "Training", "Reporting", "Content Creation", "General Operations"
  ];

  const STATUS_COLUMNS = [
    { id: "To Do", title: "To Do", color: "gray" },
    { id: "In Progress", title: "In Progress", color: "blue" },
    { id: "Submitted", title: "Submitted / Review", color: "amber", aliases: ["Under Review"] },
    { id: "Changes Requested", title: "Changes Needed", color: "orange" },
    { id: "Completed", title: "Completed", color: "green" }
  ];

  function render(container, params = null) {
    if (params) {
      if (params.filterStatus) currentStatus = params.filterStatus;
      if (params.action === 'create') {
        setTimeout(() => openCreateTaskModal(params.assigneeId, params.creatorId), 50);
      }
    }

    const tasks = window.CC.db.getTasks();
    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const filtered = tasks.filter(t => {
      const matchesSearch = !currentSearch ||
        t.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(currentSearch.toLowerCase());

      const matchesCat = currentCategory === 'all' || t.category === currentCategory;
      const matchesPri = currentPriority === 'all' || t.priority === currentPriority;
      const matchesStat = currentStatus === 'all' || t.status === currentStatus || (currentStatus === 'Overdue' && (t.status === 'Overdue' || t.isOverdue));

      return matchesSearch && matchesCat && matchesPri && matchesStat;
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('check-square')} Task Management</h1>
          <p class="section-subtitle">Track deliverables, submit campaign assets, and review ambassador milestones.</p>
        </div>
        <div class="section-header-actions">
          <div style="display: flex; background-color: var(--bg-subtle); padding: 3px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <button class="btn btn-sm ${currentView === 'kanban' ? 'btn-primary' : 'btn-outline'}" id="btn-toggle-kanban" style="border: none;">
              ${ui.icon('layout-dashboard')} Kanban Board
            </button>
            <button class="btn btn-sm ${currentView === 'table' ? 'btn-primary' : 'btn-outline'}" id="btn-toggle-table" style="border: none;">
              ${ui.icon('bar-chart-2')} Task Table
            </button>
          </div>
          ${currentRole === 'Mentor' ? `
            <button class="btn btn-primary" id="btn-create-task-main">
              ${ui.icon('plus')} Create Task
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <div class="filter-search-wrap">
            ${ui.icon('search')}
            <input type="text" class="filter-search-input" id="task-search-input" 
              placeholder="Search task by title, ID..." value="${ui.escape(currentSearch)}">
          </div>
          <select class="filter-select" id="task-filter-category">
            <option value="all" ${currentCategory === 'all' ? 'selected' : ''}>All Categories</option>
            ${CATEGORIES.map(c => `<option value="${c}" ${currentCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <select class="filter-select" id="task-filter-priority">
            <option value="all" ${currentPriority === 'all' ? 'selected' : ''}>All Priorities</option>
            <option value="Urgent" ${currentPriority === 'Urgent' ? 'selected' : ''}>Urgent</option>
            <option value="High" ${currentPriority === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${currentPriority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${currentPriority === 'Low' ? 'selected' : ''}>Low</option>
          </select>
          <select class="filter-select" id="task-filter-status">
            <option value="all" ${currentStatus === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="To Do" ${currentStatus === 'To Do' ? 'selected' : ''}>To Do</option>
            <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Submitted" ${currentStatus === 'Submitted' ? 'selected' : ''}>Submitted</option>
            <option value="Changes Requested" ${currentStatus === 'Changes Requested' ? 'selected' : ''}>Changes Requested</option>
            <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Overdue" ${currentStatus === 'Overdue' ? 'selected' : ''}>⚠️ Overdue Tasks</option>
          </select>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Showing <strong>${filtered.length}</strong> tasks
        </div>
      </div>

      <!-- Dynamic View Area -->
      <div id="task-view-container">
        ${currentView === 'kanban' ? renderKanban(filtered, ui) : renderTable(filtered, ui)}
      </div>
    `;

    bindEvents(container);
  }

  function renderKanban(tasks, ui) {
    return `
      <div class="kanban-board">
        ${STATUS_COLUMNS.map(col => {
          const colTasks = tasks.filter(t => {
            if (col.aliases) {
              return t.status === col.id || col.aliases.includes(t.status);
            }
            return t.status === col.id;
          });

          return `
            <div class="kanban-column" data-col-status="${col.id}">
              <div class="kanban-col-header">
                <span class="kanban-col-title">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--status-${col.color});"></span>
                  ${col.title}
                </span>
                <span class="badge badge-gray">${colTasks.length}</span>
              </div>
              <div class="kanban-tasks-list">
                ${colTasks.length === 0 ? `
                  <div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.78rem;">
                    No tasks in this lane
                  </div>
                ` : colTasks.map(task => {
                  const assignee = window.CC.db.getAmbassadorById(task.assigneeId);
                  const daysLeft = getDaysCountdown(task.deadline);

                  return `
                    <div class="kanban-card" data-task-id="${task.id}">
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
                        <span class="badge badge-gray" style="font-size: 0.68rem; font-family: var(--font-family-mono);">${task.id}</span>
                        ${ui.renderPriorityBadge(task.priority)}
                      </div>

                      <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-main); line-height: 1.35;">
                        ${ui.escape(task.title)}
                      </div>

                      <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
                        <span class="badge badge-green" style="font-size: 0.65rem;">${ui.escape(task.category)}</span>
                      </div>

                      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.25rem; pt: 0.5rem; border-top: 1px solid var(--border-subtle); font-size: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.35rem;">
                          ${assignee ? ui.renderAvatar(assignee.avatar, assignee.name, 'sm') : ''}
                          <span style="color: var(--text-secondary); max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${assignee ? ui.escape(assignee.name.split(' ')[0]) : 'Unassigned'}
                          </span>
                        </div>
                        <span style="color: ${daysLeft.isOverdue ? 'var(--status-red)' : 'var(--text-muted)'}; font-weight: ${daysLeft.isOverdue ? '700' : '500'};">
                          ${daysLeft.text}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderTable(tasks, ui) {
    if (tasks.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">${ui.icon('check-square')}</div>
          <div class="empty-state-title">No Tasks Match Filters</div>
          <div class="empty-state-text">Try resetting filters to view all tasks.</div>
        </div>
      `;
    }

    return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID & Task</th>
              <th>Category</th>
              <th>Assignee</th>
              <th>Priority</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(t => {
              const assignee = window.CC.db.getAmbassadorById(t.assigneeId);
              const daysLeft = getDaysCountdown(t.deadline);

              return `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${ui.escape(t.title)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-family-mono);">${t.id}</div>
                  </td>
                  <td><span class="badge badge-gray">${ui.escape(t.category)}</span></td>
                  <td>
                    ${assignee ? `
                      <div style="display: flex; align-items: center; gap: 0.4rem;">
                        ${ui.renderAvatar(assignee.avatar, assignee.name, 'sm')}
                        <span>${ui.escape(assignee.name)}</span>
                      </div>
                    ` : '<span style="color: var(--text-muted);">Unassigned</span>'}
                  </td>
                  <td>${ui.renderPriorityBadge(t.priority)}</td>
                  <td>
                    <div style="color: ${daysLeft.isOverdue ? 'var(--status-red)' : 'var(--text-main)'}; font-weight: ${daysLeft.isOverdue ? '700' : 'normal'};">
                      ${ui.formatDate(t.deadline)}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${daysLeft.text}</div>
                  </td>
                  <td>${ui.renderStatusBadge(t.status)}</td>
                  <td>
                    <button class="btn btn-sm btn-outline" data-task-id="${t.id}">Inspect</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function getDaysCountdown(deadline) {
    if (!deadline) return { text: 'No deadline', isOverdue: false };
    const now = new Date();
    const d = new Date(deadline + 'T23:59:59');
    const diffMs = d - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)}d`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: `Due today!`, isOverdue: false };
    } else if (diffDays === 1) {
      return { text: `Due tomorrow`, isOverdue: false };
    } else {
      return { text: `${diffDays} days left`, isOverdue: false };
    }
  }

  function bindEvents(container) {
    // View toggles
    container.querySelector('#btn-toggle-kanban')?.addEventListener('click', () => {
      currentView = 'kanban';
      render(container);
    });

    container.querySelector('#btn-toggle-table')?.addEventListener('click', () => {
      currentView = 'table';
      render(container);
    });

    // Create task
    container.querySelector('#btn-create-task-main')?.addEventListener('click', () => {
      openCreateTaskModal();
    });

    // Search and filters
    const searchInput = container.querySelector('#task-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        const tasks = window.CC.db.getTasks();
        const filtered = filterTasks(tasks);
        const viewContainer = container.querySelector('#task-view-container');
        if (viewContainer) {
          viewContainer.innerHTML = currentView === 'kanban' ? renderKanban(filtered, window.CC.ui) : renderTable(filtered, window.CC.ui);
          bindTaskCardClicks(viewContainer);
        }
      });
    }

    const catSelect = container.querySelector('#task-filter-category');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        render(container);
      });
    }

    const priSelect = container.querySelector('#task-filter-priority');
    if (priSelect) {
      priSelect.addEventListener('change', (e) => {
        currentPriority = e.target.value;
        render(container);
      });
    }

    const statSelect = container.querySelector('#task-filter-status');
    if (statSelect) {
      statSelect.addEventListener('change', (e) => {
        currentStatus = e.target.value;
        render(container);
      });
    }

    bindTaskCardClicks(container);
  }

  function filterTasks(tasks) {
    return tasks.filter(t => {
      const matchesSearch = !currentSearch ||
        t.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(currentSearch.toLowerCase());
      const matchesCat = currentCategory === 'all' || t.category === currentCategory;
      const matchesPri = currentPriority === 'all' || t.priority === currentPriority;
      const matchesStat = currentStatus === 'all' || t.status === currentStatus || (currentStatus === 'Overdue' && (t.status === 'Overdue' || t.isOverdue));
      return matchesSearch && matchesCat && matchesPri && matchesStat;
    });
  }

  function bindTaskCardClicks(container) {
    container.querySelectorAll('[data-task-id]').forEach(elem => {
      elem.addEventListener('click', () => {
        const id = elem.getAttribute('data-task-id');
        openTaskModal(id);
      });
    });
  }

  function openTaskModal(taskId) {
    const task = window.CC.db.getTaskById(taskId);
    if (!task) return;

    const ui = window.CC.ui;
    const assignee = window.CC.db.getAmbassadorById(task.assigneeId);
    const creator = window.CC.db.getMentorById(task.creatorId);
    const countdown = getDaysCountdown(task.deadline);
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    const isAssignee = currentRole === 'Ambassador' && currentUser.id === task.assigneeId;
    const isMentor = currentRole === 'Mentor';

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="badge badge-gray" style="font-family: var(--font-family-mono);">${task.id}</span>
              <h3 class="modal-title">${ui.escape(task.title)}</h3>
            </div>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Metadata Row -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
                ${ui.renderPriorityBadge(task.priority)}
                <span class="badge badge-green">${ui.escape(task.category)}</span>
                ${ui.renderStatusBadge(task.status)}
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text-secondary);">
                <span>${ui.icon('clock')} Due: <strong>${ui.formatDate(task.deadline)}</strong></span>
                <span style="color: ${countdown.isOverdue ? 'var(--status-red)' : 'var(--text-muted)'}; font-weight: 600;">(${countdown.text})</span>
              </div>
            </div>

            <!-- Assignee and Creator Info -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
              <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Assigned Ambassador</div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 4px;">
                  ${assignee ? ui.renderAvatar(assignee.avatar, assignee.name, 'sm') : ''}
                  <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${assignee ? ui.escape(assignee.name) : 'Unassigned'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${assignee ? ui.escape(assignee.department) : ''}</div>
                  </div>
                </div>
              </div>

              <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Task Creator (Mentor)</div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 4px;">
                  ${creator ? ui.renderAvatar(creator.avatar, creator.name, 'sm') : ''}
                  <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${creator ? ui.escape(creator.name) : 'Campus Faculty'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${creator ? ui.escape(creator.department) : ''}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description & Instructions -->
            <div>
              <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.35rem;">Description</h4>
              <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">${ui.escape(task.description)}</p>
            </div>

            <div style="background-color: var(--bg-subtle); padding: 1rem 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--color-primary);">
              <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-main);">Instructions & Deliverables</h4>
              <div style="font-size: 0.85rem; color: var(--text-secondary); white-space: pre-line; line-height: 1.5;">${ui.escape(task.instructions || 'Follow standard outreach guidelines.')}</div>
            </div>

            <!-- ==========================================================================
                 SUBMISSION BOX (Work evidence submitted by Ambassador)
                 ========================================================================== -->
            <div class="card" style="padding: 1.25rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <h4 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
                  ${ui.icon('upload')} Work Submission & Evidence
                </h4>
                ${task.submission ? `<span class="badge badge-green">Submitted on ${ui.formatDateTime(task.submission.submittedAt)}</span>` : '<span class="badge badge-gray">Not Submitted Yet</span>'}
              </div>

              ${task.submission ? `
                <div style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 0.5rem; line-height: 1.4;">
                  <strong>Notes:</strong> ${ui.escape(task.submission.notes)}
                </div>
                ${(task.submission.links || []).length > 0 ? `
                  <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem;">
                    <strong>Evidence Links:</strong>
                    ${task.submission.links.map(link => `
                      <a href="${ui.escape(link)}" target="_blank" style="color: var(--color-primary); font-size: 0.82rem; display: inline-flex; align-items: center; gap: 0.3rem;">
                        ${ui.icon('external-link')} ${ui.escape(link)}
                      </a>
                    `).join('')}
                  </div>
                ` : ''}
              ` : `
                ${isAssignee ? `
                  <form id="task-submit-form" style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
                    <textarea class="form-textarea" id="submit-notes" placeholder="Describe completed actions, results, participant attendance..." required></textarea>
                    <input type="text" class="form-control" id="submit-link" placeholder="Optional URL to slides, report, folder, or drive">
                    <button type="submit" class="btn btn-primary" style="align-self: flex-start;">
                      ${ui.icon('upload')} Submit Work for Review
                    </button>
                  </form>
                ` : `
                  <p style="font-size: 0.85rem; color: var(--text-muted);">The assigned ambassador has not submitted work for this task yet.</p>
                `}
              `}
            </div>

            <!-- ==========================================================================
                 MENTOR FEEDBACK & APPROVAL / RETURN WORKFLOW
                 ========================================================================== -->
            ${task.feedback ? `
              <div class="card" style="padding: 1.25rem; border-left: 4px solid var(--color-olive);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Mentor Review & Feedback</h4>
                  <div class="rating-stars">
                    ${'★'.repeat(task.feedback.rating)}${'☆'.repeat(5 - task.feedback.rating)}
                  </div>
                </div>
                <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.4;">
                  ${ui.escape(task.feedback.comments)}
                </p>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
                  Reviewed on ${ui.formatDateTime(task.feedback.reviewedAt)}
                </div>
              </div>
            ` : ''}

            <!-- Mentor Action Controls (Approve / Request Changes) -->
            ${isMentor && (task.status === 'Submitted' || task.status === 'Under Review' || task.status === 'In Progress') ? `
              <div class="card" style="padding: 1.25rem; background-color: var(--bg-subtle);">
                <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">Mentor Evaluation Controls</h4>
                <div class="form-group">
                  <label class="form-label">Review Comments / Constructive Feedback</label>
                  <textarea class="form-textarea" id="mentor-review-comments" placeholder="Write feedback for the ambassador..."></textarea>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem;">
                  <button class="btn btn-primary" id="btn-approve-task">
                    ${ui.icon('check-circle')} Approve & Mark Completed
                  </button>
                  <button class="btn btn-secondary" id="btn-request-changes-task">
                    ${ui.icon('alert-circle')} Request Changes
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Discussion & Comments Thread -->
            <div>
              <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
                ${ui.icon('message-square')} Task Discussion (${(task.comments || []).length})
              </h4>
              <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 200px; overflow-y: auto; margin-bottom: 0.75rem;">
                ${(task.comments || []).length === 0 ? `
                  <div style="font-size: 0.8rem; color: var(--text-muted);">No comments yet. Start the conversation below.</div>
                ` : task.comments.map(c => `
                  <div style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle); font-size: 0.85rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
                      <span style="font-weight: 600; color: var(--text-main); font-size: 0.82rem;">${ui.escape(c.authorName)}</span>
                      <span style="font-size: 0.7rem; color: var(--text-muted);">${ui.formatDateTime(c.timestamp)}</span>
                    </div>
                    <div style="color: var(--text-secondary);">${ui.escape(c.text)}</div>
                  </div>
                `).join('')}
              </div>

              <!-- Post Comment Box -->
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" class="form-control" id="task-new-comment" placeholder="Add a comment or ask a question...">
                <button class="btn btn-primary btn-sm" id="btn-post-task-comment">${ui.icon('send')} Send</button>
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
      // Ambassador submission handler
      modalHost.querySelector('#task-submit-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const notes = modalHost.querySelector('#submit-notes').value.trim();
        const link = modalHost.querySelector('#submit-link').value.trim();

        const updates = {
          status: 'Submitted',
          submission: {
            notes,
            submittedAt: new Date().toISOString(),
            links: link ? [link] : []
          }
        };

        window.CC.db.updateTask(task.id, updates);

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          currentRole,
          'Submitted Task Work',
          `Submitted deliverables for ${task.title} (${task.id}).`
        );

        window.CC.db.addNotification(
          task.creatorId,
          "Task Submission Ready for Review",
          `${currentUser.name} submitted work for '${task.title}'.`,
          "task_submission",
          task.id
        );

        ui.closeModal();
        ui.showToast("Task submitted successfully! Your mentor will review it.", "success", "Work Submitted");
        refreshActiveTasksView();
      });

      // Mentor Approve handler
      modalHost.querySelector('#btn-approve-task')?.addEventListener('click', () => {
        const comments = modalHost.querySelector('#mentor-review-comments').value.trim() || "Work approved! Outstanding contribution.";
        const updates = {
          status: 'Completed',
          feedback: {
            mentorId: currentUser.id,
            rating: 5,
            comments,
            reviewedAt: new Date().toISOString()
          }
        };

        window.CC.db.updateTask(task.id, updates);

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          currentRole,
          'Approved Task',
          `Approved and completed ${task.title} (${task.id}).`
        );

        window.CC.db.addNotification(
          task.assigneeId,
          "Task Approved!",
          `Dr./Prof. ${currentUser.name} approved your submission for '${task.title}'.`,
          "task_approval",
          task.id
        );

        ui.closeModal();
        ui.showToast(`Task '${task.title}' approved and marked completed!`, "success", "Task Approved");
        refreshActiveTasksView();
      });

      // Mentor Request Changes handler
      modalHost.querySelector('#btn-request-changes-task')?.addEventListener('click', () => {
        const comments = modalHost.querySelector('#mentor-review-comments').value.trim();
        if (!comments) {
          ui.showToast("Please provide review comments explaining the revisions needed.", "warning", "Feedback Required");
          return;
        }

        const updates = {
          status: 'Changes Requested',
          feedback: {
            mentorId: currentUser.id,
            rating: 3,
            comments,
            reviewedAt: new Date().toISOString()
          }
        };

        window.CC.db.updateTask(task.id, updates);

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          currentRole,
          'Requested Task Changes',
          `Requested changes on ${task.title} (${task.id}).`
        );

        window.CC.db.addNotification(
          task.assigneeId,
          "Changes Requested on Task",
          `Dr./Prof. ${currentUser.name} requested adjustments on '${task.title}'.`,
          "task_revision",
          task.id
        );

        ui.closeModal();
        ui.showToast("Feedback sent and task returned for revisions.", "info", "Changes Requested");
        refreshActiveTasksView();
      });

      // Comment thread handler
      modalHost.querySelector('#btn-post-task-comment')?.addEventListener('click', () => {
        const commentInput = modalHost.querySelector('#task-new-comment');
        const text = commentInput.value.trim();
        if (!text) return;

        window.CC.db.addTaskComment(task.id, currentUser.id, currentUser.name, text);
        commentInput.value = '';
        ui.showToast("Comment posted.", "info");

        // Re-open modal to show new comment
        openTaskModal(task.id);
      });
    });
  }

  function openCreateTaskModal(defaultAssigneeId = null, defaultCreatorId = null) {
    const ui = window.CC.ui;
    const ambassadors = window.CC.db.getAmbassadors();
    const mentors = window.CC.db.getMentors();
    const currentUser = window.CC.state.currentUser;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('plus')} Create & Assign New Task</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="create-task-form">
              <div class="form-group">
                <label class="form-label form-label-required">Task Title</label>
                <input type="text" class="form-control" name="title" placeholder="e.g. Host Lab 101 Orientation Workshop" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Category</label>
                  <select class="form-select" name="category" required>
                    ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Priority</label>
                  <select class="form-select" name="priority" required>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Assign To Ambassador</label>
                  <select class="form-select" name="assigneeId" required>
                    <option value="">-- Select Ambassador --</option>
                    ${ambassadors.map(a => `
                      <option value="${a.id}" ${defaultAssigneeId === a.id ? 'selected' : ''}>
                        ${ui.escape(a.name)} (${a.id}) - ${ui.escape(a.department)}
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Creator (Mentor)</label>
                  <select class="form-select" name="creatorId" required>
                    ${mentors.map(m => `
                      <option value="${m.id}" ${(defaultCreatorId === m.id || currentUser.id === m.id) ? 'selected' : ''}>
                        ${ui.escape(m.name)} (${m.id})
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Start Date</label>
                  <input type="date" class="form-control" name="startDate" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Deadline</label>
                  <input type="date" class="form-control" name="deadline" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Task Description</label>
                <textarea class="form-textarea" name="description" placeholder="Explain the high-level objective of this task..." required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Step-by-Step Instructions & Acceptance Criteria</label>
                <textarea class="form-textarea" name="instructions" placeholder="1. Reserve hall&#10;2. Confirm 25 attendees&#10;3. Upload deck"></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#create-task-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const newTask = window.CC.db.addTask({
          title: formData.get('title').trim(),
          category: formData.get('category'),
          priority: formData.get('priority'),
          assigneeId: formData.get('assigneeId'),
          creatorId: formData.get('creatorId'),
          startDate: formData.get('startDate'),
          deadline: formData.get('deadline'),
          description: formData.get('description').trim(),
          instructions: formData.get('instructions').trim(),
          status: 'To Do'
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          window.CC.state.role,
          'Created Task',
          `Created task '${newTask.title}' assigned to ${newTask.assigneeId}.`
        );

        window.CC.db.addNotification(
          newTask.assigneeId,
          "New Task Assigned",
          `You have been assigned: '${newTask.title}'. Deadline: ${newTask.deadline}.`,
          "task_assignment",
          newTask.id
        );

        ui.closeModal();
        ui.showToast(`Task '${newTask.title}' successfully assigned!`, "success", "Task Created");
        refreshActiveTasksView();
      });
    });
  }

  function refreshActiveTasksView() {
    const mainContainer = document.querySelector('#main-content-viewport');
    if (mainContainer) {
      render(mainContainer);
    }
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.tasks = {
    render,
    openTaskModal,
    openCreateTaskModal
  };
})();
