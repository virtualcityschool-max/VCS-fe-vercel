// VCS Workplace Personality Assessment.
//
// Items: the 100-item IPIP Big-Five Factor Markers (Goldberg, 1992), copied
// word for word from https://ipip.ori.org/newBigFive5broadKey.htm on
// 2026-10-30, shown in the first person ("I am always prepared."). The IPIP
// items "are in the public domain, which means that one can copy, edit,
// translate, or use them for any purpose without asking permission and
// without paying a fee" (ipip.ori.org). Reported reliability (alpha) of the
// 20-item scales: E .91, A .88, C .88, ES .91, I/I .90.
//
// Scoring as published: 5-point accuracy scale (1 = very inaccurate ...
// 5 = very accurate), minus-keyed items reversed, 20 items per factor
// (20-100), shown as 0-100% of the scale. There are no VCS norms yet, so a
// score is a position on the scale, not a percentile.

export const SOURCE = {
  name: "International Personality Item Pool (IPIP), 100-item Big-Five Factor Markers",
  url: "https://ipip.ori.org/",
  citation: "Goldberg, L. R. (1992). The development of markers for the Big-Five factor structure. Psychological Assessment, 4, 26-42.",
  alpha: { E: 0.91, A: 0.88, C: 0.88, S: 0.91, O: 0.90 },
};

// Work names for the five IPIP factors.
export const FACTORS = {
  C: { name: "Dependability", ipip: "Conscientiousness", color: "indigo", adjective: "Dependable", noun: "Organiser" },
  S: { name: "Composure", ipip: "Emotional Stability", color: "emerald", adjective: "Composed", noun: "Anchor" },
  A: { name: "Collaboration", ipip: "Agreeableness", color: "rose", adjective: "Cooperative", noun: "Team Player" },
  E: { name: "Social Confidence", ipip: "Surgency / Extraversion", color: "amber", adjective: "Confident", noun: "Communicator" },
  O: { name: "Intellect & Ideas", ipip: "Intellect / Imagination", color: "violet", adjective: "Thoughtful", noun: "Innovator" },
};
export const FACTOR_ORDER = ["C", "S", "A", "E", "O"];

// [IPIP item text, key]
const ITEMS = {
  E: [
    ["Am the life of the party.", 1], ["Don't talk a lot.", -1], ["Feel comfortable around people.", 1],
    ["Keep in the background.", -1], ["Start conversations.", 1], ["Have little to say.", -1],
    ["Talk to a lot of different people at parties.", 1], ["Don't like to draw attention to myself.", -1],
    ["Don't mind being the center of attention.", 1], ["Am quiet around strangers.", -1],
    ["Make friends easily.", 1], ["Find it difficult to approach others.", -1], ["Take charge.", 1],
    ["Often feel uncomfortable around others.", -1], ["Know how to captivate people.", 1],
    ["Bottle up my feelings.", -1], ["Feel at ease with people.", 1], ["Am a very private person.", -1],
    ["Am skilled in handling social situations.", 1], ["Wait for others to lead the way.", -1],
  ],
  A: [
    ["Am interested in people.", 1], ["Insult people.", -1], ["Sympathize with others' feelings.", 1],
    ["Am not interested in other people's problems.", -1], ["Have a soft heart.", 1],
    ["Feel little concern for others.", -1], ["Take time out for others.", 1],
    ["Am not really interested in others.", -1], ["Feel others' emotions.", 1], ["Am hard to get to know.", -1],
    ["Make people feel at ease.", 1], ["Am indifferent to the feelings of others.", -1],
    ["Inquire about others' well-being.", 1], ["Know how to comfort others.", 1], ["Love children.", 1],
    ["Am on good terms with nearly everyone.", 1], ["Have a good word for everyone.", 1],
    ["Show my gratitude.", 1], ["Think of others first.", 1], ["Love to help others.", 1],
  ],
  C: [
    ["Am always prepared.", 1], ["Leave my belongings around.", -1], ["Pay attention to details.", 1],
    ["Make a mess of things.", -1], ["Get chores done right away.", 1],
    ["Often forget to put things back in their proper place.", -1], ["Like order.", 1], ["Shirk my duties.", -1],
    ["Follow a schedule.", 1], ["Neglect my duties.", -1], ["Am exacting in my work.", 1], ["Waste my time.", -1],
    ["Do things according to a plan.", 1], ["Do things in a half-way manner.", -1],
    ["Continue until everything is perfect.", 1], ["Find it difficult to get down to work.", -1],
    ["Make plans and stick to them.", 1], ["Leave a mess in my room.", -1], ["Love order and regularity.", 1],
    ["Like to tidy up.", 1],
  ],
  S: [
    ["Am relaxed most of the time.", 1], ["Get stressed out easily.", -1], ["Seldom feel blue.", 1],
    ["Worry about things.", -1], ["Am not easily bothered by things.", 1], ["Am easily disturbed.", -1],
    ["Rarely get irritated.", 1], ["Get upset easily.", -1], ["Seldom get mad.", 1], ["Change my mood a lot.", -1],
    ["Have frequent mood swings.", -1], ["Get irritated easily.", -1], ["Often feel blue.", -1],
    ["Get angry easily.", -1], ["Panic easily.", -1], ["Feel threatened easily.", -1],
    ["Get overwhelmed by emotions.", -1], ["Take offense easily.", -1], ["Get caught up in my problems.", -1],
    ["Grumble about things.", -1],
  ],
  O: [
    ["Have a rich vocabulary.", 1], ["Have difficulty understanding abstract ideas.", -1],
    ["Have a vivid imagination.", 1], ["Am not interested in abstract ideas.", -1], ["Have excellent ideas.", 1],
    ["Do not have a good imagination.", -1], ["Am quick to understand things.", 1],
    ["Try to avoid complex people.", -1], ["Use difficult words.", 1], ["Have difficulty imagining things.", -1],
    ["Spend time reflecting on things.", 1], ["Avoid difficult reading material.", -1], ["Am full of ideas.", 1],
    ["Will not probe deeply into a subject.", -1], ["Carry the conversation to a higher level.", 1],
    ["Catch on to things quickly.", 1], ["Can handle a lot of information.", 1],
    ["Love to think up new ways of doing things.", 1], ["Love to read challenging material.", 1],
    ["Am good at many things.", 1],
  ],
};

