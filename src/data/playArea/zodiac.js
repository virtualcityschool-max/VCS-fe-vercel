// Star signs: three ways of reading the sky on a birthday.
//
// 1. Western tradition (tropical): the Sun's position measured from the March
//    equinox, in twelve equal 30° signs (Ptolemy's Tetrabiblos, 2nd century AD).
// 2. Vedic tradition (sidereal, Jyotisha): the same twelve signs measured from
//    the fixed stars, using the Lahiri ayanamsa (about 24° in 2000).
// 3. The real sky (astronomy): the constellation the Sun is actually in, using
//    the official IAU constellation boundaries (fixed in 1930).
//
// The Sun's position comes from a standard low-precision formula (error about
// 0.013°). Checked against the astronomy-engine library for every day from
// 1950 to 2030: 9 differences in 29,585 days, all within hours of a boundary.
// Star facts: Wikipedia star pages (IAU WGSN names), checked 2026-10-30.

const norm = (x) => ((x % 360) + 360) % 360;

/** Sun's apparent ecliptic longitude (degrees) at a UTC time in ms. */
export const sunLongitude = (ms) => {
  const n = ms / 864e5 + 2440587.5 - 2451545;
  const L = 280.46 + 0.9856474 * n;
  const g = ((357.528 + 0.9856003 * n) * Math.PI) / 180;
  return norm(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
};
const yearsSince2000 = (ms) => (ms / 864e5 + 2440587.5 - 2451545) / 365.25;
const PRECESSION = 0.0139697; // degrees per year (general precession)
export const lahiriAyanamsa = (ms) => 23.853 + 0.0139552 * yearsSince2000(ms);

// Where the Sun's path enters each IAU constellation, in J2000 ecliptic
// longitude (worked out from the IAU boundaries with astronomy-engine 2.1.19).
export const IAU_BOUNDARIES = [
  [28.69, "aries"], [53.42, "taurus"], [90.15, "gemini"], [117.99, "cancer"], [138.04, "leo"],
  [173.86, "virgo"], [217.82, "libra"], [241.05, "scorpius"], [247.64, "ophiuchus"],
  [266.24, "sagittarius"], [299.66, "capricornus"], [327.49, "aquarius"], [351.66, "pisces"],
];

const SIGN_KEYS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

/** All three readings for a birthday ("YYYY-MM-DD"), taken at midday UTC. */
export const readSky = (isoDate) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d, 12);
  const lam = sunLongitude(ms);
  const sid = norm(lam - lahiriAyanamsa(ms));
  const j2000 = norm(lam - PRECESSION * yearsSince2000(ms));
  let iau = "pisces";
  for (const [b, key] of IAU_BOUNDARIES) if (j2000 >= b) iau = key;
  // The Sun moves about 1° a day, so within 0.6° of a boundary the answer
  // depends on the hour of birth.
  const nearSign = (x) => Math.min(x % 30, 30 - (x % 30)) < 0.6;
  const nearIau = IAU_BOUNDARIES.some(([b]) => Math.abs(norm(j2000 - b + 180) - 180) < 0.6);
  return {
    longitude: lam,
    ayanamsa: lahiriAyanamsa(ms),
    western: SIGN_KEYS[Math.floor(lam / 30)],
    vedic: SIGN_KEYS[Math.floor(sid / 30)],
    iau,
    cusp: { western: nearSign(lam), vedic: nearSign(sid), iau: nearIau },
    iauOffset: PRECESSION * yearsSince2000(ms), // add to J2000 boundaries for this year
  };
};

// ---- The twelve signs (Western and Vedic) ---------------------------------

