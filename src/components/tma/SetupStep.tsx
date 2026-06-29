"use client";

import React from "react";
import GradientBlock from "../GradientBlock";
import SwipeSlider from "./SwipeSlider";

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.98543 17.9453C5.43867 17.9306 3.33203 12.7318 3.33203 10.0842C3.33203 5.75929 6.57644 4.81245 7.82681 4.81245C8.3903 4.81245 8.99199 5.03374 9.5227 5.22956C9.89381 5.36615 10.2776 5.50716 10.4911 5.50716C10.6189 5.50716 10.92 5.38721 11.1858 5.28196C11.7527 5.05627 12.4582 4.77576 13.2797 4.77576C13.2812 4.77576 13.2831 4.77576 13.2846 4.77576C13.898 4.77576 15.7579 4.91038 16.8761 6.58962L17.138 6.98323L16.7611 7.26768C16.2225 7.67402 15.2399 8.41524 15.2399 9.88349C15.2399 11.6225 16.3527 12.2912 16.8874 12.6129C17.1234 12.7548 17.3676 12.9012 17.3676 13.2214C17.3676 13.4305 15.6992 17.9194 13.2762 17.9194C12.6834 17.9194 12.2643 17.7412 11.8947 17.584C11.5206 17.4249 11.198 17.2878 10.6648 17.2878C10.3946 17.2878 10.0529 17.4156 9.69107 17.5512C9.19667 17.7357 8.63705 17.9453 8.00208 17.9453H7.98543Z" fill="black" />
    <path d="M13.539 0.833374C13.6021 3.10859 11.975 4.68703 10.3497 4.58803C10.0819 2.77233 11.9748 0.833374 13.539 0.833374Z" fill="black" />
  </svg>
);

const AndroidIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 18c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1s1-.45 1-1v-3h4v3c0 .55.45 1 1 1s1-.45 1-1v-3h1c.55 0 1-.45 1-1V11H6v7zM16 8l1.41-1.41c.2-.2.2-.51 0-.71a.498.498 0 0 0-.7 0L15.17 7.42A8.914 8.914 0 0 0 12 6.8c-1.15 0-2.25.22-3.17.62L7.29 5.88c-.2-.2-.51-.2-.7 0a.498.498 0 0 0 0 .7L8 8C5.55 9.4 4.09 11.96 4.01 14.93h15.98C19.9 11.96 18.45 9.4 16 8zm-6.5 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="black" />
  </svg>
);

import type { HapticType } from "./types";

interface SetupStepProps {
  language: string;
  campaign: string;
  t: any;
  isAndroid: boolean;
  planPurchased: boolean;
  activeKey: string;
  copied: boolean;
  onCopy: () => void;
  onComplete: () => void;
  onSelectPlanForPayment?: (planId: string) => void;
  onboardingPlans: any[];
  tempSelectedPlanId: string;
  setTempSelectedPlanId: (id: string) => void;
  selectedPlan: any;
  triggerHaptic: (type: HapticType) => void;
  trackEvent: (eventName: string, params?: any) => void;
  getPlanLabelText: (periodMonths: number, lang: string) => string;
  getBilledFrequencyText: (periodMonths: number, lang: string, t: any) => string;
  setupTexts: {
    title: string;
    subtitle: string;
    step3: string;
    bottomNote: string;
  };
}

