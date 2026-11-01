// Staff roles for admin accounts. The server (accounts/staff_roles.py) is the
// real gate on every call; this file only decides what the panel shows.

export type Cap =
  | 'view_people' | 'manage_students' | 'manage_teachers'
  | 'view_approvals' | 'review_approvals' | 'decide_approvals'
  | 'recommend_free_access' | 'approve_free_access' | 'manage_enrolments'
  | 'view_billing' | 'manage_billing' | 'view_academics' | 'manage_academics'
  | 'view_attendance' | 'edit_attendance' | 'manage_content' | 'view_audit'
  | 'manage_settings' | 'manage_staff' | 'delete';

export const STAFF_ROLES: { id: string; label: string; allowed: string; notAllowed: string }[] = [
  { id: 'super_admin', label: 'Super Admin', allowed: 'Everything: staff accounts, roles, settings, permanent delete', notAllowed: '—' },
  { id: 'admissions', label: 'Admissions Officer', allowed: 'Approvals inbox, add students, link parents, recommend free access', notAllowed: 'Grant free access, change fees, delete' },
  { id: 'academic', label: 'Academic Coordinator', allowed: 'Timetable, class planning, teacher allocations, staff meetings, live classes, attendance view', notAllowed: 'Billing, approvals, delete users' },
  { id: 'finance', label: 'Finance Officer', allowed: 'Subscriptions, renewals, fees, add month / end access, final approval of free access', notAllowed: 'Timetable, delete students' },
  { id: 'student_affairs', label: 'Student Affairs', allowed: 'Mark and correct attendance, absentee follow-up, student profiles', notAllowed: 'Fees, approvals, roles' },
  { id: 'content', label: 'Content Editor', allowed: 'Blogs, vlogs, testimonials, About page', notAllowed: 'Any student, teacher or financial data' },
  { id: 'viewer', label: 'Viewer', allowed: 'Read everything', notAllowed: 'Any change' },
];

export const staffRoleLabel = (id?: string) => STAFF_ROLES.find((r) => r.id === id)?.label || 'No staff role';

// What a person's role is called on screen. Two accounts have the Super Admin role (founder, 2026-11-01): the owner
// (the superuser) and the COO, who can do everything except log in as, delete or change the owner account.
export const staffTitle = (adminRole?: string, isSuperuser?: boolean, short = false) =>
  adminRole === 'super_admin'
    ? (isSuperuser ? (short ? 'Owner' : 'Owner · Super Admin') : (short ? 'COO' : 'COO · Chief Operating Officer'))
    : staffRoleLabel(adminRole);
export const staffAllowed = (adminRole?: string, isSuperuser?: boolean) =>
  adminRole === 'super_admin'
    ? (isSuperuser ? 'Everything, including the COO account' : 'Everything except the owner account: cannot log in as it, delete it or change its password')
    : STAFF_ROLES.find((r) => r.id === adminRole)?.allowed || 'No access until a role is set';

// Menu item → capability needed to open it.
export const NAV_CAP: Record<string, Cap> = {
  approvals: 'view_approvals',
  students: 'view_people',
  enrollments: 'view_people',
  parents: 'view_people',
  teachers: 'view_people',
  referrals: 'view_people',
  'live-classes': 'view_academics',
  subjects: 'view_academics',
  'teacher-allocations': 'view_academics',
  timetable: 'view_academics',
  'ptm-meetings': 'view_academics',
  meetings: 'view_academics',
  evaluations: 'view_academics',
  assessments: 'view_academics',
  levels: 'view_academics',
  attendance: 'view_attendance',
  subscriptions: 'view_billing',
  blogs: 'manage_content',
  vlogs: 'manage_content',
  testimonials: 'manage_content',
  about: 'manage_content',
  'admin-users': 'manage_staff',
  settings: 'manage_settings',
  // Mock Exams admin: Super Admin (full) and Finance (payment approvals); the Mocks app checks the role again.
  'mocks-admin': 'manage_billing',
};
