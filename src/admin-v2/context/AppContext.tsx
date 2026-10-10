// Real-data version of the AI Studio prototype's AppContext.
//
// The redesign's views talk only to `useApp()`. This provider keeps the
// prototype's exact interface but fills it from the VCS API and routes every
// action to the existing, working endpoints. Nothing here is mock data: where
// the API has no value for a field, the field is left empty and the view shows
// "—" rather than an invented number.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type {
  NavigationId, Student, Teacher, Parent, BaseUser, Subject, TimetableSession, TeacherMeeting,
  GradeRecord, Subscription, Referral, ContentPost, Testimonial, PlatformSettings, ApprovalItem,
  RecentActivity, AcademicLevel, AttendanceStatus, EnrollmentRecord, DepartmentName,
} from '../types';
import { adminService } from '../../services/adminService';
import { coursesService } from '../../services/coursesService';
import { adminSessionService } from '../../services/adminSessionService';
import { adminTeacherSessionService } from '../../services/adminTeacherSessionService';
import { blogsService } from '../../services/blogsService';
import { aboutService } from '../../services/aboutService';
import { testimonialsService } from '../../services/testimonialsService';
import { platformSettingsService } from '../../services/platformSettingsService';
import { freeAccessService } from '../../services/freeAccessService';
import { axiosInstance } from '../../utils';
import { teacherService } from '../../services/teacherService';
import { approveUser, rejectUser, actionEnrollment, fetchPendingApprovals, fetchPendingEnrollments, fetchRejectedApprovals } from '../../store/slices/approvalsSlice';
import { approveChildLink, rejectChildLink, fetchPendingChildLinks } from '../../store/slices/childLinksSlice';
import { fetchFreeAccessRequests } from '../../store/slices/freeAccessSlice';
import { getDisplayName } from '../../utils/userDisplay';
import { getStorageUrl } from '../../utils/storageUrl';
import { departmentOf } from '../../components/admin/ui/departments';
import { TEACHING_AREAS, guessTeachingAreas } from '../data/formOptions';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
}

interface DetailDrawerState {
  isOpen: boolean;
  type: 'student' | 'teacher' | 'parent' | 'subject' | 'session' | 'subscription' | 'user';
  data: any;
}

interface QuickAddState {
  isOpen: boolean;
  initialType: 'student' | 'teacher' | 'subject' | 'session' | 'post';
}

// ── Routes ──────────────────────────────────────────────────────────────────
export const VIEW_TO_PATH: Record<string, string> = {
  dashboard: '/admin/overview',
  approvals: '/admin/approvals',
  students: '/admin/users?role=student',
  enrollments: '/admin/enrollments',
  subjects: '/admin/courses',
  teachers: '/admin/users?role=teacher',
  'teacher-allocations': '/admin/teacher-allocations',
  timetable: '/admin/sessions',
  'live-classes': '/admin/live-classes',
  'ptm-meetings': '/admin/teacher-planner',
  meetings: '/admin/teacher-planner',
  parents: '/admin/users?role=parent',
  attendance: '/admin/attendance',
  evaluations: '/admin/evaluations',
  grades: '/admin/evaluations',
  subscriptions: '/admin/subscriptions',
  referrals: '/admin/referrals',
  blogs: '/admin/blogs',
  blog: '/admin/blogs',
  vlogs: '/admin/vlogs',
  testimonials: '/admin/testimonials',
  'admin-users': '/admin/users?role=admin',
  users: '/admin/users?role=admin',
  levels: '/admin/course-levels',
  about: '/admin/about',
  settings: '/admin/settings',
  defaults: '/admin/settings',
  timezone: '/admin/settings',
  revenue: '/admin/subscriptions',
};