// "Am always prepared." -> "I am always prepared."
const firstPerson = (t) => `I ${t[0].toLowerCase()}${t.slice(1)}`;

// One item of each factor in turn (factor order rotating), so every page of 10
// has two items per factor.
const build = () => {
  const order = ["E", "A", "C", "S", "O"];
  const out = [];
  for (let i = 0; i < 20; i++) {
    const rot = order.slice(i % 5).concat(order.slice(0, i % 5));
    for (const f of rot) {
      const [text, key] = ITEMS[f][i];
      out.push({ id: `${f}${i + 1}`, text: firstPerson(text), ipip: text, factor: f, key });
    }
  }
  return out;
};

export const QUESTIONS = build();
export const PER_STEP = 10;
export const STEPS = Math.ceil(QUESTIONS.length / PER_STEP);

// IPIP answer scale, left to right.
export const SCALE = [
  { value: 1, label: "Very inaccurate" },
  { value: 2, label: "Moderately inaccurate" },
  { value: 3, label: "Neither" },
  { value: 4, label: "Moderately accurate" },
  { value: 5, label: "Very accurate" },
];

/** { C: 0-100, ... }: position on each 20-100 scale, as a percentage. */
export const scoreFactors = (answers) =>
  Object.fromEntries(
    FACTOR_ORDER.map((f) => {
      let sum = 0;
      let n = 0;
      for (const q of QUESTIONS) {
        if (q.factor !== f || typeof answers[q.id] !== "number") continue;
        sum += q.key === 1 ? answers[q.id] : 6 - answers[q.id];
        n += 1;
      }
      return [f, n ? Math.round(((sum - n) / (4 * n)) * 100) : 50];
    }),
  );

export const level = (pct) => (pct >= 65 ? "high" : pct <= 35 ? "low" : "moderate");
export const LEVEL_LABEL = { high: "High", moderate: "Moderate", low: "Low" };

// Pairs that ask nearly the same thing. same=true: answers should match;
// same=false: one is the reverse of the other.
const CHECK_PAIRS = [
  ["S10", "S11", true], // change my mood a lot / frequent mood swings
  ["C8", "C10", true], // shirk / neglect my duties
  ["C7", "C19", true], // like order / love order and regularity
  ["S7", "S12", false], // rarely get irritated / get irritated easily
  ["O3", "O10", false], // vivid imagination / difficulty imagining things
  ["E5", "E12", false], // start conversations / difficult to approach others
  ["E17", "E14", false], // at ease with people / uncomfortable around others
  ["A9", "A12", false], // feel others' emotions / indifferent to feelings
];

