import tneaCutoffPdf from '../assets/resources/tnea-cutoff-counselling-2026.pdf';
import tnCollegesPdf from '../assets/resources/tamil-nadu-engineering-colleges.pdf';

export const initialOpportunities = [
  {
    id: "tn-7point5-quota",
    title_ta: "7.5% அரசுப் பள்ளி மாணவர்களுக்கான இலவச தொழிற்கல்வி ஒதுக்கீடு",
    title_en: "7.5% Preferential Quota for TN Govt School Students",
    provider_ta: "தமிழ்நாடு அரசு (உயர்கல்வி & மக்கள் நல்வாழ்வுத்துறை)",
    provider_en: "Government of Tamil Nadu (Higher Education & Health Dept)",
    type: "quota",
    category: "Government Scheme",
    award_amount_ta: "100% இலவசக் கல்வி + தங்கும் விடுதி + உணவுக் கட்டணம்",
    award_amount_en: "100% Free Tuition + Hostel + Mess Fees",
    deadline: "2026-07-15",
    is_verified: true,
    verification_date: "2026-05-10",
    eligibility_ta: "தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை தொடர்ந்து படித்த மாணவர்கள். பொறியியல், மருத்துவம், வேளாண்மை, கால்நடை, சட்டம் மற்றும் மீன்வளப் படிப்புகளில் ஒற்றைச் சாளர கலந்தாய்வு மூலம் சேருபவர்கள்.",
    eligibility_en: "Students who studied continuously from 6th to 12th standard in Tamil Nadu Government Schools. Applicable for single-window admissions in Engineering, Medical, Agri, Vet, Law, and Fisheries.",
    benefits_ta: [
      "கல்லூரி கல்விக் கட்டணம் (Tuition Fee) முழுவதும் தமிழ்நாடு அரசு செலுத்தும்.",
      "கல்லூரி விடுதிக் கட்டணம் மற்றும் உணவுக் கட்டணம் (Hostel & Mess) 100% இலவசம்.",
      "பல்கலைக்கழக தேர்வுக்கட்டணம் மற்றும் படிப்பு உபகரண கட்டணங்கள் முழுவதும் விலக்கு.",
      "தனியார் சுயநிதிக் கல்லூரிகளில் அரசு ஒதுக்கீட்டு இடம் கிடைத்தாலும் அரசே கட்டணத்தை ஏற்கும்."
    ],
    benefits_en: [
      "100% tuition fees covered by the Government of Tamil Nadu.",
      "Complete exemption from hostel room rent and mess food expenses.",
      "University examination and internal academic fees paid directly to the institution.",
      "Applies even if allotted a government-quota seat in a private self-financing college."
    ],
    documents_ta: [
      "6 முதல் 12-ஆம் வகுப்பு வரை அரசுப் பள்ளியில் படித்ததற்கான தலைமை ஆசிரியர் கையொப்பமிட்ட Bonafide Certificate",
      "பள்ளி கல்வித்துறை EMIS மாணவர் அடையாள எண்",
      "10 & 12-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்கள்",
      "சாதிச் சான்றிதழ் (Community Certificate) மற்றும் ஆதார் அட்டை"
    ],
    documents_en: [
      "Bonafide certificate confirming Classes 6 to 12 in Govt School (signed by Headmasters & certified by BEO/DEO)",
      "School Education Department EMIS Student ID",
      "Class 10 & 12 Marksheets",
      "Community Certificate and Student Aadhaar Card"
    ],
    official_link: "https://www.tneaonline.org",
    contact_info: "TNEA Helpline: 1800-425-0110 | helpdesk@tneaonline.org"
  },
  {
    id: "pudhumai-penn-scheme",
    title_ta: "புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார் திட்டம்)",
    title_en: "Pudhumai Penn Scheme (Moovalur Ramamirtham Ammaiyar)",
    provider_ta: "சமூக நலம் மற்றும் மகளிர் உரிமைத் துறை, தமிழ்நாடு",
    provider_en: "Social Welfare & Women Empowerment Dept, Tamil Nadu",
    type: "scholarship",
    category: "Government Scheme",
    award_amount_ta: "ரூ. 1,000 / மாதம் (படிப்பு முடியும் வரை)",
    award_amount_en: "₹1,000 / Month (Until Degree Completion)",
    deadline: "2026-08-30",
    is_verified: true,
    verification_date: "2026-06-01",
    eligibility_ta: "அரசுப் பள்ளிகளில் (6 முதல் 12-ஆம் வகுப்பு வரை) பயின்று, அங்கீகரிக்கப்பட்ட கல்லூரிகளில் இளநிலைப் பட்டம், டிப்ளமோ, அல்லது ஐடிஐ பயிலும் மாணவிகள்.",
    eligibility_en: "Girl students who studied Classes 6 to 12 in TN Govt schools and enrolled in any recognized undergraduate degree, diploma, or ITI program.",
    benefits_ta: [
      "மாணவியின் சொந்த வங்கிக் கணக்கில் நேரடியாக மாதம் ரூ. 1,000 வரவு வைக்கப்படுகிறது.",
      "கலை, அறிவியல், பொறியியல், பாலிடெக்னிக் உள்ளிட்ட அனைத்து முதன்மைப் படிப்புகளுக்கும் பொருந்தும்."
    ],
    benefits_en: [
      "Direct Bank Transfer of ₹1,000 every month directly to the student's personal bank account.",
      "Eligible across Arts, Science, Commerce, Engineering, Medical, and Polytechnic programs."
    ],
    documents_ta: [
      "பள்ளி Bonafide சான்றிதழ்",
      "மாணவியின் ஆதார் அட்டை",
      "மாணவி பெயரிலான வங்கி கணக்குப் புத்தகம் (Aadhaar linked Bank Account)",
      "கல்லூரி சேர்க்கை ரசீது மற்றும் அடையாள அட்டை"
    ],
    documents_en: [
      "Govt School Bonafide Certificate",
      "Student Aadhaar Card",
      "Bank Account Passbook in student's name (Aadhaar seeded)",
      "College Admission Fee Receipt / Student ID"
    ],
    official_link: "https://www.pudhumaipenn.tn.gov.in",
    contact_info: "Social Welfare Helpline: 181"
  },
  {
    id: "tamil-pudhalvan-scheme",
    title_ta: "தமிழ்ப் புதல்வன் திட்டம் (அரசுப் பள்ளி மாணவர் உயர்கல்வி உதவி)",
    title_en: "Tamil Pudhalvan Scheme (Govt School Boys Higher Ed Aid)",
    provider_ta: "சமூக நலம் மற்றும் மாற்றுத்திறனாளிகள் நலத்துறை, தமிழ்நாடு",
    provider_en: "Government of Tamil Nadu",
    type: "scholarship",
    category: "Government Scheme",
    award_amount_ta: "ரூ. 1,000 / மாதம் (படிப்பு முடியும் வரை)",
    award_amount_en: "₹1,000 / Month (Until Degree Completion)",
    deadline: "2026-08-30",
    is_verified: true,
    verification_date: "2026-06-01",
    eligibility_ta: "தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை படித்து உயர்கல்வி (பட்டப்படிப்பு, டிப்ளமோ) பயிலும் மாணவர்கள்.",
    eligibility_en: "Male students who studied from Class 6 to 12 in TN government schools pursuing higher education degree or diploma.",
    benefits_ta: [
      "மாதம் ரூ. 1,000 உதவித்தொகை மூலம் புத்தகங்கள், கற்றல் உபகரணங்கள் மற்றும் போக்குவரத்து தேவைகளை சுயமாக பூர்த்தி செய்யலாம்.",
      "ஏழை குடும்ப மாணவர்களின் கல்லூரி இடைநிற்றலைத் தடுக்கிறது."
    ],
    benefits_en: [
      "Monthly allowance of ₹1,000 deposited directly into bank accounts to cover learning materials and daily travel.",
      "Prevents student dropouts and ensures completion of degree/diploma qualifications."
    ],
    documents_ta: [
      "அரசுப் பள்ளி Bonafide சான்றிதழ்",
      "மாணவர் ஆதார் அட்டை",
      "மாணவர் பெயரிலான சேமிப்புக் கணக்கு விவரம்",
      "கல்லூரி சேர்க்கை சான்று"
    ],
    documents_en: [
      "School Bonafide Certificate",
      "Student Aadhaar Card",
      "Active Bank Account details in student's name",
      "College Admission Bonafide / ID"
    ],
    official_link: "https://tamilpudhalvan.tn.gov.in",
    contact_info: "State Nodal Cell Helpline: 044-2567-0000"
  },
  {
    id: "first-graduate-waiver",
    title_ta: "முதல் பட்டதாரி கட்டணச் சலுகை (First Graduate Concession)",
    title_en: "First Graduate Tuition Fee Waiver",
    provider_ta: "தொழில்நுட்பக் கல்வி இயக்ககம் (DoTE), தமிழ்நாடு",
    provider_en: "Directorate of Technical Education (DoTE), Tamil Nadu",
    type: "scholarship",
    category: "State Concession",
    award_amount_ta: "ரூ. 25,000 - 27,500 / ஆண்டு கட்டண விலக்கு",
    award_amount_en: "₹25,000 - ₹27,500 / Year Tuition Waiver",
    deadline: "2026-07-20",
    is_verified: true,
    verification_date: "2026-05-15",
    eligibility_ta: "குடும்பத்தில் எவரும் இதற்கு முன் பட்டப்படிப்பு முடித்திருக்கக் கூடாது. பெற்றோர், உடன்பிறப்புகள் யாரும் பட்டதாரிகள் இல்லை என சான்றளிக்கப்பட வேண்டும். TNEA ஒற்றைச் சாளர கலந்தாய்வு மூலம் சேர்க்கை பெறுபவர்கள்.",
    eligibility_en: "No member of the applicant's immediate family (parents, elder siblings) should be a degree graduate. Admitted through single-window TNEA counseling.",
    benefits_ta: [
      "அரசு அல்லது தனியார் பொறியியல் கல்லூரிகளில் ஆண்டிற்கு ரூ. 25,000 முதல் ரூ. 27,500 வரை டியூஷன் கட்டணம் தள்ளுபடி.",
      "நான்கு ஆண்டுகள் படிப்பு காலத்திற்கும் தொடர்ச்சியாக இச்சலுகை வழங்கப்படும்."
    ],
    benefits_en: [
      "Direct tuition fee reduction of ₹25,000 to ₹27,500 per academic year in counseling allotted seats.",
      "Valid across all 4 years of undergraduate engineering studies."
    ],
    documents_ta: [
      "வருவாய்த் துறையிடம் இ-சேவை மையம் மூலம் பெறப்பட்ட 'முதல் பட்டதாரி சான்றிதழ்' (First Graduate Certificate)",
      "குடும்பக் கூட்டு உறுதிமொழிப் பத்திரம் (Joint Declaration by parents and student)",
      "குடும்ப அட்டை (Ration Card)"
    ],
    documents_en: [
      "First Graduate Certificate issued by the Revenue Department via e-Sevai portal",
      "Joint Declaration signed by student and parents",
      "Family Smart Ration Card"
    ],
    official_link: "https://www.tneaonline.org",
    contact_info: "DoTE Chennai Helpline: 044-2235-1014"
  },
  {
    id: "post-matric-sc-st",
    title_ta: "ஆதிதிராவிடர் & பழங்குடியினர் போஸ்ட்-மெட்ரிக் கல்வி உதவித்தொகை",
    title_en: "Post-Matric Scholarship for SC / ST / Converted Christian",
    provider_ta: "ஆதிதிராவிடர் மற்றும் பழங்குடியினர் நலத்துறை, தமிழ்நாடு",
    provider_en: "Adi Dravidar and Tribal Welfare Dept, Tamil Nadu",
    type: "scholarship",
    category: "Government Scheme",
    award_amount_ta: "100% முழுக் கல்விக் கட்டண விலக்கு + பராமரிப்புப் படி",
    award_amount_en: "100% Tuition Fee Reimbursement + Maintenance Allowance",
    deadline: "2026-10-31",
    is_verified: true,
    verification_date: "2026-06-15",
    eligibility_ta: "SC, SCA, ST மற்றும் கிறிஸ்தவ மதத்திற்கு மாறிய ஆதிதிராவிடர் மாணவர்கள். குடும்ப ஆண்டு வருமானம் ரூ. 2,50,000-க்குள் இருக்க வேண்டும். கவுன்சிலிங் மூலம் சேர்க்கை பெற்றிருக்க வேண்டும்.",
    eligibility_en: "SC, SCA, ST, and converted Christian students with annual family income up to ₹2.5 Lakhs. Enrolled through government single-window counseling.",
    benefits_ta: [
      "கல்லூரிக்கு செலுத்த வேண்டிய கட்டாய கல்விக் கட்டணம் முழுவதையும் அரசே செலுத்துகிறது.",
      "விடுதியில் தங்கிப் படிக்கும் மாணவர்களுக்கு மாதாந்திர பராமரிப்பு உதவித்தொகை வழங்கப்படுகிறது."
    ],
    benefits_en: [
      "All compulsory non-refundable tuition and special fees reimbursed directly to colleges.",
      "Monthly hostel maintenance allowance credited to student's bank account."
    ],
    documents_ta: [
      "சாதிச் சான்றிதழ் (Community Certificate)",
      "நடப்பு ஆண்டு வருமானச் சான்றிதழ் (Income Certificate)",
      "10 & 12 மதிப்பெண் சான்றிதழ்கள்",
      "வங்கி கணக்கு புத்தகம் மற்றும் ஆதார்"
    ],
    documents_en: [
      "Permanent Community Certificate",
      "Current Financial Year Income Certificate",
      "Mark sheets of Class 10 and 12",
      "Bank Account details with Aadhaar seeding"
    ],
    official_link: "https://escholarship.tn.gov.in",
    contact_info: "ADW Toll-Free Helpline: 1800-425-7033"
  },
  {
    id: "agaram-vidhai",
    title_ta: "அகரம் அறக்கட்டளை - விதை திட்டம் (கல்வி உதவி)",
    title_en: "Agaram Foundation - Vidhai Educational Assistance",
    provider_ta: "அகரம் அறக்கட்டளை (Agaram Foundation)",
    provider_en: "Agaram Foundation, Chennai",
    type: "foundation",
    category: "Private Foundation",
    award_amount_ta: "முழு கல்லூரி கட்டணம் + தங்குமிடம் + வாழ்க்கை திறன் வழிகாட்டல்",
    award_amount_en: "Complete College Fees + Boarding + Mentorship",
    deadline: "2026-06-25",
    is_verified: true,
    verification_date: "2026-05-20",
    eligibility_ta: "கிராமப்புற அரசு மற்றும் அரசு உதவிபெறும் பள்ளிகளில் பயின்று 12-ஆம் வகுப்பில் சிறந்த மதிப்பெண் பெற்ற ஏழை எளிய குடும்ப மாணவர்கள் (பெற்றோரை இழந்தவர்கள், குடும்ப வறுமை உள்ளோருக்கு முன்னுரிமை).",
    eligibility_en: "Economically underprivileged students from rural government/aided schools with strong Class 12 academic merit. Priority for single-parent or orphan backgrounds.",
    benefits_ta: [
      "பட்டப்படிப்புக்கான முழு கல்லூரி கட்டணம், புத்தக செலவுகள் மற்றும் தங்குமிட வசதி.",
      "தனிநபர் வழிகாட்டுதல் (Mentorship) மற்றும் ஆங்கிலத் தொடர்பு திறன் பயிற்சிகள்."
    ],
    benefits_en: [
      "Full academic tuition, books, and hostel accommodation coverage.",
      "Holistic life skills, communication training, and one-on-one professional mentorship."
    ],
    documents_ta: [
      "12-ஆம் வகுப்பு தற்காலிக மதிப்பெண் பட்டியல்",
      "குடும்ப நிலை மற்றும் வருமான விபர ஆவணங்கள்",
      "பள்ளித் தலைமை ஆசிரியரின் பரிந்துரைக் கடிதம்"
    ],
    documents_en: [
      "Class 12 Provisional Mark Sheet",
      "Income certificate or family situation documentary proof",
      "School Headmaster Recommendation Letter"
    ],
    official_link: "https://agaramfoundation.org",
    contact_info: "Agaram Helpline: 044-2432-8411 | info@agaramfoundation.org"
  },
  {
    id: "shanti-ashram-aid",
    title_ta: "சாந்தி ஆசிரமம் - கிராமப்புற மாணவர் கல்வி உதவி",
    title_en: "Shanti Ashram - Rural Student Higher Education Aid",
    provider_ta: "சாந்தி ஆசிரமம் (Shanti Ashram Coimbatore)",
    provider_en: "Shanti Ashram, Coimbatore",
    type: "ngo",
    category: "NGO Support",
    award_amount_ta: "ரூ. 15,000 - 30,000 / ஆண்டு கல்வி உதவி",
    award_amount_en: "₹15,000 - ₹30,000 / Year Study Support",
    deadline: "2026-07-10",
    is_verified: true,
    verification_date: "2026-05-18",
    eligibility_ta: "கோவை, திருப்பூர், ஈரோடு, திண்டுக்கல் உள்ளிட்ட மேற்கு மற்றும் மத்திய மாவட்ட கிராமப்புற மாணவர்கள். குடும்பத்தில் முதல் தலைமுறை மாணவர்கள்.",
    eligibility_en: "Rural students from western & central TN districts (Coimbatore, Tiruppur, Erode, Dindigul). Preference for first-generation degree seekers.",
    benefits_ta: [
      "ஆண்டுதோறும் கல்லூரி கட்டணத்திற்கான நேரடி நிதியுதவி.",
      "நூலக வசதி மற்றும் சமூக நல வழிகாட்டல் திட்டங்கள்."
    ],
    benefits_en: [
      "Annual educational stipend toward college admission and semester fees.",
      "Access to learning resources, community leadership, and guidance workshops."
    ],
    documents_ta: [
      "12-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்",
      "குடும்ப ரேஷன் கார்டு நகல்",
      "கல்லூரி சேர்க்கை உறுதிப்படுத்தல் கடிதம்"
    ],
    documents_en: [
      "Class 12 Marksheet",
      "Ration Card copy",
      "College Admission confirmation voucher"
    ],
    official_link: "https://shantiashram.org",
    contact_info: "Phone: 0422-260-7771"
  }
];

