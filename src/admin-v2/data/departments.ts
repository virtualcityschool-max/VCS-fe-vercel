// Colours and labels for each department chip in the admin.
import { DepartmentName } from '../types';

export const DEPARTMENT_CONFIG: Record<
  DepartmentName,
  {
    bgDark: string;
    textDark: string;
    borderDark: string;
    bgLight: string;
    textLight: string;
    badgeColor: string;
    hex: string;
  }
> = {
  Mathematics: {
    bgDark: 'bg-indigo-950/60',
    textDark: 'text-indigo-400',
    borderDark: 'border-indigo-800/60',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    badgeColor: 'indigo',
    hex: '#6366F1',
  },
  Physics: {
    bgDark: 'bg-sky-950/60',
    textDark: 'text-sky-400',
    borderDark: 'border-sky-800/60',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-700',
    badgeColor: 'sky',
    hex: '#0284C7',
  },
  Chemistry: {
    bgDark: 'bg-emerald-950/60',
    textDark: 'text-emerald-400',
    borderDark: 'border-emerald-800/60',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    badgeColor: 'emerald',
    hex: '#059669',
  },
  Biology: {
    bgDark: 'bg-teal-950/60',
    textDark: 'text-teal-400',
    borderDark: 'border-teal-800/60',
    bgLight: 'bg-teal-50',
    textLight: 'text-teal-700',
    badgeColor: 'teal',
    hex: '#0D9488',
  },
  'English & Urdu': {
    bgDark: 'bg-amber-950/60',
    textDark: 'text-amber-400',
    borderDark: 'border-amber-800/60',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-700',
    badgeColor: 'amber',
    hex: '#D97706',
  },
  'Computer Science': {
    bgDark: 'bg-purple-950/60',
    textDark: 'text-purple-400',
    borderDark: 'border-purple-800/60',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
    badgeColor: 'purple',
    hex: '#9333EA',
  },
  General: {
    bgDark: 'bg-rose-950/60',
    textDark: 'text-rose-400',
    borderDark: 'border-rose-800/60',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    badgeColor: 'rose',
    hex: '#E11D48',
  },
};
