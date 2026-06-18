import axiosInstance from "../utils/axiosInstance";

const BASE = "/messaging/about/";

export const aboutService = {
  get: async () => {
    const res = await axiosInstance.get(BASE);
    return res.data;
  },

  update: async (data) => {
    const res = await axiosInstance.patch(`${BASE}update/`, data);
    return res.data;
  },
};
