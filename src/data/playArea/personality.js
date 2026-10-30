// VCS Personality Test — 100 original statements on the five broad traits
// psychologists call the "Big Five" (a free, research-based model). Wording is
// VCS's own, written for O / A Level students.
//
// Each statement: [id, text, trait, key]. key +1 = agreeing raises the trait,
// key -1 = agreeing lowers it. Answers run +3 (agree strongly) to -3 (disagree
// strongly). Every trait has 20 statements, 10 each way, so a trait score is
// -60..60, shown as 0-100%.

export const TRAITS = {
  E: {
    name: "Social energy",
    high: { label: "Outgoing", color: "amber" },
    low: { label: "Reflective", color: "cyan" },
  },
  O: {
    name: "Curiosity",
    high: { label: "Imaginative", color: "violet" },
    low: { label: "Practical", color: "emerald" },
  },
  C: {
    name: "Organisation",
    high: { label: "Planner", color: "indigo" },
    low: { label: "Flexible", color: "amber" },
  },
  A: {
    name: "Teamwork style",
    high: { label: "Warm-hearted", color: "rose" },
    low: { label: "Straight-talking", color: "cyan" },
  },
  S: {
    name: "Handling pressure",
    high: { label: "Steady", color: "emerald" },
    low: { label: "Sensitive", color: "violet" },
  },
};

export const TRAIT_ORDER = ["E", "O", "C", "A", "S"];

const E = [
  ["You feel full of energy after spending time with a big group of friends.", 1],
  ["In a new class, you are usually the one who starts talking first.", 1],
  ["You enjoy being in the spotlight at school events.", 1],
  ["You like presenting your ideas in front of the whole class.", 1],
  ["You make new friends quickly when you join a new group.", 1],
  ["You would rather revise with friends than revise alone.", 1],
  ["You love taking part in debates, quizzes or stage shows.", 1],
  ["People who know you would call you chatty and lively.", 1],
  ["At weddings and family gatherings, you happily chat with relatives you barely know.", 1],
  ["Your ideal weekend is full of plans with other people.", 1],
  ["After a busy day around people, you need quiet time alone to recharge.", -1],
  ["In group discussions, you would rather listen than speak.", -1],
  ["You would rather send a text than talk on the phone.", -1],
  ["You feel uneasy when a teacher picks you to answer in front of everyone.", -1],
  ["Your favourite hobbies are ones you do by yourself, like reading, drawing or gaming.", -1],
  ["You prefer two or three close friends to a large circle.", -1],
  ["In a room full of strangers, you wait for someone else to say hello first.", -1],
  ["Crowded, noisy places wear you out quickly.", -1],
  ["You think things through quietly before you share them.", -1],
  ["You'd be happy in a career spent mostly working quietly by yourself.", -1],
];

const O = [
  ["You often read or watch videos about topics that are not in your syllabus.", 1],
  ["In class, you are often the one asking \"why?\" or \"what if?\".", 1],
  ["You like imagining the inventions and cities of the future.", 1],
  ["A painting, poem or piece of music can move you deeply.", 1],
  ["You enjoy trying new foods, new places and new ways of doing things.", 1],
  ["You enjoy problems that have more than one possible answer.", 1],
  ["Ideas for stories, inventions or projects pop into your head often.", 1],
  ["You enjoy talking about big questions about life, science and society.", 1],
  ["You like spotting links between different subjects, like physics and music.", 1],
  ["Unusual ideas excite you more than familiar ones.", 1],
  ["You trust proven facts more than new theories.", -1],
  ["If a method works, you see no reason to change it.", -1],
  ["Long talks about ideas with no practical use bore you.", -1],
  ["You prefer subjects where answers are clearly right or wrong.", -1],
  ["Daydreaming feels like a waste of time to you.", -1],
  ["You would rather copy a method that works than invent your own.", -1],
  ["Poetry and modern art don't really interest you.", -1],
  ["You prefer a familiar routine to trying something new.", -1],
  ["You like instructions to be exact, step by step.", -1],
  ["You rarely wonder how everyday things could be done differently.", -1],
];

