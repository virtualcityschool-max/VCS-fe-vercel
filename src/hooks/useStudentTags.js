import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/adminService";

/**
 * Loads the admin's student labels once and exposes a refresh for after a
 * label is created, renamed or deleted.
 */
export const useStudentTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  // Distinguishes "no labels exist" from "not fetched yet", which callers need
  // before acting on an empty list.
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getStudentTags();
      setTags(Array.isArray(data) ? data : data?.results || []);
      setLoaded(true);
    } catch {
      // A failed label fetch shouldn't block the users list; the picker just
      // opens empty and the admin can retry by reopening it.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tags, loading, loaded, refresh };
};

export default useStudentTags;
