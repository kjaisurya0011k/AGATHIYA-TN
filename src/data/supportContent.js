import { brand } from './brand';
/**
 * Bilingual Support & FAQ Content for AGATHIYA
 * Comprehensive content conforming to enterprise ed-tech standards.
 */

export const supportContent = {
  en: {
    hero: {
      eyebrow: `${brand.name} SUPPORT DESK`,
      heading: "Contact & Support",
      description: "Have a question about workshops, payments, scholarships, or your account? We're here to help you move forward.",
      secondaryText: "Choose your preferred way to reach our team, or send us a message below."
    },
    cards: {
      call: {
        title: "Call Support",
        description: "Speak directly with our team for help with accounts, sessions, payments, and educational opportunities.",
        badge: "Voice Helpline"
      },
      whatsapp: {
        title: "WhatsApp Support",
        description: "Get quick assistance with courses, workshop registrations, session joining, and general questions.",
        badge: "Instant Chat",
        btnLabel: "Chat on WhatsApp"
      },
      email: {
        title: "Email Support",
        description: "Send detailed enquiries, verification requests, technical issues, or school workshop partnership proposals.",
        badge: "Official Inbox",
        copyBtn: "Copy Email",
        copied: "Copied!"
      },
      hoursLabel: "Operating Hours",
      copyBtn: "Copy",
      copied: "Copied!"
    },
    form: {
      heading: "Send Us a Message",
      description: "Tell us what you need help with. Our team will review your enquiry and respond using your preferred contact details.",
      fields: {
        fullName: "Full Name",
        fullNamePlaceholder: "Enter your full name",
        email: "Email Address",
        emailPlaceholder: "name@example.com",
        phone: "Phone Number (Optional)",
        phonePlaceholder: "e.g. +91 98765 43210",
        enquiryType: "Enquiry Type",
        enquiryTypePlaceholder: "Select the category that best fits",
        subject: "Subject",
        subjectPlaceholder: "Brief summary of your question or issue",
        message: "Message",
        messagePlaceholder: "Please describe your question or issue in detail. If related to a workshop or payment, include relevant references...",
        consent: `I acknowledge the Privacy Policy and consent to ${brand.name} contacting me regarding this enquiry.`,
        submit: "Send Message",
        submitting: "Sending Message..."
      },
      types: [
        { value: "General Enquiry", label: "General Enquiry" },
        { value: "Workshop Registration", label: "Workshop Registration" },
        { value: "School Collaboration", label: "School Collaboration" },
        { value: "Scholarship or Opportunity", label: "Scholarship or Opportunity" },
        { value: "Session or Course Support", label: "Session or Course Support" },
        { value: "Payment or Refund", label: "Payment or Refund" },
        { value: "Account or Login Issue", label: "Account or Login Issue" },
        { value: "Technical Issue", label: "Technical Issue" },
        { value: "Mentor Enquiry", label: "Mentor Enquiry" },
        { value: "Other", label: "Other" }
      ],
      errors: {
        nameRequired: "Please enter your full name.",
        emailRequired: "Please enter your email address.",
        emailInvalid: "Please enter a valid email address.",
        phoneInvalid: "Please enter a valid phone number (at least 10 digits).",
        typeRequired: "Please select an enquiry type.",
        subjectRequired: "Please enter a subject.",
        messageRequired: "Please enter your message (at least 15 characters).",
        consentRequired: "You must acknowledge the Privacy Policy to submit."
      },
      success: {
        title: "Enquiry Submitted Successfully!",
        ticketIdLabel: "Reference Ticket ID",
        message: `Thank you for contacting ${brand.name}. Our team has received your enquiry and will respond to your email as soon as possible.`,
        detailsHeader: "Enquiry Summary",
        anotherBtn: "Submit Another Enquiry"
      },
      errorBanner: "We encountered an issue submitting your request. Please try again or reach out directly via WhatsApp or email."
    },
    panel: {
      hoursTitle: "Support Hours",
      hoursText: "Monday–Saturday, 9:00 AM–7:00 PM IST",
      emailTitle: "Email Response",
      emailText: "Replies typically within 24 business hours",
      schoolTitle: "School Partnerships",
      schoolText: "Planning an AI workshop, hackathon, or educational awareness session at your school? Select School Collaboration in the form.",
      safetyTitle: "Before Contacting Support",
      safetyText: "Include your session details or registration reference when relevant. Never share passwords, OTPs, or payment card details."
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Find quick answers to common questions before contacting our team.",
      items: [
        {
          id: "faq-1",
          question: "How do I register for a session?",
          answer: "You can browse upcoming live webinars and mentoring sessions in the 'Sessions' tab. Click 'View Details' on any session that interests you to review the agenda, speaker qualifications, and requirements. If you are eligible, click 'Register' (or 'Reserve Spot'). For paid workshops, you will be guided through a secure checkout process; free sessions will confirm your enrollment immediately and appear in your student dashboard."
        },
        {
          id: "faq-2",
          question: "What should I do if my payment succeeds but I cannot join a session?",
          answer: "First, check your 'Sessions' or 'Student Dashboard' page to verify if your registration status displays 'Confirmed'. Ensure you have saved your payment transaction ID or receipt. If your session link is still inactive or missing, submit a message via the contact form below with Enquiry Type set to 'Payment or Refund' or 'Session or Course Support', and include your transaction reference. Our support team will verify your payment status and grant immediate access."
        },
        {
          id: "faq-3",
          question: "How can I find scholarships and educational opportunities?",
          answer: "Visit our 'Opportunities' section to explore verified government waivers, private grants, first-generation graduate benefits, Pudhumai Penn, Tamil Pudhalvan, and 7.5% government school quota provisions. You can filter by category, study stream, or eligibility criteria. Each opportunity card details the benefits, required documents, deadlines, and official state application links."
        },
        {
          id: "faq-4",
          question: "How do I check whether I am eligible for an opportunity?",
          answer: `Click on any opportunity to view its detailed eligibility criteria, which may include high school marks, community category, annual family income thresholds, or government school attendance history (e.g., Classes 6–12 for the 7.5% quota). While ${brand.name} compiles and verifies these guidelines against official government orders, we always encourage students to confirm critical rules via the published official government portal links provided.`
        },
        {
          id: "faq-5",
          question: "I cannot log in to my account. What should I do?",
          answer: `Ensure you are using the exact email address registered with ${brand.name}. If you forgot your password, click 'Forgot Password?' on the login screen to receive a secure password reset link via email. If you still encounter issues or suspect an account lock, select 'Account or Login Issue' in our contact form below with your registered email, and we will assist you in restoring account access.`
        },
        {
          id: "faq-6",
          question: "How can my school organize a workshop or hackathon?",
          answer: `School principals, headmasters, and coordinators can collaborate with ${brand.name} by selecting 'School Collaboration' in the contact form below. Please mention your school name, district, preferred dates, estimated student participants, and topics of interest (such as AI fundamentals, coding bootcamps, or engineering counseling). Our academic outreach team will contact you within 24 hours to schedule the session.`
        },
        {
          id: "faq-7",
          question: "How do I request a refund or report a payment issue?",
          answer: "If a paid session was cancelled or you experienced a duplicate charge during registration, submit a request using 'Payment or Refund' in the contact form. Please include your session title, date of transaction, registered email, and transaction reference/UTR number. Refunds for verified duplicate charges or cancelled events are processed in accordance with our Refund Policy to your original payment method."
        },
        {
          id: "faq-8",
          question: "How can I contact a mentor or report a technical issue?",
          answer: "To connect with a mentor, register for their scheduled sessions or request 1-on-1 guidance where available in your dashboard. To report a technical bug, broken link, or website issue, select 'Technical Issue' in the form below. Please describe the problem, the page URL where it occurred, and your browser/device so our development team can resolve it promptly."
        }
      ],
      stillHelp: "Still need help?",
      contactLink: "Contact our support team"
    }
  },
  ta: {
    hero: {
      eyebrow: `${brand.name} உதவி மையம்`,
      heading: "தொடர்பு & உதவி மையம்",
      description: "பட்டறைகள், கட்டணங்கள், கல்வி உதவித்தொகை அல்லது உங்கள் கணக்கு குறித்த கேள்விகள் உள்ளதா? உங்களுக்கு உதவ நாங்கள் தயாராக இருக்கிறோம்.",
      secondaryText: "எங்கள் குழுவைத் தொடர்பு கொள்ள உங்களுக்கு வசதியான வழியைத் தேர்ந்தெடுக்கவும், அல்லது கீழே செய்தி அனுப்பவும்."
    },
    cards: {
      call: {
        title: "தொலைபேசி உதவி",
        description: "கணக்குகள், வழிகாட்டல் அமர்வுகள், கட்டணங்கள் மற்றும் கல்வி வாய்ப்புகள் தொடர்பான நேரடி ஆலோசனைக்கு அழைக்கவும்.",
        badge: "குரல் உதவி"
      },
      whatsapp: {
        title: "வாட்ஸ்அப் உதவி",
        description: "பாடநெறிகள், பட்டறைப் பதிவுகள், அமர்வுகளில் இணைதல் மற்றும் பொதுவான சந்தேகங்களுக்கு உடனுக்குடன் பதில் பெறலாம்.",
        badge: "உடனடி சாட்",
        btnLabel: "வாட்ஸ்அப்பில் உரையாடுங்கள்"
      },
      email: {
        title: "மின்னஞ்சல் உதவி",
        description: "விரிவான வினவல்கள், ஆவண சரிபார்ப்பு, தொழில்நுட்பச் சிக்கல்கள் அல்லது பள்ளிப் பட்டறை கூட்டாண்மைக்கான யோசனைகளை அனுப்பவும்.",
        badge: "அதிகாரப்பூர்வ அஞ்சல்",
        copyBtn: "மின்னஞ்சலை நகலெடு",
        copied: "நகலெடுக்கப்பட்டது!"
      },
      hoursLabel: "பணி நேரம்",
      copyBtn: "நகலெடு",
      copied: "நகலெடுக்கப்பட்டது!"
    },
    form: {
      heading: "எங்களுக்கு செய்தி அனுப்பவும்",
      description: "உங்களுக்கு என்ன உதவி தேவை என்பதைத் தெரிவிக்கவும். எங்கள் குழு உங்கள் வினவலை ஆய்வு செய்து விரைவில் பதிலளிக்கும்.",
      fields: {
        fullName: "முழுப் பெயர்",
        fullNamePlaceholder: "உங்கள் முழுப் பெயரை உள்ளிடவும்",
        email: "மின்னஞ்சல் முகவரி",
        emailPlaceholder: "name@example.com",
        phone: "தொலைபேசி எண் (விருப்பத்தேர்வு)",
        phonePlaceholder: "எ.கா: +91 98765 43210",
        enquiryType: "வினவல் பிரிவு",
        enquiryTypePlaceholder: "பொருத்தமான பிரிவைத் தேர்ந்தெடுக்கவும்",
        subject: "தலைப்பு",
        subjectPlaceholder: "உங்கள் கேள்வி அல்லது விபரத்தின் சுருக்கம்",
        message: "செய்தி / விபரம்",
        messagePlaceholder: "தயவுசெய்து உங்கள் கேள்வியை விளக்கமாக எழுதவும். கட்டணம் அல்லது பயிற்சி தொடர்பான விபரங்கள் இருப்பின் குறிப்பு எண்ணைக் குறிப்பிடவும்...",
        consent: `தனியுரிமைக் கொள்கையை ஏற்றுக்கொள்கிறேன் மற்றும் என் வினவல் தொடர்பாக ${brand.name} என்னைத் தொடர்புகொள்ள ஒப்புக்கொள்கிறேன்.`,
        submit: "செய்தி அனுப்புக",
        submitting: "செய்தி அனுப்பப்படுகிறது..."
      },
      types: [
        { value: "General Enquiry", label: "பொதுவான வினவல் (General Enquiry)" },
        { value: "Workshop Registration", label: "பட்டறைப் பதிவு (Workshop Registration)" },
        { value: "School Collaboration", label: "பள்ளி கூட்டாண்மை (School Collaboration)" },
        { value: "Scholarship or Opportunity", label: "உதவித்தொகை & வாய்ப்புகள் (Scholarship)" },
        { value: "Session or Course Support", label: "அமர்வு & பாடநெறி உதவி (Session Support)" },
        { value: "Payment or Refund", label: "கட்டணம் அல்லது ரீஃபண்ட் (Payment/Refund)" },
        { value: "Account or Login Issue", label: "கணக்கு / உள்நுழைவு சிக்கல் (Account Issue)" },
        { value: "Technical Issue", label: "தொழில்நுட்பக் கோளாறு (Technical Issue)" },
        { value: "Mentor Enquiry", label: "வழிகாட்டி வினவல் (Mentor Enquiry)" },
        { value: "Other", label: "பிற வினவல்கள் (Other)" }
      ],
      errors: {
        nameRequired: "தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.",
        emailRequired: "தயவுசெய்து உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
        emailInvalid: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
        phoneInvalid: "சரியான தொலைபேசி எண்ணை உள்ளிடவும் (குறைந்தது 10 இலக்கங்கள்).",
        typeRequired: "தயவுசெய்து ஒரு வினவல் பிரிவைத் தேர்ந்தெடுக்கவும்.",
        subjectRequired: "தயவுசெய்து ஒரு தலைப்பை உள்ளிடவும்.",
        messageRequired: "குறைந்தது 15 எழுத்துகளில் உங்கள் செய்தியை உள்ளிடவும்.",
        consentRequired: "படிவத்தை அனுப்ப தனியுரிமைக் கொள்கையை ஒப்புக்கொள்ள வேண்டும்."
      },
      success: {
        title: "உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது!",
        ticketIdLabel: "பதிவு குறிப்பு எண்",
        message: `${brand.name} உதவி மையத்தைத் தொடர்பு கொண்டமைக்கு நன்றி. உங்கள் வினவல் பெறப்பட்டது; எங்கள் குழு விரைவாக உங்கள் மின்னஞ்சலுக்கு பதிலளிக்கும்.`,
        detailsHeader: "வினவல் சுருக்கம்",
        anotherBtn: "மற்றொரு செய்தி அனுப்புக"
      },
      errorBanner: "செய்தி அனுப்புவதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும் அல்லது வாட்ஸ்அப் / மின்னஞ்சல் மூலம் நேரடியாகத் தொடர்பு கொள்ளவும்."
    },
    panel: {
      hoursTitle: "உதவி மைய நேரம்",
      hoursText: "திங்கள்–சனி, காலை 9:00 – மாலை 7:00 IST",
      emailTitle: "மின்னஞ்சல் பதில் நேரம்",
      emailText: "வழக்கமாக 24 வணிக மணிநேரத்திற்குள் பதிலளிக்கப்படும்",
      schoolTitle: "பள்ளி கூட்டாண்மை",
      schoolText: "உங்கள் பள்ளியில் AI பட்டறை, ஹேக்கத்தான் அல்லது கல்வி வழிகாட்டல் அமர்வை நடத்த விரும்புகிறீர்களா? படிவத்தில் 'School Collaboration' என்பதைத் தேர்ந்தெடுக்கவும்.",
      safetyTitle: "தொடர்பு கொள்வதற்கு முன்",
      safetyText: "பொருத்தமான இடங்களில் அமர்வு விபரங்கள் அல்லது பதிவு எண்ணைக் குறிப்பிடவும். கடவுச்சொற்கள், OTP அல்லது வங்கி அட்டை விபரங்களை யாரிடமும் பகிர வேண்டாம்."
    },
    faq: {
      title: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      subtitle: "எங்கள் குழுவைத் தொடர்புகொள்வதற்கு முன் பொதுவான கேள்விகளுக்கான உடனடி பதில்களைப் பெறுங்கள்.",
      items: [
        {
          id: "faq-1",
          question: "ஒரு வழிகாட்டல் அமர்வுக்கு (Session) எவ்வாறு பதிவு செய்வது?",
          answer: "'Sessions' பிரிவில் வரவிருக்கும் நேரடி வெபினார்கள் மற்றும் வழிகாட்டல் அமர்வுகளைப் பார்க்கலாம். நீங்கள் விரும்பும் அமர்வின் 'View Details' என்பதைக் கிளிக் செய்து அதன் விபரங்களை அறியலாம். தகுதியான மாணவர்கள் 'Register' பொத்தானை அழுத்தி பதிவு செய்துகொள்ளலாம். கட்டணப் பயிற்சிகளுக்குப் பாதுகாப்பான கட்டண முறை மூலமும், இலவச அமர்வுகளுக்கு உடனடியாகவும் உங்கள் முன்பதிவு உறுதிசெய்யப்படும்."
        },
        {
          id: "faq-2",
          question: "கட்டணம் செலுத்தப்பட்டு ஆனால் அமர்வில் இணைய முடியவில்லை என்றால் என்ன செய்வது?",
          answer: "முதலில் உங்கள் 'Sessions' அல்லது மாணவர் டாஷ்போர்டில் பதிவு நிலை 'Confirmed' என உள்ளதா என்பதைச் சரிபார்க்கவும். உங்கள் கட்டணப் பரிவர்த்தனை எண் (Transaction ID) அல்லது ரசீதை எடுத்துக்கொள்ளுங்கள். இணைப்பு செயல்படவில்லை எனில், கீழே உள்ள படிவத்தில் 'Payment or Refund' அல்லது 'Session or Course Support' என்பதைத் தேர்வு செய்து உங்கள் பரிவர்த்தனை விபரங்களுடன் செய்தி அனுப்பவும். எங்கள் குழு உடனடியாக சரிபார்த்து உதவும்."
        },
        {
          id: "faq-3",
          question: "உதவித்தொகைகள் மற்றும் கல்வி வாய்ப்புகளை எவ்வாறு கண்டறிவது?",
          answer: "'Opportunities' பிரிவிற்குச் சென்று அரசு உதவித்தொகைகள், தனியார் கல்வி உதவித் திட்டங்கள், முதல் பட்டதாரி சலுகைகள், புதுமைப் பெண், தமிழ்ப் புதல்வன் மற்றும் 7.5% அரசு பள்ளி இடஒதுக்கீடு விபரங்களை அறியலாம். பிரிவு மற்றும் தகுதி வாரியாக வடிகட்டிப் பார்க்கலாம். ஒவ்வொரு வாய்ப்பிலும் தகுதிகள், தேவையான ஆவணங்கள் மற்றும் அதிகாரப்பூர்வ விண்ணப்ப இணைப்புகள் வழங்கப்பட்டுள்ளன."
        },
        {
          id: "faq-4",
          question: "ஒரு கல்வி உதவித்தொகை அல்லது வாய்ப்பிற்கு நான் தகுதியானவரா என்பதை எவ்வாறு சரிபார்ப்பது?",
          answer: `வாய்ப்பின் மீது கிளிக் செய்து அதன் தகுதி வரம்புகளைப் பார்க்கவும். இதில் 12-ஆம் வகுப்பு மதிப்பெண்கள், சமூகப் பிரிவு, குடும்ப ஆண்டு வருமானம் அல்லது அரசுப் பள்ளி படிப்பு வரலாறு (எ.கா: 7.5% ஒதுக்கீட்டிற்கு 6 முதல் 12-ஆம் வகுப்பு வரை) ஆகியவை அடங்கும். ${brand.name} அரசு ஆணைகளின்படி தகவல்களைத் தொகுத்திருந்தாலும், கொடுக்கப்பட்டுள்ள அதிகாரப்பூர்வ அரசு தளம் மூலமும் உறுதிசெய்து கொள்ளுமாறு அறிவுறுத்தப்படுகிறீர்கள்.`
        },
        {
          id: "faq-5",
          question: "எனது கணக்கில் உள்நுழைய முடியவில்லை. நான் என்ன செய்ய வேண்டும்?",
          answer: `${brand.name} தளத்தில் நீங்கள் பதிவு செய்த சரியான மின்னஞ்சல் முகவரியைப் பயன்படுத்துகிறீர்களா என்பதை உறுதிப்படுத்தவும். கடவுச்சொல் மறந்துவிட்டால், உள்நுழைவு பக்கத்தில் உள்ள 'Forgot Password?' என்பதை அழுத்தி மீட்டமைப்பு இணைப்பைப் பெறலாம். சிக்கல் தொடர்ந்தால் கீழே உள்ள படிவத்தில் 'Account or Login Issue' என்பதைத் தேர்ந்தெடுத்து உங்கள் மின்னஞ்சலை அனுப்பவும்.`
        },
        {
          id: "faq-6",
          question: "எங்கள் பள்ளியில் ஒரு பட்டறை (Workshop) அல்லது ஹேக்கத்தானை எவ்வாறு ஒருங்கிணைப்பது?",
          answer: `பள்ளித் தலைமை ஆசிரியர்கள் மற்றும் ஒருங்கிணைப்பாளர்கள் கீழே உள்ள படிவத்தில் 'School Collaboration' என்பதைத் தேர்ந்தெடுத்து ${brand.name} உடன் இணையலாம். பள்ளியின் பெயர், மாவட்டம், விரும்பும் தேதிகள், மாணவர்களின் எண்ணிக்கை மற்றும் விருப்பத் தலைப்புகளை (AI, நிரலாக்கம் அல்லது உயர்கல்வி வழிகாட்டல்) குறிப்பிடவும். எங்கள் கல்விக் குழு 24 மணி நேரத்திற்குள் உங்களைத் தொடர்பு கொள்ளும்.`
        },
        {
          id: "faq-7",
          question: "கட்டணப் பிரச்சினை அல்லது ரீஃபண்ட் (Refund) கோருவது எப்படி?",
          answer: "கட்டணப் பயிற்சி ரத்து செய்யப்பட்டாலோ அல்லது இரட்டைப் பரிவர்த்தனை (Duplicate charge) ஏற்பட்டாலோ, படிவத்தில் 'Payment or Refund' என்பதைத் தேர்ந்தெடுத்து கோரிக்கை அனுப்பவும். அமர்வின் பெயர், பரிவர்த்தனை தேதி, பதிவு செய்யப்பட்ட மின்னஞ்சல் மற்றும் UTR எண்ணைக் குறிப்பிடவும். சரிபார்க்கப்பட்ட கட்டணங்கள் அசல் பரிவர்த்தனை முறைக்கே திரும்ப வழங்கப்படும்."
        },
        {
          id: "faq-8",
          question: "ஒரு வழிகாட்டியைத் தொடர்புகொள்வது அல்லது தொழில்நுட்பக் கோளாறைத் தெரிவிப்பது எப்படி?",
          answer: "வழிகாட்டிகளுடன் இணைய, அவர்களின் திட்டமிடப்பட்ட அமர்வுகளில் பதிவு செய்யலாம். இணையதளப் பிழை அல்லது தொழில்நுட்பக் கோளாறைத் தெரிவிக்க, படிவத்தில் 'Technical Issue' என்பதைத் தேர்ந்தெடுக்கவும். பாதிக்கப்பட்ட பக்கத்தின் URL, பிரச்சனை மற்றும் உங்கள் உலாவி விபரங்களைக் குறிப்பிட்டால் எங்கள் குழு உடனடியாக சரிசெய்யும்."
        }
      ],
      stillHelp: "இன்னும் உதவி தேவையா?",
      contactLink: "எங்கள் உதவி மையத்தைத் தொடர்பு கொள்ளவும்"
    }
  }
};

export default supportContent;
