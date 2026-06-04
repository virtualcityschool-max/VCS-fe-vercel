import axiosInstance from "../utils/axiosInstance";

const BASE = "/messaging/training/";

export const trainingService = {
  list:            () => axiosInstance.get(BASE).then(r => r.data),
  create:          (data) => axiosInstance.post(BASE, data).then(r => r.data),
  get:             (id) => axiosInstance.get(`${BASE}${id}/`).then(r => r.data),
  update:          (id, data) => axiosInstance.patch(`${BASE}${id}/`, data).then(r => r.data),
  remove:          (id) => axiosInstance.delete(`${BASE}${id}/`),
  register:        (id) => axiosInstance.post(`${BASE}${id}/register/`).then(r => r.data),
  registrations:   (id) => axiosInstance.get(`${BASE}${id}/registrations/`).then(r => r.data),
  markAttended:    (id, regId, attended) =>
    axiosInstance.patch(`${BASE}${id}/registrations/${regId}/`, { attended }).then(r => r.data),
  unreadCount:     () => axiosInstance.get("/messaging/training/unread-count/").then(r => r.data),
};
