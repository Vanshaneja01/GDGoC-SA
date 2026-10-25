/**
 * CampusConnect - Calendar Section
 * Unified calendar aggregating task deadlines, mentor sessions, ambassador workshops & lab milestones
 */

(function () {
  'use strict';

  let currentYear = 2026;
  let currentMonth = 9; // 0-indexed (9 = October 2026)
  let filterTasks = true;
  let filterMentorSessions = true;
  let filterAmbSessions = true;
  let filterLabs = true;

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function render(container) {
    const ui = window.CC.ui;
    const events = getAllAggregatedEvents();

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('calendar')} Unified Events & Milestones Calendar</h1>
          <p class="section-subtitle">Comprehensive schedule across mentoring sessions, workshops, lab deadlines, and deliverables.</p>
        </div>
        <div class="section-header-actions">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="btn btn-sm btn-outline" id="btn-cal-prev">${ui.icon('chevron-right', 'icon icon-rotate-180')} Prev</button>
            <button class="btn btn-sm btn-secondary" id="btn-cal-today">Today</button>
            <button class="btn btn-sm btn-outline" id="btn-cal-next">Next ${ui.icon('chevron-right')}</button>
          </div>
        </div>
      </div>

      <!-- Controls & Legend Bar -->
      <div class="filter-bar">
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">
          ${MONTH_NAMES[currentMonth]} ${currentYear}
        </div>
        <div class="filter-group" style="font-size: 0.85rem;">
          <label style="display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;">
            <input type="checkbox" id="cal-filter-tasks" ${filterTasks ? 'checked' : ''}>
            <span class="badge tag-task">Task Deadlines</span>
          </label>
          <label style="display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;">
            <input type="checkbox" id="cal-filter-mentor-sess" ${filterMentorSessions ? 'checked' : ''}>
            <span class="badge tag-mentor-session">Mentor Sessions</span>
          </label>
          <label style="display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;">
            <input type="checkbox" id="cal-filter-amb-sess" ${filterAmbSessions ? 'checked' : ''}>
            <span class="badge tag-amb-session">Ambassador Workshops</span>
          </label>
          <label style="display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;">
            <input type="checkbox" id="cal-filter-labs" ${filterLabs ? 'checked' : ''}>
            <span class="badge tag-lab">Lab Milestones</span>
          </label>
        </div>
      </div>

      <!-- Calendar Month Grid -->
      <div class="calendar-grid">
        <div class="calendar-header-day">Sun</div>
        <div class="calendar-header-day">Mon</div>
        <div class="calendar-header-day">Tue</div>
        <div class="calendar-header-day">Wed</div>
        <div class="calendar-header-day">Thu</div>
        <div class="calendar-header-day">Fri</div>
        <div class="calendar-header-day">Sat</div>

        ${renderMonthCells(currentYear, currentMonth, events, ui)}
      </div>
    `;

    bindEvents(container);
  }

  function getAllAggregatedEvents() {
    const list = [];

    // Tasks deadlines
    if (filterTasks) {
      window.CC.db.getTasks().forEach(t => {
        if (t.deadline) {
          list.push({
            id: t.id,
            type: 'task',
            date: t.deadline,
            title: `Task Due: ${t.title}`,
            time: '23:59',
            raw: t
          });
        }
      });
    }

    // Mentor sessions
    if (filterMentorSessions) {
      window.CC.db.getMentorSessions().forEach(s => {
        if (s.date && s.status !== 'Cancelled') {
          list.push({
            id: s.id,
            type: 'mentor-session',
            date: s.date,
            title: `Mentoring: ${s.title}`,
            time: `${s.startTime} - ${s.endTime}`,
            raw: s
          });
        }
      });
    }

    // Ambassador sessions
    if (filterAmbSessions) {
      window.CC.db.getAmbassadorSessions().forEach(s => {
        if (s.date && s.status !== 'Cancelled') {
          list.push({
            id: s.id,
            type: 'amb-session',
            date: s.date,
            title: `Workshop: ${s.title}`,
            time: `${s.startTime} - ${s.endTime}`,
            raw: s
          });
        }
      });
    }

    // Labs deadlines
    if (filterLabs) {
      window.CC.db.getLabs().forEach(l => {
        if (l.endDate) {
          list.push({
            id: l.id,
            type: 'lab',
            date: l.endDate,
            title: `Target Deadline: ${l.name}`,
            time: 'End of Term',
            raw: l
          });
        }
      });
    }

    return list;
  }

  function renderMonthCells(year, month, events, ui) {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let cellsHtml = '';

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      cellsHtml += `
        <div class="calendar-cell" style="opacity: 0.35; background-color: var(--bg-subtle);">
          <span class="calendar-day-num">${dayNum}</span>
        </div>
      `;
    }

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      const isToday = isCurrentMonth && today.getDate() === day;

      cellsHtml += `
        <div class="calendar-cell ${isToday ? 'today' : ''}" data-cal-date="${dateStr}">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="calendar-day-num">${day}</span>
            ${dayEvents.length > 0 ? `<span class="badge badge-gray" style="font-size: 0.65rem;">${dayEvents.length}</span>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px; overflow: hidden;">
            ${dayEvents.slice(0, 3).map(e => {
              let tagClass = 'tag-task';
              if (e.type === 'mentor-session') tagClass = 'tag-mentor-session';
              else if (e.type === 'amb-session') tagClass = 'tag-amb-session';
              else if (e.type === 'lab') tagClass = 'tag-lab';

              return `
                <div class="calendar-event-tag ${tagClass}" data-event-type="${e.type}" data-event-id="${e.id}" title="${ui.escape(e.title)} (${e.time})">
                  ${ui.escape(e.title)}
                </div>
              `;
            }).join('')}
            ${dayEvents.length > 3 ? `
              <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 600;">+${dayEvents.length - 3} more</div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Trailing padding to make complete rows (multiples of 7)
    const totalCells = firstDayIndex + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cellsHtml += `
        <div class="calendar-cell" style="opacity: 0.35; background-color: var(--bg-subtle);">
          <span class="calendar-day-num">${i}</span>
        </div>
      `;
    }

    return cellsHtml;
  }

  function bindEvents(container) {
    container.querySelector('#btn-cal-prev')?.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      render(container);
    });

    container.querySelector('#btn-cal-next')?.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      render(container);
    });

    container.querySelector('#btn-cal-today')?.addEventListener('click', () => {
      const now = new Date();
      currentYear = now.getFullYear();
      currentMonth = now.getMonth();
      render(container);
    });

    // Checkbox toggles
    container.querySelector('#cal-filter-tasks')?.addEventListener('change', (e) => {
      filterTasks = e.target.checked;
      render(container);
    });

    container.querySelector('#cal-filter-mentor-sess')?.addEventListener('change', (e) => {
      filterMentorSessions = e.target.checked;
      render(container);
    });

    container.querySelector('#cal-filter-amb-sess')?.addEventListener('change', (e) => {
      filterAmbSessions = e.target.checked;
      render(container);
    });

    container.querySelector('#cal-filter-labs')?.addEventListener('change', (e) => {
      filterLabs = e.target.checked;
      render(container);
    });

    // Event tag click
    container.querySelectorAll('[data-event-type]').forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = elem.getAttribute('data-event-type');
        const id = elem.getAttribute('data-event-id');

        if (type === 'task') {
          window.CC.sections.tasks.openTaskModal(id);
        } else if (type === 'mentor-session') {
          window.CC.sections.mentorSessions.openSessionModal(id);
        } else if (type === 'amb-session') {
          window.CC.sections.ambassadorSessions.openSessionModal(id);
        } else if (type === 'lab') {
          window.CC.state.setSection('labs-registrations');
        }
      });
    });

    // Day cell click (view all events for day)
    container.querySelectorAll('[data-cal-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        const dateStr = cell.getAttribute('data-cal-date');
        openDayScheduleModal(dateStr);
      });
    });
  }

  function openDayScheduleModal(dateStr) {
    const ui = window.CC.ui;
    const events = getAllAggregatedEvents().filter(e => e.date === dateStr);

    const modalHtml = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h3 class="modal-title">${ui.icon('calendar')} Events for ${ui.formatDate(dateStr)}</h3>
            <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
          </div>
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${events.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-title">No Events Scheduled</div>
                <div class="empty-state-text">No deliverables or sessions due on this day.</div>
              </div>
            ` : events.map(e => `
              <div style="padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background-color: var(--bg-subtle); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 2px;">
                    <span class="badge ${e.type === 'mentor-session' ? 'badge-green' : e.type === 'task' ? 'badge-blue' : 'badge-orange'}">${e.type}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${e.time}</span>
                  </div>
                  <div style="font-weight: 600; font-size: 0.9rem;">${ui.escape(e.title)}</div>
                </div>
                <button class="btn btn-sm btn-outline" data-inspect-cal-event="${e.id}" data-event-type="${e.type}">
                  View
                </button>
              </div>
            `).join('')}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    ui.openModal(modalHtml, (modalHost) => {
      modalHost.querySelectorAll('[data-inspect-cal-event]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-inspect-cal-event');
          const type = btn.getAttribute('data-event-type');
          ui.closeModal();

          if (type === 'task') {
            window.CC.sections.tasks.openTaskModal(id);
          } else if (type === 'mentor-session') {
            window.CC.sections.mentorSessions.openSessionModal(id);
          } else if (type === 'amb-session') {
            window.CC.sections.ambassadorSessions.openSessionModal(id);
          } else {
            window.CC.state.setSection('labs-registrations');
          }
        });
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.calendar = { render };
})();
