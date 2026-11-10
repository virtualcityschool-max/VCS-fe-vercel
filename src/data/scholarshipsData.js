/**
 * Verified Global Scholarships & Fellowship Opportunities for Students.
 * Specially curated for Cambridge O Level, A Level, and University students in
 * Pakistan and the Gulf (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman).
 *
 * Sourced from official scholarship portals, university admissions, and international bodies.
 */

export const SCHOLARSHIP_DEGREES = [
  "All Degrees",
  "Bachelors",
  "Masters",
  "PhD",
  "Fellowship / Short Program",
];

export const SCHOLARSHIP_REGIONS = [
  "All Countries",
  "United States",
  "United Kingdom & Europe",
  "Australia",
  "Italy",
  "South Korea",
  "Germany",
  "Turkey",
  "Saudi Arabia",
  "China",
];

export const SCHOLARSHIP_COVERAGE_TYPES = [
  "All Funding",
  "Fully Funded",
  "Tuition Waiver / Partial",
];

export const SCHOLARSHIPS_DATA = [
  {
    id: "hurford-youth-fellowship-usa",
    title: "Hurford Youth Fellowship Program 2027 in USA",
    shortTitle: "Hurford Youth Fellowship",
    provider: "World Movement for Democracy / NED",
    awardCountry: "United States",
    countryCode: "US",
    countryFlag: "🇺🇸",
    region: "United States",
    degrees: ["Fellowship / Short Program"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "3 Months (Washington, D.C.)",
    lastDate: "30 November 2026",
    deadlineDate: "2026-11-30",
    status: "Closing Soon",
    statusColor: "amber",
    summary:
      "A prestigious fully funded 3-month youth fellowship in Washington, D.C. for social innovators, community leaders, and advocates.",
    scholarshipOffered: [
      "Full round-trip international airfare to Washington, D.C.",
      "Monthly living stipend covering accommodation, meals, and local living costs",
      "Comprehensive health and accident insurance",
      "Dedicated workspace and research resources at the International Forum in D.C.",
      "Mentorship and networking with international leaders and civil society networks",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani youth activists, civil society advocates, and community organizers aged 20–30.",
      academicPrerequisite:
        "Undergraduate degree or equivalent proven track record in community leadership in Pakistan.",
      englishRequirement:
        "Fluent spoken and written English. No mandatory IELTS or TOEFL score required.",
      hecOrVisaNotes:
        "Full US J-1 exchange visa sponsorship provided by host organisation.",
    },
    keyRequirements: [
      "Age between 20 and 30 years old at application deadline",
      "Demonstrated commitment to civic engagement and social development in Pakistan",
      "Submission of an actionable project proposal to implement upon return",
      "Two letters of recommendation from academic or civic mentors",
    ],
    applyLink:
      "https://brightscholarship.com/hurford-youth-fellowship-program/",
    officialLink: "https://www.movedem.org/fellowships/hurford-youth-fellowship/",
    featured: true,
  },
  {
    id: "erasmus-mundus-choreomundus",
    title: "Erasmus Mundus Choreomundus Joint Masters Scholarship 2027",
    shortTitle: "Erasmus Mundus Choreomundus",
    provider: "European Commission / European Consortium",
    awardCountry: "Europe (France, Greece, UK, Lithuania)",
    countryCode: "EU",
    countryFlag: "🇪🇺",
    region: "United Kingdom & Europe",
    degrees: ["Masters"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "2 Years (Multi-country mobility)",
    lastDate: "15 January 2027",
    deadlineDate: "2027-01-15",
    status: "Open Now",
    statusColor: "emerald",
    summary:
      "Prestigious EU-funded joint Master degree across premier universities in France, Greece, the UK, and Lithuania with full tuition and monthly allowance.",
    scholarshipOffered: [
      "100% full tuition fee waiver for all four European semester mobility terms",
      "Monthly living allowance of €1,400 per month (€33,600 over 2 years)",
      "€3,000 per year travel grant + €1,000 installation grant for partner country students",
      "Full comprehensive European health and travel insurance",
      "Joint Master Degree awarded by accredited European universities",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani graduates in humanities, social sciences, cultural heritage, arts, or related fields.",
      academicPrerequisite:
        "16 years of education (4-year BS/Bachelors or MA/MSc) with min 2.5/4.0 CGPA from an HEC-recognised university.",
      englishRequirement:
        "IELTS 6.5 (no band below 6.0) or TOEFL iBT 90. University English-medium certificates accepted by select partner faculties.",
      hecOrVisaNotes:
        "Category A Partner Country candidate (Pakistan receives maximum scholarship allocation and travel subsidies).",
    },
    keyRequirements: [
      "Bachelors degree equivalent to 180 or 240 ECTS credits",
      "Statement of purpose and study motivation essay",
      "Two academic recommendation letters",
      "CV in Europass format",
    ],
    applyLink:
      "https://brightscholarship.com/erasmus-mundus-choreomundus-scholarship/",
    officialLink: "https://choreomundus.org/",
    featured: true,
  },
  {
    id: "ayfn-winter-korean-camp",
    title: "AYFN Winter Korean Culture Camp 2027 in South Korea",
    shortTitle: "AYFN Winter Korean Camp",
    provider: "AYFN Academy (ASEAN Youth Friendship Network)",
    awardCountry: "South Korea",
    countryCode: "KR",
    countryFlag: "🇰🇷",
    region: "South Korea",
    degrees: ["Fellowship / Short Program"],
    duration: "1–6 February 2027 (Seoul, South Korea)",
    lastDate: "10 November 2026",
    deadlineDate: "2026-11-10",
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    status: "Closing Soon",
    statusColor: "amber",
    summary:
      "Intensive cultural immersion program in Seoul, South Korea covering flights, hotel accommodation, Korean language training, and cultural excursions.",
    scholarshipOffered: [
      "Flight subsidy of up to $500 for international travel to Seoul",
      "Hotel accommodation in Seoul for the full camp duration",
      "Daily meals (breakfast and lunch provided)",
      "Korean language and heritage classes with certified native instructors",
      "Guided excursions to Gyeongbokgung Palace, N Seoul Tower, and Gangnam",
      "Official certificate of participation",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani students aged 17–35 years (high school, Cambridge O/A Level, and university students).",
      academicPrerequisite:
        "Current high school / A Level or university student in good standing.",
      englishRequirement:
        "Basic conversational English capability. No IELTS or TOEFL test required.",
      hecOrVisaNotes:
        "Official invitation letter issued by AYFN for South Korean C-3 tourist/short-term study visa application at Korean Embassy Islamabad or Consulate Karachi.",
    },
    keyRequirements: [
      "Age 17 to 35 years old",
      "Strong interest in Korean culture, arts, or international cooperation",
      "Personal motivation essay",
      "Valid international passport",
    ],
    applyLink:
      "https://brightscholarship.com/ayfn-winter-korean-culture-camp/",
    officialLink: "https://ayfnhq.org/",
    featured: true,
  },
  {
    id: "bocconi-university-scholarships-italy",
    title: "Bocconi University International Merit & Need Awards 2027",
    shortTitle: "Bocconi University Awards",
    provider: "Bocconi University (Milan, Italy)",
    awardCountry: "Italy",
    countryCode: "IT",
    countryFlag: "🇮🇹",
    region: "Italy",
    degrees: ["Bachelors", "Masters"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "3 Years (Undergraduate) or 2 Years (Masters)",
    lastDate: "Open Now / Early Round Dec 2026 – Jan 2027",
    deadlineDate: "2027-01-30",
    status: "Open Now",
    statusColor: "emerald",
    summary:
      "Prestigious merit and need-based tuition waivers up to €14,000/year plus free dormitory housing and regional stipend at Italy's top business and economics university.",
    scholarshipOffered: [
      "100% full tuition fee waiver (worth up to €13,000–€14,000 per year)",
      "Free student residence accommodation in Bocconi campus dorms (Milan)",
      "Eligibility for Italian Regional DSU Grant (provides up to €7,200 annual cash stipend + free cafeteria meals)",
      "Priority registration for international student exchange terms worldwide",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani students completing Cambridge O & A Levels or Intermediate (FSc/FA/ICS) applying for Economics, Business, Finance, or Data Science.",
      academicPrerequisite:
        "For Bachelors: Cambridge A Level (minimum 3 subjects with high grades) or Intermediate with IBCC equivalence. SAT/ACT or Bocconi Online Test. For Masters: 16-year Bachelor with GMAT/GRE or Bocconi test.",
      englishRequirement:
        "English medium instruction certificate from school/college or IELTS 6.0 / Duolingo 105.",
      hecOrVisaNotes:
        "Universitaly pre-enrolment and Italian student visa type D via Italian Embassy Islamabad or Consulate Karachi.",
    },
    keyRequirements: [
      "Competitive high school transcripts or university marksheet",
      "Standardised test score (SAT, ACT, GMAT, or Bocconi online test)",
      "Motivation letter and CV",
      "ISEE parificato financial documents for need-based dormitory award",
    ],
    applyLink:
      "https://brightscholarship.com/bocconi-university-scholarships-2027-italy/",
    officialLink: "https://www.unibocconi.eu/wps/wcm/connect/bocconi/sitopubblico_en/navigation+tree/home/programs/bachelor+of+science/funding/bocconi+international+award",
    featured: true,
  },
  {
    id: "australian-govt-research-rtp",
    title: "Australian Government Research Training Program (AGRTP) 2026–2027",
    shortTitle: "Australia Govt RTP Scholarship",
    provider: "Australian Government Department of Education",
    awardCountry: "Australia",
    countryCode: "AU",
    countryFlag: "🇦🇺",
    region: "Australia",
    degrees: ["Masters", "PhD"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "2 Years (Masters) / Up to 4 Years (PhD)",
    lastDate: "Varies by University (Oct 2026 – April 2027)",
    deadlineDate: "2027-04-30",
    status: "Rolling Admissions",
    statusColor: "indigo",
    summary:
      "Australia's flagship postgraduate research grant covering 100% tuition, generous AUD $35,000+ annual tax-free living stipend, and full health cover across Group of Eight universities.",
    scholarshipOffered: [
      "100% full tuition fee offset (worth AUD $40,000–$55,000 per year)",
      "Annual tax-free living allowance stipend (AUD $35,000–$37,000/year, indexed annually)",
      "Full Overseas Student Health Cover (OSHC) for scholar and immediate family",
      "Relocation allowance of up to AUD $2,000 for travel to Australia",
      "Thesis publication and conference presentation allowances",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani researchers, engineers, doctors, and graduates seeking Masters by Research or PhD in Australia.",
      academicPrerequisite:
        "4-year Bachelor with Honours (minimum 3.0/4.0 CGPA) or 2-year MS/MPhil with a research thesis from an HEC-recognised university in Pakistan.",
      englishRequirement:
        "IELTS 6.5 (minimum 6.0 in each band) or PTE Academic 58. Some universities offer waivers for English-medium degrees.",
      hecOrVisaNotes:
        "Subclass 500 Student Visa. Full Australian Government sponsorship letter guarantees financial evidence requirement for DHA visa.",
    },
    keyRequirements: [
      "Comprehensive research proposal (3–5 pages) in your area of study",
      "Secured supervisor endorsement from an Australian participating university",
      "Academic publications, conference papers, or research reports significantly boost competitiveness",
      "Two academic referee reports",
    ],
    applyLink:
      "https://brightscholarship.com/australian-government-research-scholarship-2026-27/",
    officialLink:
      "https://www.education.gov.au/research-block-grants/research-training-program",
    featured: true,
  },
  {
    id: "american-university-egls-usa",
    title: "AU Emerging Global Leader Scholarship (AU EGLS) 2027 in USA",
    shortTitle: "American University Global Leader",
    provider: "American University (Washington, D.C.)",
    awardCountry: "United States",
    countryCode: "US",
    countryFlag: "🇺🇸",
    region: "United States",
    degrees: ["Bachelors", "Masters"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "4 Years (Undergraduate)",
    lastDate: "1 November 2026 (Undergrad) / Rolling (Graduate)",
    deadlineDate: "2026-11-01",
    status: "Rolling / Open",
    statusColor: "emerald",
    summary:
      "American University's highest international honor, covering full tuition, room, and board (value over $72,000/year) for students dedicated to civic and community leadership.",
    scholarshipOffered: [
      "100% full undergraduate tuition waiver for all 4 years",
      "Free on-campus room and board (housing in D.C. residence halls + meal plan)",
      "Total financial package value exceeds $72,000 per year ($288,000 over 4 years)",
      "Direct mentorship from AU global leadership faculty and D.C. policy institutes",
      "Support for internship placements in Washington, D.C. diplomatic and tech agencies",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani high school / Cambridge O & A Level or Intermediate students with exceptional academic merit and active community leadership.",
      academicPrerequisite:
        "Cambridge O & A Levels (minimum 3 A/A* grades) or Intermediate (FSc/FA with 85%+ marks, equivalent to minimum 3.8 GPA on 4.0 scale).",
      englishRequirement:
        "TOEFL iBT 90+ / IELTS 7.0+ / Duolingo 125+. SAT/ACT is test-optional.",
      hecOrVisaNotes:
        "Form I-20 issued for US F-1 student visa. Full scholarship meets 100% of the US Embassy financial affidavit requirement.",
    },
    keyRequirements: [
      "Secondary school academic GPA equivalent to 3.8 or above",
      "Demonstrated history of civic leadership, volunteering, or social entrepreneurship in Pakistan",
      "Commitment to return to Pakistan upon graduation to drive positive social change",
      "Common Application + AU EGLS supplemental essay + 2 teacher recommendations",
    ],
    applyLink:
      "https://brightscholarship.com/american-university-global-leader-scholarship-2027/",
    officialLink:
      "https://www.american.edu/admissions/international/egls.cfm",
    featured: true,
  },
  {
    id: "fulbright-scholarship-pakistan-usa",
    title: "Fulbright Foreign Student Program for Pakistan 2027–2028",
    shortTitle: "USEFP Fulbright Pakistan",
    provider: "US Department of State & USEFP Pakistan",
    awardCountry: "United States",
    countryCode: "US",
    countryFlag: "🇺🇸",
    region: "United States",
    degrees: ["Masters", "PhD"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "Up to 2 Years (Masters) / Up to 5 Years (PhD)",
    lastDate: "May 2027 (Annual Cycle opens Feb 2027)",
    deadlineDate: "2027-05-15",
    status: "Opening Soon",
    statusColor: "indigo",
    summary:
      "The world's largest Fulbright program, funded by the US Department of State specifically for Pakistani citizens, covering full tuition, living stipend, flights, and health insurance.",
    scholarshipOffered: [
      "100% full tuition fees paid directly to top American universities",
      "Monthly living stipend tailored to host city cost of living",
      "Round-trip international economy airfare (Pakistan to USA and back)",
      "Textbook and settling-in allowance",
      "Comprehensive health benefits plan (ASPE)",
      "J-1 visa sponsorship and pre-academic gateway orientations across the US",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Exclusively for Pakistani citizens residing in Pakistan. Women, people with disabilities, and candidates from remote regions are strongly encouraged.",
      academicPrerequisite:
        "For Masters: 16 years of formal education (4-year BS/BBA or MA/MSc). For PhD: 18 years of education (MS/MPhil). Minimum 2.5/4.0 CGPA or 1st division.",
      englishRequirement:
        "GRE General test is mandatory at application (scores evaluated comprehensively). Duolingo/TOEFL funded by USEFP for shortlisted finalists.",
      hecOrVisaNotes:
        "All degrees must be HEC-recognized. Two-year home residency requirement in Pakistan applies upon degree completion.",
    },
    keyRequirements: [
      "Pakistani citizenship with valid passport",
      "Personal statement and study/research objective essays",
      "Three letters of reference",
      "Valid GRE General score report",
    ],
    applyLink: "https://www.usefp.org/scholarships/fulbright.cfm",
    officialLink: "https://www.usefp.org/scholarships/fulbright.cfm",
    featured: true,
  },
  {
    id: "chevening-scholarships-uk",
    title: "Chevening UK Government Scholarships 2027–2028",
    shortTitle: "Chevening Scholarship UK",
    provider: "UK Foreign, Commonwealth and Development Office (FCDO)",
    awardCountry: "United Kingdom",
    countryCode: "GB",
    countryFlag: "🇬🇧",
    region: "United Kingdom & Europe",
    degrees: ["Masters"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "1 Year (Taught Master Degree)",
    lastDate: "Early November 2026 (Annual Intake)",
    deadlineDate: "2026-11-05",
    status: "Annual Intake",
    statusColor: "indigo",
    summary:
      "The UK Government's global scholarship program offering full financial support for a 1-year master's degree at any UK university for future Pakistani leaders.",
    scholarshipOffered: [
      "100% university tuition fee payment",
      "Monthly living allowance / stipend (higher tier for London universities)",
      "Economy class return flights from Pakistan to the UK",
      "Arrival and departure allowances",
      "UK Student Visa application fee paid",
      "Access to exclusive Chevening networking events, parliamentary tours, and conferences",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani graduates and mid-career professionals with leadership drive in governance, law, media, science, and economics.",
      academicPrerequisite:
        "Undergraduate degree equivalent to an upper second-class (2:1) UK honours degree (typically 3.0+ CGPA from an HEC-recognised university).",
      englishRequirement:
        "Meet English language condition of your chosen UK university (IELTS 6.5–7.0 typically).",
      hecOrVisaNotes:
        "Must return to Pakistan for a minimum of 2 years after completing the scholarship.",
    },
    keyRequirements: [
      "Pakistani citizen",
      "Minimum 2 years (2,800 hours) of work/internship experience",
      "Apply to 3 different eligible UK university courses",
      "Four detailed leadership essays (Leadership, Networking, Study in the UK, Career Plan)",
    ],
    applyLink: "https://www.chevening.org/scholarship/pakistan/",
    officialLink: "https://www.chevening.org/scholarship/pakistan/",
    featured: true,
  },
  {
    id: "turkiye-burslari-scholarship",
    title: "Turkiye Burslari Turkish Government Scholarships 2027",
    shortTitle: "Turkiye Burslari Scholarships",
    provider: "Government of the Republic of Turkey",
    awardCountry: "Turkey",
    countryCode: "TR",
    countryFlag: "🇹🇷",
    region: "Turkey",
    degrees: ["Bachelors", "Masters", "PhD"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "4–5 Years (Bachelors) / 2–4 Years (Postgrad)",
    lastDate: "20 February 2027 (Opens 10 Jan 2027)",
    deadlineDate: "2027-02-20",
    status: "Opening Soon",
    statusColor: "emerald",
    summary:
      "Turkey's flagship state scholarship offering university placement, full tuition, monthly stipend, dormitory accommodation, health insurance, and flights.",
    scholarshipOffered: [
      "Guaranteed university placement in top Turkish state and foundation universities",
      "100% full tuition waiver for full degree duration",
      "Monthly stipend: 3,500 TL (Bachelors), 5,000 TL (Masters), 6,500 TL (PhD)",
      "Free public dormitory accommodation in Turkey",
      "1-year free Turkish Language preparatory course (TÖMER)",
      "One-time round-trip flight ticket from Pakistan to Turkey",
      "Public health insurance throughout study",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani students finishing Cambridge O/A Levels or Intermediate (FSc/FA) for Bachelors, and BS/MS graduates for postgraduate.",
      academicPrerequisite:
        "Minimum 70% marks for Bachelors, 75% for Masters/PhD, and 90% for Medicine/Dentistry/Pharmacy.",
      englishRequirement:
        "Many programs taught in Turkish (after free 1-year language prep); programs taught in English require IELTS/TOEFL as per university rules.",
      hecOrVisaNotes:
        "Turkish Student Visa issued upon Turkish Embassy Islamabad / Consulate Karachi interview.",
    },
    keyRequirements: [
      "Academic marksheets and certificates",
      "Letter of Intent and statement of purpose",
      "Academic recommendation letter",
      "Passport or National Identity Card (CNIC/B-Form)",
    ],
    applyLink: "https://www.turkiyeburslari.gov.tr/",
    officialLink: "https://www.turkiyeburslari.gov.tr/",
    featured: true,
  },
  {
    id: "stipendium-hungaricum-hec-pakistan",
    title: "Stipendium Hungaricum Scholarship Programme 2027–2028",
    shortTitle: "Hungary Stipendium (HEC Pakistan)",
    provider: "Hungarian Government & Tempus Public Foundation via HEC",
    awardCountry: "Hungary",
    countryCode: "HU",
    countryFlag: "🇭🇺",
    region: "United Kingdom & Europe",
    degrees: ["Bachelors", "Masters", "PhD"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "3–4 Years (Bachelors) / 2 Years (Masters) / 4 Years (PhD)",
    lastDate: "15 January 2027 (Annual Intake)",
    deadlineDate: "2027-01-15",
    status: "Open Now",
    statusColor: "emerald",
    summary:
      "Over 400 fully funded scholarships reserved specifically for Pakistani students every year across Hungarian universities in engineering, science, business, and medicine.",
    scholarshipOffered: [
      "100% tuition-free education at leading European Hungarian universities",
      "Monthly living allowance contribution toward living expenses",
      "Free dormitory place or accommodation contribution of HUF 40,000/month",
      "Comprehensive medical health insurance (European standards)",
      "EU Schengen residence permit allowing travel across Europe",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani citizens who apply through both HEC Pakistan portal and Tempus Public Foundation Hungary portal.",
      academicPrerequisite:
        "Bachelors: 12 years of education (Cambridge A Level with IBCC equivalence or Intermediate FSc/ICS with min 60% marks). Masters: 16 years education with min 2.5 CGPA. Valid HAT / USAT test score conducted by HEC ETC.",
      englishRequirement:
        "English Medium of Instruction certificate accepted by most Hungarian universities, or IELTS 5.5–6.5.",
      hecOrVisaNotes:
        "Nomination strictly conducted via Higher Education Commission (HEC) of Pakistan merit list.",
    },
    keyRequirements: [
      "Dual application: submit on Tempus portal AND HEC e-portal",
      "Valid USAT (Undergraduate) or HAT (Postgraduate) score",
      "Attested educational documents / IBCC equivalence",
      "Medical certificate of fitness",
    ],
    applyLink: "https://www.hec.gov.pk/english/scholarshipsgrants/lao/shsp/Pages/default.aspx",
    officialLink: "https://stipendiumhungaricum.hu/",
    featured: true,
  },
  {
    id: "csc-chinese-government-scholarship",
    title: "Chinese Government Scholarship (CSC) – Silk Road Program 2027",
    shortTitle: "China CSC Scholarship",
    provider: "China Scholarship Council / Ministry of Education PRC",
    awardCountry: "China",
    countryCode: "CN",
    countryFlag: "🇨🇳",
    region: "China",
    degrees: ["Bachelors", "Masters", "PhD"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "4–5 Years (Bachelors) / 2–3 Years (Masters) / 3–4 Years (PhD)",
    lastDate: "15 March 2027 (Opens Dec 2026)",
    deadlineDate: "2027-03-15",
    status: "Opening Soon",
    statusColor: "emerald",
    summary:
      "Comprehensive state funding for Pakistani students across China's top Double First-Class universities including Tsinghua, Peking, Zhejiang, and USTC.",
    scholarshipOffered: [
      "Full 100% tuition fee waiver",
      "Free on-campus university dormitory accommodation",
      "Monthly stipend: 2,500 RMB (Bachelors), 3,000 RMB (Masters), 3,500 RMB (PhD)",
      "Comprehensive medical insurance coverage in China (800 RMB/year)",
      "Access to world-leading research labs and supercomputing facilities",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani students under Type A (via HEC Pakistan) or Type B (direct university application).",
      academicPrerequisite:
        "Bachelors: A Level or FSc with min 70% marks, age under 25. Masters: 16-year degree, age under 35. PhD: Master degree, age under 40.",
      englishRequirement:
        "English Proficiency Certificate from previous institution is widely accepted. No IELTS mandatory for most STEM majors.",
      hecOrVisaNotes:
        "JW201/JW202 visa form issued for X1 long-term study visa application at Chinese Embassy Islamabad or Karachi Consulate.",
    },
    keyRequirements: [
      "CSC online application form (Agency number of targeted university)",
      "Foreigner Physical Examination Form with laboratory reports",
      "Non-Criminal Record (Police Clearance Certificate from Pakistan)",
      "Two academic recommendation letters and study plan",
    ],
    applyLink: "https://www.campuschina.org/",
    officialLink: "https://www.campuschina.org/",
    featured: false,
  },
  {
    id: "daad-scholarships-germany",
    title: "DAAD EPOS Postgraduate Scholarships in Germany 2027–2028",
    shortTitle: "DAAD EPOS Germany",
    provider: "German Academic Exchange Service (DAAD)",
    awardCountry: "Germany",
    countryCode: "DE",
    countryFlag: "🇩🇪",
    region: "Germany",
    degrees: ["Masters", "PhD"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "12 to 24 Months",
    lastDate: "Varies by Program (Aug 2026 – Jan 2027)",
    deadlineDate: "2027-01-31",
    status: "Open Now",
    statusColor: "emerald",
    summary:
      "Germany's premier development-related postgraduate grant covering tuition-free university education, monthly stipend of €934, flights, and German health insurance.",
    scholarshipOffered: [
      "Free tuition at top public universities across Germany",
      "Monthly stipend of €934 for Master students (€1,300 for PhD)",
      "Full round-trip flight travel allowance to Germany and back",
      "Health, accident, and personal liability insurance coverage",
      "Rent subsidy and family monthly allowance where applicable",
      "Free 2–6 month preparatory German language course",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani professionals and graduates in engineering, development, economics, public health, environmental science, and urban planning.",
      academicPrerequisite:
        "4-year Bachelor degree from HEC-recognised university with minimum 2.5/4.0 CGPA, completed within the last 6 years.",
      englishRequirement:
        "IELTS 6.0–6.5 or TOEFL iBT 80 (for English-taught courses). No German language required for English-track programs.",
      hecOrVisaNotes:
        "German National Student Visa (Category D) via German Embassy Islamabad or Consulate General Karachi.",
    },
    keyRequirements: [
      "Minimum 2 years of verifiable professional work experience in Pakistan",
      "Motivation letter with strong focus on how knowledge will benefit Pakistan's development",
      "Europass format CV signed by hand",
      "Employment verification letter confirming current role",
    ],
    applyLink: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?status=3&origin=144&subjectGrps=&daad=&q=&page=1&detail=50076777",
    officialLink: "https://www.daad.de/en/",
    featured: false,
  },
  {
    id: "kaust-fellowship-saudi-arabia",
    title: "KAUST Discovery Fellowship 2027 in Saudi Arabia",
    shortTitle: "KAUST Fellowship Saudi Arabia",
    provider: "King Abdullah University of Science and Technology",
    awardCountry: "Saudi Arabia",
    countryCode: "SA",
    countryFlag: "🇸🇦",
    region: "Saudi Arabia",
    degrees: ["Masters", "PhD"],
    coverage: "Fully Funded",
    coverageType: "Fully Funded",
    duration: "2 Years (MS) / 3–4 Years (PhD)",
    lastDate: "Early Round Jan 2027 / Final Round April 2027",
    deadlineDate: "2027-04-15",
    status: "Open Now",
    statusColor: "emerald",
    summary:
      "One of the world's most generous STEM scholarships, offering 100% tuition, $20,000–$30,000 annual living stipend, free private housing, and flights in Thuwal, Saudi Arabia.",
    scholarshipOffered: [
      "100% full tuition support",
      "Annual living allowance of $20,000 to $30,000 per year (tax-free)",
      "Free furnished on-campus private housing / apartment",
      "Comprehensive medical and dental health coverage",
      "Relocation support and annual round-trip flight tickets",
      "State-of-the-art supercomputing and nanotechnology laboratories",
    ],
    eligibilityWrtPakistan: {
      eligible: true,
      targetAudience:
        "Pakistani and Gulf-based students excelling in STEM fields: Computer Science, AI, Electrical/Mechanical Engineering, Chemistry, Bioscience, and Applied Math.",
      academicPrerequisite:
        "4-year Bachelor degree in a relevant STEM field with minimum 3.2/4.0 CGPA from an accredited university.",
      englishRequirement:
        "TOEFL iBT 79 or IELTS 6.5 minimum (official test score required).",
      hecOrVisaNotes:
        "Very popular among Pakistani and Saudi-resident students due to geographic proximity and high stipend.",
    },
    keyRequirements: [
      "Official academic transcripts and degree certificate",
      "Statement of Purpose detailing research interests",
      "Three letters of recommendation from professors",
      "Curriculum Vitae (CV) highlighting technical projects or publications",
    ],
    applyLink: "https://www.kaust.edu.sa/en/study/admissions",
    officialLink: "https://www.kaust.edu.sa/en/study/admissions",
    featured: false,
  },
];

/**
 * Filter and search scholarships by criteria.
 */
export function filterScholarships(scholarships, filters = {}) {
  const { degree, region, coverage, search, pakOnly } = filters;
  const q = (search || "").trim().toLowerCase();

  return scholarships.filter((item) => {
    // Degree filter
    if (degree && degree !== "All Degrees") {
      const matchDegree = item.degrees.some((d) =>
        d.toLowerCase().includes(degree.toLowerCase()) ||
        degree.toLowerCase().includes(d.toLowerCase())
      );
      if (!matchDegree) return false;
    }

    // Region / Country filter
    if (region && region !== "All Countries") {
      if (item.region !== region && item.awardCountry !== region) {
        // Special case for Europe
        if (region.includes("Europe") && (item.region.includes("Europe") || item.awardCountry.includes("Europe"))) {
          // match
        } else {
          return false;
        }
      }
    }

    // Coverage filter
    if (coverage && coverage !== "All Funding") {
      if (coverage === "Fully Funded" && item.coverage !== "Fully Funded") {
        return false;
      }
      if (coverage.includes("Partial") && item.coverage === "Fully Funded") {
        return false;
      }
    }

    // Pakistan eligibility check
    if (pakOnly && !item.eligibilityWrtPakistan?.eligible) {
      return false;
    }

    // Keyword search
    if (q) {
      const haystack = [
        item.title,
        item.shortTitle,
        item.provider,
        item.awardCountry,
        item.region,
        item.summary,
        item.eligibilityWrtPakistan?.targetAudience || "",
        item.eligibilityWrtPakistan?.academicPrerequisite || "",
        ...(item.degrees || []),
        ...(item.scholarshipOffered || []),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
