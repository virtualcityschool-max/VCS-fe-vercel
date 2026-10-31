// Brain Teasers: puzzle bank, daily set, badges.
// Each puzzle: q (question), a (correct answer), o (3 wrong answers), hint, why (explanation).
// Records are kept only in the player's browser (no login).

export const STORE_KEY = "vcs_play_teasers_v1";

export const EMPTY_RECORD = {
  solved: [],    // puzzle ids answered correctly (daily or practice)
  daily: {},     // date -> { picks: { id: answer }, hints: [id] } (last 30 days)
  dailyDone: [], // dates when the whole daily set was answered
  best: {},      // sprint (correct answers), hanoi: { discs: moves }, river (crossings)
  badges: [],
};

export const CATEGORIES = {
  patterns: { name: "Patterns", icon: "fas fa-arrow-trend-up", color: "violet", text: "Number and letter sequences — the kind used in aptitude tests." },
  logic: { name: "Logic", icon: "fas fa-chess-knight", color: "cyan", text: "Think it through step by step. Watch out for traps!" },
  riddles: { name: "Riddles", icon: "fas fa-question", color: "amber", text: "Think sideways. The answer is often simpler than you think." },
  maths: { name: "Quick Maths", icon: "fas fa-calculator", color: "emerald", text: "Everyday maths: percentages, time, money and shapes." },
  history: { name: "From History", icon: "fas fa-landmark", color: "rose", text: "Famous puzzles from great thinkers, from Baghdad to Berlin." },
};

