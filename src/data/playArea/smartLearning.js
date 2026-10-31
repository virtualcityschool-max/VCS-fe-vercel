// Smart Learning: online vs classroom learning, for parents.
// Only claims backed by research (sources at the bottom of the page).

export const PAGE_PATH = "/mind-lab/smart-learning";

// Side-by-side: a typical classroom vs good online learning.
export const COMPARE = [
  {
    topic: "Teaching tools",
    icon: "fas fa-chalkboard",
    classroom: "Mostly a blackboard and a textbook.",
    online: "Slides, diagrams, videos, animations and online tools.",
  },
  {
    topic: "Missed or didn't understand a lesson",
    icon: "fas fa-rotate-left",
    classroom: "The lesson is gone. Borrow a friend's notes.",
    online: "Watch the recording again: pause, rewind, replay.",
  },
  {
    topic: "Practice",
    icon: "fas fa-list-check",
    classroom: "Homework checked days later, sometimes not at all.",
    online: "Online quizzes and MCQs marked instantly, with explanations.",
  },
  {
    topic: "Seeing progress",
    icon: "fas fa-chart-line",
    classroom: "A report card once a term.",
    online: "Attendance and quiz scores visible all the time.",
  },
  {
    topic: "The teacher's lesson",
    icon: "fas fa-person-chalkboard",
    classroom: "Happens behind a closed door. Nobody else sees it.",
    online: "Prepared in advance, visible and recorded.",
  },
  {
    topic: "Asking questions",
    icon: "fas fa-comments",
    classroom: "Shy students often stay silent.",
    online: "Chat, polls and private messages let every student ask.",
  },
  {
    topic: "Pace",
    icon: "fas fa-gauge",
    classroom: "The whole class moves on together.",
    online: "Revise and practise again at your own pace.",
  },
  {
    topic: "Time and travel",
    icon: "fas fa-car",
    classroom: "Time lost on the school run and in traffic.",
    online: "Learn from home. More time for study, sleep and family.",
  },
  {
    topic: "Skills for the future",
    icon: "fas fa-laptop-code",
    classroom: "Little daily use of computers.",
    online: "Daily use of computers, online tools and video calls, as universities and jobs expect.",
  },
];

// Methods that research supports, and how online learning uses them.
export const METHODS = [
  {
    key: "multimedia",
    color: "violet",
    icon: "fas fa-photo-film",
    title: "Words + pictures",
    finding: "People learn more deeply from words and pictures together than from words alone.",
    who: "Richard Mayer, multimedia learning research",
    online: "Lessons use slides, labelled diagrams and short videos, not just talk and chalk.",
    tip: "Pictures must explain, not decorate. Cluttered slides make learning harder.",
  },
  {
    key: "spacing",
    color: "cyan",
    icon: "fas fa-calendar-days",
    title: "Spread it out",
    finding: "Revising a little over several days beats one long cram session. Practice testing and spaced practice are the two most useful study methods in a major review.",
    who: "Dunlosky and colleagues, 2013",
    online: "Recordings and quizzes stay available, so students can revise any day, not only on lesson day.",
  },
  {
    key: "feedback",
    color: "amber",
    icon: "fas fa-reply",
    title: "Fast feedback",
    finding: "Checking understanding often and acting on it gives some of the biggest gains of any change in teaching.",
    who: "Black & Wiliam, 1998",
    online: "Auto-marked quizzes show the teacher, the student and parents who needs help today, not at the end of term.",
  },
  {
    key: "pace",
    color: "indigo",
    icon: "fas fa-pause",
    title: "Learn at your own pace",
    finding: "Students learn better when they control the pace and can pause between steps.",
    who: "Mayer's segmenting principle",
    online: "Pause and rewind a recording until a difficult step makes sense.",
  },
  {
    key: "testing",
    color: "emerald",
    icon: "fas fa-circle-question",
    title: "Test yourself",
    finding: "Recalling answers from memory makes learning last much longer than reading notes again.",
    who: "Roediger & Karpicke, 2006",
    online: "Quick MCQ quizzes after every topic, marked instantly.",
    chart: "testing",
  },
  {
    key: "teacher",
    color: "rose",
    icon: "fas fa-chalkboard-user",
    title: "A live teacher matters",
    finding: "Online learning led by a teacher worked well. Students studying alone online gained almost nothing.",
    who: "U.S. Department of Education review, 2010",
    online: "Live classes with a real teacher, plus recordings for revision. Not just watching videos alone.",
    chart: "teacher",
  },
];

