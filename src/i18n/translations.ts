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
  | "refreshNow"
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
  | "categories"
  | "allCategories"
  | "searchCategories"
  | "addCustomCategory"
  | "customCategoryPlaceholder"
  | "done"
  | "add"
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
  | "cancel"
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
  | "settingsSubtitle" // ← أضيف هنا لحل مشكلة MenuList / FeaturesPage
  | "changeLanguage" // اقتراح إضافي لزر تغيير اللغة
  | "next"
  | "changePercent" // نص إضافي لعرض التغير الشهري في TotalBalance
  | "settingsSubtitle"
  | "changeLanguage"
  | "changePercent"
  | "makeTransaction"
  | "sendMoney"
  | "receiveMoney"
  | "amount"
  | "myWallet"
  | "selectMyWallet"
  | "recipientWallet"
  | "selectRecipientWallet"
  | "myReceivingWallet"
  | "selectReceivingWallet"
  | "recipient"
  | "selectRecipient"
  | "payer"
  | "selectPayer"
  | "category"
  | "selectCategory"
  | "noteOptional"
  | "notePlaceholder"
  | "send"
  | "request"
  | "insufficientFunds"
  | "walletInactive"
  | "senderIsReceiver"
  | "successSend"
  | "successRequest"
  | "selectWalletFirst"
  | "fillRequired"
  | "transfer"
  | "customization"
  | "Youmustselect3features"
  | "Youcanonlyselect3features"
  | "dailyPurchases"
  | "ofDailyBudget"
  | "editDailyBudget"
  | "dailyBudget"
  | "setDailyLimit"
  | "addPurchase"
  | "fieldRequired"
  | "purchaseAdded"
  | "foodDrinks"
  | "groceries"
  | "transport"
  | "health"
  | "shopping"
  | "entertainment"
  | "bills"
  | "education"
  | "personalCare"
  | "addNewPurchase"
  | "fillAllFields"
  | "success"
  | "totalExpenses"
  | "deletePurchase"
  | "updatedEveryHour"
  | "errorFetchingRates"
  | "enterAmountInAnyCurrency"
  | "items"
  | "noItemsInBundle"
  | "totalCost"
  | "noBundlesFound"
  | "edit"
  | "editBundle"
  | "createNewBundle"
  | "bundleName"
  | "bundleNamePlaceholder"
  | "cancelAdding"
  | "addItemToBundle"
  | "itemNamePlaceholder"
  | "price"
  | "confirmItem"
  | "updateBundle"
  | "confirmCreateBundle"
  | "recurring"
  | "manual"
  | "myBundles"
  | "editBudget"
  | "bundlesSubtitle"
  | "budgetWarningTitle"
  | "budgetWarningMessage"
  | "proceedAnyway"
  | "saveMyMoney"
  | "remainingBudget"
  | "newTotalAfter"
  | "goals.title"
  | "goals.createTitle"
  | "goals.editTitle"
  | "goals.totalSaved"
  | "goals.goalName"
  | "goals.targetAmount"
  | "goals.currentAmount"
  | "goals.targetDate"
  | "goals.currency"
  | "goals.contribute"
  | "goals.addContribution"
  | "goals.contributionAmount"
  | "goals.contributionReason"
  | "goals.remaining"
  | "goals.deleteConfirm"
  | "goals.deleteSuccess"
  | "goals.createSuccess"
  | "goals.updateSuccess"
  | "goals.contributionSuccess"
  | "incomeSavings.title"
  | "incomeSavings.addEntry"
  | "incomeSavings.editEntry"
  | "incomeSavings.totalIncome"
  | "incomeSavings.totalOutgoing"
  | "incomeSavings.sortBy"
  | "incomeSavings.sortByDate"
  | "incomeSavings.sortByAmount"
  | "incomeSavings.type"
  | "incomeSavings.income"
  | "incomeSavings.savings"
  | "incomeSavings.source"
  | "incomeSavings.amount"
  | "incomeSavings.notes"
  | "incomeSavings.regularity"
  | "incomeSavings.daily"
  | "incomeSavings.weekly"
  | "incomeSavings.monthly"
  | "incomeSavings.yearly"
  | "incomeSavings.categories.salary"
  | "incomeSavings.categories.freelance"
  | "incomeSavings.categories.loan"
  | "incomeSavings.categories.other"
  | "incomeSavings.categories.savings"
  | "incomeSavings.categories.debt"
  | "incomeSavings.entryTypes.receive"
  | "incomeSavings.entryTypes.send"
  | "incomeSavings.deleteConfirm"
  | "incomeSavings.deleteSuccess"
  | "incomeSavings.createSuccess"
  | "incomeSavings.updateSuccess"
  | "common.cancel"
  | "common.save"
  | "common.delete"
  | "common.edit"
  | "common.add"
  | "common.close"
  | "common.confirm"
  | "common.loading";

