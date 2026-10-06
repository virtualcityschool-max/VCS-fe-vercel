export type NavigationId =
  // DASHBOARD
  | 'dashboard'
  // ADMISSIONS
  | 'approvals'
  | 'students'
  | 'enrollments'
  // ACADEMICS
  | 'subjects'
  | 'teachers'
  | 'teacher-allocations'
  | 'timetable'
  // PTM
  | 'ptm-meetings'
  | 'parents'
  | 'attendance'
  | 'evaluations'
  // FINANCE
  | 'subscriptions'
  | 'referrals'
  // CONTENT
  | 'blogs'
  | 'vlogs'
  | 'testimonials'
  // SETTINGS
  | 'admin-users'
  | 'levels'
  | 'about'
  | 'settings'
  // Compatibility views & aliases
  | 'users'
  | 'meetings'
  | 'grades'
  | 'revenue'
  | 'blog'
  | 'defaults'
  | 'timezone';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export type DepartmentName =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English & Urdu'
  | 'Computer Science'
  | 'General';

export type AcademicLevel =
  | 'O Level'
  | 'IGCSE'
  | 'AS Level'
  | 'A Level'
  | 'Matric'
  | 'FSc'
  | 'Grade 8'
  | 'Grade 7'
  | 'Grade 6'
  | 'Grade 5'
  | 'Primary (1-4)';

export type FeeStatus = 'Paid' | 'Expiring Soon' | 'Overdue' | 'Free Trial';

export type UserStatus = 'Active' | 'Standby' | 'Engaged' | 'Pending' | 'Inactive';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  phone?: string;
}

export interface Student extends BaseUser {
  rollNo: string;
  level: AcademicLevel;
  enrolledSubjectIds: string[];
  feeStatus: FeeStatus;
  guardianName?: string;
  guardianPhone?: string;
  latestEnrollmentDate: string;
  attendanceRate: number; // percentage, e.g. 96
  absencesThisWeek: number;
  totalPaidUSD: number;
}

export interface Teacher extends BaseUser {
  department: DepartmentName;
  assignedSubjectIds: string[];
  qualification: string;
  experienceYears: number;
  status: 'Engaged' | 'Standby';
  weeklyHours: number;
  rating: number;
}

export interface Parent extends BaseUser {
  linkedStudentIds: string[];
  whatsappNumber: string;
  location: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "0580", "0610", "9709"
  name: string;
  department: DepartmentName;
  level: AcademicLevel;
  teacherId: string;
  priceUSD: number;
  status: 'Published' | 'Draft';
  studentCount: number;
  weeklySessions: number;
  description?: string;
}

export interface TimetableSession {
  id: string;
  title: string;
  subjectId: string;
  department: DepartmentName;
  level: AcademicLevel;
  teacherId: string;
  startTime: string; // ISO string or "15:00"
  endTime: string; // "16:00"
  dayOfWeek: number; // 0 Sunday, 1 Monday... 6 Saturday
  date?: string; // YYYY-MM-DD
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  recurrence: 'Weekly' | 'Bi-weekly' | 'One-off';
  meetingLink?: string;
  hasTeacherAssigned: boolean;
}

export interface TeacherMeeting {
  id: string;
  title: string;
  teacherId: string;
  parentId?: string;
  studentId?: string;
  date: string; // YYYY-MM-DD
  time: string; // "16:30"
  durationMinutes: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  topic: string;
  meetLink?: string;
}

export type AttendanceStatus = 'P' | 'A' | 'L' | '-';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectId: string;
  quiz1: number; // out of 20
  midterm: number; // out of 100
  mockExam: number; // out of 100
  predictedGrade: 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';
  teacherNotes?: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  subjectId: string;
  source: 'Gumroad' | 'Admin Manual';
  status: 'Active' | 'Expiring soon' | 'Expired';
  accessUntil: string; // YYYY-MM-DD
  lastChargeDate: string; // YYYY-MM-DD
  monthlyAmountUSD: number;
  gumroadSubscriptionId?: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  subjectId: string;
  enrollmentDate: string;
  status: 'Active' | 'Trial' | 'Completed' | 'Suspended';
  feeStatus: FeeStatus;
  monthlyFeeUSD: number;
  electiveGroup?: string;
}

export interface Referral {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  code: string;
  signups: number;
  enrolled: number;
  conversionRate: number; // %
  earnedUSD: number;
  createdAt: string;
}

export interface ContentPost {
  id: string;
  type: 'Article' | 'Video';
  title: string;
  category: string;
  author: string;
  date: string;
  status: 'Published' | 'Draft';
  thumbnailUrl: string;
  readTimeOrDuration: string;
  views: number;
  slug: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  roleDescription: string; // e.g. "O Level Student, Dubai"
  visibleOnHomepage: boolean;
  rating: number; // 1 to 5
  avatar?: string;
}

export interface PlatformSettings {
  // Quiz defaults
  marksPerQuestion: number;
  publishImmediately: boolean;
  submissionWindowDays: number;
  // Session defaults
  sessionStartMode: 'Scheduled' | 'Start now' | 'Delayed';
  recordingAutoPublish: boolean;
  defaultDurationMinutes: number;
  // Grading scale thresholds (%)
  gradeThresholds: {
    AStar: number;
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
}

export interface ApprovalItem {
  id: string;
  type: 'account_signup' | 'enrollment_request' | 'parent_link';
  title: string;
  requesterName: string;
  requesterEmail: string;
  targetEntityName: string; // e.g. "IGCSE Physics 0625" or "Parent linking to Ahmad Khan"
  details: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'approval' | 'enrollment' | 'payment' | 'session' | 'content' | 'user';
  actorName: string;
}
