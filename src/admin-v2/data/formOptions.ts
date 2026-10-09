// Fixed choice lists for admin forms, so admins pick instead of typing and the
// data stays consistent (e.g. one spelling per country, IANA timezones).

export interface CountryOption {
  name: string;
  dial: string; // without '+', as the backend stores phones (e.g. 923001234567)
  tz: string;
}

// VCS families are mostly in the Gulf and Pakistan; the rest follow.
export const COUNTRIES: CountryOption[] = [
  { name: 'Saudi Arabia', dial: '966', tz: 'Asia/Riyadh' },
  { name: 'United Arab Emirates', dial: '971', tz: 'Asia/Dubai' },
  { name: 'Qatar', dial: '974', tz: 'Asia/Qatar' },
  { name: 'Kuwait', dial: '965', tz: 'Asia/Kuwait' },
  { name: 'Bahrain', dial: '973', tz: 'Asia/Bahrain' },
  { name: 'Oman', dial: '968', tz: 'Asia/Muscat' },
  { name: 'Pakistan', dial: '92', tz: 'Asia/Karachi' },
  { name: 'United Kingdom', dial: '44', tz: 'Europe/London' },
  { name: 'United States', dial: '1', tz: 'America/New_York' },
  { name: 'Canada', dial: '1', tz: 'America/Toronto' },
  { name: 'India', dial: '91', tz: 'Asia/Kolkata' },
  { name: 'Bangladesh', dial: '880', tz: 'Asia/Dhaka' },
  { name: 'Egypt', dial: '20', tz: 'Africa/Cairo' },
  { name: 'Jordan', dial: '962', tz: 'Asia/Amman' },
  { name: 'Palestine', dial: '970', tz: 'Asia/Hebron' },
  { name: 'Malaysia', dial: '60', tz: 'Asia/Kuala_Lumpur' },
  { name: 'Turkey', dial: '90', tz: 'Europe/Istanbul' },
  { name: 'Australia', dial: '61', tz: 'Australia/Sydney' },
];

export const TIMEZONES: { value: string; label: string }[] = [
  { value: 'Asia/Riyadh', label: 'Riyadh / Kuwait / Bahrain / Qatar (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Dubai / Muscat (UTC+4)' },
  { value: 'Asia/Karachi', label: 'Pakistan (UTC+5)' },
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30)' },
  { value: 'Asia/Dhaka', label: 'Bangladesh (UTC+6)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia (UTC+8)' },
  { value: 'Africa/Cairo', label: 'Egypt (UTC+2/+3)' },
  { value: 'Asia/Amman', label: 'Jordan / Palestine (UTC+3)' },
  { value: 'Europe/Istanbul', label: 'Turkey (UTC+3)' },
  { value: 'Europe/London', label: 'UK (UTC+0/+1)' },
  { value: 'America/New_York', label: 'US / Canada East (UTC−5/−4)' },
  { value: 'Australia/Sydney', label: 'Australia East (UTC+10/+11)' },
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const GUARDIAN_RELATIONSHIPS = [
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'relative', label: 'Relative' },
  { value: 'other', label: 'Other' },
];

export const LEARNING_GOALS = [
  { value: 'exam_prep', label: 'Exam preparation' },
  { value: 'enrichment', label: 'Enrichment' },
  { value: 'catchup', label: 'Catch-up' },
  { value: 'general', label: 'General learning' },
];

export const QUALIFICATIONS = [
  'B.A.', 'B.Sc. / BS', 'B.Ed.', 'M.A.', 'M.Sc. / MS', 'M.Ed.', 'M.Phil.', 'Ph.D.',
  'Pharm-D', 'MBBS', 'Hafiz-e-Quran / Alim', 'Professional diploma', 'Other',
];

export const EXPERIENCE_YEARS = [
  { value: 0, label: 'Less than 1 year' },
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 5, label: '5 years' },
  { value: 7, label: '7 years' },
  { value: 10, label: '10 years' },
  { value: 15, label: '15+ years' },
];

// Teaching areas; stored as the teacher's "expertise".
export const SUBJECT_AREAS = [
  'Mathematics', 'Additional Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'ICT',
  'English', 'Urdu', 'Arabic', 'Islamiyat', 'Pakistan Studies', 'Economics', 'Business Studies',
  'Accounting', 'Geography', 'History', 'Sociology', 'Psychology', 'Quran / Tajweed', 'Science (Primary)',
  'General / Primary', 'Technology & AI', 'Other',
];

export const FEE_PRESETS = [0, 15, 20, 25, 30, 35, 40, 50, 60, 80, 100, 120];

export const BLOG_CATEGORIES = [
  'Announcements', 'Exam Results', 'Study Tips', 'Online Learning', 'Technology & Education',
  'Inspiration & Events', 'Parents Corner', 'Student Success Stories',
];

