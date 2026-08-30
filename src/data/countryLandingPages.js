// Content for the /online-school hub and its country-specific landing pages.
//
// Every paragraph here is written per-country, not templated with the name
// swapped - each country's "local schooling landscape" section describes a
// genuinely different market structure, and the FAQ sets do not overlap.
// Numeric claims about fees, waiting lists, and specific policy details are
// marked verify: true on the relevant FAQ/point so the UI can flag them and
// so they're easy to grep for before publish - see SEO-AUDIT-FE.md follow-up
// notes for the full list handed back to the team.

export const SITE_URL = "https://virtualcityschool.com";

// Small set of long-standing, effectively-pegged Gulf exchange rates used
// only to give a rough USD conversion sense. These are NOT live rates and
// are labeled as approximate everywhere they're shown - see the flagged
// claims list.
export const APPROX_FX = {
  SAR: { rate: 3.75, label: "Saudi Riyal" },
  AED: { rate: 3.67, label: "UAE Dirham" },
  QAR: { rate: 3.64, label: "Qatari Riyal" },
  KWD: { rate: 0.31, label: "Kuwaiti Dinar" },
};

// Photos sourced via the Pexels API (free tier, no attribution required by
// license) and screened against the content rules before use: no religious
// or political imagery, no flags, no identifiable person framed as "our
// student," no physical-classroom shots that would misrepresent VCS as
// running a campus. Converted to WebP, capped at 1000px wide, stored per
// country under public/assets/countries/<slug>/. The two "study" photos are
// deliberately anonymous (back of frame, no face) and reused across all four
// pages since they illustrate a generic concept, not a specific place -
// only the skyline photo is genuinely unique to each country.
const STUDY_DESK_IMAGE = {
  src: "student-studying-home-desk.webp",
  width: 1000,
  height: 1500,
  alt: "A student studying at a home desk with a laptop, notebook and a shelf of books nearby",
  caption: "Live classes fit around a normal home study routine, not a commute to campus.",
};
const STUDY_LAPTOP_IMAGE = {
  src: "student-online-class-laptop.webp",
  width: 1000,
  height: 564,
  alt: "A student following a live online class on a laptop at a home desk",
  caption: "One live teacher, one small class, joined from home.",
};

