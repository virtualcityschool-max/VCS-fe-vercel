import axiosInstance from "../utils/axiosInstance";

const ENDPOINTS = {
  ME: "/referrals/me/",
  ADMIN_LIST: "/referrals/admin/",
  ADMIN_DETAIL: (userId) => `/referrals/admin/${userId}/`,
};

export const referralService = {
  // Logged-in student/teacher: their own permanent code + link.
  getMyReferral: async () => {
    const response = await axiosInstance.get(ENDPOINTS.ME);
    return response.data;
  },

  // Admin: paginated, searchable, sortable referral performance per user.
  getReferralStats: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.ADMIN_LIST, { params });
    return response.data;
  },

  // Admin: the users who signed up through one referrer's link.
  getReferralDetail: async (userId, params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.ADMIN_DETAIL(userId), {
      params,
    });
    return response.data;
  },
};

export default referralService;