// Common Cambridge syllabuses. Picking one fills the subject name and code.
// stage: 'OL' = O Level / IGCSE, 'AL' = AS & A Level.
export const CAMBRIDGE_SUBJECTS: { code: string; name: string; stage: 'OL' | 'AL' }[] = [
  { code: '0580', name: 'Mathematics IGCSE', stage: 'OL' },
  { code: '0606', name: 'Additional Mathematics IGCSE', stage: 'OL' },
  { code: '0610', name: 'Biology IGCSE', stage: 'OL' },
  { code: '0620', name: 'Chemistry IGCSE', stage: 'OL' },
  { code: '0625', name: 'Physics IGCSE', stage: 'OL' },
  { code: '0478', name: 'Computer Science IGCSE', stage: 'OL' },
  { code: '0417', name: 'ICT IGCSE', stage: 'OL' },
  { code: '0500', name: 'First Language English IGCSE', stage: 'OL' },
  { code: '0510', name: 'English as a Second Language IGCSE', stage: 'OL' },
  { code: '0450', name: 'Business Studies IGCSE', stage: 'OL' },
  { code: '0452', name: 'Accounting IGCSE', stage: 'OL' },
  { code: '0455', name: 'Economics IGCSE', stage: 'OL' },
  { code: '0460', name: 'Geography IGCSE', stage: 'OL' },
  { code: '0470', name: 'History IGCSE', stage: 'OL' },
  { code: '0493', name: 'Islamiyat IGCSE', stage: 'OL' },
  { code: '0448', name: 'Pakistan Studies IGCSE', stage: 'OL' },
  { code: '0539', name: 'Urdu as a Second Language IGCSE', stage: 'OL' },
  { code: '0544', name: 'Arabic Foreign Language IGCSE', stage: 'OL' },
  { code: '4024', name: 'Mathematics D O Level', stage: 'OL' },
  { code: '4037', name: 'Additional Mathematics O Level', stage: 'OL' },
  { code: '5090', name: 'Biology O Level', stage: 'OL' },
  { code: '5070', name: 'Chemistry O Level', stage: 'OL' },
  { code: '5054', name: 'Physics O Level', stage: 'OL' },
  { code: '2210', name: 'Computer Science O Level', stage: 'OL' },
  { code: '1123', name: 'English Language O Level', stage: 'OL' },
  { code: '2058', name: 'Islamiyat O Level', stage: 'OL' },
  { code: '2059', name: 'Pakistan Studies O Level', stage: 'OL' },
  { code: '3248', name: 'Second Language Urdu O Level', stage: 'OL' },
  { code: '3180', name: 'Arabic O Level', stage: 'OL' },
  { code: '7115', name: 'Business Studies O Level', stage: 'OL' },
  { code: '7707', name: 'Accounting O Level', stage: 'OL' },
  { code: '2281', name: 'Economics O Level', stage: 'OL' },
  { code: '2217', name: 'Geography O Level', stage: 'OL' },
  { code: '9709', name: 'Mathematics AS & A Level', stage: 'AL' },
  { code: '9231', name: 'Further Mathematics AS & A Level', stage: 'AL' },
  { code: '9700', name: 'Biology AS & A Level', stage: 'AL' },
  { code: '9701', name: 'Chemistry AS & A Level', stage: 'AL' },
  { code: '9702', name: 'Physics AS & A Level', stage: 'AL' },
  { code: '9618', name: 'Computer Science AS & A Level', stage: 'AL' },
  { code: '9093', name: 'English Language AS & A Level', stage: 'AL' },
  { code: '9609', name: 'Business AS & A Level', stage: 'AL' },
  { code: '9706', name: 'Accounting AS & A Level', stage: 'AL' },
  { code: '9708', name: 'Economics AS & A Level', stage: 'AL' },
  { code: '9686', name: 'Urdu (Pakistan) AS & A Level', stage: 'AL' },
  { code: '9488', name: 'Islamic Studies AS & A Level', stage: 'AL' },
  { code: '9990', name: 'Psychology AS & A Level', stage: 'AL' },
  { code: '9699', name: 'Sociology AS & A Level', stage: 'AL' },
];

// Password the backend accepts: 8+ chars with upper, lower, digit and symbol.
// Avoids look-alike characters so it can be read out over WhatsApp.
export const generatePassword = () => {
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digit = '23456789';
  return `${pick(upper)}${pick(lower)}${pick(lower)}${pick(lower)}${pick(lower)}-${pick(digit)}${pick(digit)}${pick(digit)}${pick(upper)}`;
};

export const countryByName = (name?: string) => COUNTRIES.find((c) => c.name === name);

// Class / year group within a level (set by the school on each student).
export const CLASS_YEARS: { group: string; options: string[] }[] = [
  { group: 'Primary', options: ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'] },
  { group: 'Middle school', options: ['Grade 6', 'Grade 7', 'Grade 8'] },
  { group: 'O Level / IGCSE', options: ['O1', 'O2', 'O3'] },
  { group: 'AS & A Level', options: ['A1', 'A2'] },
  { group: 'Matric / FSc', options: ['Class 9', 'Class 10', 'Class 11', 'Class 12'] },
  { group: 'Other', options: ['Short course', 'Adult learner'] },
];

// Phones are stored as digits with the country code (no '+').
export const formatPhone = (digits?: string | null) => (digits ? `+${String(digits).replace(/^\+/, '')}` : '');
export const whatsappLink = (digits?: string | null) =>
  digits ? `https://wa.me/${String(digits).replace(/[^\d]/g, '')}` : '';

// Subjects a teacher can teach (Teachers Register). Stored on the teacher's
// profile as a list; a teacher can have several, a subject many teachers.
export const TEACHING_AREAS = [
  'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Computer Science',
  'English', 'Urdu', 'Pakistan Studies', 'Islamiat', 'Others',
] as const;

// Best guess from free text a teacher typed (used only as a suggestion).
export const guessTeachingAreas = (text?: string | null): string[] => {
  const t = (text || '').normalize('NFKC');
  if (!t.trim()) return [];
  const rules: [string, RegExp][] = [
    ['Mathematics', /math|algebra|calculus|trigonometr/i],
    ['Physics', /physics/i],
    ['Biology', /biolog|\bbio\b/i],
    ['Chemistry', /chemist/i],
    ['Computer Science', /computer|programming|\bict\b|ms office/i],
    ['English', /english|grammar|creative writing/i],
    ['Urdu', /urdu/i],
    ['Pakistan Studies', /pak(istan)?\s*stud/i],
    ['Islamiat', /islam/i],
  ];
  const found = rules.filter(([, re]) => re.test(t)).map(([name]) => name);
  return found.length ? found : ['Others'];
};
