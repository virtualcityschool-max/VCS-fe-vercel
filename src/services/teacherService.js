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
  const response = await axiosInstance.get("/courses/my-courses/");
  return response.data;
};

const getAssignments = async (params = {}) => {
  const query = {};

  if (params.course) {
    query.course = params.course;
  }

  if (params.status) {
    query.status = params.status;
  }

  const response = await axiosInstance.get("/assignments/", {
    params: query,
  });
  return response.data;
};

const createAssignment = async (data) => {
  const response = await axiosInstance.post("/assignments/", data);
  return response.data;
};

const getSubmissions = async (assignmentId) => {
  const response = await axiosInstance.get(
    `/assignments/${assignmentId}/submissions/`,
  );
  return response.data;
};

const gradeSubmission = async (submissionId, data) => {
  const response = await axiosInstance.post(
    `/assignments/submissions/${submissionId}/grade/`,
    data,
  );
  return response.data;
};

const updateSubmissionGrade = async (submissionId, data) => {
  const response = await axiosInstance.patch(
    `/assignments/submissions/${submissionId}/grade/`,
    data,
  );
  return response.data;
};

const getSubmissionById = async (submissionId) => {
  const response = await axiosInstance.get(
    `/assignments/submissions/${submissionId}/`,
  );
  return response.data;
};

const getAllSubmissions = async (params = {}) => {
  const query = {};
  if (params.course) query.course = params.course;
  const response = await axiosInstance.get("/assignments/submissions/all/", { params: query });
  return response.data;
};

const createAnnouncement = async (data) => {
  const response = await axiosInstance.post("/messaging/announcements/", data);
  return response.data;
};

const getTeacherSessions = async (params = {}) => {
  const response = await axiosInstance.get("/classroom/sessions/", { params });
  return response.data;
};

const getSessionAttendance = async (sessionId) => {
  const response = await axiosInstance.get(
    `/classroom/sessions/${sessionId}/attendance/`,
  );
  return response.data;
};

const updateSessionAttendance = async (sessionId, attendanceId, data) => {
  const response = await axiosInstance.patch(
    `/classroom/sessions/${sessionId}/attendance/${attendanceId}/`,
    data,
  );
  return response.data;
};

const joinLiveSession = async (sessionId) => {
  const response = await axiosInstance.get(`/classroom/sessions/${sessionId}/`);
  return response.data;
};

// const joinLiveSession = async (sessionId) => {
//   const response = await axiosInstance.post(
//     `/classroom/sessions/${sessionId}/join/`,
//   );
//   return response.data;
// };

const startSession = async (sessionId) => {
  const response = await axiosInstance.patch(
    `/classroom/sessions/${sessionId}/start/`,
  );
  return response.data;
};

const endSession = async (sessionId) => {
  const response = await axiosInstance.patch(
    `/classroom/sessions/${sessionId}/end/`,
  );
  return response.data;
};

export const teacherService = {
  getTeachers,
  getTeacherById,
  getTeacherDashboard,
  getMyCourses,
  getAssignments,
  createAssignment,
  getSubmissions,
  getSubmissionById,
  getAllSubmissions,
  gradeSubmission,
  updateSubmissionGrade,
  createAnnouncement,
  getTeacherSessions,
  getSessionAttendance,
  updateSessionAttendance,
  joinLiveSession,
  startSession,
  endSession,
};
