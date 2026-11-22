// The school's WhatsApp Business number, digits only (no +, no spaces), for wa.me links.
// Pages that load the admin-set number use useWhatsappNumber(); this is the same number.
export const VCS_WHATSAPP = "966556687417";

// https://wa.me/966556687417?text=<message>, the message URL-encoded and pre-filled in WhatsApp.
export const waLink = (text, number = VCS_WHATSAPP) =>
  `https://wa.me/${String(number).replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const WA_GENERAL = "Hi, I'm interested in classes at Virtual City School.";
