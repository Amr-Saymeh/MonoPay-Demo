export type SupportedLanguage = "en" | "ar";

type TranslationKey =
  | "appName"
  | "home"
  | "explore"
  | "approve"
  | "settings"
  | "signIn"
  | "signUp"
  | "email"
  | "pin"
  | "confirmPin"
  | "firstName"
  | "lastName"
  | "address"
  | "idNumber"
  | "continue"
  | "login"
  | "noAccount"
  | "alreadyHaveAccount"
  | "scanYourId"
  | "idScanHint"
  | "takeSelfie"
  | "selfieHint"
  | "capture"
  | "retake"
  | "usePhoto"
  | "welcome"
  | "accountPending"
  | "pendingDescription"
  | "editProfile"
  | "account"
  | "paymentMethods"
  | "preferences"
  | "notifications"
  | "securityPrivacy"
  | "changePassword"
  | "currentPassword"
  | "newPassword"
  | "confirmNewPassword"
  | "updatePassword"
  | "retakePhoto"
  | "save"
  | "saved"
  | "logoutConfirmTitle"
  | "logoutConfirmMessage"
  | "logout"
  | "error"
  | "failedToSignIn"
  | "captureFailed"
  | "missingSignupData"
  | "invalidEmail"
  | "invalidIdNumber"
  | "pinMismatch"
  | "pinTooShort"
  | "required"
  | "uploadFailed"
  | "cameraPermissionNeeded"
  | "approveUsers"
  | "pendingVerification"
  | "noPendingUsers"
  | "usersWithType0"
  | "name"
  | "phone"
  | "identityNumberLabel"
  | "personal"
  | "identity"
  | "approveAction"
  | "rejectAction"
  | "approveUserTitle"
  | "rejectUserTitle"
  | "cancel"
  // ──────────────────────────────────────────────
  // الكلمات الجديدة اللي أضفتها من الكومبوننتات اللي بعثتها
  | "advertisement"
  | "goodEvening"
  | "welcomeBack"
  | "quickActions"
  | "savingGoals"
  | "insights"
  | "cards"
  | "more"
  | "totalBalance"
  | "income"
  | "expenses"
  | "features"
  | "myCards"
  | "myCardsSubtitle"
  | "exchangeRates"
  | "exchangeRatesSubtitle"
  | "spendingInsights"
  | "spendingInsightsSubtitle"
  | "transactions"
  | "settingsSubtitle"      // ← أضيف هنا لحل مشكلة MenuList / FeaturesPage
  | "changeLanguage"        // اقتراح إضافي لزر تغيير اللغة
  | "changePercent";        // نص إضافي لعرض التغير الشهري في TotalBalance
  ;

export const translations: Record<
  SupportedLanguage,
  Record<TranslationKey, string>
