import axiosInstance from "../utils/axiosInstance";
import store from "../store";

const generateSlots = async (dateRanges) => {
  const timezone = store.getState().auth.profile?.timezone || null;
  const response = await axiosInstance.post("/availability/slots/generate/", {
    date_ranges: dateRanges,
    ...(timezone ? { timezone } : {}),
  });
  return response.data;
};

const getMySlots = async (params = {}) => {
  const response = await axiosInstance.get("/availability/slots/my-slots/", { params });
  return response.data;
};

const deleteSlot = async (slotId) => {
  const response = await axiosInstance.delete(`/availability/slots/${slotId}/`);
  return response.data;
};

const updateSlot = async (slotId, data) => {
  const response = await axiosInstance.patch(`/availability/slots/${slotId}/`, data);
  return response.data;
};

const getTeacherAvailableSlots = async (teacherId) => {
  const response = await axiosInstance.get(`/availability/slots/teacher/${teacherId}/`);
  return response.data;
};

const bookSlot = async (slotId, note = "") => {
  const response = await axiosInstance.post(`/availability/slots/${slotId}/book/`, { note });
  return response.data;
};

const getChildBookedSlots = async (childId) => {
  const params = childId ? { child_id: childId } : {};
  const response = await axiosInstance.get("/availability/slots/child-slots/", { params });
  return response.data;
};

const getMyBookings = async () => {
  const response = await axiosInstance.get("/availability/slots/my-bookings/");
  return response.data;
};

const requestCancellation = async (slotId, reason = "") => {
  const response = await axiosInstance.post(`/availability/slots/${slotId}/cancel-request/`, { reason });
  return response.data;
};

const getMyCancellationRequests = async () => {
  const response = await axiosInstance.get("/availability/cancel-requests/my/");
  return response.data;
};

const getGuardianCancellationRequests = async () => {
  const response = await axiosInstance.get("/availability/cancel-requests/");
  return response.data;
};

const resolveCancellationRequest = async (reqId, action, note = "") => {
  const response = await axiosInstance.patch(`/availability/cancel-requests/${reqId}/resolve/`, { action, note });
  return response.data;
};

const withdrawCancellationRequest = async (reqId) => {
  const response = await axiosInstance.delete(`/availability/cancel-requests/${reqId}/withdraw/`);
  return response.data;
};

export const availabilityService = {
  generateSlots,
  getMySlots,
  deleteSlot,
  updateSlot,
  getTeacherAvailableSlots,
  bookSlot,
  getChildBookedSlots,
  getMyBookings,
  requestCancellation,
  getMyCancellationRequests,
  getGuardianCancellationRequests,
  resolveCancellationRequest,
  withdrawCancellationRequest,
};
