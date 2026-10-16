"use client";

import { useEffect, useMemo, useState } from "react";
import type { Plan, Language, Translations, HapticType, Campaign } from "./types";
import type { FirstPurchaseDiscount } from "./discount";
import { applyDiscountToPlan } from "./discount";
import { trackEvent } from "../../lib/mixpanel";
import { TopBar, formatTrialDate } from "./OnboardingUi";

import WelcomeStep from "./WelcomeStep";
import TrialStep from "./TrialStep";
import KeyStep from "./KeyStep";
import PaywallStep from "./PaywallStep";

interface OnboardingScreenProps {
  t: Translations;
  language: Language;
  onComplete: () => void;
  onOpenGuide?: () => void;
  plans: Plan[];
  triggerHaptic: (type: HapticType) => void;
  personalKey?: string;
  onSelectPlanForPayment?: (planId: string) => void;
  campaign?: Campaign;
  expiration?: string;
  isTrial?: boolean;
  trialDays?: number;
  firstPurchaseDiscount?: FirstPurchaseDiscount | null;
}

// Four screens: welcome → trial → key → paywall
const SCREENS = ["welcome", "trial", "key", "paywall"] as const;
const DEFAULT_TRIAL_DAYS = 30;

export default function OnboardingScreen({
  t,
  language,
  onComplete,
  onOpenGuide,
  plans,
  triggerHaptic,
  personalKey,
  onSelectPlanForPayment,
  campaign = "default",
  expiration,
  isTrial,
  trialDays,
  firstPurchaseDiscount,
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [copied, setCopied] = useState(false);

  const days = trialDays && trialDays > 0 ? trialDays : DEFAULT_TRIAL_DAYS;

  // Trial end: the backend expiration when the trial is already running, otherwise today + N days
  const trialEndText = useMemo(() => {
    const fromExpiration = expiration ? new Date(expiration) : null;
    const end =
      fromExpiration && !isNaN(fromExpiration.getTime()) && fromExpiration > new Date()
        ? fromExpiration
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return formatTrialDate(end, language);
  }, [expiration, days, language]);

  const monthPlan = plans.find((p) => p.periodMonths === 1);
  const yearPlanRaw = plans.find((p) => p.periodMonths === 12) ?? plans[plans.length - 1];
  const yearPlan = yearPlanRaw
    ? applyDiscountToPlan(yearPlanRaw, firstPurchaseDiscount?.percent ?? 0)
    : undefined;

  const activeKey = personalKey || "";

  useEffect(() => {
    trackEvent("onboarding_started", { campaign });
  }, [campaign]);

  useEffect(() => {
    trackEvent("onboarding_step_viewed", {
      step: currentStep + 1,
      screen_name: SCREENS[currentStep] ?? "unknown",
      campaign,
    });
  }, [currentStep, campaign]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.disableVerticalSwipe) {
        (window as any).Telegram.WebApp.disableVerticalSwipe();
      }
    } catch (e) {
      console.warn("Failed to disable vertical swipe:", e);
    }
  }, []);

  const goTo = (step: number) => {
    setDirection(step > currentStep ? "next" : "prev");
    setCurrentStep(step);
  };

  const finish = (reason: string) => {
    trackEvent("onboarding_completed", { campaign, reason });
    onComplete();
  };

  const handleClose = () => {
    triggerHaptic("medium");
    trackEvent("onboarding_dropped", { last_screen: SCREENS[currentStep] ?? "unknown", campaign });
    onComplete();
  };

  const handleBack = () => {
    triggerHaptic("light");
    trackEvent("onboarding_back_clicked", { screen_name: SCREENS[currentStep], campaign });
    goTo(Math.max(0, currentStep - 1));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeKey);
    setCopied(true);
    triggerHaptic("success");
    trackEvent("access_key_copied", { step: currentStep + 1, source: "onboarding" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-black text-white max-w-[480px] mx-auto overflow-hidden relative box-border">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes onbSlideInFromRight {
              from { opacity: 0; transform: translateX(30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes onbSlideInFromLeft {
              from { opacity: 0; transform: translateX(-30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            .onb-slide-right { animation: onbSlideInFromRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .onb-slide-left { animation: onbSlideInFromLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />

      {currentStep === 0 ? (
        <TopBar mode="close" label={t.onboarding.close} onClick={handleClose} />
      ) : (
        <TopBar mode="back" label={t.onboarding.navBack} onClick={handleBack} />
      )}

      <div
        key={currentStep}
        className={`${direction === "next" ? "onb-slide-right" : "onb-slide-left"} flex-1 flex flex-col min-h-0`}
      >
        {currentStep === 0 && (
          <WelcomeStep
            t={t}
            trialDays={days}
            onContinue={() => {
              triggerHaptic("medium");
              trackEvent("onboarding_welcome_cta_clicked", { campaign });
              goTo(1);
            }}
          />
        )}

        {currentStep === 1 && (
          <TrialStep
            t={t}
            trialDays={days}
            trialEndText={trialEndText}
            onActivate={() => {
              triggerHaptic("success");
              trackEvent("onboarding_trial_activate_clicked", { campaign, trial_days: days });
              goTo(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <KeyStep
            t={t}
            trialEndText={trialEndText}
            trialActive={!!isTrial}
            activeKey={activeKey}
            copied={copied}
            onCopy={handleCopy}
            onOpenGuide={() => {
              triggerHaptic("medium");
              trackEvent("onboarding_instruction_clicked", { campaign });
              finish("guide");
              onOpenGuide?.();
            }}
            onNext={() => {
              triggerHaptic("light");
              trackEvent("onboarding_key_next_clicked", { campaign });
              if (yearPlan) goTo(3);
              else finish("no_plans");
            }}
          />
        )}

        {currentStep === 3 && yearPlan && (
          <PaywallStep
            t={t}
            yearPlan={yearPlan}
            monthPlan={monthPlan}
            onBuyYear={() => {
              triggerHaptic("medium");
              trackEvent("onboarding_paywall_buy_clicked", {
                campaign,
                plan_id: yearPlanRaw?.id,
                discount_percent: firstPurchaseDiscount?.percent ?? 0,
              });
              if (yearPlanRaw && onSelectPlanForPayment) {
                onSelectPlanForPayment(yearPlanRaw.id);
              } else {
                finish("buy_unavailable");
              }
            }}
            onLater={() => {
              triggerHaptic("light");
              trackEvent("onboarding_paywall_later_clicked", { campaign });
              finish("later");
            }}
          />
        )}
      </div>
    </div>
  );
}
