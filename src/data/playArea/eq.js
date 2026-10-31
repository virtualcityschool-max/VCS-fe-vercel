// EQ Self-Check.
//
// Items: IPIP scales for components of emotional intelligence by Barchard
// (2001), copied from https://ipip.ori.org/newEmotionalIntelligenceKey.htm
// (2026-10-31) and shown in the first person. IPIP items are in the public
// domain ("one can copy, edit, translate, or use them for any purpose without
// asking permission and without paying a fee" — ipip.ori.org).
// Reported alphas (women / men): Attending to Emotions .81/.83, Positive
// Expressivity .81/.79, Negative Expressivity .75/.74, Empathic Concern
// .64/.80, Emotion-Based Decision-Making .73/.67.
// Change: Empathic Concern uses 8 of its 10 items — the two items about
// criminals were left out as less suitable for school students.
//
// Scoring: 5-point accuracy scale, minus-keyed items reversed, mean shown as
// 0–100% of the scale. No norms yet, so a score is a position on the scale.

export const STORE_KEY = "vcs_play_eq_v1";

export const SOURCE = {
  citation: "Barchard, K. A. (2001). Emotional and social intelligence: Examining its place in the nomological network. Doctoral dissertation, University of British Columbia. Scales published in the International Personality Item Pool (ipip.ori.org).",
  url: "https://ipip.ori.org/newEmotionalIntelligenceKey.htm",
};

export const SCALE = [
  { v: 1, label: "Very inaccurate" },
  { v: 2, label: "Moderately inaccurate" },
  { v: 3, label: "Neither" },
  { v: 4, label: "Moderately accurate" },
  { v: 5, label: "Very accurate" },
];

// kind: "level" = more is generally helpful; "balance" = the middle is healthiest; "style" = neither end is better.
export const AREAS = {
  AE: {
    name: "Noticing your feelings",
    model: "Self-awareness",
    icon: "fas fa-eye",
    color: "violet",
    kind: "level",
    alpha: ".81 / .83",
    high: "You pay attention to how you feel and why. This self-awareness is the base of emotional intelligence — it helps you calm down, decide well and explain yourself.",
    mid: "You notice your feelings some of the time. Stopping to name them more often will make strong emotions easier to handle.",
    low: "You may not stop to notice how you feel until feelings are strong. That's common — and it can be learned.",
    tip: "Three times a day, pause and name your feeling in one word (calm, annoyed, worried, excited). Research shows that putting feelings into words calms the brain's alarm system.",
  },
  PE: {
    name: "Showing warmth and joy",
    model: "Expressing positive emotions",
    icon: "fas fa-face-smile",
    color: "amber",
    kind: "level",
    alpha: ".81 / .79",
    high: "You show happiness and affection easily. People feel your warmth, which builds strong friendships and teams.",
    mid: "You show your good feelings with people you're comfortable with, and hold back with others.",
    low: "You tend to keep happy feelings and affection to yourself. Others may not realise how much you care.",
    tip: "Tell one person each day something you appreciate about them — a thank-you, a compliment, a kind message.",
  },
  NE: {
    name: "Expressing difficult feelings",
    model: "Expressing negative emotions",
    icon: "fas fa-cloud-rain",
    color: "cyan",
    kind: "balance",
    alpha: ".75 / .74",
    high: "Your sadness, fear or anger shows clearly. Honest feelings are healthy — just make sure strong anger doesn't come out as shouting you later regret.",
    mid: "You show difficult feelings in a balanced way: honest, but usually in control. That's a healthy middle.",
    low: "You keep sadness, fear or anger to yourself. That can look calm, but bottled-up feelings build pressure. Find someone you trust to talk to.",
    tip: "Use 'I feel… when… because…' to share a difficult feeling calmly: 'I feel worried when I don't understand homework, because I fall behind.'",
  },
  EC: {
    name: "Caring about others",
    model: "Empathy",
    icon: "fas fa-hand-holding-heart",
    color: "emerald",
    kind: "level",
    alpha: ".64 / .80",
    high: "You feel for people who are struggling and want to help. Empathy makes you a trusted friend, teammate and future leader.",
    mid: "You care about others, especially people close to you. Noticing people outside your circle will grow your empathy further.",
    low: "You may focus more on your own goals than on others' problems. Trying to see things from other people's side is a powerful leadership skill.",
    tip: "In your next disagreement, first say the other person's point back to them in your own words before giving yours.",
  },
  ED: {
    name: "Heart or head?",
    model: "Decision style",
    icon: "fas fa-scale-balanced",
    color: "rose",
    kind: "style",
    alpha: ".73 / .67",
    high: "You often follow your heart. Your feelings guide you to what matters — check big decisions with facts too.",
    mid: "You use both feelings and logic when you decide. A balanced style that works in most situations.",
    low: "You decide mainly with logic and facts. That's a strength — just remember that how people feel matters too.",
    tip: "For big choices, write two lists: what the facts say, and what your feelings say. Good decisions listen to both.",
    lowLabel: "Head (logic)",
    highLabel: "Heart (feelings)",
  },
};
export const AREA_ORDER = ["AE", "PE", "NE", "EC", "ED"];

