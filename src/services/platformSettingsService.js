import axiosInstance from "../utils/axiosInstance";

export const platformSettingsService = {
  get:    () => axiosInstance.get("/messaging/platform-settings/").then(r => r.data),
  update: (data) => axiosInstance.patch("/messaging/platform-settings/update/", data).then(r => r.data),
};