> = {
  en: {
    appName: "MonoPay",
    home: "Home",
    explore: "Explore",
    approve: "Approve",
    settings: "Settings",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "E-mail",
    pin: "PIN",
    confirmPin: "Confirm PIN",
    firstName: "First name",
    lastName: "Last name",
    address: "Address",
    idNumber: "ID number",
    continue: "Continue",
    login: "Login",
    noAccount: "No Account?",
    alreadyHaveAccount: "Already have an account?",
    scanYourId: "Scan your ID",
    idScanHint: "Place your ID inside the frame",
    takeSelfie: "Take a selfie",
    selfieHint: "Center your face in the oval",
    capture: "Capture",
    retake: "Retake",
    usePhoto: "Use photo",
    welcome: "Welcome",
    accountPending: "Your account is pending approval",
    pendingDescription: "We will notify you once your account is approved.",
    editProfile: "Edit Profile",
    account: "Account",
    paymentMethods: "Payment Methods",
    preferences: "Preferences",
    notifications: "Notifications",
    securityPrivacy: "Security & Privacy",
    changePassword: "Change Password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmNewPassword: "Confirm new password",
    updatePassword: "Update password",
    retakePhoto: "Retake photo",
    save: "Save",
    saved: "Saved",
    logoutConfirmTitle: "Log out",
    logoutConfirmMessage: "Are you sure you want to log out?",
    logout: "Logout",
    error: "Error",
    failedToSignIn: "Failed to sign in.",
    captureFailed: "Failed to capture image.",
    missingSignupData: "Missing signup data.",
    invalidEmail: "Invalid email address",
    invalidIdNumber: "Invalid ID number",
    pinMismatch: "PIN does not match",
    pinTooShort: "PIN must be at least 6 digits",
    required: "This field is required",
    uploadFailed: "Upload failed. Please try again.",
    cameraPermissionNeeded: "Camera permission is required",
    approveUsers: "Approve Users",
    pendingVerification: "Pending verification",
    noPendingUsers: "No pending users",
    usersWithType0: "Users with type 0 will show up here.",
    name: "Name",
    phone: "Phone",
    identityNumberLabel: "Identity #",
    personal: "Personal",
    identity: "Identity",
    approveAction: "Approve",
    rejectAction: "Reject",
    approveUserTitle: "Approve user",
    rejectUserTitle: "Reject user",
    cancel: "Cancel",

    // ──────────────────────────────────────────────
    // الكلمات الجديدة المضافة
    advertisement:          "Advertisement",
    goodEvening:            "Good Evening",
    welcomeBack:            "Welcome back,",
    quickActions:           "Quick Actions",
    savingGoals:            "Saving Goals",
    insights:               "Insights",
    cards:                  "Cards",
    more:                   "More",
    totalBalance:           "Total Balance",
    income:                 "Income",
    expenses:               "Expenses",
    features:               "Features",
    myCards:                "My Cards",
    myCardsSubtitle:        "Manage credit & debit cards",
    exchangeRates:          "Exchange Rates",
    exchangeRatesSubtitle:  "View real-time currency exchange rates",
    spendingInsights:       "Spending Insights",
    spendingInsightsSubtitle: "Track your spending by category",
    transactions:           "Transactions",
    settingsSubtitle:       "Manage your account preferences",  // ← أضيف هنا
    changeLanguage:         "Change Language",
    changePercent:          " from last month"

  },
  ar: {
    appName: "MonoPay",
    home: "الرئيسية",
    explore: "استكشاف",
    approve: "قبول",
    settings: "الإعدادات",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    email: "البريد الإلكتروني",
    pin: "الرقم السري",
    confirmPin: "تأكيد الرقم السري",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    address: "العنوان",
    idNumber: "رقم الهوية",
    continue: "متابعة",
    login: "دخول",
    noAccount: "ليس لديك حساب؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    scanYourId: "امسح الهوية",
    idScanHint: "ضع الهوية داخل الإطار",
    takeSelfie: "التقط صورة سيلفي",
    selfieHint: "ضع وجهك داخل الشكل البيضاوي",
    capture: "التقاط",
    retake: "إعادة",
    usePhoto: "استخدام الصورة",
    welcome: "مرحباً",
    accountPending: "حسابك قيد المراجعة",
    pendingDescription: "سنقوم بإبلاغك عند قبول الحساب.",
    editProfile: "تعديل الملف الشخصي",
    account: "الحساب",
    paymentMethods: "طرق الدفع",
    preferences: "التفضيلات",
    notifications: "الإشعارات",
    securityPrivacy: "الأمان والخصوصية",
    changePassword: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    updatePassword: "تحديث كلمة المرور",
    retakePhoto: "إعادة التقاط الصورة",
    save: "حفظ",
    saved: "تم الحفظ",
    logoutConfirmTitle: "تسجيل الخروج",
    logoutConfirmMessage: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    logout: "تسجيل الخروج",
    error: "خطأ",
    failedToSignIn: "فشل تسجيل الدخول",
    captureFailed: "فشل التقاط الصورة",
    missingSignupData: "بيانات التسجيل غير مكتملة",
    invalidEmail: "البريد الإلكتروني غير صحيح",
    invalidIdNumber: "رقم الهوية غير صحيح",
    pinMismatch: "الرقم السري غير متطابق",
    pinTooShort: "الرقم السري يجب أن يكون 6 أرقام على الأقل",
    required: "هذا الحقل مطلوب",
    uploadFailed: "فشل الرفع، حاول مرة أخرى",
    cameraPermissionNeeded: "مطلوب إذن الكاميرا",
    approveUsers: "قبول المستخدمين",
    pendingVerification: "بانتظار التحقق",
    noPendingUsers: "لا يوجد مستخدمون بانتظار القبول",
    usersWithType0: "سيظهر هنا المستخدمون من النوع 0.",
    name: "الاسم",
    phone: "الهاتف",
    identityNumberLabel: "رقم الهوية",
    personal: "شخصي",
    identity: "هوية",
    approveAction: "قبول",
    rejectAction: "رفض",
    approveUserTitle: "قبول المستخدم",
    rejectUserTitle: "رفض المستخدم",
    cancel: "إلغاء",

    // ──────────────────────────────────────────────
    // الكلمات الجديدة المضافة
    advertisement:          "إعلان",
    goodEvening:            "مساء الخير",
    welcomeBack:            "مرحباً بعودتك،",
    quickActions:           "الإجراءات السريعة",
    savingGoals:            "أهداف التوفير",
    insights:               "الرؤى",
    cards:                  "البطاقات",
    more:                   "المزيد",
    totalBalance:           "الرصيد الكلي",
    income:                 "الدخل",
    expenses:               "المصروفات",
    features:               "الميزات",
    myCards:                "بطاقاتي",
    myCardsSubtitle:        "إدارة بطاقات الائتمان والخصم",
    exchangeRates:          "أسعار الصرف",
    exchangeRatesSubtitle:  "عرض أسعار صرف العملات في الوقت الفعلي",
    spendingInsights:       "رؤى الإنفاق",
    spendingInsightsSubtitle: "تتبع إنفاقك حسب الفئة",
    transactions:           "المعاملات",
    settingsSubtitle:       "إدارة تفضيلات حسابك",           // ← أضيف هنا
    changeLanguage:         "تغيير اللغة",
       changePercent: " من الشهر الماضي",
  },
};

export function getIsRtl(language: SupportedLanguage) {
  return language === "ar";
}