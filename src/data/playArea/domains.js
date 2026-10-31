// Learning Domains: Head (knowledge), Hands (skill), Heart (attitude).
// Levels: revised Bloom's taxonomy (cognitive), Krathwohl's affective levels,
// Dave's psychomotor levels — the versions most used by teachers worldwide.

export const STORE_KEY = "vcs_play_domains_v1";

export const DOMAINS = {
  head: {
    key: "head",
    short: "Head",
    name: "Knowledge",
    tech: "Cognitive domain",
    color: "violet",
    icon: "fas fa-brain",
    question: "What do I know and how well can I think with it?",
    summary: "Facts, ideas and thinking: remembering, understanding, solving, judging and creating.",
    example: "Knowing that Pakistan was created on 14 August 1947.",
    test: "Can you say it, write it or explain it?",
    checked: "Written questions, quizzes, essays, projects.",
  },
  hands: {
    key: "hands",
    short: "Hands",
    name: "Skill",
    tech: "Psychomotor domain",
    color: "amber",
    icon: "fas fa-hand",
    question: "What can my body do, and how smoothly?",
    summary: "Physical skills learned by practice: movement, coordination, using tools and equipment.",
    example: "Riding a horse. Reading a book about riding won't keep you in the saddle.",
    test: "Do you need practice with your body to get better?",
    checked: "Watching the student do it: practicals, performances, demonstrations.",
  },
  heart: {
    key: "heart",
    short: "Heart",
    name: "Attitude",
    tech: "Affective domain",
    color: "rose",
    icon: "fas fa-heart",
    question: "What do I value, and what do I choose to do when nobody is checking?",
    summary: "Values, feelings and character: honesty, discipline, respect, responsibility, kindness.",
    example: "Returning extra change to a shopkeeper even though nobody would ever know.",
    test: "Is it about choosing what is right, again and again?",
    checked: "Watching behaviour over weeks and months, not a one-off test.",
  },
};

export const DOMAIN_ORDER = ["head", "hands", "heart"];

// One topic seen through all three domains.
export const ONE_TOPIC = [
  {
    topic: "Traffic",
    icon: "fas fa-traffic-light",
    head: "Knowing what a red light means",
    hands: "Driving a car smoothly",
    heart: "Stopping at a red light on an empty road at midnight",
  },
  {
    topic: "Cricket",
    icon: "fas fa-baseball-bat-ball",
    head: "Knowing the LBW rule",
    hands: "Bowling a yorker",
    heart: "Accepting the umpire's decision with grace",
  },
  {
    topic: "Science lab",
    icon: "fas fa-flask",
    head: "Explaining how acids react with alkalis",
    hands: "Doing an accurate titration",
    heart: "Reporting your real results, even when they look wrong",
  },
  {
    topic: "Pakistan",
    icon: "fas fa-flag",
    head: "Knowing why and when Pakistan was created",
    hands: "Raising the flag correctly at a ceremony",
    heart: "Serving your country honestly in whatever job you do",
  },
];

