/**
 * Scholarships that open every year, for Cambridge O / A Level students and
 * graduates in Pakistan and the Gulf (founder, 2026-11-10: "specially which are
 * regular each year").
 *
 * Every link is the scholarship's own official page (no aggregator sites).
 * Windows are the months the scholarship has usually been open in recent years;
 * exact dates move a little each year, so the page tells students to check the
 * official page. `opens` / `closes` are month numbers (1 = January) used to
 * show "usually open now" / "usually opens in …".
 *
 * audience: "school"   = for students finishing O / A Level (a first degree)
 *           "graduate" = for students who already have a first degree
 */

export const SCHOLARSHIP_DEGREES = ["All Degrees", "Bachelors", "Masters", "PhD"];

export const SCHOLARSHIP_AUDIENCES = [
  { key: "all", label: "Everyone" },
  { key: "school", label: "Finishing O / A Level" },
  { key: "graduate", label: "University graduates" },
];

export const SCHOLARSHIP_COVERAGE_TYPES = ["All Funding", "Fully Funded", "Tuition Waiver / Partial"];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = MONTHS.map((m) => m.slice(0, 3));

const RAW = [
  // ───────── For students finishing O / A Level (first degree) ─────────
  {
    id: "turkiye-burslari",
    title: "Türkiye Bursları (Türkiye Scholarships)",
    provider: "Government of Türkiye",
    country: "Turkey", flag: "🇹🇷", audience: "school", degrees: ["Bachelors", "Masters", "PhD"],
    coverageType: "Fully Funded", opens: 1, closes: 2,
    summary: "Türkiye's government scholarship for every level of study, with a Turkish language year included.",
    offered: ["Full tuition at a Turkish public university", "Monthly stipend and free university housing", "Return flight and health insurance", "One-year Turkish language course"],
    requirements: ["Bachelors: under 21 with at least 70% in A Level / HSSC", "Online application on the official portal", "Interview for shortlisted students"],
    pak: { target: "Pakistani and Gulf-based students of any nationality except Turkish.", academic: "A Level / HSSC with at least 70% for Bachelors; a degree with good grades for Masters / PhD.", english: "No IELTS needed; teaching is mostly in Turkish after the language year.", notes: "Student visa arranged after selection." },
    link: "https://www.turkiyeburslari.gov.tr/",
  },
  {
    id: "mext-undergraduate",
    title: "MEXT Japanese Government Scholarship — Undergraduate",
    provider: "Ministry of Education (MEXT), Japan, via the Embassy of Japan",
    country: "Japan", flag: "🇯🇵", audience: "school", degrees: ["Bachelors"],
    coverageType: "Fully Funded", opens: 4, closes: 5,
    summary: "Five years in Japan (one language year + a four-year degree), fully paid by the Japanese government.",
    offered: ["Full tuition and exam fees", "Monthly allowance (about ¥117,000)", "Return air ticket", "One year of Japanese language study"],
    requirements: ["Aged 17–24 and finished 12 years of schooling", "Written tests (Maths, English, Science) at the Embassy", "Interview"],
    pak: { target: "Pakistani students apply through the Embassy of Japan in Islamabad; Gulf residents through the Japanese embassy of their country of nationality.", academic: "A Level / HSSC completed or completing, strong in Maths and Science.", english: "Embassy English test; no IELTS needed.", notes: "Embassy recommendation track, announced each spring." },
    link: "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/",
  },
  {
    id: "gks-undergraduate",
    title: "Global Korea Scholarship (GKS) — Undergraduate",
    provider: "National Institute for International Education (NIIED), Korea",
    country: "South Korea", flag: "🇰🇷", audience: "school", degrees: ["Bachelors"],
    coverageType: "Fully Funded", opens: 9, closes: 10,
    summary: "A full Korean government scholarship for a bachelor's degree, with a Korean language year first.",
    offered: ["Full tuition", "Monthly allowance (about KRW 1,000,000)", "Flights, settlement allowance and health insurance", "One year of Korean language training"],
    requirements: ["Under 25, with a school-leaving average of at least 80%", "Apply through the Korean embassy or a Korean university", "Neither the student nor parents hold Korean citizenship"],
    pak: { target: "Pakistan is a GKS partner country.", academic: "A Level / HSSC average of 80% or more.", english: "IELTS / TOEFL helps but is not always required.", notes: "Embassy track and university track both open in autumn." },
    link: "https://www.studyinkorea.go.kr/",
  },
  {
    id: "chinese-government-scholarship",
    title: "Chinese Government Scholarship (CSC)",
    provider: "China Scholarship Council",
    country: "China", flag: "🇨🇳", audience: "school", degrees: ["Bachelors", "Masters", "PhD"],
    coverageType: "Fully Funded", opens: 1, closes: 4,
    summary: "China's government scholarship at over 280 universities, for bachelor's, master's and PhD study.",
    offered: ["Full tuition", "Free university housing", "Monthly stipend (CNY 2,500–3,500)", "Health insurance"],
    requirements: ["Bachelors: under 25 with a high-school certificate", "Apply through a Chinese university or the embassy / HEC", "Medical form"],
    pak: { target: "Pakistani students (HEC nominates part of the quota).", academic: "Good A Level / HSSC results for Bachelors.", english: "Many programmes in English; IELTS not always needed.", notes: "Each university sets its own deadline inside the window." },
    link: "https://www.campuschina.org/",
  },
  {
    id: "stipendium-hungaricum",
    title: "Stipendium Hungaricum",
    provider: "Tempus Public Foundation, Hungary",
    country: "Hungary", flag: "🇭🇺", audience: "school", degrees: ["Bachelors", "Masters", "PhD"],
    coverageType: "Fully Funded", opens: 11, closes: 1,
    summary: "Hungary's government scholarship at its universities, nominated through each partner country.",
    offered: ["Free tuition", "Monthly stipend", "University housing or a housing allowance", "Health insurance"],
    requirements: ["Online application on the official portal", "Nomination by the home country's partner body (HEC in Pakistan)", "University entrance exam or interview"],
    pak: { target: "Pakistan is a partner country; HEC handles the nomination.", academic: "A Level / HSSC for Bachelors; a degree for Masters.", english: "Programmes taught in English; English proof usually needed.", notes: "Apply to Stipendium Hungaricum and to HEC." },
    link: "https://stipendiumhungaricum.hu/",
  },
  {
    id: "study-in-saudi",
    title: "Study in Saudi — Saudi University Scholarships",
    provider: "Ministry of Education, Saudi Arabia",
    country: "Saudi Arabia", flag: "🇸🇦", audience: "school", degrees: ["Bachelors", "Masters", "PhD"],
    coverageType: "Fully Funded", opens: 1, closes: 4,
    summary: "Fully paid places for international students at Saudi public universities, including the Islamic University of Madinah, King Saud and King Abdulaziz.",
    offered: ["Free tuition", "Monthly stipend", "University housing and meals allowance", "Yearly return ticket and health care"],
    requirements: ["Apply on the official Study in Saudi portal", "School certificate (attested) for Bachelors", "Age limits set by each university"],
    pak: { target: "Pakistani students, and students living in the Gulf.", academic: "Good A Level / HSSC results.", english: "Many programmes in Arabic; some in English.", notes: "Visa and residency arranged by the university." },
    link: "https://studyinsaudi.moe.gov.sa/",
  },
  {
    id: "nyu-abu-dhabi",
    title: "NYU Abu Dhabi — Full Financial Aid",
    provider: "New York University Abu Dhabi",
    country: "UAE", flag: "🇦🇪", audience: "school", degrees: ["Bachelors"],
    coverageType: "Fully Funded", opens: 9, closes: 1,
    summary: "NYU Abu Dhabi meets the full financial need of every admitted student, including international students.",
    offered: ["Aid that can cover tuition, housing and meals", "Travel home and study-abroad semesters", "Need-based grants, not loans"],
    requirements: ["Common App application", "Strong A Levels / predicted grades", "Financial aid forms with the application"],
    pak: { target: "Pakistani and Gulf students applying for a first degree.", academic: "Excellent A Level or IB results; SAT optional.", english: "English proof may be asked.", notes: "Early Decision usually 1 November; Regular Decision early January." },
    link: "https://nyuad.nyu.edu/en/apply/undergraduate/scholarships-and-financial-aid.html",
  },
  {
    id: "us-need-blind",
    title: "US universities that meet full need for international students",
    provider: "Harvard, Yale, Princeton, MIT, Amherst, Dartmouth and others",
    country: "United States", flag: "🇺🇸", audience: "school", degrees: ["Bachelors"],
    coverageType: "Fully Funded", opens: 8, closes: 1,
    summary: "A small group of US universities admit international students need-blind and pay their full financial need.",
    offered: ["Tuition, housing and meals according to family income", "Grants that do not have to be repaid", "Travel support at some universities"],
    requirements: ["Common App with essays and teacher letters", "Strong A Levels / predicted grades", "CSS Profile or the university's own aid form"],
    pak: { target: "Pakistani and Gulf students applying for a first degree.", academic: "Top A Level / IB results; SAT required or optional per university.", english: "IELTS / TOEFL / Duolingo usually needed.", notes: "Early deadlines around 1 November; regular around 1 January." },
    link: "https://www.educationusa.state.gov/",
  },
  {
    id: "lester-b-pearson",
    title: "Lester B. Pearson International Scholarship",
    provider: "University of Toronto",
    country: "Canada", flag: "🇨🇦", audience: "school", degrees: ["Bachelors"],
    coverageType: "Fully Funded", opens: 10, closes: 1,
    summary: "Four years at the University of Toronto with tuition, books and residence fully paid.",
    offered: ["Full tuition", "Books and incidental fees", "Full residence support for four years"],
    requirements: ["Nominated by your school (school deadline in autumn)", "Apply to U of T by early November", "Final year of secondary school"],
    pak: { target: "Pakistani and Gulf students in their final school year.", academic: "Exceptional A Level / IB results and leadership.", english: "English proof as per U of T admissions.", notes: "Ask your school's counsellor about nomination early." },
    link: "https://future.utoronto.ca/pearson/about/",
  },
  {
    id: "ubc-international-scholars",
    title: "UBC International Scholars Program",
    provider: "University of British Columbia",
    country: "Canada", flag: "🇨🇦", audience: "school", degrees: ["Bachelors"],
    coverageType: "Tuition Waiver / Partial", opens: 9, closes: 12,
    summary: "UBC's need-based awards for outstanding international students, covering tuition and living costs as needed.",
    offered: ["Award based on financial need, renewable for four years", "Can cover tuition, fees and living costs"],
    requirements: ["School nomination for some awards", "Apply to UBC by the early deadline", "Financial need form"],
    pak: { target: "Pakistani and Gulf students applying for a first degree.", academic: "Top A Level / IB results and leadership.", english: "English proof as per UBC admissions.", notes: "Nomination deadlines usually November–December." },
    link: "https://you.ubc.ca/financial-planning/scholarships-awards-international-students/",
  },
  {
    id: "holland-scholarship",
    title: "Holland Scholarship",
    provider: "Dutch Ministry of Education with Dutch universities",
    country: "Netherlands", flag: "🇳🇱", audience: "school", degrees: ["Bachelors", "Masters"],
    coverageType: "Tuition Waiver / Partial", opens: 11, closes: 5,
    summary: "A €5,000 award in the first year for non-EU students at participating Dutch universities.",
    offered: ["€5,000 in the first year of study"],
    requirements: ["Apply to a participating Dutch university", "Non-EU nationality", "First time studying in the Netherlands"],
    pak: { target: "Pakistani and Gulf students.", academic: "Admission to a participating programme.", english: "IELTS / TOEFL as per the university.", notes: "Deadlines usually 1 February or 1 May, by university." },
    link: "https://www.studyinnl.org/finances/holland-scholarship",
  },
  {
    id: "italy-dsu-grants",
    title: "Italy Regional Study Grants (DSU)",
    provider: "Italian regions (e.g. Lombardy, Lazio, Piedmont) with public universities",
    country: "Italy", flag: "🇮🇹", audience: "school", degrees: ["Bachelors", "Masters"],
    coverageType: "Fully Funded", opens: 7, closes: 9,
    summary: "Need-based regional grants for students at Italian public universities: free tuition plus a yearly cash grant.",
    offered: ["Tuition waiver at public universities", "Yearly grant (up to about €7,000)", "Free or subsidised meals and housing in some regions"],
    requirements: ["Admission to an Italian public university", "Family income and assets documents legalised by the Italian embassy", "Apply to the regional DSU office"],
    pak: { target: "Pakistani students (income papers through the Italian embassy).", academic: "A Level / HSSC with university admission.", english: "Many programmes in English.", notes: "Start the income paperwork in spring." },
    link: "https://www.universitaly.it/",
  },
  {
    id: "bocconi-international-awards",
    title: "Bocconi International Awards",
    provider: "Bocconi University, Milan",
    country: "Italy", flag: "🇮🇹", audience: "school", degrees: ["Bachelors", "Masters"],
    coverageType: "Tuition Waiver / Partial", opens: 10, closes: 4,
    summary: "Merit awards for international students at Bocconi, from a tuition waiver to a full package.",
    offered: ["Full or partial tuition waiver", "Some awards add a cash grant"],
    requirements: ["Apply to Bocconi in one of the admission rounds", "Strong school results and SAT / Bocconi test", "No separate scholarship form for most awards"],
    pak: { target: "Pakistani and Gulf students.", academic: "Excellent A Level / IB results.", english: "IELTS / TOEFL as per Bocconi.", notes: "Earlier rounds give more chances." },
    link: "https://www.unibocconi.it/en/current-students/funding",
  },
  {
    id: "brunei-government",
    title: "Brunei Darussalam Government Scholarship",
    provider: "Ministry of Foreign Affairs, Brunei",
    country: "Brunei", flag: "🇧🇳", audience: "school", degrees: ["Bachelors", "Masters", "PhD"],
    coverageType: "Fully Funded", opens: 12, closes: 2,
    summary: "Brunei's government scholarship for students from partner countries, including Pakistan, at Brunei's universities.",
    offered: ["Full tuition", "Monthly allowance", "Free university housing", "Return flight"],
    requirements: ["Apply through the Ministry of Foreign Affairs of Brunei (Pakistan: HEC announcement)", "Age limits by level", "Medical certificate"],
    pak: { target: "Pakistan is listed as a partner country.", academic: "Good A Level / HSSC results for Bachelors.", english: "IELTS 6.0 or similar usually asked.", notes: "Recent deadline: mid-February." },
    link: "https://www.mfa.gov.bn/",
  },
  {
    id: "american-university-of-sharjah",
    title: "American University of Sharjah Merit Scholarships",
    provider: "American University of Sharjah",
    country: "UAE", flag: "🇦🇪", audience: "school", degrees: ["Bachelors"],
    coverageType: "Tuition Waiver / Partial", opens: 10, closes: 5,
    summary: "Merit tuition scholarships for top students at one of the Gulf's leading universities, including expatriate students.",
    offered: ["Partial to full tuition waiver based on grades"],
    requirements: ["Apply to AUS", "High A Level / school grades", "Keep a minimum GPA to renew"],
    pak: { target: "Pakistani students in the UAE and the Gulf, and from Pakistan.", academic: "High A Level / IB grades.", english: "IELTS / TOEFL / EmSAT English.", notes: "Considered at admission." },
    link: "https://www.aus.edu/admissions/scholarships",
  },
  {
    id: "hbku-scholarships",
    title: "Hamad Bin Khalifa University Scholarships",
    provider: "Hamad Bin Khalifa University, Qatar",
    country: "Qatar", flag: "🇶🇦", audience: "school", degrees: ["Bachelors", "Masters", "PhD"],
    coverageType: "Tuition Waiver / Partial", opens: 10, closes: 3,
    summary: "Merit and need-based tuition scholarships at HBKU in Education City, Doha; graduate students can also get a monthly stipend.",
    offered: ["Tuition waiver from part to full", "Monthly stipend for selected graduate students"],
    requirements: ["Apply to HBKU; students are considered for scholarships at admission", "Strong grades", "English proof"],
    pak: { target: "International students, including Pakistanis.", academic: "Strong A Level results for Bachelors.", english: "IELTS / TOEFL.", notes: "Recent undergraduate deadline: around 1 March." },
    link: "https://www.hbku.edu.qa/en/admissions",
  },
  {
    id: "lums-nop",
    title: "LUMS National Outreach Programme (NOP)",
    provider: "Lahore University of Management Sciences",
    country: "Pakistan", flag: "🇵🇰", audience: "school", degrees: ["Bachelors"],
    coverageType: "Fully Funded", opens: 11, closes: 2,
    summary: "Fully funded places at LUMS for talented students from low-income families across Pakistan, with a free preparation programme.",
    offered: ["Full tuition", "Housing, meals, books and travel", "Free preparation sessions before the test"],
    requirements: ["Matric / O Level with at least 80%", "Family income below the NOP limit", "NOP test and interview"],
    pak: { target: "Pakistani students in their final school years.", academic: "Matric / O Level 80% or more.", english: "No IELTS; the NOP test includes English.", notes: "Recent deadline: February–March." },
    link: "https://nop.lums.edu.pk/",
  },
  {
    id: "habib-university-aid",
    title: "Habib University Scholarships and Financial Aid",
    provider: "Habib University, Karachi",
    country: "Pakistan", flag: "🇵🇰", audience: "school", degrees: ["Bachelors"],
    coverageType: "Tuition Waiver / Partial", opens: 10, closes: 5,
    summary: "Habib gives need-based aid to most of its students, up to 100% of tuition, plus merit scholarships.",
    offered: ["Need-based aid up to full tuition", "Merit scholarships for top results"],
    requirements: ["Apply to Habib University", "Financial aid form with family documents", "Admission test or SAT / interview"],
    pak: { target: "Pakistani students; also open to overseas Pakistanis.", academic: "A Level / HSSC.", english: "No IELTS.", notes: "Applications in rounds through the year." },
    link: "https://habib.edu.pk/financial-aid/",
  },
  {
    id: "hec-need-based",
    title: "HEC Need-Based Scholarship",
    provider: "Higher Education Commission, Pakistan",
    country: "Pakistan", flag: "🇵🇰", audience: "school", degrees: ["Bachelors", "Masters"],
    coverageType: "Fully Funded", opens: 9, closes: 11,
    summary: "HEC pays tuition and a living allowance for deserving students at participating public universities.",
    offered: ["Full tuition", "Living allowance each semester"],
    requirements: ["Admitted to a participating public university", "Family income below the HEC limit", "Apply through the university's financial aid office"],
    pak: { target: "Pakistani students at public universities.", academic: "Admission on merit.", english: "Not needed.", notes: "Your university announces the call each semester." },
    link: "https://www.hec.gov.pk/english/scholarshipsgrants/NBS/Pages/default.aspx",
  },
  {
    id: "benazir-undergraduate",
    title: "Benazir (Ehsaas) Undergraduate Scholarship",
    provider: "Higher Education Commission with BISP, Pakistan",
    country: "Pakistan", flag: "🇵🇰", audience: "school", degrees: ["Bachelors"],
    coverageType: "Fully Funded", opens: 9, closes: 12,
    summary: "Pakistan's largest undergraduate scholarship: tuition and a living allowance for students from low-income families.",
    offered: ["Full tuition", "Monthly living allowance"],
    requirements: ["Enrolled in a public university or college", "Family income below the programme limit", "Online application; no test"],
    pak: { target: "Pakistani students at public universities (not private ones).", academic: "Admission on merit.", english: "Not needed.", notes: "Window announced on the HEC portal, usually in autumn." },
    link: "https://ehsaas.hec.gov.pk/",
  },
  {
    id: "peef",
    title: "PEEF Scholarships",
    provider: "Punjab Educational Endowment Fund",
    country: "Pakistan", flag: "🇵🇰", audience: "school", degrees: ["Bachelors", "Masters"],
    coverageType: "Fully Funded", opens: 10, closes: 12,
    summary: "Punjab's merit-and-need scholarships for intermediate, undergraduate and master's students.",
    offered: ["Tuition fee", "Monthly stipend"],
    requirements: ["Punjab domicile (some quotas for other provinces)", "Good marks in the last exam", "Family income below the limit"],
    pak: { target: "Students with Punjab domicile and special quotas.", academic: "Good Matric / Intermediate marks.", english: "Not needed.", notes: "Apply online after results are out." },
    link: "https://www.peef.org.pk/",
  },
  {
    id: "seef",
    title: "SEEF Scholarships",
    provider: "Sindh Educational Endowment Fund",
    country: "Pakistan", flag: "🇵🇰", audience: "school", degrees: ["Bachelors", "Masters"],
    coverageType: "Tuition Waiver / Partial", opens: 9, closes: 11,
    summary: "Sindh's scholarships for bright students from low-income families at partner universities.",
    offered: ["Tuition fee support", "Some awards include a stipend"],
    requirements: ["Sindh domicile", "Admission to a partner university", "Family income below the limit"],
    pak: { target: "Students with Sindh domicile.", academic: "Good marks and university admission.", english: "Not needed.", notes: "Announced through partner universities." },
    link: "https://seef.sindh.gov.pk/",
  },

  // ───────── For university graduates (master's and PhD) ─────────
  {
    id: "chevening",
    title: "Chevening Scholarship",
    provider: "UK Foreign, Commonwealth & Development Office",
    country: "United Kingdom", flag: "🇬🇧", audience: "graduate", degrees: ["Masters"],
    coverageType: "Fully Funded", opens: 8, closes: 11,
    summary: "The UK government's flagship one-year master's scholarship for future leaders.",
    offered: ["Full tuition", "Monthly living allowance", "Return flight and visa costs"],
    requirements: ["Bachelor's degree", "At least two years' work experience", "Apply to three UK courses", "Return home for two years after"],
    pak: { target: "Pakistani citizens.", academic: "A bachelor's degree that allows master's entry in the UK.", english: "Meet the university's English requirement.", notes: "Opens early August, closes early November." },
    link: "https://www.chevening.org/",
  },
  {
    id: "commonwealth-masters-phd",
    title: "Commonwealth Master's and PhD Scholarships",
    provider: "Commonwealth Scholarship Commission (UK); HEC nominates in Pakistan",
    country: "United Kingdom", flag: "🇬🇧", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 9, closes: 10,
    summary: "UK government scholarships for students from Commonwealth countries, nominated nationally.",
    offered: ["Full tuition", "Monthly stipend", "Return flight", "Warm-clothing and thesis grants"],
    requirements: ["Nomination by HEC (Pakistan)", "Bachelor's degree (master's for PhD)", "Return home after study"],
    pak: { target: "Pakistani citizens through HEC.", academic: "First degree with good grades.", english: "IELTS as per university.", notes: "HEC's call usually closes in October." },
    link: "https://cscuk.fcdo.gov.uk/",
  },
  {
    id: "gates-cambridge",
    title: "Gates Cambridge Scholarship",
    provider: "Gates Cambridge Trust, University of Cambridge",
    country: "United Kingdom", flag: "🇬🇧", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 9, closes: 12,
    summary: "Full-cost scholarships for outstanding non-UK students at Cambridge.",
    offered: ["Full cost of the course", "Maintenance allowance", "Flights and visa costs"],
    requirements: ["Apply to a Cambridge postgraduate course and tick Gates", "Outstanding academic record", "Commitment to improving others' lives"],
    pak: { target: "All non-UK citizens.", academic: "Top first degree.", english: "Cambridge English requirement.", notes: "Deadlines October (US) and December / January (others)." },
    link: "https://www.gatescambridge.org/",
  },
  {
    id: "rhodes-pakistan",
    title: "Rhodes Scholarship (Pakistan)",
    provider: "Rhodes Trust, University of Oxford",
    country: "United Kingdom", flag: "🇬🇧", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 6, closes: 8,
    summary: "The world's oldest international scholarship: postgraduate study at Oxford, with a place for Pakistan each year.",
    offered: ["Full Oxford fees", "Living stipend", "Flights to and from Oxford"],
    requirements: ["Pakistani citizen, usually 19–25", "Bachelor's degree by the start", "Interviews in Pakistan"],
    pak: { target: "Pakistan has its own Rhodes constituency.", academic: "Excellent first degree.", english: "Oxford English requirement.", notes: "Usually closes in July–August." },
    link: "https://www.rhodeshouse.ox.ac.uk/",
  },
  {
    id: "clarendon",
    title: "Clarendon Scholarship",
    provider: "University of Oxford",
    country: "United Kingdom", flag: "🇬🇧", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 9, closes: 1,
    summary: "Oxford's biggest graduate scholarship, given automatically to top applicants.",
    offered: ["Full course fees", "Living grant"],
    requirements: ["Apply for an Oxford graduate course by the December or January deadline", "No separate form", "Outstanding academic record"],
    pak: { target: "All nationalities.", academic: "Top first degree.", english: "Oxford English requirement.", notes: "Your course's deadline is what counts." },
    link: "https://www.ox.ac.uk/clarendon",
  },
  {
    id: "fulbright-pakistan",
    title: "Fulbright Scholarship (Pakistan)",
    provider: "USEFP — United States Educational Foundation in Pakistan",
    country: "United States", flag: "🇺🇸", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 3, closes: 5,
    summary: "One of the world's largest Fulbright programmes: fully funded master's and PhD study in the US.",
    offered: ["Full tuition", "Living stipend and housing", "Flights and health cover"],
    requirements: ["16 years of education", "GRE for most fields", "Return to Pakistan for two years after"],
    pak: { target: "Pakistani citizens living in Pakistan.", academic: "16 years of education with good grades.", english: "TOEFL / IELTS may be asked later.", notes: "Usually open in spring." },
    link: "https://www.usefp.org/",
  },
  {
    id: "knight-hennessy",
    title: "Knight-Hennessy Scholars",
    provider: "Stanford University",
    country: "United States", flag: "🇺🇸", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 6, closes: 10,
    summary: "Full funding for any Stanford graduate degree, with a leadership programme.",
    offered: ["Full tuition", "Living stipend", "Travel and leadership programme"],
    requirements: ["Bachelor's degree within the last seven years", "Apply to Knight-Hennessy and the Stanford programme"],
    pak: { target: "All nationalities.", academic: "Outstanding first degree.", english: "Stanford English requirement.", notes: "Usually closes in October." },
    link: "https://knight-hennessy.stanford.edu/",
  },
  {
    id: "daad-epos",
    title: "DAAD Scholarships (including EPOS)",
    provider: "German Academic Exchange Service (DAAD)",
    country: "Germany", flag: "🇩🇪", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 6, closes: 10,
    summary: "Germany's main scholarships for international graduates, including development-related master's courses.",
    offered: ["Monthly stipend (€992 master's, €1,300 PhD)", "Travel allowance and health insurance", "German course allowance"],
    requirements: ["Bachelor's degree", "Two years' work experience for EPOS", "Apply through the course or DAAD portal"],
    pak: { target: "Pakistani citizens.", academic: "Good first degree.", english: "IELTS / TOEFL or German as per course.", notes: "Each course has its own deadline, mostly August–October." },
    link: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/",
  },
  {
    id: "erasmus-mundus",
    title: "Erasmus Mundus Joint Master's Scholarships",
    provider: "European Commission",
    country: "Europe", flag: "🇪🇺", audience: "graduate", degrees: ["Masters"],
    coverageType: "Fully Funded", opens: 10, closes: 2,
    summary: "Master's degrees taught across two or more European universities, with full EU scholarships.",
    offered: ["Full participation costs", "Monthly allowance (€1,400)", "Travel and installation costs"],
    requirements: ["Bachelor's degree", "Apply directly to each joint master's programme", "Up to three programmes a year"],
    pak: { target: "All nationalities.", academic: "First degree in a related field.", english: "IELTS / TOEFL as per programme.", notes: "Most programmes close December–February." },
    link: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
  },
  {
    id: "swedish-institute",
    title: "Swedish Institute Scholarships for Global Professionals",
    provider: "Swedish Institute",
    country: "Sweden", flag: "🇸🇪", audience: "graduate", degrees: ["Masters"],
    coverageType: "Fully Funded", opens: 2, closes: 2,
    summary: "Full master's scholarships in Sweden for future leaders from eligible countries, including Pakistan.",
    offered: ["Full tuition", "Monthly living allowance (SEK 12,000)", "Travel grant and insurance"],
    requirements: ["Apply to a Swedish master's by mid-January", "At least 3,000 hours of work experience", "Leadership experience"],
    pak: { target: "Pakistan is on the eligible country list.", academic: "Bachelor's degree.", english: "As per the Swedish university.", notes: "Scholarship window is about two weeks in February." },
    link: "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/",
  },
  {
    id: "eiffel-excellence",
    title: "Eiffel Excellence Scholarship",
    provider: "Campus France / French Ministry for Europe and Foreign Affairs",
    country: "France", flag: "🇫🇷", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Tuition Waiver / Partial", opens: 10, closes: 1,
    summary: "The French government's scholarship for top international master's and PhD students, nominated by French universities.",
    offered: ["Monthly allowance (€1,200 master's)", "Travel and health insurance", "Help with housing"],
    requirements: ["Apply to a French university, which nominates you", "Under 30 for master's", "Strong academic record"],
    pak: { target: "Pakistani citizens.", academic: "Good first degree.", english: "Programme in English or French.", notes: "The university's internal deadline comes first." },
    link: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
  },
  {
    id: "australia-awards-pakistan",
    title: "Australia Awards Scholarships (Pakistan)",
    provider: "Australian Government (DFAT)",
    country: "Australia", flag: "🇦🇺", audience: "graduate", degrees: ["Masters"],
    coverageType: "Fully Funded", opens: 2, closes: 4,
    summary: "Fully funded master's study at Australian universities for Pakistani professionals.",
    offered: ["Full tuition", "Living allowance", "Return flights and health cover"],
    requirements: ["Two years' work experience", "Apply on the Australia Awards Pakistan portal", "Return home for two years after"],
    pak: { target: "Pakistani citizens living in Pakistan.", academic: "Bachelor's degree (16 years).", english: "IELTS 6.5 or equal.", notes: "Usually open February–April." },
    link: "https://www.australiaawardspakistan.org/",
  },
  {
    id: "australia-rtp",
    title: "Australian Government Research Training Program (RTP)",
    provider: "Australian universities",
    country: "Australia", flag: "🇦🇺", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 6, closes: 10,
    summary: "Tuition and a living stipend for research master's and PhD students at Australian universities.",
    offered: ["Full tuition", "Living stipend (about AUD 33,000+ a year)", "Health cover"],
    requirements: ["Apply to a research degree at an Australian university", "Research proposal and supervisor", "Strong first degree or master's"],
    pak: { target: "All nationalities.", academic: "Honours-level or master's results.", english: "IELTS 6.5 or equal.", notes: "Each university has its own rounds; main round usually closes August–October." },
    link: "https://www.education.gov.au/research-block-grants/research-training-program",
  },
  {
    id: "mext-research",
    title: "MEXT Japanese Government Scholarship — Research (Graduate)",
    provider: "Ministry of Education (MEXT), Japan",
    country: "Japan", flag: "🇯🇵", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 4, closes: 5,
    summary: "Fully paid master's and PhD study in Japan through the embassy or a Japanese university.",
    offered: ["Full tuition", "Monthly allowance (about ¥144,000)", "Return air ticket"],
    requirements: ["Under 35", "Research plan", "Embassy test and interview, or university recommendation"],
    pak: { target: "Pakistani citizens.", academic: "Bachelor's degree with good grades.", english: "Embassy English test.", notes: "Embassy track opens in spring." },
    link: "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/",
  },
  {
    id: "gks-graduate",
    title: "Global Korea Scholarship (GKS) — Graduate",
    provider: "NIIED, Korea",
    country: "South Korea", flag: "🇰🇷", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 2, closes: 3,
    summary: "The Korean government's full scholarship for master's and PhD students.",
    offered: ["Full tuition", "Monthly allowance", "Flights, language year and insurance"],
    requirements: ["Under 40", "CGPA of at least 80%", "Apply through the embassy or a Korean university"],
    pak: { target: "Pakistan is a partner country.", academic: "Bachelor's degree (master's for PhD).", english: "IELTS / TOPIK helps.", notes: "Usually opens February." },
    link: "https://www.studyinkorea.go.kr/",
  },
  {
    id: "kaust-fellowship",
    title: "KAUST Fellowship",
    provider: "King Abdullah University of Science and Technology",
    country: "Saudi Arabia", flag: "🇸🇦", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 9, closes: 1,
    summary: "Every admitted KAUST student gets full tuition, a stipend and housing at one of the Gulf's top research universities.",
    offered: ["Full tuition", "Monthly stipend", "Free housing and health cover", "Relocation support"],
    requirements: ["Apply to a KAUST master's or PhD programme", "Strong grades in science or engineering", "Letters of recommendation"],
    pak: { target: "All nationalities, including Pakistani and Gulf-based students.", academic: "Strong STEM first degree.", english: "IELTS / TOEFL.", notes: "Main deadlines December–January." },
    link: "https://admissions.kaust.edu.sa/",
  },
  {
    id: "schwarzman",
    title: "Schwarzman Scholars",
    provider: "Tsinghua University, Beijing",
    country: "China", flag: "🇨🇳", audience: "graduate", degrees: ["Masters"],
    coverageType: "Fully Funded", opens: 4, closes: 9,
    summary: "A fully funded one-year master's in global affairs at Tsinghua University for future leaders.",
    offered: ["Tuition and fees", "Room and board", "Travel and stipend"],
    requirements: ["Aged 18–28", "Bachelor's degree by the start", "Leadership record"],
    pak: { target: "All nationalities.", academic: "Bachelor's degree.", english: "English proof if not taught in English.", notes: "International round usually closes in September." },
    link: "https://www.schwarzmanscholars.org/",
  },
  {
    id: "malaysia-international",
    title: "Malaysia International Scholarship (MIS)",
    provider: "Ministry of Higher Education, Malaysia",
    country: "Malaysia", flag: "🇲🇾", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Fully Funded", opens: 3, closes: 5,
    summary: "Malaysia's government scholarship for international master's and PhD students at Malaysian universities.",
    offered: ["Tuition", "Monthly allowance", "Flights and health cover"],
    requirements: ["Under 40", "First-class or good second-class degree", "Offer letter from a Malaysian university"],
    pak: { target: "Pakistani citizens.", academic: "Strong first degree.", english: "IELTS 6.0+ or similar.", notes: "Not every year has the same quota; check the portal." },
    link: "https://biasiswa.mohe.gov.my/INTER/",
  },
  {
    id: "aga-khan-foundation",
    title: "Aga Khan Foundation International Scholarship",
    provider: "Aga Khan Foundation",
    country: "Worldwide", flag: "🌍", audience: "graduate", degrees: ["Masters", "PhD"],
    coverageType: "Tuition Waiver / Partial", opens: 1, closes: 3,
    summary: "Half grant, half loan for outstanding postgraduate students from Pakistan and other developing countries, at any good university.",
    offered: ["50% grant, 50% low-cost loan", "Tuition and living costs"],
    requirements: ["Pakistani citizen", "Excellent academic record", "Admission to a reputable university"],
    pak: { target: "Pakistani citizens with limited means.", academic: "Excellent first degree.", english: "As per the university.", notes: "Forms from the Aga Khan Foundation office in Pakistan." },
    link: "https://the.akdn/en/what-we-do/developing-human-capacity/education/international-scholarships",
  },
];

