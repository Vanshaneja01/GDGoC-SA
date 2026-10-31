/**
 * GDGconnect - Database & Storage Layer (localStorage with comprehensive seed data)
 * Enforces dynamic relational integrity between Mentors, Ambassadors, Tasks, Sessions, Labs, etc.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'gdgconnect_data_v2';
  const LEGACY_STORAGE_KEY = 'gdgconnect_data_v1';

  // Realistic seed data
  const SEED_DATA = {
    mentors: [
      {
        id: "MTR-101",
        name: "Disha Agarwal",
        email: "disha.agarwal@gdgconnect.edu",
        phone: "+91 98765 43210",
        institution: "IIMT University • IIMTBIF",
        department: "AI & Distributed Systems",
        avatar: "DA",
        expertise: ["Generative AI", "Cloud Systems", "Research Methods", "Career Strategy"],
        bio: "Senior Student Ambassador Mentor with deep expertise in AI pipelines, student outreach, and Google developer technology tracks.",
        availability: "Available",
        maxMentees: 8,
        joinedDate: "2024-01-15",
        officeHours: "Tue & Thu, 2:00 PM - 5:00 PM",
        officeLocation: "IIMTBIF Innovation Wing, Lab 101"
      },
      {
        id: "MTR-102",
        name: "Aarushi Singh",
        email: "aarushi.singh@gdgconnect.edu",
        phone: "+91 98765 43211",
        institution: "IIMT University • IIMTBIF",
        department: "Cybersecurity & Networks",
        avatar: "AS",
        expertise: ["Network Defense", "Ethical Hacking", "Student Leadership", "Sponsorship Outreach"],
        bio: "Lead student mentor specializing in campus cybersecurity challenges, technical workshops, and national hackathon preparation.",
        availability: "Available",
        maxMentees: 6,
        joinedDate: "2024-03-01",
        officeHours: "Mon & Wed, 10:00 AM - 1:00 PM",
        officeLocation: "IIMTBIF Lab 102"
      },
      {
        id: "MTR-103",
        name: "Akshita Tyagi",
        email: "akshita.tyagi@gdgconnect.edu",
        phone: "+91 98765 43212",
        institution: "IIMT University • IIMTBIF",
        department: "Human-Computer Interaction",
        avatar: "AT",
        expertise: ["Product Design", "UX Research", "Community Engagement", "Solution Challenge"],
        bio: "Mentor fostering collaborative engineering teams, UI/UX bootcamps, and accessibility initiatives for Google Solution Challenge.",
        availability: "Limited Slots",
        maxMentees: 5,
        joinedDate: "2024-08-10",
        officeHours: "Fri, 11:00 AM - 3:00 PM",
        officeLocation: "Design Innovation Hub, Studio B"
      },
      {
        id: "MTR-104",
        name: "Arsh Zehra",
        email: "arsh.zehra@gdgconnect.edu",
        phone: "+91 98765 43213",
        institution: "IIMT University • IIMTBIF",
        department: "DevOps & Software Eng",
        avatar: "AZ",
        expertise: ["DevOps Pipelines", "Open Source", "Kubernetes", "Public Speaking"],
        bio: "Software engineering mentor advising campus ambassadors on technical curriculum, open-source workshop facilitation, and cloud labs.",
        availability: "Available",
        maxMentees: 6,
        joinedDate: "2024-11-05",
        officeHours: "Wed, 3:00 PM - 6:00 PM",
        officeLocation: "Innovation Hall, Rm 204"
      },
      {
        id: "MTR-105",
        name: "Khyati",
        email: "khyati@gdgconnect.edu",
        phone: "+91 98765 43214",
        institution: "IIMT University • IIMTBIF",
        department: "Mobile & Cloud Technologies",
        avatar: "KH",
        expertise: ["Flutter & Dart", "Android Compose", "Cloud Architecture", "Event Planning"],
        bio: "Mobile systems lead and mentor driving cross-platform developer adoption, hackathon mentoring, and community outreach.",
        availability: "Available",
        maxMentees: 6,
        joinedDate: "2025-01-10",
        officeHours: "Thu, 1:00 PM - 4:00 PM",
        officeLocation: "Mobile Development Center, Rm 105"
      }
    ],

    ambassadors: [
      {
        id: "AMB-201",
        name: "Alex Rivera",
        email: "alex.rivera@student.gdgconnect.edu",
        phone: "+1 (555) 782-9912",
        institution: "School of Computing & Data Sciences",
        department: "Computer Science",
        year: "Junior (Year 3)",
        mentorId: "MTR-101", // Linked to Dr. Evelyn Vance
        skills: ["React", "Python", "Community Outreach", "Public Speaking", "Event Logistics"],
        bio: "Lead student ambassador organizing AI lab workshops, campus outreach campaigns, and student study circles. Passionate about AI ethics.",
        status: "Active",
        joinedDate: "2025-08-15",
        avatar: "AR"
      },
      {
        id: "AMB-202",
        name: "Maya Patel",
        email: "maya.patel@student.gdgconnect.edu",
        phone: "+1 (555) 843-2219",
        institution: "College of Engineering",
        department: "Cybersecurity & IT",
        year: "Senior (Year 4)",
        mentorId: "MTR-102", // Linked to Prof. Marcus Sterling
        skills: ["Network Security", "Linux Admin", "Technical Writing", "Workshop Facilitation"],
        bio: "Cyber defense club president and campus ambassador. Spearheads capture-the-flag competitions and security awareness drives.",
        status: "Active",
        joinedDate: "2025-06-10",
        avatar: "MP"
      },
      {
        id: "AMB-203",
        name: "Liam Zhang",
        email: "liam.zhang@student.gdgconnect.edu",
        phone: "+1 (555) 321-7788",
        institution: "School of Informatics",
        department: "Data Science & Statistics",
        year: "Sophomore (Year 2)",
        mentorId: "MTR-101", // Also linked to Dr. Evelyn Vance
        skills: ["Python", "SQL", "Graphic Design", "Social Media Outreach"],
        bio: "Data enthusiast coordinating student registrations, tracking outreach performance analytics, and managing digital campaign assets.",
        status: "Active",
        joinedDate: "2025-09-01",
        avatar: "LZ"
      },
      {
        id: "AMB-204",
        name: "Sophia Torres",
        email: "sophia.torres@student.gdgconnect.edu",
        phone: "+1 (555) 914-6352",
        institution: "School of Informatics",
        department: "Human-Centered Design",
        year: "Junior (Year 3)",
        mentorId: "MTR-103", // Linked to Dr. Alistair Chen
        skills: ["Figma", "User Research", "Event Coordination", "Content Creation"],
        bio: "UI/UX lead driving human-centric design workshops, creating brand collateral for lab registrations, and facilitating student focus groups.",
        status: "Active",
        joinedDate: "2025-08-25",
        avatar: "ST"
      },
      {
        id: "AMB-205",
        name: "David Kim",
        email: "david.kim@student.gdgconnect.edu",
        phone: "+1 (555) 601-8472",
        institution: "College of Sciences",
        department: "Software Engineering",
        year: "Senior (Year 4)",
        mentorId: "MTR-104", // Linked to Prof. Nadia Morales
        skills: ["Docker", "Node.js", "Git / GitHub", "Peer Mentoring"],
        bio: "Open-source maintainer coordinating software lab deployments and guiding first-year students through coding bootcamps.",
        status: "Active",
        joinedDate: "2025-05-18",
        avatar: "DK"
      },
      {
        id: "AMB-206",
        name: "Chloe Bennett",
        email: "chloe.bennett@student.gdgconnect.edu",
        phone: "+91 98765 43225",
        institution: "School of Engineering & Technology",
        department: "Electrical & Computer Eng",
        year: "Freshman (Year 1)",
        mentorId: "MTR-105",
        skills: ["Arduino", "Robotics", "Student Relations", "Campus Networking"],
        bio: "Newly joined freshman ambassador launching IoT lab showcases and hardware hackathons.",
        status: "Active",
        joinedDate: "2026-10-01",
        avatar: "CB"
      },
      {
        id: "AMB-207",
        name: "Rohan Sharma",
        email: "rohan.sharma@student.gdgconnect.edu",
        phone: "+91 98765 43226",
        institution: "Department of Computer Science & Engineering",
        department: "B.Tech CSE",
        year: "Junior (Year 3)",
        mentorId: "MTR-101",
        skills: ["Machine Learning", "Python", "Cloud Architecture", "Public Speaking"],
        bio: "Student ambassador leading AI & ML study jams and DevFest student outreach at IIMTU.",
        status: "Active",
        joinedDate: "2025-08-10",
        avatar: "RS"
      },
      {
        id: "AMB-208",
        name: "Priya Patel",
        email: "priya.patel@student.gdgconnect.edu",
        phone: "+91 98765 43227",
        institution: "School of Computer Applications",
        department: "BCA & Cloud Computing",
        year: "Sophomore (Year 2)",
        mentorId: "MTR-102",
        skills: ["Network Security", "Linux Admin", "Technical Content", "Community Building"],
        bio: "Campus ambassador coordinating cybersecurity awareness drives and student CTF hackathons.",
        status: "Active",
        joinedDate: "2025-09-12",
        avatar: "PP"
      },
      {
        id: "AMB-209",
        name: "Aman Verma",
        email: "aman.verma@student.gdgconnect.edu",
        phone: "+91 98765 43228",
        institution: "Department of Computer Science & Engineering",
        department: "B.Tech AI & Data Science",
        year: "Junior (Year 3)",
        mentorId: "MTR-103",
        skills: ["UI/UX", "Figma", "Web Performance", "Event Management"],
        bio: "Creative design and frontend lead organizing student hackathons and Solution Challenge teams.",
        status: "Active",
        joinedDate: "2025-08-20",
        avatar: "AV"
      },
      {
        id: "AMB-210",
        name: "Sneha Gupta",
        email: "sneha.gupta@student.gdgconnect.edu",
        phone: "+91 98765 43229",
        institution: "School of Engineering & Technology",
        department: "B.Tech Information Technology",
        year: "Senior (Year 4)",
        mentorId: "MTR-104",
        skills: ["DevOps", "Docker", "Git / GitHub", "Peer Mentoring"],
        bio: "Open source advocate guiding first-year students through coding bootcamps and Git workshops.",
        status: "Active",
        joinedDate: "2025-06-05",
        avatar: "SG"
      },
      {
        id: "AMB-211",
        name: "Arjun Rao",
        email: "arjun.rao@student.gdgconnect.edu",
        phone: "+91 98765 43230",
        institution: "School of Computer Applications",
        department: "MCA & Mobile Computing",
        year: "Postgraduate (Year 1)",
        mentorId: "MTR-105",
        skills: ["Flutter", "Android Compose", "Firebase", "Workshop Logistics"],
        bio: "Mobile developer ambassador facilitating cross-platform workshops and app launch sprints.",
        status: "Active",
        joinedDate: "2025-07-15",
        avatar: "AR"
      }
    ],

    tasks: [
      {
        id: "TSK-301",
        title: "Coordinate AI Innovation Lab Orientation",
        description: "Organize the fall semester AI & Deep Learning Lab orientation session, secure room reservation, and set up equipment.",
        category: "Event Coordination",
        assigneeId: "AMB-201",
        creatorId: "MTR-101",
        priority: "High",
        startDate: "2026-10-18",
        deadline: "2026-10-24",
        status: "In Progress",
        instructions: "1. Reserve Turing Science Hall Room 402.\n2. Confirm audio-visual setup.\n3. Send calendar invites to confirmed attendees.\n4. Ensure 30+ students RSVP.",
        attachments: [{ name: "Lab_Orientation_Checklist.pdf", url: "#" }],
        submission: null,
        feedback: null,
        comments: [
          { id: "cmt-1", authorId: "MTR-101", authorName: "Dr. Evelyn Vance", text: "Please make sure to test the projector 30 mins prior.", timestamp: "2026-10-18T14:00:00Z" },
          { id: "cmt-2", authorId: "AMB-201", authorName: "Alex Rivera", text: "Room reserved! Will conduct AV test on Friday.", timestamp: "2026-10-19T09:30:00Z" }
        ]
      },
      {
        id: "TSK-302",
        title: "Verify First Batch of Cybersecurity Lab Registrations",
        description: "Review incoming participant registrations for Lab 102, verify academic prerequisites, and flag missing contact numbers.",
        category: "Registration",
        assigneeId: "AMB-202",
        creatorId: "MTR-102",
        priority: "Urgent",
        startDate: "2026-10-15",
        deadline: "2026-10-22",
        status: "Submitted",
        instructions: "Cross-check participant email addresses with university student directory and update status to 'Verified' or 'Awaiting Information'.",
        attachments: [{ name: "Verification_Guidelines.pdf", url: "#" }],
        submission: {
          notes: "Processed all 45 pending registrations. 38 verified, 7 flagged for incomplete student IDs.",
          submittedAt: "2026-10-21T16:20:00Z",
          links: ["https://gdgconnect.edu/drive/lab-102-audit-report.xlsx"]
        },
        feedback: {
          mentorId: "MTR-102",
          rating: 5,
          comments: "Excellent turnaround Maya! Clean audit and clear notes on the flagged records.",
          reviewedAt: "2026-10-21T18:40:00Z"
        },
        comments: []
      },
      {
        id: "TSK-303",
        title: "Publish Outreach Campaign Graphics on Social Hub",
        description: "Design and schedule promotional banners for upcoming registration drives across engineering social channels.",
        category: "Content Creation",
        assigneeId: "AMB-204",
        creatorId: "MTR-103",
        priority: "Medium",
        startDate: "2026-10-12",
        deadline: "2026-10-20",
        status: "Completed",
        instructions: "Produce 3 Figma assets: Instagram feed (1080x1080), LinkedIn banner (1200x628), and Discord event banner.",
        attachments: [],
        submission: {
          notes: "All 3 creative banners rendered and scheduled for auto-posting.",
          submittedAt: "2026-10-19T11:00:00Z",
          links: ["https://figma.com/file/gdgconnect-assets"]
        },
        feedback: {
          mentorId: "MTR-103",
          rating: 5,
          comments: "Striking design palette that aligns with our olive/forest identity! Approved.",
          reviewedAt: "2026-10-19T15:30:00Z"
        },
        comments: []
      },
      {
        id: "TSK-304",
        title: "Docker & Containerization Hands-On Guide",
        description: "Write a step-by-step documentation guide for DevOps Lab participants to configure local container environments.",
        category: "Lab Management",
        assigneeId: "AMB-205",
        creatorId: "MTR-104",
        priority: "High",
        startDate: "2026-10-10",
        deadline: "2026-10-18",
        status: "Overdue", // Intentionally overdue to demonstrate overdue indicator!
        instructions: "Include Windows WSL2, macOS Homebrew, and Ubuntu apt-get installation instructions with screenshots.",
        attachments: [],
        submission: null,
        feedback: null,
        comments: [
          { id: "cmt-3", authorId: "MTR-104", authorName: "Prof. Nadia Morales", text: "Hi David, checking in on this guide. Let me know if you need review on WSL2 instructions.", timestamp: "2026-10-19T08:00:00Z" }
        ]
      },
      {
        id: "TSK-305",
        title: "Weekly Outreach Performance Analytics Sheet",
        description: "Consolidate attendance metrics and conversion percentages from all outreach booths into the central dashboard.",
        category: "Reporting",
        assigneeId: "AMB-203",
        creatorId: "MTR-101",
        priority: "Medium",
        startDate: "2026-10-19",
        deadline: "2026-10-26",
        status: "To Do",
        instructions: "Pull raw signup counts from Google Sheets and input verified counts into GDGconnect database.",
        attachments: [],
        submission: null,
        feedback: null,
        comments: []
      },
      {
        id: "TSK-306",
        title: "Ambassador Peer Training Session on Public Speaking",
        description: "Conduct a 45-minute practice session for junior ambassadors to rehearse their 3-minute lecture hall pitches.",
        category: "Training",
        assigneeId: "AMB-201",
        creatorId: "MTR-101",
        priority: "Medium",
        startDate: "2026-10-20",
        deadline: "2026-10-27",
        status: "Changes Requested",
        instructions: "Prepare a slide deck with dos and don'ts, elevator pitch outline, and mock Q&A scenarios.",
        attachments: [],
        submission: {
          notes: "Drafted 8 slides on classroom announcements.",
          submittedAt: "2026-10-20T16:00:00Z",
          links: []
        },
        feedback: {
          mentorId: "MTR-101",
          rating: 3,
          comments: "Good foundation, but please add a slide specifically addressing how to handle questions about lab prerequisites and time commitment.",
          reviewedAt: "2026-10-21T10:15:00Z"
        },
        comments: []
      }
    ],

    mentorSessions: [
      {
        id: "MSN-401",
        title: "1-on-1 Strategic Growth & Milestone Check-in",
        description: "Bi-weekly mentoring check-in to review ambassador goals, lab outreach progress, and academic-mentorship alignment.",
        mentorId: "MTR-101",
        ambassadorIds: ["AMB-201"],
        date: "2026-10-24",
        startTime: "15:00",
        endTime: "15:45",
        meetingType: "Virtual",
        location: "GDGconnect Meet (meet.gdgconnect.edu/vance-alex)",
        agenda: "1. Review sprint tasks\n2. Discuss lab participant recruitment tactics\n3. Q&A and blockers",
        prepInstructions: "Please bring your current registration roster and week 42 report draft.",
        status: "Approved",
        notes: "Ambassador is making steady progress on lab target. Needs more outreach support in sophomore CS classes.",
        followUp: "Dr. Vance to email Department Chair to announce lab registrations in CS201 lecture."
      },
      {
        id: "MSN-402",
        title: "Cyber Defense Workshop Preparation Sync",
        description: "Align on cloud VM infrastructure, permissions, and lab safety rules for upcoming CTF competition.",
        mentorId: "MTR-102",
        ambassadorIds: ["AMB-202"],
        date: "2026-10-23",
        startTime: "11:00",
        endTime: "12:00",
        meetingType: "In-Person",
        location: "Engineering Quad, Lab 108",
        agenda: "Review vulnerability machine images, test isolated subnet, verify student access keys.",
        prepInstructions: "Have GitHub repo with Docker configs open and tested.",
        status: "Approved",
        notes: "Discussed firewall configuration.",
        followUp: "Issue student keys by Wednesday."
      },
      {
        id: "MSN-403",
        title: "Guidance on UI/UX User Testing Framework",
        description: "Ambassador requested mentor consultation on how to conduct ethical participant testing for the campus app redesign.",
        mentorId: "MTR-103",
        ambassadorIds: ["AMB-204"],
        date: "2026-10-25",
        startTime: "14:00",
        endTime: "14:45",
        meetingType: "Virtual",
        location: "meet.gdgconnect.edu/chen-sophia",
        agenda: "1. Review consent form\n2. Discuss usability task scenarios\n3. Data anonymization best practices",
        prepInstructions: "Review IRB human subjects guidelines v4.",
        status: "Requested", // Pending mentor approval!
        notes: "",
        followUp: ""
      },
      {
        id: "MSN-404",
        title: "Group Mentorship: Research Paper Publishing 101",
        description: "Group mentoring session for all computing ambassadors interested in turning campus lab projects into conference submissions.",
        mentorId: "MTR-101",
        ambassadorIds: ["AMB-201", "AMB-203"],
        date: "2026-10-18",
        startTime: "16:00",
        endTime: "17:30",
        meetingType: "In-Person",
        location: "Turing Science Hall, Seminar Room A",
        agenda: "Literature review techniques, LaTeX formatting, IEEE/ACM conference timelines.",
        prepInstructions: "Read sample abstract handout.",
        status: "Completed",
        notes: "Great engagement from both Alex and Liam. Liam is interested in IEEE BigData workshop.",
        followUp: "Share LaTeX template on Resources portal."
      }
    ],

    ambassadorSessions: [
      {
        id: "ASN-501",
        title: "Hands-on PyTorch & Neural Networks Lab Workshop",
        description: "Practical session introducing undergraduate CS and Data Science students to neural net training in the campus cloud cluster.",
        category: "Workshop",
        organizerId: "AMB-201",
        mentorId: "MTR-101",
        date: "2026-10-26",
        startTime: "16:00",
        endTime: "18:00",
        venue: "Turing Hall, Room B-12 & Live Stream",
        targetAudience: "Undergraduate CS / Data Science students",
        registrationLimit: 60,
        registeredCount: 48,
        expectedOutcomes: "Students configure campus GPU access and train their first image classifier.",
        supportingResources: "Lab manual v2.1, Git repo starter templates",
        status: "Approved",
        postSessionReport: null
      },
      {
        id: "ASN-502",
        title: "Campus Security & Ethical Hacking Orientation",
        description: "Interactive demo showing web security vulnerabilities (SQL injection, XSS) and how modern defenses remediate them.",
        category: "Lab Orientation",
        organizerId: "AMB-202",
        mentorId: "MTR-102",
        date: "2026-10-28",
        startTime: "15:00",
        endTime: "17:00",
        venue: "Engineering Building, Cyber Auditorium 101",
        targetAudience: "Engineering & IT students of all years",
        registrationLimit: 75,
        registeredCount: 64,
        expectedOutcomes: "Understand basic security hygiene and register for Lab 102 CTF tournament.",
        supportingResources: "OWASP Top 10 cheatsheet, Cyber Lab sign-up QR code",
        status: "Approved",
        postSessionReport: null
      },
      {
        id: "ASN-503",
        title: "Campus Center Registration Drive & Demo Booth",
        description: "Pop-up outreach booth in Student Union with interactive tablet demos, stickers, and one-click lab enrollment.",
        category: "Registration Drive",
        organizerId: "AMB-203",
        mentorId: "MTR-101",
        date: "2026-10-29",
        startTime: "10:00",
        endTime: "14:00",
        venue: "Student Union Atrium, Booth 4",
        targetAudience: "General campus student body",
        registrationLimit: 120,
        registeredCount: 35,
        expectedOutcomes: "Engage 100+ visitors and collect 50+ qualified lab registrations.",
        supportingResources: "Roll-up banners, tablets, QR cards",
        status: "Pending Mentor Approval", // Ambassador proposed, mentor needs to review!
        postSessionReport: null
      },
      {
        id: "ASN-504",
        title: "Intro to Git, GitHub & Open Source Collaboration",
        description: "Foundational workshop teaching version control, branch workflows, and pull request reviews.",
        category: "Training",
        organizerId: "AMB-205",
        mentorId: "MTR-104",
        date: "2026-10-14",
        startTime: "17:00",
        endTime: "19:00",
        venue: "Innovation Hall, Lab 3",
        targetAudience: "First and second year STEM students",
        registrationLimit: 50,
        registeredCount: 46,
        expectedOutcomes: "Create GitHub accounts, fork sample repo, make pull request.",
        supportingResources: "GitHub Student Developer Pack guide",
        status: "Completed",
        postSessionReport: {
          attendedCount: 42,
          outcomesAchieved: "39 students successfully submitted pull requests.",
          challenges: "Two students had 2FA issues with university email.",
          feedbackRating: 4.9,
          notes: "Very high energy and enthusiasm. Several requested an advanced Docker follow-up.",
          submittedAt: "2026-10-15T10:00:00Z"
        }
      }
    ],

    labs: [
      {
        id: "LAB-101",
        name: "AI & Deep Learning Innovation Lab",
        description: "Specialized campus research lab conducting applied research in transformer architectures, computer vision, and distributed inference.",
        mentorId: "MTR-101",
        ambassadorIds: ["AMB-201", "AMB-203"],
        target: 100,
        startDate: "2026-09-01",
        endDate: "2026-12-15",
        status: "Active",
        room: "Turing Science Center Rm 402",
        schedule: "Mon/Wed 4:00 PM - 6:00 PM"
      },
      {
        id: "LAB-102",
        name: "Cybersecurity & Cloud Defense Lab",
        description: "Hands-on red team/blue team sandbox evaluating network intrusion, secure container orchestration, and cryptography.",
        mentorId: "MTR-102",
        ambassadorIds: ["AMB-202"],
        target: 80,
        startDate: "2026-09-01",
        endDate: "2026-12-15",
        status: "Active",
        room: "Engineering Quad Lab 108",
        schedule: "Tue/Thu 5:00 PM - 7:00 PM"
      },
      {
        id: "LAB-103",
        name: "Human-Centered Design & UX Lab",
        description: "Collaborative research studio prototyping accessible web applications, user journey mapping, and mobile interfaces.",
        mentorId: "MTR-103",
        ambassadorIds: ["AMB-204"],
        target: 60,
        startDate: "2026-09-15",
        endDate: "2026-12-10",
        status: "Active",
        room: "Design Studio Hub Rm C",
        schedule: "Fri 1:00 PM - 4:00 PM"
      },
      {
        id: "LAB-104",
        name: "DevOps & Cloud Systems Lab",
        description: "Engineering cluster focusing on automated CI/CD pipelines, Kubernetes clusters, and microservices resilience.",
        mentorId: "MTR-104",
        ambassadorIds: ["AMB-205"],
        target: 75,
        startDate: "2026-09-10",
        endDate: "2026-12-18",
        status: "Active",
        room: "Innovation Hall Lab 204",
        schedule: "Thu 3:00 PM - 6:00 PM"
      }
    ],

    participants: [
      {
        id: "REG-1001",
        name: "Jordan Hayes",
        email: "jordan.hayes@student.gdgconnect.edu",
        phone: "+1 (555) 234-5678",
        labId: "LAB-101",
        ambassadorId: "AMB-201",
        registeredAt: "2026-10-18T11:20:00Z",
        verificationStatus: "Verified",
        notes: "Sophomore CS major, passed Data Structures with grade A.",
        lastUpdated: "2026-10-19T09:15:00Z"
      },
      {
        id: "REG-1002",
        name: "Samantha Wright",
        email: "samantha.w@student.gdgconnect.edu",
        phone: "+1 (555) 345-6789",
        labId: "LAB-101",
        ambassadorId: "AMB-201",
        registeredAt: "2026-10-18T14:45:00Z",
        verificationStatus: "Verified",
        notes: "Junior Data Science, prior experience in scikit-learn.",
        lastUpdated: "2026-10-19T10:00:00Z"
      },
      {
        id: "REG-1003",
        name: "Marcus Brody",
        email: "m.brody@student.gdgconnect.edu",
        phone: "+1 (555) 456-7890",
        labId: "LAB-101",
        ambassadorId: "AMB-203",
        registeredAt: "2026-10-19T16:10:00Z",
        verificationStatus: "Pending Verification",
        notes: "First year student; waiting on prerequisite verification.",
        lastUpdated: "2026-10-19T16:10:00Z"
      },
      {
        id: "REG-1004",
        name: "Elena Rostova",
        email: "elena.r@student.gdgconnect.edu",
        phone: "+1 (555) 567-8901",
        labId: "LAB-102",
        ambassadorId: "AMB-202",
        registeredAt: "2026-10-19T13:20:00Z",
        verificationStatus: "Verified",
        notes: "Senior Cyber major, Security+ certified.",
        lastUpdated: "2026-10-20T08:30:00Z"
      },
      {
        id: "REG-1005",
        name: "Tariq Al-Mansoor",
        email: "tariq.m@student.gdgconnect.edu",
        phone: "+1 (555) 678-9012",
        labId: "LAB-102",
        ambassadorId: "AMB-202",
        registeredAt: "2026-10-20T09:15:00Z",
        verificationStatus: "Awaiting Information",
        notes: "Missing student ID photocopy and lab waiver agreement.",
        lastUpdated: "2026-10-20T11:45:00Z"
      },
      {
        id: "REG-1006",
        name: "Chloe Vance (Fictional)",
        email: "chloe.v@student.gdgconnect.edu",
        phone: "+1 (555) 789-0123",
        labId: "LAB-103",
        ambassadorId: "AMB-204",
        registeredAt: "2026-10-17T15:00:00Z",
        verificationStatus: "Verified",
        notes: "Portfolio submitted; strong Figma background.",
        lastUpdated: "2026-10-18T12:00:00Z"
      },
      {
        id: "REG-1007",
        name: "Aiden Scott",
        email: "aiden.scott@student.gdgconnect.edu",
        phone: "+1 (555) 890-1234",
        labId: "LAB-104",
        ambassadorId: "AMB-205",
        registeredAt: "2026-10-16T10:00:00Z",
        verificationStatus: "Incomplete",
        notes: "Did not select lab time slot preference.",
        lastUpdated: "2026-10-17T14:20:00Z"
      },
      {
        id: "REG-1008",
        name: "Devon Miller",
        email: "devon.m@student.gdgconnect.edu",
        phone: "+1 (555) 901-2345",
        labId: "LAB-101",
        ambassadorId: "AMB-201",
        registeredAt: "2026-10-21T09:00:00Z",
        verificationStatus: "Pending Verification",
        notes: "Transferred from another college, checking equivalency.",
        lastUpdated: "2026-10-21T09:00:00Z"
      },
      {
        id: "REG-1009",
        name: "Hannah Lee",
        email: "hannah.lee@student.gdgconnect.edu",
        phone: "+1 (555) 012-3456",
        labId: "LAB-102",
        ambassadorId: "AMB-202",
        registeredAt: "2026-10-20T17:30:00Z",
        verificationStatus: "Rejected",
        notes: "Non-enrolled external inquiry; redirected to open public webinar.",
        lastUpdated: "2026-10-21T10:00:00Z"
      }
    ],

    reports: [
      {
        id: "RPT-601",
        period: "Week 42 (Oct 13 - Oct 19, 2026)",
        ambassadorId: "AMB-201",
        mentorId: "MTR-101",
        submittedAt: "2026-10-20T17:00:00Z",
        status: "Approved",
        completedTasks: "Organized classroom outreach across 3 CS lecture halls; vetted 18 student registrations; drafted orientation deck.",
        registrationsGained: 24,
        activities: "Conducted 1 orientation prep meeting; assisted 12 students with lab cloud credentials.",
        challenges: "Room 402 audio system had slight feedback; requested AV assistance for future sessions.",
        supportRequired: "Faculty mentor assistance to get lab flyer featured on the main CS student portal.",
        nextSteps: "Conduct PyTorch lab workshop on Oct 26; verify remaining 15 pending registrations.",
        mentorFeedback: "Terrific momentum this week Alex! Intranet announcement submitted today. High quality report.",
        rating: 5,
        reviewedAt: "2026-10-21T10:00:00Z"
      },
      {
        id: "RPT-602",
        period: "Week 42 (Oct 13 - Oct 19, 2026)",
        ambassadorId: "AMB-202",
        mentorId: "MTR-102",
        submittedAt: "2026-10-20T18:30:00Z",
        status: "Approved",
        completedTasks: "Processed 45 registrations for Cyber Lab; updated security waiver forms; tested CTF server subnet.",
        registrationsGained: 32,
        activities: "Coordinated with ACM-W chapter on joint security workshop.",
        challenges: "Seven students submitted invalid student ID numbers; currently chasing corrections.",
        supportRequired: "Need approval to increase lab registration capacity from 80 to 90.",
        nextSteps: "Host Cyber Lab orientation on Oct 28; finalize CTF prizes.",
        mentorFeedback: "Approved capacity increase to 90! Keep up the meticulous audit trail.",
        rating: 5,
        reviewedAt: "2026-10-21T11:30:00Z"
      },
      {
        id: "RPT-603",
        period: "Week 42 (Oct 13 - Oct 19, 2026)",
        ambassadorId: "AMB-204",
        mentorId: "MTR-103",
        submittedAt: "2026-10-21T14:00:00Z",
        status: "Submitted", // Pending mentor review
        completedTasks: "Designed promotional assets for all 4 labs; ran usability test with 8 freshmen.",
        registrationsGained: 15,
        activities: "Distributed stickers and flyers at campus coffee shop hub.",
        challenges: "Need more color print budget for physical campus boards.",
        supportRequired: "Budget voucher sign-off from mentor Dr. Chen.",
        nextSteps: "Schedule peer design critique; collect post-event feedback.",
        mentorFeedback: "",
        rating: 0,
        reviewedAt: null
      }
    ],

    announcements: [
      {
        id: "ANC-701",
        title: "Mid-Semester Lab Verification & Showcase Deadline",
        content: "All ambassadors must complete participant verification by Friday, 5:00 PM EST. The semester showcase will feature the top 3 outreach teams with faculty grants.",
        priority: "Urgent",
        audience: "All",
        authorName: "Dr. Evelyn Vance",
        authorId: "MTR-101",
        createdAt: "2026-10-20T08:00:00Z",
        expiresAt: "2026-11-05",
        pinned: true,
        readBy: ["AMB-201", "AMB-202"]
      },
      {
        id: "ANC-702",
        title: "New Cloud Cluster GPU Allocations Available for Workshops",
        content: "Campus IT has provisioned 30 high-memory virtual GPU instances for ambassador-led workshops in Labs 101 and 104. Reserve slots through your mentor.",
        priority: "Important",
        audience: "Ambassadors",
        authorName: "Prof. Nadia Morales",
        authorId: "MTR-104",
        createdAt: "2026-10-18T10:30:00Z",
        expiresAt: "2026-11-20",
        pinned: true,
        readBy: ["AMB-201"]
      },
      {
        id: "ANC-703",
        title: "Upcoming Mentor-Ambassador Networking Dinner",
        content: "Join us this coming Thursday at 6:30 PM in the Faculty Club for the quarterly appreciation reception. Light refreshments provided.",
        priority: "Normal",
        audience: "All",
        authorName: "Prof. Marcus Sterling",
        authorId: "MTR-102",
        createdAt: "2026-10-15T12:00:00Z",
        expiresAt: "2026-10-30",
        pinned: false,
        readBy: []
      }
    ],

    resources: [
      {
        id: "RES-801",
        title: "GDGconnect Ambassador Handbook & Code of Conduct 2026",
        category: "Onboarding",
        description: "Official guide covering expectations, campus permissions, code of ethics, and communication standards.",
        author: "Dr. Evelyn Vance",
        format: "PDF",
        size: "3.2 MB",
        url: "#download-handbook",
        downloads: 240,
        updatedAt: "2026-08-20"
      },
      {
        id: "RES-802",
        title: "Student Participant Verification & Privacy SOP",
        category: "Registration",
        description: "Standard operating procedure on handling student emails, FERPA privacy compliance, and registration data validation.",
        author: "Prof. Marcus Sterling",
        format: "DOCX",
        size: "1.1 MB",
        url: "#download-sop",
        downloads: 185,
        updatedAt: "2026-09-05"
      },
      {
        id: "RES-803",
        title: "AI & Deep Learning Lab Manual v3.4",
        category: "Lab Manuals",
        description: "Curriculum specifications, environment setup instructions, and code repository links for Lab 101 participants.",
        author: "Dr. Evelyn Vance",
        format: "PDF",
        size: "4.8 MB",
        url: "#download-ai-manual",
        downloads: 310,
        updatedAt: "2026-09-12"
      },
      {
        id: "RES-804",
        title: "Public Speaking & Lecture Hall Pitch Slide Deck",
        category: "Training",
        description: "Customizable 5-slide template designed for 2-minute class announcements with QR registration codes.",
        author: "Dr. Alistair Chen",
        format: "PPTX",
        size: "6.5 MB",
        url: "#download-slides",
        downloads: 145,
        updatedAt: "2026-09-18"
      },
      {
        id: "RES-805",
        title: "Printable Outreach Banners & Sticker Assets",
        category: "Outreach",
        description: "Vector high-resolution branding bundle for tabling events, posters, roll-ups, and student badges.",
        author: "Dr. Alistair Chen",
        format: "ZIP",
        size: "14.2 MB",
        url: "#download-branding-kit",
        downloads: 98,
        updatedAt: "2026-09-22"
      },
      {
        id: "RES-806",
        title: "Weekly Activity & Progress Report Template",
        category: "Reporting Templates",
        description: "Standardized structure for weekly ambassador milestone submissions with KPI calculation formulas.",
        author: "Prof. Nadia Morales",
        format: "XLSX",
        size: "450 KB",
        url: "#download-report-template",
        downloads: 215,
        updatedAt: "2026-08-30"
      },
      {
        id: "RES-807",
        title: "Frequently Asked Questions for Ambassadors & Mentors",
        category: "FAQs",
        description: "Answers to common queries regarding room booking, equipment checkout, participant dispute resolution, and milestone points.",
        author: "GDGconnect Operations",
        format: "PDF",
        size: "820 KB",
        url: "#download-faq",
        downloads: 380,
        updatedAt: "2026-10-01"
      }
    ],

    messages: [
      {
        id: "MSG-001",
        senderId: "MTR-101",
        receiverId: "AMB-201",
        text: "Hi Alex! Terrific progress on the registration drive yesterday.",
        timestamp: "2026-10-21T09:12:00Z",
        read: true
      },
      {
        id: "MSG-002",
        senderId: "AMB-201",
        receiverId: "MTR-101",
        text: "Thank you Dr. Vance! We hit 48 RSVPs for the PyTorch session. Will test the AV tomorrow.",
        timestamp: "2026-10-21T09:15:00Z",
        read: true
      },
      {
        id: "MSG-003",
        senderId: "MTR-101",
        receiverId: "AMB-201",
        text: "Sounds great. Remember to submit your slide deck revisions before our Friday sync.",
        timestamp: "2026-10-21T09:18:00Z",
        read: true
      },
      {
        id: "MSG-004",
        senderId: "AMB-202",
        receiverId: "MTR-102",
        text: "Prof. Sterling, the cyber lab student list has been audited. Sent you the report.",
        timestamp: "2026-10-21T16:25:00Z",
        read: true
      },
      {
        id: "MSG-005",
        senderId: "MTR-102",
        receiverId: "AMB-202",
        text: "Reviewed and approved Maya! The additional capacity is granted as well.",
        timestamp: "2026-10-21T18:42:00Z",
        read: false
      }
    ],

    tickets: [
      {
        id: "TCK-901",
        subject: "Requesting additional compute quota for Lab 101 workshop",
        category: "Lab Access",
        priority: "High",
        status: "In Progress",
        requesterId: "AMB-201",
        requesterName: "Alex Rivera",
        assignedMentorId: "MTR-101",
        createdAt: "2026-10-20T11:00:00Z",
        messages: [
          {
            senderId: "AMB-201",
            senderName: "Alex Rivera",
            text: "We need 15 extra temporary GPU accounts for the Oct 26 PyTorch session to support overflow students.",
            timestamp: "2026-10-20T11:00:00Z"
          },
          {
            senderId: "MTR-101",
            senderName: "Dr. Evelyn Vance",
            text: "Ticket forwarded to sysadmin; accounts will be provisioned by Thursday afternoon.",
            timestamp: "2026-10-20T14:30:00Z"
          }
        ]
      },
      {
        id: "TCK-902",
        subject: "Room projector flickering in Turing Hall 304",
        category: "Equipment",
        priority: "Medium",
        status: "Resolved",
        requesterId: "AMB-203",
        requesterName: "Liam Zhang",
        assignedMentorId: "MTR-101",
        createdAt: "2026-10-18T15:20:00Z",
        messages: [
          {
            senderId: "AMB-203",
            senderName: "Liam Zhang",
            text: "HDMI port on the lectern seems loose; signal cuts out during slide presentations.",
            timestamp: "2026-10-18T15:20:00Z"
          },
          {
            senderId: "MTR-101",
            senderName: "Dr. Evelyn Vance",
            text: "Facilities replaced the cable and adapter unit yesterday. Tested and confirmed operational.",
            timestamp: "2026-10-19T10:00:00Z"
          }
        ]
      },
      {
        id: "TCK-903",
        subject: "Participant Registration Conflict with Course Schedule",
        category: "Registration Glitch",
        priority: "Low",
        status: "Open",
        requesterId: "AMB-204",
        requesterName: "Sophia Torres",
        assignedMentorId: "MTR-103",
        createdAt: "2026-10-21T10:00:00Z",
        messages: [
          {
            senderId: "AMB-204",
            senderName: "Sophia Torres",
            text: "A participant registered for both Lab 101 and Lab 103 which meet at overlapping times. Need policy guidance.",
            timestamp: "2026-10-21T10:00:00Z"
          }
        ]
      }
    ],

    notifications: [
      {
        id: "NOTIF-1",
        userId: "AMB-201",
        title: "Task Feedback Received",
        message: "Dr. Evelyn Vance reviewed your submission for 'Ambassador Peer Training Session'.",
        type: "task",
        targetId: "TSK-306",
        timestamp: "2026-10-21T10:15:00Z",
        read: false
      },
      {
        id: "NOTIF-2",
        userId: "AMB-201",
        title: "Mentor Session Confirmed",
        message: "1-on-1 Strategic Growth & Milestone Check-in confirmed for Oct 24 at 3:00 PM.",
        type: "session",
        targetId: "MSN-401",
        timestamp: "2026-10-21T08:30:00Z",
        read: true
      },
      {
        id: "NOTIF-3",
        userId: "MTR-101",
        title: "Ambassador Session Proposal Awaiting Approval",
        message: "Liam Zhang proposed 'Campus Center Registration Drive & Demo Booth'.",
        type: "ambassador_session",
        targetId: "ASN-503",
        timestamp: "2026-10-20T14:00:00Z",
        read: false
      },
      {
        id: "NOTIF-4",
        userId: "MTR-101",
        title: "Weekly Report Submitted",
        message: "Alex Rivera submitted Week 42 Progress Report.",
        type: "report",
        targetId: "RPT-601",
        timestamp: "2026-10-20T17:00:00Z",
        read: true
      },
      {
        id: "NOTIF-5",
        userId: "ALL",
        title: "Urgent Announcement Published",
        message: "Mid-Semester Lab Verification & Showcase Deadline posted by Dr. Vance.",
        type: "announcement",
        targetId: "ANC-701",
        timestamp: "2026-10-20T08:00:00Z",
        read: false
      }
    ],

    activityLogs: [
      {
        id: "LOG-01",
        actorId: "MTR-101",
        actorName: "Dr. Evelyn Vance",
        actorRole: "Mentor",
        action: "Approved Weekly Report",
        details: "Approved Alex Rivera's Week 42 Progress Report with 5-star rating.",
        timestamp: "2026-10-21T10:00:00Z"
      },
      {
        id: "LOG-02",
        actorId: "AMB-201",
        actorName: "Alex Rivera",
        actorRole: "Ambassador",
        action: "Added Participant",
        details: "Registered Devon Miller into AI & Deep Learning Lab (LAB-101).",
        timestamp: "2026-10-21T09:00:00Z"
      },
      {
        id: "LOG-03",
        actorId: "AMB-202",
        actorName: "Maya Patel",
        actorRole: "Ambassador",
        action: "Completed Task Submission",
        details: "Submitted verification audit for Cyber Lab (TSK-302).",
        timestamp: "2026-10-21T16:20:00Z"
      },
      {
        id: "LOG-04",
        actorId: "MTR-102",
        actorName: "Prof. Marcus Sterling",
        actorRole: "Mentor",
        action: "Approved Task",
        details: "Approved Task TSK-302 with rating 5.",
        timestamp: "2026-10-21T18:40:00Z"
      },
      {
        id: "LOG-05",
        actorId: "AMB-203",
        actorName: "Liam Zhang",
        actorRole: "Ambassador",
        action: "Proposed Ambassador Session",
        details: "Submitted proposal for 'Campus Center Registration Drive & Demo Booth'.",
        timestamp: "2026-10-20T14:00:00Z"
      }
    ]
  };

  class Database {
    constructor() {
      this.data = null;
      this.init();
    }

    init() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
        if (stored) {
          this.data = JSON.parse(stored);
          // Check if data version or essential keys exist
          if (!this.data.mentors || !this.data.ambassadors) {
            this.reset();
          }
        } else {
          this.reset();
        }
      } catch (e) {
        console.error("Failed to parse stored GDGconnect data, falling back to seed:", e);
        this.reset();
      }
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error("Failed to save GDGconnect data to localStorage:", e);
      }
    }

    reset() {
      // Deep clone seed data
      this.data = JSON.parse(JSON.stringify(SEED_DATA));
      this.save();
    }

    exportJSON() {
      return JSON.stringify(this.data, null, 2);
    }

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.mentors && parsed.ambassadors && parsed.tasks) {
          this.data = parsed;
          this.save();
          return { success: true };
        } else {
          return { success: false, error: "Invalid backup format: missing required tables." };
        }
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // Generic Logger
    logActivity(actorId, actorName, actorRole, action, details) {
      const log = {
        id: "LOG-" + Date.now().toString(36).toUpperCase(),
        actorId,
        actorName,
        actorRole,
        action,
        details,
        timestamp: new Date().toISOString()
      };
      this.data.activityLogs.unshift(log);
      if (this.data.activityLogs.length > 100) {
        this.data.activityLogs.pop();
      }
      this.save();
      return log;
    }

    // Notifications
    addNotification(userId, title, message, type, targetId) {
      const notif = {
        id: "NOTIF-" + Date.now().toString(36).toUpperCase(),
        userId,
        title,
        message,
        type,
        targetId,
        timestamp: new Date().toISOString(),
        read: false
      };
      this.data.notifications.unshift(notif);
      this.save();
      return notif;
    }

    getNotificationsForUser(userId) {
      return (this.data.notifications || []).filter(n => n.userId === userId || n.userId === "ALL");
    }

    markNotificationRead(id) {
      const notif = (this.data.notifications || []).find(n => n.id === id);
      if (notif) {
        notif.read = true;
        this.save();
      }
    }

    markAllNotificationsRead(userId) {
      (this.data.notifications || []).forEach(n => {
        if (n.userId === userId || n.userId === "ALL") {
          n.read = true;
        }
      });
      this.save();
    }

    // Mentors
    getMentors() {
      return this.data.mentors || [];
    }

    getMentorById(id) {
      return (this.data.mentors || []).find(m => m.id === id) || null;
    }

    updateMentor(id, updates) {
      const index = this.data.mentors.findIndex(m => m.id === id);
      if (index !== -1) {
        this.data.mentors[index] = { ...this.data.mentors[index], ...updates };
        this.save();
        return this.data.mentors[index];
      }
      return null;
    }

    // Ambassadors
    getAmbassadors() {
      return this.data.ambassadors || [];
    }

    getAmbassadorById(id) {
      return (this.data.ambassadors || []).find(a => a.id === id) || null;
    }

    updateAmbassador(id, updates) {
      const index = this.data.ambassadors.findIndex(a => a.id === id);
      if (index !== -1) {
        this.data.ambassadors[index] = { ...this.data.ambassadors[index], ...updates };
        this.save();
        return this.data.ambassadors[index];
      }
      return null;
    }

    assignMentorToAmbassador(ambassadorId, mentorId) {
      const amb = this.getAmbassadorById(ambassadorId);
      if (amb) {
        amb.mentorId = mentorId;
        this.save();
        return amb;
      }
      return null;
    }

    // Dynamic relational helper: get mentor for ambassador
    getMentorForAmbassador(ambassadorId) {
      const amb = this.getAmbassadorById(ambassadorId);
      if (!amb || !amb.mentorId) return null;
      return this.getMentorById(amb.mentorId);
    }

    // Dynamic relational helper: get ambassadors assigned to mentor
    getAmbassadorsForMentor(mentorId) {
      return (this.data.ambassadors || []).filter(a => a.mentorId === mentorId);
    }

    // Tasks
    getTasks() {
      // Auto-flag overdue tasks
      const now = new Date();
      (this.data.tasks || []).forEach(task => {
        if (task.status !== 'Completed' && task.deadline) {
          const deadlineDate = new Date(task.deadline + 'T23:59:59');
          if (now > deadlineDate && task.status !== 'Overdue') {
            task.isOverdue = true;
          }
        }
      });
      return this.data.tasks || [];
    }

    getTaskById(id) {
      return this.getTasks().find(t => t.id === id) || null;
    }

    addTask(taskData) {
      const nextNum = (this.data.tasks || []).length + 301;
      const newTask = {
        id: "TSK-" + nextNum,
        comments: [],
        submission: null,
        feedback: null,
        ...taskData
      };
      this.data.tasks.push(newTask);
      this.save();
      return newTask;
    }

    updateTask(id, updates) {
      const index = this.data.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        this.data.tasks[index] = { ...this.data.tasks[index], ...updates };
        this.save();
        return this.data.tasks[index];
      }
      return null;
    }

    deleteTask(id) {
      const index = this.data.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        this.data.tasks.splice(index, 1);
        this.save();
        return true;
      }
      return false;
    }

    addTaskComment(taskId, authorId, authorName, text) {
      const task = this.getTaskById(taskId);
      if (task) {
        if (!task.comments) task.comments = [];
        const comment = {
          id: "cmt-" + Date.now().toString(36),
          authorId,
          authorName,
          text,
          timestamp: new Date().toISOString()
        };
        task.comments.push(comment);
        this.save();
        return comment;
      }
      return null;
    }

    // Mentor Sessions
    getMentorSessions() {
      return this.data.mentorSessions || [];
    }

    getMentorSessionById(id) {
      return (this.data.mentorSessions || []).find(s => s.id === id) || null;
    }

    addMentorSession(sessionData) {
      const nextNum = (this.data.mentorSessions || []).length + 401;
      const newSession = {
        id: "MSN-" + nextNum,
        notes: "",
        followUp: "",
        ...sessionData
      };
      this.data.mentorSessions.push(newSession);
      this.save();
      return newSession;
    }

    updateMentorSession(id, updates) {
      const index = this.data.mentorSessions.findIndex(s => s.id === id);
      if (index !== -1) {
        this.data.mentorSessions[index] = { ...this.data.mentorSessions[index], ...updates };
        this.save();
        return this.data.mentorSessions[index];
      }
      return null;
    }

    // Ambassador Sessions
    getAmbassadorSessions() {
      return this.data.ambassadorSessions || [];
    }

    getAmbassadorSessionById(id) {
      return (this.data.ambassadorSessions || []).find(s => s.id === id) || null;
    }

    addAmbassadorSession(sessionData) {
      const nextNum = (this.data.ambassadorSessions || []).length + 501;
      const newSession = {
        id: "ASN-" + nextNum,
        registeredCount: 0,
        postSessionReport: null,
        ...sessionData
      };
      this.data.ambassadorSessions.push(newSession);
      this.save();
      return newSession;
    }

    updateAmbassadorSession(id, updates) {
      const index = this.data.ambassadorSessions.findIndex(s => s.id === id);
      if (index !== -1) {
        this.data.ambassadorSessions[index] = { ...this.data.ambassadorSessions[index], ...updates };
        this.save();
        return this.data.ambassadorSessions[index];
      }
      return null;
    }

    // Labs
    getLabs() {
      return this.data.labs || [];
    }

    getLabById(id) {
      return (this.data.labs || []).find(l => l.id === id) || null;
    }

    addLab(labData) {
      const nextNum = (this.data.labs || []).length + 101;
      const newLab = {
        id: "LAB-" + nextNum,
        status: "Active",
        ambassadorIds: [],
        ...labData
      };
      this.data.labs.push(newLab);
      this.save();
      return newLab;
    }

    updateLab(id, updates) {
      const index = this.data.labs.findIndex(l => l.id === id);
      if (index !== -1) {
        this.data.labs[index] = { ...this.data.labs[index], ...updates };
        this.save();
        return this.data.labs[index];
      }
      return null;
    }

    // Participants (Registrations)
    getParticipants() {
      return this.data.participants || [];
    }

    getParticipantById(id) {
      return (this.data.participants || []).find(p => p.id === id) || null;
    }

    addParticipant(partData) {
      // Duplicate detection by email in the same lab
      const duplicate = (this.data.participants || []).find(
        p => p.email.toLowerCase() === partData.email.toLowerCase() && p.labId === partData.labId
      );
      if (duplicate) {
        return { success: false, error: `A participant with email ${partData.email} is already registered in this lab.` };
      }

      const nextNum = (this.data.participants || []).length + 1001;
      const newParticipant = {
        id: "REG-" + nextNum,
        registeredAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        verificationStatus: partData.verificationStatus || "Pending Verification",
        notes: partData.notes || "",
        ...partData
      };
      this.data.participants.unshift(newParticipant);
      this.save();
      return { success: true, data: newParticipant };
    }

    updateParticipant(id, updates) {
      const index = this.data.participants.findIndex(p => p.id === id);
      if (index !== -1) {
        this.data.participants[index] = {
          ...this.data.participants[index],
          ...updates,
          lastUpdated: new Date().toISOString()
        };
        this.save();
        return this.data.participants[index];
      }
      return null;
    }

    deleteParticipant(id) {
      const index = this.data.participants.findIndex(p => p.id === id);
      if (index !== -1) {
        this.data.participants.splice(index, 1);
        this.save();
        return true;
      }
      return false;
    }

    bulkUpdateParticipantStatus(ids, status) {
      let count = 0;
      (this.data.participants || []).forEach(p => {
        if (ids.includes(p.id)) {
          p.verificationStatus = status;
          p.lastUpdated = new Date().toISOString();
          count++;
        }
      });
      if (count > 0) this.save();
      return count;
    }

    // Reports
    getReports() {
      return this.data.reports || [];
    }

    getReportById(id) {
      return (this.data.reports || []).find(r => r.id === id) || null;
    }

    addReport(reportData) {
      const nextNum = (this.data.reports || []).length + 601;
      const newReport = {
        id: "RPT-" + nextNum,
        submittedAt: new Date().toISOString(),
        status: reportData.status || "Submitted",
        mentorFeedback: "",
        rating: 0,
        reviewedAt: null,
        ...reportData
      };
      this.data.reports.unshift(newReport);
      this.save();
      return newReport;
    }

    updateReport(id, updates) {
      const index = this.data.reports.findIndex(r => r.id === id);
      if (index !== -1) {
        this.data.reports[index] = { ...this.data.reports[index], ...updates };
        this.save();
        return this.data.reports[index];
      }
      return null;
    }

    // Announcements
    getAnnouncements() {
      return this.data.announcements || [];
    }

    addAnnouncement(announcementData) {
      const nextNum = (this.data.announcements || []).length + 701;
      const newAnn = {
        id: "ANC-" + nextNum,
        createdAt: new Date().toISOString(),
        readBy: [],
        pinned: false,
        ...announcementData
      };
      this.data.announcements.unshift(newAnn);
      this.save();
      return newAnn;
    }

    markAnnouncementRead(id, userId) {
      const ann = (this.data.announcements || []).find(a => a.id === id);
      if (ann && !ann.readBy.includes(userId)) {
        ann.readBy.push(userId);
        this.save();
      }
    }

    // Resources
    getResources() {
      return this.data.resources || [];
    }

    addResource(resourceData) {
      const nextNum = (this.data.resources || []).length + 801;
      const newRes = {
        id: "RES-" + nextNum,
        downloads: 0,
        updatedAt: new Date().toISOString().split('T')[0],
        ...resourceData
      };
      this.data.resources.push(newRes);
      this.save();
      return newRes;
    }

    // Messages
    getMessagesBetween(userA, userB) {
      return (this.data.messages || []).filter(
        m => (m.senderId === userA && m.receiverId === userB) ||
             (m.senderId === userB && m.receiverId === userA)
      ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    sendMessage(senderId, receiverId, text) {
      const msg = {
        id: "MSG-" + Date.now().toString(36),
        senderId,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        read: false
      };
      this.data.messages.push(msg);
      this.save();
      return msg;
    }

    // Tickets
    getTickets() {
      return this.data.tickets || [];
    }

    getTicketById(id) {
      return (this.data.tickets || []).find(t => t.id === id) || null;
    }

    addTicket(ticketData) {
      const nextNum = (this.data.tickets || []).length + 901;
      const newTicket = {
        id: "TCK-" + nextNum,
        status: "Open",
        createdAt: new Date().toISOString(),
        messages: [{
          senderId: ticketData.requesterId,
          senderName: ticketData.requesterName,
          text: ticketData.initialMessage || ticketData.subject,
          timestamp: new Date().toISOString()
        }],
        ...ticketData
      };
      this.data.tickets.unshift(newTicket);
      this.save();
      return newTicket;
    }

    replyToTicket(ticketId, senderId, senderName, text) {
      const ticket = this.getTicketById(ticketId);
      if (ticket) {
        ticket.messages.push({
          senderId,
          senderName,
          text,
          timestamp: new Date().toISOString()
        });
        this.save();
        return ticket;
      }
      return null;
    }

    updateTicketStatus(ticketId, status) {
      const ticket = this.getTicketById(ticketId);
      if (ticket) {
        ticket.status = status;
        this.save();
        return ticket;
      }
      return null;
    }

    // Dynamic Calculated Statistics (No hardcoded fake numbers!)
    getStatistics() {
      const mentors = this.getMentors();
      const ambassadors = this.getAmbassadors();
      const tasks = this.getTasks();
      const mentorSessions = this.getMentorSessions();
      const ambassadorSessions = this.getAmbassadorSessions();
      const participants = this.getParticipants();
      const reports = this.getReports();

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const activeTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'To Do').length;
      const pendingReviews = tasks.filter(t => t.status === 'Submitted' || t.status === 'Under Review').length;
      const overdueTasks = tasks.filter(t => t.status === 'Overdue' || t.isOverdue).length;

      const totalParticipants = participants.length;
      const verifiedParticipants = participants.filter(p => p.verificationStatus === 'Verified').length;
      const pendingParticipants = participants.filter(p => p.verificationStatus === 'Pending Verification').length;
      const incompleteParticipants = participants.filter(p => p.verificationStatus === 'Incomplete' || p.verificationStatus === 'Awaiting Information').length;
      const verificationRate = totalParticipants > 0 ? Math.round((verifiedParticipants / totalParticipants) * 100) : 0;

      const upcomingMentorSessions = mentorSessions.filter(s => s.status === 'Approved' && new Date(s.date) >= new Date()).length;
      const pendingMentorSessions = mentorSessions.filter(s => s.status === 'Requested').length;

      const upcomingAmbassadorSessions = ambassadorSessions.filter(s => (s.status === 'Approved' || s.status === 'Scheduled') && new Date(s.date) >= new Date()).length;
      const pendingAmbassadorSessions = ambassadorSessions.filter(s => s.status === 'Pending Mentor Approval').length;

      return {
        totalMentors: mentors.length,
        totalAmbassadors: ambassadors.length,
        totalTasks,
        completedTasks,
        activeTasks,
        pendingReviews,
        overdueTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalParticipants,
        verifiedParticipants,
        pendingParticipants,
        incompleteParticipants,
        verificationRate,
        upcomingMentorSessions,
        pendingMentorSessions,
        upcomingAmbassadorSessions,
        pendingAmbassadorSessions,
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length
      };
    }

    // Ambassador Leaderboard Calculation
    getLeaderboard() {
      const ambassadors = this.getAmbassadors();
      const tasks = this.getTasks();
      const participants = this.getParticipants();
      const ambSessions = this.getAmbassadorSessions();
      const reports = this.getReports();

      return ambassadors.map(amb => {
        const completedTasksCount = tasks.filter(t => t.assigneeId === amb.id && t.status === 'Completed').length;
        const verifiedRegistrationsCount = participants.filter(p => p.ambassadorId === amb.id && p.verificationStatus === 'Verified').length;
        const sessionsOrganizedCount = ambSessions.filter(s => s.organizerId === amb.id && (s.status === 'Completed' || s.status === 'Approved')).length;
        const approvedReportsCount = reports.filter(r => r.ambassadorId === amb.id && r.status === 'Approved').length;

        // Composite scoring formula
        const points = (completedTasksCount * 25) +
                       (verifiedRegistrationsCount * 15) +
                       (sessionsOrganizedCount * 40) +
                       (approvedReportsCount * 30);

        let tier = "Bronze";
        if (points >= 350) tier = "Diamond";
        else if (points >= 250) tier = "Gold";
        else if (points >= 150) tier = "Silver";

        return {
          ambassador: amb,
          completedTasksCount,
          verifiedRegistrationsCount,
          sessionsOrganizedCount,
          approvedReportsCount,
          points,
          tier
        };
      }).sort((a, b) => b.points - a.points);
    }
  }

  window.CC = window.CC || {};
  window.CC.db = new Database();
})();
