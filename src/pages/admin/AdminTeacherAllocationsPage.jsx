import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  fetchUsers,
  assignInstructor,
} from "../../store/slices/adminSlice";
import { coursesService } from "../../services/coursesService";
import TeacherAllocationsTab from "../../components/admin/TeacherAllocationsTab";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const AdminTeacherAllocationsPage = () => {
  const dispatch = useDispatch();

  const courses = useSelector((state) => state.admin.courses);
  const users = useSelector((state) => state.admin.users);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchUsers({ role: "teacher" }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCourses());
    dispatch(fetchUsers({ role: "teacher" }));
  };

  const handleAssignTeacher = async (courseId, teacherId) => {
    try {
      await dispatch(assignInstructor({ courseId, instructorId: teacherId })).unwrap();
      await dispatch(fetchCourses());
      toastManager.success("Teacher allocated to Cambridge subject successfully");
      return true;
    } catch (error) {
      showApiError(error);
      return false;
    }
  };

  const handleUnassignTeacher = async (courseId) => {
    try {
      await coursesService.updateCourse(courseId, { instructor_id: null });
      await dispatch(fetchCourses());
      toastManager.success("Teacher unassigned from Cambridge subject");
      return true;
    } catch (error) {
      showApiError(error);
      return false;
    }
  };

  // Only pass approved or active teachers to allocations
  const teachersList = (users?.data || []).filter(
    (u) => u.role === "teacher"
  );

  return (
    <TeacherAllocationsTab
      courses={courses?.data || []}
      teachers={teachersList}
      loading={courses?.loading || users?.loading || false}
      onAssignTeacher={handleAssignTeacher}
      onUnassignTeacher={handleUnassignTeacher}
      onRefresh={handleRefresh}
    />
  );
};

export default AdminTeacherAllocationsPage;
