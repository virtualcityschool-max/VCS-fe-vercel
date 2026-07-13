import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { aboutService } from "../../services/aboutService";

// WhatsApp number is pulled live from Admin → About Page settings (contact_whatsapp);
// this is only the fallback shown before that loads / if it's unset.
const MANUAL_BANK_DETAILS = {
  bankName: "Easypaisa",
  accountTitle: "Atika Rameen",
  accountNumber: "03099093548",
};
const FALLBACK_WHATSAPP = "WHATSAPP_NUMBER";

// Compact "label: value" row with a copy button — used inside the manual-payment steps.
const CompactCopyRow = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard access can fail (e.g. insecure context) — value is still visible to copy manually.
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-slate-400 truncate">
        {label}: <span className="text-slate-100 font-semibold">{value}</span>
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 text-slate-500 hover:text-white transition-colors"
        title="Copy"
      >
        <i className={`fas ${copied ? "fa-check text-emerald-400" : "fa-copy"} text-xs`} />
      </button>
    </div>
  );
};

// Same "label: value" row as CompactCopyRow, plus a WhatsApp icon that opens the prefilled chat.
const WhatsAppRow = ({ label, value, chatHref }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard access can fail (e.g. insecure context) — value is still visible to copy manually.
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <a
          href={chatHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
          title="Open WhatsApp chat"
        >
          <i className="fab fa-whatsapp text-base" />
        </a>
        <p className="text-sm text-slate-400 truncate">
          {label}: <span className="text-slate-100 font-semibold">{value}</span>
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        
        <button
          type="button"
          onClick={handleCopy}
          className="text-slate-500 hover:text-white transition-colors"
          title="Copy"
        >
          <i className={`fas ${copied ? "fa-check text-emerald-400" : "fa-copy"} text-xs`} />
        </button>
      </div>
    </div>
  );
};

// Checklist line ("✓ requirement: value") with an inline copy icon when a value is given.
const ChecklistRow = ({ text, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard access can fail (e.g. insecure context) — value is still visible to copy manually.
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <i className="fas fa-circle-check text-emerald-400 text-xs shrink-0" />
        <p className="text-slate-300 text-sm truncate">
          {text}
          {value && <span className="text-white font-semibold">: {value}</span>}
        </p>
      </div>
      {value && (
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 text-slate-500 hover:text-white transition-colors"
          title="Copy"
        >
          <i className={`fas ${copied ? "fa-check text-emerald-400" : "fa-copy"} text-xs`} />
        </button>
      )}
    </div>
  );
};