export default function SetupStep({
  language,
  campaign,
  t,
  isAndroid,
  planPurchased,
  activeKey,
  copied,
  onCopy,
  onComplete,
  onSelectPlanForPayment,
  onboardingPlans,
  tempSelectedPlanId,
  setTempSelectedPlanId,
  selectedPlan,
  triggerHaptic,
  trackEvent,
  getPlanLabelText,
  getBilledFrequencyText,
  setupTexts,
}: SetupStepProps) {
  return (
    <div className="w-full flex flex-col box-border flex-1">
      <h2 className="text-[24px] text-center text-white m-0 mb-1.5 leading-tight font-sans">
        {setupTexts.title}
      </h2>

      <p className="text-[16px] max-w-[320px] mx-auto text-center text-white/40 m-0 mb-6 leading-relaxed font-sans">
        {setupTexts.subtitle}
      </p>

      {campaign === "gaming" || campaign === "adults" ? (
        <div className="flex flex-col flex-1 justify-between mt-4 box-border">
          {/* 4 steps timeline container */}
          <div className="flex flex-col w-full mt-2 mb-5">
            {/* Step 1 */}
            <div className="flex relative pb-6">
              {/* Left Column */}
              <div className="w-[34px] flex flex-col items-center shrink-0">
                <div className="w-[34px] h-[34px] rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[14px] text-white font-mono">
                  1
                </div>
                <div className="absolute left-[17px] top-9 bottom-0.5 w-0 border-l-2 border-dotted border-white/15" />
              </div>
              {/* Right Column */}
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-[15px] text-white font-normal font-sans leading-tight">
                  {isAndroid
                    ? (language === "ru" ? "Скачайте iGuard в Google Play" : language === "es" ? "Descarga iGuard de Play Store" : "Download iGuard from Play Store")
                    : (language === "ru" ? "Скачайте iGuard в App Store" : language === "es" ? "Descarga iGuard de App Store" : "Download iGuard from App Store")}
                </span>
                <span className="text-[13px] text-brand-gray mt-1 font-sans">
                  {language === "ru" ? "1 мин" : "1 min"}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex relative pb-6">
              {/* Left Column */}
              <div className="w-[34px] flex flex-col items-center shrink-0">
                <div className="w-[34px] h-[34px] rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[14px] text-white font-mono">
                  2
                </div>
                <div className="absolute left-[17px] top-9 bottom-0.5 w-0 border-l-2 border-dotted border-white/15" />
              </div>
              {/* Right Column */}
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-[15px] text-white font-normal font-sans leading-tight">
                  {language === "ru" ? "Выберите тариф, оплатите картой, криптовалютой или Stars" : language === "es" ? "Elige un plan, paga con tarjeta, criptomonedas o Stars" : "Pick a plan, pay with card, crypto or Stars"}
                </span>
                <span className="text-[13px] text-brand-gray mt-1 font-sans">
                  {language === "ru" ? "30 сек" : language === "es" ? "30 s" : "30 secs"}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex relative pb-6">
              {/* Left Column */}
              <div className="w-[34px] flex flex-col items-center shrink-0">
                <div className="w-[34px] h-[34px] rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[14px] text-white font-mono">
                  3
                </div>
                <div className="absolute left-[17px] top-9 bottom-0.5 w-0 border-l-2 border-dotted border-white/15" />
              </div>
              {/* Right Column */}
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-[15px] text-white font-normal font-sans leading-tight">
                  {setupTexts.step3}
                </span>
                <span className="text-[13px] text-brand-gray mt-1 font-sans">
                  {language === "ru" ? "20 сек" : language === "es" ? "20 s" : "20 secs"}
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex relative">
              {/* Left Column */}
              <div className="w-[34px] flex flex-col items-center shrink-0">
                <div className="w-[34px] h-[34px] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3346 6.66663H16.668C17.1282 6.66663 17.5013 7.03972 17.5013 7.49996V16.6666L14.7236 14.359C14.5739 14.2347 14.3856 14.1666 14.191 14.1666H7.5013C7.04106 14.1666 6.66797 13.7935 6.66797 13.3333V10.8333" stroke="#666666" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 3.33337H3.33333C2.8731 3.33337 2.5 3.70647 2.5 4.16671V13.3334L5.27774 11.0257C5.42736 10.9014 5.61574 10.8334 5.81025 10.8334H12.5C12.9602 10.8334 13.3333 10.4603 13.3333 10V4.16671C13.3333 3.70647 12.9602 3.33337 12.5 3.33337Z" fill="#666666" stroke="#666666" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* Right Column */}
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-[15px] text-white font-normal font-sans leading-tight">
                  {language === "ru" ? "Нужна помощь? Загляните в руководство или напишите в поддержку" : language === "es" ? "¿Necesitas ayuda? Consulta la pestaña Guía o contacta al soporte" : "Need help? Check the Guide tab or contact support"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom slider area */}
          <div className="flex flex-col gap-5 w-full mt-auto pb-2.5 ">
            <p className="text-[14px] max-w-[280px] mx-auto text-white/40 text-center m-0 leading-relaxed font-sans">
              {setupTexts.bottomNote}
            </p>

            <SwipeSlider
              onComplete={onComplete}
              text={language === "ru" ? "ПРОВЕДИТЕ ДЛЯ НАЧАЛА" : language === "es" ? "DESLIZA PARA EMPEZAR" : "SWIPE TO START"}
              triggerHaptic={triggerHaptic}
            />
          </div>
        </div>
      ) : (
        // Guide checklist steps
        <div className="flex flex-col gap-4 w-full">
          {/* Step 1: Buy a plan */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 items-center">
              <div className="w-[34px] h-[34px] rounded-xl bg-brand-dark-gray flex items-center justify-center text-[14px] text-white shrink-0 font-mono">
                {planPurchased ? (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4.5L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : "1"}
              </div>
              <span className={`text-[16px] font-sans ${planPurchased ? "text-white/40" : "text-white"}`}>
                {t.onboarding.buyPlanStep}
              </span>
            </div>

            {/* Plans card block */}
            {!planPurchased && (
              <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-3 w-full box-border">
                  {onboardingPlans.map((plan) => {
                    const isYearly = plan.periodMonths === 12;
                    const isActive = tempSelectedPlanId === plan.id;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          triggerHaptic("light");
                          setTempSelectedPlanId(plan.id);
                          const planType = plan.periodMonths === 12 ? "1_year" : plan.periodMonths === 1 ? "30_days" : `${plan.periodMonths}_months`;
                          const priceVal = plan.usdTotal ?? 0;
                          trackEvent("onboarding_plan_selected", { plan: planType, price: priceVal });
                        }}
                        className="w-full h-[170px] rounded-[45px] relative cursor-pointer overflow-hidden select-none"
                      >
                        <GradientBlock
                          label=""
                          primaryColor={isYearly ? "#5B1B85" : "#cfdfe5"}
                          secondaryColor={isYearly ? "#7F96D0" : "#606768"}
                          baseColor={isYearly ? "#5B1B85" : "#08090a"}
                          borderRadius="45px"
                          height="100%"
                          animate={isYearly}
                          glowIntensity={isYearly ? 1.2 : 0.25}
                          borderGlow={true}
                          solidGradient={isYearly ? "#5B1B85" : undefined}
                          solidBoxShadow={isYearly ? "inset 0 0 24px 0 rgba(230, 252, 255, 0.7), inset 0 0 24px -22px rgba(230, 252, 255, 0.1), inset 0 -35px 65px -1px rgba(64, 209, 253, 1), inset 0 48px 67px -56px rgba(93, 28, 137, 1)" : undefined}
                          enableHoverScale={false}
                          absoluteChildren={true}
                        >
                          {isActive && (
                            <div className="absolute inset-0 border-2 border-white rounded-[45px] pointer-events-none z-30" />
                          )}

                          <div className="absolute inset-0 flex flex-col justify-between p-4 px-3 pb-5 z-20 pointer-events-none box-border text-center items-center">
                            <span
                              className={`inline-block text-[11px] py-1.5 px-3.5 rounded-[20px] text-white font-sans ${isYearly ? "bg-black/16" : "bg-white/8"
                                }`}
                            >
                              {getPlanLabelText(plan.periodMonths, language)}
                            </span>

                            <div>
                              <span className={`block text-[28px] text-white leading-none font-sans ${language === "ru" ? "text-[24px]" : ""}`}>
                                {`$ ${plan.usdPerMonth.toFixed(2)}`}
                              </span>
                              <span className={`block text-[10px] mt-0.5 font-sans ${isYearly ? "text-white/85" : "text-[#8A94A6]"}`}>
                                {t.home.perMonth}
                              </span>
                            </div>

                            <span className={`block text-[11px] font-sans ${isYearly ? "text-[#E0F2FE] opacity-90" : "text-[#8A94A6]"}`}>
                              {getBilledFrequencyText(plan.periodMonths, language, t)}
                            </span>
                          </div>
                        </GradientBlock>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center mt-1">
                  <button
                    onClick={() => {
                      if (!tempSelectedPlanId) {
                        triggerHaptic("warning");
                        return;
                      }
                      triggerHaptic("medium");
                      trackEvent("onboarding_plans_cta_clicked", {});
                      if (onSelectPlanForPayment) {
                        onSelectPlanForPayment(tempSelectedPlanId);
                      }
                    }}
                    className={`cursor-pointer font-mono text-[12px] px-6 py-2.5 rounded-[14px] transition-all duration-250 ease-in-out ${selectedPlan
                        ? "bg-white text-black border-none"
                        : "bg-white/2 text-white border border-white/20"
                      }`}
                  >
                    {selectedPlan
                      ? t.home.buyFor(
                        `${selectedPlan.usdTotal % 1 === 0 ? selectedPlan.usdTotal : selectedPlan.usdTotal.toFixed(2)}$`,
                        selectedPlan.starsPrice
                      ).toUpperCase()
                      : t.onboarding.selectAndBuy.toUpperCase()}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dotted separator */}
          <div className="h-[1px] bg-[repeating-linear-gradient(to_right,#999999_0px,#999999_2px,transparent_2px,transparent_8px)] my-1" />

          {/* Step 2: Get the app */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 items-center">
              <div className="w-[34px] h-[34px] rounded-xl bg-brand-dark-gray flex items-center justify-center text-[14px] text-white shrink-0 font-mono">
                2
              </div>
              <span className="text-[16px] text-white font-sans">
                {t.onboarding.getAppStep}
              </span>
            </div>

            <div className="flex justify-center w-full mt-1">
              {isAndroid ? (
                <button
                  onClick={() => {
                    triggerHaptic("medium");
                    trackEvent("onboarding_connect_playstore_clicked", {});
                    window.open("https://play.google.com", "_blank");
                  }}
                  className="my-1 mx-auto w-fit flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] bg-white text-black text-[12px] cursor-pointer border-none font-mono"
                >
                  <AndroidIcon />
                  {t.onboarding.visitAndroidStore}
                </button>
              ) : (
                <button
                  onClick={() => {
                    triggerHaptic("medium");
                    trackEvent("onboarding_connect_appstore_clicked", {});
                    window.open("https://apps.apple.com/us/app/happ-proxy-utility/id6504287215", "_blank");
                  }}
                  className="my-1 mx-auto w-fit flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] bg-white text-black text-[12px] cursor-pointer border-none font-mono"
                >
                  <AppleIcon />
                  {t.guide.visitAppStore}
                </button>
              )}
            </div>
          </div>

          {/* Dotted separator */}
          <div className="h-[1px] bg-[repeating-linear-gradient(to_right,#999999_0px,#999999_2px,transparent_2px,transparent_8px)] my-1" />

          {/* Step 3: Paste your key */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 items-center">
              <div className="w-[34px] h-[34px] rounded-xl bg-brand-dark-gray flex items-center justify-center text-[14px] text-white shrink-0 font-mono">
                3
              </div>
              <span className="text-[16px] text-white font-sans">
                {setupTexts.step3}
              </span>
            </div>

            <div className="flex flex-col gap-3 w-full mt-1">
              <GradientBlock
                label=""
                primaryColor="#cfdfe5"
                secondaryColor="#686F70"
                baseColor="#1D1C1B"
                borderRadius="30px"
                height="85px"
                animate={false}
                glowIntensity={0.6}
                borderGlow={true}
                enableMouseTracking={false}
                enableHoverScale={false}
                contentAlign="start"
                padding="12px 28px"
              >
                <span className="text-[13px] text-[#8E8E93] font-sans">
                  {t.guide.personalKeyLabel}
                </span>
                <span className="block w-full text-[16px] text-white font-sans whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
                  {activeKey}
                </span>
              </GradientBlock>

              <div className="flex justify-center">
                <button
                  onClick={onCopy}
                  className={`font-mono text-[12px] px-6 py-3 rounded-[14px] cursor-pointer transition-all duration-200 ease-in-out ${copied ? "bg-white/8 border border-white/12 text-white/40" : "bg-white border-none text-black"
                    }`}
                >
                  {copied ? "✓ " + t.guide.copied.toUpperCase() : t.guide.copyKey.toUpperCase()}
                </button>
              </div>
            </div>
          </div>

          {campaign !== "default" && (
            <div className="flex flex-col gap-5 w-full mt-4">
              <p className="text-[12px] text-white/40 text-center m-0 leading-relaxed font-sans">
                {setupTexts.bottomNote}
              </p>

              <SwipeSlider
                onComplete={onComplete}
                text={language === "ru" ? "ПРОВЕДИТЕ ДЛЯ НАЧАЛА" : language === "es" ? "DESLIZA PARA EMPEZAR" : "SWIPE TO START"}
                triggerHaptic={triggerHaptic}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