// Each level: name, a student-friendly label, meaning, action verbs,
// and one example for every "thread" of that domain.
export const LEVELS = {
  head: {
    threads: [
      { key: "history", label: "Pakistan 1947", icon: "fas fa-landmark" },
      { key: "science", label: "Photosynthesis", icon: "fas fa-leaf" },
    ],
    levels: [
      {
        name: "Remember",
        meaning: "Recall facts you have learned.",
        verbs: ["state", "list", "name", "define", "recall"],
        history: "On what date was Pakistan created?",
        science: "State the word equation for photosynthesis.",
      },
      {
        name: "Understand",
        meaning: "Explain ideas in your own words.",
        verbs: ["explain", "describe", "summarise", "classify", "give an example"],
        history: "Explain why the Muslims of the subcontinent asked for a separate homeland.",
        science: "Explain why most leaves are thin, flat and green.",
      },
      {
        name: "Apply",
        meaning: "Use what you know in a new situation.",
        verbs: ["use", "calculate", "solve", "carry out", "suggest"],
        history: "Use the steps of source analysis on a 1946 newspaper extract: who wrote it, when, and why?",
        science: "Calculate the rate of photosynthesis from the number of bubbles counted each minute.",
      },
      {
        name: "Analyze",
        meaning: "Break it into parts and see how they connect.",
        verbs: ["compare", "contrast", "examine", "find the cause", "organise"],
        history: "Compare the political, religious and economic reasons for the creation of Pakistan. How were they linked?",
        science: "Look at the graph: why does the rate stop rising after a certain light intensity?",
      },
      {
        name: "Evaluate",
        meaning: "Judge, decide and justify with evidence.",
        verbs: ["judge", "justify", "assess", "recommend", "how far do you agree"],
        history: "\"The 1945–46 elections were the most important step towards Pakistan.\" How far do you agree?",
        science: "A farmer wants extra lights in a greenhouse. Using the data, is it worth the cost?",
      },
      {
        name: "Create",
        meaning: "Put ideas together to make something new.",
        verbs: ["design", "plan", "compose", "invent", "produce"],
        history: "Plan a short documentary that tells the story of 1947 to Grade 5 children.",
        science: "Design an experiment to test whether the colour of light changes the rate of photosynthesis.",
      },
    ],
  },
  hands: {
    threads: [
      { key: "riding", label: "Horse riding", icon: "fas fa-horse" },
      { key: "titration", label: "Chemistry practical", icon: "fas fa-vial" },
    ],
    levels: [
      {
        name: "Imitate",
        meaning: "Watch someone, then copy them.",
        verbs: ["copy", "repeat", "follow", "watch and do"],
        riding: "Watches the coach mount the horse and copies, while the coach holds the reins.",
        titration: "Watches the teacher fill a burette, then copies each step.",
      },
      {
        name: "Practise",
        meaning: "Do it on your own by following instructions.",
        verbs: ["practise", "perform", "follow steps", "carry out"],
        riding: "Rides around the ring alone, following the coach's spoken instructions.",
        titration: "Carries out a titration using the written method, step by step.",
      },
      {
        name: "Perfect",
        meaning: "Do it accurately, with few mistakes.",
        verbs: ["perform accurately", "control", "demonstrate", "master"],
        riding: "Walks, trots and stops exactly where asked, without help.",
        titration: "Gets results that agree within 0.10 cm³ every time.",
      },
      {
        name: "Combine",
        meaning: "Join skills together and adapt to new situations.",
        verbs: ["combine", "adapt", "coordinate", "adjust"],
        riding: "Steers, controls speed and keeps balance together, even on a new track or with a nervous horse.",
        titration: "Chooses the right indicator and adjusts the method for a new acid.",
      },
      {
        name: "Automatic",
        meaning: "Do it smoothly without thinking, and even create new ways.",
        verbs: ["perform naturally", "design", "invent", "teach"],
        riding: "Rides smoothly without thinking about it and can teach a beginner.",
        titration: "Works quickly and accurately while thinking about the chemistry, not the steps.",
      },
    ],
  },
  heart: {
    threads: [
      { key: "honesty", label: "Honesty", icon: "fas fa-scale-balanced" },
      { key: "law", label: "Obeying the law", icon: "fas fa-traffic-light" },
      { key: "discipline", label: "Discipline", icon: "fas fa-clock" },
    ],
    levels: [
      {
        name: "Notice",
        meaning: "Pay attention to a value and be willing to hear about it.",
        verbs: ["listen", "notice", "attend", "be aware"],
        honesty: "Listens closely in assembly to how the Prophet Muhammad (PBUH) was known as al-Amin, the trustworthy.",
        law: "Listens when told why traffic rules save lives.",
        discipline: "Listens when the teacher explains why being on time matters.",
      },
      {
        name: "Respond",
        meaning: "Take part and act on it, often when asked.",
        verbs: ["take part", "answer", "follow", "help"],
        honesty: "Owns up when the teacher asks who broke the beaker.",
        law: "Wears a seat belt or helmet when parents remind them.",
        discipline: "Arrives on time when the teacher is checking.",
      },
      {
        name: "Value",
        meaning: "Believe it matters and act on it without being asked.",
        verbs: ["choose", "support", "commit", "defend"],
        honesty: "Returns extra change to a shopkeeper when nobody would ever know.",
        law: "Waits at a red light even when the road is empty.",
        discipline: "Makes a study timetable and keeps it without reminders.",
      },
      {
        name: "Organise",
        meaning: "Fit the value with your other values, and choose well when they clash.",
        verbs: ["balance", "prioritise", "weigh up", "plan"],
        honesty: "A friend wants to copy homework. Keeps the friendship and honesty by explaining the work instead.",
        law: "Running late for an exam, still doesn't break the signal. Leaves earlier next time.",
        discipline: "Balances prayer, study, family, friends and phone time sensibly.",
      },
      {
        name: "Live it",
        meaning: "The value has become your character. You act on it every time.",
        verbs: ["act consistently", "practise", "show", "live by"],
        honesty: "Known by everyone as trustworthy: in exams, with money and with words. People leave things in their care (amanat).",
        law: "Follows rules, waits in queues and pays fairly everywhere, and encourages others to do the same.",
        discipline: "Self-disciplined in every part of life. Others know they can rely on them.",
      },
    ],
  },
};