const C = [
  ["You write your tasks down in a planner, diary or app.", 1],
  ["You usually finish homework well before it is due.", 1],
  ["Your bag, desk and notes are neat and well organised.", 1],
  ["Once you start a task, you finish it before moving on to the next.", 1],
  ["You plan your exam revision weeks in advance.", 1],
  ["You check your answers carefully before handing in a paper.", 1],
  ["You keep your promises and arrive on time.", 1],
  ["You get your school things ready the night before.", 1],
  ["You set goals for yourself and track how you are doing.", 1],
  ["You can make yourself study even when you don't feel like it.", 1],
  ["Homework often gets done late at night just before it is due.", -1],
  ["Your study timetables usually fall apart within a week.", -1],
  ["You often misplace your notes, books or charger.", -1],
  ["You would rather go with the flow than make plans.", -1],
  ["You study only when you are in the mood.", -1],
  ["Your phone often pulls you away when you should be studying.", -1],
  ["You sometimes skip steps just to finish faster.", -1],
  ["You start lots of projects but finish only a few.", -1],
  ["Rules and fixed schedules feel boring to you.", -1],
  ["You forget deadlines unless someone reminds you.", -1],
];

const A = [
  ["You can tell quickly when a friend is upset, even if they say nothing.", 1],
  ["You go out of your way to help classmates who are struggling.", 1],
  ["Before you decide something, you think about how it will affect others.", 1],
  ["You find it easy to forgive people who have hurt you.", 1],
  ["In group projects, you care most about everyone getting along.", 1],
  ["You would rather keep the peace than win an argument.", 1],
  ["You trust people until they give you a reason not to.", 1],
  ["You are patient with younger children or classmates who learn slowly.", 1],
  ["Friends often come to you to talk about their problems.", 1],
  ["You feel truly happy when someone else wins or does well.", 1],
  ["When you disagree with someone, you keep pushing until they accept your view.", -1],
  ["You make the logical choice, even if it upsets someone.", -1],
  ["You tell people the hard truth, even when it hurts them.", -1],
  ["You enjoy competing to win more than working together.", -1],
  ["You get confused when people react emotionally to small things.", -1],
  ["You take your time before trusting someone new.", -1],
  ["When choosing a team leader, skill matters more to you than who is liked.", -1],
  ["You speak your mind even when it starts a disagreement.", -1],
  ["You keep out of other people's problems.", -1],
  ["You get impatient with people who take a long time to understand.", -1],
];

const S = [
  ["You stay calm in an exam, even when a question looks hard.", 1],
  ["You bounce back quickly after a disappointing result.", 1],
  ["You rarely feel nervous before a test.", 1],
  ["You generally feel confident about your abilities.", 1],
  ["You stay relaxed when things don't go to plan.", 1],
  ["Criticism doesn't bother you for long.", 1],
  ["You usually feel hopeful about your future.", 1],
  ["You handle pressure from school and family well.", 1],
  ["You keep your temper even when someone annoys you.", 1],
  ["You sleep well, even the night before an exam.", 1],
  ["You worry a lot about exams and results.", -1],
  ["Your feelings go up and down a lot during a single day.", -1],
  ["After one wrong answer, you start doubting the rest of your paper.", -1],
  ["You replay embarrassing moments in your head again and again.", -1],
  ["You often feel stressed by how much there is to do.", -1],
  ["You worry a lot about what other people think of you.", -1],
  ["Not knowing what will happen next makes you anxious.", -1],
  ["Small problems can feel very big to you.", -1],
  ["You get upset easily when things go wrong.", -1],
  ["You compare yourself with others and feel you are falling behind.", -1],
];

