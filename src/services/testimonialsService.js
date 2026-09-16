import axiosInstance from "../utils/axiosInstance";

// REST contract expected of the backend (not yet implemented there - see
// AdminTestimonialsPage.jsx and PublicHome.jsx for the two consumers):
//
//   GET    /testimonials/        Public/anon: published only. Admin: all.
//   POST   /testimonials/        Admin. Body: { quote, name, role, published }
//   PATCH  /testimonials/:id/    Admin. Same fields, partial.
//   DELETE /testimonials/:id/    Admin.
//
// Mirrors blogsService.js's shape exactly (same publish-gate convention as
// blogs: public callers only ever see published=true records, enforced
// server-side, not just hidden client-side).
export const testimonialsService = {
  getAllTestimonials: async (params) => {
    try {
      const response = await axiosInstance.get(`/testimonials/`, { params });
      return response.data;
    } catch (error) {
      console.error("Get testimonials error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  createTestimonial: async (data) => {
    const response = await axiosInstance.post(`/testimonials/`, data);
    return response.data;
  },

  updateTestimonial: async (id, data) => {
    const response = await axiosInstance.patch(`/testimonials/${id}/`, data);
    return response.data;
  },

  deleteTestimonial: async (id) => {
    const response = await axiosInstance.delete(`/testimonials/${id}/`);
    return response.data;
  },
};

export default testimonialsService;
