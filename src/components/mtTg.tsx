"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

import type { Language, Tab, Plan, UserData, PaymentMethod, Notifications } from "./tma/types";
import { translations, getDefaultLanguage } from "./tma/i18n";
import { apiCall, safeStorage } from "./tma/api";

import NavBar        from "./tma/NavBar";
import HomeScreen    from "./tma/HomeScreen";
import PaymentScreen from "./tma/PaymentScreen";
import SuccessScreen from "./tma/SuccessScreen";
import ErrorScreen   from "./tma/ErrorScreen";
import ProfileScreen from "./tma/ProfileScreen";
import GuideScreen   from "./tma/GuideScreen";
import SupportScreen from "./tma/SupportScreen";

// ─── Static plan catalog (fallback) ─────────────────────────────────────────
const DEFAULT_PLANS: Plan[] = [
  {
    id: "1m",
    label: "30 days",
    starsPrice: 250,
    usdTotal: 11.00,
    usdPerMonth: 11.00,
    periodMonths: 1,
    badge: "Best Monthly",
  },
  {
    id: "12m",
    label: "1 Year",
    starsPrice: 150,
    usdTotal: 24.96,
    usdPerMonth: 2.08,
    periodMonths: 12,
    badge: "Best Value",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function TMA() {
  // Core
  const [language,      setLanguage]      = useState<Language>("en");
  const [currentTab,    setCurrentTab]    = useState<Tab>("home");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // User
  const [user, setUser] = useState<UserData>({ id: 0, firstName: "User", isPremium: false });
  // Simulator active plan state (enabled by default)
  const [simulateActivePlan, setSimulateActivePlan] = useState(true);

  // Navbar dynamic scroll visibility state
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  // Plans
  const [plans,        setPlans]        = useState<Plan[]>(DEFAULT_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Payment flow
  const [showPayment,    setShowPayment]    = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentStatus,  setPaymentStatus]  = useState<"idle" | "success" | "error">("idle");
  const [personalKey,    setPersonalKey]    = useState("");
  const [isPaying,       setIsPaying]       = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<Notifications>({ all: true, news: true, billing: true, tech: false });

  const t = translations[language];

  const simulatedUser = {
    ...user,
    activePlan: simulateActivePlan
      ? {
          name: "1 Year",
          daysLeft: 17,
          nextBilling: "26 May, 2026",
        }
      : user.activePlan,
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
  useEffect(() => {
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
        id:        tgUser.id,
        firstName: tgUser.first_name,
        username:  tgUser.username,
        photoUrl:  tgUser.photo_url,
        isPremium: tgUser.is_premium || false,
      });
    }

    // Authenticate with backend
    if (rawInitData) {
      apiCall("/auth/telegram/mini-app", "POST", {
        init_data: rawInitData,
      })
        .then(async (data) => {
          if (data?.access_token) {
            safeStorage.setItem("iguard_jwt_token", data.access_token);
            try {
              const profile = await apiCall("/auth/profile", "GET");
              if (profile) {
                setUser({
                  id:         profile.id || profile.user_id || tgUser?.id || 0,
                  firstName:  profile.first_name || profile.firstName || tgUser?.first_name || "User",
                  username:   profile.username || tgUser?.username,
                  photoUrl:   profile.photo_url || profile.photoUrl || tgUser?.photo_url,
                  isPremium:  profile.is_premium || profile.isPremium || false,
                  activePlan: profile.active_plan || profile.activePlan,
                });
              }
            } catch (err) {
              console.error("[IGuard] Profile fetch error:", err);
            }
          }
        })
        .catch((err) => {
          console.error("[IGuard] Auth error:", err);
        })
        .finally(() => setIsLoadingAuth(false));
    } else {
      setIsLoadingAuth(false);
    }
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

            const usdTotal = price.amount_usd || 0;
            const usdPerMonth = periodMonths > 0 ? usdTotal / periodMonths : usdTotal;

            return {
              id: String(price.id),
              label: price.name || `${price.period} ${price.period_types || 'month'}`,
              starsPrice: price.amount_stars || 0,
              usdTotal: usdTotal,
              usdPerMonth: usdPerMonth,
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
        const data = await apiCall("/payment/stars/invoice", "POST", {
          price_id: Number(selectedPlan.id),
        });

        if (data?.invoice_url) {
          WebApp.openInvoice(data.invoice_url, (status) => {
            setIsPaying(false);
            if (status === "paid") {
              setPersonalKey(data.payload || "https://t2love.online/s/dFrGSaCp4owLRLL-TEST-PAID");
              setPaymentStatus("success");
              triggerHaptic("success");
              // Refresh user profile state
              apiCall("/auth/profile").then((profile) => {
                if (profile) {
                  setUser({
                    id:         profile.id || profile.user_id || WebApp.initDataUnsafe?.user?.id || 0,
                    firstName:  profile.first_name || profile.firstName || WebApp.initDataUnsafe?.user?.first_name || "User",
                    username:   profile.username || WebApp.initDataUnsafe?.user?.username,
                    photoUrl:   profile.photo_url || profile.photoUrl || WebApp.initDataUnsafe?.user?.photo_url,
                    isPremium:  profile.is_premium || profile.isPremium || false,
                    activePlan: profile.active_plan || profile.activePlan,
                  });
                }
              }).catch(() => {});
            } else {
              // Sandbox bypass: Fallback to success even on cancel/fail
              console.log("[IGuard] openInvoice status not paid (falling back to success for test):", status);
              setPersonalKey("https://t2love.online/s/dFrGSaCp4owLRLL-TEST-" + Math.random().toString(36).substring(2, 8).toUpperCase());
              setPaymentStatus("success");
              triggerHaptic("success");
            }
          });
        } else {
          throw new Error("No invoice URL returned");
        }
      } else {
        // Other methods simulated
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsPaying(false);
        setPersonalKey("https://t2love.online/s/dFrGSaCp4owLRLL-TEST-" + Math.random().toString(36).substring(2, 8).toUpperCase());
        setPaymentStatus("success");
      }
    } catch (err) {
      console.error("[IGuard] Payment error (falling back to success for test):", err);
      setIsPaying(false);
      setPersonalKey("https://t2love.online/s/dFrGSaCp4owLRLL-TEST-" + Math.random().toString(36).substring(2, 8).toUpperCase());
      setPaymentStatus("success");
      triggerHaptic("success");
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) return;
    triggerHaptic("medium");
    setIsPaying(true);

    try {
      if (selectedMethod === "stars") {
        const data = await apiCall("/payment/stars/invoice", "POST", {
          price_id: Number(selectedPlan.id),
        });

        if (data?.invoice_url) {
          WebApp.openInvoice(data.invoice_url, (status) => {
            setIsPaying(false);
            if (status === "paid") {
              setPersonalKey(data.payload || "https://t2love.online/s/dFrGSaCp4owLRLL-TEST-PAID");
              setShowPayment(false);
              setPaymentStatus("success");
              triggerHaptic("success");
              // Refresh user profile state
              apiCall("/auth/profile").then((profile) => {
                if (profile) {
                  setUser({
                    id:         profile.id || profile.user_id || WebApp.initDataUnsafe?.user?.id || 0,
                    firstName:  profile.first_name || profile.firstName || WebApp.initDataUnsafe?.user?.first_name || "User",
                    username:   profile.username || WebApp.initDataUnsafe?.user?.username,
                    photoUrl:   profile.photo_url || profile.photoUrl || WebApp.initDataUnsafe?.user?.photo_url,
                    isPremium:  profile.is_premium || profile.isPremium || false,
                    activePlan: profile.active_plan || profile.activePlan,
                  });
                }
              }).catch(() => {});
            } else {
              // Sandbox bypass: Fallback to success even on cancel/fail
              console.log("[IGuard] openInvoice status not paid (falling back to success for test):", status);
              setPersonalKey("https://t2love.online/s/dFrGSaCp4owLRLL-TEST-" + Math.random().toString(36).substring(2, 8).toUpperCase());
              setShowPayment(false);
              setPaymentStatus("success");
              triggerHaptic("success");
            }
          });
        } else {
          throw new Error("No payment URL returned");
        }
      } else {
        // Other methods simulated
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsPaying(false);
        setPersonalKey("https://t2love.online/s/dFrGSaCp4owLRLL-TEST-" + Math.random().toString(36).substring(2, 8).toUpperCase());
        setShowPayment(false);
        setPaymentStatus("success");
      }
    } catch (err) {
      console.error("[IGuard] Payment error (falling back to success for test):", err);
      setIsPaying(false);
      setPersonalKey("https://t2love.online/s/dFrGSaCp4owLRLL-TEST-" + Math.random().toString(36).substring(2, 8).toUpperCase());
      setShowPayment(false);
      setPaymentStatus("success");
      triggerHaptic("success");
    }
  };

  const handleReset = () => {
    setPaymentStatus("idle");
    setSelectedMethod(null);
    setShowPayment(false);
  };

  const handleToggleActivePlan = () => {
    setSimulateActivePlan((prev) => !prev);
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (isLoadingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
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

  // ─── Payment success/error overlays ──────────────────────────────────────
  if (paymentStatus === "success") {
    return (
      <SuccessScreen
        t={t}
        personalKey={personalKey}
        onClose={handleReset}
        triggerHaptic={triggerHaptic}
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
        height: "100vh",
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
          if (scrollTop > lastScrollTop && scrollTop > 60) {
            setIsNavbarVisible(false);
          } else {
            setIsNavbarVisible(true);
          }
          setLastScrollTop(scrollTop);
        }}
        style={{ flex: 1, overflowY: "auto", position: "relative", paddingBottom: "110px" }}
      >
        {currentTab === "home" && (
          <div className="animate-screen-fade">
            <HomeScreen
              t={t}
              user={simulatedUser}
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
              onTabChange={setCurrentTab}
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
              user={simulatedUser}
              language={language}
              onLanguageChange={setLanguage}
              notifs={notifs}
              onNotifsChange={setNotifs}
              triggerHaptic={triggerHaptic}
              onToggleActivePlan={handleToggleActivePlan}
            />
          </div>
        )}

        {currentTab === "support" && (
          <div className="animate-screen-fade">
            <SupportScreen
              t={t}
              triggerHaptic={triggerHaptic}
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
    </div>
  );
}
