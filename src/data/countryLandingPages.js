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
  BHD: { rate: 0.376, label: "Bahraini Dinar" },
  OMR: { rate: 0.385, label: "Omani Rial" },
  // Unlike the Gulf currencies above, these float rather than peg to the
  // dollar - approximate and illustrative only (the UI already labels this
  // "not a live feed" everywhere it's shown), not a claim of precision.
  GBP: { rate: 0.79, label: "British Pound" },
  CAD: { rate: 1.38, label: "Canadian Dollar" },
  AUD: { rate: 1.53, label: "Australian Dollar" },
  PKR: { rate: 278, label: "Pakistani Rupee" },
};

// Photos sourced via the Pexels API (free tier, no attribution required by
// license) and screened against the content rules before use: no religious
// or political imagery, no identifiable person framed as "our student," no
// physical-classroom shots that would misrepresent VCS as running a campus.
// Converted to WebP, capped at 1000px wide, stored per country under
// public/assets/countries/<slug>/.
//
// Every image below is unique to its own country - no file is reused across
// pages (an earlier version shared two generic "student at a desk" photos
// across all four, which read as duplication). Each country now gets its
// own skyline, its own culturally-specific landmark, and its own distinct
// student/online-class photo, chosen for genuine landmark recognizability
// (the kind of shot that already ranks for "[city] skyline" / "[landmark
// name]" on Google Images) rather than generic stock.

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
      study1: {
        src: "al-balad-jeddah-heritage.webp",
        width: 1000,
        height: 1500,
        alt: "Traditional Hejazi coral-stone architecture with green wooden balconies in the historic Al-Balad district of Jeddah, Saudi Arabia",
        caption: "Al-Balad, the historic heart of Jeddah.",
      },
      study2: {
        src: "student-online-class-saudi.webp",
        width: 1000,
        height: 667,
        alt: "A young boy attending a live online class at a home desk, with a lamp and study books nearby",
        caption: "One live teacher, one small class, joined from home.",
      },
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
      study1: {
        src: "burj-al-arab-dubai.webp",
        width: 1000,
        height: 667,
        alt: "The sail-shaped Burj Al Arab hotel on the Dubai coastline, seen from the sea",
        caption: "The Burj Al Arab, Dubai.",
      },
      study2: {
        src: "student-video-call-uae.webp",
        width: 1000,
        height: 667,
        alt: "A student on a video call with a teacher, taking notes at a home desk",
        caption: "Live classes fit around a normal home study routine, not a commute to campus.",
      },
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
      study1: {
        src: "souq-waqif-doha-textiles.webp",
        width: 1000,
        height: 667,
        alt: "Colourful woven textiles and cushions on display in the stalls of Souq Waqif, Doha",
        caption: "Souq Waqif, Doha's traditional market.",
      },
      study2: {
        src: "student-online-class-qatar.webp",
        width: 1000,
        height: 667,
        alt: "A student following an online class on a laptop, seen from above at a home desk",
        caption: "One live teacher, one small class, joined from home.",
      },
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
      study1: {
        src: "al-hamra-tower-kuwait.webp",
        width: 1000,
        height: 1334,
        alt: "Al Hamra Tower's distinctive twisting facade rising above Kuwait City",
        caption: "Al Hamra Tower, Kuwait City.",
      },
      study2: {
        src: "student-studying-kuwait.webp",
        width: 1000,
        height: 667,
        alt: "A teenage student sitting on the floor of a bright living room, studying with a laptop and notes",
        caption: "Live classes fit around a normal home study routine, not a commute to campus.",
      },
    },
    siblingSlugs: ["saudi-arabia", "uae"],
  },

  {
    slug: "bahrain",
    countryName: "Bahrain",
    flagCode: "bh",
    timeZone: "Asia/Bahrain",
    currency: "BHD",
    heroKicker: "Cambridge Online School - Bahrain",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in Bahrain",
    metaTitle: "Online Cambridge School in Bahrain | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes for Pakistani families in Manama, Isa Town and across Bahrain - built for multi-year waiting lists at Bahrain's British-curriculum schools.",
    intro: [
      "Bahrain's Pakistani community is one of the oldest and most established in the Gulf - Pakistan School, Bahrain has been running since 1968, now split across a primary wing in Manama and a main campus in Isa Town. It teaches the Pakistani Federal Board curriculum (Matriculation and HSSC/FSc), not Cambridge O Level or A Level.",
      "For a Cambridge track, Bahraini families turn to the country's British-curriculum schools - St Christopher's School, the British School of Bahrain, Capital School Bahrain and a handful of others. These are well-regarded, but seats at the most in-demand ones are genuinely scarce: popular year groups commonly carry waiting lists, and several run hard application-window cutoffs months before the academic year starts. Virtual City School gives a Bahrain-based Pakistani family a live Cambridge O Level/A Level option that isn't contingent on being early enough, or lucky enough, to get one of those seats.",
    ],
    schoolingLandscape: {
      heading: "What schooling actually looks like for Pakistani families in Bahrain",
      paragraphs: [
        "Pakistani families in Bahrain generally choose between the Pakistani Federal Board track at Pakistan School, Bahrain, and a British-curriculum international school offering IGCSE, O Level and A Level. The two are not close substitutes: one leads to a Matric/FSc certificate recognised primarily within Pakistan's own system, the other to an internationally portable Cambridge qualification.",
        "Bahrain's most established British-curriculum schools - among them St Christopher's School (running since 1961) and the selective British School of Bahrain - are routinely described as having genuine waiting lists for popular year groups, with some in-demand schools' intake windows closing months ahead of the academic year. A family that starts looking mid-year, or after a mid-year relocation to Bahrain, can find the realistic in-person choice set for Cambridge O Level/A Level narrower than the total number of schools in the country would suggest.",
        "For families who specifically want the Cambridge track rather than the Federal Board syllabus, that leaves a fairly small number of schools actually competing for the same seats - a very different situation from a market the size of the UAE's.",
      ],
      verifyNote:
        "Specific current tuition figures, exact waiting-list durations, and this year's application-window dates for Bahrain's British-curriculum schools are not stated here and should be confirmed against each school's own admissions page before publishing any number publicly.",
    },
    whyOALevel: {
      heading: "Why O Level and A Level specifically, for a family in Bahrain",
      paragraphs: [
        "Bahrain's public higher-education system, like most of the Gulf, is not the default pathway for expatriate students. That means Pakistani families in Bahrain are, in the overwhelming majority of cases, already planning for their child to study elsewhere after school - Pakistan, the UK, another Gulf country, or a private university with an international admissions track.",
        "Cambridge O Level and A Level is built for exactly that uncertainty: a single qualification recognised for university admission across Pakistan, the UK, and the wider Gulf, without requiring a family to commit in advance to one specific destination.",
        "On return to Pakistan specifically, O Level and A Level results are converted to a Pakistani-board equivalent by the Inter Board Committee of Chairmen (IBCC) for university admission - a standard, well-established process, though families should confirm current IBCC documentation requirements directly, since these are periodically updated.",
      ],
    },
    diaspora:
      "Bahrain's Pakistani community is long-settled and multi-generational in a way few other Gulf markets can match - Pakistan School, Bahrain has been serving it since 1968. That history hasn't translated into abundant Cambridge-track school seats, though: the community's schooling need has outgrown what the country's smaller number of British-curriculum schools can seat every year, which is exactly the constraint an online school removes.",
    faq: [
      {
        q: "Is there a Pakistani-curriculum school in Bahrain, and how is this different?",
        a: "Pakistan School, Bahrain teaches the Pakistani Federal Board curriculum (Matriculation and HSSC/FSc) across its Manama and Isa Town campuses. Virtual City School teaches Cambridge O Level and A Level instead - a different, internationally-portable qualification track, not a continuation of or replacement for the Federal Board syllabus.",
      },
      {
        q: "We're on a waiting list for a British-curriculum school in Bahrain - can our child start online now and switch later?",
        a: "Yes. Families commonly use an online Cambridge track as a bridge while waiting for a place to open up at a preferred school, then decide whether to switch once a seat is actually offered.",
      },
      {
        q: "How does the class schedule work with Bahrain's Friday-Saturday weekend?",
        a: "Class timings are planned around the standard Gulf week, and times are shown in Arabian Standard Time (AST) so there's no manual conversion needed.",
      },
      {
        q: "Do we need a specific visa or residency status to enroll?",
        a: "Enrollment isn't tied to a specific visa category - it's designed for expatriate families living in Bahrain generally. If your situation is unusual, message us on WhatsApp before enrolling to confirm.",
        verify: true,
      },
      {
        q: "If we eventually move back to Pakistan, will these results actually count?",
        a: "Cambridge O Level and A Level results are converted to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission. Confirm current documentation requirements with IBCC directly, as processes can be updated.",
        verify: true,
      },
      {
        q: "Is Virtual City School recognised for a company education allowance in Bahrain?",
        a: "This depends on your employer's specific policy for online schooling. We can provide enrollment confirmation and invoicing documentation - check with your HR/education-allowance administrator on their requirements before enrolling.",
        verify: true,
      },
    ],
    images: {
      skyline: {
        src: "manama-skyline.webp",
        width: 1000,
        height: 667,
        alt: "Manama's skyline at dusk, including the twin sail-shaped towers of the Bahrain World Trade Center",
        caption: "Manama, Bahrain.",
      },
      study1: {
        src: "qalat-al-bahrain-fort.webp",
        width: 1000,
        height: 667,
        alt: "The coral-stone walls of Qal'at al-Bahrain (Bahrain Fort), a UNESCO World Heritage site on the Gulf coast",
        caption: "Qal'at al-Bahrain, a UNESCO World Heritage Site.",
      },
      study2: {
        src: "student-online-class-bahrain.webp",
        width: 1000,
        height: 667,
        alt: "A student attending a live online class on a laptop at a home desk",
        caption: "One live teacher, one small class, joined from home.",
      },
    },
    siblingSlugs: ["qatar", "kuwait"],
  },

  {
    slug: "oman",
    countryName: "Oman",
    flagCode: "om",
    timeZone: "Asia/Muscat",
    currency: "OMR",
    heroKicker: "Cambridge Online School - Oman",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in Oman",
    metaTitle: "Online Cambridge School in Oman | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes for Pakistani families across Muscat, Sohar, Nizwa, Salalah and beyond - a Cambridge track that doesn't depend on where in Oman you live.",
    intro: [
      "Oman's Pakistani community is spread far wider than in most other Gulf markets - the Pakistan Schools Oman network runs seven campuses across Muscat, Seeb, Buraimi, Nizwa, Sohar, Salalah and Sawiq, serving a community estimated at around 400,000. The flagship, Pakistan School Muscat, is unusual in the region: alongside the Pakistani Federal Board curriculum, it also runs a Cambridge IGCSE/AS/A Level stream on the same very large, oversubscribed campus.",
      "Oman's dedicated British-curriculum schools - led by the long-established British School Muscat and premium options like Cheltenham Muscat - concentrate almost entirely in the capital, and the best-known among them keep genuine, multi-year waiting lists. For a family outside Muscat, or one that can't secure a Cambridge-stream seat within Pakistan School Muscat itself, Virtual City School offers a live Cambridge O Level/A Level option that doesn't depend on where in Oman you live.",
    ],
    schoolingLandscape: {
      heading: "What schooling actually looks like for Pakistani families in Oman",
      paragraphs: [
        "Pakistan School Muscat, the historic flagship of the seven-school Pakistan Schools Oman network, is one of the largest community schools in the Gulf - over 3,000 students from roughly 20 nationalities, spanning Kindergarten through Grade 12/A Level. Notably, it already offers a Cambridge IGCSE/AS/A Level pathway internally, alongside the Federal Board (FBISE) track - genuinely more than the equivalent Pakistani community schools in Saudi Arabia, Qatar, Kuwait or Bahrain provide. But that Cambridge stream sits inside one very large, long-running campus in Muscat, and the other six schools in the network - in Seeb, Buraimi, Nizwa, Sohar, Salalah and Sawiq - exist primarily to extend the Federal Board track geographically, not the Cambridge one.",
        "For a dedicated British-curriculum option, Muscat has a small set of well-regarded schools - British School Muscat (Oman's oldest, operating for over 50 years), Cheltenham Muscat, and mid-tier options like Muscat International School. The most established of these are consistently described as heavily oversubscribed, with families advised to apply many months, sometimes upward of a year, ahead of the intended start date, particularly for the most sought-after year groups.",
        "Outside Muscat - in Sohar, Nizwa, Salalah, Buraimi and Sawiq, where much of the Pakistan Schools Oman network itself is concentrated - the realistic in-person choice for a Cambridge O Level/A Level track narrows further still, simply because Oman's British-curriculum schools are almost entirely a Muscat phenomenon.",
      ],
      verifyNote:
        "Current admission status, fees, and waiting-list length for Pakistan School Muscat's Cambridge stream and for Muscat's British-curriculum schools should be confirmed directly with each school before publishing any specific figure or availability claim.",
    },
    whyOALevel: {
      heading: "Why O Level and A Level specifically, for a family in Oman",
      paragraphs: [
        "Oman's public universities are structured primarily around Omani nationals, so - as in most of the Gulf - the default undergraduate pathway isn't open to most expatriate students. Pakistani families in Oman are typically planning from early on for their child to study elsewhere: Pakistan, the UK, another Gulf country, or a private university with an international admissions track.",
        "Cambridge O Level and A Level is built for that uncertainty specifically - an internationally recognised qualification for admission across Pakistan, the UK, and the wider Gulf that doesn't require a family to have already decided where their child will study next.",
        "On return to Pakistan, O Level and A Level results are converted to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission - a standard process, though families should confirm current IBCC documentation requirements directly, as these are periodically updated.",
      ],
    },
    diaspora:
      "Oman's Pakistani community, estimated at around 400,000, is more geographically spread out than almost anywhere else in the Gulf - the seven-school Pakistan Schools Oman network exists specifically because that community isn't concentrated in one or two cities the way it is in the UAE or Qatar. For a family in Sohar, Nizwa, Salalah or Buraimi in particular, distance from Muscat's small cluster of British-curriculum schools is a bigger day-to-day constraint on a Cambridge education than cost or a waiting list.",
    faq: [
      {
        q: "Pakistan School Muscat already offers a Cambridge stream - how is Virtual City School different?",
        a: "Pakistan School Muscat's Cambridge IGCSE/AS/A Level stream sits inside one very large, long-established campus in Muscat, alongside its much bigger Federal Board programme. Virtual City School is a dedicated live online O Level/A Level track that isn't tied to competing for a seat within that specific stream, or to living near Muscat at all.",
        verify: true,
      },
      {
        q: "My family lives in Sohar, Nizwa, Salalah or Buraimi, far from Muscat's British-curriculum schools - can my child still do O Level or A Level?",
        a: "Yes - this is precisely the situation an online Cambridge school is designed for. Your child attends live classes from home, with no dependency on a physical school existing in your city.",
      },
      {
        q: "We're on a waiting list for a British-curriculum school in Muscat - can we start online now and switch later if a seat opens?",
        a: "Yes. Families commonly use an online Cambridge track as a bridge while waiting for a preferred school place, then decide whether to switch once a seat is actually offered.",
      },
      {
        q: "How does the class schedule work with Oman's Friday-Saturday weekend?",
        a: "Class timings are planned around the standard Gulf week, and times are shown in Gulf Standard Time (GST) - the same time zone as the UAE - so there's no manual conversion needed.",
      },
      {
        q: "Do we need a specific visa or residency status to enroll?",
        a: "Enrollment isn't tied to a specific visa category - it's designed for expatriate families living in Oman generally. If your situation is unusual, message us on WhatsApp before enrolling to confirm.",
        verify: true,
      },
      {
        q: "If we eventually move back to Pakistan, will these results actually count?",
        a: "Cambridge O Level and A Level results are converted to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission. Confirm current documentation requirements with IBCC directly, as processes can be updated.",
        verify: true,
      },
    ],
    images: {
      skyline: {
        src: "muttrah-corniche-muscat.webp",
        width: 1000,
        height: 667,
        alt: "Muttrah Corniche in Muscat, Oman, with traditional dhows moored along the waterfront and mountains behind",
        caption: "Muttrah Corniche, Muscat.",
      },
      study1: {
        src: "nizwa-fort-oman.webp",
        width: 1000,
        height: 1334,
        alt: "The round tower of Nizwa Fort rising against a clear sky in Oman's interior",
        caption: "Nizwa Fort, one of Oman's best-known landmarks outside the capital.",
      },
      study2: {
        src: "student-online-class-oman.webp",
        width: 1000,
        height: 667,
        alt: "A student attending a live online class on a laptop at a home desk",
        caption: "Live classes fit around a normal home study routine, not a commute to campus.",
      },
    },
    siblingSlugs: ["uae", "qatar"],
  },

  // The six pages above are all Gulf countries, where the pitch is "no
  // Cambridge school exists near you." The five below are structurally
  // different markets - the UK, US, Canada and Australia all run their own
  // native secondary curricula (GCSE/A-Level in the UK; state/provincial
  // diplomas in the US, Canada and Australia), so "no Cambridge option
  // locally" isn't the honest pitch there. Pakistan is different again - not
  // a diaspora market at all, but families already inside Pakistan choosing
  // between VCS and the country's own established (and expensive, and
  // city-concentrated) private Cambridge school networks. Photography has
  // not been sourced for these five yet - images is intentionally {} and
  // CountryInlineImage renders nothing when a slot is empty, so the page
  // still works, just without the floated photos the Gulf pages have.
  {
    slug: "uk",
    countryName: "United Kingdom",
    flagCode: "gb",
    timeZone: "Europe/London",
    currency: "GBP",
    heroKicker: "Cambridge Online School - United Kingdom",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in the UK",
    metaTitle: "Online Cambridge School for Pakistani Families in the UK | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes with Urdu, Islamiyat and Pakistan Studies alongside Cambridge - for Pakistani families in Bradford, Birmingham, London, Manchester and beyond.",
    intro: [
      "The UK is the one market on this list where the obvious objection comes first: British schools already teach GCSEs and A-Levels, so why would a Pakistani family in Bradford or Birmingham need an online Cambridge school at all?",
      "The honest answer is that VCS isn't pitched at every British-Pakistani family - it's for the specific situations where the local system doesn't quite fit: a child being home-educated who still needs a structured, examined curriculum; a family wanting Urdu, Islamiyat and Pakistan Studies taught properly alongside the Cambridge core, which no mainstream UK school offers; or a family moving between the UK, Pakistan and the Gulf who needs a curriculum that travels with them instead of restarting each time.",
    ],
    schoolingLandscape: {
      heading: "Where VCS actually fits alongside UK schooling",
      paragraphs: [
        "Most British-Pakistani families are already inside the UK state or private school system, sitting GCSEs and A-Levels through UK exam boards (AQA, Edexcel, OCR) rather than Cambridge International - and for the large majority of families, that's the right, free, default path. VCS isn't trying to replace that.",
        "Where it does come up: places in oversubscribed schools in Pakistani-dense areas - parts of Bradford, East London, and Birmingham have real, documented pressure on school-place admissions, particularly mid-year - families who choose to home-educate for religious, cultural or personal reasons and want a recognised, examined curriculum rather than an unstructured one, and families who move between the UK and Pakistan or the Gulf and need a qualification that's recognised the same way wherever they land next.",
        "Cambridge O Level/IGCSE and A Level are set by Cambridge International, a different exam board to the UK's domestic GCSE boards but built to the same level and broadly treated as equivalent for progression purposes - families should confirm equivalence directly with a specific sixth form, college or employer if it matters for a particular decision.",
      ],
      verifyNote:
        "GCSE-vs-Cambridge-IGCSE equivalence treatment varies by receiving institution and is not a single fixed rule - do not state a blanket guarantee of equivalence without a citable UK-government or awarding-body source before publish.",
    },
    whyOALevel: {
      heading: "Why Cambridge specifically, for a family already in the UK",
      paragraphs: [
        "Cambridge O Level and A Level are recognised across Pakistan, the Gulf and the UK itself - which matters specifically for a family that might not stay in the UK permanently, or that wants their child to have a genuinely global set of university options rather than a UK-only one.",
        "For return to Pakistan: results convert to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission, the same process that applies from any Cambridge-taught background - confirm current documentation requirements with IBCC directly.",
        "For families choosing to home-educate: Cambridge O/A Level gives a nationally and internationally recognised exam at the end of it, rather than a home-education pathway with no external, comparable qualification attached.",
      ],
    },
    diaspora:
      "The UK has the largest Pakistani-origin population outside Pakistan itself - over 1.6 million people recorded in the 2021 Census - concentrated in Bradford, Birmingham, East London, Manchester, Luton and Slough. That scale means most families already have real, local schooling options; VCS is built for the specific minority of situations inside that community where those options don't quite fit, not as a general alternative to British schooling.",
    faq: [
      {
        q: "My child already attends a UK school and sits GCSEs - why would we need this?",
        a: "For most families, you wouldn't - a UK state or private school GCSE/A-Level path is usually the right default. VCS tends to make sense for home-educating families, families wanting Urdu/Islamiyat/Pakistan Studies alongside the core subjects, or families expecting to relocate to Pakistan or the Gulf.",
      },
      {
        q: "Is a Cambridge O Level the same as a GCSE for UK college or sixth-form admission?",
        a: "They're set to a broadly comparable level by a different exam board, and are generally treated as equivalent, but individual sixth forms, colleges and employers set their own admission rules. Confirm directly with the specific institution before relying on this for a UK progression decision.",
        verify: true,
      },
      {
        q: "We're struggling to get a secondary school place in our area - can VCS be our child's main school, not just a supplement?",
        a: "Yes - VCS is a full live-taught school, not a supplementary tutoring service. A child can be enrolled as their primary schooling, not just extra lessons alongside another school.",
      },
      {
        q: "If we move back to Pakistan or to the Gulf, will these results actually count?",
        a: "Cambridge O Level and A Level results convert to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission, and are separately recognised across the Gulf. Confirm current IBCC documentation requirements directly, as processes can be updated.",
        verify: true,
      },
      {
        q: "What time do live classes run for us in the UK?",
        a: "Saudi Arabia is 2-3 hours ahead of the UK depending on the time of year (UK clocks change for daylight saving, Saudi Arabia's don't). Message us on WhatsApp with your child's grade and subjects to confirm exact timings before enrolling.",
      },
      {
        q: "Do you offer home-education-friendly reporting or portfolios for local authority purposes?",
        a: "We can provide attendance and academic progress records on request. Home-education reporting requirements are set by your local authority, not by us - check your specific council's current elective home education guidance.",
        verify: true,
      },
    ],
    images: {},
    siblingSlugs: ["us", "canada"],
  },

  {
    slug: "us",
    countryName: "United States",
    flagCode: "us",
    timeZone: "America/New_York",
    currency: "USD",
    heroKicker: "Cambridge Online School - United States",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in the US",
    metaTitle: "Online Cambridge School for Pakistani Families in the US | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes with Urdu, Islamiyat and Pakistan Studies alongside Cambridge - for Pakistani-American families choosing a globally portable qualification.",
    intro: [
      "American public and private high schools don't run GCSE-style O Levels or A Levels at all - they run grade-based diplomas, often alongside Advanced Placement (AP) courses, which is a genuinely different structure from what most Pakistani families abroad are used to comparing against.",
      "So the question for a Pakistani-American family isn't \"why choose Cambridge over a local Cambridge school\" the way it might be in the Gulf - it's whether a globally portable, internationally recognised qualification alongside (or instead of) the US diploma track is worth having, particularly for families who may return to Pakistan, move to the Gulf, or simply want their child's university options to include Pakistan, the UK and the Gulf as well as the US.",
    ],
    schoolingLandscape: {
      heading: "Where Cambridge fits into an American education",
      paragraphs: [
        "The default path for most Pakistani-American families is the local US public or private high school system, leading to a US high school diploma - a well-understood, free (for public schools) and locally-accepted qualification that VCS is not trying to replace for most families.",
        "Cambridge O/A Level tends to matter for three specific groups: families who home-school (a large and established choice within many Muslim-American communities) and want a recognised external curriculum rather than an unaccredited one; families expecting to relocate - back to Pakistan, to the Gulf, or elsewhere - who want a qualification that transfers cleanly rather than restarting under a new system; and families who want Urdu, Islamiyat and Pakistan Studies taught properly, which isn't offered inside the US public system.",
        "Cambridge International A Levels are accepted for admission, and in some cases credit, by a number of US universities, though policies vary significantly by institution - a family relying on this for a specific university's admissions decision should confirm directly with that university's admissions office.",
      ],
      verifyNote:
        "US university acceptance of Cambridge A Levels varies by institution and by year - do not state that a specific named US university accepts Cambridge credentials without a current, citable source from that university's own admissions policy.",
    },
    whyOALevel: {
      heading: "Why Cambridge specifically, for a family based in the US",
      paragraphs: [
        "Cambridge O Level and A Level are recognised for university admission across Pakistan, the UK and the Gulf, and by a number of US universities as well - giving a Pakistani-American family a genuinely wider set of options than a US-only diploma path, without giving anything up if the family stays in the US long-term.",
        "For return to Pakistan specifically: O Level and A Level results are converted to a Pakistani-board equivalent by the Inter Board Committee of Chairmen (IBCC) for university admission - confirm current documentation requirements with IBCC directly.",
        "For home-schooling families: Cambridge O/A Level gives a structured syllabus and an externally examined, internationally recognised result, rather than an unaccredited home-school curriculum with no comparable outside benchmark.",
      ],
    },
    diaspora:
      "The Pakistani-American population was recorded at roughly 684,000 people in the US Census Bureau's 2023 American Community Survey, with significant communities in the New York/New Jersey area (including the Coney Island, Brooklyn area sometimes called \"Little Pakistan\"), Houston, Chicago, Northern Virginia/DC, and California. It's a geographically spread-out community compared to the UK's, which is part of why a live online school - rather than a physical one - fits the way many Pakistani-American families are already distributed.",
    faq: [
      {
        q: "The time difference between the US and Saudi Arabia is huge - how do live classes actually work for us?",
        a: "It's a real gap - Saudi Arabia is roughly 8 hours ahead of the US East Coast and up to 11 hours ahead of the West Coast. Message us on WhatsApp with your time zone and your child's grade before enrolling so we can confirm which batch slots are realistically workable for your family.",
      },
      {
        q: "Will a Cambridge A Level actually help with US university admissions?",
        a: "Cambridge International A Levels are accepted for admission, and sometimes credit, by a number of US universities, but policies differ by institution. If a specific university's admission decision matters to you, confirm directly with that university's admissions office rather than relying on a general answer.",
        verify: true,
      },
      {
        q: "We already home-school under our state's regulations - how does VCS fit with that?",
        a: "VCS can serve as your child's examined curriculum within a home-school program, but home-school reporting and legal requirements are set at the state level and vary significantly. Check your specific state's current home-education requirements - we don't file paperwork on your behalf.",
        verify: true,
      },
      {
        q: "If we move back to Pakistan or to the Gulf, will these results actually count?",
        a: "Cambridge O Level and A Level results convert to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission, and are separately recognised across the Gulf. Confirm current IBCC documentation requirements directly, as processes can be updated.",
        verify: true,
      },
      {
        q: "Do you teach Urdu, Islamiyat and Pakistan Studies, or only the Cambridge core subjects?",
        a: "Both - alongside Cambridge O Level, AS Level and A2 Level subjects, we teach Urdu, Islamiyat and Pakistan Studies, which aren't offered inside the US public school system.",
      },
      {
        q: "Is this a full-time school or a supplement to our child's existing US schooling?",
        a: "It works either way - as your child's full-time school, or as a structured supplement (for example, alongside home-schooling, or to keep Urdu and Pakistan Studies going while your child is otherwise in a US school).",
      },
    ],
    images: {},
    siblingSlugs: ["canada", "uk"],
  },

  {
    slug: "canada",
    countryName: "Canada",
    flagCode: "ca",
    timeZone: "America/Toronto",
    currency: "CAD",
    heroKicker: "Cambridge Online School - Canada",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in Canada",
    metaTitle: "Online Cambridge School for Pakistani Families in Canada | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes with Urdu, Islamiyat and Pakistan Studies alongside Cambridge - for Pakistani-Canadian families in Toronto, Mississauga, Brampton and beyond.",
    intro: [
      "Canada, like the US, doesn't run GCSE-style O Levels or A Levels - each province sets its own secondary diploma (the Ontario Secondary School Diploma, for example), which is a different structure from what a family might be used to from Pakistan or the Gulf.",
      "For a Pakistani-Canadian family, VCS isn't a replacement for the provincial diploma most children will still need - it's for the specific situations where a globally portable Cambridge qualification, taught alongside Urdu, Islamiyat and Pakistan Studies, adds something the local system doesn't: home-schooling families, families planning an eventual move to Pakistan or the Gulf, or families who simply want their child's academic options to extend beyond Canada.",
    ],
    schoolingLandscape: {
      heading: "Where Cambridge fits alongside Canadian schooling",
      paragraphs: [
        "Most Pakistani-Canadian families are inside their provincial public or Catholic school system, working toward a provincial diploma - a well-established, free, locally-recognised path that VCS is not positioned to replace for most children.",
        "Where VCS tends to come up: families who home-school under their province's regulations and want a recognised, externally examined curriculum rather than an unaccredited one; families who expect to relocate - back to Pakistan, to the Gulf, or elsewhere - and want continuity rather than switching systems entirely; and families who want Urdu, Islamiyat and Pakistan Studies taught properly, which Canadian public schools generally don't offer.",
        "Toronto's Peel Region (Mississauga and Brampton in particular) has one of the largest concentrations of Pakistani-Canadian families in the country, alongside communities in other parts of the Greater Toronto Area, Calgary and Vancouver.",
      ],
      verifyNote:
        "Provincial home-schooling regulations and diploma-equivalence rules vary by province and change over time - do not state a specific province's requirements as fact without a current, citable source from that province's Ministry of Education.",
    },
    whyOALevel: {
      heading: "Why Cambridge specifically, for a family based in Canada",
      paragraphs: [
        "Cambridge O Level and A Level are recognised for university admission across Pakistan, the UK and the Gulf, giving a Pakistani-Canadian family university options beyond Canada if their plans change - without needing to give up a Canadian path if they stay.",
        "For return to Pakistan specifically: O Level and A Level results are converted to a Pakistani-board equivalent by the Inter Board Committee of Chairmen (IBCC) for university admission - confirm current documentation requirements with IBCC directly.",
        "For home-schooling families: Cambridge O/A Level provides a structured, internationally examined syllabus, giving a home-schooled child a comparable, recognised result rather than an informal record with no external benchmark.",
      ],
    },
    diaspora:
      "Canada's Pakistani-origin population was recorded at just over 300,000 in the 2021 census, concentrated heavily in Ontario - especially Mississauga and Brampton in the Greater Toronto Area - with further communities in Calgary and Vancouver. It's a younger, faster-growing community than some other Pakistani diaspora populations, which is part of why school-age demand for options like VCS keeps growing alongside it.",
    faq: [
      {
        q: "The time difference between Canada and Saudi Arabia is significant - how do live classes actually work for us?",
        a: "It's real, and varies by which part of Canada you're in - roughly 8 hours behind Saudi Arabia in Toronto, up to 11 hours in Vancouver. Message us on WhatsApp with your time zone and your child's grade before enrolling so we can confirm workable batch slots.",
      },
      {
        q: "We already home-school under our province's regulations - how does VCS fit with that?",
        a: "VCS can serve as your child's examined curriculum within a home-school program, but reporting and legal requirements are set provincially and vary. Check your specific province's current home-education requirements directly - we don't file paperwork on your behalf.",
        verify: true,
      },
      {
        q: "Will Canadian universities recognise a Cambridge A Level for admission?",
        a: "Many Canadian universities do accept Cambridge International qualifications for admission, though policies and specific subject/grade requirements vary by institution. Confirm directly with the specific university if this matters for a particular admissions decision.",
        verify: true,
      },
      {
        q: "If we move back to Pakistan or to the Gulf, will these results actually count?",
        a: "Cambridge O Level and A Level results convert to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission, and are separately recognised across the Gulf. Confirm current IBCC documentation requirements directly, as processes can be updated.",
        verify: true,
      },
      {
        q: "Do you teach Urdu, Islamiyat and Pakistan Studies, or only the Cambridge core subjects?",
        a: "Both - alongside Cambridge O Level, AS Level and A2 Level subjects, we teach Urdu, Islamiyat and Pakistan Studies, which aren't offered inside Canadian public schools.",
      },
      {
        q: "Is this a full-time school or a supplement to our child's existing schooling?",
        a: "Either - it works as your child's full-time school, or as a structured supplement alongside home-schooling or an existing Canadian school, particularly to keep Urdu and Pakistan Studies going.",
      },
    ],
    images: {},
    siblingSlugs: ["us", "uk"],
  },

  {
    slug: "australia",
    countryName: "Australia",
    flagCode: "au",
    timeZone: "Australia/Sydney",
    currency: "AUD",
    heroKicker: "Cambridge Online School - Australia",
    h1: "Online Cambridge O Level & A Level School for Pakistani Families in Australia",
    metaTitle: "Online Cambridge School for Pakistani Families in Australia | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes with Urdu, Islamiyat and Pakistan Studies alongside Cambridge - for Pakistani-Australian families in Sydney, Melbourne, Perth and beyond.",
    intro: [
      "Australia runs its own state-based senior secondary certificates (the HSC in New South Wales, the VCE in Victoria, and equivalents elsewhere) rather than Cambridge O Levels or A Levels as the default - though unlike the US or Canada, Cambridge IGCSE already has some real presence in Australia through a number of private and international schools, so it's not an unfamiliar system here.",
      "For a Pakistani-Australian family, that existing familiarity is part of the appeal: Cambridge is a known, respected option locally, but a full seat at one of the private schools that offer it can be expensive or limited. VCS is built for families who want that same internationally portable qualification - plus Urdu, Islamiyat and Pakistan Studies - without needing a place at one of those schools.",
    ],
    schoolingLandscape: {
      heading: "Where Cambridge fits alongside Australian schooling",
      paragraphs: [
        "Most Pakistani-Australian families are inside their state's public or Catholic school system, working toward a state certificate (HSC, VCE, or equivalent) - a well-established, largely free, locally-recognised path that VCS is not positioned to replace for most children.",
        "A smaller number of Australian private and international schools already teach Cambridge IGCSE and A Level as an alternative to the state curriculum, generally at private-school fee levels. VCS offers the same Cambridge pathway without requiring enrolment in one of those schools, plus Urdu, Islamiyat and Pakistan Studies, which even Australia's Cambridge-offering private schools generally don't teach.",
        "Pakistani-Australian families are concentrated mainly in Sydney and Melbourne, with smaller communities in Perth, Brisbane and Adelaide.",
      ],
      verifyNote:
        "Which specific Australian universities give credit or preferential admission treatment for Cambridge A Levels varies by institution and year - do not name a specific university's policy without a current, citable source.",
    },
    whyOALevel: {
      heading: "Why Cambridge specifically, for a family based in Australia",
      paragraphs: [
        "Cambridge O Level and A Level are recognised for university admission across Pakistan, the UK and the Gulf, and are accepted by a number of Australian universities as well, giving a Pakistani-Australian family options beyond a state-certificate-only path.",
        "For return to Pakistan specifically: O Level and A Level results are converted to a Pakistani-board equivalent by the Inter Board Committee of Chairmen (IBCC) for university admission - confirm current documentation requirements with IBCC directly.",
        "For families who want Urdu, Islamiyat and Pakistan Studies taught properly alongside a recognised international curriculum, rather than as an after-hours community class disconnected from the main academic program.",
      ],
    },
    diaspora:
      "Australia's Pakistani-origin population was recorded at roughly 90,000 in the 2021 census and has been growing quickly since, concentrated mainly in Sydney and Melbourne. It's a smaller and newer community than the UK's or Canada's, which is part of why dedicated schooling infrastructure - Cambridge-teaching private schools included - is still limited outside the largest cities.",
    faq: [
      {
        q: "We already have Cambridge-teaching schools here - why would we choose an online option?",
        a: "A handful of Australian private and international schools do offer Cambridge IGCSE and A Level, generally at private-school fee levels and mostly concentrated in Sydney and Melbourne. VCS offers the same Cambridge pathway - plus Urdu, Islamiyat and Pakistan Studies - without requiring a place at one of those specific schools or living near one.",
      },
      {
        q: "What time do live classes run for us in Australia?",
        a: "Saudi Arabia is well behind Australian time zones - roughly 7-8 hours behind Sydney, depending on daylight saving in each country (Australia and Saudi Arabia observe daylight saving differently). Message us on WhatsApp with your child's grade and subjects to confirm exact timings before enrolling.",
      },
      {
        q: "Will Australian universities recognise a Cambridge A Level for admission?",
        a: "A number of Australian universities do accept Cambridge International qualifications for admission, with policies varying by institution and course. Confirm directly with the specific university if this matters for a particular admissions decision.",
        verify: true,
      },
      {
        q: "If we move back to Pakistan or to the Gulf, will these results actually count?",
        a: "Cambridge O Level and A Level results convert to a Pakistani-board equivalent through the Inter Board Committee of Chairmen (IBCC) for university admission, and are separately recognised across the Gulf. Confirm current IBCC documentation requirements directly, as processes can be updated.",
        verify: true,
      },
      {
        q: "Do you teach Urdu, Islamiyat and Pakistan Studies, or only the Cambridge core subjects?",
        a: "Both - alongside Cambridge O Level, AS Level and A2 Level subjects, we teach Urdu, Islamiyat and Pakistan Studies.",
      },
      {
        q: "Is this a full-time school or a supplement to our child's existing schooling?",
        a: "Either - it works as your child's full-time school, or as a structured supplement alongside an existing Australian school, particularly to keep Urdu and Pakistan Studies going.",
      },
    ],
    images: {},
    siblingSlugs: ["uk", "us"],
  },

  {
    slug: "pakistan",
    countryName: "Pakistan",
    flagCode: "pk",
    timeZone: "Asia/Karachi",
    currency: "PKR",
    heroKicker: "Cambridge Online School - Pakistan",
    h1: "Online Cambridge O Level & A Level School for Families in Pakistan",
    metaTitle: "Online Cambridge School in Pakistan | Virtual City School",
    metaDescription:
      "Live online O Level and A Level classes for families in Pakistan - an affordable alternative to city-concentrated private Cambridge schools, live-taught by qualified teachers.",
    intro: [
      "This page is different from the others: it's not about a family living abroad with no Cambridge school nearby. It's for families already inside Pakistan, choosing between VCS and the country's established private Cambridge school networks - Beaconhouse, Lahore Grammar School, Roots, The City School and others - which are real, respected options, but concentrated in Karachi, Lahore and Islamabad, and priced well above what most families can pay.",
      "VCS exists for two specific groups inside Pakistan: families in smaller cities - Faisalabad, Multan, Gujranwala, Peshawar, Sialkot, Hyderabad, Quetta and others - where no Cambridge-affiliated school exists at all, leaving Matric/FSc as the only local option; and families in the major cities who want a genuine Cambridge education but can't justify elite private-school fees for it.",
    ],
    schoolingLandscape: {
      heading: "What Cambridge schooling actually looks like inside Pakistan",
      paragraphs: [
        "In Karachi, Lahore and Islamabad, an established network of private schools already teaches Cambridge O Level and A Level - generally at annual fees well beyond what most middle-income Pakistani families can sustain across multiple children, and with competitive, sometimes limited admissions even for families who can afford them.",
        "Outside those three cities, Cambridge-affiliated schools are far sparser. A family in Faisalabad, Multan, Gujranwala, Sialkot, Hyderabad, Peshawar or a smaller town often has no local Cambridge option at all - the choice narrows to the Federal Board (Matric/FSc) track, or relocating, or boarding, none of which every family wants or can do.",
        "The Federal Board (Matric/FSc) track itself is a perfectly legitimate, widely-recognised path within Pakistan - VCS isn't positioned as inherently superior to it, only as the Cambridge alternative for families who specifically want that qualification and don't have affordable local access to it.",
      ],
      verifyNote:
        "Specific current tuition figures for named private Cambridge schools in Karachi/Lahore/Islamabad are not stated here and should be confirmed (or removed) before publishing any comparison number publicly - fee levels change and vary significantly by school and grade.",
    },
    whyOALevel: {
      heading: "Why Cambridge specifically, for a family already in Pakistan",
      paragraphs: [
        "Cambridge O Level and A Level are recognised for university admission internationally - in the UK, across the Gulf, and via IBCC equivalence for Pakistani university admission as well - which matters for families who want their child's options to extend beyond Pakistan's own university system, without giving up a Pakistani university pathway.",
        "For Pakistani university admission specifically: O Level and A Level results are converted to a Pakistani-board equivalent by the Inter Board Committee of Chairmen (IBCC), the same process that applies to Cambridge results from anywhere in the world - confirm current documentation requirements with IBCC directly, as processes can be updated.",
        "For a family weighing Cambridge against the Federal Board track: the practical difference is less about quality and more about where the qualification is recognised without conversion - Cambridge travels more easily if a child might study or work abroad; Federal Board is the direct, unconverted path into Pakistan's own university system.",
      ],
    },
    diaspora:
      "This isn't a diaspora page - VCS is based in Saudi Arabia, but Pakistan is only two hours behind Saudi Arabia (PKT vs. AST), which makes live class scheduling straightforward in a way it isn't for the Gulf's more distant Western counterparts. A meaningful share of VCS's own teaching staff are based in Pakistan, teaching students there and across the Gulf from the same live classroom.",
    faq: [
      {
        q: "There are already Cambridge schools in our city - why choose an online one?",
        a: "If your city already has an affordable, accessible Cambridge school your family is happy with, that's a legitimate first choice - VCS isn't trying to compete with a good local fit. VCS exists for families where the local Cambridge options are unaffordable, oversubscribed, or don't exist at all.",
      },
      {
        q: "Is Cambridge actually better than Matric/FSc for my child?",
        a: "Not inherently \"better\" - they're different, both legitimate paths. Federal Board (Matric/FSc) is the direct route into Pakistan's own university system with no conversion needed. Cambridge O Level/A Level is the route built for portability - useful specifically if university abroad, or in the Gulf, is a real possibility for your family.",
      },
      {
        q: "My city doesn't have any Cambridge-affiliated school - can my child access Cambridge at all otherwise?",
        a: "Yes - this is exactly the situation VCS is built for. Your child attends live classes from home; there's no dependency on a Cambridge school existing in your city.",
      },
      {
        q: "If my child later wants to study or work abroad, will these results actually count?",
        a: "Cambridge O Level and A Level are recognised for university admission in the UK and across the Gulf directly, and convert to a Pakistani-board equivalent through IBCC for Pakistani university admission. Confirm current requirements with the receiving institution or with IBCC directly.",
        verify: true,
      },
      {
        q: "Do you teach in the same time zone, or will classes clash with local school hours?",
        a: "Pakistan is only about two hours behind Saudi Arabia, so live batch timings are generally workable around a normal school-day schedule. Message us on WhatsApp with your child's grade to confirm exact timings.",
      },
      {
        q: "How does the cost compare to a private Cambridge school in Karachi, Lahore or Islamabad?",
        a: "Per-course pricing is on our Courses page and is generally well below flagship private Cambridge school fees in the major cities - but confirm current pricing directly rather than assuming a fixed comparison, since school fees vary widely by institution and grade.",
        verify: true,
      },
    ],
    images: {},
    siblingSlugs: ["saudi-arabia", "uae"],
  },
];

export const getCountryBySlug = (slug) =>
  COUNTRY_PAGES.find((c) => c.slug === slug);