// Roediger & Karpicke (2006), Experiment 2 (approximate proportions recalled).
export const TESTING_CHART = {
  groups: ["After 5 minutes", "After 1 week"],
  series: [
    { label: "Read it 4 times", values: [83, 40], bar: "bg-amber-500", dot: "bg-amber-500" },
    { label: "Read once, tested 3 times", values: [71, 61], bar: "bg-emerald-500", dot: "bg-emerald-500" },
  ],
  note: "Re-reading feels better on the day, but a week later the students who tested themselves remembered far more.",
};

// Means et al. (2010): average effect compared with face-to-face classes.
export const TEACHER_CHART = {
  rows: [
    { label: "Online, led by a teacher", value: 0.39, bar: "bg-emerald-500" },
    { label: "Online, working together", value: 0.25, bar: "bg-cyan-500" },
    { label: "Online, studying alone", value: 0.05, bar: "bg-slate-400" },
  ],
  max: 0.5,
  note: "Effect size compared with face-to-face classes. 0.2 is small, 0.4 is a clear gain. Studying alone was not a real gain.",
};

// "What happens when…" scenarios for parents.
export const SCENARIOS = [
  {
    key: "sick",
    icon: "fas fa-bed",
    title: "Your child is sick for two days",
    classroom: "Two days of lessons are missed. They copy a friend's notes and the gaps show up in the next test.",
    online: "They watch the recordings when they feel better, do the quizzes and catch up the same week.",
  },
  {
    key: "confused",
    icon: "fas fa-circle-question",
    title: "They didn't understand a topic",
    classroom: "The teacher has moved on. They're too shy to ask in front of everyone.",
    online: "They rewatch the explanation, ask privately in chat, and practise MCQs until it clicks.",
  },
  {
    key: "progress",
    icon: "fas fa-magnifying-glass-chart",
    title: "You want to know how they're doing",
    classroom: "You wait for the parent-teacher meeting or the report card.",
    online: "You see attendance and quiz scores any time, and can message the teacher.",
  },
  {
    key: "exams",
    icon: "fas fa-hourglass-half",
    title: "Exams are three weeks away",
    classroom: "Revision from notes, guessing which topics are weak.",
    online: "Quiz scores show the weak topics. They rewatch those lessons and do timed practice.",
  },
  {
    key: "move",
    icon: "fas fa-plane",
    title: "Your family moves city or country",
    classroom: "New school, new teachers, maybe a different syllabus.",
    online: "Same teachers, same class, same syllabus, anywhere with internet.",
  },
  {
    key: "shy",
    icon: "fas fa-user-secret",
    title: "Your child is shy",
    classroom: "They rarely speak in a class of 40.",
    online: "Chat, polls and private questions let them take part without fear.",
  },
];

export const MYTHS = [
  {
    myth: "\"We remember 10% of what we read, 20% of what we hear, 90% of what we do.\"",
    truth: "This \"learning pyramid\" has no study behind it. The institute that spread it says the original data was lost. What is true: active practice and testing yourself help a lot.",
  },
  {
    myth: "\"Only 7% of communication is words. The rest is tone and body language.\"",
    truth: "The psychologist behind this tested only how people judge feelings when words and tone clash. He said it does not apply to normal speaking or teaching.",
  },
  {
    myth: "\"Online learning is just watching videos.\"",
    truth: "Good online learning has live teachers, discussion and quizzes. Research found that studying alone online gave almost no gain. The live teacher is what makes the difference.",
  },
  {
    myth: "\"Children can't be disciplined online.\"",
    truth: "Discipline needs structure in any school: a fixed timetable, attendance, cameras on, homework deadlines, and parents who can see what's happening. Online, all of this can be tracked.",
  },
];