export const SIGNS = {
  aries: { name: "Aries", symbol: "♈\uFE0E", meaning: "the Ram", dates: "21 Mar – 19 Apr", gender: "Masculine", kind: "Equinoctial", ruler: "Mars", element: "Fire", rashi: "Mesha", rashiMeaning: "ram", lord: "Mangal (Mars)", vedicDates: "about 14 Apr – 14 May" },
  taurus: { name: "Taurus", symbol: "♉\uFE0E", meaning: "the Bull", dates: "20 Apr – 20 May", gender: "Feminine", kind: "Solid", ruler: "Venus", element: "Earth", rashi: "Vrishabha", rashiMeaning: "bull", lord: "Shukra (Venus)", vedicDates: "about 15 May – 14 Jun" },
  gemini: { name: "Gemini", symbol: "♊\uFE0E", meaning: "the Twins", dates: "21 May – 20 Jun", gender: "Masculine", kind: "Bicorporeal", ruler: "Mercury", element: "Air", rashi: "Mithuna", rashiMeaning: "pair", lord: "Budha (Mercury)", vedicDates: "about 15 Jun – 16 Jul" },
  cancer: { name: "Cancer", symbol: "♋\uFE0E", meaning: "the Crab", dates: "21 Jun – 22 Jul", gender: "Feminine", kind: "Tropical", ruler: "the Moon", element: "Water", rashi: "Karka", rashiMeaning: "crab", lord: "Chandra (Moon)", vedicDates: "about 17 Jul – 16 Aug" },
  leo: { name: "Leo", symbol: "♌\uFE0E", meaning: "the Lion", dates: "23 Jul – 22 Aug", gender: "Masculine", kind: "Solid", ruler: "the Sun", element: "Fire", rashi: "Simha", rashiMeaning: "lion", lord: "Surya (Sun)", vedicDates: "about 17 Aug – 16 Sep" },
  virgo: { name: "Virgo", symbol: "♍\uFE0E", meaning: "the Maiden", dates: "23 Aug – 22 Sep", gender: "Feminine", kind: "Bicorporeal", ruler: "Mercury", element: "Earth", rashi: "Kanya", rashiMeaning: "maiden", lord: "Budha (Mercury)", vedicDates: "about 17 Sep – 17 Oct" },
  libra: { name: "Libra", symbol: "♎\uFE0E", meaning: "the Scales", dates: "23 Sep – 22 Oct", gender: "Masculine", kind: "Equinoctial", ruler: "Venus", element: "Air", rashi: "Tula", rashiMeaning: "balance", lord: "Shukra (Venus)", vedicDates: "about 17 Oct – 16 Nov" },
  scorpio: { name: "Scorpio", symbol: "♏\uFE0E", meaning: "the Scorpion", dates: "23 Oct – 21 Nov", gender: "Feminine", kind: "Solid", ruler: "Mars", element: "Water", rashi: "Vrishchika", rashiMeaning: "scorpion", lord: "Mangal (Mars)", vedicDates: "about 16 Nov – 15 Dec" },
  sagittarius: { name: "Sagittarius", symbol: "♐\uFE0E", meaning: "the Archer", dates: "22 Nov – 21 Dec", gender: "Masculine", kind: "Bicorporeal", ruler: "Jupiter", element: "Fire", rashi: "Dhanu", rashiMeaning: "bow", lord: "Guru (Jupiter)", vedicDates: "about 16 Dec – 13 Jan" },
  capricorn: { name: "Capricorn", symbol: "♑\uFE0E", meaning: "the Sea-Goat", dates: "22 Dec – 19 Jan", gender: "Feminine", kind: "Tropical", ruler: "Saturn", element: "Earth", rashi: "Makara", rashiMeaning: "sea creature", lord: "Shani (Saturn)", vedicDates: "about 14 Jan – 12 Feb" },
  aquarius: { name: "Aquarius", symbol: "♒\uFE0E", meaning: "the Water-Bearer", dates: "20 Jan – 18 Feb", gender: "Masculine", kind: "Solid", ruler: "Saturn", element: "Air", rashi: "Kumbha", rashiMeaning: "water pot", lord: "Shani (Saturn)", vedicDates: "about 13 Feb – 14 Mar" },
  pisces: { name: "Pisces", symbol: "♓\uFE0E", meaning: "the Fishes", dates: "19 Feb – 20 Mar", gender: "Feminine", kind: "Bicorporeal", ruler: "Jupiter", element: "Water", rashi: "Meena", rashiMeaning: "fish", lord: "Guru (Jupiter)", vedicDates: "about 15 Mar – 13 Apr" },
};

