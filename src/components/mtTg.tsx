"use client";

import { useEffect, useState, useRef } from "react";
import WebApp from "@twa-dev/sdk";
import Intercom from "@intercom/messenger-js-sdk";


import type { Language, Tab, Plan, UserData, PaymentMethod, Notifications, ActivePlan, ReferralInfo, Campaign } from "./tma/types";
import { translations, getDefaultLanguage } from "./tma/i18n";
import { apiCall, safeStorage } from "./tma/api";
import { trackEvent } from "../lib/mixpanel";

import NavBar from "./tma/NavBar";
import HomeScreen from "./tma/HomeScreen";
import PaymentScreen from "./tma/PaymentScreen";
import ErrorScreen from "./tma/ErrorScreen";
import ProfileScreen from "./tma/ProfileScreen";
import GuideScreen from "./tma/GuideScreen";
import SupportScreen from "./tma/SupportScreen";
import OnboardingScreen from "./tma/OnboardingScreen";
import IntercomWidget from "@/lib/intercom";

// ─── Static plan catalog (fallback) ─────────────────────────────────────────
const DEFAULT_PLANS: Plan[] = [];


function parseActivePlan(expirationStr?: string): ActivePlan | undefined {
  if (!expirationStr) return undefined;
  const expDate = new Date(expirationStr);
  const now = new Date();
  if (isNaN(expDate.getTime()) || expDate <= now) {
    return undefined;
  }

  const diffTime = expDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(expDate.getDate()).padStart(2, "0");
  const month = months[expDate.getMonth()];
  const year = expDate.getFullYear();
  const nextBilling = `${day} ${month}, ${year}`;

  const name = daysLeft > 45 ? "1 Year" : "30 days";

  return { name, daysLeft, nextBilling };
}

interface ParsedStartParam {
  campaign: string;
  referral: string | null;
  clickId: string | null;
}

function getRawStartParam(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Try Telegram WebApp SDK
  const tgStartParam = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.start_param;
  if (tgStartParam) return tgStartParam;

  // 2. Try URL Search Params
  const searchParams = new URLSearchParams(window.location.search);
  const startParam = searchParams.get("tgWebAppStartParam") || searchParams.get("startapp") || searchParams.get("campaign");
  if (startParam) return startParam;

  // 3. Try hash parameters
  try {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const tgWebAppData = hashParams.get("tgWebAppData");
      if (tgWebAppData) {
        const decodedData = new URLSearchParams(decodeURIComponent(tgWebAppData));
        const startParamFromData = decodedData.get("start_param");
        if (startParamFromData) return startParamFromData;
      }
    }
  } catch (e) {
    console.error("Error parsing hash params for start_param:", e);
  }

  return null;
}

function parseStartParam(startParam: string | null | undefined): ParsedStartParam {
  if (!startParam) {
    return { campaign: "default", referral: null, clickId: null };
  }

  if (startParam.startsWith("c-")) {
    const firstUnderscore = startParam.indexOf("_");
    if (firstUnderscore === -1) {
      return {
        campaign: startParam.substring(2),
        referral: null,
        clickId: null,
      };
    }

    const campaign = startParam.substring(2, firstUnderscore);
    const rest = startParam.substring(firstUnderscore + 1);

    if (rest.startsWith("_")) {
      return {
        campaign,
        referral: null,
        clickId: rest.substring(1) || null,
      };
    }

    const nextUnderscore = rest.indexOf("_");
    if (nextUnderscore === -1) {
      return {
        campaign,
        referral: rest || null,
        clickId: null,
      };
    }

    return {
      campaign,
      referral: rest.substring(0, nextUnderscore) || null,
      clickId: rest.substring(nextUnderscore + 1) || null,
    };
  }

  // Does not start with "c-"
  const underscore = startParam.indexOf("_");
  if (underscore === -1) {
    return {
      campaign: "default",
      referral: startParam || null,
      clickId: null,
    };
  }

  return {
    campaign: "default",
    referral: startParam.substring(0, underscore) || null,
    clickId: startParam.substring(underscore + 1) || null,
  };
}

function detectCampaign(): Campaign {
  if (typeof window === "undefined") return "default";

  const raw = getRawStartParam();
  const parsed = parseStartParam(raw);

  const val = parsed.campaign;
  if (val === "gaming" || val === "adults") {
    return val as Campaign;
  }
  return "default";
}

