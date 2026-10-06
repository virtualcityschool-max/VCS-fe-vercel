import React from 'react';
import { useLocation } from 'react-router-dom';
import { StudentsView } from './StudentsView';
import { TeachersView } from './TeachersView';
import { ParentsView } from './ParentsView';
import { AdminUsersView } from './AdminUsersView';

// /admin/users?role=… shows the matching directory from the redesign.
export const UsersByRole: React.FC = () => {
  const role = new URLSearchParams(useLocation().search).get('role');
  if (role === 'teacher') return <TeachersView />;
  if (role === 'parent') return <ParentsView />;
  if (role === 'admin') return <AdminUsersView />;
  return <StudentsView />;
};
