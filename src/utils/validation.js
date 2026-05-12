// Password validation utilities
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true, error: null };
};

// Phone validation — accepts any international number (7–15 digits, optional + prefix and separators)
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, error: null }; // optional field
  const trimmed = phone.trim();
  // Strip allowed formatting characters, keeping the optional leading +
  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/[\s\-().+]/g, "");
  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, error: "Phone number may only contain digits, spaces, dashes, or parentheses" };
  }
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return { isValid: false, error: "Phone number must be between 7 and 15 digits" };
  }
  // If a + was present the first digit group is the country code (1–3 digits, must not start with 0)
  if (hasPlus && /^0/.test(digitsOnly)) {
    return { isValid: false, error: "Country code cannot start with 0" };
  }
  return { isValid: true, error: null };
};

// Username validation
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, error: "Username is required" };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      error: "Username must be at least 3 characters long",
    };
  }

  if (username.length > 150) {
    return { isValid: false, error: "Username must be 150 characters or less" };
  }

  // Allow letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error:
        "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }

  return { isValid: true, error: null };
};

// Role validation
export const validateRole = (role) => {
  const validRoles = ["student", "teacher", "parent", "admin"];

  if (!role) {
    return { isValid: false, error: "Please select a role" };
  }

  if (!validRoles.includes(role)) {
    return { isValid: false, error: "Please select a valid role" };
  }

  return { isValid: true, error: null };
};

// Form validation helper
export const validateRegistrationForm = (formData) => {
  const { email, username, password, confirmPassword, role } = formData;
  const errors = {};

  // Email validation
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  // Username validation
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error;
  }

  // Password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0]; // Show first error
  }

  // Confirm password validation
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Role validation
  const roleValidation = validateRole(role);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatLocalISO = (date) => {
    const offset = -date.getTimezoneOffset();
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
    const mins = (absOffset % 60).toString().padStart(2, '0');
    const sign = offset >= 0 ? '+' : '-';
    
    // Manually build the string so it doesn't convert to UTC
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hh}:${mm}:${ss}${sign}${hours}:${mins}`;
}
