
import { CheckIcon } from './components/Shared.js';

export const AppView = Object.freeze({
  Home: 'home',
  PMCAgent: 'pmcAgent',
  About: 'about',
  Contact: 'contact',
  Terms: 'terms',
  Privacy: 'privacy',
});

export const Language = Object.freeze({
  EN: 'en',
  AR: 'ar',
});

export const AI_PROVIDERS = [
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    defaultModel: 'gemini-3-flash-preview',
    description: 'Required for multimodal analysis',
    models: [
        { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
        { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }
    ],
    icon: '⚡' 
  },
  { 
    id: 'openai', 
    name: 'OpenAI GPT-4o', 
    defaultModel: 'gpt-4o',
    description: 'Advanced reasoning',
    models: [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
    ],
    icon: '🤖' 
  },
  { 
    id: 'groq', 
    name: 'Groq (Llama 3)', 
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'High-speed inference',
    models: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
        { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision' }
    ],
    icon: '🚀' 
  }
];

export const PLANNING_STANDARDS = [
  { id: 'dcma', name: { en: 'DCMA 14-Point Assessment', ar: 'تقييم DCMA (14 نقطة)' } },
  { id: 'aramco', name: { en: 'Saudi Aramco Schedule Standards', ar: 'معايير أرامكو السعودية' } },
  { id: 'fidic', name: { en: 'FIDIC Contract Requirements', ar: 'متطلبات عقود فيديك' } },
  { id: 'pmi', name: { en: 'PMI Scheduling Practice', ar: 'ممارسات الجدولة (PMI)' } },
  { id: 'general', name: { en: 'General Best Practices', ar: 'أفضل الممارسات العامة' } }
];