export const initialSessions = [];

export const learningResources = [
  {
    id: "res-1",
    title_ta: "12-ஆம் வகுப்பு பொதுத்தேர்வு கட்-ஆஃப் & கவுன்சிலிங் கையேடு 2026",
    title_en: "Class 12 Board Exam Cutoff & Single-Window Counseling Handbook 2026",
    type_ta: "வழிகாட்டி கையேடு (PDF)",
    type_en: "Handbook (PDF)",
    category: "counseling",
    link: tneaCutoffPdf,
    fileName: "tnea-cutoff-counselling-2026.pdf",
    tag_ta: "இலவச பதிவிறக்கம்",
    tag_en: "Free Download"
  },
  {
    id: "res-2",
    title_ta: "தமிழ்நாடு 38 மாவட்ட அரசு & அரசு உதவிபெறும் பொறியியல் கல்லூரிகள் பட்டியல்",
    title_en: "Directory of Govt & Govt-Aided Engineering Colleges across 38 TN Districts",
    type_ta: "அதிகாரப்பூர்வ பட்டியல்",
    type_en: "Official Directory",
    category: "directory",
    link: tnCollegesPdf,
    fileName: "tamil-nadu-engineering-colleges.pdf",
    tag_ta: "TNEA அங்கீகரிக்கப்பட்டது",
    tag_en: "TNEA Approved"
  },
  {
    id: "res-3",
    title_ta: "நான் முதல்வன் (Naan Mudhalvan) இலவச கணினி & தொழில்நுட்ப சான்றிதழ் திட்டங்கள்",
    title_en: "Naan Mudhalvan Free Tech & Digital Skill Certification Tracks",
    type_ta: "அரசு திறன் தளம்",
    type_en: "Govt Skill Portal",
    category: "skills",
    link: "https://naanmudhalvan.tn.gov.in",
    tag_ta: "அரசு தளம்",
    tag_en: "Govt Portal"
  },
  {
    id: "res-4",
    title_ta: "முதல் பட்டதாரி & 7.5% Bonafide சான்றிதழ் விண்ணப்ப படிவங்கள்",
    title_en: "First Graduate & 7.5% Quota Bonafide Model Application Forms",
    type_ta: "விண்ணப்ப படிவம்",
    type_en: "Application Format",
    category: "forms",
    link: "#",
    tag_ta: "மாதிரி படிவம்",
    tag_en: "Sample Format"
  }
];
