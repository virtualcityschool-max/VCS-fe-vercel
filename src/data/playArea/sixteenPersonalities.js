// VCS 16-Personalities Assessment — 60 questions across 5 dimensions:
// Mind (E/I), Energy (N/S), Nature (T/F), Tactics (J/P), and Identity (A/T).
// Produces one of the 16 personality types (e.g., INTJ-A, ENFP-T).

export const STORE_KEY = "vcs_play_16p_v1";

export const SCALE = [3, 2, 1, 0, -1, -2, -3];

export const SCALE_LABELS = [
  "Agree strongly",
  "Agree",
  "Agree a little",
  "Neutral",
  "Disagree a little",
  "Disagree",
  "Disagree strongly",
];

export const ROLES = {
  analysts: {
    name: "Analysts",
    label: "Intuitive (N) & Thinking (T)",
    blurb: "Known for their rationality, impartiality, and intellectual excellence.",
    color: "violet",
    badge: "border-purple-500/30 bg-purple-500/15 text-purple-300",
    barColor: "bg-purple-500",
  },
  diplomats: {
    name: "Diplomats",
    label: "Intuitive (N) & Feeling (F)",
    blurb: "Known for their empathy, diplomatic skills, and passionate idealism.",
    color: "emerald",
    badge: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    barColor: "bg-emerald-500",
  },
  sentinels: {
    name: "Sentinels",
    label: "Observant (S) & Judging (J)",
    blurb: "Known for their practicality, order, security, and stability.",
    color: "cyan",
    badge: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300",
    barColor: "bg-cyan-500",
  },
  explorers: {
    name: "Explorers",
    label: "Observant (S) & Prospecting (P)",
    blurb: "Known for their spontaneity, ingenuity, and flexibility.",
    color: "amber",
    badge: "border-amber-500/30 bg-amber-500/15 text-amber-300",
    barColor: "bg-amber-500",
  },
};

export const DIMENSIONS = {
  EI: {
    name: "Mind",
    high: { code: "E", label: "Extraverted", desc: "Prefers group activities, social interaction, and gains energy by being around others." },
    low: { code: "I", label: "Introverted", desc: "Prefers solitary activities, quiet environments, and recharges with alone time." },
  },
  SN: {
    name: "Energy",
    high: { code: "N", label: "Intuitive", desc: "Imaginative, open-minded, focuses on hidden meanings, future possibilities, and big ideas." },
    low: { code: "S", label: "Observant", desc: "Practical, pragmatic, grounded, focuses on observable facts, present reality, and past experience." },
  },
  TF: {
    name: "Nature",
    high: { code: "T", label: "Thinking", desc: "Focuses on objectivity, rationality, logic, and efficiency over emotional aspects." },
    low: { code: "F", label: "Feeling", desc: "Sensitive to emotions, values harmony, empathy, and personal beliefs when deciding." },
  },
  JP: {
    name: "Tactics",
    high: { code: "J", label: "Judging", desc: "Decisive, prefers clear structure, thorough planning, organized lists, and deadlines." },
    low: { code: "P", label: "Prospecting", desc: "Flexible, relaxed, adaptable, spontaneous, prefers keeping options open." },
  },
  AT: {
    name: "Identity",
    high: { code: "A", label: "Assertive", desc: "Self-assured, emotionally steady, resistant to stress, refuses to worry excessively." },
    low: { code: "T", label: "Turbulent", desc: "Success-driven, perfectionistic, deeply cares about outcomes, eager for self-improvement." },
  },
};

