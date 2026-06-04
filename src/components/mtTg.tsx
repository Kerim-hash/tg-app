"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

import type { Language, Tab, Plan, UserData, PaymentMethod, Notifications } from "./tma/types";
import { translations, getDefaultLanguage } from "./tma/i18n";
import { apiCall } from "./tma/api";

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

  // ─── Init: auth + language ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    WebApp.ready();
    WebApp.expand();

    // Language from Telegram
    setLanguage(getDefaultLanguage());

    // Prefill user from Telegram SDK
    const tgUser = WebApp.initDataUnsafe.user;
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
    const rawInitData = WebApp.initData;
    const startParam  = WebApp.initDataUnsafe.start_param;

    if (rawInitData) {
      apiCall("/auth/telegram/mini-app", "POST", {
        initData:    rawInitData,
        start_param: startParam || "",
      })
        .then((data) => {
          if (data?.token) localStorage.setItem("iguard_jwt_token", data.token);
          if (data?.user) {
            setUser({
              id:         data.user.id,
              firstName:  data.user.first_name  || data.user.firstName  || tgUser?.first_name  || "User",
              username:   data.user.username     || tgUser?.username,
              photoUrl:   data.user.photo_url    || data.user.photoUrl   || tgUser?.photo_url,
              isPremium:  data.user.is_premium   || data.user.isPremium  || false,
              activePlan: data.user.active_plan,
            });
          }
        })
        .catch(() => {}) // sandbox mode — silently ignore
        .finally(() => setIsLoadingAuth(false));
    } else {
      setIsLoadingAuth(false);
    }
  }, []);

  // ─── Fetch live prices ─────────────────────────────────────────────────────
  useEffect(() => {
    apiCall("/payment/prices/telegram")
      .then((data) => {
        if (Array.isArray(data?.plans) && data.plans.length > 0) {
          setPlans(data.plans);
        }
      })
      .catch(() => {});
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
      const data = await apiCall("/payment/stars/invoice", "POST", {
        planId: selectedPlan.id,
        method: method,
      });

      if (method === "stars" && data?.invoice_url) {
        WebApp.openInvoice(data.invoice_url, (status) => {
          setIsPaying(false);
          if (status === "paid") {
            setPersonalKey(data.personal_key || data.access_key || "");
            setPaymentStatus("success");
          } else {
            setPaymentStatus("error");
          }
        });
      } else {
        // Other methods simulated
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsPaying(false);
        setPersonalKey(data?.personal_key || "KEY-" + Math.random().toString(36).substring(2, 10).toUpperCase());
        setPaymentStatus("success");
      }
    } catch {
      setIsPaying(false);
      setPaymentStatus("error");
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) return;
    triggerHaptic("medium");
    setIsPaying(true);

    try {
      const data = await apiCall("/payment/stars/invoice", "POST", {
        planId: selectedPlan.id,
        method: selectedMethod,
      });

      if (selectedMethod === "stars" && data?.invoice_url) {
        WebApp.openInvoice(data.invoice_url, (status) => {
          setIsPaying(false);
          if (status === "paid") {
            setPersonalKey(data.personal_key || data.access_key || "");
            setShowPayment(false);
            setPaymentStatus("success");
            triggerHaptic("success");
          } else if (status === "failed") {
            setShowPayment(false);
            setPaymentStatus("error");
            triggerHaptic("warning");
          } else {
            triggerHaptic("light"); // cancelled
          }
        });
      } else if (data?.redirect_url) {
        WebApp.openLink(data.redirect_url);
        setIsPaying(false);
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err) {
      console.error("[IGuard] Payment error:", err);
      setIsPaying(false);

      // Detect real Telegram environment
      const isRealTMA =
        typeof window !== "undefined" &&
        (WebApp.platform !== "unknown" ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !!(window as any).Telegram?.WebApp ||
          !!WebApp.initDataUnsafe?.user);

      if (isRealTMA) {
        setShowPayment(false);
        setPaymentStatus("error");
        triggerHaptic("warning");
      } else {
        // Dev sandbox: simulate success so designers can preview the screen
        setPersonalKey("https://t2love.online/s/dFrGSaCp4owLRLL...");
        setShowPayment(false);
        setPaymentStatus("success");
      }
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
      <main style={{ flex: 1, overflowY: "auto", position: "relative", paddingBottom: "110px" }}>
        {currentTab === "home" && (
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
        )}

        {currentTab === "guide" && (
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
        )}

        {currentTab === "profile" && (
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
        )}

        {currentTab === "support" && (
          <SupportScreen
            t={t}
            triggerHaptic={triggerHaptic}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <NavBar
        t={t}
        currentTab={currentTab}
        onTabChange={(tab) => {
          triggerHaptic("light");
          setCurrentTab(tab);
        }}
      />
    </div>
  );
}
