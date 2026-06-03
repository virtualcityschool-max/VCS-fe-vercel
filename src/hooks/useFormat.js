// Utility hooks for formatting data

// Format date with various options
export const useDateFormat = () => {
  const formatDate = (date, options = {}) => {
    if (!date) return "N/A";

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    try {
      return new Intl.DateTimeFormat("en-US", defaultOptions).format(
        new Date(date),
      );
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  const formatTime = (date, options = {}) => {
    if (!date) return "N/A";

    const defaultOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    };

    try {
      return new Intl.DateTimeFormat("en-US", defaultOptions).format(
        new Date(date),
      );
    } catch (error) {
      console.error("Time formatting error:", error);
      return "Invalid Time";
    }
  };

  const formatDateTime = (date, options = {}) => {
    if (!date) return "N/A";

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    };

    try {
      return new Intl.DateTimeFormat("en-US", defaultOptions).format(
        new Date(date),
      );
    } catch (error) {
      console.error("DateTime formatting error:", error);
      return "Invalid Date";
    }
  };

  const formatRelativeTime = (date) => {
    if (!date) return "N/A";

    try {
      const now = new Date();
      const targetDate = new Date(date);
      const diffMs = now - targetDate;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 7) {
        return formatDate(date);
      } else if (diffDays > 1) {
        return `${diffDays} days ago`;
      } else if (diffDays === 1) {
        return "1 day ago";
      } else if (diffHours > 1) {
        return `${diffHours} hours ago`;
      } else if (diffHours === 1) {
        return "1 hour ago";
      } else if (diffMinutes > 1) {
        return `${diffMinutes} minutes ago`;
      } else if (diffMinutes === 1) {
        return "1 minute ago";
      } else {
        return "Just now";
      }
    } catch (error) {
      console.error("Relative time formatting error:", error);
      return "Invalid Date";
    }
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
  };
};

// Format numbers with various options
export const useNumberFormat = () => {
  const formatCurrency = (amount, currency = "USD", options = {}) => {
    if (amount === null || amount === undefined) return "N/A";

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        ...options,
      }).format(amount);
    } catch (error) {
      console.error("Currency formatting error:", error);
      return "$0.00";
    }
  };

  const formatNumber = (number, options = {}) => {
    if (number === null || number === undefined) return "N/A";

    try {
      return new Intl.NumberFormat("en-US", options).format(number);
    } catch (error) {
      console.error("Number formatting error:", error);
      return "0";
    }
  };

  const formatPercentage = (value, options = {}) => {
    if (value === null || value === undefined) return "N/A";

    try {
      return new Intl.NumberFormat("en-US", {
        style: "percent",
        ...options,
      }).format(value);
    } catch (error) {
      console.error("Percentage formatting error:", error);
      return "0%";
    }
  };

  return {
    formatCurrency,
    formatNumber,
    formatPercentage,
  };
};

// Format text and strings
export const useTextFormat = () => {
  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const truncate = (str, maxLength, suffix = "...") => {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  };

  const slugify = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const initials = (name, maxLength = 2) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, maxLength)
      .join("");
  };

  return {
    capitalize,
    truncate,
    slugify,
    initials,
  };
};