// 60 questions organized into 10 steps of 6 questions each
export const QUESTIONS = [
  // Step 1
  { id: 1, step: 1, text: "You regularly make new friends.", dim: "EI", key: 1 },
  { id: 2, step: 1, text: "You enjoy exploring unfamiliar ideas and viewpoints.", dim: "SN", key: 1 },
  { id: 3, step: 1, text: "You are not easily swayed by emotional arguments.", dim: "TF", key: 1 },
  { id: 4, step: 1, text: "You struggle with deadlines.", dim: "JP", key: -1 },
  { id: 5, step: 1, text: "You rarely feel insecure.", dim: "AT", key: 1 },
  { id: 6, step: 1, text: "You avoid making phone calls.", dim: "EI", key: -1 },

  // Step 2
  { id: 7, step: 2, text: "You enjoy debating ethical dilemmas.", dim: "SN", key: 1 },
  { id: 8, step: 2, text: "You prioritize being sensitive over being completely honest.", dim: "TF", key: -1 },
  { id: 9, step: 2, text: "Your living and working spaces are clean and organized.", dim: "JP", key: 1 },
  { id: 10, step: 2, text: "You often feel overwhelmed.", dim: "AT", key: -1 },
  { id: 11, step: 2, text: "You enjoy participating in team-based activities.", dim: "EI", key: 1 },
  { id: 12, step: 2, text: "You enjoy experimenting with new and untested approaches.", dim: "SN", key: 1 },

  // Step 3
  { id: 13, step: 3, text: "You prioritize facts over people’s feelings when determining a course of action.", dim: "TF", key: 1 },
  { id: 14, step: 3, text: "You often allow the day to unfold without any schedule at all.", dim: "JP", key: -1 },
  { id: 15, step: 3, text: "You rarely worry about whether you make a good impression on people you meet.", dim: "AT", key: 1 },
  { id: 16, step: 3, text: "You feel comfortable just walking up to someone you find interesting and striking up a conversation.", dim: "EI", key: 1 },
  { id: 17, step: 3, text: "You are not too interested in discussions about various interpretations of creative works.", dim: "SN", key: -1 },
  { id: 18, step: 3, text: "People’s stories and emotions speak louder to you than numbers or data.", dim: "TF", key: -1 },

  // Step 4
  { id: 19, step: 4, text: "You actively seek out new experiences and knowledge areas to explore.", dim: "SN", key: 1 },
  { id: 20, step: 4, text: "You are prone to worrying that things will take a turn for the worse.", dim: "AT", key: -1 },
  { id: 21, step: 4, text: "You enjoy solitary hobbies or activities more than group ones.", dim: "EI", key: -1 },
  { id: 22, step: 4, text: "You cannot imagine yourself writing fictional stories for a living.", dim: "SN", key: -1 },
  { id: 23, step: 4, text: "You favor efficiency in decisions, even if it means disregarding some emotional aspects.", dim: "TF", key: 1 },
  { id: 24, step: 4, text: "You prefer to do your chores before allowing yourself to relax.", dim: "JP", key: 1 },

  // Step 5
  { id: 25, step: 5, text: "In disagreements, you prioritize proving your point over preserving the feelings of others.", dim: "TF", key: 1 },
  { id: 26, step: 5, text: "You usually wait for others to introduce themselves first at social gatherings.", dim: "EI", key: -1 },
  { id: 27, step: 5, text: "Your mood can change very quickly.", dim: "AT", key: -1 },
  { id: 28, step: 5, text: "You usually feel more persuaded by what resonates emotionally with you than by factual arguments.", dim: "TF", key: -1 },
  { id: 29, step: 5, text: "You often end up doing things at the last possible moment.", dim: "JP", key: -1 },
  { id: 30, step: 5, text: "You prioritize and plan tasks effectively, often completing them well before the deadline.", dim: "JP", key: 1 },

  // Step 6
  { id: 31, step: 6, text: "You usually prefer to be around others rather than on your own.", dim: "EI", key: 1 },
  { id: 32, step: 6, text: "You become bored or lose interest when the discussion gets highly theoretical.", dim: "SN", key: -1 },
  { id: 33, step: 6, text: "When facts and feelings conflict, you usually find yourself following your heart.", dim: "TF", key: -1 },
  { id: 34, step: 6, text: "You find it challenging to maintain a consistent work or study schedule.", dim: "JP", key: -1 },
  { id: 35, step: 6, text: "You rarely second-guess the choices that you have made.", dim: "AT", key: 1 },
  { id: 36, step: 6, text: "Your friends would describe you as lively and outgoing.", dim: "EI", key: 1 },

  // Step 7
  { id: 37, step: 7, text: "You are drawn to various forms of creative expression, such as writing.", dim: "SN", key: 1 },
  { id: 38, step: 7, text: "You usually base your choices on objective facts rather than emotional impressions.", dim: "TF", key: 1 },
  { id: 39, step: 7, text: "You like to have a to-do list for each day.", dim: "JP", key: 1 },
  { id: 40, step: 7, text: "You usually stay calm, even under a lot of pressure.", dim: "AT", key: 1 },
  { id: 41, step: 7, text: "You find the idea of networking or promoting yourself to strangers very daunting.", dim: "EI", key: -1 },
  { id: 42, step: 7, text: "Complex and novel ideas excite you more than simple and straightforward ones.", dim: "SN", key: 1 },

  // Step 8
  { id: 43, step: 8, text: "You can easily connect with people you have just met.", dim: "EI", key: 1 },
  { id: 44, step: 8, text: "If your plans are interrupted, your top priority is to get back on track as soon as possible.", dim: "JP", key: 1 },
  { id: 45, step: 8, text: "You are still bothered by mistakes that you made a long time ago.", dim: "AT", key: -1 },
  { id: 46, step: 8, text: "You are not too interested in discussing theories on what the world could look like in the future.", dim: "SN", key: -1 },
  { id: 47, step: 8, text: "Your emotions control you more than you control them.", dim: "AT", key: -1 },
  { id: 48, step: 8, text: "When making decisions, you focus more on how the affected people might feel than on what is most logical or efficient.", dim: "TF", key: -1 },

  // Step 9
  { id: 49, step: 9, text: "Your personal work style is closer to spontaneous bursts of energy than organized and consistent efforts.", dim: "JP", key: -1 },
  { id: 50, step: 9, text: "When someone thinks highly of you, you wonder how long it will take them to feel disappointed in you.", dim: "AT", key: -1 },
  { id: 51, step: 9, text: "You would love a job that requires you to work alone most of the time.", dim: "EI", key: -1 },
  { id: 52, step: 9, text: "You believe that pondering abstract philosophical questions is a waste of time.", dim: "SN", key: -1 },
  { id: 53, step: 9, text: "You feel more drawn to busy, bustling atmospheres than to quiet, intimate places.", dim: "EI", key: 1 },
  { id: 54, step: 9, text: "If a decision feels right to you, you often act on it without needing further proof.", dim: "TF", key: -1 },

  // Step 10
  { id: 55, step: 10, text: "Even a small mistake can cause you to doubt your overall abilities and knowledge.", dim: "AT", key: -1 },
  { id: 56, step: 10, text: "You complete things methodically without skipping over any steps.", dim: "JP", key: 1 },
  { id: 57, step: 10, text: "You prefer tasks that require you to come up with creative solutions rather than follow concrete steps.", dim: "SN", key: 1 },
  { id: 58, step: 10, text: "You are more likely to rely on emotional intuition than logical reasoning when making a choice.", dim: "TF", key: -1 },
  { id: 59, step: 10, text: "You like to use organizing tools like schedules and lists.", dim: "JP", key: 1 },
  { id: 60, step: 10, text: "You feel confident that things will work out for you.", dim: "AT", key: 1 },
];

export const PER_STEP = 6;
export const STEPS = 10;