export const STANDARD_DETAILS = {
  dcma: {
    title: { en: "DCMA 14-Point Assessment", ar: "تقييم وكالة إدارة عقود الدفاع (14 نقطة)" },
    description: { 
      en: "A standard industry framework used to evaluate the quality and structural integrity of a project schedule.",
      ar: "إطار عمل قياسي في الصناعة يستخدم لتقييم الجودة والسلامة الهيكلية للجدول الزمني للمشروع."
    },
    criteria: [
      {
        name: { en: "1. Logic", ar: "1. المنطق" },
        desc: { en: "Incomplete logic. Max 5% of activities can lack predecessors or successors.", ar: "المنطق غير المكتمل. يُسمح بحد أقصى 5% من الأنشطة بدون سابق أو لاحق." }
      },
      {
        name: { en: "2. Leads", ar: "2. التداخلات السلبية (Leads)" },
        desc: { en: "Negative lags (Leads) should not be used. Target 0%.", ar: "يجب عدم استخدام التداخلات السلبية. الهدف 0%." }
      },
      {
        name: { en: "3. Lags", ar: "3. التداخلات الإيجابية (Lags)" },
        desc: { en: "Lags should be minimized. Max 5% of relationships.", ar: "يجب تقليل التداخلات الإيجابية. الحد الأقصى 5% من العلاقات." }
      },
      {
        name: { en: "4. Relationship Types", ar: "4. أنواع العلاقات" },
        desc: { en: "Finish-to-Start (FS) should be dominant (>90%). Minimize SS/FF/SF.", ar: "يجب أن تكون علاقة النهاية-للبداية (FS) هي السائدة (>90%)." }
      },
      {
        name: { en: "5. Hard Constraints", ar: "5. القيود الصارمة" },
        desc: { en: "Constraints that prevent logic from driving dates (e.g., Must Finish On). Max 5%.", ar: "القيود التي تمنع المنطق من تحديد التواريخ (مثل 'يجب أن ينتهي في'). الحد الأقصى 5%." }
      },
      {
        name: { en: "6. High Float", ar: "6. السماحية العالية" },
        desc: { en: "Activities with total float > 44 working days. Max 5%.", ar: "الأنشطة ذات السماحية الكلية > 44 يوم عمل. الحد الأقصى 5%." }
      },
      {
        name: { en: "7. Negative Float", ar: "7. السماحية السالبة" },
        desc: { en: "Activities with float < 0. Indicates schedule is behind. Target 0%.", ar: "الأنشطة ذات السماحية < 0. تشير إلى تأخر الجدول. الهدف 0%." }
      },
      {
        name: { en: "8. High Duration", ar: "8. المدة الطويلة" },
        desc: { en: "Activities taking longer than 2 reporting periods (44 days). Max 5%.", ar: "الأنشطة التي تستغرق أكثر من فترتي تقرير (44 يومًا). الحد الأقصى 5%." }
      },
      {
        name: { en: "9. Invalid Dates", ar: "9. تواريخ غير صالحة" },
        desc: { en: "Forecast dates in the past or actual dates in the future. Target 0%.", ar: "تواريخ متوقعة في الماضي أو تواريخ فعلية في المستقبل. الهدف 0%." }
      },
      {
        name: { en: "10. Resources", ar: "10. الموارد" },
        desc: { en: "All activities should be resource/cost loaded (Check if required).", ar: "يجب تحميل جميع الأنشطة بالموارد/التكلفة (تحقق إذا كان مطلوبًا)." }
      },
      {
        name: { en: "11. Missed Tasks", ar: "11. المهام الفائتة" },
        desc: { en: "Activities that should have finished by data date but haven't. Max 5%.", ar: "الأنشطة التي كان يجب أن تنتهي بحلول تاريخ البيانات ولم تنتهِ. الحد الأقصى 5%." }
      },
      {
        name: { en: "12. Critical Path Test", ar: "12. اختبار المسار الحرج" },
        desc: { en: "Critical path must be continuous and unbroken.", ar: "يجب أن يكون المسار الحرج متصلاً وغير مقطوع." }
      },
      {
        name: { en: "13. CPLI", ar: "13. مؤشر طول المسار الحرج" },
        desc: { en: "Critical Path Length Index. Target > 1.0.", ar: "مؤشر طول المسار الحرج. الهدف > 1.0." }
      },
      {
        name: { en: "14. BEI", ar: "14. مؤشر التنفيذ الأساسي" },
        desc: { en: "Baseline Execution Index. Target > 1.0.", ar: "مؤشر تنفيذ خط الأساس. الهدف > 1.0." }
      }
    ]
  },
  aramco: {
    title: { en: "Saudi Aramco Schedule Specifications", ar: "مواصفات الجدول الزمني لأرامكو السعودية" },
    description: { 
      en: "Based on typical Schedule 'A' requirements for EPC/Construction contracts in Saudi Aramco.",
      ar: "بناءً على متطلبات الجدول 'أ' النموذجية لعقود الهندسة والتوريد والبناء في أرامكو السعودية."
    },
    criteria: [
      {
        name: { en: "Level 1-4 Structure", ar: "هيكلية المستويات 1-4" },
        desc: { en: "Schedule must clearly rollup from Activity (L4) to WBS (L3), Area (L2), and Project (L1).", ar: "يجب أن يترابط الجدول بوضوح من النشاط (م4) إلى هيكل العمل (م3)، والمنطقة (م2)، والمشروع (م1)." }
      },
      {
        name: { en: "Resource Loading", ar: "تحميل الموارد" },
        desc: { en: "Manhours must be assigned to construction activities. Costs/Weight for procurement.", ar: "يجب تعيين ساعات العمل لأنشطة البناء. والتكلفة/الوزن للمشتريات." }
      },
      {
        name: { en: "Activity Durations", ar: "مدد الأنشطة" },
        desc: { en: "Construction activities should generally not exceed 30 days.", ar: "يجب ألا تتجاوز أنشطة البناء عمومًا 30 يومًا." }
      },
      {
        name: { en: "Coding Structure", ar: "هيكل الترميز" },
        desc: { en: "Mandatory Activity Codes: Phase, Area, Discipline, Responsibility.", ar: "أكواد الأنشطة الإلزامية: المرحلة، المنطقة، التخصص، المسؤولية." }
      },
      {
        name: { en: "Procurement Cycle", ar: "دورة المشتريات" },
        desc: { en: "Must show: PO Issue, Manufacturing, FAT, Delivery to Site.", ar: "يجب إظهار: إصدار أمر الشراء، التصنيع، فحص المصنع، التوصيل للموقع." }
      },
      {
        name: { en: "Logic Constraints", ar: "قيود المنطق" },
        desc: { en: "Minimize use of 'Start-to-Start' without lag. Avoid 'Finish-to-Finish'.", ar: "تقليل استخدام 'بداية-لبداية'. تجنب 'نهاية-لنهاية'." }
      }
    ]
  },
  fidic: {
    title: { en: "FIDIC Contract Requirements (Clause 8.3)", ar: "متطلبات عقود فيديك (المادة 8.3)" },
    description: { 
      en: "Requirements typically found in FIDIC Red/Yellow Books regarding the Programme of Works.",
      ar: "المتطلبات الموجودة عادة في كتب فيديك الحمراء/الصفراء بخصوص برنامج الأعمال."
    },
    criteria: [
      {
        name: { en: "Time for Completion", ar: "وقت الإنجاز" },
        desc: { en: "Schedule must respect the Time for Completion as stated in the Appendix to Tender.", ar: "يجب أن يحترم الجدول وقت الإنجاز المذكور في ملحق العطاء." }
      },
      {
        name: { en: "Order of Works", ar: "ترتيب الأعمال" },
        desc: { en: "Must show the order in which Contractor intends to carry out Works.", ar: "يجب إظهار الترتيب الذي ينوي المقاول تنفيذ الأعمال به." }
      },
      {
        name: { en: "Contractor's Documents", ar: "وثائق المقاول" },
        desc: { en: "Include periods for review and approval of Contractor's Documents.", ar: "تضمين فترات مراجعة واعتماد وثائق المقاول." }
      },
      {
        name: { en: "Inspections & Tests", ar: "الفحوصات والاختبارات" },
        desc: { en: "Sequence of specified tests and inspections must be visible.", ar: "يجب أن يكون تسلسل الاختبارات والفحوصات المحدد مرئيًا." }
      },
      {
        name: { en: "Supporting Report", ar: "التقرير الداعم" },
        desc: { en: "Submission must include a general description of methods and resources.", ar: "يجب أن يتضمن التقديم وصفًا عامًا للطرق والموارد." }
      },
      {
        name: { en: "Critical Path", ar: "المسار الحرج" },
        desc: { en: "Although not explicitly named 'CPM' in older versions, modern FIDIC requires logical links showing criticality.", ar: "على الرغم من عدم تسميته صراحة بـ CPM قديمًا، تتطلب النسخ الحديثة روابط منطقية تظهر المسار الحرج." }
      }
    ]
  },
  pmi: {
    title: { en: "PMI Scheduling Practice", ar: "ممارسات الجدولة (PMI)" },
    description: { 
      en: "Best practices defined in the PMBOK Guide and Practice Standard for Scheduling.",
      ar: "أفضل الممارسات المحددة في دليل PMBOK ومعيار ممارسة الجدولة."
    },
    criteria: [
      {
        name: { en: "Schedule Model Validity", ar: "صلاحية نموذج الجدول" },
        desc: { en: "Network logic must be complete (Activities have predecessors/successors).", ar: "يجب أن يكون منطق الشبكة مكتملاً (الأنشطة لها سابق ولاحق)." }
      },
      {
        name: { en: "Float Management", ar: "إدارة السماحية" },
        desc: { en: "Total Float must be calculated accurately. Excessive float suggests missing logic.", ar: "يجب حساب السماحية الكلية بدقة. السماحية المفرطة تشير إلى منطق مفقود." }
      },
      {
        name: { en: "Baseline Maintenance", ar: "صيانة خط الأساس" },
        desc: { en: "Comparison against approved baseline is mandatory for variance analysis.", ar: "المقارنة مع خط الأساس المعتمد إلزامية لتحليل التباين." }
      },
      {
        name: { en: "Resource Optimization", ar: "تحسين الموارد" },
        desc: { en: "Schedule should be leveled to avoid resource over-allocation.", ar: "يجب تسوية الجدول لتجنب التخصيص المفرط للموارد." }
      }
    ]
  },
  general: {
    title: { en: "General Best Practices", ar: "أفضل الممارسات العامة" },
    description: { 
      en: "A mix of standard checks suitable for non-contractual or internal reviews.",
      ar: "مزيج من الفحوصات القياسية المناسبة للمراجعات الداخلية أو غير التعاقدية."
    },
    criteria: [
      { name: { en: "Logical Sequence", ar: "التسلسل المنطقي" }, desc: { en: "Ensures dates flow logically.", ar: "يضمن تدفق التواريخ بشكل منطقي." } },
      { name: { en: "Negative Float", ar: "السماحية السالبة" }, desc: { en: "Checks for delays.", ar: "يتحقق من وجود تأخيرات." } },
      { name: { en: "Activity Durations", ar: "مدد الأنشطة" }, desc: { en: "Flags usually long durations.", ar: "يحدد المدد الطويلة بشكل غير معتاد." } },
      { name: { en: "Dangling Activities", ar: "الأنشطة المعلقة" }, desc: { en: "Open ends check.", ar: "فحص النهايات المفتوحة." } }
    ]
  }
};

