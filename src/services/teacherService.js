import axiosInstance from "../utils/axiosInstance";

const getTeachers = async (params = {}) => {
  const query = {};

  if (params.teacher?.trim()) {
    query.teacher = params.teacher.trim();
  }

  if (params.course?.trim()) {
    query.course = params.course.trim();
  }

  const response = await axiosInstance.get("/courses/teachers/", {
    params: query,
  });

  return response.data;
};

const getTeacherById = async (id) => {
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new Error("Valid teacher ID is required");
  }
  const response = await axiosInstance.get(
    `/courses/teachers/${encodeURIComponent(id.trim())}`,
  );
  return response.data;
};

const getTeacherDashboard = async () => {
  const response = await axiosInstance.get("/classroom/teacher-dashboard/");
  return response.data;
};

const getMyCourses = async () => {
  const response = await axiosInstance.get("/classroom/my-courses/");
  return response.data;
};

const getAssignments = async () => {
  const response = await axiosInstance.get("/assignments/");
  return response.data;
};

export const teacherService = {
  getTeachers,
  getTeacherById,
  getTeacherDashboard,
  getMyCourses,
  getAssignments,
};