// All 16 Personalities with concise, student-friendly one-pager content
export const PROFILES = {
  INTJ: {
    code: "INTJ",
    name: "Architect",
    role: "analysts",
    tagline: "Imaginative and strategic thinkers, with a plan for everything.",
    quote: {
      text: "Thought constitutes the greatness of man. Man is a reed, the feeblest thing in nature, but he is a thinking reed.",
      author: "Blaise Pascal",
    },
    summary:
      "Architects are intellectually curious tacticians who approach life like a giant game of chess. Driven by rationality and self-improvement, you strive to master whatever sparks your interest and build systems that stand the test of time.",
    strengths: [
      { title: "Strategic Vision", desc: "You anticipate obstacles several moves ahead and design clear, long-term plans to win." },
      { title: "Deep Focus", desc: "You immerse yourself completely in complex subjects and master their underlying principles." },
      { title: "Fiercely Independent", desc: "You trust your own intellect and logic over traditional or arbitrary conventions." },
      { title: "Determined & Resilient", desc: "You welcome ambitious intellectual challenges and hold very high standards for your work." },
    ],
    weaknesses: [
      { title: "Overly Critical", desc: "You hold others and yourself to exacting standards, occasionally coming across as impatient." },
      { title: "Dismissive of Emotions", desc: "You can prioritize pure logic and efficiency over social pleasantries or emotional nuance." },
      { title: "Social Fatigue", desc: "Small talk and unstructured group work drain you quickly; you need solo time to recharge." },
    ],
    studyStyle: [
      "Create a quiet, orderly study zone and work in deep, uninterrupted 90-minute blocks.",
      "Understand foundational theories and formulas before attempting practice questions.",
      "Track your syllabus milestones with a structured roadmap rather than cramming.",
    ],
    subjects: ["Further Mathematics", "Physics", "Computer Science", "Chemistry", "Economics"],
    careers: ["Software Architect & AI Researcher", "Data Scientist", "Biomedical Engineer", "Financial Analyst & Actuary", "Research Scientist", "Management Consultant"],
    relationships:
      "In friendships and romantic connections, Architects value depth, honesty, and intellectual spark over popularity or small talk. You would rather maintain two meaningful bonds than twenty shallow ones. While you rarely play emotional games, you show care through loyal support, solving problems, and helping the people you value achieve their goals.",
  },

  INTP: {
    code: "INTP",
    name: "Logician",
    role: "analysts",
    tagline: "Innovative inventors with an unquenchable thirst for knowledge.",
    quote: {
      text: "Learn from yesterday, live for today, hope for tomorrow. The important thing is not to stop questioning.",
      author: "Albert Einstein",
    },
    summary:
      "Logicians are curious, analytical philosophers of systems. You love spotting inconsistencies, dissecting abstract concepts, and developing original solutions to problems that baffle others.",
    strengths: [
      { title: "Analytical Brilliance", desc: "You break complex problems down into their fundamental components with effortless logic." },
      { title: "Original Thinking", desc: "You view the world from unconventional angles and invent novel perspectives." },
      { title: "Open-Minded", desc: "You readily discard your own assumptions whenever solid counter-evidence is presented." },
      { title: "Intellectually Driven", desc: "You explore subjects purely for the joy of discovering how the universe works." },
    ],
    weaknesses: [
      { title: "Second-Guessing", desc: "You can get trapped in analysis paralysis, polishing ideas endlessly without finishing." },
      { title: "Bored by Routine", desc: "Once a concept is mentally solved, executing the mundane details feels tedious." },
      { title: "Emotionally Detached", desc: "You may overlook emotional cues when absorbed in theoretical debates." },
    ],
    studyStyle: [
      "Use first-principles thinking to grasp concepts from scratch rather than memorizing notes.",
      "Set micro-deadlines to keep momentum going on long revision projects.",
      "Teach concepts aloud to verify you actually understand the mechanics.",
    ],
    subjects: ["Mathematics", "Computer Science", "Physics", "Philosophy & Global Perspectives", "Economics"],
    careers: ["AI & Machine Learning Engineer", "Theoretical Physicist", "Systems Architect", "Cybersecurity Researcher", "Game Developer", "Academic Researcher"],
    relationships:
      "Logicians connect best through shared curiosities, spirited debates, and playful intellectual banter. You are delightfully authentic and low-maintenance with close friends. You appreciate partners and peers who give you space for solitary thinking and who challenge your mind without taking disagreements personally.",
  },

  ENTJ: {
    code: "ENTJ",
    name: "Commander",
    role: "analysts",
    tagline: "Bold, imaginative and strong-willed leaders, always finding a way – or making one.",
    quote: {
      text: "I am not afraid of an army of lions led by a sheep; I am afraid of an army of sheep led by a lion.",
      author: "Alexander the Great",
    },
    summary:
      "Commanders are natural-born leaders who turn ambitious goals into organized realities. Decisive, charismatic, and strategic, you thrive when taking charge of complex challenges and optimizing teams for peak performance.",
    strengths: [
      { title: "Natural Leadership", desc: "You organize people and resources toward common objectives with clarity and authority." },
      { title: "Decisive Action", desc: "You evaluate risks swiftly, make tough calls, and move forward without hesitation." },
      { title: "Strategic Efficiency", desc: "You spot bottlenecks instantly and restructure workflows to save time and energy." },
      { title: "High Ambition", desc: "You push boundaries, aiming for excellence in exams, sports, and future careers." },
    ],
    weaknesses: [
      { title: "Impatience", desc: "You can become frustrated when classmates or teams work slower than your pace." },
      { title: "Blunt Feedback", desc: "Your direct communication can sometimes be perceived as intimidating or overly sharp." },
      { title: "Workaholic Habits", desc: "You can prioritize achieving goals over resting, risking mental burnout." },
    ],
    studyStyle: [
      "Run targeted study sprints with strict timers and measurable score targets.",
      "Lead a focused peer study group where members hold each other accountable.",
      "Compete against past exam boundary scores to keep your competitive drive high.",
    ],
    subjects: ["Economics", "Business Studies", "Mathematics", "Law", "History", "Physics"],
    careers: ["Tech Startup Founder", "Management Consultant", "Corporate Lawyer", "Operations Director", "Investment Banker", "Civil Services Lead (CSS)"],
    relationships:
      "Commanders are direct, enthusiastic, and intensely loyal in their relationships. You inspire and push your partners and friends to grow and achieve their highest potential. You respect people who stand their ground, speak candidly, and share your appetite for personal ambition and adventure.",
  },

  ENTP: {
    code: "ENTP",
    name: "Debater",
    role: "analysts",
    tagline: "Smart and curious thinkers who cannot resist an intellectual challenge.",
    quote: {
      text: "Follow the path of the unsafe, independent thinker. Expose your ideas to the dangers of controversy.",
      author: "Thomas J. Watson",
    },
    summary:
      "Debaters are quick-witted mental gymnasts who thrive on verbal sparring, brainstorming innovative solutions, and testing the boundaries of conventional thinking. You love exploring possibilities from every conceivable angle.",
    strengths: [
      { title: "Rapid Mind", desc: "You absorb complex information in minutes and synthesize unexpected connections." },
      { title: "Fearless Innovation", desc: "You are not intimidated by orthodox beliefs and eagerly champion fresh approaches." },
      { title: "Charismatic Energy", desc: "Your lively curiosity and humor make group discussions captivating." },
      { title: "Resourceful", desc: "You adapt effortlessly when situations change, always finding a clever workaround." },
    ],
    weaknesses: [
      { title: "Argumentative", desc: "You may debate points just for intellectual fun, unintentionally irritating peers." },
      { title: "Difficulty Finishing", desc: "Starting exciting new projects is exhilarating, but routine execution can bore you." },
      { title: "Procrastination", desc: "You often leave revision until the final deadline, relying on last-minute brilliance." },
    ],
    studyStyle: [
      "Gamify revision by turning past papers into high-speed quizzes and flashcard sprints.",
      "Engage in lively debate or teach tricky topics to friends to cement your memory.",
      "Switch subjects frequently to keep your brain stimulated and prevent boredom.",
    ],
    subjects: ["Economics", "Global Perspectives", "Computer Science", "History", "English Language", "Mathematics"],
    careers: ["Entrepreneur & Product Strategist", "Venture Capitalist", "Creative Director", "Barrister / Trial Lawyer", "Marketing Strategist", "Journalist & Host"],
    relationships:
      "In romance and friendship, Debaters bring excitement, intellectual sparks, and playful banter. You need connections that are dynamic and open to exploring the world. You bond deeply with people who can engage in late-night philosophical discussions, laugh at your witty jokes, and not take your contrarian arguments personally.",
  },

  INFJ: {
    code: "INFJ",
    name: "Advocate",
    role: "diplomats",
    tagline: "Quiet and mystical, yet very inspiring and tireless idealists.",
    quote: {
      text: "The privilege of a lifetime is to become who you truly are.",
      author: "Carl Jung",
    },
    summary:
      "Advocates are rare, thoughtful idealists with a profound sense of personal integrity. Guided by deep empathy and quiet determination, you seek meaningful purpose in your education and strive to leave the world better than you found it.",
    strengths: [
      { title: "Deep Empathy", desc: "You sense how others feel before they even speak, offering quiet, comforting support." },
      { title: "Principled Vision", desc: "You are driven by authentic values, ethical convictions, and long-term purpose." },
      { title: "Insightful Intuition", desc: "You read between the lines and understand complex human motivations intuitively." },
      { title: "Dedicated & Conscientious", desc: "When working for a cause or goal you believe in, your persistence is unmatched." },
    ],
    weaknesses: [
      { title: "Burnout Prone", desc: "You give so much emotional energy to others that you frequently neglect self-care." },
      { title: "Perfectionism", desc: "You hold an exacting vision in your head that reality can struggle to match." },
      { title: "Guarded", desc: "You can keep your innermost thoughts strictly hidden, even from close friends." },
    ],
    studyStyle: [
      "Connect every topic you study to real human impact or meaningful global questions.",
      "Revise in quiet, aesthetic spaces where you can write reflective, structured summaries.",
      "Guard your energy by spacing out your revision and stepping away from social drama.",
    ],
    subjects: ["Psychology", "English Literature", "Biology", "Sociology", "History", "Global Perspectives"],
    careers: ["Clinical Psychologist / Psychiatrist", "Author & Editor", "Human Rights Advocate", "Pediatric Doctor", "Education Consultant", "Non-Profit Director"],
    relationships:
      "Advocates seek soulful, deeply authentic relationships. You crave emotional intimacy, mutual vulnerability, and intellectual compatibility. You are devoted, thoughtful, and intuitively attentive to your partner's emotional needs, flourishing in partnerships that are calm, gentle, and rooted in shared ethical values.",
  },

  INFP: {
    code: "INFP",
    name: "Mediator",
    role: "diplomats",
    tagline: "Poetic, kind and altruistic people, always eager to help a good cause.",
    quote: {
      text: "Not all those who wander are lost.",
      author: "J.R.R. Tolkien",
    },
    summary:
      "Mediators are compassionate, imaginative dreamers guided by their personal values and creative expression. Quiet and gentle on the surface, you possess an inner flame of artistic passion and a genuine desire to uplift others.",
    strengths: [
      { title: "Creative Imagination", desc: "You express ideas through rich storytelling, art, metaphor, and visual concepts." },
      { title: "Compassionate Heart", desc: "You listen without judging, creating a safe emotional space for friends and peers." },
      { title: "Open-Minded & Tolerant", desc: "You celebrate individuality and embrace people from all walks of life." },
      { title: "Passionate Integrity", desc: "You stand up courageously for what is right when someone is treated unfairly." },
    ],
    weaknesses: [
      { title: "Overly Self-Critical", desc: "You can be intensely hard on yourself when your performance falls short of your ideals." },
      { title: "Conflict Avoidant", desc: "You despise confrontation, sometimes keeping quiet instead of asserting your needs." },
      { title: "Unstructured Habits", desc: "Strict schedules feel suffocating, leading to last-minute study panics." },
    ],
    studyStyle: [
      "Use colorful Cornell notebooks, diagrams, and personalized mind maps to make notes beautiful.",
      "Study in inspiring spots like cozy libraries, parks, or quiet cafes with pleasant background sound.",
      "Break intimidating revision syllabi into small, emotionally manageable creative goals.",
    ],
    subjects: ["English Literature", "Art & Design", "Psychology", "Environmental Management", "Urdu", "Sociology"],
    careers: ["Author & Screenwriter", "UI/UX & Graphic Designer", "Counselor & Therapist", "Environmental Advocate", "Multimedia Producer", "Teacher of Languages / Arts"],
    relationships:
      "Mediators are romantic, devoted, and emotionally generous partners. You seek a genuine soul connection built on mutual understanding, poetry, and shared dreams. You show love through creative surprises, deep listening, and gentle encouragement, valuing loyalty and unconditional acceptance above all else.",
  },

  ENFJ: {
    code: "ENFJ",
    name: "Protagonist",
    role: "diplomats",
    tagline: "Charismatic and inspiring leaders, able to mesmerize their listeners.",
    quote: {
      text: "When the whole world is silent, even one voice becomes powerful.",
      author: "Malala Yousafzai",
    },
    summary:
      "Protagonists are warm, vocal champions of people who naturally motivate others toward positive growth. Charismatic and empathetic, you love helping friends, classmates, and community members discover their own potential.",
    strengths: [
      { title: "Charismatic Communication", desc: "You express ideas with warmth and conviction that rally people together." },
      { title: "Natural Empathy", desc: "You sense group dynamics intuitively and know how to make everyone feel included." },
      { title: "Reliable & Dedicated", desc: "When you promise to help a friend or organize a school project, you deliver." },
      { title: "Inspiring Mentor", desc: "You bring out the best in peers, encouraging their unique gifts and talents." },
    ],
    weaknesses: [
      { title: "Over-Involved", desc: "You can take on other people's problems as your own, draining your own energy." },
      { title: "Sensitive to Approval", desc: "Criticism or feeling disliked by someone can weigh heavily on your mood." },
      { title: "Indecisive on Tough Cuts", desc: "Your desire to keep everyone happy can delay tough, dispassionate decisions." },
    ],
    studyStyle: [
      "Form active study circles where you explain difficult concepts aloud to help classmates learn.",
      "Keep an upbeat, structured weekly timetable to balance academics with social commitments.",
      "Use presentations and discussion to convert passive reading into active, spoken recall.",
    ],
    subjects: ["Sociology", "Business Studies", "English Language", "Biology", "Global Perspectives", "History"],
    careers: ["School Principal & Education Leader", "Public Health Director", "Diplomat & Civil Servant (CSS)", "Human Resources Director", "Non-Profit Executive", "Media Host"],
    relationships:
      "Protagonists bring warmth, romantic devotion, and boundless encouragement to relationships. You put tremendous care into celebrating your partner's milestones and creating thoughtful memories. You blossom when paired with someone who genuinely appreciates your giving nature and reminds you to take care of yourself too.",
  },

  ENFP: {
    code: "ENFP",
    name: "Campaigner",
    role: "diplomats",
    tagline: "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.",
    quote: {
      text: "It is never too late to be what you might have been.",
      author: "George Eliot",
    },
    summary:
      "Campaigners are vibrant, imaginative free spirits who see exciting possibilities everywhere they look. Sociable, open-hearted, and curious, your infectious enthusiasm lights up classrooms, study groups, and friendships.",
    strengths: [
      { title: "Infectious Enthusiasm", desc: "Your energy and positive outlook inspire excitement and curiosity in those around you." },
      { title: "Creative Innovation", desc: "You generate fresh ideas effortlessly, finding unexpected connections across subjects." },
      { title: "High Emotional IQ", desc: "You connect effortlessly with strangers and build warm, authentic friendships." },
      { title: "Adaptable & Flexible", desc: "You welcome surprises with an adventurous spirit, adjusting swiftly to changes." },
    ],
    weaknesses: [
      { title: "Easily Distracted", desc: "You start dozens of exciting projects, but sticking through routine revision is tough." },
      { title: "Overthinking Dynamics", desc: "You can read too much into subtle text tones or facial expressions." },
      { title: "Overcommitting", desc: "Saying yes to too many social plans can leave you exhausted before big exams." },
    ],
    studyStyle: [
      "Vary your revision methods daily: switch between podcasts, video explainers, and flashcards.",
      "Study with an enthusiastic study partner to keep energy high and prevent solitary procrastination.",
      "Use short Pomodoro sprints (25 min on, 5 min music break) to keep attention sharp.",
    ],
    subjects: ["Media Studies", "English Literature", "Business Studies", "Psychology", "Art & Design", "Sociology"],
    careers: ["Digital Content Strategist", "Brand Manager & Marketer", "Creative Director", "Journalist & Podcaster", "Youth Counselor", "Social Entrepreneur"],
    relationships:
      "Campaigners love with passion, humor, and immense curiosity. In dating and friendships, you look for deep conversations, spontaneous adventures, and emotional authenticity. You are attentive, affectionate, and constantly cheer on your partner's dreams, thriving in relationships where there is room to grow and be free.",
  },

  ISTJ: {
    code: "ISTJ",
    name: "Logistician",
    role: "sentinels",
    tagline: "Practical and fact-minded individuals, whose reliability cannot be doubted.",
    quote: {
      text: "Simplicity is the prerequisite for reliability.",
      author: "Edsger W. Dijkstra",
    },
    summary:
      "Logisticians are the bedrock of dependable integrity. Practical, thorough, and orderly, you value truth, keep your promises, and apply methodical discipline to achieve outstanding, consistent academic results.",
    strengths: [
      { title: "Unwavering Reliability", desc: "When you say you will complete an assignment or project, people know it's as good as done." },
      { title: "Methodical Order", desc: "You organize notes, files, and revision materials with meticulous attention to detail." },
      { title: "Factual Precision", desc: "You remember exact details, rules, and procedures, minimizing avoidable exam errors." },
      { title: "Calm Practicality", desc: "You remain steady and sensible during stressful exam weeks when others panic." },
    ],
    weaknesses: [
      { title: "Stubborn with Changes", desc: "Sudden shifts in syllabus or schedules can disrupt your sense of control." },
      { title: "Overly Harsh on Blunders", desc: "You expect zero errors from yourself and feel deeply frustrated when you slip." },
      { title: "Reserved with Emotions", desc: "Expressing feelings verbally doesn't come easily; you prefer practical actions." },
    ],
    studyStyle: [
      "Master the exam mark schemes line-by-line; Cambridge examiners reward your precision.",
      "Follow a structured revision planner (e.g. 1-3-7-14 day spaced intervals) on a wall calendar.",
      "Work through past papers chronologically, tracking your scores in a spreadsheet.",
    ],
    subjects: ["Accounting", "Mathematics", "Physics", "Chemistry", "Pakistan Studies", "Computer Science"],
    careers: ["Chartered Accountant (CA / ACCA)", "Civil or Structural Engineer", "Financial Auditor", "Database Administrator", "Judicial Officer / Lawyer", "Systems Quality Specialist"],
    relationships:
      "Logisticians express care through steadfast loyalty, practical assistance, and keeping their word. You may not write dramatic love letters, but you remember favorite meals, arrive on time, and build a secure, dependable foundation. In friendships and dating, you value honesty, mutual respect, and quiet consistency.",
  },

  ISFJ: {
    code: "ISFJ",
    name: "Defender",
    role: "sentinels",
    tagline: "Very dedicated and warm protectors, always ready to defend their loved ones.",
    quote: {
      text: "The best way to find yourself is to lose yourself in the service of others.",
      author: "Mahatma Gandhi",
    },
    summary:
      "Defenders are devoted, conscientious protectors who combine warm practical support with exceptional reliability. You remember every detail about the people you care about and quietly keep classrooms, families, and teams running smoothly.",
    strengths: [
      { title: "Deep Conscientiousness", desc: "You take immense pride in your duties, submitting thorough, polished schoolwork." },
      { title: "Supportive Warmth", desc: "You notice when a classmate is struggling and quietly offer notes or kind encouragement." },
      { title: "Meticulous Memory", desc: "You recall specific facts, dates, and instructions accurately under test conditions." },
      { title: "Patient & Practical", desc: "You complete repetitive tasks methodically without cutting corners." },
    ],
    weaknesses: [
      { title: "Reluctant to Say No", desc: "You overload yourself with favors for classmates, leaving little time for your own rest." },
      { title: "Takes Criticism Personally", desc: "Constructive feedback from teachers can sting and linger in your mind." },
      { title: "Bottles Up Emotions", desc: "You hide your own stress to avoid causing worry for parents or friends." },
    ],
    studyStyle: [
      "Keep clear, neat revision flashcards organized by syllabus topic and date.",
      "Review teacher lecture notes and class examples thoroughly; you excel with concrete models.",
      "Schedule deliberate downtime to prevent burnout in the final weeks before exams.",
    ],
    subjects: ["Biology", "Chemistry", "Food & Nutrition", "Accounting", "English Language", "Islamiyat"],
    careers: ["Doctor (General Practice & Pediatrics)", "Pharmacist", "Registered Nurse", "Primary / Secondary Educator", "Hospital Administrator", "Medical Laboratory Scientist"],
    relationships:
      "Defenders are devoted, attentive, and deeply thoughtful in relationships. You demonstrate affection by anticipating your partner's needs, remembering small preferences, and creating a calm, safe sanctuary. You flourish when your partner expresses genuine verbal appreciation for your generosity and provides steady emotional reassurance.",
  },

  ESTJ: {
    code: "ESTJ",
    name: "Executive",
    role: "sentinels",
    tagline: "Excellent administrators, unsurpassed at managing things – or people.",
    quote: {
      text: "Good order is the foundation of all things.",
      author: "Edmund Burke",
    },
    summary:
      "Executives are organized, clear-headed leaders who value tradition, honesty, and hard work. You excel at creating order out of chaos, establishing clear standards, and motivating groups to hit deadlines efficiently.",
    strengths: [
      { title: "Supreme Organization", desc: "You plan timetables, allocate duties, and ensure every detail is accounted for." },
      { title: "Direct & Honest", desc: "People always know where they stand with you; you value straightforward truth." },
      { title: "High Work Ethic", desc: "You lead by example, working diligently and refusing to make excuses." },
      { title: "Decisive Execution", desc: "You make logical decisions firmly and keep groups moving forward." },
    ],
    weaknesses: [
      { title: "Inflexible with Rules", desc: "You can find it difficult to accommodate unconventional or unstructured methods." },
      { title: "Blunt Expressions", desc: "Your direct remarks can sometimes inadvertently hurt more sensitive classmates." },
      { title: "Neglects Emotional Tone", desc: "Focusing solely on results can cause you to overlook team morale." },
    ],
    studyStyle: [
      "Build a concrete daily timetable and hold yourself strictly accountable to it.",
      "Take mock exams under strict timed conditions to practice pacing and accuracy.",
      "Organize study checklists by topic and check them off visibly as you master them.",
    ],
    subjects: ["Business Studies", "Accounting", "Mathematics", "Economics", "Law", "Physics"],
    careers: ["Operations & Supply Chain Director", "Financial Manager & Auditor", "Civil Services / Armed Forces Officer", "Corporate Project Manager", "School Administrator", "Commercial Banker"],
    relationships:
      "Executives approach relationships with integrity, clear commitments, and practical reliability. You value shared traditions, family values, and open communication. You show love by providing security, helping solve real-world problems, and organizing life smoothly for you and your partner.",
  },

  ESFJ: {
    code: "ESFJ",
    name: "Consul",
    role: "sentinels",
    tagline: "Extraordinarily caring, social and popular people, always eager to help.",
    quote: {
      text: "A warm smile is the universal language of kindness.",
      author: "William Arthur Ward",
    },
    summary:
      "Consuls are warm, attentive community builders who thrive on bringing people together. Conscientious and observant, you ensure harmony in your circle, support friends with genuine kindness, and respect established traditions.",
    strengths: [
      { title: "Strong Social Harmony", desc: "You excel at smoothing over tensions and making every person feel welcomed." },
      { title: "Deep Conscientiousness", desc: "You take obligations seriously and consistently support your school and community." },
      { title: "Practical Generosity", desc: "You share notes, organize study snacks, and remember friends' birthdays effortlessly." },
      { title: "Organized Teamwork", desc: "You coordinate group presentations smoothly, ensuring everyone contributes." },
    ],
    weaknesses: [
      { title: "Worry About Approval", desc: "You can fret over what peers think of you, seeking constant reassurance." },
      { title: "Vulnerable to Conflict", desc: "Arguments or cold atmospheres in friend groups distress you deeply." },
      { title: "Self-Sacrificing", desc: "You can spend so much time helping friends that your own revision is delayed." },
    ],
    studyStyle: [
      "Organize cooperative study groups where members quiz and encourage each other.",
      "Use colorful Cornell notes with clear headings and summaries to keep study sessions engaging.",
      "Set firm boundaries during exam weeks so social plans don't derail your revision time.",
    ],
    subjects: ["Business Studies", "Sociology", "Biology", "Travel & Tourism", "English Language", "Food & Nutrition"],
    careers: ["Healthcare Administrator", "Human Resources Manager", "Event Producer", "School Counselor", "Public Relations Officer", "Registered Nurse"],
    relationships:
      "Consuls are intensely affectionate, generous, and devoted partners. You love celebrating relationship milestones and creating warm, inviting experiences for the people you love. You thrive with someone who reciprocates your open warmth, values commitment, and openly expresses appreciation for your thoughtful care.",
  },

  ISTP: {
    code: "ISTP",
    name: "Virtuoso",
    role: "explorers",
    tagline: "Bold and practical experimenters, masters of all kinds of tools.",
    quote: {
      text: "I have no special talent. I am only passionately curious.",
      author: "Albert Einstein",
    },
    summary:
      "Virtuosos are calm, practical observers with a mastery of mechanics, data, and problem solving. You approach the world with cool rationalism and quiet curiosity, preferring to learn by taking things apart and building them back better.",
    strengths: [
      { title: "Calm Under Pressure", desc: "When unexpected glitches or difficult exam questions arise, you keep a cool head." },
      { title: "Practical Problem Solving", desc: "You cut straight to the core of an issue and fix it with minimum fuss." },
      { title: "Highly Adaptable", desc: "You improvise brilliantly in changing conditions and master new software quickly." },
      { title: "Observant & Curious", desc: "You notice tiny mechanical and factual nuances that others breeze past." },
    ],
    weaknesses: [
      { title: "Easily Bored by Theory", desc: "Abstract lectures that lack immediate practical use test your patience." },
      { title: "Guarded Emotions", desc: "You keep feelings closely guarded, sometimes appearing aloof or detached." },
      { title: "Dislikes Strict Control", desc: "Rigid rules and micromanagement make you want to break away." },
    ],
    studyStyle: [
      "Focus on past paper problem-solving and lab experiments rather than passive reading.",
      "Create concise cheat-sheets of formulas and practical steps for quick review.",
      "Allow yourself physical breaks and hands-on activities to keep your brain alert.",
    ],
    subjects: ["Physics", "Design & Technology", "Computer Science", "Mathematics", "Environmental Management"],
    careers: ["Mechanical or Aerospace Engineer", "Commercial Aviation Pilot", "Cybersecurity Specialist", "Game Engine Developer", "Forensic Analyst", "Automotive Technician"],
    relationships:
      "Virtuosos are relaxed, low-drama, and authentic in relationships. You show affection through actions, shared adventures, and fixing things for your partner rather than through flowery speeches. You need a partner who respects your independent streak and enjoys spontaneous fun without pressure.",
  },

  ISFP: {
    code: "ISFP",
    name: "Adventurer",
    role: "explorers",
    tagline: "Flexible and charming artists, always ready to explore and experience something new.",
    quote: {
      text: "To live is the rarest thing in the world. Most people exist, that is all.",
      author: "Oscar Wilde",
    },
    summary:
      "Adventurers are gentle, creative free spirits who experience life with deep sensory richness. You express your personal identity through design, actions, and passions, bringing warmth, style, and quiet authenticity to everything you do.",
    strengths: [
      { title: "Artistic Sensitivity", desc: "You have a natural eye for aesthetics, harmony, colors, and emotional resonance." },
      { title: "Gentle Empathy", desc: "You treat people with genuine kindness, respecting everyone's unique journey." },
      { title: "Lives in the Moment", desc: "You appreciate the beauty of the present and take joy in small, everyday experiences." },
      { title: "Open-Minded & Tolerant", desc: "You rarely pass judgment, welcoming different viewpoints and lifestyles." },
    ],
    weaknesses: [
      { title: "Averse to Rigid Plans", desc: "Detailed 6-month revision plans feel restrictive; you prefer following inspiration." },
      { title: "Vulnerable to Stress", desc: "High-pressure, hyper-competitive exam halls can overwhelm your calm demeanor." },
      { title: "Fiercely Guarded", desc: "When hurt, you retreat into your shell rather than voicing frustration." },
    ],
    studyStyle: [
      "Incorporate visual art, diagrams, and color into your notes to make revision memorable.",
      "Study in comfortable, aesthetically pleasing spaces with natural light and calming music.",
      "Focus on one topic at a time rather than overwhelming yourself with a giant syllabus.",
    ],
    subjects: ["Art & Design", "Design & Technology", "Biology", "Environmental Management", "Media Studies", "Food & Nutrition"],
    careers: ["UI/UX & Product Designer", "Architect & Interior Designer", "Veterinarian & Animal Specialist", "Fashion Stylist", "Digital Animator & Illustrator", "Landscape Architect"],
    relationships:
      "Adventurers are gentle, romantic, and deeply considerate partners. You express love through heartfelt gestures, aesthetic gifts, and quiet loyalty. You crave an emotional space where you can be your genuine, unmasked self without fear of criticism or demanding expectations.",
  },

  ESTP: {
    code: "ESTP",
    name: "Entrepreneur",
    role: "explorers",
    tagline: "Smart, energetic and very perceptive people, who truly enjoy living on the edge.",
    quote: {
      text: "Life is either a daring adventure or nothing at all.",
      author: "Helen Keller",
    },
    summary:
      "Entrepreneurs are dynamic, action-oriented go-getters who thrive in fast-paced environments. Perceptive and bold, you read social situations instantly, make fast decisions, and turn theoretical ideas into tangible results.",
    strengths: [
      { title: "Bold & Decisive", desc: "You seize opportunities fearlessly and make swift, practical choices under pressure." },
      { title: "High Social Acuity", desc: "You read body language and mood shifts immediately, communicating with charisma." },
      { title: "Resourceful Realist", desc: "You tackle problems with hands-on common sense rather than endless academic debate." },
      { title: "Thrives in Dynamic Chaos", desc: "Fast-moving situations energize you, bringing out your best competitive spirit." },
    ],
    weaknesses: [
      { title: "Impatient with Theory", desc: "Abstract, slow-paced lectures feel tedious; you want to get straight to action." },
      { title: "Prone to Last-Minute Cramming", desc: "You often leave revision until right before exam day, trusting your wits to pull you through." },
      { title: "Risk-Taking Impulsiveness", desc: "You may jump into decisions before considering long-term consequences." },
    ],
    studyStyle: [
      "Use high-speed quiz sprints (like VCS Maths Sprint) to turn revision into a game.",
      "Study in short, focused 20-minute bursts with active physical breaks in between.",
      "Focus heavily on past papers: practicing real questions is far more effective for you than reading textbooks.",
    ],
    subjects: ["Business Studies", "Physical Education", "Economics", "Physics", "Design & Technology"],
    careers: ["Entrepreneur & Business Founder", "Commercial Pilot", "Real Estate Specialist", "Emergency Medical Paramedic", "Sports Director", "Sales & Negotiations Executive"],
    relationships:
      "Entrepreneurs bring spontaneity, energy, and excitement into romance and friendships. Life with you is never boring; you love trying new activities, traveling, and sharing laughs. You bond best with partners who are self-confident, adaptable, and enjoy the thrill of the present moment.",
  },

  ESFP: {
    code: "ESFP",
    name: "Entertainer",
    role: "explorers",
    tagline: "Spontaneous, energetic and enthusiastic people – life is never boring around them.",
    quote: {
      text: "The most wasted of all days is one without laughter.",
      author: "Nicolas Chamfort",
    },
    summary:
      "Entertainers are vibrant, affectionate performers who bring warmth, humor, and joy wherever they go. Generous and social, you live fully in the moment and help classmates and friends celebrate the bright side of life.",
    strengths: [
      { title: "Social Magnetism", desc: "Your humor, warmth, and vibrant spirit put people instantly at ease." },
      { title: "Practical & Observant", desc: "You notice real-world details and react with quick, helpful common sense." },
      { title: "Generous Heart", desc: "You share your time, food, and resources generously, making others smile." },
      { title: "Adaptable & Playful", desc: "You handle unexpected events with a smile and turn boring chores into games." },
    ],
    weaknesses: [
      { title: "Struggles with Long Planning", desc: "Multi-month revision plans feel tedious; you live day-to-day." },
      { title: "Conflict Avoidant", desc: "You dislike tense atmospheres and may evade serious issues rather than addressing them." },
      { title: "Easily Overwhelmed by Pure Theory", desc: "Abstract topics need tangible, human examples for you to stay engaged." },
    ],
    studyStyle: [
      "Revise with lively classmates where you can discuss, quiz, and laugh together.",
      "Create funny acronyms, songs, and colorful stories to memorize tricky definitions.",
      "Break long study days into rewarding chunks with fun music and social breaks.",
    ],
    subjects: ["Physical Education", "Travel & Tourism", "Business Studies", "Drama", "Food & Nutrition", "Media Studies"],
    careers: ["Event Producer & Hospitality Lead", "Public Relations Specialist", "Performing Artist & Host", "Fitness Coach & Physiotherapist", "Customer Experience Director", "Early Childhood Educator"],
    relationships:
      "Entertainers love with warmth, open affection, and immense fun. You show your feelings openly, shower your partner with surprises, and bring joy into everyday routines. You flourish with someone who values your playful nature, shares social adventures with you, and offers steady, grounding support when life gets hectic.",
  },
};