// Cambridge command words and the thinking level they usually ask for.
export const COMMAND_WORDS = [
  { level: 0, words: ["State", "Define", "Name", "Identify"] },
  { level: 1, words: ["Describe", "Explain", "Outline"] },
  { level: 2, words: ["Calculate", "Suggest", "Determine"] },
  { level: 3, words: ["Compare", "Analyse", "Contrast"] },
  { level: 4, words: ["Evaluate", "Discuss", "Justify", "How far do you agree"] },
  { level: 5, words: ["Design", "Plan", "Construct"] },
];

// Game 1: Head, Hands or Heart?
export const SORT_CARDS = [
  { text: "Knowing that Pakistan was created on 14 August 1947", domain: "head", why: "It's a fact you remember (Remember level)." },
  { text: "Riding a horse", domain: "hands", why: "Only practice with your body makes you better." },
  { text: "Returning extra change to a shopkeeper", domain: "heart", why: "Nobody is checking. You choose to be honest (Value level)." },
  { text: "Knowing what a red light means", domain: "head", why: "It's a fact. Even a person who breaks the rule knows it." },
  { text: "Waiting at a red light on an empty road", domain: "heart", why: "Knowing the rule is Head. Obeying it when nobody is watching is Heart." },
  { text: "Calculating the area of a circle with πr²", domain: "head", why: "Using a formula in a new problem (Apply level)." },
  { text: "Tying your shoelaces without looking", domain: "hands", why: "A physical skill done without thinking (Automatic level)." },
  { text: "Knowing the LBW rule in cricket", domain: "head", why: "Knowing rules is knowledge." },
  { text: "Bowling a cricket ball at the stumps", domain: "hands", why: "Aim and coordination come from practice." },
  { text: "Accepting the umpire's decision without arguing", domain: "heart", why: "Respect and self-control are attitudes." },
  { text: "Comparing two newspaper reports of the same event", domain: "head", why: "Breaking information apart to see differences (Analyze level)." },
  { text: "Waiting in a queue instead of pushing ahead", domain: "heart", why: "Fairness and patience: you choose it." },
  { text: "Typing quickly with all ten fingers", domain: "hands", why: "Speed and accuracy come from practising the movement." },
  { text: "Knowing that the symbol for sodium is Na", domain: "head", why: "A fact you recall (Remember level)." },
  { text: "Lighting a Bunsen burner safely", domain: "hands", why: "Using equipment correctly is a practical skill." },
  { text: "Respecting a classmate who has a different opinion", domain: "heart", why: "Respect is a value you show in how you behave." },
  { text: "Judging which of two solutions is better, with reasons", domain: "head", why: "Weighing evidence and deciding (Evaluate level)." },
  { text: "Focusing a microscope on a cell", domain: "hands", why: "Fine finger control improves with practice." },
  { text: "Picking up litter when nobody is watching", domain: "heart", why: "Caring for shared places without reward." },
  { text: "Designing your own science experiment", domain: "head", why: "Putting ideas together into something new (Create level)." },
  { text: "Keeping a promise even when it's hard", domain: "heart", why: "Being trustworthy is character (amanat)." },
  { text: "Writing beautiful Urdu calligraphy", domain: "hands", why: "Pen control is a skill built by practice." },
  { text: "Being on time for every class without reminders", domain: "heart", why: "Self-discipline that has become a habit (Live it level)." },
  { text: "Explaining in your own words why ice floats", domain: "head", why: "Explaining an idea (Understand level)." },
];