// What Ptolemy's four kinds of sign mean (Tetrabiblos, Book I).
export const PTOLEMY_KIND = {
  Equinoctial: "the Sun is here at an equinox, when day and night are equal",
  Tropical: "the Sun 'turns' here at a solstice (the longest or shortest day)",
  Solid: "a middle-of-season sign, when the weather is steady",
  Bicorporeal: "a 'two-bodied' sign at the change from one season to the next",
};

// ---- The thirteen constellations on the Sun's path (IAU) -------------------

export const CONSTELLATIONS = {
  aries: { name: "Aries", abbr: "Ari", meaning: "the Ram", sunDates: "19 Apr – 13 May", see: "December", star: { name: "Hamal", mag: "2.0", ly: 66, origin: "Arabic ra's al-ḥamal, “head of the ram”" }, fact: "Over 2,000 years ago, when Greek astronomers named the signs, the Sun stood in Aries at the March equinox — which is why astrology still starts the year with Aries. Because the Earth slowly wobbles, that point has now moved into Pisces." },
  taurus: { name: "Taurus", abbr: "Tau", meaning: "the Bull", sunDates: "14 May – 21 Jun", see: "January", star: { name: "Aldebaran", mag: "0.9", ly: 67, origin: "Arabic al-dabarān, “the follower” (it follows the Pleiades across the sky)" }, fact: "Taurus holds the Pleiades star cluster — al-Thurayya in Arabic — and the Crab Nebula, the remains of an exploding star that astronomers recorded in 1054 AD." },
  gemini: { name: "Gemini", abbr: "Gem", meaning: "the Twins", sunDates: "22 Jun – 20 Jul", see: "February", star: { name: "Pollux", mag: "1.1", ly: 34, origin: "Named after Pollux, one of the twins of Greek and Roman legend" }, fact: "Every December the Geminid meteor shower seems to rain out of Gemini — one of the best shooting-star displays of the year." },
  cancer: { name: "Cancer", abbr: "Cnc", meaning: "the Crab", sunDates: "21 Jul – 10 Aug", see: "March", star: { name: "Tarf", mag: "3.5", ly: 303, origin: "Arabic, “the end” or “the edge”" }, fact: "Cancer is the faintest constellation of the zodiac, but it hides the Beehive Cluster — hundreds of stars you can see as a misty patch with binoculars." },
  leo: { name: "Leo", abbr: "Leo", meaning: "the Lion", sunDates: "11 Aug – 16 Sep", see: "April", star: { name: "Regulus", mag: "1.4", ly: 79, origin: "Latin rēgulus, “prince” or “little king”" }, fact: "Regulus sits almost exactly on the Sun's path, so the Moon and planets often pass right next to it. The Leonid meteor shower comes from Leo every November." },
  virgo: { name: "Virgo", abbr: "Vir", meaning: "the Maiden", sunDates: "17 Sep – 31 Oct", see: "May", star: { name: "Spica", mag: "1.0", ly: 250, origin: "Latin spīca, “ear of wheat” held by the maiden" }, fact: "Virgo is the biggest constellation of the zodiac — the Sun takes about 44 days to cross it. Behind it lies the Virgo Cluster of more than a thousand galaxies." },
  libra: { name: "Libra", abbr: "Lib", meaning: "the Scales", sunDates: "31 Oct – 23 Nov", see: "June", star: { name: "Zubeneschamali", mag: "2.6", ly: 185, origin: "Arabic al-zubānā al-shamāliyy, “the northern claw” — Libra's stars were once the claws of the Scorpion" }, fact: "Libra is the only zodiac constellation that is an object, not a creature. Its star names still remember the time it was part of Scorpius." },
  scorpius: { name: "Scorpius", abbr: "Sco", meaning: "the Scorpion", sunDates: "23 Nov – 29 Nov", see: "July", star: { name: "Antares", mag: "1.0", ly: 550, origin: "Greek Antarēs, “rival of Ares (Mars)”, because of its red colour" }, fact: "The Sun spends only about a week in Scorpius each year — less time than it spends in Ophiuchus. Antares is a red supergiant, hundreds of times wider than our Sun." },
  ophiuchus: { name: "Ophiuchus", abbr: "Oph", meaning: "the Serpent-Bearer", sunDates: "30 Nov – 17 Dec", see: "July", star: { name: "Rasalhague", mag: "2.1", ly: 49, origin: "Arabic ra's al-ḥawwā', “head of the serpent charmer”" }, fact: "The ‘13th sign’. The Sun really passes through Ophiuchus for about 18 days each year, but astrology left it out more than 2,000 years ago to keep twelve equal signs." },
  sagittarius: { name: "Sagittarius", abbr: "Sgr", meaning: "the Archer", sunDates: "18 Dec – 19 Jan", see: "August", star: { name: "Kaus Australis", mag: "1.9", ly: 143, origin: "Arabic qaws, “bow”, with Latin austrālis, “southern”" }, fact: "When you look at Sagittarius you are looking towards the centre of our Milky Way galaxy, where a giant black hole called Sagittarius A* sits." },
  capricornus: { name: "Capricornus", abbr: "Cap", meaning: "the Sea-Goat", sunDates: "20 Jan – 16 Feb", see: "September", star: { name: "Deneb Algedi", mag: "2.8", ly: 39, origin: "Arabic dhanab al-jady, “tail of the goat”" }, fact: "The half-goat, half-fish shape comes from ancient Babylon — Capricornus is one of the oldest constellations still in use." },
  aquarius: { name: "Aquarius", abbr: "Aqr", meaning: "the Water-Bearer", sunDates: "16 Feb – 12 Mar", see: "October", star: { name: "Sadalsuud", mag: "2.9", ly: 540, origin: "Arabic sa'd al-su'ūd, “luck of lucks”" }, fact: "Aquarius contains the Helix Nebula, the glowing shell of gas thrown off by a dying star — a preview of what our Sun will do in billions of years." },
  pisces: { name: "Pisces", abbr: "Psc", meaning: "the Fishes", sunDates: "12 Mar – 18 Apr", see: "November", star: { name: "Alpherg", mag: "3.6", ly: 350, origin: "Arabic, “the emptying” (of the water-bearer's pot)" }, fact: "The March equinox point — where astronomers start measuring the sky — now lies in Pisces. In about 600 years it will move into Aquarius." },
};