// Interleave so each page of 10 has two statements per trait, mixing
// agree-raises and agree-lowers so no page leans one way.
const BANK = { E, O, C, A, S };
const build = () => {
  const out = [];
  for (let i = 0; i < 20; i++) {
    // alternate positive (0..9) and negative (10..19) items: 0,10,1,11,...
    const idx = i % 2 === 0 ? i / 2 : 10 + (i - 1) / 2;
    // rotate trait order each round so the same trait doesn't always lead
    const order = TRAIT_ORDER.slice(i % 5).concat(TRAIT_ORDER.slice(0, i % 5));
    for (const t of order) {
      const [text, key] = BANK[t][idx];
      out.push({ id: `${t}${idx + 1}`, text, trait: t, key });
    }
  }
  return out;
};

export const QUESTIONS = build();
export const PER_STEP = 10;
export const STEPS = Math.ceil(QUESTIONS.length / PER_STEP);

// Answer scale, left to right: agree strongly ... disagree strongly.
export const SCALE = [3, 2, 1, 0, -1, -2, -3];

/** { E: 0-100, O: ..., } — percentage toward the trait's "high" side. */
export const scoreTraits = (answers) => {
  const raw = Object.fromEntries(TRAIT_ORDER.map((t) => [t, 0]));
  const count = Object.fromEntries(TRAIT_ORDER.map((t) => [t, 0]));
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (typeof v !== "number") continue;
    raw[q.trait] += v * q.key;
    count[q.trait] += 1;
  }
  return Object.fromEntries(
    TRAIT_ORDER.map((t) => {
      const max = count[t] * 3 || 1;
      return [t, Math.round(((raw[t] + max) / (2 * max)) * 100)];
    }),
  );
};

/** Which side a score leans to and how strongly. */
export const lean = (pct) => {
  const high = pct >= 50;
  const strength = high ? pct : 100 - pct;
  const band = strength >= 75 ? "strong" : strength >= 60 ? "clear" : "slight";
  return { high, strength, band };
};

// ---- Report content -------------------------------------------------------