// Why online lessons need more preparation.
export const TEACHER_POINTS = [
  { icon: "fas fa-file-powerpoint", title: "Prepared in advance", text: "Slides, diagrams and quizzes have to be made before the class. A teacher can't simply talk their way through." },
  { icon: "fas fa-video", title: "Every lesson is recorded", text: "Lessons can be watched again by students, and checked for quality. Teachers know their work is seen." },
  { icon: "fas fa-square-poll-vertical", title: "Results show at once", text: "Quiz scores after each lesson show straight away whether the class understood." },
  { icon: "fas fa-user-group", title: "Parents can see", text: "Attendance and progress are visible, so teaching is open, not behind a closed door." },
];

// "How smart is your child's learning?" checklist for parents.
export const CHECKLIST = [
  "Live classes with a qualified subject teacher",
  "A recording of every lesson to watch again",
  "Slides, diagrams and videos, not just a blackboard",
  "Regular quizzes or MCQs with instant marking",
  "Progress and attendance I can see at any time",
  "My child can ask questions easily, even privately",
  "Small classes where every student takes part",
  "I can contact the teacher directly",
];

export const FAQ = [
  {
    q: "Is all that screen time bad for my child?",
    a: "Learning on a screen with a live teacher is very different from scrolling social media. Build in short breaks between classes, keep phones away during lessons, and use the 20-20-20 rule for eyes: every 20 minutes, look at something 20 feet away for 20 seconds.",
  },
  {
    q: "Will my child miss out on friends?",
    a: "Good online classes include group work and discussion. Balance it with sport, family time and activities in your community, which you'll have more time for without the school run.",
  },
  {
    q: "Didn't online school fail during COVID?",
    a: "Rushed emergency schooling during COVID set many students back. A large review found an average loss of about a third of a school year. That was online school without planning. What works is planned online learning: prepared lessons, live teachers, regular quizzes and progress parents can see.",
  },
  {
    q: "How do I know my child is really attending and learning?",
    a: "Check attendance and quiz scores, ask your child to show you a recording of today's lesson, and keep in touch with the teacher. Online, the evidence is always there to look at.",
  },
  {
    q: "Can online students sit Cambridge O and A Level exams?",
    a: "Yes. Cambridge exams are taken at approved exam centres (in Pakistan and the Gulf, many students register through the British Council). The syllabus is the same wherever you study.",
  },
];

export const SOURCES = [
  { label: "Mayer, R. E. Multimedia Learning: the multimedia principle. Cambridge University Press.", url: "https://www.cambridge.org/core/books/abs/multimedia-learning/multimedia-principle/C5CE697EE4411F0D8DC0D7B6D6F94EE3" },
  { label: "Roediger, H. L. & Karpicke, J. D. (2018). Reflections on the resurgence of interest in the testing effect (about their 2006 study). Perspectives on Psychological Science.", url: "https://doi.org/10.1177/1745691617718873" },
  { label: "Dunlosky, J. et al. (2013). Improving students' learning with effective learning techniques. Psychological Science in the Public Interest.", url: "https://doi.org/10.1177/1529100612453266" },
  { label: "Black, P. & Wiliam, D. (1998). Inside the Black Box: Raising Standards Through Classroom Assessment.", url: "https://serc.carleton.edu/resources/16361.html" },
  { label: "Means, B. et al. (2010). Evaluation of Evidence-Based Practices in Online Learning: A Meta-Analysis. U.S. Department of Education.", url: "https://www.sri.com/publication/education-learning-pubs/digital-learning-pubs/evaluation-of-evidence-based-practices-in-online-learning-a-meta-analysis-and-review-of-online-learning-studies/" },
  { label: "Betthäuser, B. A. et al. (2023). A systematic review and meta-analysis of the evidence on learning during the COVID-19 pandemic. Nature Human Behaviour.", url: "https://doi.org/10.1038/s41562-022-01506-4" },
  { label: "Letrud, K. (2012). A rebuttal of NTL Institute's learning pyramid.", url: "https://wikicap.ulb.be/images/6/62/Letrud_2012.pdf" },
  { label: "Mind Tools. Mehrabian's communication model: what it does and doesn't say.", url: "https://www.mindtools.com/?p=59555" },
  { label: "American Academy of Ophthalmology. Computers, digital devices and eye strain (20-20-20 rule).", url: "https://www.aao.org/eye-health/tips-prevention/computer-usage" },
];