/** Flags for the report's "response check": rushed, too many "Neither", patterned, inconsistent. */
export const responseCheck = (answers, seconds) => {
  const vals = QUESTIONS.map((q) => answers[q.id]).filter((v) => typeof v === "number");
  const flags = [];
  if (typeof seconds === "number" && seconds > 0 && seconds < 240) {
    flags.push("Completed very quickly (under 4 minutes) — answers may not have been read carefully.");
  }
  const neutral = vals.filter((v) => v === 3).length;
  if (neutral > 40) flags.push(`"Neither" chosen for ${neutral} of 100 statements — the profile is less clear than usual.`);
  const counts = [1, 2, 3, 4, 5].map((v) => vals.filter((x) => x === v).length);
  if (Math.max(...counts) > 70) flags.push("The same answer was used for most statements — the answers may be patterned.");
  let diff = 0;
  let n = 0;
  for (const [a, b, same] of CHECK_PAIRS) {
    if (typeof answers[a] !== "number" || typeof answers[b] !== "number") continue;
    diff += Math.abs(answers[a] - (same ? answers[b] : 6 - answers[b]));
    n += 1;
  }
  if (n && diff / n > 1.75) flags.push("Several near-identical statements were answered in opposite ways — answers may be inconsistent.");
  return flags;
};

/** Headline like "Dependable Team Player", from the two highest factors. */
export const headline = (scores) => {
  const [a, b] = [...FACTOR_ORDER].sort((x, y) => scores[y] - scores[x]);
  return `${FACTORS[a].adjective} ${FACTORS[b].noun}`;
};
export const topFactors = (scores, n = 2) => [...FACTOR_ORDER].sort((x, y) => scores[y] - scores[x]).slice(0, n);

// ---- Report text ----------------------------------------------------------
// TEXT[mode][factor][level] = { meaning, strengths[], develop[], interview[] }
// mode: "general" (job seeker) or "teacher" (teacher candidate).

