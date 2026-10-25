/**
 * CampusConnect - Achievements & Recognition Section
 * Gamified Leaderboard, Milestone Tiers (Bronze, Silver, Gold, Diamond), & Verified Badges
 */

(function () {
  'use strict';

  function render(container) {
    const leaderboard = window.CC.db.getLeaderboard();
    const ui = window.CC.ui;
    const currentUser = window.CC.state.currentUser;

    container.innerHTML = `
      <div class="section-header">
        <div class="section-header-left">
          <h1 class="section-title">${ui.icon('award')} Achievements & Recognition</h1>
          <p class="section-subtitle">Celebrate verified milestones, campus outreach impact, and peer community leadership.</p>
        </div>
      </div>

      <!-- Milestone Tiers Overview Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
        <div class="card" style="padding: 1.25rem; border-top: 4px solid #006064; background-color: var(--bg-surface);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="badge tier-badge-diamond">Diamond Tier</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #006064;">350+ Pts</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 0.5rem;">Diamond Ambassador</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Faculty commendation, lab grant eligibility, and conference sponsorship.</p>
        </div>

        <div class="card" style="padding: 1.25rem; border-top: 4px solid #F57F17; background-color: var(--bg-surface);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="badge tier-badge-gold">Gold Tier</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #F57F17;">250+ Pts</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 0.5rem;">Gold Ambassador</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Lead workshop facilitation, guaranteed lab compute priority, and peer mentorship lead.</p>
        </div>

        <div class="card" style="padding: 1.25rem; border-top: 4px solid #616161; background-color: var(--bg-surface);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="badge tier-badge-silver">Silver Tier</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #616161;">150+ Pts</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 0.5rem;">Silver Ambassador</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Verified campus tabling rights, workshop co-hosting, and merchandise perks.</p>
        </div>

        <div class="card" style="padding: 1.25rem; border-top: 4px solid #8D6E63; background-color: var(--bg-surface);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="badge tier-badge-bronze">Bronze Tier</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #8D6E63;">0 - 149 Pts</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 0.5rem;">Bronze Ambassador</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Foundational onboarding, participant sourcing, and lecture announcements.</p>
        </div>
      </div>

      <!-- Split Layout: Leaderboard & Verified Badges -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.75rem;">
        
        <!-- Live Ambassador Leaderboard -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${ui.icon('award')} Ambassador Leaderboard</h3>
            <span class="badge badge-green">Calculated from verified DB metrics</span>
          </div>
          <div class="card-body" style="padding: 0;">
            ${leaderboard.map((item, idx) => {
              const rank = idx + 1;
              const amb = item.ambassador;
              const isMe = amb.id === currentUser.id;

              let rankBadgeClass = '';
              if (rank === 1) rankBadgeClass = 'rank-1';
              else if (rank === 2) rankBadgeClass = 'rank-2';
              else if (rank === 3) rankBadgeClass = 'rank-3';
              else rankBadgeClass = 'badge-gray';

              return `
                <div class="leaderboard-row" style="${isMe ? 'background-color: var(--color-primary-light);' : ''}">
                  <div style="display: flex; align-items: center; gap: 0.85rem;">
                    <div class="rank-badge ${rankBadgeClass}">${rank}</div>
                    ${ui.renderAvatar(amb.avatar, amb.name, 'md')}
                    <div>
                      <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">
                        ${ui.escape(amb.name)} ${isMe ? '<span class="badge badge-olive" style="font-size: 0.65rem;">You</span>' : ''}
                      </div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">
                        ${ui.escape(amb.department)} • ${ui.escape(amb.year)}
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <div style="text-align: right;">
                      <div style="font-size: 0.72rem; color: var(--text-secondary);">
                        ${item.completedTasksCount} tasks • ${item.verifiedRegistrationsCount} reg • ${item.sessionsOrganizedCount} workshops
                      </div>
                      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; margin-top: 2px;">
                        <span class="badge tier-badge-${item.tier.toLowerCase()}">${item.tier}</span>
                        <strong style="font-size: 1.15rem; color: var(--color-primary);">${item.points} pts</strong>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-outline" data-view-ambassador="${amb.id}">
                      Profile
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Verified Badges & Recognition Wall -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${ui.icon('award')} Verified Recognition Badges</h3>
          </div>
          <div class="card-body" style="display: flex; flex-direction: column; gap: 1rem;">
            
            <div style="padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background-color: var(--status-green-bg); color: var(--status-green); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                🎯
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Top Recruiter Badge</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Awarded for sourcing over 25 verified lab participants in a single semester.</p>
                <span class="badge badge-green" style="margin-top: 6px;">Earned by Alex Rivera, Maya Patel</span>
              </div>
            </div>

            <div style="padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background-color: #F3E5F5; color: #7B1FA2; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                ⚡
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Master Workshop Facilitator</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Successfully hosted and submitted post-event debriefs for 3+ approved workshops.</p>
                <span class="badge badge-olive" style="margin-top: 6px;">Earned by David Kim, Maya Patel</span>
              </div>
            </div>

            <div style="padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background-color: var(--status-amber-bg); color: var(--status-amber); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                ★
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">5-Star Evaluator Rating</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Awarded by faculty mentors for consistent punctuality and outstanding weekly reports.</p>
                <span class="badge badge-amber" style="margin-top: 6px;">Earned by Alex Rivera, Maya Patel</span>
              </div>
            </div>

            <div style="padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background-color: var(--status-blue-bg); color: var(--status-blue); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                🏛️
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">Faculty Leadership Star</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Special recognition for mentors guiding 5+ high-performing ambassadors.</p>
                <span class="badge badge-blue" style="margin-top: 6px;">Dr. Evelyn Vance, Prof. Marcus Sterling</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    container.querySelectorAll('[data-view-ambassador]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-view-ambassador');
        window.CC.sections.ambassadors.openAmbassadorModal(id);
      });
    });
  }

  window.CC = window.CC || {};
  window.CC.sections = window.CC.sections || {};
  window.CC.sections.achievements = { render };
})();