// What each side of each trait means, for students.
export const TRAIT_TEXT = {
  E: {
    high: {
      about: "You draw energy from people. Talking things through, working in a group and being where the action is help you think and feel alive.",
      strengths: ["Speaking up and sharing ideas confidently", "Making friends and building a network quickly", "Bringing energy to group work and class discussions"],
      watch: ["Group study can turn into chatting; set a clear goal for every session", "You may rush to answer before you have thought it through"],
      study: ["Teach a topic out loud to a friend or sibling — explaining is how you learn", "Join or start a small study group with a fixed agenda", "Use short timed sprints with a quick break to chat as the reward"],
    },
    low: {
      about: "You recharge in quiet. You think deeply before you speak, prefer a few close friends, and do your best work when you can focus without interruptions.",
      strengths: ["Deep focus and concentration for long periods", "Listening carefully and noticing what others miss", "Thinking before acting, so your answers are well considered"],
      watch: ["Teachers may not see what you know; ask at least one question per class", "You may avoid asking for help when you are stuck"],
      study: ["Build a quiet, phone-free study corner of your own", "Write your thoughts out before discussions so you can share them with confidence", "Use written practice and past papers; they suit your reflective style"],
    },
  },
  O: {
    high: {
      about: "You are curious and imaginative. New ideas, big questions and creative challenges excite you, and you like to understand why things work, not just how.",
      strengths: ["Creative problem solving and original ideas", "Connecting ideas across different subjects", "Learning new and difficult topics with enthusiasm"],
      watch: ["You may lose interest in repetitive practice that exams still need", "Chasing interesting side topics can eat into revision time"],
      study: ["Use mind maps and diagrams to link ideas together", "Ask \"why does this work?\" and find the story behind each formula or event", "Reward yourself with a 'curiosity break' after finishing a set of past-paper questions"],
    },
    low: {
      about: "You are practical and down-to-earth. You like clear facts, proven methods and knowing exactly what is expected — and you get things done.",
      strengths: ["Learning facts and methods accurately", "Following instructions and mark schemes precisely", "Staying focused on what is useful and relevant"],
      watch: ["Unfamiliar or 'twisted' exam questions may throw you at first", "You may avoid creative tasks that would stretch you"],
      study: ["Learn with worked examples, then practise the same type of question many times", "Use checklists of syllabus points and tick them off", "Practise a few unusual questions every week so surprises feel normal"],
    },
  },
  C: {
    high: {
      about: "You are organised and dependable. You like plans, lists and finishing what you start, and people know they can count on you.",
      strengths: ["Planning ahead and meeting deadlines", "Steady, consistent effort over weeks and months", "Careful, accurate work with fewer silly mistakes"],
      watch: ["You may get stressed when plans change suddenly", "Perfectionism can make you spend too long on one task"],
      study: ["Make a revision timetable that counts back from your exam dates", "Set a time limit for each task so perfection doesn't slow you down", "Keep a 'mistakes notebook' and review it weekly"],
    },
    low: {
      about: "You are flexible and spontaneous. You adapt quickly, enjoy variety, and often work best in bursts when something grabs your interest.",
      strengths: ["Adapting quickly when things change", "Thinking on your feet and staying relaxed", "Bringing fresh energy to tasks when you are interested"],
      watch: ["Last-minute work leads to rushed answers and lost marks", "Distractions, especially your phone, can steal hours"],
      study: ["Use short 25-minute sessions with a timer — small starts beat big plans", "Put your phone in another room while studying", "Ask a friend or parent to check your progress each week"],
    },
  },
  A: {
    high: {
      about: "You are warm and caring. You notice how people feel, enjoy helping, and work hard to keep groups happy and working together.",
      strengths: ["Teamwork and helping others succeed", "Understanding people and their feelings", "Calming disagreements and building trust"],
      watch: ["Saying 'yes' to everyone can leave no time for your own work", "You may hold back a good idea to avoid disagreement"],
      study: ["Study with a partner and take turns quizzing each other", "Practise saying 'I'll help after I finish my revision'", "In essays, practise arguing both sides firmly"],
    },
    low: {
      about: "You are direct and logical. You say what you think, value fairness and facts over feelings, and enjoy a good challenge or competition.",
      strengths: ["Clear, logical decision making", "Honest feedback and standing by your views", "Competitive drive to improve and win"],
      watch: ["Your honesty can sound harsh; think about how it lands", "You may find group work frustrating when others are slower"],
      study: ["Set yourself score targets and try to beat your last result", "Use debates and argument essays to sharpen your thinking", "In group projects, agree on roles early to avoid friction"],
    },
  },
  S: {
    high: {
      about: "You are steady under pressure. Setbacks don't knock you down for long and you usually stay calm when others panic.",
      strengths: ["Staying calm in exams and tough moments", "Bouncing back quickly from mistakes", "Being a calming presence for friends"],
      watch: ["Feeling relaxed can lead to under-preparing", "You may not notice when friends are stressed"],
      study: ["Do timed past papers to make sure calm is matched by preparation", "Check your progress honestly every two weeks", "Use your calm to help a nervous friend — it reinforces your own learning"],
    },
    low: {
      about: "You feel things deeply. You care a lot about doing well, which can bring worry and stress, but also makes you sensitive, thoughtful and hard-working.",
      strengths: ["Caring deeply about your work and results", "Noticing problems early", "Understanding others who are struggling"],
      watch: ["Exam nerves can hide what you really know", "One mistake can spiral into doubt; move on to the next question"],
      study: ["Practise under exam conditions often so the real thing feels familiar", "Use slow breathing (in 4, hold 4, out 6) before and during exams", "Talk to a teacher, parent or VCS mentor when worry builds up — you are not alone"],
    },
  },
};

