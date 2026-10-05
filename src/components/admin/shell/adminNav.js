// Single source of truth for the admin menu: the sidebar, the top-bar
// breadcrumb and the ⌘K command palette all read from here.
export const ADMIN_NAV = [
  {
    section: "",
    items: [
      { id: "overview", label: "Dashboard", icon: "fas fa-table-columns", to: "/admin/overview" },
    ],
  },
  {
    section: "Admissions",
    items: [
      { id: "approvals", label: "Pending Approvals", icon: "fas fa-user-check", to: "/admin/approvals", signal: "approvals" },
      { id: "students", label: "Students", icon: "fas fa-user-graduate", to: "/admin/users?role=student" },
      { id: "enrollments", label: "Student Enrollments", icon: "fas fa-clipboard-list", to: "/admin/enrollments" },
    ],
  },
  {
    section: "Academics",
    items: [
      { id: "courses", label: "Subjects", icon: "fas fa-book", to: "/admin/courses" },
      { id: "teachers", label: "Teachers", icon: "fas fa-chalkboard-user", to: "/admin/users?role=teacher" },
      { id: "teacher-allocations", label: "Teacher Allocations", icon: "fas fa-thumbtack", to: "/admin/teacher-allocations", signal: "unassigned" },
      { id: "sessions", label: "Timetable", icon: "fas fa-chalkboard", to: "/admin/sessions", signal: "live" },
    ],
  },
  {
    section: "PTM",
    items: [
      { id: "teacher-planner", label: "PTM Meetings", icon: "fas fa-user-clock", to: "/admin/teacher-planner" },
      { id: "parents", label: "Parents", icon: "fas fa-people-roof", to: "/admin/users?role=parent" },
      { id: "attendance", label: "Attendance", icon: "fas fa-clipboard-user", to: "/admin/attendance" },
      { id: "evaluations", label: "Evaluations", icon: "fas fa-chart-bar", to: "/admin/evaluations" },
    ],
  },
  {
    section: "Finance",
    items: [
      { id: "subscriptions", label: "Subscriptions", icon: "fas fa-credit-card", to: "/admin/subscriptions", signal: "expiring" },
      { id: "referrals", label: "Referrals", icon: "fas fa-share-nodes", to: "/admin/referrals" },
    ],
  },
  {
    section: "Content",
    items: [
      { id: "blogs", label: "Blogs", icon: "fas fa-newspaper", to: "/admin/blogs" },
      { id: "vlogs", label: "Vlogs", icon: "fas fa-circle-play", to: "/admin/vlogs" },
      { id: "testimonials", label: "Testimonials", icon: "fas fa-quote-left", to: "/admin/testimonials" },
    ],
  },
  {
    section: "Settings",
    items: [
      { id: "admins", label: "Admin Users", icon: "fas fa-user-shield", to: "/admin/users?role=admin" },
      { id: "levels", label: "Levels", icon: "fas fa-tags", to: "/admin/course-levels" },
      { id: "about", label: "About Us", icon: "fas fa-info-circle", to: "/admin/about" },
      { id: "settings", label: "Platform Settings", icon: "fas fa-sliders-h", to: "/admin/settings" },
    ],
  },
];

const PATH_TO_ID = [
  ["/admin/overview", "overview"],
  ["/admin/approvals", "approvals"],
  ["/admin/enrollments", "enrollments"],
  ["/admin/teacher-allocations", "teacher-allocations"],
  ["/admin/courses", "courses"],
  ["/admin/sessions", "sessions"],
  ["/admin/teacher-planner", "teacher-planner"],
  ["/admin/attendance", "attendance"],
  ["/admin/evaluations", "evaluations"],
  ["/admin/subscriptions", "subscriptions"],
  ["/admin/referrals", "referrals"],
  ["/admin/blogs", "blogs"],
  ["/admin/vlogs", "vlogs"],
  ["/admin/testimonials", "testimonials"],
  ["/admin/course-levels", "levels"],
  ["/admin/about", "about"],
  ["/admin/settings", "settings"],
];

const ROLE_TO_ID = { student: "students", teacher: "teachers", parent: "parents", admin: "admins" };

// Which menu item is active for a URL. A user's own page (/admin/users/12)
// keeps the people list it came from highlighted when the role is known.
export const getActiveNavId = (pathname, search = "") => {
  if (pathname === "/admin" || pathname === "/admin/") return "overview";
  if (pathname.startsWith("/admin/users")) {
    const role = new URLSearchParams(search).get("role");
    return ROLE_TO_ID[role] || null;
  }
  const hit = PATH_TO_ID.find(([prefix]) => pathname.startsWith(prefix));
  return hit ? hit[1] : null;
};

export const findNavItem = (id) => {
  for (const group of ADMIN_NAV) {
    const item = group.items.find((i) => i.id === id);
    if (item) return { ...item, section: group.section };
  }
  return null;
};