export const SORT_ROUND = 12;

// Game 2: which thinking level does this exam question ask for?
export const LEVEL_QUIZ = [
  { q: "State the chemical formula of water.", level: 0, why: "\"State\" asks you to recall a fact." },
  { q: "Explain why ice floats on water.", level: 1, why: "\"Explain\" asks you to show you understand an idea." },
  { q: "A car travels 120 km in 2 hours. Calculate its average speed.", level: 2, why: "You use a formula in a new problem." },
  { q: "Compare the climate of Karachi with the climate of Murree.", level: 3, why: "\"Compare\" means breaking both apart and finding similarities and differences." },
  { q: "\"Social media does more harm than good.\" How far do you agree?", level: 4, why: "You must judge and support your judgement with evidence." },
  { q: "Design a poster that persuades people in your city to save water.", level: 5, why: "You create something new from your ideas." },
  { q: "Define the term 'photosynthesis'.", level: 0, why: "\"Define\" asks for a learned definition." },
  { q: "Use the map scale to find the distance between two towns.", level: 2, why: "You apply a method (using a scale) to a new map." },
  { q: "Which method is better for measuring the volume of a stone? Justify your choice.", level: 4, why: "\"Justify\" means judge and give reasons." },
  { q: "Describe what happens when magnesium is added to dilute acid.", level: 1, why: "\"Describe\" shows you understand what you observed." },
  { q: "Look at the data. What pattern can you see, and what might cause it?", level: 3, why: "Finding patterns and causes in data is analysis." },
  { q: "Write a short story that ends with: \"…and that is why I never lied again.\"", level: 5, why: "Writing something original is creating." },
];

export const QUIZ_ROUND = 8;

// Teacher toolkit: an activity idea and a way to check, for every level.
export const TEACHING = {
  head: [
    { activity: "Flashcards, quick-fire quiz, labelling a diagram", check: "Short recall quiz at the start of the next lesson" },
    { activity: "Explain it to a partner, draw a concept map", check: "\"Explain it in your own words\" exit ticket" },
    { activity: "Worked example, then a new problem to solve", check: "Two unseen problems of the same kind" },
    { activity: "Compare-and-contrast table, sort causes into groups", check: "\"Which was more important, and why?\" paragraph" },
    { activity: "Debate, rank options, peer-mark using a rubric", check: "\"How far do you agree?\" answer with evidence" },
    { activity: "Design a poster, experiment, model or story", check: "Product marked with a simple rubric" },
  ],
  hands: [
    { activity: "Teacher demonstrates slowly, students copy step by step", check: "Watch: can they copy each step?" },
    { activity: "Practise from a written or picture guide", check: "Checklist of steps done in the right order" },
    { activity: "Timed or repeated practice with feedback", check: "Accuracy: measurements, neatness, few mistakes" },
    { activity: "New situation that needs skills joined together", check: "Can they adapt when something changes?" },
    { activity: "Teach a younger student, create a routine", check: "Smooth, confident, without help" },
  ],
  heart: [
    { activity: "Story, real example or role model in assembly or class", check: "Are they listening and interested?" },
    { activity: "Give a duty (monitor, helper) and thank them for doing it", check: "Do they take part when asked?" },
    { activity: "Honesty box, choices with no reward, class promises", check: "Do they act on the value without being asked?" },
    { activity: "Discuss real dilemmas: friend vs honesty, hurry vs rules", check: "Can they explain how they weighed up the choice?" },
    { activity: "Long-term responsibility, reflection journal, service project", check: "Consistent behaviour over a term, noticed by others" },
  ],
};