// Computes 5-dimension scores and returns full 16Personalities profile
export const scoreTraits = (answers) => {
  const totals = { EI: 0, SN: 0, TF: 0, JP: 0, AT: 0 };
  const counts = { EI: 0, SN: 0, TF: 0, JP: 0, AT: 0 };

  QUESTIONS.forEach((q) => {
    const val = answers[q.id];
    if (typeof val === "number") {
      totals[q.dim] += val * q.key;
      counts[q.dim] += 1;
    }
  });

  const pcts = {};
  Object.keys(totals).forEach((dim) => {
    const raw = totals[dim];
    const maxRaw = (counts[dim] || 12) * 3;
    const norm = Math.round(((raw + maxRaw) / (maxRaw * 2)) * 100);
    pcts[dim] = Math.max(0, Math.min(100, norm));
  });

  const eOrI = pcts.EI >= 50 ? "E" : "I";
  const nOrS = pcts.SN >= 50 ? "N" : "S";
  const tOrF = pcts.TF >= 50 ? "T" : "F";
  const jOrP = pcts.JP >= 50 ? "J" : "P";
  const aOrT = pcts.AT >= 50 ? "A" : "T";

  const code = `${eOrI}${nOrS}${tOrF}${jOrP}`;
  const fullCode = `${code}-${aOrT}`;
  const profile = PROFILES[code] || PROFILES.INTJ;
  const role = ROLES[profile.role];

  const traits = [
    {
      id: "EI",
      name: "Mind",
      left: { code: "E", label: "Extraverted", pct: pcts.EI },
      right: { code: "I", label: "Introverted", pct: 100 - pcts.EI },
      dominant: eOrI,
      strength: eOrI === "E" ? pcts.EI : 100 - pcts.EI,
      desc: eOrI === "E" ? DIMENSIONS.EI.high.desc : DIMENSIONS.EI.low.desc,
    },
    {
      id: "SN",
      name: "Energy",
      left: { code: "N", label: "Intuitive", pct: pcts.SN },
      right: { code: "S", label: "Observant", pct: 100 - pcts.SN },
      dominant: nOrS,
      strength: nOrS === "N" ? pcts.SN : 100 - pcts.SN,
      desc: nOrS === "N" ? DIMENSIONS.SN.high.desc : DIMENSIONS.SN.low.desc,
    },
    {
      id: "TF",
      name: "Nature",
      left: { code: "T", label: "Thinking", pct: pcts.TF },
      right: { code: "F", label: "Feeling", pct: 100 - pcts.TF },
      dominant: tOrF,
      strength: tOrF === "T" ? pcts.TF : 100 - pcts.TF,
      desc: tOrF === "T" ? DIMENSIONS.TF.high.desc : DIMENSIONS.TF.low.desc,
    },
    {
      id: "JP",
      name: "Tactics",
      left: { code: "J", label: "Judging", pct: pcts.JP },
      right: { code: "P", label: "Prospecting", pct: 100 - pcts.JP },
      dominant: jOrP,
      strength: jOrP === "J" ? pcts.JP : 100 - pcts.JP,
      desc: jOrP === "J" ? DIMENSIONS.JP.high.desc : DIMENSIONS.JP.low.desc,
    },
    {
      id: "AT",
      name: "Identity",
      left: { code: "A", label: "Assertive", pct: pcts.AT },
      right: { code: "T", label: "Turbulent", pct: 100 - pcts.AT },
      dominant: aOrT,
      strength: aOrT === "A" ? pcts.AT : 100 - pcts.AT,
      desc: aOrT === "A" ? DIMENSIONS.AT.high.desc : DIMENSIONS.AT.low.desc,
    },
  ];

  return {
    code,
    identity: aOrT,
    fullCode,
    profile,
    role,
    traits,
    answeredCount: Object.keys(answers).length,
  };
};
