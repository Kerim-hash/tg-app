export type Campaign = "default" | "gaming" | "adults" | "uae";
export type Language = "en" | "ru" | "uz" | "by";
export type Tab = "home" | "guide" | "profile" | "support";
export type PaymentMethod = string;
export type HapticType = "light" | "medium" | "heavy" | "success" | "warning";

export interface Server {
  id: string;
  name: string;
  flag: string;
  ping: number;
  tags: string[];
}

export interface Plan {
  id: string;
  label: string;
  starsPrice: number;
  usdTotal: number;
  usdPerMonth: number;
  rubTotal?: number;
  rubPerMonth?: number;
  periodMonths: number;
  badge?: string;
}

export interface ActivePlan {
  name: string;
  daysLeft: number;
  nextBilling: string;
  isTrial?: boolean;
}

export interface UserData {
  id: number;
  firstName: string;
  username?: string;
  photoUrl?: string;
  isPremium: boolean;
  activePlan?: ActivePlan;
  expiration?: string;
  paymentMethodSaved?: boolean;
  isTrial?: boolean;
  hasUsedTrial?: boolean;
  trialDuration?: number;
  hasPaid?: boolean;
  subscriptionType?: string;
}

export interface Notifications {
  all: boolean;
  news: boolean;
  billing: boolean;
  tech: boolean;
}

export interface ReferralInfo {
  link: string;
  telegram_referral_link: string;
  balance: number;
}

export interface Translations {
  nav: {
    home: string;
    guide: string;
    profile: string;
    support: string;
  };
  home: {
    welcome: string;
    activePlanLabel: string;
    noActivePlan: string;
    daysLeft: (n: number) => string;
    nextBilling: (date: string) => string;
    connectDevice: string;
    buyPlan: string;
    extendPlan: string;
    choosePlan: string;
    moneyBack: string;
    buyFor: (usd: string, stars: number) => string;
    optimizedServers: string;
    perMonth: string;
    thirtyDays: string;
    oneYear: string;
    billedMonthly: string;
    billedYearly: string;
    secureFor: string;
    autoRenewalActive: string;
    autoRenewalDesc: string;
    unsubscribeBtn: string;
    unsubscribeConfirm: string;
    unsubscribeSuccess: string;
    freeTrialAvailableTitle: (days: number) => string;
    freeTrialAvailableSubtitle: string;
    freeTrialPill: string;
    freeTrialBadge: string;
    trialPlanName: string;
  };
  payment: {
    selectMethod: string;
    card: string;
    cardDesc: (price: string) => string;
    crypto: string;
    cryptoDesc: (amount: string) => string;
    stars: string;
    starsDesc: (n: number) => string;
    proceedToPayment: string;
    selectAndPay: string;
    confirmBillingFirst: string;
    confirm: string;
    billingRegion: string;
    regionUAE: string;
    regionUZB: string;
    regionBY: string;
  };
  success: {
    title: string;
    useCode: string;
    readGuide: string;
    copyAndClose: string;
    copied: string;
    noKey: string;
  };
  error: {
    title: string;
    desc: string;
    tryAgain: string;
  };
  profile: {
    title: string;
    manage: string;
    language: string;
    billingRegion: string;
    notifications: string;
    notifAll: string;
    notifAllDesc: string;
    notifNews: string;
    notifNewsDesc: string;
    notifBilling: string;
    notifBillingDesc: string;
    notifTech: string;
    notifTechDesc: string;
    simulateActivePlan: string;
    simulateActivePlanDesc: string;
    referralTitle: string;
    referralBalance: string;
    referralLinkWeb: string;
    referralLinkBot: string;
    referralCopy: string;
    referralCopied: string;
    referralDesc: string;
  };
  guide: {
    title: string;
    subtitle: string;
    withBrand: string;
    step1Title: string;
    visitAppStore: string;
    step2Title: string;
    selectAndBuy: string;
    step3Title: string;
    personalKeyLabel: string;
    personalKeyEmptyState: string;
    copyKey: string;
    copied: string;
    step4Title: string;
    faqTitle: string;
    faq1Question: string;
    faq1Answer: string;
    faq2Question: string;
    faq2Answer: string;
    faq3Question: string;
    faq3Answer: string;
    needHelp: string;
    contactSupport: string;
    btnDownloadAndroid: string;
    btnDownloadIos: string;
    btnDownloadWindows: string;
    btnDownloadMac: string;
  };
  support: {
    title: string;
    subtitle: string;
    subscription: string;
    policy: string;
    troubleshooting: string;
    subQ1: string;
    subA1: string;
    subQ2: string;
    subA2: string;
    subQ3: string;
    subA3: string;
    polQ1: string;
    polA1: string;
    polQ2: string;
    polA2: string;
    polQ3: string;
    polA3: string;
    trQ1: string;
    trA1: string;
    trQ2: string;
    trA2: string;
    trQ3: string;
    trA3: string;
    needHelp: string;
    contactSupport: string;
  };
  successPayment: {
    title: string;
    subtitle: string;
    backBtn: string;
    closeBtn: string;
  };
  reject: {
    title: string;
    subtitle: string;
    backBtn: string;
    closeBtn: string;
  };
  loading: string;
  onboarding: {
    welcome: string;
    showHowWorks: string;
    quickWalkthrough: string;
    start: string;
    readyToGo: string;
    skipTourConnect: string;
    skipAndGo: string;
    welcomeTitle: string;
    welcomeDesc: string;
    next: string;
    skip: string;
    confirm: string;
    useCases: string;
    useCasesTitle: string;
    useCasesDesc: string;
    zoomCalls: string;
    voipMode: string;
    gamingMode: string;
    mode: string;
    bypassBlocks: string;
    serversCount: string;
    wifiSecurity: string;
    alwaysOn: string;
    privateBrowsing: string;
    noLog: string;
    back: string;
    pickPlanTitle: string;
    pickPlanDesc: string;
    bandwidth: string;
    servers50: string;
    moneyBack7: string;
    noLogs: string;
    selectAndBuy: string;
    plans: string;
    client: string;
    key: string;
    connection: string;
    billedMonthly: string;
    billedYearly: string;
    connectTitle: string;
    connectSubtitle: string;
    buyPlanStep: string;
    getAppStep: string;
    pasteKeyStep: string;
    visitAndroidStore: string;
    readySteadyGo: string;
    everythingInOnePlace: string;
    quickReference: string;
    swipeToStart: string;
    startBtn: string;
  };
}