export const PUZZLES = [
  // ---------------------------------------------------------------- Patterns
  { id: "p1", cat: "patterns", q: "What comes next?  2, 4, 8, 16, …", a: "32", o: ["24", "30", "36"], hint: "Compare each number with the one before it.", why: "Each number doubles: 16 × 2 = 32." },
  { id: "p2", cat: "patterns", q: "What comes next?  1, 1, 2, 3, 5, 8, …", a: "13", o: ["11", "12", "16"], hint: "Look at the two numbers before each one.", why: "Each number is the sum of the two before it: 5 + 8 = 13. This is the Fibonacci sequence." },
  { id: "p3", cat: "patterns", q: "What comes next?  3, 6, 11, 18, 27, …", a: "38", o: ["36", "35", "40"], hint: "Find the gaps between the numbers.", why: "The gaps are 3, 5, 7, 9 — odd numbers. The next gap is 11: 27 + 11 = 38." },
  { id: "p4", cat: "patterns", q: "What comes next?  1, 4, 9, 16, 25, …", a: "36", o: ["30", "34", "49"], hint: "1 × 1, 2 × 2, …", why: "These are square numbers: 6 × 6 = 36." },
  { id: "p5", cat: "patterns", q: "What comes next?  2, 3, 5, 7, 11, …", a: "13", o: ["12", "14", "15"], hint: "What is special about each of these numbers?", why: "They are prime numbers (only divisible by 1 and themselves). The next prime after 11 is 13." },
  { id: "p6", cat: "patterns", q: "What comes next?  100, 95, 85, 70, 50, …", a: "25", o: ["30", "20", "35"], hint: "How much is taken away each time?", why: "Take away 5, 10, 15, 20, then 25: 50 − 25 = 25." },
  { id: "p7", cat: "patterns", q: "What comes next?  1, 8, 27, 64, …", a: "125", o: ["100", "81", "128"], hint: "1 × 1 × 1, 2 × 2 × 2, …", why: "These are cube numbers: 5 × 5 × 5 = 125." },
  { id: "p8", cat: "patterns", q: "Which letter comes next?  A, C, F, J, O, …", a: "U", o: ["T", "S", "V"], hint: "Count how many letters you jump each time.", why: "The jumps grow: +2, +3, +4, +5, then +6. O is the 15th letter, and the 21st letter is U." },
  { id: "p9", cat: "patterns", q: "What comes next?  2, 6, 12, 20, 30, …", a: "42", o: ["40", "36", "44"], hint: "1 × 2, 2 × 3, …", why: "Each term is n × (n + 1): 6 × 7 = 42. Or: the gaps are 4, 6, 8, 10, 12." },
  { id: "p10", cat: "patterns", q: "Which letter comes next?  J, F, M, A, M, J, …", a: "J", o: ["A", "S", "O"], hint: "Think of the calendar.", why: "They are the first letters of the months: January, February, March, April, May, June — next is July." },
  { id: "p11", cat: "patterns", q: "What comes next?  1, 3, 7, 15, 31, …", a: "63", o: ["47", "62", "64"], hint: "Double, then do something small.", why: "Each number is doubled plus 1: 31 × 2 + 1 = 63." },
  { id: "p12", cat: "patterns", q: "What comes next?  4, 7, 13, 25, 49, …", a: "97", o: ["73", "98", "96"], hint: "Double, then adjust.", why: "Each number is doubled minus 1: 49 × 2 − 1 = 97." },
  { id: "p13", cat: "patterns", q: "Which letter comes next?  Z, X, V, T, R, …", a: "P", o: ["Q", "O", "N"], hint: "Go backwards through the alphabet.", why: "Backwards, skipping one letter each time: R, (Q), P." },
  { id: "p14", cat: "patterns", q: "What comes next?  1, 2, 6, 24, 120, …", a: "720", o: ["240", "600", "144"], hint: "What do you multiply by each time?", why: "Multiply by 2, 3, 4, 5, then 6: 120 × 6 = 720. These are factorials." },
  { id: "p15", cat: "patterns", q: "Which letter comes next?  M, T, W, T, F, …", a: "S", o: ["M", "T", "F"], hint: "Think of the week.", why: "Monday, Tuesday, Wednesday, Thursday, Friday — next is Saturday." },
  { id: "p16", cat: "patterns", q: "Which is the odd one out?  2, 3, 5, 9, 11", a: "9", o: ["2", "5", "11"], hint: "Four of them share something special.", why: "2, 3, 5 and 11 are prime. 9 is not (9 = 3 × 3)." },
  { id: "p17", cat: "patterns", q: "What comes next?  81, 27, 9, 3, …", a: "1", o: ["0", "2", "1.5"], hint: "Divide.", why: "Each number is divided by 3: 3 ÷ 3 = 1." },
  { id: "p18", cat: "patterns", q: "What comes next?  5, 10, 20, 35, 55, …", a: "80", o: ["75", "70", "85"], hint: "Look at the gaps.", why: "The gaps are 5, 10, 15, 20, then 25: 55 + 25 = 80." },

  // ------------------------------------------------------------------ Logic
  { id: "l1", cat: "logic", q: "Ali is taller than Bilal. Bilal is taller than Sara. Who is the shortest?", a: "Sara", o: ["Ali", "Bilal", "We can't tell"], hint: "Line them up from tallest to shortest.", why: "Ali > Bilal > Sara, so Sara is the shortest." },
  { id: "l2", cat: "logic", q: "All roses are flowers. Some flowers fade quickly. Can we be sure that some roses fade quickly?", a: "No, we can't be sure", o: ["Yes, definitely", "Only red roses", "Roses never fade"], hint: "Do the flowers that fade quickly have to be roses?", why: "The flowers that fade quickly might all be other flowers, like tulips. So we cannot be sure about roses." },
  { id: "l3", cat: "logic", q: "In a race, Hamza finished before Omar. Omar finished before Zain. Ayesha finished after Zain. Fatima finished before Hamza. Who came last?", a: "Ayesha", o: ["Zain", "Omar", "Fatima"], hint: "Write the names in order as you read each clue.", why: "The order is Fatima, Hamza, Omar, Zain, Ayesha." },
  { id: "l4", cat: "logic", q: "If 5 machines take 5 minutes to make 5 toys, how long do 100 machines take to make 100 toys?", a: "5 minutes", o: ["100 minutes", "20 minutes", "1 minute"], hint: "How long does ONE machine take to make ONE toy?", why: "Each machine makes one toy in 5 minutes. 100 machines working together make 100 toys in the same 5 minutes." },
  { id: "l5", cat: "logic", q: "A notebook and a pen cost 11 riyals in total. The notebook costs 10 riyals more than the pen. How much is the pen?", a: "50 halalas (0.5 riyal)", o: ["1 riyal", "10 riyals", "1.5 riyals"], hint: "If the pen were 1 riyal, the notebook would be 11 — too much.", why: "Pen = x, notebook = x + 10. So 2x + 10 = 11, x = 0.5 riyal." },
  { id: "l6", cat: "logic", q: "Water lilies on a lake double in size every day. They cover the whole lake on day 48. On which day did they cover half the lake?", a: "Day 47", o: ["Day 24", "Day 36", "Day 46"], hint: "Think backwards from the full lake.", why: "They double each day, so the day before the lake was full, it was half full: day 47." },
  { id: "l7", cat: "logic", q: "Three boxes are labelled Apples, Oranges and Mixed. Every label is wrong. You may take out one fruit from one box. Which box should you choose to fix all the labels?", a: "The box labelled Mixed", o: ["The box labelled Apples", "The box labelled Oranges", "It is impossible"], hint: "Which box can't really be mixed?", why: "The 'Mixed' box must hold only one kind. If you pull an apple, it's the Apples box. Then the box labelled Oranges can't be oranges or apples, so it's Mixed, and the last box is Oranges." },
  { id: "l8", cat: "logic", q: "Sara's father has five daughters: Nana, Nene, Nini and Nono. What is the fifth daughter's name?", a: "Sara", o: ["Nunu", "Nina", "Nana"], hint: "Read the first two words again.", why: "It's Sara's father, so Sara is the fifth daughter." },
  { id: "l9", cat: "logic", q: "Which is heavier: a kilogram of iron or a kilogram of cotton?", a: "They weigh the same", o: ["Iron", "Cotton", "It depends on the weather"], hint: "Read the question slowly.", why: "A kilogram is a kilogram. They have the same mass; the cotton just takes up more space." },
  { id: "l10", cat: "logic", q: "In a race, you overtake the person in second place. What place are you in now?", a: "Second", o: ["First", "Third", "Last"], hint: "You took their place, not the leader's.", why: "You passed the person in second, so now you are second." },
  { id: "l11", cat: "logic", q: "One guard always tells the truth and the other always lies. Guard A says: 'B is a liar.' Guard B says: 'We both tell the truth.' Who tells the truth?", a: "Guard A", o: ["Guard B", "Both", "Neither"], hint: "Can B's sentence possibly be true?", why: "If B told the truth, both would be honest — but then A's statement would be false. So B lies, and A's statement 'B is a liar' is true." },
  { id: "l12", cat: "logic", q: "In a row of students, Ahmed is 7th from the left and 5th from the right. How many students are in the row?", a: "11", o: ["12", "13", "10"], hint: "Don't count Ahmed twice.", why: "6 students to his left + Ahmed + 4 to his right = 11. (7 + 5 − 1 = 11.)" },
  { id: "l13", cat: "logic", q: "A farmer has 17 goats. All but 9 run away. How many are left?", a: "9", o: ["8", "17", "0"], hint: "'All but 9' means…", why: "All except 9 ran away, so 9 goats are left." },
  { id: "l14", cat: "logic", q: "If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?", a: "3", o: ["100", "33", "300"], hint: "How fast do the 3 cats catch mice together?", why: "Together the 3 cats catch 1 mouse per minute. In 100 minutes they catch 100 mice. So 3 cats are enough." },
  { id: "l15", cat: "logic", q: "If the day before yesterday was Friday, what day is tomorrow?", a: "Monday", o: ["Sunday", "Saturday", "Tuesday"], hint: "Work out today first.", why: "Day before yesterday = Friday, yesterday = Saturday, today = Sunday, so tomorrow is Monday." },
  { id: "l16", cat: "logic", q: "A clock shows 3:15. What is the angle between the hour hand and the minute hand?", a: "7.5°", o: ["0°", "15°", "90°"], hint: "The hour hand doesn't stay exactly on the 3.", why: "The minute hand is at 90°. The hour hand has moved a quarter of the way from 3 to 4: 90° + 7.5° = 97.5°. The difference is 7.5°." },

  // ---------------------------------------------------------------- Riddles
  { id: "r1", cat: "riddles", q: "What has keys but can't open locks?", a: "A piano", o: ["A door", "A map", "A car"], hint: "You can play it.", why: "A piano has keys you press to make music." },
  { id: "r2", cat: "riddles", q: "What gets wetter the more it dries?", a: "A towel", o: ["The sea", "A sponge", "Rain"], hint: "You use it after a shower.", why: "A towel gets wetter as it dries you." },
  { id: "r3", cat: "riddles", q: "What has hands but cannot clap?", a: "A clock", o: ["A statue", "A glove", "A robot"], hint: "It tells you something all day long.", why: "A clock has an hour hand and a minute hand." },
  { id: "r4", cat: "riddles", q: "The more you take, the more you leave behind. What are they?", a: "Footsteps", o: ["Photos", "Breaths", "Coins"], hint: "Think of walking on sand.", why: "Every step you take leaves a footprint behind." },
  { id: "r5", cat: "riddles", q: "What has a neck but no head?", a: "A bottle", o: ["A shirt", "A giraffe", "A guitar case"], hint: "You drink from it.", why: "The narrow top of a bottle is called its neck." },
  { id: "r6", cat: "riddles", q: "What can travel around the world while staying in a corner?", a: "A stamp", o: ["A satellite", "The wind", "A map"], hint: "Think of an envelope.", why: "A stamp sits in the corner of an envelope while the letter travels." },
  { id: "r7", cat: "riddles", q: "What has many teeth but can't bite?", a: "A comb", o: ["A shark", "A zip", "A saw"], hint: "It's used on hair.", why: "A comb has many 'teeth' but no bite." },
  { id: "r8", cat: "riddles", q: "I'm tall when I'm young and short when I'm old. What am I?", a: "A candle", o: ["A tree", "A pencil", "A shadow"], hint: "It shrinks while it gives light.", why: "A candle melts and gets shorter as it burns." },
  { id: "r9", cat: "riddles", q: "What belongs to you, but other people use it more than you do?", a: "Your name", o: ["Your phone", "Your money", "Your house"], hint: "People call you by it.", why: "Other people say your name far more often than you do." },
  { id: "r10", cat: "riddles", q: "What has an eye but cannot see?", a: "A needle", o: ["A spoon", "A shoe", "A camera"], hint: "It's used for sewing.", why: "The hole in a needle, where the thread goes, is called its eye." },
  { id: "r11", cat: "riddles", q: "What goes up but never comes down?", a: "Your age", o: ["A balloon", "Smoke", "A rocket"], hint: "It changes on your birthday.", why: "Your age only ever goes up." },
  { id: "r12", cat: "riddles", q: "What can you catch but not throw?", a: "A cold", o: ["A ball", "A fish", "A bus"], hint: "It makes you sneeze.", why: "You can catch a cold, but you can't throw one." },
  { id: "r13", cat: "riddles", q: "Which month has 28 days?", a: "All of them", o: ["February", "None", "Only in a leap year"], hint: "Read carefully: 'has 28 days', not 'has only 28 days'.", why: "Every month has at least 28 days." },
  { id: "r14", cat: "riddles", q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "The letter M", o: ["A second", "A blink", "Luck"], hint: "Look at the spelling of the words.", why: "'Minute' has one M, 'moment' has two, 'a thousand years' has none." },
  { id: "r15", cat: "riddles", q: "What is full of holes but still holds water?", a: "A sponge", o: ["A net", "A bucket", "A sieve"], hint: "You use it to wash dishes.", why: "A sponge is full of holes, yet it soaks up and holds water." },
  { id: "r16", cat: "riddles", q: "What has words but never speaks?", a: "A book", o: ["A parrot", "A radio", "A teacher"], hint: "You're reading one at school.", why: "A book is full of words, but it is silent." },

  // ------------------------------------------------------------------ Maths
  { id: "m1", cat: "maths", q: "What is 15% of 200?", a: "30", o: ["15", "20", "35"], hint: "10% of 200 is 20. What is 5%?", why: "10% = 20 and 5% = 10, so 15% = 30." },
  { id: "m2", cat: "maths", q: "A train leaves at 9:40 and the journey takes 2 hours 35 minutes. When does it arrive?", a: "12:15", o: ["11:75", "12:05", "11:15"], hint: "Add the hours first, then the minutes.", why: "9:40 + 2 h = 11:40. 11:40 + 35 min = 12:15." },
  { id: "m3", cat: "maths", q: "Which is bigger: 2¹⁰ or 10³?", a: "2¹⁰", o: ["10³", "They are equal", "It can't be worked out"], hint: "2¹⁰ = 2 × 2 × … (ten times).", why: "2¹⁰ = 1,024 and 10³ = 1,000, so 2¹⁰ is bigger." },
  { id: "m4", cat: "maths", q: "What is the average of 4, 8, 15 and 23?", a: "12.5", o: ["12", "13", "15"], hint: "Add them up, then divide by how many there are.", why: "4 + 8 + 15 + 23 = 50, and 50 ÷ 4 = 12.5." },
  { id: "m5", cat: "maths", q: "A shirt costs 80 riyals. In a sale it is 25% off. What is the new price?", a: "60 riyals", o: ["55 riyals", "65 riyals", "20 riyals"], hint: "25% is a quarter.", why: "A quarter of 80 is 20. 80 − 20 = 60 riyals." },
  { id: "m6", cat: "maths", q: "Half of a number plus 7 equals 20. What is the number?", a: "26", o: ["13", "27", "6.5"], hint: "First take 7 away from 20.", why: "Half the number = 20 − 7 = 13, so the number is 26." },
  { id: "m7", cat: "maths", q: "How many minutes are there in one day?", a: "1,440", o: ["1,200", "3,600", "720"], hint: "24 hours × 60 minutes.", why: "24 × 60 = 1,440 minutes." },
  { id: "m8", cat: "maths", q: "Two angles of a triangle are 50° and 60°. What is the third angle?", a: "70°", o: ["80°", "90°", "60°"], hint: "The angles in a triangle add up to 180°.", why: "180° − 50° − 60° = 70°." },
  { id: "m9", cat: "maths", q: "A square has a perimeter of 36 cm. What is its area?", a: "81 cm²", o: ["36 cm²", "144 cm²", "72 cm²"], hint: "First find the length of one side.", why: "Each side is 36 ÷ 4 = 9 cm, so the area is 9 × 9 = 81 cm²." },
  { id: "m10", cat: "maths", q: "What is ½ + ⅓?", a: "⅚", o: ["⅖", "⅔", "¼"], hint: "Use sixths.", why: "½ = 3/6 and ⅓ = 2/6, so the total is 5/6." },
  { id: "m11", cat: "maths", q: "A car travels 150 km in 2½ hours. What is its average speed?", a: "60 km/h", o: ["75 km/h", "50 km/h", "65 km/h"], hint: "Speed = distance ÷ time.", why: "150 ÷ 2.5 = 60 km/h." },
  { id: "m12", cat: "maths", q: "If x + 2x + 3x = 48, what is x?", a: "8", o: ["6", "16", "12"], hint: "Add up the x's first.", why: "6x = 48, so x = 8." },
  { id: "m13", cat: "maths", q: "Ali and Sara share 60 sweets in the ratio 2 : 3. How many does Sara get?", a: "36", o: ["24", "30", "40"], hint: "2 + 3 = 5 parts in total.", why: "One part = 60 ÷ 5 = 12. Sara gets 3 parts = 36." },
  { id: "m14", cat: "maths", q: "What is 25 × 44?", a: "1,100", o: ["1,000", "1,040", "1,150"], hint: "25 × 4 = 100.", why: "25 × 44 = 25 × 4 × 11 = 100 × 11 = 1,100." },
  { id: "m15", cat: "maths", q: "A phone was 1,000 riyals. Its price went up 10%, then down 10%. What does it cost now?", a: "990 riyals", o: ["1,000 riyals", "1,010 riyals", "900 riyals"], hint: "The 10% off is taken from the NEW price.", why: "Up 10%: 1,100. Down 10% of 1,100 (110): 990 riyals." },
  { id: "m16", cat: "maths", q: "How many seconds are there in one hour?", a: "3,600", o: ["360", "6,000", "1,440"], hint: "60 minutes × 60 seconds.", why: "60 × 60 = 3,600 seconds." },

  // ---------------------------------------------------------------- History
  { id: "h1", cat: "history", q: "Al-Khwarizmi, Baghdad, about 820 AD: \"A square and ten of its roots make thirty-nine.\" In today's maths, x² + 10x = 39. What is x?", a: "3", o: ["4", "13", "9"], hint: "Try small numbers: 3² + 10 × 3 = ?", why: "9 + 30 = 39, so x = 3. Al-Khwarizmi solved it by 'completing the square'. His book 'al-jabr' gave us the word algebra, and his name gave us 'algorithm'." },
  { id: "h2", cat: "history", q: "Fibonacci's rabbits (Italy, 1202): the number of rabbit pairs each month goes 1, 1, 2, 3, 5, 8, … How many pairs are there in month 8?", a: "21", o: ["13", "16", "34"], hint: "Each month = the two months before added together.", why: "1, 1, 2, 3, 5, 8, 13, 21. Fibonacci's book Liber Abaci also brought the Hindu-Arabic numerals (0–9) to Europe." },
  { id: "h3", cat: "history", q: "Alcuin of York (about 800 AD): a farmer must take a wolf, a goat and a cabbage across a river. His boat holds him and one thing. What is the fewest crossings he needs?", a: "7", o: ["3", "5", "9"], hint: "He has to bring something BACK at one point.", why: "Goat over, return, wolf over, bring goat back, cabbage over, return, goat over: 7 crossings. Try it yourself below!" },
  { id: "h4", cat: "history", q: "Königsberg had 7 bridges joining 4 areas of land. Can you walk through the city crossing every bridge exactly once?", a: "No, it's impossible", o: ["Yes, starting from the island", "Yes, from anywhere", "Only on Sundays"], hint: "Count how many bridges touch each piece of land.", why: "In 1736 Leonhard Euler proved it is impossible: each area had an odd number of bridges. His proof started a new branch of maths called graph theory." },
  { id: "h5", cat: "history", q: "The story goes that a young Carl Friedrich Gauss was asked to add all the numbers from 1 to 100. He answered in seconds. What is the total?", a: "5,050", o: ["5,000", "10,100", "4,950"], hint: "Pair them up: 1 + 100, 2 + 99, 3 + 98…", why: "There are 50 pairs that each make 101: 50 × 101 = 5,050." },
  { id: "h6", cat: "history", q: "Tower of Hanoi (Édouard Lucas, 1883): what is the fewest moves needed to move a tower of 3 discs?", a: "7", o: ["6", "8", "9"], hint: "The rule is 2ⁿ − 1 for n discs.", why: "2³ − 1 = 7 moves. The legend says monks are moving 64 golden discs: at one move a second it would take about 585 billion years!" },
  { id: "h7", cat: "history", q: "An old legend from India and Persia: the inventor of chess asked for 1 grain of rice on the first square, 2 on the second, 4 on the third, doubling each time. How many grains go on the 10th square?", a: "512", o: ["20", "1,024", "100"], hint: "Square 1 = 2⁰, square 2 = 2¹ …", why: "Square 10 = 2⁹ = 512. By square 64 it would be more rice than the whole world grows in centuries." },
  { id: "h8", cat: "history", q: "Al-Khwarizmi's numbers (0 to 9) spread from India through Baghdad to the world. Which number did Indian mathematicians like Brahmagupta (628 AD) first treat as a real number with its own rules?", a: "Zero", o: ["One", "Ten", "Pi"], hint: "It means 'nothing'.", why: "Brahmagupta wrote rules for zero, such as 'a number minus itself is zero'. The Arabic word ṣifr (empty) gave us both 'zero' and 'cipher'." },
];