// Question ladder: six questions on any topic, one per thinking level.
export const LADDER = [
  (t) => `What are the key facts about ${t}? List them.`,
  (t) => `Explain ${t} in your own words, as if to a younger student.`,
  (t) => `Use what you know about ${t} to solve a new problem or real-life example.`,
  (t) => `Compare ${t} with something similar. What is the same, and what is different?`,
  (t) => `How important is ${t} in real life? Make a judgement and support it with evidence.`,
  (t) => `Design something new (a model, plan, poster or experiment) using ${t}.`,
];

// Observation checklist for character traits. Each behaviour matches one
// affective level (0 Notice … 4 Live it).
export const TRAITS = [
  {
    key: "honesty",
    name: "Honesty",
    icon: "fas fa-scale-balanced",
    signs: [
      "Listens with interest when honesty is discussed",
      "Tells the truth when asked directly",
      "Is honest even when nobody would find out",
      "Stays honest when it costs them something (a friend, a mark)",
      "Known by classmates and teachers as trustworthy",
    ],
  },
  {
    key: "discipline",
    name: "Discipline",
    icon: "fas fa-clock",
    signs: [
      "Understands why rules and routines matter",
      "Follows routines when reminded",
      "Arrives on time and finishes work without reminders",
      "Balances study, rest and screen time sensibly",
      "Self-disciplined in every subject, every week",
    ],
  },
  {
    key: "law",
    name: "Respect for rules and law",
    icon: "fas fa-gavel",
    signs: [
      "Knows the school rules and why they exist",
      "Follows rules when an adult is watching",
      "Follows rules when no adult is watching",
      "Chooses the rule even when breaking it would be easier",
      "Encourages others to follow rules fairly",
    ],
  },
  {
    key: "responsibility",
    name: "Responsibility",
    icon: "fas fa-hands-holding-child",
    signs: [
      "Notices when a task needs doing",
      "Does duties when given them",
      "Volunteers for duties and takes care of shared things",
      "Owns up to mistakes and puts them right",
      "Others rely on them without checking",
    ],
  },
  {
    key: "respect",
    name: "Respect and kindness",
    icon: "fas fa-handshake",
    signs: [
      "Listens politely when others speak",
      "Helps when asked",
      "Helps and includes others without being asked",
      "Stays respectful in disagreements",
      "Kind to everyone, including those who can't return the favour",
    ],
  },
];

// Ways teachers build the Heart, not just the Head.
export const HEART_HABITS = [
  { icon: "fas fa-person-chalkboard", title: "Be the example", text: "Students copy what they see. Arrive on time, keep promises and admit your own mistakes." },
  { icon: "fas fa-comment-dots", title: "Praise the choice, not just the mark", text: "\"You told the truth when it was hard. That takes courage.\" Specific praise shows what you value." },
  { icon: "fas fa-key", title: "Give real responsibility", text: "Class duties, an honesty box, looking after equipment. Trust builds trustworthiness." },
  { icon: "fas fa-people-arrows", title: "Discuss real dilemmas", text: "A friend asks to copy. You're late and the signal is red. Let students reason it through." },
  { icon: "fas fa-book-open", title: "Make time to reflect", text: "One minute at the end of the week: \"When did I do the right thing when it was hard?\"" },
];

