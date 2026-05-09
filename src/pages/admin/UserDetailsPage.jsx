import React, { useState, useEffect } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser, purgeUser } from "../../store/slices/adminSlice";
import { adminService } from "../../services/adminService";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";
import {
  UserDetailsHeader,
  UserDetailsTabs,
  UserAccountTab,
  TeacherProfileTab,
  StudentProfileTab,
  ParentProfileTab,
} from "../../components/admin";

// Utility function to validate user ID
const isValidUserId = (id) => {
  return id && typeof id === "string" && id.trim() !== "";
};

// Utility function to get display name safely
const getDisplayName = (user) => {
  if (!user) return "Unknown User";

  const username = user.username?.trim();
  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();

  if (username) return username;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;

  return "Unknown User";
};

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("account");
  const [userData, setUserData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch user data and profile on component mount
  useEffect(() => {
    const abortController = new AbortController();

    const fetchUserData = async () => {
      if (!isValidUserId(id)) {
        setError("Invalid user ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user account data
        const userResponse = await adminService.getUserById(id);

        // Validate response before accessing properties
        if (!userResponse || typeof userResponse !== "object") {
          throw new Error("Invalid user data received");
        }

        setUserData(userResponse);

        // Fetch user profile data only for non-admin roles
        if (userResponse.role && userResponse.role !== "admin") {
          const profileResponse = await adminService.getUserProfile(id);
          // Normalize response data to ensure proper structure
          const normalizedProfile = {
            bio: profileResponse?.bio || "",
            expertise: profileResponse?.expertise || "",
            experience_years: profileResponse?.experience_years ?? "",
            rating: profileResponse?.rating ?? "",
            linkedin: profileResponse?.linkedin || "",
            phone: profileResponse?.phone || "",
            distinctions: profileResponse?.distinctions || [],
            // Add student-specific fields
            grade_level: profileResponse?.grade_level || "",
            date_of_birth: profileResponse?.date_of_birth || "",
            // Add parent-specific fields
            address: profileResponse?.address || "",
            children: profileResponse?.children || [],
          };
          setUserProfile(normalizedProfile);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setError(error.message || "Failed to load user data");
          toastManager.error(error.message || "Failed to load user data");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchUserData();
    }

    return () => {
      abortController.abort();
    };
  }, [id]);

  const handleBackToUsers = () => {
    navigate("/admin/users", { state: { skipFetch: true, filters: location.state?.filters } });
  };

  const handleDeleteUser = () => {
    if (!userData) return;
    setConfirmDelete(true);
  };

  const confirmDeleteUser = async () => {
    setConfirmDelete(false);
    try {
      await dispatch(purgeUser(userData.id)).unwrap();
      toastManager.success("User deleted successfully");
      navigate("/admin/users", { state: { skipFetch: true, filters: location.state?.filters } });
    } catch (error) {
      showApiError(error);
    }
  };

  const handleUserUpdate = async (updatedData) => {
    try {
      const updatedUser = await dispatch(updateUser({ userId: id, userData: updatedData })).unwrap();
      setUserData(updatedUser);
      toastManager.success("Account updated successfully");
      return updatedUser;
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      const updatedProfileData = await adminService.updateUserProfile(
        id,
        updatedProfile,
      );
      setUserProfile(updatedProfileData);
      toastManager.success("Profile updated successfully");
      return updatedProfileData;
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-spinner text-blue-500 text-2xl animate-spin"></i>
          </div>
          <p className="text-white text-lg">Loading user details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <p className="text-white text-lg mb-4">{error || "User not found"}</p>
          <button
            onClick={handleBackToUsers}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <UserDetailsHeader
          user={userData}
          onBack={handleBackToUsers}
          onDelete={handleDeleteUser}
        />

        {/* Tab Content */}
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden mt-4">
          <UserDetailsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRole={userData?.role}
          />
          <div className="p-4 md:p-5">
            <div className="space-y-4">
              {activeTab === "account" && (
              <UserAccountTab
                user={userData}
                onUpdate={handleUserUpdate}
                onCancel={handleBackToUsers}
                onSaved={handleBackToUsers}
              />
              )}

              {activeTab === "profile" && userData?.role === "teacher" && (
                <div className="pt-2 border-t border-slate-800">
                  <TeacherProfileTab
                    profile={userProfile}
                    onUpdate={handleProfileUpdate}
                    onCancel={handleBackToUsers}
                    onSaved={handleBackToUsers}
                  />
                </div>
              )}

              {activeTab === "profile" && userData?.role === "student" && (
                <div className="pt-2 border-t border-slate-800">
                  <StudentProfileTab
                    profile={userProfile}
                    userId={userData?.id}
                    onUpdate={handleProfileUpdate}
                    onCancel={handleBackToUsers}
                    onSaved={handleBackToUsers}
                  />
                </div>
              )}

              {activeTab === "profile" && userData?.role === "parent" && (
                <div className="pt-2 border-t border-slate-800">
                  <ParentProfileTab
                    profile={{ ...userProfile, id }}
                    onUpdate={handleProfileUpdate}
                    onCancel={handleBackToUsers}
                    onSaved={handleBackToUsers}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        variant="danger"
        title="Delete User"
        message={`Are you sure you want to delete "${userData ? getDisplayName(userData) : "this user"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default UserDetailsPage;