function formatReferralLink(originalLink: string, currentCampaign: string): string {
  if (!originalLink || !currentCampaign || currentCampaign === "default") {
    return originalLink;
  }
  try {
    if (originalLink.includes("startapp=")) {
      const url = new URL(originalLink);
      const startapp = url.searchParams.get("startapp");
      if (startapp && !startapp.startsWith("c-")) {
        url.searchParams.set("startapp", `c-${currentCampaign}_${startapp}`);
        return url.toString();
      }
    }
  } catch (e) {
    // String replacement fallback
    if (originalLink.includes("startapp=")) {
      const parts = originalLink.split("startapp=");
      const paramVal = parts[1];
      if (paramVal && !paramVal.startsWith("c-")) {
        return `${parts[0]}startapp=c-${currentCampaign}_${paramVal}`;
      }
    }
  }
  return originalLink;
}

export default function TMA() {
  const [language, setLanguage] = useState<Language>("en");
  const [billingRegion, setBillingRegion] = useState<string>(() => {
    const stored = safeStorage.getItem("iguard_billing_region") || "";
    if (stored === "RU") {
      safeStorage.setItem("iguard_billing_region", "UZB");
      return "UZB";
    }
    return stored;
  });

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);

  useEffect(() => {
    if (!billingRegion) {
      setPaymentMethods([]);
      return;
    }
    setIsLoadingMethods(true);
    apiCall(`/tma/payment/methods?region=${billingRegion}`, "GET")
      .then((data) => {
        if (Array.isArray(data)) {
          setPaymentMethods(data);
        } else {
          setPaymentMethods([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch payment methods:", err);
        setPaymentMethods([]);
      })
      .finally(() => {
        setIsLoadingMethods(false);
      });
  }, [billingRegion]);

  const handleBillingRegionChange = (region: string) => {
    setBillingRegion(region);
    safeStorage.setItem("iguard_billing_region", region);
  };

  const [currentTab, setCurrentTab] = useState<Tab>("home");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [campaign, setCampaign] = useState<Campaign>("default");
  const [intercomFailed, setIntercomFailed] = useState(false);

  const completeOnboarding = () => {
    safeStorage.setItem("iguard_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const handleOpenSupport = () => {
    const w = window as any;
    if (typeof window !== "undefined" && w.Intercom) {
      try {
        w.Intercom('show');
        return;
      } catch (err) {
        console.error("Failed to open Intercom messenger:", err);
      }
    }
    // Fallback if Intercom is blocked or not loaded yet
    window.location.href = "mailto:support@fastguard.site";
  };


  // User
  const [user, setUser] = useState<UserData>({ id: 0, firstName: "User", isPremium: false });

  // Navbar dynamic scroll visibility state
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const lastScrollTopRef = useRef(0);

  // Plans
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Payment flow
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [personalKey, setPersonalKey] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<Notifications>({ all: true, news: true, billing: true, tech: false });
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);

  const handleNotifsChange = async (updated: Notifications) => {
    setNotifs(updated);
    try {
      await apiCall("/users/notifications", "PATCH", {
        all_enabled: updated.all,
        news: updated.news,
        billing: updated.billing,
        tech: updated.tech,
      });
    } catch (err) {
      console.error("[IGuard] Failed to save notification settings:", err);
    }
  };

  const t = translations[language];

  const refreshUserData = async () => {
    let tgUser: any = null;
    try {
      tgUser = WebApp.initDataUnsafe?.user;
    } catch { }

    try {
      const profile = await apiCall("/auth/profile", "GET");
      if (profile) {
        setUser({
          id: profile.id || profile.user_id || tgUser?.id || 0,
          firstName: profile.first_name || profile.firstName || tgUser?.first_name || "User",
          username: profile.username || tgUser?.username,
          photoUrl: profile.photo_url || profile.photoUrl || tgUser?.photo_url,
          isPremium: profile.is_premium || profile.isPremium || false,
          activePlan: profile.active_plan || profile.activePlan || parseActivePlan(profile.expiration),
        });
      }
    } catch (err) {
      console.error("[IGuard] Profile fetch error:", err);
    }

    try {
      const keys = await apiCall("/users/config-keys", "GET");
      if (Array.isArray(keys)) {
        const happKeys = keys.filter((k: any) => k.app === "happ");
        if (happKeys.length > 0) {
          setPersonalKey(happKeys[happKeys.length - 1].key);
        }
      }
    } catch (err) {
      console.error("[IGuard] Fetch config keys error:", err);
    }

    try {
      const notifData = await apiCall("/users/notifications", "GET");
      if (notifData) {
        setNotifs({
          all: notifData.all_enabled ?? true,
          news: notifData.news ?? true,
          billing: notifData.billing ?? true,
          tech: notifData.tech ?? false,
        });
      }
    } catch (err) {
      console.error("[IGuard] Fetch notifications error:", err);
    }

    try {
      const refData = await apiCall("/users/referral/info", "GET");
      if (refData) {
        const formatted = {
          ...refData,
          link: formatReferralLink(refData.link, campaign),
          telegram_referral_link: formatReferralLink(refData.telegram_referral_link, campaign),
        };
        setReferralInfo(formatted);
      }
    } catch (err) {
      console.error("[IGuard] Fetch referral info error:", err);
    }
  };

  // Reset scroll on tab change and ensure navbar is visible
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
    setIsNavbarVisible(true);
  }, [currentTab]);

  // ─── Init: auth + language ─────────────────────────────────────────────────
  const handleInitAuth = () => {
    if (typeof window === "undefined") return;

    let tgUser: any = null;
    let rawInitData = "";

    try {
      WebApp.ready();
      WebApp.expand();
      setLanguage(getDefaultLanguage());
      tgUser = WebApp.initDataUnsafe?.user;
      rawInitData = WebApp.initData;
    } catch (e) {
      console.error("[IGuard] Telegram WebApp SDK initialization failed:", e);
    }

    // Prefill user from Telegram SDK if available
    if (tgUser) {
      setUser({
        id: tgUser.id,
        firstName: tgUser.first_name,
        username: tgUser.username,
        photoUrl: tgUser.photo_url,
        isPremium: tgUser.is_premium || false,
      });
    }

    const runAuth = async (initDataString: string) => {
      setAuthError(null);
      setIsLoadingAuth(true);
      const rawStartParam = getRawStartParam();
      let finalInitData = initDataString;
      if (rawStartParam && !initDataString.includes("start_param=")) {
        const separator = initDataString.includes("&") || initDataString.includes("=") ? "&" : "";
        finalInitData = `${initDataString}${separator}start_param=${encodeURIComponent(rawStartParam)}`;
      }
      apiCall("/auth/telegram/mini-app", "POST", {
        init_data: finalInitData,
      })
        .then(async (data) => {
          if (data?.access_token) {
            safeStorage.setItem("iguard_jwt_token", data.access_token);
            await refreshUserData();
          } else {
            throw new Error("No access token returned");
          }
        })
        .catch((err) => {
          console.error("[IGuard] Auth error:", err);
          setAuthError(err.message || "Auth failed");
        })
        .finally(() => setIsLoadingAuth(false));
    };

    if (rawInitData && rawInitData !== "string") {
      runAuth(rawInitData);
    } else {
      console.warn("[IGuard] App is running outside Telegram or initData is missing.");
      setAuthError("Please open this app inside Telegram");
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    handleInitAuth();

    // Detect campaign from referral link or start param
    const detected = detectCampaign();
    setCampaign(detected);

    const completed = safeStorage.getItem("iguard_onboarding_completed");
    if (completed !== "true") {
      setShowOnboarding(true);
    }
  }, []);


  // Update Intercom user attributes when user state changes
  useEffect(() => {
    if ((window as any).Intercom) {
      (window as any).Intercom("update", {
        user_id: user?.id ? String(user.id) : undefined,
        name: user?.firstName,
        custom_data: {
          username: user?.username || "",
          isPremium: user?.isPremium || false,
        }
      });
    }
  }, [user]);

  // ─── Fetch live prices ─────────────────────────────────────────────────────
  useEffect(() => {
    apiCall("/payment/prices/telegram")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedPlans = data.map((price: any) => {
            let periodMonths = price.period || 1;
            if (price.period_types === "year") {
              periodMonths = (price.period || 1) * 12;
            } else if (price.period_types === "day" || price.period_types === "days") {
              periodMonths = (price.period || 30) / 30;
            }

            const usdTotal = (price.amount_usd || 0) / 100;
            const usdPerMonth = periodMonths > 0 ? usdTotal / periodMonths : usdTotal;
            const rubTotal = (price.amount_rub || 0) / 100;
            const rubPerMonth = periodMonths > 0 ? rubTotal / periodMonths : rubTotal;

            return {
              id: String(price.id),
              label: price.name || `${price.period} ${price.period_types || 'month'}`,
              starsPrice: price.amount_stars || 0,
              usdTotal: usdTotal,
              usdPerMonth: usdPerMonth,
              rubTotal: rubTotal,
              rubPerMonth: rubPerMonth,
              periodMonths: periodMonths,
              badge: price.description || (price.period_types === "year" ? "Best Value" : undefined)
            };
          });
          setPlans(mappedPlans);
        }
      })
      .catch((err) => {
        console.error("[IGuard] Fetch prices error:", err);
      });
  }, []);

  // ─── Haptic ───────────────────────────────────────────────────────────────
  const triggerHaptic = (type: "light" | "medium" | "heavy" | "success" | "warning") => {
    try {
      if (type === "success" || type === "warning") {
        WebApp.HapticFeedback.notificationOccurred(type);
      } else {
        WebApp.HapticFeedback.impactOccurred(type);
      }
    } catch { /* not available outside Telegram */ }
  };

  // ─── Payment flow ─────────────────────────────────────────────────────────
  const handleProceedPayment = async (method: PaymentMethod) => {
    if (!selectedPlan) return;
    setSelectedMethod(method);
    triggerHaptic("medium");
    setIsPaying(true);

    try {
      if (method === "stars") {
        trackEvent("telegram_stars_flow_viewed", { amount_stars: selectedPlan.starsPrice || 0, plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year" });
        const data = await apiCall("/payment/stars/invoice", "POST", {
          price_id: Number(selectedPlan.id),
        });

        if (data?.invoice_url) {
          WebApp.openInvoice(data.invoice_url, (status) => {
            setIsPaying(false);
            if (status === "paid") {
              trackEvent("payment_success", { plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year", method: "stars", amount: selectedPlan.starsPrice || 0, currency: "STARS" });
              if (showOnboarding) {
                completeOnboarding();
              }
              handleReset();
              triggerHaptic("success");
              refreshUserData();
            } else if (status === "failed") {
              trackEvent("payment_error", { plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year", method: "stars", error_type: "telegram_failed" });
              triggerHaptic("warning");
              setPaymentStatus("error");
            } else {
              handleReset();
            }
          });
        } else {
          throw new Error("No invoice URL returned");
        }
      }
      const foundDynamic = paymentMethods.find((m) => m.method_type === method);
      if (foundDynamic) {
        const data = await apiCall("/payment/link", "POST", {
          merchant: foundDynamic.method_type,
          paymentMethodType: foundDynamic.merchant_method_type,
          planId: Number(selectedPlan.id),
          userId: String(user.id),
        });

        setIsPaying(false);
        const link = data?.link || data?.invoice_url;
        if (link) {
          trackEvent("payment_external_opened", { method: foundDynamic.method_type, amount: selectedPlan.usdTotal, opens_new_tab: true });
          WebApp.openLink(link);
          if (showOnboarding) {
            completeOnboarding();
          }
          handleReset();
        } else {
          throw new Error("No payment link returned from server");
        }
      } else if (method === "card" || method === "crypto") {
        const merchant = method === "card" ? "PAYPAL" : "cryptocloud";
        const data = await apiCall("/payment/link", "POST", {
          merchant: merchant,
          paymentMethodType: merchant,
          planId: Number(selectedPlan.id),
          userId: String(user.id),
        });

        setIsPaying(false);
        const link = data?.link || data?.invoice_url;
        if (link) {
          trackEvent("payment_external_opened", { method: merchant, amount: selectedPlan.usdTotal, opens_new_tab: true });
          WebApp.openLink(link);
          if (showOnboarding) {
            completeOnboarding();
          }
          handleReset();
        } else {
          throw new Error("No payment link returned from server");
        }
      } else {
        // Other methods simulated
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsPaying(false);
        if (showOnboarding) {
          completeOnboarding();
        }
        handleReset();
      }
    } catch (err) {
      console.error("[IGuard] Payment error:", err);
      trackEvent("payment_error", { plan: selectedPlan?.periodMonths === 1 ? "30_days" : "1_year", method: method, error_type: "exception" });
      setIsPaying(false);
      triggerHaptic("warning");
      setPaymentStatus("error");
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) return;
    triggerHaptic("medium");
    setIsPaying(true);

    try {
      const foundDynamic = paymentMethods.find((m) => m.method_type === selectedMethod);
      if (selectedMethod === "stars") {
        trackEvent("telegram_stars_flow_viewed", { amount_stars: selectedPlan.starsPrice || 0, plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year" });
        const data = await apiCall("/payment/stars/invoice", "POST", {
          price_id: Number(selectedPlan.id),
        });

        if (data?.invoice_url) {
          WebApp.openInvoice(data.invoice_url, (status) => {
            setIsPaying(false);
            if (status === "paid") {
              trackEvent("payment_success", { plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year", method: "stars", amount: selectedPlan.starsPrice || 0, currency: "STARS" });
              if (showOnboarding) {
                completeOnboarding();
              }
              handleReset();
              triggerHaptic("success");
              refreshUserData();
            } else if (status === "failed") {
              trackEvent("payment_error", { plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year", method: "stars", error_type: "telegram_failed" });
              triggerHaptic("warning");
              setPaymentStatus("error");
            } else {
              handleReset();
            }
          });
        } else {
          throw new Error("No payment URL returned");
        }
      } else if (foundDynamic) {
        const data = await apiCall("/payment/link", "POST", {
          merchant: foundDynamic.method_type,
          paymentMethodType: foundDynamic.merchant_method_type,
          planId: Number(selectedPlan.id),
          userId: String(user.id),
        });

        setIsPaying(false);
        const link = data?.link || data?.invoice_url;
        if (link) {
          trackEvent("payment_external_opened", { method: foundDynamic.method_type, amount: selectedPlan.usdTotal, opens_new_tab: true });
          WebApp.openLink(link);
          if (showOnboarding) {
            completeOnboarding();
          }
          handleReset();
        } else {
          throw new Error("No payment link returned from server");
        }
      } else if (selectedMethod === "card" || selectedMethod === "crypto") {
        const merchant = selectedMethod === "card" ? "PAYPAL" : "cryptocloud";
        const data = await apiCall("/payment/link", "POST", {
          merchant: merchant,
          paymentMethodType: merchant,
          planId: Number(selectedPlan.id),
          userId: String(user.id),
        });

        setIsPaying(false);
        const link = data?.link || data?.invoice_url;
        if (link) {
          trackEvent("payment_external_opened", { method: merchant, amount: selectedPlan.usdTotal, opens_new_tab: true });
          WebApp.openLink(link);
          if (showOnboarding) {
            completeOnboarding();
          }
          handleReset();
        } else {
          throw new Error("No payment link returned from server");
        }
      } else {
        // Other methods simulated
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsPaying(false);
        if (showOnboarding) {
          completeOnboarding();
        }
        handleReset();
      }
    } catch (err) {
      console.error("[IGuard] Payment error:", err);
      trackEvent("payment_error", { plan: selectedPlan?.periodMonths === 1 ? "30_days" : "1_year", method: selectedMethod, error_type: "exception" });
      setIsPaying(false);
      triggerHaptic("warning");
      setPaymentStatus("error");
    }
  };

  const handleReset = () => {
    setPaymentStatus("idle");
    setSelectedMethod(null);
    setShowPayment(false);
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (isLoadingAuth) {
    return (
      <div
        style={{
          height: "100%",
          background: "#090B0E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "480px",
          margin: "0 auto",
          fontFamily: "var(--font-onest), sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.08)",
              borderTop: "2px solid #00D1FF",
              animation: "tma-spin 0.8s linear infinite",
            }}
          />
          <p
            style={{
              fontSize: "10px",
              color: "#8A94A6",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 600,
              margin: 0,
              animation: "tma-pulse 1.5s ease-in-out infinite",
            }}
          >
            {t.loading}
          </p>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes tma-spin  { to { transform: rotate(360deg); } }
            @keyframes tma-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
          `,
        }} />
      </div>
    );
  }

  if (authError) {
    const authDesc = language === "ru"
      ? "Произошла ошибка при авторизации. Попробуйте снова."
      : language === "uz"
        ? "Avtorizatsiyadan o'tishda xatolik yuz berdi. Qayta urinib ko'ring."
        : language === "by"
          ? "Адбылася памылка пры аўтарызацыі. Паспрабуйце зноў."
          : "Authentication failed. Please try again.";
    return (
      <ErrorScreen
        t={t}
        desc={authDesc}
        onRetry={handleInitAuth}
      />
    );
  }

  if (paymentStatus === "error") {
    return (
      <ErrorScreen
        t={t}
        onRetry={() => { handleReset(); setShowPayment(true); }}
      />
    );
  }
  if (showOnboarding) {
    return (
      <>
        <OnboardingScreen
          t={t}
          language={language}
          onComplete={() => {
            safeStorage.setItem("iguard_onboarding_completed", "true");
            setShowOnboarding(false);
          }}
          plans={plans}
          triggerHaptic={triggerHaptic}
          personalKey={personalKey}
          campaign={campaign}
          onSelectPlanForPayment={(planId) => {
            const targetPlan = plans.find((p) => p.id === planId);
            if (targetPlan) {
              setSelectedPlan(targetPlan);
              setShowPayment(true);
            }
          }}
        />
        {showPayment && selectedPlan && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#000", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "480px", height: "100%", position: "relative" }}>
              <PaymentScreen
                t={t}
                language={language}
                plan={selectedPlan}
                selectedMethod={selectedMethod}
                onSelectMethod={setSelectedMethod}
                onProceed={handlePayment}
                onBack={() => setShowPayment(false)}
                isPaying={isPaying}
                triggerHaptic={triggerHaptic}
                paymentMethods={paymentMethods}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── Main app shell ───────────────────────────────────────────────────────
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#000000",
        color: "#fff",
        maxWidth: "480px",
        margin: "0 auto",
        overflow: "hidden",
        fontFamily: "var(--font-onest), sans-serif",
        position: "relative",
      }}
    >
      <IntercomWidget appId="ljq492l3" />
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes screenFade {
            from { opacity: 0; transform: scale(0.99); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-screen-fade {
            animation: screenFade 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `,
      }} />
      <main
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          if (scrollTop > lastScrollTopRef.current && scrollTop > 60) {
            setIsNavbarVisible(false);
          } else if (scrollTop < lastScrollTopRef.current) {
            setIsNavbarVisible(true);
          }
          lastScrollTopRef.current = scrollTop;
        }}
        style={{ flex: 1, overflowY: "auto", position: "relative", paddingBottom: "110px" }}
      >
        {currentTab === "home" && (
          <div className="animate-screen-fade">
            <HomeScreen
              t={t}
              user={user}
              plans={plans}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              triggerHaptic={triggerHaptic}
              onTabChange={setCurrentTab}
              personalKey={personalKey}
              onProceedPayment={handleProceedPayment}
              isPaying={isPaying}
              billingRegion={billingRegion}
              onBillingRegionChange={handleBillingRegionChange}
              paymentMethods={paymentMethods}
            />
          </div>
        )}

        {currentTab === "guide" && (
          <div className="animate-screen-fade">
            <GuideScreen
              t={t}
              personalKey={personalKey}
              onOpenSupportForm={handleOpenSupport}
              triggerHaptic={triggerHaptic}
              plans={plans}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              onProceedPayment={handleProceedPayment}
              isPaying={isPaying}
              billingRegion={billingRegion}
              onBillingRegionChange={handleBillingRegionChange}
              paymentMethods={paymentMethods}
            />
          </div>
        )}

        {currentTab === "profile" && (
          <div className="animate-screen-fade">
            <ProfileScreen
              t={t}
              user={user}
              language={language}
              onLanguageChange={setLanguage}
              notifs={notifs}
              onNotifsChange={handleNotifsChange}
              referralInfo={referralInfo}
              triggerHaptic={triggerHaptic}
              billingRegion={billingRegion}
              onBillingRegionChange={handleBillingRegionChange}
              onDropdownOpenChange={setIsDropdownOpen}
              onResetOnboarding={() => {
                safeStorage.removeItem("iguard_onboarding_completed");
                setShowOnboarding(true);
              }}
            />
          </div>
        )}

        {currentTab === "support" && (
          <div className="animate-screen-fade">
            <SupportScreen
              t={t}
              triggerHaptic={triggerHaptic}
              language={language}
              onOpenSupportForm={handleOpenSupport}
            />
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <NavBar
        t={t}
        currentTab={currentTab}
        isVisible={isNavbarVisible && !isDropdownOpen}
        onResetOnboarding={() => {
          safeStorage.removeItem("iguard_onboarding_completed");
          setShowOnboarding(true);
        }}
        triggerHaptic={triggerHaptic}
        onTabChange={(tab) => {
          triggerHaptic("light");
          setCurrentTab(tab);
          setIsNavbarVisible(true);
        }}
      />


      {/* Payment screen overlay */}
      {showPayment && selectedPlan && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1000, background: "#000" }}>
          <PaymentScreen
            t={t}
            language={language}
            plan={selectedPlan}
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            onProceed={handlePayment}
            onBack={() => setShowPayment(false)}
            isPaying={isPaying}
            triggerHaptic={triggerHaptic}
            paymentMethods={paymentMethods}
          />
        </div>
      )}
    </div>
  );
}
