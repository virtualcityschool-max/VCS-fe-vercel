export const INITIAL_TEACHER_SESSIONS = [
  {
    id: "ses-1",
    title: "Quantitative Reasoning & Analytical Mock",
    courseName: "University Entry Test Prep",
    category: "classes",
    timeAST: "06:30 PM AST",
    duration: "60 min",
    meetLink: "https://meet.google.com/vcs-uetp-101",
    status: "upcoming",
    attendeesCount: 2,
    maxAttendees: 15,
    instructor: "Aamir Waqas"
  },
  {
    id: "ses-2",
    title: "Cambridge O-Level Physics Past Paper Lab",
    courseName: "Cambridge O & A Level Physics",
    category: "classes",
    timeAST: "08:00 PM AST",
    duration: "90 min",
    meetLink: "https://meet.google.com/vcs-phys-204",
    status: "upcoming",
    attendeesCount: 8,
    maxAttendees: 12,
    instructor: "Aamir Waqas"
  },
  {
    id: "ses-3",
    title: "Term 2025\u201326 Rubric Calibration Sync",
    courseName: "Faculty Academic Board",
    category: "admin_session",
    timeAST: "04:00 PM AST",
    duration: "45 min",
    meetLink: "https://meet.google.com/vcs-admin-sync",
    status: "completed",
    attendeesCount: 6,
    maxAttendees: 6,
    instructor: "Dean of Academics"
  },
  {
    id: "ses-4",
    title: "1-on-1 Portfolio Review: Waqas (Roll #65)",
    courseName: "University Entry Test Prep",
    category: "reserved_slots",
    timeAST: "09:30 PM AST",
    duration: "30 min",
    meetLink: "https://meet.google.com/vcs-slot-65",
    status: "upcoming",
    attendeesCount: 1,
    maxAttendees: 1,
    instructor: "Aamir Waqas"
  }
];
export const INITIAL_COURSES = [
  {
    id: "crs-1",
    title: "University Entry Test Prep",
    code: "UETP-401",
    category: "CAREER \xB7 TEST PREPARATION",
    level: "Undergraduate Admissions",
    enrolledCount: 2,
    published: true,
    progress: 68,
    syllabusUnitsCompleted: 8,
    syllabusTotalUnits: 12,
    nextSessionTime: "Today, 06:30 PM AST",
    description: "Comprehensive preparation for engineering and medical college entrance examinations covering analytical logic and quantitative aptitude.",
    accentGradient: "from-emerald-900/80 via-slate-900 to-indigo-950"
  },
  {
    id: "crs-2",
    title: "Cambridge O & A Level Physics",
    code: "PHYS-9702",
    category: "CAMBRIDGE \xB7 SCIENCES",
    level: "IGCSE / AS & A2",
    enrolledCount: 8,
    published: true,
    progress: 75,
    syllabusUnitsCompleted: 9,
    syllabusTotalUnits: 12,
    nextSessionTime: "Today, 08:00 PM AST",
    description: "Rigorous coverage of Mechanics, Thermal Physics, Fields, and Past Paper Question Banks for Cambridge qualifications.",
    accentGradient: "from-indigo-900/80 via-slate-900 to-slate-950"
  },
  {
    id: "crs-3",
    title: "Classical Arabic & Tajweed Foundations",
    code: "ARB-102",
    category: "LANGUAGES \xB7 HUMANITIES",
    level: "Intermediate",
    enrolledCount: 5,
    published: true,
    progress: 50,
    syllabusUnitsCompleted: 5,
    syllabusTotalUnits: 10,
    nextSessionTime: "Thu, 05:00 PM AST",
    description: "Grammar morphology (Sarf & Nahw) paired with phonetic articulation checkpoints and classical prose reading.",
    accentGradient: "from-violet-900/80 via-slate-900 to-slate-950"
  },
  {
    id: "crs-4",
    title: "IGCSE Mathematics Extended (0580)",
    code: "MATH-0580",
    category: "CAMBRIDGE \xB7 MATHEMATICS",
    level: "Extended Tier",
    enrolledCount: 6,
    published: true,
    progress: 82,
    syllabusUnitsCompleted: 14,
    syllabusTotalUnits: 17,
    nextSessionTime: "Fri, 07:00 PM AST",
    description: "Algebraic manipulations, geometry, trigonometry, functions, and probability past paper drills targeting A* performance.",
    accentGradient: "from-blue-900/80 via-slate-900 to-slate-950"
  }
];
export const INITIAL_TASKS = [
  {
    id: "tsk-1",
    studentName: "Waqas",
    studentRoll: "Roll #65",
    courseTitle: "University Entry Test Prep",
    assignmentTitle: "Analytical Reasoning Set B \u2014 Logic Gates & Deductions",
    submittedAt: "2 hours ago",
    dueDate: "Today, 11:59 PM",
    status: "queued",
    maxMarks: 25,
    rubricCriterion: "Logical inference consistency & truth tables"
  },
  {
    id: "tsk-2",
    studentName: "Zainab Al-Harbi",
    studentRoll: "Roll #42",
    courseTitle: "Cambridge O & A Level Physics",
    assignmentTitle: "Kinematics & Projectile Motion Structured Questions",
    submittedAt: "5 hours ago",
    dueDate: "Yesterday",
    status: "overdue",
    maxMarks: 40,
    rubricCriterion: "Free body vector diagrams & component resolution"
  },
  {
    id: "tsk-3",
    studentName: "Hamza Siddiqui",
    studentRoll: "Roll #19",
    courseTitle: "University Entry Test Prep",
    assignmentTitle: "Quantitative Aptitude Diagnostic Paper 1",
    submittedAt: "1 day ago",
    dueDate: "Oct 08, 2026",
    status: "graded",
    maxMarks: 50,
    awardedMarks: 46,
    feedback: "Strong command of algebraic ratios; review time-speed-distance shortcuts.",
    rubricCriterion: "Calculation accuracy & step-by-step proofs"
  }
];
export const INITIAL_ASSIGNMENTS = [
  {
    id: "asg-1",
    title: "Analytical Reasoning Set B \u2014 Logic Gates & Deductions",
    courseTitle: "University Entry Test Prep",
    description: "Solve the 5 logic premise problems, construct condition matrices, and write step-by-step truth deductions. Submit scanned handwritten working or PDF solution.",
    submissionMethod: "file_upload",
    allowedFormats: ["PDF", "PNG", "DOCX"],
    launchDate: "2026-10-08",
    launchTime: "09:00 AM AST",
    dueDate: "2026-10-12",
    dueTime: "11:59 PM AST",
    maxMarks: 25,
    rubricCriterion: "Clarity of truth matrix (10m), Valid deductive chains (10m), Final answer consistency (5m)",
    status: "published",
    submissionsCount: 2,
    reviewedCount: 1
  },
  {
    id: "asg-2",
    title: "Kinematics & Projectile Motion Structured Problem Set",
    courseTitle: "Cambridge O & A Level Physics",
    description: "Calculate 2D projectile components, air resistance terminal velocity equations, and graphical acceleration vs time gradients. Show all formula derivations.",
    submissionMethod: "file_upload",
    allowedFormats: ["PDF"],
    launchDate: "2026-10-05",
    launchTime: "10:00 AM AST",
    dueDate: "2026-10-10",
    dueTime: "08:00 PM AST",
    maxMarks: 40,
    rubricCriterion: "Free body resolution (15m), Kinematic calculus equations (15m), Unit accuracy & significant figures (10m)",
    status: "published",
    submissionsCount: 8,
    reviewedCount: 5
  },
  {
    id: "asg-3",
    title: "Calculus Optimization & Tangent Normal Investigation",
    courseTitle: "IGCSE Mathematics Extended (0580)",
    description: "Find stationary turning points for polynomial and rational functions, classify local maxima/minima using second derivative tests, and provide real-world perimeter constraints.",
    submissionMethod: "online_text",
    launchDate: "2026-10-10",
    launchTime: "02:00 PM AST",
    dueDate: "2026-10-15",
    dueTime: "10:00 PM AST",
    maxMarks: 30,
    rubricCriterion: "Differentiation working (10m), Stationary points equation (10m), Nature of stationary points (10m)",
    status: "published",
    submissionsCount: 3,
    reviewedCount: 0
  }
];
export const INITIAL_QUIZZES = [
  {
    id: "qz-1",
    title: "University Aptitude Diagnostic Mock",
    courseTitle: "University Entry Test Prep",
    description: "Comprehensive aptitude drill testing verbal analogies, quantitative logic, and deductive syllogisms.",
    marks: 25,
    questionsCount: 4,
    durationMins: 30,
    launchDateTime: "2026-10-10T14:00",
    dueDateTime: "2026-10-14T23:59",
    status: "published",
    submissionsCount: 2,
    averageScore: 21.5,
    questions: [
      {
        id: "q-101",
        type: "multiple_choice",
        questionText: "If all Zorgs are Bleeps and some Bleeps are Glorps, which statement MUST be true?",
        options: [
          "All Zorgs are Glorps",
          "Some Glorps might not be Zorgs",
          "No Zorg can be a Glorp",
          "All Glorps are Bleeps"
        ],
        correctAnswer: "Some Glorps might not be Zorgs",
        marks: 5
      },
      {
        id: "q-102",
        type: "yes_no",
        questionText: "Can an equilateral triangle have an obtuse interior angle in Euclidean plane geometry?",
        correctAnswer: "No",
        marks: 4
      },
      {
        id: "q-103",
        type: "fill_in_blank",
        questionText: "The ratio of circumferences of two circles whose areas are in ratio 16:49 is ____ (format: X:Y).",
        correctAnswer: "4:7",
        marks: 6
      },
      {
        id: "q-104",
        type: "short_answer",
        questionText: "Briefly explain why speed is a scalar quantity whereas velocity is a vector quantity in physical mechanics.",
        correctAnswer: "Speed has only magnitude without direction, whereas velocity possesses both magnitude and a defined spatial direction.",
        marks: 10
      }
    ],
    submissions: [
      {
        id: "sub-1",
        quizId: "qz-1",
        studentName: "Waqas",
        studentRoll: "Roll #65",
        submittedAt: "Today, 04:30 PM AST",
        status: "submitted",
        maxScore: 25,
        totalScore: void 0,
        answers: [
          {
            questionId: "q-101",
            studentAnswer: "Some Glorps might not be Zorgs",
            scoreAwarded: 5,
            teacherComment: "Accurate Venn deduction."
          },
          {
            questionId: "q-102",
            studentAnswer: "No",
            scoreAwarded: 4,
            teacherComment: "Correct, interior angles sum to 180\xB0 (60\xB0 each)."
          },
          {
            questionId: "q-103",
            studentAnswer: "4:7",
            scoreAwarded: 6,
            teacherComment: "Square root of area ratio correctly applied."
          },
          {
            questionId: "q-104",
            studentAnswer: "Speed tells you how fast you move regardless of heading. Velocity includes the direction you are travelling, so changing direction changes velocity even at constant speed.",
            scoreAwarded: void 0,
            teacherComment: ""
          }
        ]
      },
      {
        id: "sub-2",
        quizId: "qz-1",
        studentName: "Hamza Siddiqui",
        studentRoll: "Roll #19",
        submittedAt: "Yesterday, 07:15 PM AST",
        status: "reviewed",
        maxScore: 25,
        totalScore: 23,
        overallFeedback: "Exceptional clarity in short explanations; perfect logical deduction.",
        answers: [
          {
            questionId: "q-101",
            studentAnswer: "Some Glorps might not be Zorgs",
            scoreAwarded: 5,
            teacherComment: "Correct."
          },
          {
            questionId: "q-102",
            studentAnswer: "No",
            scoreAwarded: 4,
            teacherComment: "Correct."
          },
          {
            questionId: "q-103",
            studentAnswer: "4:7",
            scoreAwarded: 6,
            teacherComment: "Correct ratio."
          },
          {
            questionId: "q-104",
            studentAnswer: "Scalar has magnitude only (speed = distance/time). Vector has magnitude and vector angle (velocity = displacement/time).",
            scoreAwarded: 8,
            teacherComment: "Solid explanation, missing explicit mention of sign/coordinate frame."
          }
        ]
      }
    ]
  },
  {
    id: "qz-2",
    title: "Thermal Physics & Ideal Gases Checkpoint",
    courseTitle: "Cambridge O & A Level Physics",
    description: "Kinetic theory of gases, Boyle\u2019s Law, absolute zero kelvin scale, and root-mean-square speed calculations.",
    marks: 20,
    questionsCount: 3,
    durationMins: 25,
    launchDateTime: "2026-10-09T16:00",
    dueDateTime: "2026-10-13T20:00",
    status: "published",
    submissionsCount: 7,
    averageScore: 17.2,
    questions: [
      {
        id: "q-201",
        type: "multiple_choice",
        questionText: "What happens to the internal energy of an ideal gas during an isothermal expansion?",
        options: [
          "It increases because work is done on the gas",
          "It remains constant because temperature is unchanged",
          "It drops to zero",
          "It doubles due to volume doubling"
        ],
        correctAnswer: "It remains constant because temperature is unchanged",
        marks: 5
      },
      {
        id: "q-202",
        type: "yes_no",
        questionText: "At absolute zero (0 K), do ideal gas particles possess zero average kinetic energy according to kinetic theory?",
        correctAnswer: "Yes",
        marks: 5
      },
      {
        id: "q-203",
        type: "short_answer",
        questionText: "State the two primary assumptions regarding intermolecular forces and molecular volume in an ideal gas model.",
        correctAnswer: "1. Negligible volume occupied by molecules compared to container volume. 2. No intermolecular forces except during instantaneous elastic collisions.",
        marks: 10
      }
    ],
    submissions: []
  },
  {
    id: "qz-3",
    title: "Differential Calculus Timed Drill",
    courseTitle: "IGCSE Mathematics Extended (0580)",
    description: "Fast derivative rules for polynomials, negative indices, and gradient evaluation at given coordinates.",
    marks: 15,
    questionsCount: 2,
    durationMins: 20,
    launchDateTime: "2026-10-12T10:00",
    dueDateTime: "2026-10-15T18:00",
    status: "pending",
    submissionsCount: 0,
    questions: [
      {
        id: "q-301",
        type: "fill_in_blank",
        questionText: "Given y = 4x^3 - 5x + 7, the derivative dy/dx at x = 2 is equal to ____.",
        correctAnswer: "43",
        marks: 7
      },
      {
        id: "q-302",
        type: "yes_no",
        questionText: "Is the gradient of a curve zero at all turning stationary points?",
        correctAnswer: "Yes",
        marks: 8
      }
    ],
    submissions: []
  }
];
export const INITIAL_SLOTS = [
  {
    id: "slt-1",
    day: "Monday",
    timeRangeAST: "05:00 PM \u2013 05:30 PM AST",
    status: "available"
  },
  {
    id: "slt-2",
    day: "Tuesday",
    timeRangeAST: "09:30 PM \u2013 10:00 PM AST",
    status: "reserved",
    bookedByStudent: "Waqas (Roll #65)",
    courseTopic: "University Entry Test Prep \u2014 Quantitative Review"
  },
  {
    id: "slt-3",
    day: "Wednesday",
    timeRangeAST: "06:00 PM \u2013 06:45 PM AST",
    status: "available"
  },
  {
    id: "slt-4",
    day: "Thursday",
    timeRangeAST: "08:30 PM \u2013 09:00 PM AST",
    status: "reserved",
    bookedByStudent: "Zainab Al-Harbi (Roll #42)",
    courseTopic: "A-Level Physics Practical Uncertainty Analysis"
  },
  {
    id: "slt-5",
    day: "Saturday",
    timeRangeAST: "04:00 PM \u2013 05:00 PM AST",
    status: "blocked"
  }
];
export const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Mock Exam Schedule Released for Term 2025\u201326",
    content: "All University Entry Test Prep students must complete the General Knowledge 10-mark diagnostic quiz before Friday 08:00 PM AST.",
    audience: "University Entry Test Prep",
    postedAt: "Today, 07:15 PM AST",
    author: "Aamir Waqas \xB7 Tutor"
  }
];
export const INITIAL_ATTENDANCE = [
  // Cambridge O & A Level Physics Cohort (8 students)
  {
    id: "att-phys-1",
    name: "Zainab Al-Harbi",
    rollNo: "42",
    course: "Cambridge O & A Level Physics",
    attendanceRate: 96,
    statusToday: "present",
    lastSeen: "35m ago \xB7 Riyadh (AST)"
  },
  {
    id: "att-phys-2",
    name: "Omar Farooq",
    rollNo: "78",
    course: "Cambridge O & A Level Physics",
    attendanceRate: 88,
    statusToday: "late",
    lastSeen: "Yesterday \xB7 Dammam (AST)"
  },
  {
    id: "att-phys-3",
    name: "Bilal Ahmed",
    rollNo: "23",
    course: "Cambridge O & A Level Physics",
    attendanceRate: 100,
    statusToday: "present",
    lastSeen: "10m ago \xB7 Jeddah (AST)"
  },
  {
    id: "att-phys-4",
    name: "Sarah Khan",
    rollNo: "34",
    course: "Cambridge O & A Level Physics",
    attendanceRate: 92,
    statusToday: "present",
    lastSeen: "1h ago \xB7 Riyadh (AST)"
  },
  {
    id: "att-phys-5",
    name: "Taha Mansoor",
    rollNo: "89",
    course: "Cambridge O & A Level Physics",
    attendanceRate: 84,
    statusToday: "absent",
    lastSeen: "2 days ago \xB7 Khobar (AST)"
  },
  {
    id: "att-phys-6",
    name: "Areeba Noor",
    rollNo: "15",
    course: "Cambridge O & A Level Physics",
    attendanceRate: 95,
    statusToday: "present",
    lastSeen: "Just now \xB7 Riyadh (AST)"
  },
  {
    id: "att-phys-7",
    name: "Mustafa Ali",
    rollNo: "67",
    course: "Cambridge O & A Level Physics",
    attendanceRate: 90,
    statusToday: "present",
    lastSeen: "4h ago \xB7 Riyadh (AST)"
  },
  {
    id: "att-phys-8",
    name: "Dania Tariq",
    rollNo: "53",
    course: "Cambridge O & A Level Physics",
    attendanceRate: 98,
    statusToday: "present",
    lastSeen: "Active now \xB7 Dubai (GST)"
  },
  // University Entry Test Prep Cohort (4 students)
  {
    id: "att-uetp-1",
    name: "Waqas",
    rollNo: "65",
    course: "University Entry Test Prep",
    attendanceRate: 100,
    statusToday: "present",
    lastSeen: "Active now \xB7 Riyadh (AST)"
  },
  {
    id: "att-uetp-2",
    name: "Hamza Siddiqui",
    rollNo: "19",
    course: "University Entry Test Prep",
    attendanceRate: 94,
    statusToday: "present",
    lastSeen: "2h ago \xB7 Jeddah (AST)"
  },
  {
    id: "att-uetp-3",
    name: "Abdullah Rauf",
    rollNo: "82",
    course: "University Entry Test Prep",
    attendanceRate: 91,
    statusToday: "late",
    lastSeen: "5h ago \xB7 Riyadh (AST)"
  },
  {
    id: "att-uetp-4",
    name: "Rayan Qureshi",
    rollNo: "37",
    course: "University Entry Test Prep",
    attendanceRate: 85,
    statusToday: "absent",
    lastSeen: "Yesterday \xB7 Medina (AST)"
  },
  // IGCSE Mathematics Extended (0580) Cohort (6 students)
  {
    id: "att-math-1",
    name: "Maryam Al-Qahtani",
    rollNo: "51",
    course: "IGCSE Mathematics Extended (0580)",
    attendanceRate: 98,
    statusToday: "present",
    lastSeen: "1h ago \xB7 Riyadh (AST)"
  },
  {
    id: "att-math-2",
    name: "Zayd Hashmi",
    rollNo: "12",
    course: "IGCSE Mathematics Extended (0580)",
    attendanceRate: 92,
    statusToday: "present",
    lastSeen: "3h ago \xB7 Jeddah (AST)"
  },
  {
    id: "att-math-3",
    name: "Fatima Zahra",
    rollNo: "93",
    course: "IGCSE Mathematics Extended (0580)",
    attendanceRate: 96,
    statusToday: "present",
    lastSeen: "Active now \xB7 Dammam (AST)"
  },
  {
    id: "att-math-4",
    name: "Ibrahim Tariq",
    rollNo: "44",
    course: "IGCSE Mathematics Extended (0580)",
    attendanceRate: 89,
    statusToday: "late",
    lastSeen: "Yesterday \xB7 Riyadh (AST)"
  },
  {
    id: "att-math-5",
    name: "Noor Fatima",
    rollNo: "28",
    course: "IGCSE Mathematics Extended (0580)",
    attendanceRate: 95,
    statusToday: "present",
    lastSeen: "45m ago \xB7 Khobar (AST)"
  },
  {
    id: "att-math-6",
    name: "Youssef Kamal",
    rollNo: "71",
    course: "IGCSE Mathematics Extended (0580)",
    attendanceRate: 86,
    statusToday: "absent",
    lastSeen: "2 days ago \xB7 Riyadh (AST)"
  },
  // Classical Arabic & Tajweed Foundations Cohort (5 students)
  {
    id: "att-arb-1",
    name: "Yahya Hassan",
    rollNo: "10",
    course: "Classical Arabic & Tajweed Foundations",
    attendanceRate: 100,
    statusToday: "present",
    lastSeen: "Active now \xB7 Medina (AST)"
  },
  {
    id: "att-arb-2",
    name: "Mariam Tariq",
    rollNo: "22",
    course: "Classical Arabic & Tajweed Foundations",
    attendanceRate: 96,
    statusToday: "present",
    lastSeen: "2h ago \xB7 Makkah (AST)"
  },
  {
    id: "att-arb-3",
    name: "Ali Reza",
    rollNo: "39",
    course: "Classical Arabic & Tajweed Foundations",
    attendanceRate: 91,
    statusToday: "present",
    lastSeen: "4h ago \xB7 Riyadh (AST)"
  },
  {
    id: "att-arb-4",
    name: "Safiyya Bint-Amr",
    rollNo: "58",
    course: "Classical Arabic & Tajweed Foundations",
    attendanceRate: 88,
    statusToday: "late",
    lastSeen: "Yesterday \xB7 Cairo (EET)"
  },
  {
    id: "att-arb-5",
    name: "Haroon Rasheed",
    rollNo: "84",
    course: "Classical Arabic & Tajweed Foundations",
    attendanceRate: 94,
    statusToday: "present",
    lastSeen: "1h ago \xB7 Jeddah (AST)"
  }
];
export const INITIAL_EVALUATIONS = [
  {
    id: "eval-1",
    studentName: "Waqas",
    studentRoll: "Roll #65",
    courseTitle: "University Entry Test Prep",
    term: "Mid-Term Diagnostic 2026",
    overallGrade: "A*",
    overallScore: 94,
    status: "published",
    conduct: "Outstanding",
    evaluationDate: "Oct 09, 2026",
    criteria: [
      { name: "Quantitative Aptitude & Speed", score: 96, maxScore: 100 },
      { name: "Analytical Reasoning & Logic Gates", score: 94, maxScore: 100 },
      { name: "Class & Google Meet Participation", score: 98, maxScore: 100 },
      { name: "Homework & Problem Sets Rigor", score: 90, maxScore: 100 }
    ],
    teacherRemarks: "Exceptional logical deductions and consistent attendance. Can improve timing slightly on multi-step permutation questions.",
    strengths: ["Truth table deduction speed", "Algebraic simplification", "Active classroom discussion"],
    growthAreas: ["Permutations & probability shortcuts", "Timed stress mocks"]
  },
  {
    id: "eval-2",
    studentName: "Zainab Al-Harbi",
    studentRoll: "Roll #42",
    courseTitle: "Cambridge O & A Level Physics",
    term: "Term 1 Assessment 2026",
    overallGrade: "A",
    overallScore: 89,
    status: "published",
    conduct: "Outstanding",
    evaluationDate: "Oct 08, 2026",
    criteria: [
      { name: "Theoretical Physics Concept Mastery", score: 92, maxScore: 100 },
      { name: "Mathematical Vector Calculations", score: 88, maxScore: 100 },
      { name: "Practical Paper 3 Uncertainty Analysis", score: 85, maxScore: 100 },
      { name: "Punctuality & Homework Deadlines", score: 92, maxScore: 100 }
    ],
    teacherRemarks: "Excellent mastery of 2D kinematics and forces. Recommended focus on practical uncertainty equations and percentage error graphs.",
    strengths: ["Free body diagrams", "Newtonian kinematics calculus", "Structured problem presentation"],
    growthAreas: ["Systematic vs random errors", "Significant figures discipline"]
  },
  {
    id: "eval-3",
    studentName: "Hamza Siddiqui",
    studentRoll: "Roll #19",
    courseTitle: "University Entry Test Prep",
    term: "Mid-Term Diagnostic 2026",
    overallGrade: "A",
    overallScore: 88,
    status: "published",
    conduct: "Good",
    evaluationDate: "Oct 07, 2026",
    criteria: [
      { name: "Quantitative Aptitude & Speed", score: 91, maxScore: 100 },
      { name: "Analytical Reasoning & Logic Gates", score: 86, maxScore: 100 },
      { name: "Class & Google Meet Participation", score: 85, maxScore: 100 },
      { name: "Homework & Problem Sets Rigor", score: 90, maxScore: 100 }
    ],
    teacherRemarks: "Solid overall problem solving; should review syllogism negations and fast mental division techniques.",
    strengths: ["Arithmetic word problem translation", "Steady homework submission"],
    growthAreas: ["Venn diagram negation rules", "Verbal reasoning speed"]
  },
  {
    id: "eval-4",
    studentName: "Maryam Al-Qahtani",
    studentRoll: "Roll #51",
    courseTitle: "IGCSE Mathematics Extended (0580)",
    term: "Term 1 Progression Evaluation",
    overallGrade: "A*",
    overallScore: 97,
    status: "published",
    conduct: "Outstanding",
    evaluationDate: "Oct 06, 2026",
    criteria: [
      { name: "Algebraic Manipulation & Differentiation", score: 98, maxScore: 100 },
      { name: "Geometric Proofs & Trigonometry", score: 95, maxScore: 100 },
      { name: "Class & Google Meet Engagement", score: 99, maxScore: 100 },
      { name: "Workbook Accuracy & Formatting", score: 96, maxScore: 100 }
    ],
    teacherRemarks: "Top-tier mathematical accuracy. Flawless calculus derivations and exemplary engagement during live sessions.",
    strengths: ["Quadratic transformations", "Tangent & normal derivatives", "Clear working steps"],
    growthAreas: ["3D trigonometry bearing problems"]
  }
];
export const INITIAL_BLOGS = [
  {
    id: "blg-1",
    title: "Top 5 Time Management Strategies for Cambridge O & A Level Candidates",
    author: "Aamir Waqas \xB7 Senior Tutor",
    category: "EXAM STRATEGY",
    publishedDate: "Oct 04, 2026",
    readTime: "4 min read",
    snippet: "Structuring past paper timed intervals, avoiding calculation pitfalls under timed exam conditions, and mastering the Cambridge formula booklet.",
    views: 428
  },
  {
    id: "blg-2",
    title: "Deconstructing Analytical Reasoning Gates in University Admissions",
    author: "Aamir Waqas \xB7 Senior Tutor",
    category: "APTITUDE PREP",
    publishedDate: "Sep 28, 2026",
    readTime: "6 min read",
    snippet: "How to convert complex textual constraints into rapid truth matrices in under 90 seconds per question.",
    views: 612
  },
  {
    id: "blg-3",
    title: "The Modern Virtual Classroom: Maximizing Google Meet & Digital Whiteboards",
    author: "Faculty Academic Board",
    category: "PEDAGOGY",
    publishedDate: "Sep 15, 2026",
    readTime: "3 min read",
    snippet: "Best practices for interactive hybrid lectures, breakout room discussions, and student participation accountability.",
    views: 310
  }
];
export const INITIAL_TEACHING_RESOURCES = [
  // Cambridge O & A Level Physics
  {
    id: "res-1",
    title: "Kinematics & 2D Projectiles Master Lecture Deck (PPT)",
    courseTitle: "Cambridge O & A Level Physics",
    type: "slides",
    visibility: "teacher_private_desk",
    description: "Animated slide deck with step-by-step vector decomposition diagrams. Ready to share-screen during live Google Meet lectures.",
    fileFormat: "PPTX Presentation",
    fileSize: "14.2 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/kinematics-master.pptx",
    pinnedForNextClass: true,
    uploadedAt: "Today, 11:30 AM AST"
  },
  {
    id: "res-2",
    title: "Cambridge O/A Level Physics Formulae & Constants Booklet",
    courseTitle: "Cambridge O & A Level Physics",
    type: "pdf_document",
    visibility: "shared_with_students",
    description: "Official Cambridge Assessment Physics formulas, standard SI base units, and astronomical/physical constants reference sheet.",
    fileFormat: "PDF Document",
    fileSize: "2.4 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/caie-physics-formulae.pdf",
    pinnedForNextClass: false,
    uploadedAt: "Yesterday, 04:00 PM AST"
  },
  {
    id: "res-phys-vid",
    title: "Projectile Motion in Vacuum vs Air Resistance Simulation (Movie/Video)",
    courseTitle: "Cambridge O & A Level Physics",
    type: "video_movie",
    visibility: "shared_with_students",
    description: "High-speed 120fps video recording demonstrating horizontal distance decay with turbulent quadratic air drag coefficients.",
    fileFormat: "MP4 Video (1080p)",
    fileSize: "112.5 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/projectile-drag-simulation.mp4",
    pinnedForNextClass: false,
    uploadedAt: "Oct 07, 2026"
  },
  {
    id: "res-phys-book",
    title: "Cambridge International AS & A Level Physics Coursebook (Annotated)",
    courseTitle: "Cambridge O & A Level Physics",
    type: "book_curriculum",
    visibility: "teacher_private_desk",
    description: "Teacher annotated coursebook featuring worked answers to end-of-chapter questions and Cambridge examiner comments.",
    fileFormat: "PDF Textbook",
    fileSize: "48.6 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/caie-physics-textbook-annotated.pdf",
    pinnedForNextClass: true,
    uploadedAt: "Oct 05, 2026"
  },
  {
    id: "res-phys-notes",
    title: "Google Meet Lecture Cheat Sheet: Newton Laws & Momentum Derivations",
    courseTitle: "Cambridge O & A Level Physics",
    type: "lecture_notes",
    visibility: "teacher_private_desk",
    description: "Compact 2-page bullet point summary designed to display on secondary screen or projector during Google Meet discussions.",
    fileFormat: "Markdown / PDF",
    fileSize: "820 KB",
    urlOrPreview: "https://virtualcityschool.com/resources/physics-meet-cheat-sheet.pdf",
    pinnedForNextClass: true,
    uploadedAt: "Today, 09:15 AM AST"
  },
  // University Entry Test Prep
  {
    id: "res-3",
    title: "Analytical Logic Gates & Syllogism Video Walkthrough (Movie/Video)",
    courseTitle: "University Entry Test Prep",
    type: "video_movie",
    visibility: "shared_with_students",
    description: "18-minute animated walkthrough demonstrating fast truth matrix constructions for competitive entry test papers.",
    fileFormat: "MP4 Video (1080p)",
    fileSize: "85.0 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/analytical-logic-lecture.mp4",
    pinnedForNextClass: false,
    uploadedAt: "Oct 08, 2026"
  },
  {
    id: "res-uetp-deck",
    title: "Quantitative Logic & Speed Math Short-cut Slides (PPT)",
    courseTitle: "University Entry Test Prep",
    type: "slides",
    visibility: "teacher_private_desk",
    description: "Ready-to-present PowerPoint deck covering Vedic division shortcuts, percentage ratios, and time-work matrices.",
    fileFormat: "PPTX Presentation",
    fileSize: "9.8 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/speed-math-shortcuts.pptx",
    pinnedForNextClass: true,
    uploadedAt: "Oct 09, 2026"
  },
  {
    id: "res-uetp-notes",
    title: "High-Yield Analytical Syllogism Practice Notes for Students",
    courseTitle: "University Entry Test Prep",
    type: "lecture_notes",
    visibility: "shared_with_students",
    description: "Class notes shared with students summarizing Euler diagrams and conditional statement contrapositives.",
    fileFormat: "PDF Document",
    fileSize: "3.1 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/syllogism-practice-notes.pdf",
    pinnedForNextClass: false,
    uploadedAt: "Oct 06, 2026"
  },
  // IGCSE Mathematics Extended (0580)
  {
    id: "res-4",
    title: "Cambridge Pure Mathematics Extended Coursebook (Annotated)",
    courseTitle: "IGCSE Mathematics Extended (0580)",
    type: "book_curriculum",
    visibility: "teacher_private_desk",
    description: "Teacher curriculum reference textbook with worked solutions to challenging algebraic differentiation problems.",
    fileFormat: "EPUB / PDF",
    fileSize: "32.1 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/igcse-extended-math-annotated.pdf",
    pinnedForNextClass: true,
    uploadedAt: "Oct 06, 2026"
  },
  {
    id: "res-math-slides",
    title: "Calculus Curves, Maxima & Minima Visual Slides (PPT)",
    courseTitle: "IGCSE Mathematics Extended (0580)",
    type: "slides",
    visibility: "teacher_private_desk",
    description: "Interactive graph illustrations demonstrating second derivative concavity for upcoming Google Meet lecture.",
    fileFormat: "PPTX Presentation",
    fileSize: "11.5 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/differentiation-visuals.pptx",
    pinnedForNextClass: true,
    uploadedAt: "Oct 08, 2026"
  },
  {
    id: "res-math-ws",
    title: "Extended Math 0580 Past Paper Topical Question Bank (PDF)",
    courseTitle: "IGCSE Mathematics Extended (0580)",
    type: "pdf_document",
    visibility: "shared_with_students",
    description: "Curated 100-page past paper question pack categorized by topic: Algebra, Functions, Vectors, and Trigonometry.",
    fileFormat: "PDF Document",
    fileSize: "15.4 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/math-0580-topical-bank.pdf",
    pinnedForNextClass: false,
    uploadedAt: "Oct 02, 2026"
  },
  // Classical Arabic & Tajweed Foundations
  {
    id: "res-5",
    title: "Classical Arabic Grammar Morphology Tables (Sarf & Nahw)",
    courseTitle: "Classical Arabic & Tajweed Foundations",
    type: "lecture_notes",
    visibility: "shared_with_students",
    description: "Conjugation grids and phonetic articulation diagrams for vocal cords and throat letters.",
    fileFormat: "PDF Document",
    fileSize: "4.8 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/sarf-nahw-notes.pdf",
    pinnedForNextClass: false,
    uploadedAt: "Sep 29, 2026"
  },
  {
    id: "res-arb-audio",
    title: "Tajweed Makharij Articulation Points Video Demonstration (Movie)",
    courseTitle: "Classical Arabic & Tajweed Foundations",
    type: "video_movie",
    visibility: "shared_with_students",
    description: "Cross-sectional vocal tract video showing tongue positions for letters Qaf, Kaf, Dad, and Ayn.",
    fileFormat: "MP4 Video (1080p)",
    fileSize: "74.2 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/tajweed-makharij-demonstration.mp4",
    pinnedForNextClass: false,
    uploadedAt: "Oct 01, 2026"
  },
  {
    id: "res-arb-book",
    title: "Sharh Ibn Aqil Classical Grammar Treatise (Teacher Reference)",
    courseTitle: "Classical Arabic & Tajweed Foundations",
    type: "book_curriculum",
    visibility: "teacher_private_desk",
    description: "Scholarly grammar commentary with grammatical parsing (I\u2019rab) analysis for lecture preparation.",
    fileFormat: "PDF Book",
    fileSize: "22.0 MB",
    urlOrPreview: "https://virtualcityschool.com/resources/ibn-aqil-sharh.pdf",
    pinnedForNextClass: true,
    uploadedAt: "Sep 25, 2026"
  }
];