export const SOURCES = [
  ["Constellation boundaries", "International Astronomical Union (IAU), fixed 1930"],
  ["Star names", "IAU Working Group on Star Names (WGSN)"],
  ["Star brightness and distance", "Hipparcos / Gaia data as given on each star's Wikipedia page"],
  ["Western signs", "Claudius Ptolemy, Tetrabiblos (2nd century AD), Book I"],
  ["Vedic signs", "Jyotisha sidereal zodiac, Lahiri ayanamsa (recommended by India's Calendar Reform Committee, 1955)"],
  ["Astrology test", "Carlson, S. (1985). A double-blind test of astrology. Nature, 318, 419–425"],
];

// ---- What tradition says about personality (for fun) -----------------------
// VCS's own summaries of the character each sign is traditionally given in
// Western astrology, and each Rashi in Jyotisha. Folklore, not science.

export const SIGN_TRAITS = {
  aries: {
    keywords: ["Bold", "Energetic", "Pioneering", "Competitive"],
    portrait: "The first sign of the zodiac is the one that charges in first. Aries is pictured as a natural starter: brave, direct and full of energy, happiest when there is a challenge to win or a new path to open.",
    strengths: ["Courage to try new things", "Takes the lead without being asked", "Honest and straightforward", "Bounces back quickly"],
    challenges: ["Impatient when things move slowly", "Can start more than they finish", "Quick temper that cools just as fast"],
    study: "Short, intense sprints and friendly competition — race a friend through a past paper.",
    careers: ["Entrepreneur", "Surgeon", "Armed forces officer", "Sports coach"],
  },
  taurus: {
    keywords: ["Steady", "Patient", "Reliable", "Practical"],
    portrait: "Taurus, the Bull, is the picture of calm strength. Tradition sees Taurus as patient, loyal and down-to-earth — slow to start but almost impossible to stop, with a love of comfort, good food and beautiful things.",
    strengths: ["Patience and staying power", "Loyal and dependable", "Practical, common-sense thinking", "Eye for beauty and quality"],
    challenges: ["Stubborn once their mind is made up", "Dislikes sudden change", "Can get too comfortable"],
    study: "A fixed routine in the same quiet spot, building up knowledge brick by brick.",
    careers: ["Banker or accountant", "Architect", "Chef", "Interior designer"],
  },
  gemini: {
    keywords: ["Curious", "Witty", "Talkative", "Adaptable"],
    portrait: "Gemini, the Twins, is said to have two minds working at once. Quick, playful and endlessly curious, Gemini loves conversation, new ideas and variety — and can talk to almost anyone about almost anything.",
    strengths: ["Learns new things very fast", "Great communicator and storyteller", "Adapts easily to change", "Sense of humour"],
    challenges: ["Gets bored with routine", "Attention can jump around", "May say yes to too many things"],
    study: "Switch topics every 30 minutes and explain ideas out loud — teaching is learning.",
    careers: ["Journalist", "Teacher", "Marketing specialist", "Translator"],
  },
  cancer: {
    keywords: ["Caring", "Loyal", "Intuitive", "Protective"],
    portrait: "Cancer, the Crab, has a tough shell and a soft heart. Tradition paints Cancer as deeply caring and protective of family and friends, with strong feelings, a good memory and a talent for making people feel at home.",
    strengths: ["Kind and nurturing", "Reads people's feelings well", "Fiercely loyal", "Excellent memory"],
    challenges: ["Takes criticism to heart", "Moods can change like the tides", "Holds on to the past"],
    study: "A calm, cosy study space and a study buddy you trust.",
    careers: ["Doctor or nurse", "Psychologist", "Teacher", "Social worker"],
  },
  leo: {
    keywords: ["Confident", "Generous", "Warm", "Creative"],
    portrait: "Leo, the Lion, is ruled by the Sun itself — so tradition gives Leo a sunny, larger-than-life personality. Leo is pictured as a warm, generous leader who loves to shine, create and lift others up.",
    strengths: ["Natural confidence and presence", "Generous and big-hearted", "Inspires and motivates others", "Creative flair"],
    challenges: ["Needs praise and recognition", "Can be proud", "Finds it hard to admit mistakes"],
    study: "Set big goals, present what you learn, and reward yourself when you hit them.",
    careers: ["Business leader", "Actor or presenter", "Lawyer", "Event manager"],
  },
  virgo: {
    keywords: ["Careful", "Analytical", "Helpful", "Organised"],
    portrait: "Virgo, the Maiden holding an ear of wheat, is linked with harvest and hard work. Tradition sees Virgo as precise, thoughtful and modest — the person who notices the small details everyone else missed and quietly fixes them.",
    strengths: ["Attention to detail", "Organised and hard-working", "Logical problem solver", "Always ready to help"],
    challenges: ["Perfectionism and over-worrying", "Can be too self-critical", "Finds it hard to relax"],
    study: "Neat notes, checklists and a revision timetable — then trust your preparation.",
    careers: ["Doctor or pharmacist", "Data analyst", "Editor", "Engineer"],
  },
  libra: {
    keywords: ["Fair", "Diplomatic", "Sociable", "Artistic"],
    portrait: "Libra, the Scales, is all about balance. Tradition pictures Libra as charming, fair-minded and peace-loving — the friend who sees both sides of an argument and has a natural sense of style and harmony.",
    strengths: ["Strong sense of fairness", "Brings people together", "Charming and easy to talk to", "Good taste and design sense"],
    challenges: ["Struggles to make decisions", "Avoids conflict even when needed", "May try too hard to please everyone"],
    study: "Study with a partner, compare views, and use colour and good design in your notes.",
    careers: ["Lawyer or judge", "Diplomat", "Designer", "Human-resources manager"],
  },
  scorpio: {
    keywords: ["Intense", "Determined", "Loyal", "Perceptive"],
    portrait: "Scorpio, the Scorpion, is the sign of depth and determination. Tradition sees Scorpio as passionate, private and powerful — someone who never does anything halfway and can see straight through to the truth.",
    strengths: ["Fierce focus and willpower", "Sees what others hide", "Deeply loyal", "Brave in a crisis"],
    challenges: ["Can be secretive", "Finds it hard to forgive", "All-or-nothing feelings"],
    study: "Deep dives — master one topic completely before moving on.",
    careers: ["Detective or investigator", "Surgeon", "Researcher", "Psychologist"],
  },
  sagittarius: {
    keywords: ["Adventurous", "Optimistic", "Honest", "Free-spirited"],
    portrait: "Sagittarius, the Archer, aims its arrow at far horizons. Tradition pictures Sagittarius as cheerful, honest and adventurous — a lover of travel, big ideas and big questions about life.",
    strengths: ["Optimism that lifts others", "Love of learning and exploring", "Honest and open", "Sense of humour"],
    challenges: ["Can be blunt", "Restless with routine", "Promises more than time allows"],
    study: "Link lessons to the real world — documentaries, trips and big-picture questions.",
    careers: ["Pilot", "Professor", "Travel writer", "International business"],
  },
  capricorn: {
    keywords: ["Ambitious", "Disciplined", "Responsible", "Patient"],
    portrait: "Capricorn, the Sea-Goat, climbs mountains one careful step at a time. Tradition sees Capricorn as serious, hard-working and ambitious — someone who plans for the long term and reaches the top through steady effort.",
    strengths: ["Self-discipline", "Long-term planning", "Responsible and trustworthy", "Practical wisdom"],
    challenges: ["Works too hard and forgets to rest", "Can seem too serious", "Hard on themselves"],
    study: "A long-term revision plan with clear milestones — and scheduled breaks.",
    careers: ["Chartered accountant", "Civil servant (CSS)", "Engineer", "Company director"],
  },
  aquarius: {
    keywords: ["Original", "Independent", "Inventive", "Humanitarian"],
    portrait: "Aquarius, the Water-Bearer, pours out new ideas for everyone. Tradition pictures Aquarius as original, independent and forward-thinking — a free spirit who wants to make the world fairer and better.",
    strengths: ["Original, inventive thinking", "Cares about big causes", "Independent mind", "Friendly with everyone"],
    challenges: ["Can seem distant", "Rebels against rules", "Stubborn about their ideas"],
    study: "Freedom to explore — projects, inventions and your own way of solving problems.",
    careers: ["Scientist or inventor", "Software developer", "Social entrepreneur", "Astronomer"],
  },
  pisces: {
    keywords: ["Imaginative", "Compassionate", "Gentle", "Artistic"],
    portrait: "Pisces, the two Fishes, swims in a sea of imagination. Tradition sees Pisces as gentle, kind and dreamy — deeply sensitive to others' feelings, with a rich inner world of art, music and ideas.",
    strengths: ["Deep empathy", "Rich imagination", "Artistic and musical talent", "Kind and forgiving"],
    challenges: ["Daydreams when work is due", "Takes on others' worries", "Avoids hard realities"],
    study: "Use stories, music and drawings to remember facts — and a timer to stay on track.",
    careers: ["Artist or musician", "Doctor or nurse", "Counsellor", "Film-maker"],
  },
};

// Traditional qualities of each Rashi in Jyotisha (Vedic astrology).
export const RASHI_TRAITS = {
  aries: "Mesha is fiery and courageous — quick to act, independent and full of drive.",
  taurus: "Vrishabha is steady and patient — loves beauty, comfort and security, and is loyal to the end.",
  gemini: "Mithuna is clever and communicative — curious, witty and quick with words.",
  cancer: "Karka is emotional and nurturing — devoted to home, family and those it loves.",
  leo: "Simha is royal and generous — proud, warm-hearted and born to lead.",
  virgo: "Kanya is analytical and service-minded — careful, modest and practical.",
  libra: "Tula is just and diplomatic — seeks balance, harmony and fair dealing.",
  scorpio: "Vrishchika is intense and secretive — determined, deep and transformative.",
  sagittarius: "Dhanu is righteous and philosophical — generous, optimistic and wise.",
  capricorn: "Makara is disciplined and hard-working — patient, practical and ambitious.",
  aquarius: "Kumbha is humanitarian and independent — thoughtful, unconventional and principled.",
  pisces: "Meena is spiritual and compassionate — imaginative, gentle and selfless.",
};