export const COUNTRY_PAGES = [
  {
    slug: "saudi-arabia",
    countryName: "Saudi Arabia",
    flagCode: "sa",
    timeZone: "Asia/Riyadh",
    currency: "SAR",
    heroKicker: "Cambridge Online School - Saudi Arabia",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in Saudi Arabia",
    metaTitle: "Online Cambridge School in Saudi Arabia | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes for Pakistani expatriate families in Riyadh, Jeddah, Dammam, Khobar and Yanbu - taught by a school based in Saudi Arabia.",
    intro: [
      "Virtual City School is based in Saudi Arabia - not a foreign platform beamed in from elsewhere, but a school run in the same country, on the same weekend, in the same reality Pakistani families here already live in.",
      "That matters more in Saudi Arabia than almost anywhere else in the Gulf, because schooling access here isn't just about cost - it's about geography. A family in Riyadh or Jeddah has real (if competitive) options. A family in Yanbu, Jubail, or a smaller industrial city built around a single employer often doesn't.",
    ],
    schoolingLandscape: {
      heading: "What schooling actually looks like for Pakistani families in Saudi Arabia",
      paragraphs: [
        "Pakistani expatriate families in Saudi Arabia generally split between two very different tracks. The first is the Pakistani community school network - schools like the Pakistan International Schools in Riyadh, Jeddah, and Dammam/Al-Khobar - which teach the Pakistani Federal Board curriculum (Matric/FSc) rather than Cambridge. These schools are well-established and relatively affordable, but they don't lead to O Level or A Level certificates at all.",
        "The second track is British-curriculum international schools, which do offer IGCSE/O Level and A Level, but seats are limited, tuition is markedly higher than community schools, and popular schools in Riyadh and Jeddah commonly run waiting lists, particularly for mid-year entry or specific grade levels.",
        "Outside the three or four largest cities, this choice often doesn't exist at all. Families in single-industry towns built around a specific employer or compound frequently have neither a Pakistani-curriculum school nor a British-curriculum school within a reasonable commute, and end up choosing between relocating, sending a child to boarding school in Pakistan, or an online alternative.",
      ],
      verifyNote:
        "Specific current tuition figures for Pakistani-curriculum and British-curriculum schools in Riyadh/Jeddah/Dammam are not stated here and should be confirmed before publishing any number publicly.",
    },
    whyOALevel: {
      heading: "Why O Level and A Level specifically, for a family based in Saudi Arabia",
      paragraphs: [
        "Saudi Arabia's public university system is built around Saudi nationals; it is not the default higher-education path for most expatriate children, Pakistani or otherwise. That means the overwhelming majority of Pakistani families in the Kingdom are already planning for their child to study somewhere else after school - Pakistan, the UK, another Gulf country, or a private university with an international admissions track.",
        "Cambridge O Level and A Level is the qualification built for exactly that uncertainty. It's recognised for university admission across Pakistan, the UK, and the wider Gulf, and unlike the Pakistani Federal Board curriculum, it doesn't require a family to have already decided where their child will study next.",
        "For return to Pakistan specifically: O Level and A Level results are converted to a Pakistani-board equivalent by the Inter Board Committee of Chairmen (IBCC) for university admission purposes - a well-established, standard process, though families should confirm current IBCC equivalence requirements directly, as documentation requirements can change.",
      ],
    },
    diaspora:
      "Saudi Arabia's Pakistani community is large and genuinely spread across the country - not concentrated in one or two cities the way it is in the UAE or Qatar. That spread is exactly the problem an online school is built to solve: a doctor's or engineer's family posted to Yanbu or Jubail for a multi-year contract shouldn't have to choose between their child's Cambridge education and their job.",
    faq: [
      {
        q: "Is Virtual City School actually based in Saudi Arabia, or is this a foreign platform?",
        a: "Virtual City School is based in Saudi Arabia. Classes are scheduled and run with the Kingdom as the home base, not as an afterthought for a platform built for another market.",
      },
      {
        q: "My family lives in Yanbu / Jubail / a smaller city with no British-curriculum school nearby - can my child still do O Level or A Level?",
        a: "Yes - this is precisely the situation an online Cambridge school is designed for. Your child attends live classes from home; there's no dependency on a physical school existing in your city.",
      },
      {
        q: "Do we need a specific Iqama or residency status to enroll?",
        a: "Enrollment isn't tied to a specific visa category - it's designed for expatriate families living in Saudi Arabia generally. If your situation is unusual, message us on WhatsApp before enrolling to confirm.",
        verify: true,
      },
      {
        q: "How does the class schedule work with the Saudi weekend (Friday-Saturday)?",
        a: "Class timings are planned around the Saudi week, and times are shown in Arabian Standard Time (AST) so there's no manual conversion needed.",
      },
      {
        q: "If we eventually move back to Pakistan, will these results actually count?",
        a: "Cambridge O Level and A Level results are converted to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission. Confirm current documentation requirements with IBCC directly, as processes can be updated.",
        verify: true,
      },
      {
        q: "How is this different from the Pakistan International School curriculum?",
        a: "Pakistan International Schools in Saudi Arabia generally teach the Pakistani Federal Board curriculum (Matric/FSc). Virtual City School teaches Cambridge O Level and A Level - a different, internationally-portable qualification track, not a replacement for or continuation of the Federal Board syllabus.",
      },
    ],
    images: {
      skyline: {
        src: "riyadh-skyline.webp",
        width: 1000,
        height: 667,
        alt: "The Kingdom Centre tower illuminated at night among office buildings and palm trees in Riyadh, Saudi Arabia",
        caption: "Riyadh, Saudi Arabia.",
      },
      study1: STUDY_DESK_IMAGE,
      study2: STUDY_LAPTOP_IMAGE,
    },
    siblingSlugs: ["uae", "qatar"],
  },

  {
    slug: "uae",
    countryName: "UAE",
    flagCode: "ae",
    timeZone: "Asia/Dubai",
    currency: "AED",
    heroKicker: "Cambridge Online School - UAE",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in the UAE",
    metaTitle: "Online Cambridge School in the UAE | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes for Pakistani families in Dubai, Sharjah, Abu Dhabi and Ajman - built for KHDA-waitlist and cost pressure, not a shortage of schools.",
    intro: [
      "The UAE doesn't have a shortage of British-curriculum schools - it has one of the most developed private education markets in the Gulf, regulated closely by KHDA in Dubai and ADEK in Abu Dhabi. The problem Pakistani families in the UAE run into isn't a lack of options; it's that the good options are oversubscribed, expensive, and often far from where you actually live.",
      "Virtual City School exists for the family that's on a two-year waitlist for a well-rated school, or driving from Sharjah or Ajman into Dubai every morning because that's where the seat was available - not because there's no school within reach.",
    ],
    schoolingLandscape: {
      heading: "What schooling actually looks like for Pakistani families in the UAE",
      paragraphs: [
        "Dubai and Abu Dhabi have dozens of KHDA/ADEK-rated private schools offering British curriculum through to A Level, alongside a smaller number of Pakistani-curriculum schools. In principle, choice is not the constraint.",
        "In practice, the highest-rated schools - the ones with KHDA 'Outstanding' or 'Very Good' inspection ratings - are frequently full, with families reporting multi-term or multi-year waiting lists for popular grade levels, especially Year 9 through Year 12 where O Level and A Level cohorts sit. Families who don't secure a place early often end up either accepting a lower-rated school, paying a premium for a late-availability seat, or commuting from a cheaper emirate (Sharjah, Ajman) into Dubai or Abu Dhabi for the school they actually want.",
        "Tuition at well-regarded British-curriculum secondary schools in Dubai has also trended upward over recent years; families should check current KHDA fee-framework data for specific numbers rather than relying on a fixed figure here, since fee caps and increases are reviewed periodically.",
      ],
      verifyNote:
        "Do not publish specific KHDA/ADEK tuition figures or waitlist durations without checking current data - both change and vary significantly by school and emirate.",
    },
    whyOALevel: {
      heading: "Why O Level and A Level specifically, for a family in the UAE",
      paragraphs: [
        "The UAE's federal and private university system is genuinely open to expatriates - unlike some neighbouring countries - and most UAE universities with international intake accept Cambridge O Level and A Level for admission. But so do universities in Pakistan, the UK, and elsewhere in the Gulf, which is the real reason O Level and A Level matters here: most Pakistani families in the UAE are on renewable employment visas and don't know with certainty which country their child will apply to university from.",
        "A levels give that family optionality without a mid-course curriculum change. If a family relocates within the UAE, to another Gulf country, or back to Pakistan, the qualification travels with the student in a way a UAE-specific or Pakistan-specific track doesn't.",
        "For families planning a return to Pakistan, O Level and A Level results go through IBCC equivalence for Pakistani university admission - confirm current requirements directly with IBCC, as documentation expectations are periodically updated.",
      ],
    },
    diaspora:
      "The UAE has one of the largest, most established Pakistani communities anywhere in the Gulf, concentrated across Dubai, Sharjah, Abu Dhabi and Ajman. The lived pain point here isn't isolation the way it can be in a smaller Gulf market - it's the commute-cost-waitlist triangle: the right school exists, but getting a seat in it, affording it, and reaching it every day are three separate problems.",
    faq: [
      {
        q: "Dubai already has so many British-curriculum schools - why would we choose an online school?",
        a: "Because a school existing doesn't mean a seat exists. Many well-rated schools run genuine waiting lists, and an online Cambridge school removes that constraint entirely - your child starts when you enroll, not when a place opens up.",
      },
      {
        q: "We're on a waiting list for a physical school - can we start online now and switch later if a seat opens?",
        a: "Yes. Families commonly use an online Cambridge track as a bridge while waiting for a preferred school place, then decide whether to switch once a seat is actually offered.",
      },
      {
        q: "Does it matter if we live in Sharjah or Ajman instead of Dubai?",
        a: "No - that's part of the point. Classes are attended online, so there's no commute calculation involved in choosing where you live within the UAE.",
      },
      {
        q: "What time are classes held in relative to UAE hours?",
        a: "Class times are shown in Gulf Standard Time (GST) directly, so there's no manual conversion from another timezone needed.",
      },
      {
        q: "Do UAE universities recognise O Level/A Level results from an online school the same way as a physical school?",
        a: "Cambridge O Level and A Level certificates are issued by Cambridge Assessment International Education regardless of whether the teaching was delivered online or in person, and are evaluated by universities on that basis. Confirm with a specific university's admissions office if you have a particular one in mind.",
        verify: true,
      },
      {
        q: "What happens if our visa status or sponsor changes mid-course?",
        a: "Enrollment isn't tied to a specific employer or visa category, so a change in sponsorship doesn't interrupt your child's course the way changing a physical school might.",
        verify: true,
      },
    ],
    images: {
      skyline: {
        src: "dubai-marina-skyline.webp",
        width: 1000,
        height: 667,
        alt: "Skyscrapers of the Dubai Marina district lit by evening sunset light",
        caption: "Dubai Marina, UAE.",
      },
      study1: STUDY_LAPTOP_IMAGE,
      study2: STUDY_DESK_IMAGE,
    },
    siblingSlugs: ["qatar", "kuwait"],
  },

  {
    slug: "qatar",
    countryName: "Qatar",
    flagCode: "qa",
    timeZone: "Asia/Qatar",
    currency: "QAR",
    heroKicker: "Cambridge Online School - Qatar",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in Qatar",
    metaTitle: "Online Cambridge School in Qatar | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes for Pakistani families in Doha - built for Qatar's smaller, competitive private-school market and Education City university pathways.",
    intro: [
      "Qatar's Pakistani community is smaller and far more concentrated than in Saudi Arabia or the UAE - overwhelmingly based in and around Doha. That concentration cuts both ways: strong community ties, but a genuinely smaller number of school seats chasing a private-school market that grew fast around the 2022 World Cup infrastructure boom and hasn't fully caught up since.",
      "Virtual City School gives a Doha-based Pakistani family a Cambridge O Level/A Level option that doesn't depend on winning a seat at one of a handful of oversubscribed schools.",
    ],
    schoolingLandscape: {
      heading: "What schooling actually looks like for Pakistani families in Qatar",
      paragraphs: [
        "Doha has a Pakistani-curriculum school (Pakistan International School Qatar) alongside a set of British and other international curriculum schools regulated under Qatar's Ministry of Education and Higher Education framework. Compared to Dubai or Riyadh, the total number of school seats in Qatar is much smaller in absolute terms, simply because the country and its expatriate population are smaller.",
        "That smaller supply means popular British-curriculum schools in Doha fill quickly, and tuition at the more established ones sits at a premium - a dynamic that intensified as new expatriate families arrived during and after the World Cup construction period, competing for a school-seat supply that expanded more slowly than the population did.",
        "For families who specifically want Cambridge O Level/A Level rather than the Pakistani Federal Board track, the realistic in-person choice set in Doha is genuinely narrow compared to a market like the UAE's.",
      ],
      verifyNote:
        "Current Doha private-school tuition ranges and post-World Cup enrollment-pressure figures are not stated here and should be checked before publishing specific numbers.",
    },
    whyOALevel: {
      heading: "Why O Level and A Level specifically, for a family in Qatar",
      paragraphs: [
        "Qatar has a distinctive advantage most of the Gulf doesn't: Education City in Doha hosts branch campuses of several international universities (including institutions with globally recognised American and European programmes) that admit students on the strength of internationally recognised secondary qualifications - Cambridge A Level among them. That makes A Level directly relevant to staying in Qatar for higher education, not only to leaving it.",
        "At the same time, most Pakistani families in Qatar are, like elsewhere in the Gulf, on renewable employment contracts in sectors like energy and construction, and can't assume their child will finish school and university in the same country. O Level and A Level keeps both paths - staying for an Education City university, or applying in Pakistan, the UK, or another Gulf country - open at once.",
        "For a return to Pakistan, results are converted through IBCC equivalence for university admission; confirm current IBCC documentation requirements directly, as they are periodically updated.",
      ],
    },
    diaspora:
      "Qatar's Pakistani community is tighter-knit and more Doha-centred than in Saudi Arabia or the UAE, and a large share of families are on fixed-term contracts tied to specific energy or construction projects. That makes continuity - not losing months of schooling to a mid-contract relocation within Qatar or a reassignment to another Gulf country - a bigger day-to-day concern than it might be for a more geographically settled community.",
    faq: [
      {
        q: "Is there a Pakistani-curriculum school in Doha, and how is this different?",
        a: "Pakistan International School Qatar teaches the Pakistani Federal Board curriculum. Virtual City School teaches Cambridge O Level and A Level - a different qualification track aimed at broader, internationally-portable university admission rather than a continuation of the Federal Board syllabus.",
      },
      {
        q: "Does doing A Level help if we want our child to study at an Education City university in Qatar?",
        a: "Education City's branch campuses generally admit on the strength of internationally recognised secondary qualifications, and Cambridge A Level is widely accepted among them. Confirm specific entry requirements directly with the university programme you're targeting, since requirements vary by institution.",
        verify: true,
      },
      {
        q: "We might relocate within Qatar, or to another Gulf country, during the course - does that cause a problem?",
        a: "No - since classes are attended online rather than at a physical campus, a change of address within Qatar, or even a relocation to another country in the region, doesn't interrupt enrollment the way changing a physical school would.",
      },
      {
        q: "What are Qatar school/work hours like relative to class timing?",
        a: "Class times are shown directly in Qatar's local time (AST, UTC+3), so there's no manual conversion required when planning around the Qatari week.",
      },
      {
        q: "Is Virtual City School recognised for a company-provided education allowance?",
        a: "This depends on your employer's specific policy for online schooling. We can provide enrollment confirmation and invoicing documentation - check with your HR/education-allowance administrator on their requirements before enrolling.",
        verify: true,
      },
      {
        q: "How does A Level compare to the Qatari national curriculum track?",
        a: "They are different systems aimed at different outcomes - the Qatari national curriculum is designed primarily around Qatari nationals' pathways, while Cambridge O Level/A Level is an internationally portable qualification more commonly used by expatriate families planning for university outside a single fixed system.",
        verify: true,
      },
    ],
    images: {
      skyline: {
        src: "doha-corniche-skyline.webp",
        width: 1000,
        height: 667,
        alt: "Doha's skyline viewed across the water from the Corniche promenade",
        caption: "Doha, Qatar, seen from the Corniche.",
      },
      study1: STUDY_DESK_IMAGE,
      study2: STUDY_LAPTOP_IMAGE,
    },
    siblingSlugs: ["kuwait", "saudi-arabia"],
  },

  {
    slug: "kuwait",
    countryName: "Kuwait",
    flagCode: "kw",
    timeZone: "Asia/Kuwait",
    currency: "KWD",
    heroKicker: "Cambridge Online School - Kuwait",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in Kuwait",
    metaTitle: "Online Cambridge School in Kuwait | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes for Kuwait's long-settled Pakistani community - a Cambridge track that isn't dependent on a single private-school seat.",
    intro: [
      "Kuwait has one of the oldest, most established Pakistani expatriate communities in the Gulf - many families have lived there across two generations. That long history hasn't made schooling access simple: Kuwait's private-school sector for expatriate children operates under Ministry of Education oversight with capacity and licensing rules that have, at various points in recent years, been the subject of public policy debate about expatriate school seats and fee levels.",
      "Virtual City School gives a Kuwait-based Pakistani family a Cambridge O Level/A Level path that isn't dependent on holding a seat at one specific private school under one specific set of local rules.",
    ],
    schoolingLandscape: {
      heading: "What schooling actually looks like for Pakistani families in Kuwait",
      paragraphs: [
        "Kuwait's expatriate schooling options split similarly to the rest of the Gulf: Pakistani-curriculum schools serving the Federal Board syllabus, and British/American-curriculum private schools offering IGCSE, O Level and A Level. Kuwait's Ministry of Education licenses and regulates private schools, and capacity for expatriate students, along with private-school fee levels, has been an active policy topic in Kuwait in recent years.",
        "For families specifically wanting Cambridge O Level/A Level, the practical effect is a private-school market where a place is not something to take for granted year to year in the way it might be assumed to be - continuity of enrollment at one physical school isn't guaranteed on the same terms every academic year.",
        "This is an area where policy specifics change and should be verified directly rather than assumed from general Gulf-region reporting - see the note below.",
      ],
      verifyNote:
        "Any specific claim about Kuwaiti government rules on expatriate private-school capacity, quotas, or fee caps needs to be checked against current, dated Kuwaiti Ministry of Education sources before publishing - this is stated here only in general terms deliberately.",
    },
    whyOALevel: {
      heading: "Why O Level and A Level specifically, for a family in Kuwait",
      paragraphs: [
        "Kuwait's public universities are, in practice, not a realistic undergraduate pathway for most expatriate students. That means, more clearly than in any of the other three countries here, Pakistani families in Kuwait are planning from the outset for their child to attend university somewhere else - Pakistan, the UK, another Gulf country with more open university access, or further afield.",
        "Cambridge O Level and A Level is built precisely for that situation: a globally recognised qualification that doesn't assume the student will study in the country where they went to secondary school.",
        "On return to Pakistan, results convert through IBCC equivalence for university admission - confirm current IBCC documentation requirements directly, since these are periodically updated.",
      ],
    },
    diaspora:
      "Kuwait's Pakistani community includes many multi-generational families with deep roots and strong community institutions built up over decades - a different texture from the more recently-arrived, contract-driven communities in Qatar. Alongside that stability sits real, ongoing uncertainty about the policy environment for expatriate schooling, which makes a schooling option that isn't tied to one specific licensed seat a genuinely practical hedge, not just a convenience.",
    faq: [
      {
        q: "With policy discussion in Kuwait about expatriate school capacity, is an online school affected by the same rules?",
        a: "Online enrollment with Virtual City School is not tied to Kuwaiti private-school licensing capacity for physical seats, since classes are delivered online rather than at a licensed campus. For your family's specific situation, we'd recommend also checking current guidance from Kuwait's Ministry of Education directly.",
        verify: true,
      },
      {
        q: "Our current school in Kuwait can't guarantee a seat next year - can my child continue with Virtual City School if that happens?",
        a: "Yes - enrollment can begin at any point in the academic calendar, so a gap caused by losing a place at a physical school doesn't have to mean a gap in your child's O Level/A Level progress.",
      },
      {
        q: "Since Kuwaiti public universities aren't generally open to expatriate students, how does A Level help us plan for university?",
        a: "A Level is designed for exactly this situation - it's recognised for admission in Pakistan, the UK, and other Gulf countries, so your child isn't limited to a university system they may not have access to.",
      },
      {
        q: "What do Pakistani-curriculum versus British-curriculum schools in Kuwait typically cost?",
        a: "Fees vary significantly by school and change over time - we don't want to quote a figure here that may be out of date. Message us on WhatsApp and we can talk through how Virtual City School's fees compare to what you're currently paying.",
        verify: true,
      },
      {
        q: "What time are classes held in relative to Kuwait?",
        a: "Class times are shown directly in Kuwait's local time (AST, UTC+3) - no manual conversion needed.",
      },
      {
        q: "What happens if we're in the middle of relocating within Kuwait or leaving the country?",
        a: "Since classes are attended online, a change of address - within Kuwait or to another country - doesn't interrupt your child's enrollment the way changing a physical school would.",
      },
    ],
    images: {
      skyline: {
        src: "kuwait-city-skyline.webp",
        width: 1000,
        height: 607,
        alt: "Kuwait City's skyline reflected in calm water at sunset",
        caption: "Kuwait City, Kuwait.",
      },
      study1: STUDY_LAPTOP_IMAGE,
      study2: STUDY_DESK_IMAGE,
    },
    siblingSlugs: ["saudi-arabia", "uae"],
  },
];

export const getCountryBySlug = (slug) =>
  COUNTRY_PAGES.find((c) => c.slug === slug);
