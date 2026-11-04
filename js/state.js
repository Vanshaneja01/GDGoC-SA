/**
 * GDGconnect - App State & Event Dispatcher
 * Manages active role, active user, active view, and cross-component reactivity
 */

(function () {
  'use strict';

  const THEME_KEY = 'campusconnect_theme';
  const CURRENT_USER_KEY = 'campusconnect_active_user';

  class StateManager {
    constructor() {
      this.listeners = {};
      this.role = 'Mentor'; // 'Mentor' or 'Ambassador'
      this.currentUser = null;
      this.activeSection = 'dashboard';
      this.theme = 'light';
      this.activeFilters = {};
      this.init();
    }

    init() {
      // Load theme - default to dark (E-Cell CA tech theme)
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        this.theme = savedTheme;
      } else {
        this.theme = 'dark';
      }
      this.applyTheme();

      // Check active authenticated session in storage (Strict Authentication, No URL Param Bypass)
      const savedSession = localStorage.getItem('gdgconnect_session') || localStorage.getItem(CURRENT_USER_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.id) {
            const userInDb = parsed.role === 'Mentor'
              ? window.CC.db.getMentorById(parsed.id)
              : window.CC.db.getAmbassadorById(parsed.id);

            if (userInDb) {
              this.currentUser = userInDb;
              this.role = parsed.role;
              return;
            }
          }
        } catch (e) {
          console.warn("Could not parse saved user session:", e);
        }
      }

      // Default to first mentor only if no prior session exists
      const defaultMentor = window.CC.db.getMentors()[0];
      if (defaultMentor) {
        this.currentUser = defaultMentor;
        this.role = 'Mentor';
      }
    }

    setRoleAndUser(role, userId) {
      this.role = role;
      if (role === 'Mentor') {
        this.currentUser = window.CC.db.getMentorById(userId) || window.CC.db.getMentors()[0];
      } else {
        this.currentUser = window.CC.db.getAmbassadorById(userId) || window.CC.db.getAmbassadors()[0];
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: this.currentUser.id,
        role: this.role
      }));

      this.emit('userChanged', { user: this.currentUser, role: this.role });
      this.emit('stateChanged', { type: 'user' });
    }

    switchRole(newRole) {
      // Role switching is strictly disabled to prevent mentors/ambassadors from accessing each other's dashboards
      console.warn("Cross-role dashboard switching is disabled for security.");
    }

    setSection(sectionId, extraParams = null) {
      this.activeSection = sectionId;
      this.emit('sectionChanged', { section: sectionId, params: extraParams });
    }

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, this.theme);
      this.applyTheme();
      this.emit('themeChanged', { theme: this.theme });
    }

    applyTheme() {
      if (this.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    // Event Bus
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }

    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(cb => {
          try {
            cb(data);
          } catch (err) {
            console.error(`Error in listener for event ${event}:`, err);
          }
        });
      }
    }

    refreshCurrentUserData() {
      if (!this.currentUser) return;
      const refreshed = this.role === 'Mentor'
        ? window.CC.db.getMentorById(this.currentUser.id)
        : window.CC.db.getAmbassadorById(this.currentUser.id);

      if (refreshed) {
        this.currentUser = refreshed;
        this.emit('userUpdated', this.currentUser);
      }
    }
  }

  window.CC = window.CC || {};
  window.CC.state = new StateManager();
})();