export const TEXT = {
  general: {
    C: {
      high: {
        meaning: "Organised, reliable and thorough. Plans work, meets deadlines and pays close attention to detail and quality.",
        strengths: ["Meets deadlines and follows through on commitments", "Accurate, careful work with few errors", "Plans and prioritises well"],
        develop: ["May find sudden changes of plan frustrating", "Perfectionism can slow down work that only needs to be 'good enough'"],
        interview: ["Tell us about a time a plan changed at the last minute. What did you do?", "How do you decide when a piece of work is finished?"],
      },
      moderate: {
        meaning: "Reasonably organised and reliable, while staying flexible. Can plan when needed but does not need everything fixed in advance.",
        strengths: ["Balances structure with flexibility", "Adapts to changing priorities", "Dependable on important tasks"],
        develop: ["May need reminders or systems for routine admin", "Consistency can vary with interest in the task"],
        interview: ["How do you keep track of several tasks at once?", "Describe a deadline you found hard to meet and what you learned."],
      },
      low: {
        meaning: "Flexible and spontaneous. Prefers variety and freedom over fixed routines and detailed plans.",
        strengths: ["Adapts quickly and copes with ambiguity", "Comfortable with fast-changing work", "Can improvise solutions"],
        develop: ["Deadlines, follow-through and attention to detail need deliberate systems", "Routine paperwork may be left too late"],
        interview: ["What tools or habits do you use to make sure nothing is missed?", "Tell us about a detailed task you completed accurately."],
      },
    },
    S: {
      high: {
        meaning: "Calm, even-tempered and resilient. Handles pressure, criticism and setbacks without being thrown off balance.",
        strengths: ["Steady under pressure and tight deadlines", "Recovers quickly from setbacks", "A calming influence on colleagues"],
        develop: ["May underestimate risks or others' stress", "Calm can be read as lack of urgency"],
        interview: ["How do you know when a colleague is struggling under pressure?", "Describe your most stressful week at work or study."],
      },
      moderate: {
        meaning: "Generally steady, with normal reactions to stress. Usually copes well, though heavy pressure can be felt.",
        strengths: ["Handles everyday pressure well", "Aware of risks without being overwhelmed", "Usually keeps a balanced mood"],
        develop: ["Sustained heavy workload may affect mood", "Benefits from clear priorities in busy periods"],
        interview: ["What do you do to manage stress in a busy period?", "Tell us about receiving difficult feedback."],
      },
      low: {
        meaning: "Sensitive and alert to problems. Feels pressure and criticism strongly, which can drive care and effort but also stress.",
        strengths: ["Notices risks and problems early", "Takes work and feedback seriously", "Empathises with others under stress"],
        develop: ["High-pressure or conflict-heavy roles may be draining", "Benefits from support, clear expectations and regular feedback"],
        interview: ["What kind of work environment helps you do your best?", "Describe a setback and how you recovered from it."],
      },
    },
    A: {
      high: {
        meaning: "Warm, considerate and cooperative. Builds good relationships, helps others and keeps teams working smoothly.",
        strengths: ["Strong team player and supportive colleague", "Good with customers, clients and service users", "Builds trust and resolves friction"],
        develop: ["May avoid necessary conflict or hard conversations", "May say yes to too many requests"],
        interview: ["Tell us about a time you had to disagree with a colleague or manager.", "How do you say no when you are already busy?"],
      },
      moderate: {
        meaning: "Cooperative and considerate, while able to be firm. Balances people's feelings with getting the job done.",
        strengths: ["Works well in teams", "Can be supportive and direct", "Handles disagreement sensibly"],
        develop: ["May need to adapt style between supportive and firm situations", "Could show appreciation of others more openly"],
        interview: ["Describe a team conflict and your role in resolving it.", "How do you give difficult feedback?"],
      },
      low: {
        meaning: "Direct, independent and task-focused. Values logic and results, and is comfortable challenging others.",
        strengths: ["Makes tough, objective decisions", "Comfortable negotiating and challenging ideas", "Not easily swayed by pressure to conform"],
        develop: ["Can come across as blunt or distant", "Customer-facing and team-heavy roles need deliberate warmth"],
        interview: ["How do you build relationships with colleagues you disagree with?", "Tell us about a time you helped a colleague succeed."],
      },
    },
    E: {
      high: {
        meaning: "Socially confident, talkative and energetic. Enjoys meeting people, speaking up and taking the lead.",
        strengths: ["Comfortable presenting, networking and persuading", "Takes initiative and leads groups", "Brings energy to teams and clients"],
        develop: ["May dominate discussions; needs to leave room for others", "Can find solitary, repetitive work unrewarding"],
        interview: ["How do you make sure quieter team members are heard?", "Tell us about a piece of detailed work you did alone."],
      },
      moderate: {
        meaning: "Comfortable with people and with working alone. Can speak up and lead when needed, and also focus quietly.",
        strengths: ["Flexible between team and independent work", "Can present and listen", "Adapts to different social settings"],
        develop: ["May need to push themselves to take the lead in new groups", "Energy for socialising varies"],
        interview: ["Do you prefer working alone or in a team, and why?", "Describe a time you took the lead."],
      },
      low: {
        meaning: "Reserved, private and reflective. Prefers small groups and focused work to large gatherings and the spotlight.",
        strengths: ["Sustained focus on independent, detailed work", "Listens carefully and thinks before speaking", "Calm, low-drama presence"],
        develop: ["Networking, selling and public speaking may take extra effort", "May not speak up enough in meetings"],
        interview: ["How do you share your ideas in group meetings?", "Tell us about a presentation you gave and how you prepared."],
      },
    },
    O: {
      high: {
        meaning: "Curious, imaginative and quick to learn. Enjoys ideas, complex information and finding new ways of doing things.",
        strengths: ["Learns new tasks and systems quickly", "Generates ideas and solves complex problems", "Comfortable with abstract and strategic thinking"],
        develop: ["May get bored with routine or repetitive tasks", "Ideas need to be matched by practical follow-through"],
        interview: ["Tell us about an improvement you suggested and how it was put into practice.", "How do you handle repetitive parts of a job?"],
      },
      moderate: {
        meaning: "Open to new ideas while valuing practical, proven methods. Learns well and applies ideas sensibly.",
        strengths: ["Balances creativity with practicality", "Learns new skills steadily", "Applies ideas to real problems"],
        develop: ["May need encouragement to propose bold new ideas", "Could read more widely in their field"],
        interview: ["What new skill have you learned recently and how?", "Describe a problem you solved in a new way."],
      },
      low: {
        meaning: "Practical and concrete. Prefers clear, proven methods and hands-on work to theory and abstract discussion.",
        strengths: ["Focused on what works in practice", "Reliable with established procedures", "Clear, straightforward communication"],
        develop: ["Roles demanding constant innovation or abstract analysis may be less satisfying", "May need support when systems change"],
        interview: ["Tell us about a time you had to learn a new system quickly.", "How do you approach a problem you have never seen before?"],
      },
    },
  },
  teacher: {
    C: {
      high: {
        meaning: "Well prepared and organised in the classroom: lessons planned, marking on time, records accurate and routines consistent.",
        strengths: ["Thorough lesson planning and schemes of work", "Prompt, careful marking and feedback", "Consistent classroom routines and record keeping"],
        develop: ["May find unplanned changes (cover lessons, timetable changes) stressful", "Can over-prepare; needs to protect own time"],
        interview: ["Your lesson plan isn't working halfway through. What do you do?", "How do you keep up with marking for large classes?"],
      },
      moderate: {
        meaning: "Plans lessons sensibly while staying flexible enough to adapt to the class on the day.",
        strengths: ["Adapts lessons to students' needs in the moment", "Reliable on key deadlines like reports and exams", "Balances structure and spontaneity"],
        develop: ["Admin such as records and marking may need a fixed routine", "Planning depth can vary between topics"],
        interview: ["Walk us through how you plan a week of lessons.", "How do you keep student records up to date?"],
      },
      low: {
        meaning: "Spontaneous and flexible in teaching style; works well 'in the moment' but may find planning, marking and admin a struggle.",
        strengths: ["Responsive, lively lessons", "Copes well with the unexpected", "Comfortable improvising activities"],
        develop: ["Lesson plans, marking deadlines and record keeping need firm systems", "Mentoring or a planning template is recommended"],
        interview: ["Show us a lesson plan you have written.", "How do you make sure marking is returned on time?"],
      },
    },
    S: {
      high: {
        meaning: "Calm and patient with a classroom: handles disruptive behaviour, inspections and parent complaints without losing composure.",
        strengths: ["Stays calm with challenging classes", "Resilient to inspections, workload and criticism", "Models calm behaviour for students"],
        develop: ["May underestimate how anxious some students feel", "Calm should not become complacency about results"],
        interview: ["How do you support a student who is anxious about exams?", "Describe the most difficult class you have taught."],
      },
      moderate: {
        meaning: "Usually handles classroom pressure well, though very heavy workload or difficult behaviour can be felt.",
        strengths: ["Copes with normal classroom demands", "Aware of stress in self and students", "Generally even-tempered with students"],
        develop: ["Exam season and report-writing peaks need planning", "Benefits from a supportive department"],
        interview: ["How do you manage your workload in exam season?", "Tell us about a time a student was rude to you."],
      },
      low: {
        meaning: "Sensitive to classroom pressure; may find behaviour problems, criticism or heavy workload stressful, though this can also mean deep care for students.",
        strengths: ["Highly attentive to students' wellbeing", "Takes feedback seriously", "Notices problems early"],
        develop: ["Large or challenging classes may be draining at first", "Benefits from mentoring, clear behaviour policy and regular feedback"],
        interview: ["What support helps you do your best work?", "How do you respond when a lesson goes badly?"],
      },
    },
    A: {
      high: {
        meaning: "Warm, patient and caring with students and parents; builds strong relationships and a supportive classroom.",
        strengths: ["Strong rapport with students", "Patient with slower learners", "Good with parents and pastoral care"],
        develop: ["May find it hard to enforce discipline or give low grades", "Needs firm boundaries with demanding parents"],
        interview: ["How do you deal with a student who repeatedly breaks rules?", "A parent disputes a grade you gave. What do you do?"],
      },
      moderate: {
        meaning: "Caring but firm; balances warmth with clear expectations and discipline.",
        strengths: ["Fair, consistent discipline", "Good working relationships with colleagues", "Supportive but honest feedback"],
        develop: ["Could show more warmth with struggling students", "Adapting tone between firm and supportive takes judgement"],
        interview: ["How do you build rapport with a new class?", "Describe a time you gave a student difficult feedback."],
      },
      low: {
        meaning: "Direct and demanding; holds high standards and gives honest feedback, but may seem strict or distant to some students and parents.",
        strengths: ["High academic expectations", "Clear, honest feedback", "Firm, consistent discipline"],
        develop: ["Younger or less confident students may need more warmth and encouragement", "Parent conversations need extra care"],
        interview: ["How do you encourage a student who has lost confidence?", "How do you work with a parent who disagrees with you?"],
      },
    },
    E: {
      high: {
        meaning: "Confident, energetic presence at the front of a class; enjoys presenting, leading activities and engaging students.",
        strengths: ["Commands attention and engages large classes", "Comfortable with live online teaching and presentations", "Leads clubs, events and assemblies"],
        develop: ["Must leave room for students to talk and think", "Quieter students may need deliberate attention"],
        interview: ["How do you involve quiet students in your lessons?", "How much of a lesson should the teacher talk?"],
      },
      moderate: {
        meaning: "Comfortable presenting to a class and also working one-to-one or in small groups.",
        strengths: ["Adapts between whole-class teaching and tutoring", "Listens well to students", "Comfortable with parents' meetings"],
        develop: ["May need practice for very large classes or events", "Online teaching energy can drop over long days"],
        interview: ["How do you keep energy up in a long online lesson?", "Describe how you run a group discussion."],
      },
      low: {
        meaning: "Quiet and reflective; may prefer small groups, one-to-one tutoring or subject-focused roles to large, lively classes.",
        strengths: ["Excellent one-to-one and small-group tutoring", "Calm, focused learning atmosphere", "Thoughtful, well-prepared explanations"],
        develop: ["Large classes and public speaking may need practice and support", "Needs strategies to manage noisy groups"],
        interview: ["How do you keep control of a large, noisy class?", "How would you teach a live online class of 30 students?"],
      },
    },
    O: {
      high: {
        meaning: "Curious and creative; enjoys deep subject knowledge, new teaching methods and challenging able students.",
        strengths: ["Strong subject knowledge and enthusiasm", "Creative, varied teaching methods", "Stretches able students (A Level, olympiads)"],
        develop: ["Must keep lessons matched to the syllabus and mark scheme", "Explanations may be pitched too high for weaker students"],
        interview: ["How do you make sure creative lessons still cover the exam syllabus?", "How do you explain a hard idea to a weak student?"],
      },
      moderate: {
        meaning: "Open to new teaching ideas while relying on proven, exam-focused methods.",
        strengths: ["Balances creativity with exam focus", "Willing to learn new teaching tools", "Clear, practical explanations"],
        develop: ["Could try more varied activities", "Keep subject knowledge growing beyond the syllabus"],
        interview: ["What teaching method have you tried recently?", "How do you use past papers in your teaching?"],
      },
      low: {
        meaning: "Practical and structured; prefers clear syllabus-based teaching and proven methods to experimentation.",
        strengths: ["Strong exam-focused, step-by-step teaching", "Clear routines and worked examples", "Reliable delivery of the syllabus"],
        develop: ["Lessons may need more variety to keep students engaged", "Training may be needed for new teaching technology"],
        interview: ["How do you keep students interested in repetitive practice?", "How do you learn a new teaching platform?"],
      },
    },
  },
};

// Roles that tend to suit someone high on each factor.
export const ROLES = {
  general: {
    C: ["Accounting and finance", "Project or operations management", "Quality assurance and compliance", "Administration and office management", "Engineering and technical roles"],
    S: ["Customer service team lead", "Emergency, healthcare or field roles", "Sales with targets", "Management roles", "Air traffic, aviation and safety-critical work"],
    A: ["Human resources", "Customer service and client care", "Nursing and healthcare", "Social work and NGOs", "Hospitality"],
    E: ["Sales and business development", "Marketing and public relations", "Team leadership", "Training and presenting", "Recruitment"],
    O: ["Research and analysis", "Software and data roles", "Strategy and consulting", "Design and content creation", "Product development"],
  },
  teacher: {
    C: ["Exam-year classes (O / A Level)", "Head of department or coordinator", "Exams officer / assessment lead"],
    S: ["Challenging or large classes", "Senior leadership", "Exam-season support"],
    A: ["Primary and early years", "Form tutor / pastoral lead", "Learning support (SEN)"],
    E: ["Large live online classes", "Clubs, debate and events", "Admissions and parent sessions"],
    O: ["A Level and able-student programmes", "Curriculum and resource design", "STEM projects and olympiads"],
  },
};
