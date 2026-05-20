import { useParams, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState, useCallback } from "react";
import { fetchTeacherById } from "../../store/slices/teacherSlice";
import { setAuthModal } from "../../store/slices/uiSlice";
import BreadcrumbNavigation from "../../components/ui/BreadcrumbNavigation";
import BackButton from "../../components/ui/BackButton";
import { availabilityService } from "../../services/availabilityService";
import { toastManager } from "../../utils/toastManager";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";

const HIRE_INTENT_KEY = "vcs_hire_intent";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// ── Booking modal (2-step) ────────────────────────────────────────────────────
const BookingModal = ({ teacherName, slots, onClose, onBooked }) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState(false);

  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const selectedSlot = selected ? slots.find((s) => s.id === selected) : null;

  const handleConfirm = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      await availabilityService.bookSlot(selected, note.trim());
      toastManager.success("Slot booked! Confirmation emails have been sent.");
      onBooked();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to book slot. It may have just been taken.";
      toastManager.error(msg);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition shrink-0"
              >
                <i className="fas fa-arrow-left text-xs" />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-white">
                {step === 1 ? "Book a Tutoring Slot" : "Add a Message"}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {step === 1
                  ? `with ${teacherName}`
                  : "Optional — sent to the teacher with your booking"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Step indicator */}
            <div className="flex items-center gap-1">
              <div className={`h-1 w-6 rounded-full transition-all ${step >= 1 ? "bg-indigo-500" : "bg-slate-700"}`} />
              <div className={`h-1 w-6 rounded-full transition-all ${step >= 2 ? "bg-indigo-500" : "bg-slate-700"}`} />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <i className="fas fa-times text-sm" />
            </button>
          </div>
        </div>

        {/* Step 1 — slot selection */}
        {step === 1 && (
          <>
            <div className="max-h-[55vh] overflow-y-auto px-6 py-5 space-y-5">
              {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No available slots at the moment. Check back later.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(grouped)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, daySlots]) => (
                      <div key={date}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                          {fmtDate(date)}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelected(slot.id)}
                              className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-bold transition ${
                                selected === slot.id
                                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                  : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-indigo-500/40 hover:text-white"
                              }`}
                            >
                              {fmt12(slot.start_time)}
                              <span className="text-[10px] font-normal opacity-70 block">
                                – {fmt12(slot.end_time)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => selected && setStep(2)}
                disabled={!selected}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                Next <i className="fas fa-arrow-right text-xs" />
              </button>
            </div>
          </>
        )}

        {/* Step 2 — message */}
        {step === 2 && (
          <>
            <div className="px-6 py-5 space-y-5">
              {/* Selected slot summary */}
              {selectedSlot && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <i className="fas fa-calendar-check text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {fmt12(selectedSlot.start_time)} – {fmt12(selectedSlot.end_time)}
                    </p>
                    <p className="text-xs text-indigo-300 mt-0.5">
                      {fmtDate(selectedSlot.date)}
                    </p>
                  </div>
                  <p className="ml-auto text-xs text-indigo-400 font-bold shrink-0">
                    1 hr session
                  </p>
                </div>
              )}

              {/* Note textarea */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                  Message to teacher{" "}
                  <span className="text-slate-700 font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tell the teacher what you'd like to work on, your current level, or any questions…"
                  rows={4}
                  maxLength={500}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none resize-none transition"
                />
                <p className="text-[10px] text-slate-700 text-right mt-1">
                  {note.length}/500
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={booking}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                {booking ? (
                  <>
                    <i className="fas fa-spinner fa-spin" /> Booking…
                  </>
                ) : (
                  <>
                    <i className="fas fa-check" /> Confirm Booking
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const TeacherProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const abortControllerRef = useRef(null);

  const { teacherDetails, loading, error } = useSelector((state) => state.teachers);
  const { isLoggedIn, role } = useSelector((state) => state.auth);

  const [showBookModal, setShowBookModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  // Signals that we should open the booking modal once slots finish loading
  const [openModalOnLoad, setOpenModalOnLoad] = useState(false);
  const intentHandled = useRef(false);

  const loadSlots = useCallback(async () => {
    if (!id) return;
    setLoadingSlots(true);
    try {
      const data = await availabilityService.getTeacherAvailableSlots(id);
      setAvailableSlots(data.slots || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
      setSlotsLoaded(true);
    }
  }, [id]);

  const handleHireClick = () => {
    if (!isLoggedIn) {
      sessionStorage.setItem(HIRE_INTENT_KEY, String(id));
      setShowAuthModal(true);
      return;
    }
    if (role !== "student") {
      toastManager.info("Only students can book tutoring slots.");
      return;
    }
    if (!slotsLoaded) {
      loadSlots().then(() => setShowBookModal(true));
    } else {
      setShowBookModal(true);
    }
  };

  // Load slots automatically once the student is logged in
  useEffect(() => {
    if (isLoggedIn && role === "student" && id && !slotsLoaded) {
      loadSlots();
    }
  }, [isLoggedIn, role, id, slotsLoaded, loadSlots]);

  // Detect post-login hire intent stored before the login redirect
  useEffect(() => {
    if (!isLoggedIn || role !== "student" || !id || intentHandled.current) return;
    const intentId = sessionStorage.getItem(HIRE_INTENT_KEY);
    if (intentId !== String(id)) return;
    sessionStorage.removeItem(HIRE_INTENT_KEY);
    intentHandled.current = true;
    setOpenModalOnLoad(true);
  }, [isLoggedIn, role, id]);

  // Auto-open booking modal when navigated from TeachersDirectory with openSlots flag
  useEffect(() => {
    if (!isLoggedIn || role !== "student" || !location.state?.openSlots || intentHandled.current) return;
    intentHandled.current = true;
    setOpenModalOnLoad(true);
  }, [isLoggedIn, role, location.state?.openSlots]);

  // Open modal once slots are ready (used by the post-login intent path)
  useEffect(() => {
    if (openModalOnLoad && slotsLoaded && !loadingSlots) {
      setOpenModalOnLoad(false);
      setShowBookModal(true);
    }
  }, [openModalOnLoad, slotsLoaded, loadingSlots]);

  useEffect(() => {
    if (!id) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    dispatch(fetchTeacherById(id));
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, [id, dispatch]);

  if (loading && !teacherDetails) {
    return (
      <section className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-20 space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-800 shrink-0 mx-auto lg:mx-0" />

              <div className="flex-1 space-y-4">
                <div className="h-8 w-56 bg-slate-800 rounded-xl mx-auto lg:mx-0" />
                <div className="h-4 w-40 bg-slate-800 rounded-lg mx-auto lg:mx-0" />
                <div className="h-4 w-full max-w-2xl bg-slate-800 rounded-lg mx-auto lg:mx-0" />

                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                  <div className="h-9 w-36 bg-slate-800 rounded-xl" />
                  <div className="h-9 w-32 bg-slate-800 rounded-xl" />
                  <div className="h-9 w-28 bg-slate-800 rounded-xl" />
                  <div className="h-9 w-24 bg-slate-800 rounded-xl" />
                </div>
              </div>

              <div className="w-full lg:w-72 space-y-3">
                <div className="h-14 bg-slate-800 rounded-2xl" />
                <div className="h-14 bg-slate-800 rounded-2xl" />
                <div className="h-14 bg-slate-800 rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Top Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="h-7 w-48 bg-slate-800 rounded-xl" />
              <div className="space-y-3">
                <div className="h-4 w-24 bg-slate-800 rounded-lg" />
                <div className="h-4 w-full bg-slate-800 rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-800 rounded-lg" />
                <div className="h-4 w-4/6 bg-slate-800 rounded-lg" />
              </div>

              <div className="space-y-3 pt-2">
                <div className="h-4 w-24 bg-slate-800 rounded-lg" />
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 w-24 bg-slate-800 rounded-full" />
                  <div className="h-8 w-28 bg-slate-800 rounded-full" />
                  <div className="h-8 w-20 bg-slate-800 rounded-full" />
                </div>
              </div>

              <div className="h-32 bg-slate-800 rounded-3xl" />
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-28 bg-slate-900 border border-slate-800 rounded-3xl" />
                <div className="h-28 bg-slate-900 border border-slate-800 rounded-3xl" />
              </div>
              <div className="h-80 bg-slate-900 border border-slate-800 rounded-3xl" />
            </div>
          </div>

          {/* Bottom Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-slate-900 border border-slate-800 rounded-3xl" />
            <div className="h-80 bg-slate-900 border border-slate-800 rounded-3xl" />
          </div>

          <div className="h-96 bg-slate-900 border border-slate-800 rounded-3xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to load teacher</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <BackButton
            to="/teachers"
            label="Back to Teachers"
            className="w-full"
          />
        </div>
      </section>
    );
  }

  if (!teacherDetails) {
    return (
      <section className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-500/10 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-user"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2">Teacher not found</h2>
          <p className="text-slate-400 text-sm mb-6">
            The requested teacher profile could not be loaded.
          </p>
          <BackButton
            to="/teachers"
            label="Back to Teachers"
            className="w-full"
          />
        </div>
      </section>
    );
  }

  const expertiseList =
    teacherDetails?.expertise && typeof teacherDetails.expertise === "string"
      ? teacherDetails.expertise
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const ratingValue = Number(teacherDetails.rating || 0);
  const totalStudents = teacherDetails.total_students ?? 0;
  const totalReviews = teacherDetails.rating_breakdown?.total_reviews ?? 0;
  const activeCourses = teacherDetails.active_courses_count ?? 0;

  const isValidLinkedInUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.hostname === "linkedin.com" ||
        parsedUrl.hostname === "www.linkedin.com" ||
        parsedUrl.hostname.endsWith(".linkedin.com")
      );
    } catch {
      return false;
    }
  };

  return (
    <section
      id="teacher-profile-view"
      className="min-h-screen bg-slate-950 text-white"
    >
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <BreadcrumbNavigation
          items={[
            { label: "Home", to: "/", icon: "fas fa-home" },
            { label: "Teachers", to: "/teachers" },
            {
              label: (
                teacherDetails.teacher_name || "Unnamed Teacher"
              ).substring(0, 25),
            },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-6 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none bg-indigo-500/[0.03]" />
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-center">
            {/* Avatar */}
            <div className="shrink-0 mx-auto lg:mx-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-xl border border-indigo-400/20">
                {teacherDetails.teacher_name?.[0]?.toUpperCase() || "T"}
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  {teacherDetails.teacher_name || "Unnamed Teacher"}
                </h1>

                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                  <i className="fas fa-check-circle"></i>
                  Verified Teacher
                </span>
              </div>

              <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 mb-5">
                {teacherDetails.bio || "No teacher bio available."}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300">
                  {teacherDetails.experience_years ?? 0} years experience
                </span>

                <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300">
                  {activeCourses} active course{activeCourses === 1 ? "" : "s"}
                </span>

                <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300">
                  {totalStudents} student{totalStudents === 1 ? "" : "s"}
                </span>

                {expertiseList.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="w-full lg:w-72 flex flex-col gap-3">
              {/* Book a Slot */}
              <button
                onClick={handleHireClick}
                disabled={loadingSlots}
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 px-6 py-4 text-center text-sm font-bold text-white transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3"
              >
                {loadingSlots ? (
                  <><i className="fas fa-spinner fa-spin" /> Loading slots…</>
                ) : isLoggedIn && role === "student" ? (
                  <>
                    <i className="fas fa-calendar-check" />
                    Book a Tutoring Slot
                    {slotsLoaded && availableSlots.length > 0 && (
                      <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {availableSlots.length}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-graduate" />
                    Hire as Tutor
                  </>
                )}
              </button>

              {teacherDetails.linkedin && isValidLinkedInUrl(teacherDetails.linkedin) ? (
                <a
                  href={teacherDetails.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:border-slate-700 hover:text-white"
                >
                  View LinkedIn
                </a>
              ) : null}

              {/* Slot availability summary for students */}
              {isLoggedIn && role === "student" && slotsLoaded && (
                <div className={`rounded-xl border px-4 py-3 text-xs font-semibold text-center ${
                  availableSlots.length > 0
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    : "border-slate-700 bg-slate-900/40 text-slate-500"
                }`}>
                  {availableSlots.length > 0
                    ? `${availableSlots.length} slot${availableSlots.length > 1 ? "s" : ""} available`
                    : "No slots available right now"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About / Bio / Expertise */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl h-full">
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <i className="fas fa-user-tie text-indigo-400"></i>
                Teacher Profile
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">
                    About
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {teacherDetails.bio || "No bio available for this teacher."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {expertiseList.length ? (
                      expertiseList.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">Not specified</p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-indigo-500/10 bg-indigo-500/[0.04] p-6">
                  <p className="text-slate-300 leading-relaxed italic">
                    “Dedicated to helping learners gain practical mastery
                    through structured teaching, clarity, and real-world
                    guidance.”
                  </p>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300">
                    Teaching Philosophy
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats + Distinctions */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
                <p className="text-3xl font-semibold text-white mb-2">
                  {totalStudents}
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">
                  Learners
                </p>
              </div>

              {/* <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
                <p className="text-3xl font-semibold text-yellow-400 mb-2 flex items-center justify-center gap-2">
                  {ratingValue.toFixed(1)}
                  <i className="fas fa-star text-sm"></i>
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">
                  Global Rating
                </p>
              </div> */}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 mb-6">
                Distinctions
              </h3>

              {teacherDetails.distinctions?.length ? (
                <ul className="space-y-5">
                  {teacherDetails.distinctions.map((cert, idx) => (
                    <li
                      key={`${cert.title}-${idx}`}
                      className="flex items-start gap-4"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <i className="fas fa-award"></i>
                      </div>

                      <div>
                        <p className="font-semibold text-slate-200 text-sm">
                          {cert.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-[0.18em]">
                          {cert.org}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">No distinctions listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Courses + Rating Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl h-full">
              <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  <i className="fas fa-book-open text-indigo-400"></i>
                  Courses
                </h2>

                <span className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">
                  {teacherDetails.courses?.length || 0} total
                </span>
              </div>

              {teacherDetails.courses?.length ? (
                <div className="space-y-4">
                  {teacherDetails.courses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className="block rounded-2xl border border-slate-800 bg-slate-950/70 p-5 transition hover:bg-slate-800 cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {course.course_name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {course.enrolled_students} enrolled student
                            {course.enrolled_students === 1 ? "" : "s"} • Rating{" "}
                            {Number(course.rating || 0).toFixed(1)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] border ${
                            course.status === "published"
                              ? "border-green-500/20 bg-green-500/10 text-green-300"
                              : "border-slate-700 bg-slate-800 text-slate-400"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No courses available</p>
              )}
            </div>
          </div>

          {/* Rating breakdown */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 mb-6">
                Rating Breakdown
              </h3>

              <div className="mb-6">
                <p className="text-4xl font-semibold text-white">
                  {ratingValue.toFixed(1)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Based on {totalReviews} review{totalReviews === 1 ? "" : "s"}
                </p>
              </div>

              <div className="space-y-3">
                {teacherDetails.rating_breakdown?.stars?.length ? (
                  teacherDetails.rating_breakdown.stars.map((item) => (
                    <div key={item.star} className="flex items-center gap-3">
                      <span className="w-10 text-xs text-slate-400">
                        {item.star}★
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-slate-500">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No ratings yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <i className="fas fa-comment-dots text-indigo-400"></i>
              Recent Reviews
            </h2>

            <span className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">
              {teacherDetails.recent_reviews?.length || 0} shown
            </span>
          </div>

          {teacherDetails.recent_reviews?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teacherDetails.recent_reviews.map((review, idx) => (
                <div
                  key={`${review.student_name}-${idx}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-semibold text-white">
                      {review.student_name}
                    </p>
                    <span className="text-yellow-400 text-sm font-medium">
                      ★ {review.rating}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    {review.comment}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>{review.course_title}</p>
                    <p>
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : "Date not available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No reviews available yet</p>
          )}
        </div>

        {/* Available Slots Preview (students who are logged in) */}
        {isLoggedIn && role === "student" && slotsLoaded && availableSlots.length > 0 && (
          <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl p-8 sm:p-10 sm:mb-20 shadow-xl">
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <i className="fas fa-calendar-check text-indigo-400"></i>
                Available Tutoring Slots
              </h2>
              <span className="text-xs uppercase tracking-[0.18em] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                {availableSlots.length} open
              </span>
            </div>

            {/* Group by date */}
            {Object.entries(
              availableSlots.reduce((acc, s) => {
                if (!acc[s.date]) acc[s.date] = [];
                acc[s.date].push(s);
                return acc;
              }, {})
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(0, 5)
              .map(([date, daySlots]) => (
                <div key={date} className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                    {fmtDate(date)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={handleHireClick}
                        className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition"
                      >
                        {fmt12(slot.start_time)} – {fmt12(slot.end_time)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            <button
              onClick={handleHireClick}
              className="w-full mt-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20"
            >
              <i className="fas fa-calendar-plus" />
              Select & Book a Slot
            </button>
          </div>
        )}

        {/* CTA for non-logged-in or non-student users */}
        {(!isLoggedIn || role !== "student") && (
          <div className="bg-gradient-to-br from-indigo-600/10 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 sm:p-10 sm:mb-20 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-calendar-check text-indigo-400 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-semibold mb-3">Book a 1-on-1 Tutoring Session</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              {teacherDetails.teacher_name} offers private tutoring sessions. Log in as a student to view available time slots and book instantly.
            </p>
            <button
              onClick={handleHireClick}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition shadow-lg shadow-indigo-500/20"
            >
              <i className="fas fa-user-graduate" />
              {isLoggedIn ? "View Available Slots" : "Login to Book a Slot"}
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookModal && (
        <BookingModal
          teacherName={teacherDetails.teacher_name || "Teacher"}
          slots={availableSlots}
          onClose={() => setShowBookModal(false)}
          onBooked={() => {
            setSlotsLoaded(false);
            loadSlots();
          }}
        />
      )}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login Required"
        message="Please log in or create a student account to book a 1-on-1 tutoring session."
      />
    </section>
  );
};

export default TeacherProfile;