export const i18n = {
  [Language.EN]: {
    title: "SchedAI",
    navHome: "Home",
    navAgent: "Schedule Reviewer",
    navAbout: "About Us",
    navContact: "Contact Us",
    navTerms: "Terms",
    navPrivacy: "Privacy",
    
    // Home
    homeWelcome: "Review Schedules Faster & Better",
    homeDescription: "Upload schedule files (XER/CSV/XML) or multiple screenshots of Gantt Charts. Your intelligent assistant will analyze them according to PMC standards and generate a professional report.",
    homeAgentTitle: "Start Analysis",
    homeAgentDesc: "Comprehensive analysis, non-compliance detection, and professional contractor notes.",
    
    // PMC Agent Feature
    agentTitle: "Expert Schedule Reviewer",
    agentDescription: "A seasoned PMC assistant designed to perform comprehensive schedule evaluations, highlight non-compliance, and generate actionable decision support data.",
    inputLabel: "Upload Schedule or Drop Screenshot",
    inputPlaceholder: "Paste schedule narrative, log, or analysis text here...",
    dragDrop: "Click to upload or drag and drop",
    dragDropSub: "Accepts XER, CSV, Text, XML files or multiple Images of Gantt Charts",
    selectStandard: "Select Review Standard",
    selectProvider: "Select AI Provider",
    analyzeButton: "Run Expert Analysis",
    analyzing: "Performing Comprehensive Evaluation...",
    
    // Dashboard & Report
    reportViews: "Report Views",
    tabOverview: "Project Overview",
    tabHealthCheck: "Schedule Health Check",
    tabActivityRegister: "Activity Register",
    tabSequence: "Logic & Sequencing",
    
    statTotalActivities: "No of Activities",
    statCriticalActivities: "Critical Activities",
    statDuration: "Duration",
    statFinishDate: "Finish Date",
    statRiskLevel: "Schedule Risk Level",
    
    activityList: "Activity List",
    logicSequenceAnalysis: "Logic Sequence Analysis",
    
    // Report Table Headers & Labels
    colId: "ID",
    colActivity: "Activity Name",
    colDuration: "Dur",
    colStart: "Start",
    colFinish: "Finish",
    colFloat: "Float",
    colStatus: "Status",
    colCheck: "Check",
    colDescription: "Description",
    colTarget: "Target",
    colActual: "Actual",
    colFound: "Found",
    colTotal: "Total",
    
    lblDays: "Days",
    lblDataDate: "Data Date",
    lblTarget: "Target",
    lblPassingMetrics: "Passing Metrics",
    lblReportFooter: "Report Type: Power BI Style",
    lblStdFooter: "Std: DCMA 14-Point",

    // Filters & Values
    filterAll: "All Activities",
    filterCritical: "Critical Path",
    filterHighFloat: "High Float",
    valHigh: "High",
    valMedium: "Medium",
    valLow: "Low",
    valCritical: "Critical",
    valNormal: "Normal",
    valPass: "PASS",
    valFail: "FAIL",

    // Output Sections
    analysisReport: "Executive Summary",
    riskAssessment: "Risk Assessment",
    technicalFindings: "Technical Findings",
    recommendations: "Strategic Recommendations",
    nonCompliance: "Non-Compliance Issues",
    contractorNote: "Official Letter to Contractor",
    copy: "Copy",
    copied: "Copied!",
    
    // About
    aboutTitle: "About SchedAI",
    aboutText: "SchedAI is a specialized tool designed to support planning teams in Project Management Consultancies. It streamlines the review process by automatically detecting schedule anomalies, ensuring compliance with standards, and drafting professional correspondence.",
    aboutVisionTitle: "Our Vision",
    aboutVisionText: "To become the standard AI assistant for planning engineers worldwide, ensuring every project schedule meets the highest quality standards with minimal manual effort.",
    aboutMissionTitle: "Our Mission",
    aboutMissionText: "Empower planning teams with intelligent insights that detect risks early, enforce contractual compliance, and facilitate professional communication with contractors.",
    aboutValuesTitle: "Core Values",
    aboutValuePrivacy: "Data Privacy",
    aboutValuePrivacyDesc: "Your schedule data is processed securely.",
    aboutValueTransparency: "Transparency",
    aboutValueTransparencyDesc: "Clear and explainable analysis findings.",
    aboutValueImprovement: "Continuous Improvement",
    aboutValueImprovementDesc: "Adapting to the latest planning standards.",
    aboutStoryTitle: "Our Story",
    aboutStoryText: "Born from the need to reduce the repetitive workload of reviewing hundreds of activities, SchedAI was developed to let planning engineers focus on strategy rather than error-spotting.",

    // General
    apiKeyError: "API Key is missing. Please check your configuration.",
    errorOccurred: "An error occurred during analysis.",
    connectWithUs: "Connect with us",
    
    // Contact
    contactTitle: "Get in Touch",
    contactDescription: "Have questions about custom integrations or enterprise support? We're here to help.",
    contactEmailTitle: "Email Us",
    contactEmailDescription: "For general inquiries and support",
    contactEmailAddress: "support@schedai.com",
    contactTelegramTitle: "Telegram Support",
    contactTelegramDescription: "Chat with our support bot",
    contactTelegramHandle: "@SchedAI_Bot",

    // Auth
    login: "Welcome Back",
    register: "Create Account",
    fullName: "Full Name",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    createAccount: "Create Account",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    errorFullNameRequired: "Full Name is required",
    errorInvalidEmail: "Please enter a valid email",
    errorPasswordLength: "Password must be at least 6 characters",
    errorPasswordMismatch: "Passwords do not match",
    registrationSuccess: "Registration successful! Please login.",
    authRegistrationDisclaimer_p1: "By creating an account, you agree to our",
    authRegistrationDisclaimer_terms: "Terms of Service",
    authRegistrationDisclaimer_p2: "and",
    authRegistrationDisclaimer_privacy: "Privacy Policy",
    authRegistrationDisclaimer_p3: ".",
    continueWithGoogle: "Continue with Google",
    orWithEmail: "Or continue with email",
    forgotPassword: "Forgot Password?",
    enterEmailForReset: "Enter your email to reset password",
    sendResetLink: "Send Reset Link",
    backToLogin: "Back to Login",
    resetLinkSent: "Check your email for the reset link!",
    emailRequiredForReset: "Email is required to reset password",
    authRequiredTitle: "Authentication Required",
    authRequiredMessage: "Please sign in to access the expert scheduling assistant.",
    getStarted: "Get Started",
    noCreditCardRequired: "No credit card required for free tier.",
  },
  [Language.AR]: {
    title: "SchedAI",
    navHome: "الرئيسية",
    navAgent: "مراجعة الجداول",
    navAbout: "من نحن",
    navContact: "اتصل بنا",
    navTerms: "الشروط",
    navPrivacy: "الخصوصية",

    // Home
    homeWelcome: "راجع جداولك الزمنية أسرع وبجودة أعلى",
    homeDescription: "قم برفع ملفات الجدول الزمني (XER/CSV) أو صور المخططات المتعددة (Gantt Chart)، وسيقوم المساعد الذكي بتحليلها وفق معايير PMC وتوليد تقرير احترافي.",
    homeAgentTitle: "ابدأ التحليل الآن",
    homeAgentDesc: "تحليل شامل، اكتشاف عدم التطابق، وتوليد ملاحظات احترافية جاهزة للمشاركة مع المقاول.",

    // PMC Agent Feature
    agentTitle: "خبير مراجعة الجداول الزمنية",
    agentDescription: "مساعد ذكي بخبرة PMC لإجراء تقييم شامل للجدول الزمني، وتحديد عدم الامتثال، وتوليد بيانات داعمة للقرار.",
    inputLabel: "ارفع الجدول أو اسحب الصور هنا",
    inputPlaceholder: "أو الصق النص/التقرير هنا...",
    dragDrop: "اضغط للرفع أو اسحب الملفات هنا",
    dragDropSub: "نقبل ملفات XER, CSV, Text, XML أو صور متعددة من P6/MSP",
    selectStandard: "اختر معيار المراجعة",
    selectProvider: "مزود الخدمة",
    analyzeButton: "بدء التحليل الشامل",
    analyzing: "جاري إجراء التقييم الفني...",

    // Dashboard & Report
    reportViews: "طرق العرض",
    tabOverview: "نظرة عامة للمشروع",
    tabHealthCheck: "فحص صحة الجدول",
    tabActivityRegister: "سجل الأنشطة",
    tabSequence: "المنطق والتسلسل",
    
    statTotalActivities: "عدد الأنشطة",
    statCriticalActivities: "الأنشطة الحرجة",
    statDuration: "المدة الزمنية",
    statFinishDate: "تاريخ الانتهاء",
    statRiskLevel: "مستوى المخاطر",
    
    activityList: "قائمة الأنشطة",
    logicSequenceAnalysis: "تحليل منطق التسلسل",

    // Report Table Headers & Labels
    colId: "المعرف",
    colActivity: "اسم النشاط",
    colDuration: "المدة",
    colStart: "البداية",
    colFinish: "النهاية",
    colFloat: "السماحية",
    colStatus: "الحالة",
    colCheck: "الفحص",
    colDescription: "الوصف",
    colTarget: "الهدف",
    colActual: "الفعلي",
    colFound: "الموجود",
    colTotal: "الإجمالي",
    
    lblDays: "يوم",
    lblDataDate: "تاريخ البيانات",
    lblTarget: "الهدف",
    lblPassingMetrics: "مؤشرات النجاح",
    lblReportFooter: "نوع التقرير: Power BI Style",
    lblStdFooter: "المعيار: DCMA 14-Point",

    // Filters & Values
    filterAll: "جميع الأنشطة",
    filterCritical: "المسار الحرج",
    filterHighFloat: "سماحية عالية",
    valHigh: "عالي",
    valMedium: "متوسط",
    valLow: "منخفض",
    valCritical: "حرج",
    valNormal: "عادي",
    valPass: "ناجح",
    valFail: "فشل",

    // Output Sections
    analysisReport: "الملخص التنفيذي",
    riskAssessment: "تقييم المخاطر",
    technicalFindings: "الملاحظات الفنية",
    recommendations: "التوصيات الاستراتيجية",
    nonCompliance: "نقاط عدم الالتزام",
    contractorNote: "خطاب رسمي للمقاول",
    copy: "نسخ",
    copied: "تم النسخ!",

    // About
    aboutTitle: "عن SchedAI",
    aboutText: "SchedAI هي أداة متخصصة مصممة لدعم فرق التخطيط في شركات إدارة المشاريع. تعمل الأداة على تسريع عملية المراجعة من خلال الاكتشاف التلقائي لعيوب الجدول الزمني، وضمان الامتثال للمعايير، وصياغة المراسلات المهنية.",
    aboutVisionTitle: "رؤيتنا",
    aboutVisionText: "أن نصبح المساعد المعياري لمهندسي التخطيط عالميًا، لضمان أعلى معايير الجودة في الجداول الزمنية بأقل جهد يدوي.",
    aboutMissionTitle: "مهمتنا",
    aboutMissionText: "تمكين فرق التخطيط برؤى ذكية تكتشف المخاطر مبكرًا، وتضمن الامتثال التعاقدي، وتسهل التواصل الاحترافي مع المقاولين.",
    aboutValuesTitle: "قيمنا الجوهرية",
    aboutValuePrivacy: "خصوصية البيانات",
    aboutValuePrivacyDesc: "تتم معالجة بيانات جدولك الزمني بأمان تام.",
    aboutValueTransparency: "الشفافية",
    aboutValueTransparencyDesc: "نتائج تحليل واضحة وقابلة للتفسير.",
    aboutValueImprovement: "التحسين المستمر",
    aboutValueImprovementDesc: "التكيف المستمر مع أحدث معايير التخطيط.",
    aboutStoryTitle: "قصتنا",
    aboutStoryText: "نبعت الفكرة من الحاجة لتقليل الجهد المتكرر في مراجعة مئات الأنشطة، ليتمكن مهندس التخطيط من التركيز على الاستراتيجية بدلاً من تصيد الأخطاء.",

    // General
    apiKeyError: "مفتاح API مفقود.",
    errorOccurred: "حدث خطأ أثناء التحليل.",
    connectWithUs: "تواصل معنا",
    
    // Contact
    contactTitle: "تواصل معنا",
    contactDescription: "لديك استفسارات حول التكامل المخصص أو دعم الشركات؟ نحن هنا للمساعدة.",
    contactEmailTitle: "راسلنا عبر البريد",
    contactEmailDescription: "للاستفسارات العامة والدعم",
    contactEmailAddress: "support@schedai.com",
    contactTelegramTitle: "دعم تيليجرام",
    contactTelegramDescription: "تحدث مع بوت الدعم الفني",
    contactTelegramHandle: "@SchedAI_Bot",

    // Auth
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    fullName: "الاسم الكامل",
    emailAddress: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    createAccount: "إنشاء حساب",
    dontHaveAccount: "ليس لديك حساب؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    errorFullNameRequired: "الاسم الكامل مطلوب",
    errorInvalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    errorPasswordLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
    errorPasswordMismatch: "كلمتا المرور غير متطابقتين",
    registrationSuccess: "تم التسجيل بنجاح! يرجى تسجيل الدخول.",
    authRegistrationDisclaimer_p1: "بإنشاء حساب، فإنك توافق على",
    authRegistrationDisclaimer_terms: "شروط الخدمة",
    authRegistrationDisclaimer_p2: "و",
    authRegistrationDisclaimer_privacy: "سياسة الخصوصية",
    authRegistrationDisclaimer_p3: ".",
    continueWithGoogle: "المتابعة باستخدام Google",
    orWithEmail: "أو المتابعة عبر البريد الإلكتروني",
    forgotPassword: "نسيت كلمة المرور؟",
    enterEmailForReset: "أدخل بريدك الإلكتروني لاستعادة كلمة المرور",
    sendResetLink: "إرسال رابط الاستعادة",
    backToLogin: "العودة لتسجيل الدخول",
    resetLinkSent: "تفقد بريدك الإلكتروني للحصول على الرابط!",
    emailRequiredForReset: "البريد الإلكتروني مطلوب لاستعادة كلمة المرور",
    authRequiredTitle: "تسجيل الدخول مطلوب",
    authRequiredMessage: "يرجى تسجيل الدخول للوصول إلى المساعد الذكي.",
    getStarted: "ابدأ الآن",
    noCreditCardRequired: "لا حاجة لبطاقة ائتمان.",
  },
};