// [IPIP item text, key]
const ITEMS = {
  AE: [
    ["Think about the causes of my emotions.", 1], ["Pay a lot of attention to my feelings.", 1], ["Am usually aware of the way that I'm feeling.", 1],
    ["Notice my emotions.", 1], ["Often stop to analyze how I'm feeling.", 1], ["Rarely think about how I feel.", -1], ["Rarely analyze my emotions.", -1],
    ["Am not in touch with my feelings.", -1], ["Often ignore my feelings.", -1], ["Rarely notice my emotional reactions.", -1],
  ],
  PE: [
    ["Express my affection physically.", 1], ["Laugh out loud if something is funny.", 1], ["Express my happiness in a childlike manner.", 1],
    ["Sometimes laugh out loud when reading or watching TV.", 1], ["Hug my close friends.", 1], ["Show my feelings when I'm happy.", 1],
    ["Find it difficult showing people that I care about them.", -1], ["Have difficulty showing affection.", -1], ["Keep my happy feelings to myself.", -1],
  ],
  NE: [
    ["Shout or scream when I'm angry.", 1], ["Can't help but look upset when something bad happens.", 1], ["Show my fear.", 1],
    ["Suspect that my facial expressions give me away when I feel sad.", 1], ["Show my sadness.", 1],
    ["Keep my feelings to myself, regardless of how unhappy I am.", -1], ["Find it difficult showing people that I'm angry with them.", -1],
    ["Keep my feelings to myself, regardless of how scared I am.", -1], ["Rarely show my anger.", -1], ["Wish I could more easily show my negative feelings.", -1],
  ],
  EC: [
    ["Am concerned about others.", 1], ["Feel sympathy for those who are worse off than myself.", 1], ["Sympathize with the homeless.", 1],
    ["Believe that the poor deserve our sympathy.", 1], ["Feel little concern for others.", -1], ["Look down on any weakness.", -1],
    ["Don't like to get involved in other people's problems.", -1], ["Have little sympathy for the unemployed.", -1],
  ],
  ED: [
    ["Listen to my feelings when making important decisions.", 1], ["Base my goals in life on inspiration, rather than logic.", 1], ["Plan my life based on how I feel.", 1],
    ["Believe emotions give direction to life.", 1], ["Listen to my heart rather than my brain.", 1], ["Plan my life logically.", -1],
    ["Believe important decisions should be based on logical reasoning.", -1], ["Listen to my brain rather than my heart.", -1], ["Make decisions based on facts, not feelings.", -1],
  ],
};

const firstPerson = (t) => `I ${t.charAt(0).toLowerCase()}${t.slice(1)}`;

// Mixed order (one from each area in turn) so a run of similar statements doesn't bias answers.
export const QUESTIONS = (() => {
  const out = [];
  const max = Math.max(...AREA_ORDER.map((a) => ITEMS[a].length));
  for (let i = 0; i < max; i++) {
    AREA_ORDER.forEach((a) => {
      const it = ITEMS[a][i];
      if (it) out.push({ id: `${a}${i + 1}`, area: a, ipip: it[0], text: firstPerson(it[0]), key: it[1] });
    });
  }
  return out;
})();
export const PER_STEP = 8;
export const STEPS = Math.ceil(QUESTIONS.length / PER_STEP);

export const scoreAreas = (answers) => {
  const out = {};
  AREA_ORDER.forEach((a) => {
    const qs = QUESTIONS.filter((q) => q.area === a);
    const sum = qs.reduce((s, q) => s + (q.key > 0 ? answers[q.id] : 6 - answers[q.id]), 0);
    out[a] = Math.round(((sum / qs.length - 1) / 4) * 100);
  });
  return out;
};

export const level = (pct) => (pct >= 65 ? "high" : pct <= 35 ? "low" : "mid");

export const MODEL = [
  { name: "Perceive", text: "Notice emotions in yourself and in other people's faces and voices.", icon: "fas fa-eye" },
  { name: "Use", text: "Use feelings to help thinking — for example, a little excitement before a presentation.", icon: "fas fa-bolt" },
  { name: "Understand", text: "Know why emotions happen and how they change.", icon: "fas fa-lightbulb" },
  { name: "Manage", text: "Calm yourself down, cheer yourself up and help others do the same.", icon: "fas fa-sliders" },
];

export const SOURCES = [
  SOURCE.citation,
  "Salovey, P., & Mayer, J. D. (1990). Emotional intelligence. Imagination, Cognition and Personality, 9(3), 185–211.",
  "Lieberman, M. D., et al. (2007). Putting feelings into words: Affect labeling disrupts amygdala activity. Psychological Science, 18(5), 421–428.",
  "Goleman, D. (1995). Emotional Intelligence. Bantam Books.",
];
