"use client";

import { useEffect, useState, useRef } from "react";
import WebApp from "@twa-dev/sdk";

import type { Language, Tab, Plan, UserData, PaymentMethod, Notifications, ActivePlan, ReferralInfo } from "./tma/types";
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
import SupportFormDrawer from "./tma/SupportFormDrawer";

// ─── Static plan catalog (fallback) ─────────────────────────────────────────
const DEFAULT_PLANS: Plan[] = [
  {
    id: "1",
    label: "30 days",
    starsPrice: 1,
    usdTotal: 10.00,
    usdPerMonth: 10.00,
    rubTotal: 299,
    rubPerMonth: 299,
    periodMonths: 1,
    badge: "Best Monthly",
  },
  {
    id: "2",
    label: "3 months",
    starsPrice: 1,
    usdTotal: 30.00,
    usdPerMonth: 10.00,
    rubTotal: 799,
    rubPerMonth: 266.33,
    periodMonths: 3,
    badge: "Popular",
  },
  {
    id: "3",
    label: "6 months",
    starsPrice: 1,
    usdTotal: 60.00,
    usdPerMonth: 10.00,
    rubTotal: 1399,
    rubPerMonth: 233.17,
    periodMonths: 6,
    badge: "Great Value",
  },
  {
    id: "4",
    label: "1 Year",
    starsPrice: 1,
    usdTotal: 96.00,
    usdPerMonth: 8.00,
    rubTotal: 2149,
    rubPerMonth: 179.08,
    periodMonths: 12,
    badge: "Best Value",
  },
];


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

// ─── Component ───────────────────────────────────────────────────────────────
export default function TMA() {
  // Core
  const [language, setLanguage] = useState<Language>("en");
  const [currentTab, setCurrentTab] = useState<Tab>("home");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // User
  const [user, setUser] = useState<UserData>({ id: 0, firstName: "User", isPremium: false });

  // Navbar dynamic scroll visibility state
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
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
  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);

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
      const keys = await apiCall("/users/config-keys/uk", "GET");
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
        setReferralInfo(refData);
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
      apiCall("/auth/telegram/mini-app", "POST", {
        init_data: initDataString,
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
  }, []);

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
          handleReset();
        } else {
          throw new Error("No payment link returned from server");
        }
      } else {
        // Other methods simulated
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsPaying(false);
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
          handleReset();
        } else {
          throw new Error("No payment link returned from server");
        }
      } else {
        // Other methods simulated
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsPaying(false);
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
      : language === "es"
      ? "Error de autenticación. Inténtelo de nuevo."
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

  // ─── Payment method selection ─────────────────────────────────────────────
  if (showPayment && selectedPlan) {
    return (
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
      />
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
            />
          </div>
        )}

        {currentTab === "guide" && (
          <div className="animate-screen-fade">
            <GuideScreen
              t={t}
              personalKey={personalKey}
              onOpenSupportForm={() => setIsSupportFormOpen(true)}
              triggerHaptic={triggerHaptic}
              plans={plans}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              onProceedPayment={handleProceedPayment}
              isPaying={isPaying}
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
            />
          </div>
        )}

        {currentTab === "support" && (
          <div className="animate-screen-fade">
            <SupportScreen
              t={t}
              triggerHaptic={triggerHaptic}
              language={language}
              onOpenSupportForm={() => setIsSupportFormOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <NavBar
        t={t}
        currentTab={currentTab}
        isVisible={isNavbarVisible}
        onTabChange={(tab) => {
          triggerHaptic("light");
          setCurrentTab(tab);
          setIsNavbarVisible(true);
        }}
      />

      <SupportFormDrawer
        t={t}
        language={language}
        triggerHaptic={triggerHaptic}
        isOpen={isSupportFormOpen}
        onClose={() => setIsSupportFormOpen(false)}
      />
    </div>
  );
}
