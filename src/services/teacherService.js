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

export const teacherService = {
  getTeachers,
};