export const PUZZLE_BY_ID = Object.fromEntries(PUZZLES.map((p) => [p.id, p]));
export const DAILY_ORDER = ["patterns", "logic", "riddles", "maths", "history"];

// ----------------------------------------------------------- Randomness ---

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const seeded = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Same order every time for the same key (so answers don't jump around).
export const seededShuffle = (xs, key) => {
  const r = seeded(hash(key));
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const optionsFor = (p) => seededShuffle([p.a, ...p.o], p.id);

// Today's 5 puzzles: one of each kind, the same for everyone on the same date.
// Each kind steps through its own shuffled list, so puzzles don't repeat until all have been used.
export const dailySet = (date) => {
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  return DAILY_ORDER.map((cat) => {
    const list = seededShuffle(PUZZLES.filter((p) => p.cat === cat), `vcs-${cat}`);
    return list[day % list.length];
  });
};

export const todayKey = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// Days in a row with the daily set finished, ending today (or yesterday).
export const streak = (days) => {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(todayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
};

// ------------------------------------------------------------- Badges -----

const dailyScore = (r, date) => {
  const day = r.daily[date];
  if (!day) return 0;
  return dailySet(date).filter((p) => day.picks[p.id] === p.a).length;
};

export const BADGES = [
  { id: "first", name: "First Solve", icon: "fas fa-lightbulb", text: "Solve your first puzzle", test: (r) => r.solved.length >= 1 },
  { id: "perfectDay", name: "Perfect Day", icon: "fas fa-star", text: "Get 5 out of 5 in a daily challenge", test: (r) => r.dailyDone.some((d) => dailyScore(r, d) === 5) },
  { id: "streak3", name: "Daily Thinker", icon: "fas fa-fire", text: "Finish the daily challenge 3 days in a row", test: (r) => streak(r.dailyDone) >= 3 },
  { id: "streak7", name: "Puzzle Habit", icon: "fas fa-calendar-check", text: "Finish the daily challenge 7 days in a row", test: (r) => streak(r.dailyDone) >= 7 },
  { id: "solver25", name: "Problem Solver", icon: "fas fa-puzzle-piece", text: "Solve 25 different puzzles", test: (r) => r.solved.length >= 25 },
  { id: "solver50", name: "Master Mind", icon: "fas fa-brain", text: "Solve 50 different puzzles", test: (r) => r.solved.length >= 50 },
  { id: "historian", name: "Time Traveller", icon: "fas fa-landmark", text: "Solve all 8 puzzles from history", test: (r) => PUZZLES.filter((p) => p.cat === "history").every((p) => r.solved.includes(p.id)) },
  { id: "sprint20", name: "Lightning Maths", icon: "fas fa-bolt", text: "Score 20 in the Maths Sprint", test: (r) => (r.best.sprint || 0) >= 20 },
  { id: "hanoi", name: "Tower Master", icon: "fas fa-layer-group", text: "Solve the 4-disc tower in 15 moves", test: (r) => r.best.hanoi?.[4] === 15 },
  { id: "river", name: "River Crosser", icon: "fas fa-sailboat", text: "Cross the river in 7 trips", test: (r) => r.best.river === 7 },
];

// --------------------------------------------------------- History cards --

export const THINKERS = [
  { name: "Al-Khwarizmi", when: "c. 780–850 · Baghdad", color: "emerald", icon: "fas fa-square-root-variable", text: "Worked at the House of Wisdom in Baghdad. His book on 'al-jabr' gave the world the word algebra, and his name became 'algorithm' — the idea behind every computer program." },
  { name: "Alcuin of York", when: "c. 735–804 · England and France", color: "amber", icon: "fas fa-sailboat", text: "Teacher at the court of Charlemagne. He wrote 'Problems to Sharpen the Young', one of the oldest puzzle books, with the famous river crossing." },
  { name: "Fibonacci", when: "c. 1170–1250 · Pisa, Italy", color: "violet", icon: "fas fa-seedling", text: "Learned mathematics in North Africa and wrote Liber Abaci (1202), which brought the numerals 0–9 to Europe. His rabbit puzzle gives the Fibonacci numbers found in sunflowers and pine cones." },
  { name: "Leonhard Euler", when: "1707–1783 · Switzerland", color: "cyan", icon: "fas fa-bridge", text: "Proved in 1736 that nobody could cross Königsberg's 7 bridges exactly once. That proof started graph theory, used today in maps, networks and social media." },
  { name: "Carl Friedrich Gauss", when: "1777–1855 · Germany", color: "indigo", icon: "fas fa-plus", text: "Called the 'prince of mathematicians'. The story goes that as a schoolboy he added 1 to 100 in seconds by pairing the numbers." },
  { name: "Édouard Lucas", when: "1842–1891 · France", color: "rose", icon: "fas fa-layer-group", text: "Invented the Tower of Hanoi in 1883 and studied the Fibonacci numbers. The Lucas numbers are named after him." },
];

export const SOURCES = [
  "Al-Khwarizmi, The Compendious Book on Calculation by Completion and Balancing (c. 820) — the 'square and ten roots equal thirty-nine' example.",
  "Alcuin of York, Propositiones ad acuendos juvenes (c. 800) — river-crossing problem.",
  "Fibonacci, Liber Abaci (1202) — the rabbit problem.",
  "Euler, L. (1736). Solutio problematis ad geometriam situs pertinentis — the bridges of Königsberg.",
  "Lucas, É. (1883). La Tour d'Hanoï.",
];

export const shareLink = (text) =>
  `https://wa.me/?text=${encodeURIComponent(`${text} Can you beat me? https://virtualcityschool.com/mind-lab/brain-teasers`)}`;
