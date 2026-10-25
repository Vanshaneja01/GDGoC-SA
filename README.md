# CampusConnect — Mentor & Ambassador Management Portal

CampusConnect is a modern, responsive web application designed to manage university faculty mentors, student ambassadors, task milestones, mentoring check-ins, student-led workshops, lab enrollments, participant verification, and team coordination.

The platform combines the best practices from ambassador management platforms (e.g. outreach tracking, tabling drives, gamified milestone recognition) and mentorship portals (1-on-1 advisement, session scheduling, task review workflows, and weekly progress appraisals).

---

## 🌟 Key Architecture & Principles

- **Strict Two-Role Architecture**: Exclusively two operational roles — **Mentor** and **Ambassador**.
- **Dynamic Relational Integrity**: Student ambassadors are linked to faculty mentors via unique IDs (`MTR-xxx`). When a mentor updates their contact information, phone, email, or availability, the change **instantly and dynamically reflects** on all assigned ambassadors' profiles and their **Mandatory MY MENTOR Card**.
- **Alert on Missing Mentors**: If an ambassador has no assigned mentor, an alert banner is displayed with a one-click mentor assignment workflow.
- **LocalStorage Relational Data Store**: Pre-seeded with realistic fictional data (mentors, ambassadors, tasks, sessions, labs, participants, announcements, support tickets, and direct chat messages) that can be backed up (JSON export), restored (JSON import), or reset to sample data at any time.
- **Zero Broken Links & Working Interactivity**: Every button, modal, form validation, filter, search, CSV import/export, and status transition is fully functional.

---

## 🗂️ Application Structure & Main Navigation

The application strictly implements the 13 navigation sections in the requested sequence, plus a contextual role-based overview dashboard:

1. **Mentors** (`mentors`): Searchable directory, availability filters, detailed mentor drawer, assigned ambassador roster, and permitted profile editing.
2. **Ambassadors** (`ambassadors`): Searchable student directory, academic year filters, detailed ambassador modal with the **MANDATORY MY MENTOR CARD**, task progression, and registration contribution.
3. **Tasks** (`tasks`): Interactive Kanban Board & Task Table views, category & priority filtering, overdue countdowns, work submission with evidence links, and mentor review/approval controls.
4. **Mentor Sessions** (`mentor-sessions`): 1-on-1 and group faculty mentoring, ambassador session requests, mentor approval & rescheduling, and private meeting notes.
5. **Ambassador Sessions** (`ambassador-sessions`): Student-organized workshops, lab orientations, and registration drives; mentor proposal sign-off; post-session attendance and debrief reporting.
6. **Labs & Registrations** (`labs-registrations`): Innovation lab target tracking, participant roster CRUD, **duplicate email detection**, **CSV export**, **CSV import with batch validation**, and bulk verification actions.
7. **Reports & Progress** (`reports`): Weekly progress report submissions, mentor rating evaluations (1-5 stars), constructive feedback, and dynamically calculated completion statistics.
8. **Announcements** (`announcements`): Faculty-published announcements with priority badges, pinned banners, audience targeting (All, Mentors, Ambassadors), and read/unread status.
9. **Resources & Learning** (`resources`): Categorized hub (Onboarding, SOPs, Lab Manuals, Pitch Decks, Templates, FAQs) with simulated downloads and mentor upload sharing.
10. **Communication & Help Desk** (`communication`): Real-time direct chat between mentors and ambassadors + multi-category support tickets with conversation history and status updates.
11. **Achievements & Recognition** (`achievements`): Gamified leaderboard calculated from actual stored metrics, milestone tiers (**Bronze, Silver, Gold, Diamond**), and recognition badges.
12. **Calendar** (`calendar`): Unified monthly and weekly calendar color-coding task deadlines (blue), mentor sessions (green), ambassador workshops (purple), and lab milestones (amber).
13. **Profile & Settings** (`profile-settings`): User details editing, role & identity switcher (switch seamlessly between Dr. Evelyn Vance, Prof. Marcus Sterling, Alex Rivera, Maya Patel, Liam Zhang, and Chloe Bennett), JSON backup/restore, and production architecture roadmap.

---

## 🎨 Design System

- **Palette**: Forest Green (`#204B24`) and Olive (`#4C6A2E`) accents on crisp, light card surfaces (`#F7F9F6`), with a complete Dark Theme (`#0C120C` / `#141C14`).
- **Typography**: Clean sans-serif hierarchy powered by Google Font `Inter` with monospace accents (`JetBrains Mono`).
- **Icons**: Crisp inline SVG icons (Lucide-inspired) embedded directly without external CDN dependencies.
- **Responsive**: Adapts fluidly to desktop, tablet, and mobile with a collapsible drawer sidebar.

---

## 🚀 How to Run

Because CampusConnect is built with pure standards-compliant HTML5, CSS3, and modern vanilla JavaScript, no heavy build tools or npm installation are required.

### Option 1: Direct Browser Launch
Simply double-click `index.html` in Windows Explorer or open it in Google Chrome, Microsoft Edge, Firefox, or Safari:
```text
C:\Users\vansh\.gemini\antigravity\scratch\campusconnect\index.html
```

### Option 2: Local HTTP Server (Optional)
If you prefer running via a local web server:

**Using Python:**
```bash
cd "C:\Users\vansh\.gemini\antigravity\scratch\campusconnect"
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

**Using Node.js:**
```bash
cd "C:\Users\vansh\.gemini\antigravity\scratch\campusconnect"
npx serve -l 8080
```

---

## 🧪 Testing the Two Roles & Key Workflows

1. **Role Switcher**: Click the **Mentor** or **Ambassador** pill in the top navigation bar at any time to instantly swap perspectives. You can also open **Profile & Settings** to switch specific user identities.
2. **Dynamic MY MENTOR Card Test**:
   - As `Dr. Evelyn Vance` (Mentor), go to **Mentors**, open your profile, click **Edit Permitted Details**, change your phone number, and save.
   - Switch role to `Alex Rivera` (Ambassador) and open your profile or look at your dashboard: the **MY MENTOR** card will immediately show Dr. Vance's updated phone number!
3. **No-Mentor Alert Test**:
   - Switch identity to `Chloe Bennett (AMB-206)`. Notice the clear amber alert: *"No Mentor Assigned Yet"*.
   - Click *"Assign Mentor Now"* to pair Chloe with a faculty mentor.
4. **Task Submission & Approval**:
   - As an Ambassador, open **Tasks**, click an assigned task, type submission notes, and click *"Submit Work for Review"*.
   - Switch to Mentor, open the task, write feedback, and click *"Approve & Mark Completed"*.
5. **Lab Registration & CSV Tools**:
   - Go to **Labs & Registrations**. Try registering a student with an email that already exists in that lab (e.g. `jordan.hayes@student.campusconnect.edu`) to see **Duplicate Detection** in action.
   - Click **Export CSV** to download a clean spreadsheet of your participants.
   - Click **Import CSV** to batch import participants.

---

## 🔒 Production Architecture & Security Roadmap

The current version runs as a self-contained, offline-first single-page application persisting state to browser `localStorage`. For production campus rollout:
- **Authentication**: JWT / OAuth2 integrated with university Single Sign-On (SSO / SAML / Shibboleth).
- **Database & Row-Level Security**: PostgreSQL (via Supabase or backend API) enforcing that ambassadors only access participants in their assigned labs.
- **FERPA Compliance**: Participant emails and contact numbers encrypted at rest with AES-256.
- **Real-Time Synchronization**: WebSockets for instant chat notifications and review status updates.
