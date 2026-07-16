import axiosInstance from "../utils/axiosInstance";

export const blogsService = {
  // Get all blogs.
  //  - Public/anon users receive published blogs only (enforced by the backend).
  //  - Admins (authenticated) receive drafts + published.
  // params: { category, status, search, ordering }
  getAllBlogs: async (params) => {
    try {
      const response = await axiosInstance.get(`/blogs/`, { params });
      return response.data;
    } catch (error) {
      console.error("Get blogs error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Get a single blog by its SEO-friendly slug.
  getBlogBySlug: async (slug) => {
    try {
      const response = await axiosInstance.get(`/blogs/${slug}/`);
      return response.data;
    } catch (error) {
      console.error("Get blog error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Create a blog (admin). Pass FormData so the cover image uploads as multipart.
  createBlog: async (formData) => {
    const response = await axiosInstance.post(`/blogs/`, formData);
    return response.data;
  },

  // Update a blog (admin). FormData or plain object both accepted.
  updateBlog: async (slug, formData) => {
    const response = await axiosInstance.patch(`/blogs/${slug}/`, formData);
    return response.data;
  },

  // Delete a blog (admin).
  deleteBlog: async (slug) => {
    const response = await axiosInstance.delete(`/blogs/${slug}/`);
    return response.data;
  },
};