export const translations: Record<
  SupportedLanguage,
  Record<TranslationKey, string>
> = {
  en: {
    appName: "MonoPay",
    home: "Home",
    explore: "Explore",
    refreshNow: "Refresh Now",
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
    categories: "Categories",
    allCategories: "All Categories",
    searchCategories: "Search categories...",
    addCustomCategory: "Add Custom Category",
    customCategoryPlaceholder: "New category name",
    done: "Done",
    add: "Add",
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
    next: "Next",
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
    advertisement: "Advertisement",
    goodEvening: "Good Evening",
    welcomeBack: "Welcome back,",
    quickActions: "Quick Actions",
    savingGoals: "Saving Goals",
    insights: "Insights",
    cards: "Cards",
    more: "More",
    totalBalance: "Total Balance",
    income: "Income",
    expenses: "Expenses",
    features: "Features",
    myCards: "My Cards",
    myCardsSubtitle: "Manage credit & debit cards",
    exchangeRates: "Exchange Rates",
    exchangeRatesSubtitle: "View real-time currency exchange rates",
    spendingInsights: "Spending Insights",
    spendingInsightsSubtitle: "Track your spending by category",
    transactions: "Transactions",
    settingsSubtitle: "Manage your account preferences",
    changeLanguage: "Change Language",
    changePercent: " from last month",
    makeTransaction: "Make a Transaction",
    sendMoney: "Send Money",
    receiveMoney: "Receive Money",
    amount: "Amount",
    myWallet: "My Wallet",
    selectMyWallet: "Select your wallet",
    recipientWallet: "Recipient's Wallet",
    selectRecipientWallet: "Select recipient's wallet",
    myReceivingWallet: "My Receiving Wallet",
    selectReceivingWallet: "Select wallet to receive",
    recipient: "Recipient",
    selectRecipient: "Select recipient",
    payer: "Payer",
    selectPayer: "Who should pay you?",
    category: "Category",
    selectCategory: "Select category",
    noteOptional: "Note (Optional)",
    notePlaceholder: "Add a note...",
    send: "Send",
    request: "Request",
    insufficientFunds: "Insufficient funds in the selected wallet.",
    walletInactive: "Selected wallet is inactive.",
    senderIsReceiver: "You cannot send money to yourself.",
    successSend: "Money sent successfully! 🎉",
    successRequest: "Money request sent! ⏳",
    selectWalletFirst: "Please select your wallet first.",
    fillRequired: "Please fill all required fields.",
    transfer: "Transfer",
    customization: "Customization",
    Youmustselect3features: "You must select 3 features",
    Youcanonlyselect3features: "You can only select 3 features",

    dailyPurchases: "Daily Purchases",
    ofDailyBudget: "OF DAILY BUDGET",
    editDailyBudget: "Edit Daily Budget",
    dailyBudget: "Daily Budget",
    setDailyLimit: "Set your daily spending limit",
    addPurchase: "Add Purchase",
    fieldRequired: "This field is required",
    purchaseAdded: "Purchase added successfully!",
    foodDrinks: "Food & Drinks",
    groceries: "Groceries",
    transport: "Transport",
    health: "Health",
    shopping: "Shopping",
    entertainment: "Entertainment",
    bills: "Bills",
    education: "Education",
    personalCare: "Personal Care",
    addNewPurchase: "Add New Purchase",
    fillAllFields: "Please fill all fields",
    success: "Success",
    totalExpenses: "Spent Today",
    deletePurchase: "Delete Purchase",
    updatedEveryHour: "Updated every hour",
    errorFetchingRates: "Error fetching rates",
    enterAmountInAnyCurrency: "Enter amount in any currency",
    items: "Items",
    noItemsInBundle: "No items in this bundle.",
    totalCost: "Total Cost",
    noBundlesFound: "No bundles found.",
    edit: "Edit",
    editBundle: "Edit Bundle",
    createNewBundle: "Create New Bundle",
    bundleName: "Bundle Name",
    bundleNamePlaceholder: "e.g., Morning Routine",
    cancelAdding: "Cancel Adding",
    addItemToBundle: "+ Add Item to Bundle",
    itemNamePlaceholder: "Item Name (e.g., Coffee)",
    price: "Price",
    confirmItem: "Confirm Item",
    updateBundle: "Update Bundle",
    confirmCreateBundle: "Confirm & Create Bundle",
    recurring: "RECURRING",
    manual: "MANUAL",
    myBundles: "My Bundles",
    editBudget: "Edit Budget",
    bundlesSubtitle:
      "Manage your recurring purchase sets and optimize your daily spending flow.",
    budgetWarningTitle: "Budget Warning! ⚠️",
    budgetWarningMessage:
      "You are about to exceed your daily budget. Do you really need this purchase? Every bit counts!",
    proceedAnyway: "Force Add",
    saveMyMoney: "Save My Money",
    remainingBudget: "Remaining",
    newTotalAfter: "New total will be",

    "goals.title": "Savings Goals",
    "goals.createTitle": "Create New Goal",
    "goals.editTitle": "Edit Goal",
    "goals.totalSaved": "Total Saved",
    "goals.goalName": "Goal Name",
    "goals.targetAmount": "Target Amount",
    "goals.currentAmount": "Current Amount",
    "goals.targetDate": "Target Date",
    "goals.currency": "Currency",
    "goals.contribute": "Contribute",
    "goals.addContribution": "Add Contribution",
    "goals.contributionAmount": "Contribution Amount",
    "goals.contributionReason": "Reason (Optional)",
    "goals.remaining": "remaining",
    "goals.deleteConfirm": "Are you sure you want to delete this goal?",
    "goals.deleteSuccess": "Goal deleted successfully",
    "goals.createSuccess": "Goal created successfully",
    "goals.updateSuccess": "Goal updated successfully",
    "goals.contributionSuccess": "Contribution added successfully",
    "incomeSavings.title": "Income & Savings",
    "incomeSavings.addEntry": "Add Entry",
    "incomeSavings.editEntry": "Edit Entry",
    "incomeSavings.totalIncome": "Total Income",
    "incomeSavings.totalOutgoing": "Total Outgoing",
    "incomeSavings.sortBy": "Sort by",
    "incomeSavings.sortByDate": "Date",
    "incomeSavings.sortByAmount": "Amount",
    "incomeSavings.type": "Type",
    "incomeSavings.income": "Income",
    "incomeSavings.savings": "Savings",
    "incomeSavings.source": "Source",
    "incomeSavings.amount": "Amount",
    "incomeSavings.notes": "Notes",
    "incomeSavings.regularity": "Regularity",
    "incomeSavings.daily": "Daily",
    "incomeSavings.weekly": "Weekly",
    "incomeSavings.monthly": "Monthly",
    "incomeSavings.yearly": "Yearly",
    "incomeSavings.categories.salary": "Salary",
    "incomeSavings.categories.freelance": "Freelance",
    "incomeSavings.categories.loan": "Loan",
    "incomeSavings.categories.other": "Other",
    "incomeSavings.categories.savings": "Savings",
    "incomeSavings.categories.debt": "Debt",
    "incomeSavings.entryTypes.receive": "Income",
    "incomeSavings.entryTypes.send": "Savings",
    "incomeSavings.deleteConfirm":
      "Are you sure you want to delete this entry?",
    "incomeSavings.deleteSuccess": "Entry deleted successfully",
    "incomeSavings.createSuccess": "Entry created successfully",
    "incomeSavings.updateSuccess": "Entry updated successfully",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.loading": "Loading...",
  },
  ar: {
    editBudget: "تعديل الميزانية",
    appName: "MonoPay",
    home: "الرئيسية",
    explore: "استكشاف",
    wallets: "المحافظ",
    refreshNow: "تحديث الآن",
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
    categories: "الفئات",
    allCategories: "جميع الفئات",
    searchCategories: "ابحث عن فئة...",
    addCustomCategory: "أضف فئة مخصصة",
    customCategoryPlaceholder: "اسم الفئة الجديدة",
    done: "تم",
    add: "إضافة",
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
    next: "التالي",
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
    advertisement: "إعلان",
    goodEvening: "مساء الخير",
    welcomeBack: "مرحباً بعودتك،",
    quickActions: "الإجراءات السريعة",
    savingGoals: "أهداف التوفير",
    insights: "الإحصائيات",
    cards: "البطاقات",
    more: "المزيد",
    totalBalance: "الرصيد الكلي",
    income: "الدخل",
    expenses: "المصروفات",
    features: "الميزات",
    myCards: "بطاقاتي",
    myCardsSubtitle: "إدارة بطاقات الائتمان والخصم",
    exchangeRates: "أسعار الصرف",
    exchangeRatesSubtitle: "عرض أسعار صرف العملات في الوقت الفعلي",
    spendingInsights: "الإحصائيات",
    spendingInsightsSubtitle: "تتبع إنفاقك حسب الفئة",
    transactions: "المعاملات",
    settingsSubtitle: "إدارة تفضيلات حسابك",
    changeLanguage: "تغيير اللغة",
    changePercent: " من الشهر الماضي",
    makeTransaction: "إجراء معاملة",
    sendMoney: "إرسال",
    receiveMoney: "طلب",
    amount: "المبلغ",
    myWallet: "محفظتي",
    selectMyWallet: "اختر محفظتك",
    recipientWallet: "محفظة المستلم",
    selectRecipientWallet: "اختر محفظة المستلم",
    myReceivingWallet: "محفظة الاستقبال",
    selectReceivingWallet: "اختر محفظة للاستقبال",
    recipient: "المستلم",
    selectRecipient: "اختر المستلم",

    payer: "الدافع",
    selectPayer: "من سيدفع؟",
    category: "الفئة",
    selectCategory: "اختر الفئة",
    noteOptional: "ملاحظة (اختياري)",
    notePlaceholder: "أضف ملاحظة...",
    send: "إرسال",
    request: "طلب",
    insufficientFunds: "الرصيد غير كافٍ في المحفظة المختارة.",
    walletInactive: "المحفظة المختارة غير نشطة.",
    senderIsReceiver: "لا يمكنك إرسال المال لنفسك.",
    successSend: "تم إرسال المال بنجاح! 🎉",
    successRequest: "تم إرسال طلب الأموال! ⏳",
    selectWalletFirst: "الرجاء اختيار محفظتك أولاً.",
    fillRequired: "الرجاء ملء جميع الحقول المطلوبة.",
    transfer: "التحويل",
    customization: "التخصيص",
    Youmustselect3features: "يجب اختيار 3 عناصر فقط",
    Youcanonlyselect3features: "يجب اختيار 3 عناصر فقط",
    dailyPurchases: "المشتريات اليومية",
    ofDailyBudget: "من الميزانية اليومية",
    editDailyBudget: "تعديل الميزانية اليومية",
    dailyBudget: "الميزانية اليومية",
    setDailyLimit: "حدد حد الإنفاق اليومي",
    addPurchase: "إضافة عملية شراء",
    fieldRequired: "هذا الحقل مطلوب",
    purchaseAdded: "تمت إضافة عملية الشراء بنجاح!",
    foodDrinks: "طعام ومشروبات",
    groceries: "بقالة",
    transport: "مواصلات",
    health: "صحة",
    shopping: "تسوق",
    entertainment: "ترفيه",
    bills: "فواتير",
    education: "تعليم",
    personalCare: "عناية شخصية",
    addNewPurchase: "إضافة مصروف جديد",
    fillAllFields: "الرجاء ملء جميع الحقول",
    success: "تم بنجاح",
    totalExpenses: "إجمالي المصروفات",
    deletePurchase: "حذف المصروف",
    updatedEveryHour: "يتم التحديث كل ساعة",
    errorFetchingRates: "خطأ في جلب الأسعار",
    enterAmountInAnyCurrency: "أدخل المبلغ بأي عملة",
    items: "العناصر",
    noItemsInBundle: "لا توجد عناصر في هذه الحزمة.",
    totalCost: "التكلفة الإجمالية",
    noBundlesFound: "لم يتم العثور على حزم.",
    edit: "تعديل",
    editBundle: "تعديل الحزمة",
    createNewBundle: "إنشاء حزمة جديدة",
    bundleName: "اسم الحزمة",
    bundleNamePlaceholder: "مثال: روتين الصباح",
    cancelAdding: "إلغاء الإضافة",
    addItemToBundle: "+ إضافة عنصر للحزمة",
    itemNamePlaceholder: "اسم العنصر (مثال: قهوة)",
    price: "السعر",
    confirmItem: "تأكيد العنصر",
    updateBundle: "تحديث الحزمة",
    confirmCreateBundle: "تأكيد وإنشاء الحزمة",
    recurring: "متكرر",
    manual: "يدوي",
    myBundles: "حزمي الخاصة",
    bundlesSubtitle:
      "قم بإدارة مجموعات الشراء المتكررة وحسن تدفق الإنفاق اليومي الخاص بك.",
    budgetWarningTitle: "تنبيه الميزانية! ⚠️",
    budgetWarningMessage:
      "أنت على وشك تجاوز ميزانيتك اليومية. هل هذه العملية ضرورية حقاً؟ كل قرش يهم!",
    proceedAnyway: "إضافة على أي حال",
    saveMyMoney: "وفر أموالي",
    remainingBudget: "المتبقي",
    newTotalAfter: "سيكون الإجمالي الجديد",

    "goals.title": "أهداف التوفير",
    "goals.createTitle": "إنشاء هدف جديد",
    "goals.editTitle": "تعديل الهدف",
    "goals.totalSaved": "إجمالي المدخرات",
    "goals.goalName": "اسم الهدف",
    "goals.targetAmount": "المبلغ المستهدف",
    "goals.currentAmount": "المبلغ الحالي",
    "goals.targetDate": "تاريخ الانتهاء",
    "goals.currency": "العملة",
    "goals.contribute": "ساهم",
    "goals.addContribution": "إضافة مساهمة",
    "goals.contributionAmount": "مبلغ المساهمة",
    "goals.contributionReason": "السبب (اختياري)",
    "goals.remaining": "متبقي",
    "goals.deleteConfirm": "هل أنت متأكد أنك تريد حذف هذا الهدف؟",
    "goals.deleteSuccess": "تم حذف الهدف بنجاح",
    "goals.createSuccess": "تم إنشاء الهدف بنجاح",
    "goals.updateSuccess": "تم تحديث الهدف بنجاح",
    "goals.contributionSuccess": "تمت إضافة المساهمة بنجاح",
    "incomeSavings.title": "الدخل والتوفير",
    "incomeSavings.addEntry": "إضافة إدخال",
    "incomeSavings.editEntry": "تعديل الإدخال",
    "incomeSavings.totalIncome": "إجمالي الدخل",
    "incomeSavings.totalOutgoing": "إجمالي المنصرف",
    "incomeSavings.sortBy": "ترتيب حسب",
    "incomeSavings.sortByDate": "التاريخ",
    "incomeSavings.sortByAmount": "المبلغ",
    "incomeSavings.type": "النوع",
    "incomeSavings.income": "دخل",
    "incomeSavings.savings": "توفير",
    "incomeSavings.source": "المصدر",
    "incomeSavings.amount": "المبلغ",
    "incomeSavings.notes": "ملاحظات",
    "incomeSavings.regularity": "الانتظام",
    "incomeSavings.daily": "يومي",
    "incomeSavings.weekly": "أسبوعي",
    "incomeSavings.monthly": "شهري",
    "incomeSavings.yearly": "سنوي",
    "incomeSavings.categories.salary": "راتب",
    "incomeSavings.categories.freelance": "عمل حر",
    "incomeSavings.categories.loan": "قرض",
    "incomeSavings.categories.other": "آخر",
    "incomeSavings.categories.savings": "توفير",
    "incomeSavings.categories.debt": "دين",
    "incomeSavings.entryTypes.receive": "دخل",
    "incomeSavings.entryTypes.send": "توفير",
    "incomeSavings.deleteConfirm": "هل أنت متأكد أنك تريد حذف هذا الإدخال؟",
    "incomeSavings.deleteSuccess": "تم حذف الإدخال بنجاح",
    "incomeSavings.createSuccess": "تم إنشاء الإدخال بنجاح",
    "incomeSavings.updateSuccess": "تم تحديث الإدخال بنجاح",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.add": "إضافة",
    "common.close": "إغلاق",
    "common.confirm": "تأكيد",
    "common.loading": "جارٍ التحميل...",
  },
};

export function getIsRtl(language: SupportedLanguage) {
  return language === "ar";
}