const monthIn = (m, a, b) => (a <= b ? m >= a && m <= b : m >= a || m <= b);

// "Usually open now" / "Usually opens in March", from today's month.
const statusFor = (s, month) => {
  if (monthIn(month, s.opens, s.closes)) return { status: "Usually open now", statusColor: "emerald" };
  const next = s.opens >= month ? s.opens - month : s.opens + 12 - month;
  return next <= 2
    ? { status: `Opens soon · ${SHORT[s.opens - 1]}`, statusColor: "amber" }
    : { status: `Usually opens ${SHORT[s.opens - 1]}`, statusColor: "slate" };
};

const windowText = (s) =>
  s.opens === s.closes ? MONTHS[s.opens - 1] : `${SHORT[s.opens - 1]} – ${SHORT[s.closes - 1]}`;

export const scholarshipsFor = (date = new Date()) => {
  const month = date.getMonth() + 1;
  return RAW.map((s) => ({
    ...s,
    shortTitle: s.title,
    awardCountry: s.country,
    countryFlag: s.flag,
    region: s.country,
    coverage: s.coverageType,
    lastDate: windowText(s),
    recurring: true,
    ...statusFor(s, month),
    scholarshipOffered: s.offered,
    keyRequirements: s.requirements,
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience: s.pak.target,
      academicPrerequisite: s.pak.academic,
      englishRequirement: s.pak.english,
      hecOrVisaNotes: s.pak.notes,
    },
    applyLink: s.link,
    officialLink: s.link,
  }))
    // Open now first, then the ones opening soonest.
    .sort((a, b) => {
      const rank = (x) => (monthIn(month, x.opens, x.closes) ? -1 : (x.opens - month + 12) % 12);
      return rank(a) - rank(b);
    });
};

export const SCHOLARSHIPS_DATA = scholarshipsFor();

export const SCHOLARSHIP_REGIONS = ["All Countries", ...[...new Set(RAW.map((s) => s.country))].sort()];

export function filterScholarships(scholarships, filters = {}) {
  const { degree, region, coverage, search, audience } = filters;
  const q = (search || "").trim().toLowerCase();
  return scholarships.filter((item) => {
    if (audience && audience !== "all" && item.audience !== audience) return false;
    if (degree && degree !== "All Degrees" && !item.degrees.includes(degree)) return false;
    if (region && region !== "All Countries" && item.country !== region) return false;
    if (coverage && coverage !== "All Funding" && item.coverageType !== coverage) return false;
    if (q) {
      const haystack = [item.title, item.provider, item.country, item.summary, item.pak.target, item.pak.academic, ...item.degrees, ...item.offered]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