// Sixteen profiles from Social energy, Curiosity, Organisation and Teamwork
// style (high/low each). Key order: E O C A, "1" = high side.
export const PROFILES = {
  "1111": {
    name: "The Visionary Captain",
    tagline: "Big ideas, a clear plan, and a team that wants to follow you.",
    summary: "You combine energy, imagination, organisation and care for others. You enjoy leading groups toward exciting goals and you make sure everyone is included along the way.",
    subjects: ["English", "Business", "Biology", "Economics", "Sociology"],
    careers: ["School principal or education leader", "Doctor or public-health leader", "Entrepreneur running a social enterprise", "Diplomat or civil servant (CSS)", "Human-resources director", "Non-profit or NGO manager"],
  },
  "1110": {
    name: "The Bold Innovator",
    tagline: "You see what could be — and you organise people to build it.",
    summary: "Confident, inventive and driven, you love new ideas and have the discipline to turn them into results. You enjoy debate and aren't afraid to challenge the usual way of doing things.",
    subjects: ["Mathematics", "Computer Science", "Physics", "Business", "Economics"],
    careers: ["Tech start-up founder", "Management consultant", "Product manager", "Corporate lawyer", "Investment banker", "Engineering project lead"],
  },
  "1101": {
    name: "The Creative Spark",
    tagline: "You light up a room and fill it with new ideas.",
    summary: "Friendly, imaginative and full of energy, you love sharing ideas and bringing people together. You work best when the task is creative and the people around you are fun.",
    subjects: ["English Literature", "Art & Design", "Media Studies", "Psychology", "Sociology"],
    careers: ["Content creator or digital marketer", "Journalist or TV presenter", "Teacher or trainer", "Graphic or fashion designer", "Psychologist or counsellor", "Event or brand manager"],
  },
  "1100": {
    name: "The Idea Challenger",
    tagline: "You love a lively debate and a brand-new idea.",
    summary: "Quick-thinking, outspoken and curious, you enjoy testing ideas in argument and thinking on your feet. You thrive on variety and challenge rather than routine.",
    subjects: ["Economics", "History", "English Language", "Computer Science", "Global Perspectives"],
    careers: ["Lawyer or barrister", "Entrepreneur", "Political analyst or journalist", "Sales or business-development lead", "Creative director", "Start-up product strategist"],
  },
  "1011": {
    name: "The Team Organiser",
    tagline: "You make things happen — and everyone feels part of it.",
    summary: "Sociable, reliable and practical, you are the person who organises the class trip, keeps the group on track and makes sure no one is left out.",
    subjects: ["Business", "Accounting", "Biology", "Pakistan Studies", "Sociology"],
    careers: ["Hospital or clinic administrator", "Nurse or pharmacist", "Hotel or event manager", "Teacher or school coordinator", "Human-resources officer", "Banker or branch manager"],
  },
  "1010": {
    name: "The Go-Getter",
    tagline: "Clear goals, firm decisions, results on time.",
    summary: "Confident, practical and organised, you like taking charge and getting things done efficiently. You value facts, rules and results.",
    subjects: ["Mathematics", "Accounting", "Business", "Physics", "Economics"],
    careers: ["Chartered accountant (CA / ACCA)", "Army or air-force officer", "Operations or supply-chain manager", "Civil engineer", "Police or customs officer (CSS)", "Sales manager"],
  },
  "1001": {
    name: "The People Connector",
    tagline: "You make friends everywhere and make every moment fun.",
    summary: "Warm, lively and down-to-earth, you enjoy people, action and the here-and-now. You learn best by doing things with others.",
    subjects: ["Physical Education", "Travel & Tourism", "Business", "Food & Nutrition", "Sociology"],
    careers: ["Sports coach or fitness trainer", "Flight attendant or tourism professional", "Customer-relations manager", "Nurse or paramedic", "Retail or hospitality manager", "Events host"],
  },
  "1000": {
    name: "The Action Taker",
    tagline: "Less talk, more action — and you like to win.",
    summary: "Bold, practical and competitive, you enjoy fast-moving situations and quick decisions. You'd rather do something than read about it.",
    subjects: ["Physics", "Physical Education", "Business", "Design & Technology", "Mathematics"],
    careers: ["Pilot", "Armed-forces officer", "Entrepreneur in trade or retail", "Real-estate agent", "Sports professional", "Field or site engineer"],
  },
  "0111": {
    name: "The Thoughtful Guide",
    tagline: "Quiet wisdom, careful plans, and a deep care for others.",
    summary: "Reflective, imaginative and organised, you care about meaning and about helping people. You often understand others better than they understand themselves.",
    subjects: ["Biology", "Psychology", "English Literature", "Islamiyat", "Chemistry"],
    careers: ["Doctor (especially psychiatry or paediatrics)", "Clinical psychologist", "Teacher or lecturer", "Writer or editor", "Researcher in health or education", "Counsellor"],
  },
  "0110": {
    name: "The Deep Strategist",
    tagline: "You think several moves ahead — and you plan to win.",
    summary: "Independent, logical and imaginative, you like complex problems, long-term plans and getting things exactly right. You prefer depth to small talk.",
    subjects: ["Mathematics", "Further Mathematics", "Physics", "Computer Science", "Chemistry"],
    careers: ["Software engineer or AI researcher", "Data scientist", "Architect", "Research scientist", "Actuary or financial analyst", "Aerospace or electrical engineer"],
  },
  "0101": {
    name: "The Quiet Dreamer",
    tagline: "A rich inner world and a kind heart.",
    summary: "Gentle, imaginative and caring, you are guided by your values and your imagination. You do your best work when you can create freely and help others.",
    subjects: ["English Literature", "Art & Design", "Urdu", "Psychology", "Biology"],
    careers: ["Author or poet", "Illustrator or animator", "Psychologist or therapist", "Architect or interior designer", "Veterinarian", "Teacher of arts or languages"],
  },
  "0100": {
    name: "The Independent Thinker",
    tagline: "You question everything — and find your own answers.",
    summary: "Curious, logical and independent, you love ideas for their own sake. You'd rather work out the truth yourself than accept what you're told.",
    subjects: ["Physics", "Mathematics", "Computer Science", "Philosophy & Global Perspectives", "Chemistry"],
    careers: ["Scientist or researcher", "Software developer", "Game designer", "Cyber-security specialist", "Inventor or engineer", "Philosopher or academic"],
  },
  "0011": {
    name: "The Dependable Helper",
    tagline: "Steady, kind and always there when needed.",
    summary: "Quiet, practical, organised and caring, you are the friend everyone relies on. You like clear routines and making a real difference to people.",
    subjects: ["Biology", "Chemistry", "Accounting", "Food & Nutrition", "Islamiyat"],
    careers: ["Pharmacist", "Nurse or doctor (general practice)", "Dentist", "Teacher", "Social worker", "Medical lab technologist"],
  },
  "0010": {
    name: "The Precise Specialist",
    tagline: "Accurate, logical and quietly excellent.",
    summary: "Careful, practical and independent, you like facts, systems and getting the details right. People trust your work because it is thorough.",
    subjects: ["Mathematics", "Accounting", "Chemistry", "Physics", "Computer Science"],
    careers: ["Chartered accountant or auditor", "Civil or mechanical engineer", "Pharmacist or lab scientist", "Database or systems administrator", "Quality-control specialist", "Surgeon"],
  },
  "0001": {
    name: "The Easygoing Craftsperson",
    tagline: "Calm, caring and great with your hands.",
    summary: "Relaxed, kind and practical, you enjoy hands-on work and helping people in real, useful ways. You prefer doing to talking.",
    subjects: ["Art & Design", "Design & Technology", "Biology", "Food & Nutrition", "Environmental Management"],
    careers: ["Chef or baker", "Physiotherapist", "Veterinary assistant or vet", "Photographer", "Fashion or textile designer", "Agriculture or gardening specialist"],
  },
  "0000": {
    name: "The Hands-on Problem Solver",
    tagline: "Give you a broken thing and you'll figure out how to fix it.",
    summary: "Independent, practical and logical, you like to understand how things work by taking them apart. You stay cool and solve real problems.",
    subjects: ["Physics", "Design & Technology", "Computer Science", "Mathematics", "Environmental Management"],
    careers: ["Mechanical or automotive engineer", "Electrician or technician", "Computer-hardware or network engineer", "Pilot", "Forensic scientist", "Game or app developer"],
  },
};

export const profileKey = (scores) =>
  ["E", "O", "C", "A"].map((t) => (scores[t] >= 50 ? "1" : "0")).join("");