export const viewFromLocation = (pathname: string, search: string): NavigationId => {
  if (pathname.startsWith('/admin/users')) {
    const role = new URLSearchParams(search).get('role');
    return ({ student: 'students', teacher: 'teachers', parent: 'parents', admin: 'admin-users' } as any)[role || ''] || 'students';
  }
  const hit = Object.entries(VIEW_TO_PATH).find(([, p]) => !p.includes('?') && pathname.startsWith(p));
  return (hit ? hit[0] : 'dashboard') as NavigationId;
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const asList = (d: any) => (Array.isArray(d) ? d : d?.results || d?.data || []);
const sid = (v: any) => (v === null || v === undefined ? '' : String(v));
const ymd = (d: Date, tz?: string) => d.toLocaleDateString('en-CA', tz ? { timeZone: tz } : undefined);
const hm = (d: Date, tz?: string) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, ...(tz ? { timeZone: tz } : {}) });
const deptName = (title: string): DepartmentName => {
  const d = departmentOf(title || '');
  return (d.id === 'general' ? 'General' : d.name) as DepartmentName;
};
const cambridgeCode = (title = '') => (title.match(/\b(\d{4})\b/) || [])[1] || '';
const relTime = (iso?: string) => {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} mins ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} hours ago`;
  const days = Math.round(mins / 1440);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
};
const errText = (e: any) =>
  e?.response?.data?.error || e?.response?.data?.detail || e?.response?.data?.message || e?.message || (typeof e === 'string' ? e : 'Something went wrong. Nothing was changed.');

interface ConfirmReq { title: string; message: string; confirmLabel?: string; isDestructive?: boolean; resolve: (ok: boolean) => void }

const AppContext = createContext<any>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<any>();
  const profile = useSelector((s: any) => s.auth.profile);
  const tzIana: string | undefined = profile?.timezone || undefined;

  // ── Layout & navigation ───────────────────────────────────────────────────
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('vcsAdminSidebarCollapsed') === 'true'; } catch { return false; }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentView = viewFromLocation(location.pathname, location.search);
  const setCurrentView = useCallback((view: NavigationId) => {
    setMobileMenuOpen(false);
    navigate(VIEW_TO_PATH[view] || '/admin/overview');
  }, [navigate]);
  const toggleSidebar = () => setSidebarCollapsed((p) => {
    try { localStorage.setItem('vcsAdminSidebarCollapsed', String(!p)); } catch { /* ignore */ }
    return !p;
  });
  const toggleTheme = () => setTheme((p) => (p === 'dark' ? 'light' : 'dark'));
  const tzAbbr = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', { timeZoneName: 'short', ...(tzIana ? { timeZone: tzIana } : {}) })
        .formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value || '';
    } catch { return ''; }
  })();
  const timezone = `${tzIana || Intl.DateTimeFormat().resolvedOptions().timeZone} ${tzAbbr}`.trim();
  const setTimezone = (tz: string) => {
    const iana = tz.split(' ')[0];
    adminService.updateUser(profile?.id, { email: profile?.email, role: 'admin', timezone: iana })
      .then(() => addToast(`Timezone set to ${iana}. Reload to apply everywhere.`, 'success'))
      .catch((e: any) => addToast(errText(e), 'error'));
  };

  // ── Modals, drawer, toasts, confirm ───────────────────────────────────────
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState<DetailDrawerState>({ isOpen: false, type: 'student', data: null });
  const [quickAddModal, setQuickAddModal] = useState<QuickAddState>({ isOpen: false, initialType: 'student' });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmReq, setConfirmReq] = useState<ConfirmReq | null>(null);

  const removeToast = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));
  const addToast = (message: string, type: ToastMessage['type'] = 'success', undoAction?: () => void) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((p) => [...p, { id, message, type, undoAction }]);
    setTimeout(() => removeToast(id), type === 'error' ? 8000 : 4500);
  };
  const confirmAction = (opts: Omit<ConfirmReq, 'resolve'>) =>
    new Promise<boolean>((resolve) => setConfirmReq({ ...opts, resolve }));
  const openDetailDrawer = (type: DetailDrawerState['type'], data: any) => setDetailDrawer({ isOpen: true, type, data });
  const closeDetailDrawer = () => setDetailDrawer((p) => ({ ...p, isOpen: false }));
  const openQuickAdd = (type: QuickAddState['initialType'] = 'student') => setQuickAddModal({ isOpen: true, initialType: type });
  const closeQuickAdd = () => setQuickAddModal((p) => ({ ...p, isOpen: false }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCommandPaletteOpen((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Raw API data ──────────────────────────────────────────────────────────
  const [raw, setRaw] = useState<any>({
    users: [], courses: [], enrollments: [], categories: [], sessions: [], meetings: [], subs: { active: [], expired: [], needs_gumroad_cancellation: [] },
    referrals: [], posts: [], testimonials: [], reviews: [], catalog: [], about: null, settings: null, analytics: null, attendance: [], grading: null,
  });
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const pendingApprovals = useSelector((s: any) => s.approvals.pendingApprovals);
  const pendingEnrollments = useSelector((s: any) => s.approvals.pendingEnrollments);
  const rejectedAccounts = useSelector((s: any) => s.approvals.rejectedApprovals) || [];
  const pendingChildLinks = useSelector((s: any) => s.childLinks.pendingChildLinks);
  const freeAccess = useSelector((s: any) => s.freeAccess.requests);
  const [approvedTodayCount, setApprovedTodayCount] = useState(0);
  const [rejectedTodayCount, setRejectedTodayCount] = useState(0);

  const loaders = useRef<Record<string, () => Promise<any>>>({});
  loaders.current = {
    users: () => adminService.getUsers(),
    courses: () => coursesService.getAllCourses(),
    enrollments: () => coursesService.getAllEnrollments ? coursesService.getAllEnrollments() : axiosInstance.get('/courses/all-enrollments/').then((r: any) => r.data),
    categories: () => coursesService.getCategories(),
    sessions: () => adminSessionService.getSessions(),
    meetings: () => adminTeacherSessionService.getSessions(),
    subs: () => adminService.getSubscriptions(),
    // Paginated (max 100 per page on the server), so follow every page.
    referrals: async () => {
      const all: any[] = [];
      for (let page = 1; page <= 50; page += 1) {
        const r: any = await axiosInstance.get('/referrals/admin/', { params: { page_size: 100, page } });
        all.push(...asList(r.data));
        if (!r.data?.next) break;
      }
      return all;
    },
    posts: () => blogsService.getAllBlogs({ ordering: '-created_at' }),
    testimonials: () => testimonialsService.getAllTestimonials(),
    reviews: () => axiosInstance.get('/admin/approval-reviews/').then((r: any) => r.data),
    catalog: () => axiosInstance.get('/courses/subjects/').then((r: any) => r.data),
    about: () => aboutService.get(),
    settings: () => axiosInstance.get('/messaging/platform-settings/').then((r: any) => r.data),
    analytics: () => adminService.getDashboardAnalytics(),
    grading: () => coursesService.getGradingScale(),
    attendance: () => {
      const to = new Date();
      const from = new Date(to.getTime() - 30 * 86400000);
      return adminService.getAttendance({ from: ymd(from, tzIana), to: ymd(to, tzIana) });
    },
  };

  const reload = useCallback(async (...keys: string[]) => {
    const list = keys.length ? keys : Object.keys(loaders.current);
    const results = await Promise.allSettled(list.map((k) => loaders.current[k]()));
    setRaw((prev: any) => {
      const next = { ...prev };
      results.forEach((r, i) => {
        const k = list[i];
        if (r.status !== 'fulfilled') return;
        const v: any = r.value;
        next[k] = ['about', 'settings', 'analytics', 'subs', 'grading'].includes(k) ? (v?.data && !Array.isArray(v.data) && k !== 'subs' ? v.data : v) : asList(v);
      });
      return next;
    });
    setLoaded((p) => ({ ...p, ...Object.fromEntries(list.map((k) => [k, true])) }));
    // Say so when something could not load, rather than showing it as empty.
    const failed = list.filter((_, i) => results[i].status === 'rejected');
    if (failed.length) {
      addToast(`Could not load: ${failed.join(', ')}. Those sections may look empty; use the reload button to try again.`, 'warning');
    }
  }, []);

  const refreshApprovals = useCallback(() => {
    dispatch(fetchPendingApprovals());
    dispatch(fetchRejectedApprovals());
    dispatch(fetchPendingEnrollments());
    dispatch(fetchPendingChildLinks());
    dispatch(fetchFreeAccessRequests({ status: 'pending' }));
  }, [dispatch]);

  useEffect(() => {
    reload();
    refreshApprovals();
    const id = setInterval(() => reload('subs', 'sessions'), 120000);
    return () => clearInterval(id);
  }, [reload, refreshApprovals]);

  // ── Mapping helpers ───────────────────────────────────────────────────────
  const levelName = useMemo(() => {
    const m = new Map(raw.categories.map((c: any) => [String(c.id), c.name]));
    return (v: any) => (v == null || v === '' ? '' : (m.get(String(v)) as string) || String(v));
  }, [raw.categories]);

  const courseById = useMemo(() => new Map<string, any>(raw.courses.map((c: any) => [String(c.id), c])), [raw.courses]);
  const coursePrice = (c: any) => (c?.is_paid ? parseFloat(c?.price) || 0 : 0);

  const feeByStudent = useMemo(() => {
    const m = new Map<string, Student['feeStatus'] | string>();
    // 'Paid' / 'Overdue' only for Gumroad memberships; admin-added access is not a payment.
    raw.subs.expired?.forEach((r: any) => {
      const k = sid(r.student?.id);
      if (r.enrollment_source === 'gumroad') m.set(k, 'Overdue');
      else if (m.get(k) !== 'Overdue') m.set(k, 'Access expired');
    });
    raw.subs.active?.forEach((r: any) => {
      const k = sid(r.student?.id);
      if (m.get(k) === 'Overdue' || m.get(k) === 'Access expired') return;
      const soon = typeof r.days_remaining === 'number' && r.days_remaining <= 7;
      if (soon || !m.has(k)) m.set(k, soon ? 'Expiring Soon' : r.enrollment_source === 'gumroad' ? 'Paid' : 'Access active');
    });
    return m;
  }, [raw.subs]);

  const attendanceByStudent = useMemo(() => {
    const m = new Map<string, { marked: number; ok: number; weekAbsent: number }>();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    raw.attendance.forEach((r: any) => {
      if (r.participant_role === 'teacher' || !['present', 'late', 'absent'].includes(r.status)) return;
      const k = sid(r.student);
      const cur = m.get(k) || { marked: 0, ok: 0, weekAbsent: 0 };
      cur.marked += 1;
      if (r.status !== 'absent') cur.ok += 1;
      else if (new Date(r.scheduled_at) >= weekStart) cur.weekAbsent += 1;
      m.set(k, cur);
    });
    return m;
  }, [raw.attendance]);

  // Workload from classes actually held in the last 4 weeks (weekly average).
  const recentLoad = useMemo(() => {
    const since = Date.now() - 28 * 86400000;
    const hours = new Map<string, number>();
    const count = new Map<string, number>();
    raw.sessions.forEach((s: any) => {
      const t = new Date(s.scheduled_at).getTime();
      if (!(t >= since && t <= Date.now()) || s.status === 'cancelled') return;
      if (s.teacher) hours.set(sid(s.teacher), (hours.get(sid(s.teacher)) || 0) + (s.duration_mins || 60) / 60);
      if (s.course) count.set(sid(s.course), (count.get(sid(s.course)) || 0) + 1);
    });
    return { hours, count };
  }, [raw.sessions]);

  const sessionCourse = useMemo(() => new Map(raw.sessions.map((s: any) => [sid(s.id), s.course])), [raw.sessions]);
  const activeEnrollments = useMemo(() => raw.enrollments.filter((e: any) => e.status === 'active'), [raw.enrollments]);

  const students: Student[] = useMemo(() => raw.users.filter((u: any) => u.role === 'student').map((u: any) => {
    // Active seats decide fees and subjects; pending/rejected requests are not enrolments.
    const mine = activeEnrollments.filter((e: any) => sid(e.student?.id) === sid(u.id));
    const att = attendanceByStudent.get(sid(u.id));
    const latest = mine.map((e: any) => e.enrolled_at).filter(Boolean).sort().pop();
    const fee = feeByStudent.get(sid(u.id)) || (mine.length ? 'Free Access' : 'Not Enrolled');
    return {
      id: sid(u.id), name: getDisplayName(u) || u.email, email: u.email, role: 'student',
      avatar: u.avatar ? getStorageUrl(u.avatar) : undefined,
      status: u.is_active ? 'Active' : 'Inactive', createdAt: u.date_joined, phone: u.phone || '',
      rollNo: u.roll_no != null ? String(u.roll_no) : '—', level: levelName(u.grade_level) as AcademicLevel,
      enrolledSubjectIds: mine.map((e: any) => sid(e.course?.id)),
      feeStatus: fee as any,
      guardianName: u.guardian?.name || '', guardianPhone: u.guardian?.phone || '',
      guardianRelationship: u.guardian?.relationship || '', guardianEmail: u.guardian?.email || '',
      classYear: u.class_year || '',
      // Parent accounts linked to this student (approved links).
      parentAccounts: raw.users
        .filter((p: any) => p.role === 'parent' && (p.linked_children || []).some((c: any) => sid(c.id) === sid(u.id) && c.status === 'approved'))
        .map((p: any) => ({ id: sid(p.id), name: getDisplayName(p) || p.email, email: p.email, phone: p.phone || '' })),
      latestEnrollmentDate: latest ? latest.slice(0, 10) : '',
      attendanceRate: att && att.marked ? Math.round((att.ok / att.marked) * 100) : (null as any),
      absencesThisWeek: att?.weekAbsent || 0,
      totalPaidUSD: mine.reduce((s: number, e: any) => s + coursePrice(courseById.get(sid(e.course?.id)) || e.course), 0),
      _raw: u,
    } as any;
  }), [raw.users, activeEnrollments, attendanceByStudent, feeByStudent, levelName, courseById]);

  const teachers: Teacher[] = useMemo(() => raw.users.filter((u: any) => u.role === 'teacher').map((u: any) => {
    const taught = raw.courses.filter((c: any) => sid(c.instructor?.id ?? c.instructor_id) === sid(u.id));
    const counts = new Map<string, number>();
    taught.forEach((c: any) => counts.set(deptName(c.title), (counts.get(deptName(c.title)) || 0) + 1));
    // No subjects yet: fall back to what they listed on their profile.
    const fromProfile = [...(u.subjects || []), u.expertise || ''].filter(Boolean).join(' ');
    const dept = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || (fromProfile ? deptName(fromProfile) : 'General');
    return {
      id: sid(u.id), name: getDisplayName(u) || u.email, email: u.email, role: 'teacher',
      status: taught.length ? 'Engaged' : 'Standby', createdAt: u.date_joined, phone: u.phone || '',
      department: dept as DepartmentName, assignedSubjectIds: taught.map((c: any) => sid(c.id)),
      qualification: u.qualification || u.expertise || '', experienceYears: u.experience_years || 0,
      weeklyHours: Math.round(((recentLoad.hours.get(sid(u.id)) || 0) / 4) * 10) / 10, rating: 0,
      isActive: u.is_active, _raw: u,
      // Subjects they teach: the saved list, or a suggestion from their profile text.
      ...(() => {
        const saved: string[] = Array.isArray(u.subjects) ? u.subjects : [];
        const confirmed = saved.length > 0 && saved.every((x) => (TEACHING_AREAS as readonly string[]).includes(x));
        return confirmed
          ? { areas: saved, areasSuggested: false }
          : { areas: guessTeachingAreas([u.expertise, ...saved].filter(Boolean).join(', ')), areasSuggested: true };
      })(),
    } as any;
  }), [raw.users, raw.courses, recentLoad]);

  const parents: Parent[] = useMemo(() => raw.users.filter((u: any) => u.role === 'parent').map((u: any) => ({
    id: sid(u.id), name: getDisplayName(u) || u.email, email: u.email, role: 'parent',
    status: u.is_active ? 'Active' : 'Inactive', createdAt: u.date_joined, phone: u.phone || '',
    linkedStudentIds: (u.linked_children || []).map((c: any) => sid(c.id)),
    whatsappNumber: u.phone || '', location: '', _raw: u,
  } as any)), [raw.users]);

  const allUsers: BaseUser[] = useMemo(() => raw.users.map((u: any) => ({
    id: sid(u.id), name: getDisplayName(u) || u.email, email: u.email, role: u.role,
    status: !u.is_active ? 'Inactive' : u.role === 'teacher' ? (raw.courses.some((c: any) => sid(c.instructor?.id ?? c.instructor_id) === sid(u.id)) ? 'Engaged' : 'Standby') : 'Active',
    createdAt: (u.date_joined || '').slice(0, 10), phone: u.phone || '', isSuperuser: u.is_superuser, _raw: u,
  } as any)), [raw.users, raw.courses]);

  const subjects: Subject[] = useMemo(() => raw.courses.map((c: any) => ({
    id: sid(c.id), code: cambridgeCode(c.title), name: c.title, department: deptName(c.title),
    level: ((typeof c.category === 'object' ? c.category?.name : levelName(c.category)) || '') as AcademicLevel,
    teacherId: sid(c.instructor?.id ?? c.instructor_id), priceUSD: coursePrice(c),
    status: c.status === 'published' ? 'Published' : 'Draft',
    studentCount: activeEnrollments.filter((e: any) => sid(e.course?.id) === sid(c.id)).length,
    weeklySessions: Math.round(((recentLoad.count.get(sid(c.id)) || 0) / 4) * 2) / 2,
    description: (c.description || '').replace(/<[^>]+>/g, ''), _raw: c,
    catalogId: sid(c.subject), batchName: c.batch_name || '',
  } as any)), [raw.courses, recentLoad, activeEnrollments, levelName]);

  // Classes running right now (for the menu badge).
  const liveNowCount = useMemo(() => raw.sessions.filter((x: any) => x.status === 'live').length, [raw.sessions]);

  // Catalogue: one entry per subject with its batches (each batch is a course above).
  const catalog = useMemo(() => raw.catalog.map((x: any) => ({
    id: sid(x.id), code: x.code || '', name: x.name, level: x.category_name || '', categoryId: x.category,
    department: deptName(`${x.name} ${x.code || ''}`), description: x.description || '',
    batches: (x.batches || []).map((b: any) => ({
      id: sid(b.id), title: b.title, batchName: b.batch_name || '', teacherId: sid(b.instructor?.id), teacherName: b.instructor?.name || '',
      status: b.status === 'published' ? 'Published' : 'Draft', priceUSD: b.is_paid ? Number(b.price) || 0 : 0, students: b.active_students || 0,
      weeklySessions: Math.round(((recentLoad.count.get(sid(b.id)) || 0) / 4) * 2) / 2,
    })),
  })), [raw.catalog, recentLoad]);

  const levels: AcademicLevel[] = useMemo(() => raw.categories.map((c: any) => c.name as AcademicLevel), [raw.categories]);

  const sessions: TimetableSession[] = useMemo(() => raw.sessions.map((s: any) => {
    const start = new Date(s.scheduled_at);
    const end = new Date(start.getTime() + (s.duration_mins || 60) * 60000);
    const c: any = courseById.get(sid(s.course));
    return {
      id: sid(s.id), title: s.title, subjectId: sid(s.course), department: deptName(s.course_title || s.title),
      level: ((c && (typeof c.category === 'object' ? c.category?.name : levelName(c.category))) || '') as AcademicLevel,
      teacherId: sid(s.teacher), startTime: hm(start, tzIana), endTime: hm(end, tzIana),
      // Weekday as seen in the admin's timezone.
      dayOfWeek: new Date(start.toLocaleString('en-US', tzIana ? { timeZone: tzIana } : undefined)).getDay(),
      date: ymd(start, tzIana),
      status: s.status === 'scheduled' ? 'upcoming' : s.status,
      recurrence: s.is_recurring ? 'Weekly' : 'One-off', meetingLink: s.meeting_link || undefined,
      hasTeacherAssigned: !!s.teacher, courseTitle: s.course_title, teacherName: s.teacher_name, _raw: s,
    } as any;
  }), [raw.sessions, courseById, levelName, tzIana]);

  const meetings: TeacherMeeting[] = useMemo(() => raw.meetings.map((m: any) => {
    const start = new Date(m.scheduled_at);
    return {
      id: sid(m.id), title: m.title, teacherId: sid((m.invited_teachers || [])[0]?.id),
      date: ymd(start, tzIana), time: hm(start, tzIana), durationMinutes: m.duration_mins || 60,
      status: m.status === 'ended' ? 'Completed' : m.status === 'cancelled' ? 'Cancelled' : 'Scheduled',
      topic: m.description || '', meetLink: m.meeting_link || undefined,
      invitedNames: (m.invited_teachers || []).map((t: any) => getDisplayName(t)).join(', '), _raw: m,
    } as any;
  }), [raw.meetings, tzIana]);

  const subscriptions: Subscription[] = useMemo(() => {
    const row = (r: any, expired: boolean) => ({
      id: sid(r.enrollment_id), studentId: sid(r.student?.id), subjectId: sid(r.course?.id),
      source: r.enrollment_source === 'gumroad' ? 'Gumroad' : 'Admin Manual',
      status: expired || !r.has_access ? 'Expired' : (r.days_remaining ?? 99) <= 7 ? 'Expiring soon' : 'Active',
      accessUntil: (r.access_expires_at || '').slice(0, 10), lastChargeDate: (r.last_charge_at || '').slice(0, 10),
      monthlyAmountUSD: coursePrice(courseById.get(sid(r.course?.id))),
      gumroadSubscriptionId: r.gumroad_subscription_id || undefined,
      studentName: r.student?.name, studentEmail: r.student?.email, subjectName: r.course?.title,
      canExtend: r.can_extend, hasAccess: r.has_access, renewalDueAt: r.renewal_due_at, _raw: r,
    } as any);
    return [...(raw.subs.active || []).map((r: any) => row(r, false)), ...(raw.subs.expired || []).map((r: any) => row(r, true))];
  }, [raw.subs, courseById]);

  const enrollments: EnrollmentRecord[] = useMemo(() => raw.enrollments.map((e: any) => {
    const c: any = courseById.get(sid(e.course?.id)) || e.course;
    // 'Paid' only when Gumroad actually charged; admin-added access is not a payment.
    const viaGumroad = e.enrollment_source === 'gumroad';
    const fee = e.status !== 'active' ? (e.status === 'pending' ? 'Pending' : 'Cancelled')
      : !e.access_expires_at ? 'Free Access'
      : !e.has_access ? (viaGumroad ? 'Overdue' : 'Access expired')
      : (e.days_remaining ?? 99) <= 7 ? 'Expiring Soon' : viaGumroad ? 'Paid' : 'Access active';
    const sourceLabel = viaGumroad ? 'Gumroad' : e.enrollment_source === 'free_access' ? 'Scholarship'
      : e.enrollment_source === 'free' ? 'Free subject' : 'Added by admin';
    return {
      id: sid(e.id), studentId: sid(e.student?.id), subjectId: sid(e.course?.id), enrollmentDate: (e.enrolled_at || '').slice(0, 10),
      status: e.status === 'active' ? 'Active' : e.status === 'pending' ? 'Pending' : 'Cancelled',
      feeStatus: fee as any, source: sourceLabel, monthlyFeeUSD: coursePrice(c), electiveGroup: e.is_private ? '1-to-1 private' : 'Group class',
      studentName: e.student?.username, rollNo: e.student?.roll_no, _raw: e,
    } as any;
  }), [raw.enrollments, courseById]);

  const referrals: Referral[] = useMemo(() => raw.referrals.map((r: any) => ({
    id: sid(r.user_id), userId: sid(r.user_id), userName: r.user_name, userRole: r.role, code: r.referral_code,
    signups: r.total_signups || 0, enrolled: r.total_enrolled || 0, conversionRate: Math.round((r.conversion_rate || 0) * 10) / 10,
    earnedUSD: 0, createdAt: (r.created_at || '').slice(0, 10),
  })), [raw.referrals]);

  const posts: ContentPost[] = useMemo(() => raw.posts.map((p: any) => ({
    id: sid(p.id), type: p.post_type === 'video' ? 'Video' : 'Article', title: p.title, category: p.category || '',
    author: p.author || 'Admin', date: ((p.published_at || p.created_at) || '').slice(0, 10),
    status: p.status === 'published' ? 'Published' : 'Draft',
    thumbnailUrl: p.post_type === 'video' ? (p.video_thumbnail || '') : (p.cover_image ? getStorageUrl(p.cover_image) : ''),
    readTimeOrDuration: p.post_type === 'video' ? 'Video' : `${p.read_time || 1} min read`, views: null as any, slug: p.slug, _raw: p,
  })), [raw.posts]);

  const testimonials: Testimonial[] = useMemo(() => raw.testimonials.map((t: any) => ({
    id: sid(t.id), quote: t.quote, authorName: t.name, roleDescription: t.role || '',
    visibleOnHomepage: !!t.published, rating: 0, avatar: t.avatar || undefined,
  })), [raw.testimonials]);

  const aboutPage = useMemo(() => {
    const a = raw.about || {};
    return {
      vision: a.vision || '', mission: a.mission || '', aboutText: a.about || '', email: a.contact_email || '',
      phone: a.contact_phone || '', whatsapp: a.contact_whatsapp || '', address: a.contact_address || '',
      twitter: a.social_twitter || '', linkedin: a.social_linkedin || '', youtube: a.social_youtube || '',
      facebook: a.social_facebook || '', instagram: a.social_instagram || '',
    };
  }, [raw.about]);

  const settings: PlatformSettings = useMemo(() => {
    const s = raw.settings || {};
    const g = raw.grading || {};
    return {
      marksPerQuestion: s.quiz_marks_per_question ?? 1, publishImmediately: !!s.quiz_publish_immediately,
      submissionWindowDays: s.quiz_submission_days ?? 7,
      sessionStartMode: s.session_default_start_type === 'now' ? 'Start now' : 'Scheduled',
      recordingAutoPublish: false, defaultDurationMinutes: s.session_duration_mins ?? 60,
      gradeThresholds: { AStar: g.a_plus_min ?? 90, A: g.a_min ?? 80, B: g.b_min ?? 70, C: g.c_min ?? 60, D: g.d_min ?? 50, E: 0 },
    } as any;
  }, [raw.settings, raw.grading]);

  // Daily attendance matrix (student → date → P/A/L) for the last 7 days.
  const attendanceMatrix = useMemo(() => {
    const m: Record<string, Record<string, AttendanceStatus>> = {};
    raw.attendance.forEach((r: any) => {
      if (r.participant_role === 'teacher') return;
      const code = r.status === 'present' ? 'P' : r.status === 'late' ? 'L' : r.status === 'absent' ? 'A' : null;
      if (!code || !r.scheduled_at) return;
      const k = sid(r.student);
      const d = ymd(new Date(r.scheduled_at), tzIana);
      m[k] = m[k] || {};
      const prev = m[k][d];
      // A day with any absence shows A; otherwise late beats present.
      if (!prev || code === 'A' || (code === 'L' && prev === 'P')) m[k][d] = code as AttendanceStatus;
    });
    return m;
  }, [raw.attendance, tzIana]);

  const approvals: ApprovalItem[] = useMemo(() => {
    const items: any[] = [];
    (pendingApprovals || []).forEach((u: any) => items.push({
      id: `user-${u.id}`, type: 'account_signup', title: u.role === 'parent' ? 'New Parent Registration' : u.role === 'teacher' ? 'New Teacher Registration' : 'New Student Registration',
      requesterName: getDisplayName(u) || u.email, requesterEmail: u.email,
      targetEntityName: `${u.role.charAt(0).toUpperCase()}${u.role.slice(1)} account`,
      details: (u.requested_children || []).length ? `Also asks to link ${(u.requested_children || []).length} child account(s).` : 'Signed up on the website and is waiting for approval.',
      requestedAt: relTime(u.date_joined), status: 'pending', _raw: u,
    }));
    (pendingEnrollments || []).forEach((e: any) => items.push({
      id: `enr-${e.id}`, type: 'enrollment_request', title: 'Subject Enrollment Request', requesterName: e.student_name || 'Student',
      requesterEmail: e.student_email || '', targetEntityName: e.course_title || 'Subject',
      details: e.teacher_name ? `Requested with ${e.teacher_name}.` : 'Requested a seat in this subject.', requestedAt: relTime(e.enrolled_at), status: 'pending', _raw: e,
    }));
    (freeAccess || []).filter((r: any) => r.status === 'pending').forEach((r: any) => items.push({
      id: `free-${r.id}`, type: 'enrollment_request', title: 'Free Access (Scholarship) Request', requesterName: r.full_name || 'Applicant',
      requesterEmail: r.email || '', targetEntityName: (r.courses || []).map((c: any) => c.course?.title || c.title).filter(Boolean).join(', ') || 'Subjects',
      details: (r.eligibility_statement || '').slice(0, 160) || `${r.country || ''}`, requestedAt: relTime(r.created_at), status: 'pending', _raw: r,
    }));
    (pendingChildLinks || []).forEach((l: any) => items.push({
      id: `link-${l.link_id}`, type: 'parent_link', title: 'Parent-Child Link Confirmation', requesterName: l.parent || 'Parent',
      requesterEmail: l.parent_email || '', targetEntityName: `Link to ${l.student || 'student'}`,
      details: 'Parent asked to follow this student\'s progress.', requestedAt: relTime(l.requested_at), status: 'pending', _raw: l,
    }));
    // Attach the admissions workflow stage, waiting time and the full request.
    const reviewByKey = new Map(raw.reviews.map((r: any) => [r.key, r]));
    const DAY = 86400000;
    return items.map((it: any) => {
      const r: any = it._raw || {};
      const review: any = reviewByKey.get(it.id);
      const openStage = review && ['under_review', 'info_requested', 'on_hold'].includes(review.status) ? review.status : 'new';
      const at = r.date_joined || r.enrolled_at || r.created_at || r.requested_at;
      const waitingDays = at ? Math.max(0, Math.floor((Date.now() - new Date(at).getTime()) / DAY)) : 0;
      const facts: { label: string; value: string }[] = [];
      if (it.id.startsWith('user-')) {
        facts.push({ label: 'Role', value: r.role || '' });
        if ((r.requested_children || []).length) facts.push({ label: 'Children to link', value: r.requested_children.map((c: any) => c.email || c.name || c).join(', ') });
      } else if (it.id.startsWith('free-')) {
        facts.push({ label: 'Country', value: r.country || '—' });
        if (r.occupation) facts.push({ label: 'Occupation', value: r.occupation });
        facts.push({ label: 'Subjects', value: it.targetEntityName });
        facts.push({ label: 'Why they need it', value: r.eligibility_statement || '—' });
        if (r.goals_statement) facts.push({ label: 'Their goals', value: r.goals_statement });
      } else if (it.id.startsWith('enr-')) {
        facts.push({ label: 'Subject', value: r.course_title || '' });
        if (r.teacher_name) facts.push({ label: 'Teacher', value: r.teacher_name });
      } else if (it.id.startsWith('link-')) {
        facts.push({ label: 'Student', value: r.student || '' });
      }
      return { ...it, stage: openStage, review, waitingDays, requestedIso: at, facts: facts.filter((f) => f.value) };
    });
  }, [pendingApprovals, pendingEnrollments, freeAccess, pendingChildLinks, raw.reviews]);

  // Decisions recorded through the inbox (approved / rejected), newest first.
  const decisions = useMemo(() => raw.reviews
    .filter((r: any) => r.status === 'approved' || r.status === 'rejected')
    .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()), [raw.reviews]);

  const activities: RecentActivity[] = useMemo(() => {
    const list: any[] = [];
    approvals.forEach((a: any) => list.push({ id: `a-${a.id}`, title: a.type === 'account_signup' ? 'Account approval pending' : a.type === 'parent_link' ? 'Parent link requested' : 'New enrollment request', description: `${a.requesterName} · ${a.targetEntityName}`, at: a._raw?.date_joined || a._raw?.enrolled_at || a._raw?.created_at || a._raw?.requested_at, category: a.type === 'enrollment_request' ? 'enrollment' : 'approval' }));
    raw.enrollments.slice().sort((x: any, y: any) => new Date(y.enrolled_at).getTime() - new Date(x.enrolled_at).getTime()).slice(0, 10)
      .forEach((e: any) => list.push({ id: `e-${e.id}`, title: 'Student enrolled', description: `${e.student?.username} enrolled in ${e.course?.title}`, at: e.enrolled_at, category: 'enrollment' }));
    raw.subs.active?.filter((r: any) => r.last_charge_at).forEach((r: any) => list.push({ id: `p-${r.enrollment_id}`, title: r.enrollment_source === 'gumroad' ? 'Gumroad payment' : 'Access period started', description: `${r.student?.name} · ${r.course?.title}`, at: r.last_charge_at, category: 'payment' }));
    return list.filter((x) => x.at).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 30)
      .map((x) => ({ ...x, timestamp: relTime(x.at), actorName: 'VCS' }));
  }, [approvals, raw.enrollments, raw.subs]);

  const grades: GradeRecord[] = [];

  // ── Actions ───────────────────────────────────────────────────────────────
  const run = async (fn: () => Promise<any>, ok: string, keys: string[] = []) => {
    try {
      await fn();
      if (ok) addToast(ok, 'success');
      if (keys.length) await reload(...keys);
      return true;
    } catch (e) {
      addToast(errText(e), 'error');
      return false;
    }
  };
  const rawUser = (id: string) => raw.users.find((u: any) => sid(u.id) === sid(id));
  const setActive = (u: any, active: boolean) => adminService.updateUser(u.id, { email: u.email, is_active: active, is_staff: u.is_staff ?? false, role: u.role });

  // Records an inbox step (stage or decision) with who/when; never blocks the decision itself.
  const recordReview = async (item: any, status: string, reason = '', note = '') => {
    try {
      await axiosInstance.post(`/admin/approval-reviews/${item.id}/`, {
        status, reason, note,
        summary: { title: item.title, name: item.requesterName, email: item.requesterEmail, target: item.targetEntityName },
      });
    } catch (e) {
      addToast(`Saved, but the history note failed: ${errText(e)}`, 'warning');
    }
  };

  const approveItem = async (id: string, note = '') => {
    const item: any = approvals.find((a) => a.id === id);
    if (!item) return;
    const ok = await confirmAction({ title: `Approve ${item.requesterName}?`, message: `${item.title}: ${item.targetEntityName}. They are notified as usual.`, confirmLabel: 'Approve', isDestructive: false });
    if (!ok) return;
    const done = await run(async () => {
      if (item.type === 'account_signup') await dispatch(approveUser({ userId: item._raw.id })).unwrap();
      else if (item.type === 'parent_link') await dispatch(approveChildLink(item._raw.link_id)).unwrap();
      else if (id.startsWith('free-')) await freeAccessService.resolve(item._raw.id, (item._raw.courses || []).map((c: any) => ({ course_id: c.course?.id ?? c.id, action: 'approve' })), note);
      else await dispatch(actionEnrollment({ enrollmentId: item._raw.id, action: 'approve' })).unwrap();
    }, `Approved: ${item.requesterName}`, ['users', 'enrollments']);
    if (done) {
      await recordReview(item, 'approved', '', note);
      setApprovedTodayCount((n) => n + 1);
      refreshApprovals();
      reload('reviews');
    }
  };

  // The reject dialog collects the reason, so there is no second confirm here.
  // Sign-ups and scholarship requests include the reason in the email.
  const rejectItem = async (id: string, reason = '', note = '') => {
    const item: any = approvals.find((a) => a.id === id);
    if (!item) return false;
    const emailReason = [reason, note].filter(Boolean).join(' — ');
    const done = await run(async () => {
      if (item.type === 'account_signup') await dispatch(rejectUser({ userId: item._raw.id, reason: emailReason })).unwrap();
      else if (item.type === 'parent_link') await dispatch(rejectChildLink(item._raw.link_id)).unwrap();
      else if (id.startsWith('free-')) await freeAccessService.resolve(item._raw.id, (item._raw.courses || []).map((c: any) => ({ course_id: c.course?.id ?? c.id, action: 'reject' })), emailReason);
      else await dispatch(actionEnrollment({ enrollmentId: item._raw.id, action: 'reject' })).unwrap();
    }, `Rejected: ${item.requesterName}`);
    if (done) {
      await recordReview(item, 'rejected', reason || 'Other', note);
      setRejectedTodayCount((n) => n + 1);
      refreshApprovals();
      reload('reviews');
    }
    return done;
  };

  // Teachers Register: the subjects a teacher teaches (profile list).
  const setTeacherAreas = (teacherId: string, areas: string[]) =>
    run(() => adminService.updateUserProfile(Number(teacherId), { subjects: areas }), 'Subjects saved', ['users']);

  // ── Subjects & batches ──
  const addBatch = (subjectId: string, b: { batchName: string; teacherId?: string; priceUSD?: number; publish?: boolean }) =>
    run(() => axiosInstance.post(`/courses/subjects/${subjectId}/batches/`, {
      batch_name: b.batchName, ...(b.teacherId ? { instructor_id: Number(b.teacherId) } : {}),
      ...(b.priceUSD !== undefined ? { price: b.priceUSD, is_paid: b.priceUSD > 0 } : {}),
      status: b.publish && b.teacherId ? 'published' : 'draft',
    }), `Batch "${b.batchName}" added`, ['catalog', 'courses']);
  const renameBatch = (courseId: string, name: string) =>
    run(() => coursesService.updateCourse(Number(courseId), { batch_name: name.trim() }), name.trim() ? `Batch renamed to "${name.trim()}"` : 'Batch name cleared', ['catalog', 'courses']);
  const moveBatch = (targetSubjectId: string, courseId: string, batchName?: string) =>
    run(() => axiosInstance.post(`/courses/subjects/${targetSubjectId}/move-batch/`, { course_id: Number(courseId), ...(batchName ? { batch_name: batchName } : {}) }),
      'Batch moved; its students, classes and marks moved with it', ['catalog', 'courses']);
  const updateCatalogSubject = (subjectId: string, data: any) =>
    run(() => axiosInstance.patch(`/courses/subjects/${subjectId}/`, data), 'Subject saved', ['catalog', 'courses']);

  // Rejected sign-ups stay on file: approve after all, or delete for good.
  const reconsiderAccount = async (u: any) => {
    const ok = await confirmAction({ title: `Approve ${getDisplayName(u) || u.email} after all?`, message: 'Their account becomes active and they receive the approval email.', confirmLabel: 'Approve', isDestructive: false });
    if (!ok) return;
    const done = await run(() => dispatch(approveUser({ userId: u.id })).unwrap(), `Approved: ${getDisplayName(u) || u.email}`, ['users']);
    if (done) {
      try {
        await axiosInstance.post(`/admin/approval-reviews/user-${u.id}/`, {
          status: 'approved', note: 'Approved after an earlier rejection',
          summary: { title: 'Account sign-up', name: getDisplayName(u) || u.email, email: u.email, target: `${u.role} account` },
        });
      } catch { /* history only */ }
      refreshApprovals();
      reload('reviews');
    }
  };
  const purgeAccount = async (u: any) => {
    const ok = await confirmAction({ title: `Delete ${getDisplayName(u) || u.email} permanently?`, message: 'The rejected account and its data are removed for good. This cannot be undone. They can sign up again later.', confirmLabel: 'Delete permanently' });
    if (!ok) return;
    const done = await run(() => adminService.purgeUser(u.id), 'Account deleted permanently');
    if (done) refreshApprovals();
  };

  // Moves a request to Under review / Information requested / On hold, or back to New.
  const setReviewStage = async (id: string, stage: string, note = '') => {
    const item: any = approvals.find((a) => a.id === id);
    if (!item) return false;
    const labels: Record<string, string> = { under_review: 'Under review', info_requested: 'Waiting for the applicant', on_hold: 'On hold', new: 'Back to New' };
    const done = await run(() => (stage === 'new'
      ? axiosInstance.delete(`/admin/approval-reviews/${id}/`)
      : axiosInstance.post(`/admin/approval-reviews/${id}/`, {
          status: stage, note,
          summary: { title: item.title, name: item.requesterName, email: item.requesterEmail, target: item.targetEntityName },
        })), `${item.requesterName}: ${labels[stage] || stage}`, ['reviews']);
    return done;
  };

  // Creates the account, then saves the optional extras (profile, timezone,
  // subjects, children). Extras that fail are reported but keep the account.
  const createPerson = async (role: string, data: any) => {
    const email = (data.email || '').trim();
    const roleLabel = `${role.charAt(0).toUpperCase()}${role.slice(1)}`;
    const missed: string[] = [];
    let enrolled = 0;
    const ok = await run(async () => {
      const created: any = await adminService.createUser({
        email, password: data.password, confirm_password: data.password, role,
        first_name: (data.name || '').trim().split(' ')[0] || '', last_name: (data.name || '').trim().split(' ').slice(1).join(' '), is_active: true,
        ...(data.timezone ? { timezone: data.timezone } : {}),
        ...(role === 'parent' && data.childEmails?.length ? { student_emails: data.childEmails } : {}),
      });
      const newId = created?.id ?? created?.user?.id ?? created?.data?.id;
      if (!newId) return;
      const step = async (label: string, fn: () => Promise<any>) => {
        try { await fn(); return true; } catch (e) { missed.push(`${label}: ${errText(e)}`); return false; }
      };
      const profile = Object.fromEntries(Object.entries(data.profile || {}).filter(([, v]) => v !== '' && v != null && !(Array.isArray(v) && !v.length)));
      if (Object.keys(profile).length) await step('profile details', () => adminService.updateUserProfile(newId, profile));
      for (const cid of data.subjectIds || []) {
        const title = courseById.get(sid(cid))?.title || 'subject';
        if (role === 'student' && await step(`enrol in ${title}`, () => adminService.createEnrollment({ course_id: Number(cid), student_id: Number(newId) }))) enrolled += 1;
        if (role === 'teacher') await step(`assign ${title}`, () => coursesService.assignInstructor(Number(cid), Number(newId)));
      }
    }, '', ['users', 'enrollments', 'courses']);
    if (ok) {
      if (missed.length) addToast(`${roleLabel} account created for ${email}, but some details were not saved: ${missed.join('; ')}`, 'warning');
      else addToast(`${roleLabel} account created for ${email}${enrolled ? ` and enrolled in ${enrolled} subject${enrolled > 1 ? 's' : ''}` : ''}`, 'success');
    }
    return ok;
  };

  const addStudent = (s: any) => createPerson('student', s);
  const addTeacher = (t: any) => createPerson('teacher', t);
  const addParent = (p: any) => createPerson('parent', p);
  const addAdmin = (a: any) => createPerson('admin', a);

  const updateStudent = (id: string, updates: any) => {
    const u = rawUser(id);
    if (u && updates.status) return run(() => setActive(u, updates.status === 'Active'), `${getDisplayName(u)} is now ${updates.status.toLowerCase()}`, ['users']);
    navigate(`/admin/users/${id}`);
  };
  const updateTeacher = (id: string) => navigate(`/admin/users/${id}`);

  const deleteStudent = async (id: string) => {
    const u = rawUser(id);
    if (!u) return;
    await run(() => setActive(u, false), `${getDisplayName(u)} deactivated (can be re-activated any time)`, ['users']);
  };
  const bulkUpdateStudentStatus = async (ids: string[], status: string) => {
    const targets = ids.map(rawUser).filter((u: any) => u && u.is_active !== (status === 'Active'));
    await run(() => Promise.all(targets.map((u: any) => setActive(u, status === 'Active'))), `${targets.length} student(s) set to ${status.toLowerCase()}`, ['users']);
  };
  const toggleUserStatus = async (id: string) => {
    const u = rawUser(id);
    if (!u) return;
    const ok = await confirmAction({ title: `${u.is_active ? 'Deactivate' : 'Activate'} ${getDisplayName(u)}?`, message: u.is_active ? 'They will not be able to log in until activated again.' : 'They will be able to log in again.', confirmLabel: u.is_active ? 'Deactivate' : 'Activate', isDestructive: u.is_active });
    if (ok) await run(() => setActive(u, !u.is_active), `${getDisplayName(u)} ${u.is_active ? 'deactivated' : 'activated'}`, ['users']);
  };
  const updateUserRole = async (id: string, role: string) => {
    const u = rawUser(id);
    if (!u || u.role === role) return;
    const ok = await confirmAction({ title: `Change ${getDisplayName(u)} to ${role}?`, message: 'This changes what they can see and do after their next login.', confirmLabel: 'Change role' });
    if (ok) await run(() => adminService.updateUser(u.id, { email: u.email, role, is_active: u.is_active, is_staff: u.is_staff ?? false }), `Role changed to ${role}`, ['users']);
  };

  const addEnrollment = (r: any) =>
    run(() => adminService.createEnrollment({ course_id: Number(r.subjectId), student_id: Number(r.studentId) }), 'Student enrolled', ['enrollments', 'subs']);
  // Enrol one student in several subjects; failures are listed, the rest still go through.
  const addEnrollments = async (studentId: string, subjectIds: string[]) => {
    const failed: string[] = [];
    let done = 0;
    for (const cid of subjectIds) {
      try {
        await adminService.createEnrollment({ course_id: Number(cid), student_id: Number(studentId) });
        done += 1;
      } catch (e) {
        failed.push(`${courseById.get(sid(cid))?.title || 'subject'}: ${errText(e)}`);
      }
    }
    if (done) await reload('enrollments', 'subs');
    if (failed.length) addToast(`Enrolled in ${done} of ${subjectIds.length}. Not done: ${failed.join('; ')}`, done ? 'warning' : 'error');
    else addToast(`Enrolled in ${done} subject${done > 1 ? 's' : ''}`, 'success');
    return done > 0;
  };
  const removeEnrollment = async (id: string) => {
    const e = raw.enrollments.find((x: any) => sid(x.id) === sid(id));
    if (!e) return;
    const ok = await confirmAction({ title: 'Unenroll this student?', message: `Remove ${e.student?.username} from ${e.course?.title}?`, confirmLabel: 'Unenroll' });
    if (ok) await run(() => adminService.unenrollStudent(e.course.id, e.student.id), 'Student unenrolled', ['enrollments', 'subs']);
  };

  const allocateTeacherSubject = async (teacherId: string, subjectId: string) => {
    const c: any = courseById.get(sid(subjectId));
    const current = c && (c.instructor?.id ?? c.instructor_id);
    if (current && sid(current) !== sid(teacherId)) {
      const ok = await confirmAction({ title: 'Replace the current teacher?', message: `${c.title} is taught by ${getDisplayName(c.instructor) || 'another teacher'}. Saving replaces them.`, confirmLabel: 'Replace', isDestructive: false });
      if (!ok) return;
    }
    await run(() => coursesService.assignInstructor(Number(subjectId), Number(teacherId)), 'Teacher allocated', ['courses', 'catalog']);
  };
  const deallocateTeacherSubject = async (_teacherId: string, subjectId: string) => {
    const c: any = courseById.get(sid(subjectId));
    const ok = await confirmAction({ title: 'Remove this allocation?', message: `${c?.title || 'This subject'} will have no teacher until you assign one.`, confirmLabel: 'Remove' });
    if (ok) await run(() => coursesService.updateCourse(Number(subjectId), { instructor_id: null }), 'Allocation removed', ['courses', 'catalog']);
  };
  const bulkAssignSubject = async (teacherIds: string[], subjectId: string) => {
    if (teacherIds.length > 1) addToast('A subject has one teacher; the first selected teacher was used.', 'warning');
    if (teacherIds[0]) await allocateTeacherSubject(teacherIds[0], subjectId);
  };
  const toggleTeacherStatus = () => setCurrentView('teacher-allocations');

  const addSubject = (s: any) => {
    const cat = raw.categories.find((c: any) => c.name === s.level);
    return run(() => coursesService.createCourse({
      title: s.name, description: s.description || s.name, ...(cat ? { category: cat.id } : {}), price: s.priceUSD || 0, is_paid: (s.priceUSD || 0) > 0,
      status: s.status === 'Published' ? 'published' : 'draft', ...(s.teacherId ? { instructor_id: Number(s.teacherId) } : {}),
      ...(s.batchName ? { batch_name: s.batchName } : {}),
    }), `Subject created: ${s.name}`, ['courses', 'catalog']);
  };
  const updateSubject = (id: string) => navigate(`/admin/courses/${id}`);
  const toggleSubjectStatus = async (id: string) => {
    const c: any = courseById.get(sid(id));
    if (!c) return;
    const next = c.status === 'published' ? 'draft' : 'published';
    const ok = await confirmAction({ title: next === 'draft' ? 'Unpublish this subject?' : 'Publish this subject?', message: next === 'draft' ? `${c.title} will be hidden from the website.` : `${c.title} will appear on the website.`, confirmLabel: next === 'draft' ? 'Unpublish' : 'Publish', isDestructive: next === 'draft' });
    if (ok) await run(() => coursesService.updateCourse(c.id, { status: next }), `${c.title} is now ${next}`, ['courses', 'catalog']);
  };

  const addLevel = (name: string) =>
    run(() => coursesService.syncCategories([...raw.categories.map((c: any) => ({ id: c.id, name: c.name })), { name }]), `Level added: ${name}`, ['categories']);
  const removeLevel = async (name: string) => {
    const ok = await confirmAction({ title: `Delete level "${name}"?`, message: 'Subjects using this level will show no level.', confirmLabel: 'Delete' });
    if (ok) await run(() => coursesService.syncCategories(raw.categories.filter((c: any) => c.name !== name).map((c: any) => ({ id: c.id, name: c.name }))), `Level removed: ${name}`, ['categories', 'courses']);
  };

  // Creating classes books Google Calendar events and invites students, so it
  // stays on the full class planner with all its options.
  const addSession = () => navigate('/admin/sessions/plan');
  const updateSession = () => navigate('/admin/sessions/plan');
  const deleteSession = () => navigate('/admin/sessions/plan');
  const addMeeting = () => navigate('/admin/teacher-planner/plan');

  const renewSubscription = async (id: string) => {
    const r: any = subscriptions.find((s) => s.id === sid(id));
    if (!r) return;
    if (!r.canExtend) { addToast(r.renewalDueAt ? `Renewal opens on ${new Date(r.renewalDueAt).toLocaleDateString()} (a week before expiry).` : 'This subscription renews on Gumroad by itself.', 'info'); return; }
    const ok = await confirmAction({ title: r.hasAccess ? 'Record another month?' : 'Restore access?', message: r.hasAccess ? `Add a month to ${r.studentName} on "${r.subjectName}". Only do this once you have their payment.` : `Switch ${r.studentName} back on for "${r.subjectName}" for a month starting today.`, confirmLabel: r.hasAccess ? 'Add 1 month' : 'Restore access', isDestructive: false });
    if (ok) await run(() => adminService.extendSubscription(Number(id)), `Access extended for ${r.studentName}`, ['subs', 'enrollments']);
  };
  const cancelSubscription = async (id: string) => {
    const r: any = subscriptions.find((s) => s.id === sid(id));
    if (!r) return;
    const ok = await confirmAction({ title: 'End access now?', message: `${r.studentName} loses "${r.subjectName}" immediately. They stay enrolled and keep their grades. Gumroad billing is not touched.`, confirmLabel: 'End access' });
    if (ok) await run(() => adminService.revokeSubscription(Number(id)), `Access ended for ${r.studentName}`, ['subs', 'enrollments']);
  };

  const togglePostStatus = async (id: string) => {
    const p: any = raw.posts.find((x: any) => sid(x.id) === sid(id));
    if (!p) return;
    const next = p.status === 'published' ? 'draft' : 'published';
    await run(() => blogsService.updateBlog(p.slug, { status: next }), next === 'published' ? 'Published on the website' : 'Moved back to drafts', ['posts']);
  };
  const addPost = (p: any) => navigate('/admin/blogs/new', { state: { post_type: p?.type === 'Video' ? 'video' : 'article' } });

  const addTestimonial = (t: any) => run(() => testimonialsService.createTestimonial({
    quote: t.quote, name: t.authorName, role: t.roleDescription || '', published: !!t.visibleOnHomepage,
  }), t.visibleOnHomepage ? 'Testimonial added to the home page' : 'Testimonial saved as hidden', ['testimonials']);
  const toggleTestimonialVisibility = (id: string) => {
    const t = testimonials.find((x) => x.id === id);
    if (!t) return;
    return run(() => testimonialsService.updateTestimonial(id, { published: !t.visibleOnHomepage }),
      t.visibleOnHomepage ? 'Hidden from the home page' : 'Now showing on the home page', ['testimonials']);
  };
  const deleteTestimonial = async (id: string) => {
    const t = testimonials.find((x) => x.id === id);
    const ok = await confirmAction({ title: 'Delete testimonial?', message: `The quote from ${t?.authorName || 'this person'} will be removed for good.`, confirmLabel: 'Delete' });
    if (!ok) return;
    return run(() => testimonialsService.deleteTestimonial(id), 'Testimonial deleted', ['testimonials']);
  };

  const updateAboutPage = (d: any) => {
    const next = { ...aboutPage, ...d };
    return run(() => aboutService.update({
      vision: next.vision, mission: next.mission, about: next.aboutText, contact_email: next.email, contact_phone: next.phone,
      contact_whatsapp: next.whatsapp, contact_address: next.address, social_facebook: next.facebook, social_instagram: next.instagram,
      social_twitter: next.twitter, social_linkedin: next.linkedin, social_youtube: next.youtube,
    }), 'About page saved. The public page shows it now.', ['about']);
  };

  const updateSettings = (s: any) => {
    const next = { ...settings, ...s };
    const calls: Promise<any>[] = [platformSettingsService.update({
      quiz_marks_per_question: next.marksPerQuestion, quiz_publish_immediately: next.publishImmediately, quiz_submission_days: next.submissionWindowDays,
      session_duration_mins: next.defaultDurationMinutes, session_default_start_type: next.sessionStartMode === 'Start now' ? 'now' : 'scheduled',
    })];
    if (s.gradeThresholds) {
      const g = next.gradeThresholds;
      calls.push(coursesService.updateGradingScale({ a_plus_min: g.AStar, a_min: g.A, b_min: g.B, c_min: g.C, d_min: g.D }));
    }
    return run(() => Promise.all(calls), 'Platform settings saved', ['settings', 'grading']);
  };

  const updateGrade = () => addToast('Grades are entered by teachers when marking work.', 'info');

  // Click-to-cycle in the attendance matrix edits that day's class record.
  const toggleAttendanceCell = async (studentId: string, date: string, courseId?: string) => {
    const rows = raw.attendance.filter((r: any) => r.participant_role !== 'teacher' && sid(r.student) === sid(studentId) && r.scheduled_at && ymd(new Date(r.scheduled_at), tzIana) === date && (!courseId || sid(sessionCourse.get(sid(r.session))) === sid(courseId)));
    if (rows.length !== 1) {
      addToast(rows.length ? 'This student had more than one class that day. Open Attendance → pick the subject to edit a single class.' : 'No class recorded for this student on that day.', 'info');
      return;
    }
    const r = rows[0];
    const next = r.status === 'present' ? 'late' : r.status === 'late' ? 'absent' : 'present';
    await run(() => teacherService.updateStudentAttendance(r.session, r.student, { status: next }), `Marked ${next}`, ['attendance']);
  };

  const addActivity = () => undefined;
  const resetDemoData = () => { reload(); refreshApprovals(); addToast('Refreshed from the server.', 'info'); };

  const value = {
    theme, toggleTheme, currentView, setCurrentView, sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen,
    timezone, setTimezone, tzIana,
    commandPaletteOpen, setCommandPaletteOpen, detailDrawer, openDetailDrawer, closeDetailDrawer, quickAddModal, openQuickAdd, closeQuickAdd,
    approvals, approveItem, rejectItem, setReviewStage, decisions, rejectedAccounts, reconsiderAccount, purgeAccount, approvedTodayCount, rejectedTodayCount,
    students, addStudent, updateStudent, deleteStudent, bulkUpdateStudentStatus,
    enrollments, addEnrollment, addEnrollments, removeEnrollment,
    teachers, addTeacher, updateTeacher, toggleTeacherStatus, bulkAssignSubject, allocateTeacherSubject, deallocateTeacherSubject,
    levelOptions: raw.categories, parents, addParent, addAdmin, allUsers, updateUserRole, toggleUserStatus,
    liveNowCount, setTeacherAreas, subjects, catalog, addBatch, renameBatch, moveBatch, updateCatalogSubject, addSubject, updateSubject, toggleSubjectStatus, levels, addLevel, removeLevel,
    sessions, addSession, updateSession, deleteSession, meetings, addMeeting,
    subscriptions, renewSubscription, cancelSubscription, referrals,
    posts, addPost, togglePostStatus, testimonials, addTestimonial, toggleTestimonialVisibility, deleteTestimonial,
    aboutPage, updateAboutPage, settings, updateSettings, grades, updateGrade,
    attendanceMatrix, toggleAttendanceCell, activities, addActivity,
    toasts, addToast, removeToast, resetDemoData,
    // Extras used by the real-data views.
    loaded, reload, analytics: raw.analytics, rawAttendance: raw.attendance.filter((r: any) => r.participant_role !== 'teacher'), rawAttendanceAll: raw.attendance, sessionCourse, rawCourses: raw.courses, categories: raw.categories,
    subscriptionsRaw: raw.subs, confirmAction, profile,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <ConfirmDialog
        isOpen={!!confirmReq}
        title={confirmReq?.title || ''}
        message={confirmReq?.message || ''}
        confirmLabel={confirmReq?.confirmLabel}
        isDestructive={confirmReq?.isDestructive ?? true}
        onConfirm={() => { confirmReq?.resolve(true); setConfirmReq(null); }}
        onCancel={() => { confirmReq?.resolve(false); setConfirmReq(null); }}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