// A full-width, clickable payment-method option (replaces the old Cancel/Confirm button row).
// Pass `tooltip` (with disabled) to explain why the option can't be used — shown on hover.
const PaymentMethodCard = ({
  icon,
  iconBg,
  iconColor,
  title,
  badge,
  badgeColor,
  description,
  onClick,
  disabled,
  loading,
  tooltip,
}) => (
  // Tooltip lives on this wrapper because :hover doesn't fire on a disabled <button>.
  <div className="relative group/pm">
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {loading ? (
          <i className="fas fa-spinner fa-spin text-white text-sm" />
        ) : (
          <i className={`fas ${icon} ${iconColor}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-white text-sm font-bold">{title}</p>
          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <p className="text-slate-400 text-xs">
          {loading ? "Redirecting..." : description}
        </p>
      </div>
      <i className="fas fa-chevron-right text-slate-600 group-hover:text-slate-400 text-xs transition-colors shrink-0" />
    </button>
    {tooltip && (
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-[11px] font-semibold text-slate-200 whitespace-nowrap shadow-xl opacity-0 group-hover/pm:opacity-100 transition-opacity pointer-events-none z-10">
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    )}
  </div>
);

const EnrollmentTypeModal = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  isPaid = false,
  isLoading = false,
}) => {
  const [view, setView] = useState("choose");
  const [whatsappNumber, setWhatsappNumber] = useState(null);
  const studentEmail = useSelector((state) => state.auth?.user?.email) || "";

  // Always land back on the method-choice view when the modal is reopened.
  useEffect(() => {
    if (isOpen) setView("choose");
  }, [isOpen]);

  // Pull the WhatsApp number admins already configure in About Page settings.
  useEffect(() => {
    if (!isOpen || !isPaid) return;
    let cancelled = false;
    aboutService
      .get()
      .then((data) => {
        if (!cancelled && data?.contact_whatsapp) setWhatsappNumber(data.contact_whatsapp);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen, isPaid]);

  if (!isOpen) return null;

  const price = course?.price ? `$${Number(course.price).toLocaleString("en-US")} USD` : null;
  const title = course?.title || "this course";
  // Online (Gumroad) checkout only works when the course has a product link configured.
  const gumroadAvailable = Boolean((course?.gumroad_product_permalink || "").trim());
  const effectiveWhatsapp = whatsappNumber || FALLBACK_WHATSAPP;
  const whatsappMessage = `Hi! I've completed my Easypaisa transfer for "${title}"${price ? ` (${price})` : ""}.\nMy student email: ${studentEmail || "<your student email>"}\n(Attaching my payment screenshot)`;
  const whatsappHref = `https://wa.me/${effectiveWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

  if (isPaid) {
    if (view === "manual") {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
            >
              <i className="fas fa-times text-lg" />
            </button>

            <div className="p-7 sm:p-9">
              <button
                onClick={() => setView("choose")}
                className="flex items-center gap-1.5 text-slate-500 hover:text-white text-xs font-semibold mb-4 transition-colors"
              >
                <i className="fas fa-arrow-left text-[10px]" /> Back
              </button>

              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3 border border-amber-500/20">
                  <i className="fas fa-wallet text-amber-400" />
                </div>
                <h2 className="text-xl font-black font-poppins text-white mb-1">
                  Easypaisa — Manual Payment
                </h2>
                <p className="text-slate-400 text-sm">
                  Enroll in <span className="text-white font-semibold">{title}</span>
                  {price ? ` (${price})` : ""} by following these steps.
                </p>
              </div>

              <div className="flex items-start gap-2 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                <i className="fas fa-circle-info text-amber-400 text-sm mt-0.5 shrink-0" />
                <p className="text-amber-200/90 text-sm leading-relaxed">
                  Your <span className="font-bold">payment screenshot</span> and{" "}
                  <span className="font-bold">student email</span> are both required —
                  our admin team uses them to verify your payment and enroll you.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-white/5 rounded-2xl divide-y divide-white/5 mb-5">
                {/* Step 1 */}
                <div className="p-4">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="text-white text-sm font-bold">Transfer to our Easypaisa account</p>
                  </div>
                  <div className="pl-8 space-y-2">
                    <CompactCopyRow label="Service" value={MANUAL_BANK_DETAILS.bankName} />
                    <CompactCopyRow label="Account Title" value={MANUAL_BANK_DETAILS.accountTitle} />
                    <CompactCopyRow label="Account #" value={MANUAL_BANK_DETAILS.accountNumber} />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p className="text-white text-sm font-bold">Screenshot the successful transfer</p>
                </div>

                {/* Step 3 */}
                <div className="p-4">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="text-white text-sm font-bold">Send us the following on WhatsApp</p>
                  </div>
                  <div className="pl-8 space-y-2 mb-3">
                    <ChecklistRow text="Your payment screenshot" />
                    <ChecklistRow text="Student email" value={studentEmail} />
                  </div>
                  <div className="pl-8">
                    <WhatsAppRow label="WhatsApp Us" value={effectiveWhatsapp} chatHref={whatsappHref} />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center shrink-0">
                    4
                  </span>
                  <p className="text-white text-sm font-bold">We will verify your payment and enroll you within 24 hours</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-check text-xs" /> Got It
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
          >
            <i className="fas fa-times text-lg" />
          </button>

          <div className="p-7 sm:p-9">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-500/15 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-indigo-500/20">
                <i className="fas fa-credit-card text-indigo-400" />
              </div>
              <h2 className="text-xl font-black font-poppins text-white mb-1">Choose Payment Method</h2>
              <p className="text-slate-400 text-sm">Select how you'd like to pay for this course.</p>
            </div>

            <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-6 text-center">
              {price && <p className="text-white font-black text-2xl mb-1">{price}</p>}
              <p className="text-indigo-400 text-sm font-semibold truncate">{title}</p>
            </div>

            <div className="space-y-3">
              <PaymentMethodCard
                icon="fa-bolt"
                iconBg="bg-indigo-500/20"
                iconColor="text-indigo-400"
                title="Gumroad"
                badge="Live Payment"
                badgeColor="bg-indigo-500/20 text-indigo-300"
                description={
                  gumroadAvailable
                    ? "Pay online now — you're enrolled automatically once payment completes."
                    : "Online payment is not available for this course right now."
                }
                onClick={gumroadAvailable ? onConfirm : undefined}
                disabled={isLoading || !gumroadAvailable}
                loading={isLoading}
                tooltip={!gumroadAvailable ? "Not available at this time" : undefined}
              />
              <PaymentMethodCard
                icon="fa-wallet"
                iconBg="bg-amber-500/20"
                iconColor="text-amber-400"
                title="Easypaisa"
                badge="Manual"
                badgeColor="bg-amber-500/20 text-amber-300"
                description="Pay via Easypaisa transfer — our team verifies and enrolls you manually."
                onClick={() => setView("manual")}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
        >
          <i className="fas fa-times text-lg" />
        </button>

        <div className="p-7 sm:p-9">
          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-500/20">
              <i className="fas fa-graduation-cap text-emerald-400" />
            </div>
            <h2 className="text-xl font-black font-poppins text-white mb-1">Confirm Enrollment</h2>
            <p className="text-slate-400 text-sm">
              Are you sure you want to enroll in this course?
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 border border-white/5 rounded-2xl mb-6 text-center">
            <p className="text-white font-bold text-base">{title}</p>
            <p className="text-emerald-400 text-xs font-semibold mt-1 uppercase tracking-widest">Free</p>
            <p className="text-slate-500 text-xs mt-2">
              Your request will be reviewed by an admin.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin text-xs" /> Enrolling...</>
              ) : (
                <><i className="fas fa-check text-xs" /> Yes, Enroll</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentTypeModal;
