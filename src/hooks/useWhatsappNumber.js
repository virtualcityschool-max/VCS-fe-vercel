import { useEffect, useState } from "react";
import { aboutService } from "../services/aboutService";

// Real number as the default while the admin-configured value loads (or if
// About Page settings are unreachable) - this feeds directly into a wa.me
// href, so a placeholder string here would produce a dead link.
const FALLBACK_WHATSAPP = "966556687417";

/**
 * The WhatsApp number admins configure in Admin -> About Page settings
 * (contact_whatsapp), digits-only and ready to drop into a
 * `https://wa.me/${number}` link. Falls back to the school's real number
 * until that setting loads.
 */
// One request per page load, shared by every component that needs the number
// (the course catalogue renders ~100 cards; each used to ask the server).
let numberPromise = null;
const loadNumber = () => {
  if (!numberPromise) {
    numberPromise = aboutService
      .get()
      .then((data) => (data?.contact_whatsapp ? data.contact_whatsapp.replace(/\D/g, "") : null))
      .catch(() => {
        numberPromise = null; // try again next time
        return null;
      });
  }
  return numberPromise;
};

export const useWhatsappNumber = () => {
  const [number, setNumber] = useState(FALLBACK_WHATSAPP);

  useEffect(() => {
    let cancelled = false;
    loadNumber().then((n) => {
      if (!cancelled && n) setNumber(n);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return number;
};

export default useWhatsappNumber;
