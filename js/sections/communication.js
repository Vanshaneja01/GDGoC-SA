/**
 * GDGconnect - Communication & Help Desk Section
 * Interactive Direct Messaging between Mentors & Ambassadors + Support Ticket System
 */

(function () {
  'use strict';

  let currentSubTab = 'chat'; // 'chat' or 'tickets'
  let activeChatContactId = null;

  function render(container, params = null) {
    if (params) {
      if (params.tab) currentSubTab = params.tab;
      if (params.chatWith) {
        currentSubTab = 'chat';
        activeChatContactId = params.chatWith;
      }
      if (params.action === 'create' && currentSubTab === 'tickets') {
        setTimeout(() => openCreateTicketModal(), 50);
      }
    }

    const ui = window.CC.ui;
    const currentRole = window.CC.state.role;
    const currentUser = window.CC.state.currentUser;

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('message-square')} Communication & Help Desk</h1>
          <p class="section-subtitle">Real-time messaging with your mentorship network and escalation support tickets.</p>
        </div>
        <div class="section-header-actions">
          <div style="display: flex; background-color: var(--bg-subtle); padding: 3px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <button class="btn btn-sm ${currentSubTab === 'chat' ? 'btn-primary' : 'btn-outline'}" id="btn-toggle-chat" style="border: none;">
              ${ui.icon('message-square')} Direct Messages
            </button>
            <button class="btn btn-sm ${currentSubTab === 'tickets' ? 'btn-primary' : 'btn-outline'}" id="btn-toggle-tickets" style="border: none;">
              ${ui.icon('alert-circle')} Support Tickets
            </button>
          </div>
        </div>
      </div>

      <div id="comm-subtab-container">
        ${currentSubTab === 'chat' ? renderChatView(currentUser, currentRole, ui) : renderTicketsView(currentUser, currentRole, ui)}
      </div>
    `;

    bindEvents(container);
  }

  function renderChatView(currentUser, currentRole, ui) {
    // If mentor: contacts are assigned ambassadors + other mentors
    // If ambassador: contact is assigned mentor + other ambassadors
    const allMentors = window.CC.db.getMentors();
    const allAmbassadors = window.CC.db.getAmbassadors();

    const contacts = currentRole === 'Mentor'
      ? [...allAmbassadors, ...allMentors.filter(m => m.id !== currentUser.id)]
      : [
          ...allMentors,
          ...allAmbassadors.filter(a => a.id !== currentUser.id)
        ];

    if (!activeChatContactId || !contacts.some(c => c.id === activeChatContactId)) {
      activeChatContactId = contacts[0]?.id || null;
    }

    const activeContact = contacts.find(c => c.id === activeChatContactId);
    const messages = activeContact
      ? window.CC.db.getMessagesBetween(currentUser.id, activeContact.id)
      : [];

    return `
      <div class="comm-layout">
        <!-- Sidebar Contacts List -->
        <div class="comm-sidebar">
          <div class="comm-sidebar-header">
            <input type="text" class="filter-search-input" id="comm-contact-search" placeholder="Search contacts...">
          </div>
          <div class="comm-chat-list">
            ${contacts.map(c => {
              const isSelected = c.id === activeChatContactId;
              const isMentorRole = c.id.startsWith('MTR');
              const msgs = window.CC.db.getMessagesBetween(currentUser.id, c.id);
              const lastMsg = msgs[msgs.length - 1];

              return `
                <div class="comm-chat-item ${isSelected ? 'active' : ''}" data-chat-contact="${c.id}">
                  ${ui.renderAvatar(c.avatar, c.name, 'md')}
                  <div style="flex: 1; overflow: hidden;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="font-weight: 600; font-size: 0.88rem; color: var(--text-main);">${ui.escape(c.name)}</span>
                      <span class="badge ${isMentorRole ? 'badge-green' : 'badge-olive'}" style="font-size: 0.65rem;">
                        ${isMentorRole ? 'Mentor' : 'Ambassador'}
                      </span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;">
                      ${lastMsg ? ui.escape(lastMsg.text) : ui.escape(c.department || c.id)}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Chat Conversation Window -->
        <div class="comm-chat-content">
          ${activeContact ? `
            <div class="comm-chat-header">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                ${ui.renderAvatar(activeContact.avatar, activeContact.name, 'md')}
                <div>
                  <h3 style="font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-main);">${ui.escape(activeContact.name)}</h3>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    ${activeContact.id} • ${ui.escape(activeContact.department || activeContact.institution || '')}
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-sm btn-outline" id="btn-view-chat-profile">
                  ${ui.icon('users')} View Profile
                </button>
              </div>
            </div>

            <!-- Messages Thread -->
            <div class="comm-messages-box" id="comm-messages-container">
              ${messages.length === 0 ? `
                <div class="empty-state" style="margin: auto;">
                  <div class="empty-state-icon">${ui.icon('message-square')}</div>
                  <div class="empty-state-title">No Messages Yet</div>
                  <div class="empty-state-text">Say hello to ${ui.escape(activeContact.name)} and start collaborating.</div>
                </div>
              ` : messages.map(m => {
                const isMine = m.senderId === currentUser.id;
                return `
                  <div class="chat-bubble ${isMine ? 'chat-bubble-mine' : 'chat-bubble-theirs'}">
                    <div>${ui.escape(m.text)}</div>
                    <div class="chat-timestamp">${ui.formatDateTime(m.timestamp)}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Message Input Box -->
            <form id="comm-send-msg-form" class="comm-input-box">
              <input type="text" class="form-control" id="chat-msg-input" placeholder="Type a message to ${ui.escape(activeContact.name)}..." autocomplete="off" required>
              <button type="submit" class="btn btn-primary">
                ${ui.icon('send')} Send
              </button>
            </form>
          ` : `
            <div class="empty-state" style="margin: auto;">
              <div class="empty-state-title">Select a Contact</div>
              <div class="empty-state-text">Choose a mentor or ambassador from the left panel to open direct messaging.</div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  function renderTicketsView(currentUser, currentRole, ui) {
    const tickets = window.CC.db.getTickets();

    return `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
          <h2 style="font-size: 1.15rem; font-weight: 700;">Support & Escalation Tickets</h2>
          <button class="btn btn-primary" id="btn-new-ticket">
            ${ui.icon('plus')} Create Support Ticket
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${tickets.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">${ui.icon('check-circle')}</div>
              <div class="empty-state-title">No Active Tickets</div>
              <div class="empty-state-text">All inquiries, lab access requests, and logistics support tickets have been resolved!</div>
            </div>
          ` : tickets.map(t => {
            const mentor = window.CC.db.getMentorById(t.assignedMentorId);

            return `
              <div class="card" style="padding: 1.25rem;">
                <div style="display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 0.75rem;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px; flex-wrap: wrap;">
                      <span class="badge badge-gray" style="font-family: var(--font-family-mono); font-size: 0.7rem;">${t.id}</span>
                      <span class="badge badge-green">${ui.escape(t.category)}</span>
                      ${ui.renderPriorityBadge(t.priority)}
                      ${ui.renderStatusBadge(t.status)}
                    </div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-top: 2px;">
                      ${ui.escape(t.subject)}
                    </h3>
                  </div>
                  <button class="btn btn-sm btn-outline" data-open-ticket="${t.id}">
                    Open Discussion (${(t.messages || []).length})
                  </button>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                  <div>Requester: <strong>${ui.escape(t.requesterName)}</strong></div>
                  <div>Assigned Mentor: <strong>${mentor ? ui.escape(mentor.name) : 'Lead'}</strong></div>
                  <div>Created: ${ui.formatDate(t.createdAt)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function bindEvents(container) {
    container.querySelector('#btn-toggle-chat')?.addEventListener('click', () => {
      currentSubTab = 'chat';
      render(container);
    });

    container.querySelector('#btn-toggle-tickets')?.addEventListener('click', () => {
      currentSubTab = 'tickets';
      render(container);
    });

    // Chat contact clicks
    container.querySelectorAll('[data-chat-contact]').forEach(item => {
      item.addEventListener('click', () => {
        activeChatContactId = item.getAttribute('data-chat-contact');
        render(container);
      });
    });

    // Send message form
    const sendForm = container.querySelector('#comm-send-msg-form');
    if (sendForm) {
      sendForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = container.querySelector('#chat-msg-input');
        const text = input.value.trim();
        if (!text || !activeChatContactId) return;

        window.CC.db.sendMessage(window.CC.state.currentUser.id, activeChatContactId, text);
        input.value = '';

        // Auto-scroll messages
        render(container);
        setTimeout(() => {
          const box = container.querySelector('#comm-messages-container');
          if (box) box.scrollTop = box.scrollHeight;
        }, 30);
      });
    }

    // View profile of active chat contact
    container.querySelector('#btn-view-chat-profile')?.addEventListener('click', () => {
      if (activeChatContactId.startsWith('MTR')) {
        window.CC.sections.mentors.openMentorModal(activeChatContactId);
      } else {
        window.CC.sections.ambassadors.openAmbassadorModal(activeChatContactId);
      }
    });

    // Tickets actions
    container.querySelector('#btn-new-ticket')?.addEventListener('click', () => {
      openCreateTicketModal();
    });

    container.querySelectorAll('[data-open-ticket]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-ticket');
        openTicketModal(id);
      });
    });
  }

  function openCreateTicketModal() {
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;
    const mentors = window.CC.db.getMentors();

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('plus')} Create Support Ticket</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body">
            <form id="create-ticket-form">
              <div class="form-group">
                <label class="form-label form-label-required">Issue Subject</label>
                <input type="text" class="form-control" name="subject" placeholder="e.g. Lab 102 student quota limit reached" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Category</label>
                  <select class="form-select" name="category" required>
                    <option value="Lab Access">Lab Access</option>
                    <option value="Registration Glitch">Registration Glitch</option>
                    <option value="Equipment">Equipment / Venue</option>
                    <option value="Schedule Conflict">Schedule Conflict</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Priority</label>
                  <select class="form-select" name="priority" required>
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Assign to Faculty Mentor</label>
                <select class="form-select" name="mentorId" required>
                  ${mentors.map(m => `
                    <option value="${m.id}">${ui.escape(m.name)} (${m.department})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required">Detailed Description</label>
                <textarea class="form-textarea" name="message" placeholder="Provide background, error messages, and immediate impacts..." required></textarea>
              </div>

              <div class="modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: 0;">
                <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Open Ticket</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      const form = modalHost.querySelector('#create-ticket-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const newTicket = window.CC.db.addTicket({
          subject: formData.get('subject').trim(),
          category: formData.get('category'),
          priority: formData.get('priority'),
          assignedMentorId: formData.get('mentorId'),
          requesterId: currentUser.id,
          requesterName: currentUser.name,
          initialMessage: formData.get('message').trim()
        });

        window.CC.db.logActivity(
          currentUser.id,
          currentUser.name,
          window.CC.state.role,
          'Opened Support Ticket',
          `Created ticket '${newTicket.subject}' (${newTicket.id}).`
        );

        window.CC.db.addNotification(
          newTicket.assignedMentorId,
          "New Support Ticket Assigned",
          `${currentUser.name} created ticket: '${newTicket.subject}'.`,
          "support_ticket",
          newTicket.id
        );

        ui.closeModal();
        ui.showToast(`Ticket ${newTicket.id} opened successfully!`, "success", "Ticket Created");

        const mainContainer = document.querySelector('#main-content-viewport');
        if (mainContainer) render(mainContainer);
      });
    });
  }

  function openTicketModal(ticketId) {
    const t = window.CC.db.getTicketById(ticketId);
    if (!t) return;

    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="badge badge-gray" style="font-family: var(--font-family-mono);">${t.id}</span>
              <h3 class="modal-title">${ui.escape(t.subject)}</h3>
            </div>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
            
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge badge-green">${ui.escape(t.category)}</span>
                ${ui.renderPriorityBadge(t.priority)}
                ${ui.renderStatusBadge(t.status)}
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <label style="font-size: 0.8rem; font-weight: 600;">Update Status:</label>
                <select class="form-select" id="ticket-status-select" style="width: auto; padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                  <option value="Open" ${t.status === 'Open' ? 'selected' : ''}>Open</option>
                  <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Waiting" ${t.status === 'Waiting' ? 'selected' : ''}>Waiting</option>
                  <option value="Resolved" ${t.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                  <option value="Closed" ${t.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
              </div>
            </div>

            <!-- Messages Thread -->
            <div style="display: flex; flex-direction: column; gap: 0.85rem; max-height: 280px; overflow-y: auto;">
              ${(t.messages || []).map(m => `
                <div style="padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-subtle); border: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <strong style="font-size: 0.85rem; color: var(--text-main);">${ui.escape(m.senderName)}</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${ui.formatDateTime(m.timestamp)}</span>
                  </div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">${ui.escape(m.text)}</div>
                </div>
              `).join('')}
            </div>

            <!-- Reply Box -->
            <form id="ticket-reply-form" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
              <textarea class="form-textarea" id="ticket-reply-text" placeholder="Type response or status update..." required></textarea>
              <button type="submit" class="btn btn-primary btn-sm" style="align-self: flex-start;">
                ${ui.icon('send')} Send Reply
              </button>
            </form>

          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      modalHost.querySelector('#ticket-status-select')?.addEventListener('change', (e) => {
        window.CC.db.updateTicketStatus(t.id, e.target.value);
        ui.showToast(`Ticket status updated to ${e.target.value}!`, "success");
      });

      modalHost.querySelector('#ticket-reply-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = modalHost.querySelector('#ticket-reply-text').value.trim();
        if (!text) return;

        window.CC.db.replyToTicket(t.id, currentUser.id, currentUser.name, text);
        ui.showToast("Reply posted to ticket.", "info");
        openTicketModal(t.id);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.communication = {
    render,
    openCreateTicketModal,
    openTicketModal
  };
})();
