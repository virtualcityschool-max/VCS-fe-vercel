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
import { getStorageUrl } from "../../utils/storageUrl";
import GmailNotice from "../../components/common/GmailNotice";
import { useSeo } from "../../hooks/useSeo";
import { useActiveSection, useFollowingBox } from "../../hooks/useFollowingBox";
import { catalogGuideFor } from "../../data/subjectGuides/catalog";
import { sizedImage, fallbackToOriginal } from "../../utils/imageCdn";
import { useWhatsappNumber } from "../../hooks/useWhatsappNumber";

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
                {step === 1 ? "Book a Session" : "Add a Message"}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {step === 1
                  ? `with ${teacherName}`
                  : "Optional - sent to the teacher with your booking"}
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

        {/* Step 1 - slot selection */}
        {step === 1 && (
          <>
            <div className="max-h-[55vh] overflow-y-auto px-6 py-5 space-y-5">
              {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No available slots at the moment. Check back later.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {Object.entries(grouped)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, daySlots]) => (
                      <div key={date}>
                        <p className="text-sm font-black uppercase tracking-widest text-slate-300 mb-3 text-center">
                          {fmtDate(date)}
                        </p>
                        <div className="grid grid-cols-4 gap-2">
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
                              <span className="text-xs font-normal opacity-70 block">
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

        {/* Step 2 - message */}
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
                    <p className="text-sm text-indigo-300 mt-0.5">
                      {fmtDate(selectedSlot.date)}
                    </p>
                  </div>
                  <p className="ml-auto text-sm text-indigo-400 font-bold shrink-0">
                    1 hr session
                  </p>
                </div>
              )}

              {/* Gmail notice */}
              <GmailNotice />

              {/* Note textarea */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">
                  Message to Tutor{" "}
                  <span className="text-slate-700 font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tell the Tutor what you'd like to work on, your current level, or any questions…"
                  rows={4}
                  maxLength={500}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none resize-none transition"
                />
                <p className="text-sm text-slate-700 text-right mt-1">
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
  const { isLoggedIn, role, isInitialized } = useSelector((state) => state.auth);

  const [showBookModal, setShowBookModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  // Signals that we should open the booking modal once slots finish loading
  const [openModalOnLoad, setOpenModalOnLoad] = useState(false);
  const intentHandled = useRef(false);
  const whatsappNumber = useWhatsappNumber();

  // Side menu that follows the page and highlights the section being read.
  const [active, setActive] = useState("tutor-about");
  const menuSlotRef = useRef(null);
  const menuBoxRef = useRef(null);
  const gridRef = useRef(null);
  useFollowingBox(menuSlotRef, menuBoxRef, gridRef, `${teacherDetails?.id}`);
  useActiveSection("#tutor-content section[id]", `${teacherDetails?.id}`, setActive);

  const loadSlots = useCallback(async () => {
    if (!id) return;
    setLoadingSlots(true);
    try {
      const data = await availabilityService.getTeacherAvailableSlots(id);
      setAvailableSlots((data.slots || []).filter(s => s.status === "available"));
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

  // Load slots only after auth is initialized so the profile timezone is in the store
  useEffect(() => {
    if (isInitialized && isLoggedIn && role === "student" && id && !slotsLoaded) {
      loadSlots();
    }
  }, [isInitialized, isLoggedIn, role, id, slotsLoaded, loadSlots]);

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

  // What this tutor teaches: the profile's own lists, else worked out from
  // their published courses (subject guides give the subject; categories the level).
  const teach = (() => {
    const t = teacherDetails || {};
    const courses = (t.courses || []).filter((c) => c.status !== "draft");
    const guides = courses.map((c) => catalogGuideFor({ title: c.course_name, subject_code: c.subject_code, details: c.details })).filter(Boolean);
    const uniq = (xs) => [...new Set(xs.map((x) => String(x).trim()).filter(Boolean))];
    const expertise = typeof t.expertise === "string" ? t.expertise.split(",") : [];
    const subjects = uniq(t.subjects?.length ? t.subjects.filter((x) => x !== "Others") : [...guides.map((g) => g.subject), ...expertise]);
    const levels = uniq(t.class_levels?.length ? t.class_levels : courses.map((c) => c.level));
    const guideLinks = [...new Map(guides.map((g) => [g.slug, g])).values()];
    return { courses, subjects, levels, guideLinks };
  })();

  useSeo({
      title: teacherDetails
        ? `${teacherDetails.teacher_name || "Tutor"}${teach.subjects.length ? ` — ${teach.subjects.slice(0, 3).join(", ")} Tutor` : " — Cambridge Tutor"} | Virtual City School`
        : undefined,
      description: teacherDetails
            ? [
                `Live online ${teach.subjects.length ? teach.subjects.slice(0, 3).join(", ") + " " : ""}classes with ${teacherDetails.teacher_name || "this tutor"} at Virtual City School${teach.levels.length ? ` (${teach.levels.slice(0, 3).join(", ")})` : ""}.`,
                teacherDetails.experience_years ? `${teacherDetails.experience_years} years' experience.` : null,
                teacherDetails.qualification ? `${teacherDetails.qualification}.` : null,
                "For students across the Gulf, Pakistan and beyond.",
              ].filter(Boolean).join(" ")
            : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
  });
  
  if (loading && !teacherDetails) {
    return (
      <section className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8 animate-pulse">
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
          <h2 className="text-xl font-semibold mb-2">This tutor's profile isn't available</h2>
          {/* `error` can be an object from the API; never render it directly. */}
          <p className="text-slate-300 text-base mb-6">
            The tutor may no longer be teaching with us. Browse our current tutors instead.
          </p>
          <BackButton
            to="/teachers"
            label="Back to Tutors"
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
          <h2 className="text-xl font-semibold mb-2">Tutor not found</h2>
          <p className="text-slate-400 text-sm mb-6">
            The requested teacher profile could not be loaded.
          </p>
          <BackButton
            to="/teachers"
            label="Back to Tutors"
            className="w-full"
          />
        </div>
      </section>
    );
  }

  const name = teacherDetails.teacher_name || "Unnamed Tutor";
  const ratingValue = Number(teacherDetails.rating || 0);
  const totalStudents = teacherDetails.total_students ?? 0;
  const totalReviews = teacherDetails.rating_breakdown?.total_reviews ?? 0;
  const years = teacherDetails.experience_years ?? 0;
  const avatarUrl = teacherDetails.avatar ? getStorageUrl(teacherDetails.avatar) : null;
  const linkedin = (() => {
    try { const u = new URL(teacherDetails.linkedin); return /(^|\.)linkedin\.com$/.test(u.hostname) ? u.href : null; } catch { return null; }
  })();
  const highlights = teacherDetails.highlights || [];
  const languages = teacherDetails.languages || [];
  const distinctions = teacherDetails.distinctions || [];
  const reviews = teacherDetails.recent_reviews || [];
  const isStudent = isLoggedIn && role === "student";

  const facts = [
    years > 0 && { icon: "fa-briefcase", label: "Experience", value: `${years} year${years === 1 ? "" : "s"}` },
    teacherDetails.qualification && { icon: "fa-graduation-cap", label: "Qualification", value: teacherDetails.qualification },
    teach.levels.length > 0 && { icon: "fa-layer-group", label: "Levels", value: teach.levels.join(", ") },
    teach.courses.length > 0 && { icon: "fa-book-open", label: "Courses", value: String(teach.courses.length) },
    totalStudents > 0 && { icon: "fa-user-graduate", label: "Students taught", value: String(totalStudents) },
    totalReviews > 0 && { icon: "fa-star", label: "Rating", value: `${ratingValue.toFixed(1)} / 5 (${totalReviews})` },
    languages.length > 0 && { icon: "fa-language", label: "Teaches in", value: languages.join(", ") },
  ].filter(Boolean);

  const menu = [
    { id: "tutor-about", label: "About" },
    teacherDetails.teaching_approach && { id: "tutor-approach", label: "Teaching approach" },
    (teach.subjects.length > 0 || teach.levels.length > 0) && { id: "tutor-teaches", label: "Subjects & levels" },
    teach.courses.length > 0 && { id: "tutor-courses", label: "Courses" },
    distinctions.length > 0 && { id: "tutor-achievements", label: "Achievements" },
    reviews.length > 0 && { id: "tutor-reviews", label: "Reviews" },
    { id: "tutor-book", label: "Book a session" },
  ].filter(Boolean);

  const H2 = ({ icon, tone, children }) => (
    <h2 className="text-2xl md:text-3xl font-bold text-white mb-5 flex items-center gap-3">
      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tone}`}><i className={`fas ${icon}`} /></span>
      {children}
    </h2>
  );

  const hireLabel = loadingSlots ? (
    <><i className="fas fa-spinner fa-spin" /> Loading slots…</>
  ) : isStudent ? (
    <>
      <i className="fas fa-calendar-check" /> Book a session
      {slotsLoaded && availableSlots.length > 0 && (
        <span className="bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">{availableSlots.length}</span>
      )}
    </>
  ) : (
    <><i className="fas fa-user-graduate" /> Hire as tutor</>
  );

  return (
    <section id="teacher-profile-view" className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <BreadcrumbNavigation
          items={[
            { label: "Home", to: "/", icon: "fas fa-home" },
            { label: "Tutors", to: "/teachers" },
            { label: name.substring(0, 25) },
          ]}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-20">
        {/* Header: photo, name, what they teach, key facts, booking */}
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 p-6 md:p-8 flex flex-col lg:flex-row gap-8">
          <div className="shrink-0 mx-auto lg:mx-0">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-6xl font-bold shadow-2xl shadow-indigo-950/50 border border-white/10 overflow-hidden">
              {avatarUrl ? (
                <img src={sizedImage(avatarUrl, 384)} onError={fallbackToOriginal(avatarUrl)} alt={name} width="192" height="192" className="w-full h-full object-cover text-xs" />
              ) : (
                name[0]?.toUpperCase() || "T"
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{name}</h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
                <i className="fas fa-check-circle" /> Verified tutor
              </span>
            </div>
            {teach.subjects.length > 0 && (
              <p className="text-lg md:text-xl text-indigo-200 font-semibold">{teach.subjects.join(" · ")} tutor</p>
            )}
            {teach.levels.length > 0 && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-3">
                {teach.levels.map((l) => (
                  <span key={l} className="px-3 py-1 rounded-full text-sm font-semibold border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">{l}</span>
                ))}
              </div>
            )}
            {facts.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 text-left">
                {facts.map((f) => (
                  <div key={f.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 min-w-0">
                    <dt className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"><i className={`fas ${f.icon} text-indigo-300`} />{f.label}</dt>
                    <dd className="text-base font-semibold text-white mt-1 break-words">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3 justify-center">
            <button
              onClick={handleHireClick}
              disabled={loadingSlots}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 px-6 py-4 text-base font-bold text-white transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3"
            >
              {hireLabel}
            </button>
            {isStudent && slotsLoaded && (
              <div className={`rounded-xl border px-4 py-3 text-sm font-semibold text-center ${availableSlots.length > 0 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/[0.04] text-slate-300"}`}>
                {availableSlots.length > 0 ? `${availableSlots.length} slot${availableSlots.length > 1 ? "s" : ""} available` : "No slots available right now"}
              </div>
            )}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! I'd like to ask about classes with ${name} at Virtual City School.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm hover:bg-emerald-600 hover:text-white hover:border-transparent transition"
            >
              <i className="fab fa-whatsapp text-base" /> Ask on WhatsApp
            </a>
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 text-sky-200 font-semibold text-sm hover:bg-sky-600 hover:text-white hover:border-transparent transition">
                <i className="fab fa-linkedin" /> LinkedIn profile
              </a>
            )}
          </div>
        </header>

        {/* Phone: the menu as a scrollable strip */}
        <div className="lg:hidden mt-6 -mx-4 px-4 py-2 border-y border-white/5">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {menu.map((x) => (
              <a key={x.id} href={`#${x.id}`} className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border ${active === x.id ? "bg-indigo-500/20 border-indigo-400/50 text-white" : "border-white/10 text-slate-300"}`}>{x.label}</a>
            ))}
          </div>
        </div>

        <div ref={gridRef} className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside ref={menuSlotRef} className="hidden lg:block">
            <nav ref={menuBoxRef} aria-label="On this page" className="z-10 rounded-2xl border border-white/10 bg-[#0a1024]/95 backdrop-blur p-3 overflow-y-auto">
              <div className="px-2.5 pt-1 pb-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">This tutor</div>
              <ol className="space-y-0.5">
                {menu.map((x) => (
                  <li key={x.id}>
                    <a href={`#${x.id}`} className={`block px-2.5 py-2 rounded-lg text-sm transition ${active === x.id ? "bg-indigo-500/15 text-white border border-indigo-500/30" : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"}`}>{x.label}</a>
                  </li>
                ))}
              </ol>
              <Link to="/teachers" className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:border-indigo-400/40">
                All tutors <i className="fas fa-arrow-right text-xs" />
              </Link>
            </nav>
          </aside>

          <div id="tutor-content" className="min-w-0 space-y-12">
            <section id="tutor-about" className="scroll-mt-24">
              <H2 icon="fa-user" tone="bg-indigo-500/20 text-indigo-200">About {name.split(" ")[0]}</H2>
              <p className="text-lg text-slate-200 leading-relaxed max-w-4xl whitespace-pre-line">
                {teacherDetails.bio || `${name} teaches live online classes at Virtual City School.`}
              </p>
              {highlights.length > 0 && (
                <ul className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {highlights.map((h, i) => (
                    <li key={h} className={`flex gap-3 rounded-2xl border p-4 text-base text-slate-100 ${["border-emerald-400/30 bg-emerald-500/10", "border-amber-400/30 bg-amber-500/10", "border-sky-400/30 bg-sky-500/10", "border-violet-400/30 bg-violet-500/10"][i % 4]}`}>
                      <i className="fas fa-check-circle text-emerald-300 mt-1" />{h}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {teacherDetails.teaching_approach && (
              <section id="tutor-approach" className="scroll-mt-24">
                <H2 icon="fa-chalkboard-teacher" tone="bg-violet-500/20 text-violet-200">Teaching approach</H2>
                <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-6">
                  <p className="text-lg text-slate-100 leading-relaxed whitespace-pre-line max-w-4xl">{teacherDetails.teaching_approach}</p>
                </div>
              </section>
            )}

            {(teach.subjects.length > 0 || teach.levels.length > 0) && (
              <section id="tutor-teaches" className="scroll-mt-24">
                <H2 icon="fa-layer-group" tone="bg-cyan-500/20 text-cyan-200">Subjects &amp; levels</H2>
                <div className="grid md:grid-cols-2 gap-4">
                  {teach.subjects.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Subjects</div>
                      <div className="flex flex-wrap gap-2">{teach.subjects.map((x) => <span key={x} className="px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-400/30 text-indigo-100 text-base font-semibold">{x}</span>)}</div>
                    </div>
                  )}
                  {teach.levels.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Levels</div>
                      <div className="flex flex-wrap gap-2">{teach.levels.map((x) => <span key={x} className="px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-100 text-base font-semibold">{x}</span>)}</div>
                    </div>
                  )}
                </div>
                {teach.guideLinks.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {teach.guideLinks.map((g) => (
                      <Link key={g.slug} to={`/subjects/${g.slug}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-200 text-sm font-semibold hover:bg-indigo-600 hover:text-white hover:border-transparent transition">
                        <i className="fas fa-book-open" /> {g.level} {g.subject} {g.code} guide
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {teach.courses.length > 0 && (
              <section id="tutor-courses" className="scroll-mt-24">
                <H2 icon="fa-book-open" tone="bg-emerald-500/20 text-emerald-200">Courses with {name.split(" ")[0]}</H2>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {teach.courses.map((course) => {
                    const g = catalogGuideFor({ title: course.course_name, subject_code: course.subject_code, details: course.details });
                    const thumb = course.thumbnail ? getStorageUrl(course.thumbnail) : null;
                    return (
                      <Link key={course.id} to={`/courses/${course.id}`} className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] hover:border-indigo-400/50 hover:bg-white/[0.07] overflow-hidden transition">
                        <div className="relative aspect-[40/21] bg-slate-900">
                          {thumb ? <img src={sizedImage(thumb, 640)} onError={fallbackToOriginal(thumb)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-3xl"><i className="fas fa-book-open" /></div>}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          {course.level && <div className="text-xs font-bold uppercase tracking-widest text-indigo-300">{course.level}</div>}
                          <div className="font-bold text-white text-base mt-1">{course.course_name}</div>
                          <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-sm">
                            <span className={course.is_paid ? "text-white font-semibold" : "text-emerald-300 font-semibold"}>
                              {course.is_paid ? `$${Number(course.price).toLocaleString("en-US")} / month` : "Free"}
                            </span>
                            {g && <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-200"><i className="fas fa-book-open" /> Guide</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {distinctions.length > 0 && (
              <section id="tutor-achievements" className="scroll-mt-24">
                <H2 icon="fa-trophy" tone="bg-amber-500/20 text-amber-200">Achievements &amp; distinctions</H2>
                <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {distinctions.map((d, i) => (
                    <li key={`${d.title}-${i}`} className="flex gap-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5">
                      <span className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-200 flex items-center justify-center shrink-0"><i className="fas fa-award" /></span>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-base">{d.title}</div>
                        <div className="text-sm text-amber-100/80 mt-1">{d.org}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {reviews.length > 0 && (
              <section id="tutor-reviews" className="scroll-mt-24">
                <H2 icon="fa-star" tone="bg-yellow-500/20 text-yellow-200">What students say</H2>
                <div className="grid md:grid-cols-2 gap-4">
                  {reviews.map((r, i) => (
                    <figure key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <div className="text-yellow-300 mb-2" aria-label={`${r.rating} out of 5`}>
                        {Array.from({ length: 5 }, (_, k) => <i key={k} className={`fas fa-star ${k < Math.round(r.rating) ? "" : "opacity-25"}`} />)}
                      </div>
                      {r.comment && <blockquote className="text-base text-slate-100 leading-relaxed">“{r.comment}”</blockquote>}
                      <figcaption className="text-sm text-slate-400 mt-3">{[r.student_name, r.course_title].filter(Boolean).join(" · ")}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            <section id="tutor-book" className="scroll-mt-24">
              <H2 icon="fa-calendar-check" tone="bg-indigo-500/20 text-indigo-200">Book a 1-on-1 session</H2>
              {isStudent && slotsLoaded && availableSlots.length > 0 ? (
                <div className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-6">
                  {Object.entries(availableSlots.reduce((acc, sl) => { (acc[sl.date] ||= []).push(sl); return acc; }, {}))
                    .sort(([x], [y]) => x.localeCompare(y))
                    .slice(0, 5)
                    .map(([date, daySlots]) => (
                      <div key={date} className="mb-5">
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-2">{fmtDate(date)}</p>
                        <div className="flex flex-wrap gap-2">
                          {daySlots.map((slot) => (
                            <button key={slot.id} onClick={handleHireClick} className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 hover:bg-indigo-500/25 px-4 py-2.5 text-sm font-semibold text-indigo-100 transition">
                              {fmt12(slot.start_time)} – {fmt12(slot.end_time)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  <button onClick={handleHireClick} className="mt-2 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-base text-white transition flex items-center justify-center gap-3">
                    <i className="fas fa-calendar-plus" /> Select &amp; book a slot
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-indigo-400/25 bg-gradient-to-br from-indigo-600/15 to-violet-600/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                  <p className="text-lg text-slate-100 flex-1">
                    {isStudent
                      ? `${name} has no open slots right now. Ask us on WhatsApp and we'll arrange a time.`
                      : `${name} offers private 1-on-1 sessions. Log in as a student to see open slots and book instantly.`}
                  </p>
                  <button onClick={handleHireClick} className="shrink-0 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-base text-white transition">
                    <i className="fas fa-user-graduate" /> {isLoggedIn ? "View available slots" : "Log in to book"}
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookModal && (
        <BookingModal
          teacherName={teacherDetails.teacher_name || "Tutor"}
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
        message="Please log in or create a student account to book a 1-on-1 tutoring slot."
      />
    </section>
  );
};

export default TeacherProfile;