export const KEY_FACTS = [
  {
    color: "violet",
    icon: "fas fa-chart-column",
    title: "Most textbook questions test memory",
    text: "A 2024 study of a Pakistani Grade 5 Science textbook found 127 questions needing lower-order thinking and only 20 needing higher-order thinking.",
  },
  {
    color: "rose",
    icon: "fas fa-heart-pulse",
    title: "Building the Heart helps the Head",
    text: "A review of 213 school programmes (about 270,000 students) found that teaching social and emotional skills improved behaviour and attitudes, and results rose by 11 percentile points in the studies that measured them.",
  },
  {
    color: "amber",
    icon: "fas fa-flag",
    title: "Unity, Faith, Discipline",
    text: "Quaid-e-Azam's motto for the nation is about the Heart. Pakistan's national curriculum also names character building and values as goals.",
  },
];

export const NOTES = [
  "The levels are a guide, not strict stairs. Students often move up and down.",
  "Lower levels are not less important. You can't analyse what you don't know.",
  "Real tasks mix all three. A good doctor needs knowledge, steady hands and honesty.",
];

export const SOURCES = [
  { label: "Anderson, L. W. & Krathwohl, D. R. (Eds.) (2001). A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy. Summary by Iowa State University.", url: "https://www.celt.iastate.edu/teaching/effective-practice/revised-blooms-taxonomy/" },
  { label: "Krathwohl, D. R. (2002). A Revision of Bloom's Taxonomy: An Overview. Theory Into Practice, 41(4).", url: "https://www.bu.edu/provost/files/2013/10/Anderson-Krathwohl-Revision-to-Blooms-Taxonomy-of-Educational-Objectives.pdf" },
  { label: "Krathwohl, D. R., Bloom, B. S. & Masia, B. B. (1964). Taxonomy of Educational Objectives, Handbook II: Affective Domain. Summary by George Mason University.", url: "https://mason.gmu.edu/~ndabbagh/cehdclass/Resources/IDKB/krathstax.htm" },
  { label: "Dave, R. H. (1970). Psychomotor levels. Summary by Rowan University.", url: "https://users.rowan.edu/~cone/curriculum/psychomotor.htm" },
  { label: "University of New England. Introduction to Bloom's taxonomy: cognitive, affective and psychomotor domains.", url: "https://une.edu/pdfs/introduction-blooms-taxonomy-cognitive-affective-and-psychomotor-domains" },
  { label: "Durlak, J. A. et al. (2011). The impact of enhancing students' social and emotional learning: a meta-analysis. Child Development, 82(1), 405–432.", url: "https://pubmed.ncbi.nlm.nih.gov/21291449/" },
  { label: "Gul, S. (2024). Analysing students' learning outcomes and items in assessment exercises of textbook with Single National Curriculum of General Science at primary level. MUL Journal of Education.", url: "https://doi.org/10.58932/MULI0003" },
  { label: "Cambridge International. Command words for Cambridge O Level and A Level syllabuses.", url: "https://www.cambridgeinternational.org/" },
];

export const PAGE_PATH = "/mind-lab/learning-domains";

export const shareLink = (text) =>
  `https://wa.me/?text=${encodeURIComponent(`${text} Try it: https://virtualcityschool.com${PAGE_PATH}`)}`;

// Best scores per game, kept in this browser only.
export const loadBest = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
};

export const saveBest = (game, score) => {
  const best = loadBest();
  if (score <= (best[game] ?? -1)) return false;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...best, [game]: score }));
  } catch {
    /* storage blocked: the game still works */
  }
  return true;
};
