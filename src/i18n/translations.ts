export type SupportedLanguage = "en" | "ar";

type TranslationKey =
  | "appName"
  | "home"
  | "explore"
  | "wallets"
  | "walletManagement"
  | "myWallets"
  | "addWallet"
  | "yourWallets"
  | "noWalletsYet"
  | "tapPlusToAddFirstWallet"
  | "walletDetails"
  | "walletName"
  | "walletNamePlaceholder"
  | "walletType"
  | "walletTypeReal"
  | "walletTypeCredit"
  | "walletTypeShared"
  | "walletStatus"
  | "walletExpiry"
  | "walletOwner"
  | "walletMembers"
  | "walletCurrencies"
  | "balance"
  | "members"
  | "expShort"
  | "active"
  | "inactive"
  | "pleaseSignIn"
  | "createWallet"
  | "creating"
  | "initialBalances"
  | "chooseCardColor"
  | "chooseEmoji"
  | "addMembers"
  | "searchByNameOrNumber"
  | "deleteWallet"
  | "deleting"
  | "delete"
  | "deleteWalletConfirmTitle"
  | "deleteWalletConfirmMessage"
  | "mainWalletNotFound"
  | "cannotDeleteMainWallet"
  | "walletNotFound"
  | "onlyOwnerCanDelete"
  | "walletNameRequired"
  | "invalidExpiry"
  | "invalidAmount"
  | "duplicateCurrency"
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
  | "darkMode"
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
  | "cancel";

export const translations: Record<
  SupportedLanguage,
  Record<TranslationKey, string>
> = {
  en: {
    appName: "MonoPay",
    home: "Home",
    explore: "Explore",
    wallets: "Wallets",
    walletManagement: "Wallet Management",
    myWallets: "My Wallets",
    addWallet: "Add Wallet",
    yourWallets: "Your wallets",
    noWalletsYet: "No wallets yet",
    tapPlusToAddFirstWallet: "Tap the + button to add your first wallet.",
    walletDetails: "Wallet Details",
    walletName: "Name",
    walletNamePlaceholder: "Main wallet",
    walletType: "Wallet Type",
    walletTypeReal: "Real",
    walletTypeCredit: "Credit",
    walletTypeShared: "Shared",
    walletStatus: "Status",
    walletExpiry: "Expiry",
    walletOwner: "Owner",
    walletMembers: "Members",
    walletCurrencies: "Currencies",
    balance: "Balance",
    members: "members",
    expShort: "Exp",
    active: "Active",
    inactive: "Inactive",
    pleaseSignIn: "Please sign in",
    createWallet: "Create Wallet",
    creating: "Creating...",
    initialBalances: "Initial Balances (optional)",
    chooseCardColor: "Choose Card Color",
    chooseEmoji: "Choose Emoji",
    addMembers: "Add Members",
    searchByNameOrNumber: "Search by name or number",
    deleteWallet: "Delete Wallet",
    deleting: "Deleting...",
    delete: "Delete",
    deleteWalletConfirmTitle: "Delete wallet",
    deleteWalletConfirmMessage: "Are you sure you want to delete",
    mainWalletNotFound: "Main wallet not found",
    cannotDeleteMainWallet: "You can't delete the Main wallet",
    walletNotFound: "Wallet not found",
    onlyOwnerCanDelete: "Only the owner can delete this shared wallet",
    walletNameRequired: "Wallet name is required",
    invalidExpiry: "Invalid expiry date (use MM/YY)",
    invalidAmount: "Invalid amount",
    duplicateCurrency: "Duplicate currency",
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
    darkMode: "Dark Mode",
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
  },
  ar: {
    appName: "MonoPay",
    home: "الرئيسية",
    explore: "استكشاف",
    wallets: "المحافظ",
    walletManagement: "إدارة المحافظ",
    myWallets: "محافظي",
    addWallet: "إضافة محفظة",
    yourWallets: "محافظك",
    noWalletsYet: "لا توجد محافظ بعد",
    tapPlusToAddFirstWallet: "اضغط على زر + لإضافة أول محفظة لك.",
    walletDetails: "تفاصيل المحفظة",
    walletName: "الاسم",
    walletNamePlaceholder: "المحفظة الرئيسية",
    walletType: "نوع المحفظة",
    walletTypeReal: "حقيقية",
    walletTypeCredit: "ائتمان",
    walletTypeShared: "مشتركة",
    walletStatus: "الحالة",
    walletExpiry: "تاريخ الانتهاء",
    walletOwner: "المالك",
    walletMembers: "الأعضاء",
    walletCurrencies: "العملات",
    balance: "الرصيد",
    members: "أعضاء",
    expShort: "انتهاء",
    active: "نشطة",
    inactive: "غير نشطة",
    pleaseSignIn: "يرجى تسجيل الدخول",
    createWallet: "إنشاء محفظة",
    creating: "جاري الإنشاء...",
    initialBalances: "أرصدة البداية (اختياري)",
    chooseCardColor: "اختر لون البطاقة",
    chooseEmoji: "اختر رمزاً",
    addMembers: "إضافة أعضاء",
    searchByNameOrNumber: "ابحث بالاسم أو الرقم",
    deleteWallet: "حذف المحفظة",
    deleting: "جاري الحذف...",
    delete: "حذف",
    deleteWalletConfirmTitle: "حذف المحفظة",
    deleteWalletConfirmMessage: "هل أنت متأكد أنك تريد حذف",
    mainWalletNotFound: "لم يتم العثور على المحفظة الرئيسية",
    cannotDeleteMainWallet: "لا يمكنك حذف المحفظة الرئيسية",
    walletNotFound: "لم يتم العثور على المحفظة",
    onlyOwnerCanDelete: "فقط المالك يمكنه حذف هذه المحفظة المشتركة",
    walletNameRequired: "اسم المحفظة مطلوب",
    invalidExpiry: "تاريخ انتهاء غير صحيح (MM/YY)",
    invalidAmount: "قيمة غير صحيحة",
    duplicateCurrency: "عملة مكررة",
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
    darkMode: "الوضع الداكن",
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
  },
};

export function getIsRtl(language: SupportedLanguage) {
  return language === "ar";
}
