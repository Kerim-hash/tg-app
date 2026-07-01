"use client";

import React from "react";
import GradientBlock from "../GradientBlock";

import type { HapticType } from "./types";

interface ChoosePlanStepProps {
  language: string;
  campaign: string;
  t: any;
  plansTexts: {
    title: string;
    desc: string;
  };
  onboardingPlans: any[];
  tempSelectedPlanId: string;
  setTempSelectedPlanId: (id: string) => void;
  onSelectPlanForPayment?: (id: string) => void;
  selectedPlan: any;
  triggerHaptic: (type: HapticType) => void;
  trackEvent: (eventName: string, params?: any) => void;
  getPlanLabelText: (periodMonths: number, lang: string) => string;
  getBilledFrequencyText: (periodMonths: number, lang: string, t: any) => string;
}

const DICT: Record<string, {
  underCards: string;
  cryptoNote: string;
  cardNote: string;
  includedInBoth: string;
  whatsAlwaysIncluded: string;
  pains: { title: string; desc: string }[];
}> = {
  en: {
    underCards: "No logs · 50+ servers · 7-day refund ·\nUnlimited bandwidth",
    cryptoNote: "with Crypto, Telegram Stars, or Card",
    cardNote: "with Card, Crypto, or Telegram Stars",
    includedInBoth: "Included in both",
    whatsAlwaysIncluded: "What's always included",
    pains: [
      { title: "Unlimited bandwidth", desc: "No throttling, ever" },
      { title: "50+ server locations", desc: "Find the fastest node for any game" },
      { title: "7-day money-back", desc: "Not for you? Full refund, no questions" },
      { title: "Gaming mode", desc: "Optimised routing for game traffic" },
    ]
  },
  ru: {
    underCards: "Без логов · 50+ серверов · 7 дней гарантия ·\nБезлимитный трафик",
    cryptoNote: "с помощью Crypto, Telegram Stars или Карты",
    cardNote: "с помощью Карты, Crypto или Telegram Stars",
    includedInBoth: "Включено в оба",
    whatsAlwaysIncluded: "Что всегда включено",
    pains: [
      { title: "Безлимитный трафик", desc: "Никаких ограничений скорости" },
      { title: "50+ локаций серверов", desc: "Найдите самый быстрый узел для любой игры" },
      { title: "7 дней гарантии возврата", desc: "Не понравилось? Вернем деньги без лишних вопросов" },
      { title: "Игровой режим", desc: "Оптимизированная маршрутизация игрового трафика" },
    ]
  },
  uz: {
    underCards: "Loglarsiz · 50+ serverlar · 7 kunlik kafolat ·\nCheksiz tarmoq kengligi",
    cryptoNote: "Crypto, Telegram Stars yoki Karta yordamida",
    cardNote: "Karta, Crypto yoki Telegram Stars yordamida",
    includedInBoth: "Har ikkisiga kiritilgan",
    whatsAlwaysIncluded: "Nimalar har doim kiritilgan",
    pains: [
      { title: "Cheksiz trafik", desc: "Tezlik cheklovlarisiz" },
      { title: "50+ server joylashuvlari", desc: "Har qanday o'yin uchun eng tezkor tugunni toping" },
      { title: "7 kunlik qaytarish kafolati", desc: "Yoqmadimi? Savollarsiz pulni qaytaramiz" },
      { title: "O'yin rejimi", desc: "O'yin trafigi uchun optimallashtirilgan marshrutlash" },
    ]
  },
  by: {
    underCards: "Без логаў · 50+ сервераў · 7 дзён гарантыі ·\nНеабмежаваная прапускная здольнасць",
    cryptoNote: "з дапамогай Crypto, Telegram Stars або Карты",
    cardNote: "з дапамогай Карты, Crypto или Telegram Stars",
    includedInBoth: "Уключана ў абодва",
    whatsAlwaysIncluded: "Што заўсёды ўключана",
    pains: [
      { title: "Безлімітны трафік", desc: "Ніякіх абмежаванняў хуткасці" },
      { title: "50+ лакацый сервераў", desc: "Знайдзіце самы хуткі вузел для любой гульні" },
      { title: "7 дзён гарантыі вяртання", desc: "Не спадабалася? Вернем грошы без лішніх пытанняў" },
      { title: "Гульнявы рэжым", desc: "Аптымізаваная маршрутызацыя гульнявога трафіку" },
    ]
  }
};

export default function ChoosePlanStep({
  language,
  campaign,
  t,
  plansTexts,
  onboardingPlans,
  tempSelectedPlanId,
  setTempSelectedPlanId,
  onSelectPlanForPayment,
  selectedPlan,
  triggerHaptic,
  trackEvent,
  getPlanLabelText,
  getBilledFrequencyText,
}: ChoosePlanStepProps) {
  const currentDict = DICT[language] || DICT.en;

  return (
    <div className="w-full flex flex-col box-border">
      <h2 className="text-[24px] text-center text-white m-0 mb-1.5 leading-tight font-sans">
        {plansTexts.title}
      </h2>

      <p className="text-[16px] text-center text-white/40 m-0 mb-10 leading-relaxed font-sans">
        {plansTexts.desc}
      </p>

      {/* Plans List */}
      <div className="grid grid-cols-2 gap-2.5 w-full box-border">
        {onboardingPlans.map((plan) => {
          const isYearly = plan.periodMonths === 12;
          const isActive = tempSelectedPlanId === plan.id;

          const primaryColor = (isYearly ? "#501B77" : "#cfdfe5");

          const secondaryColor = (isYearly ? "#7F96D0" : "#606768");

          const baseColor = (isYearly ? "#5B1B85" : "#08090a");

          const solidGradient = (isYearly ? "#5B1B85" : undefined);
          const solidBoxShadow = (isYearly ? "inset 0 0 24px 0 rgba(230, 252, 255, 0.7), inset 0 0 24px -22px rgba(230, 252, 255, 0.1), inset 0 -35px 65px -1px rgba(64, 209, 253, 1), inset 0 48px 67px -56px rgba(93, 28, 137, 1)" : undefined);

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
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                baseColor={baseColor}
                borderRadius="45px"
                height="100%"
                animate={isYearly}
                glowIntensity={isYearly ? 1.2 : 0.25}
                borderGlow={true}
                enableMouseTracking={false}
                solidGradient={solidGradient}
                solidBoxShadow={solidBoxShadow}
                enableHoverScale={false}
                absoluteChildren={true}
              >
                {/* White Border Overlay when Selected */}
                {isActive && (
                  <div className="absolute inset-0 border-2 border-white rounded-[45px] pointer-events-none z-30" />
                )}

                <div className="absolute inset-0 flex flex-col justify-between p-4 px-3 pb-5 z-20 pointer-events-none box-border text-center items-center">
                  {/* Plan title badge */}
                  <span
                    className={`inline-block text-[11px] py-1.5 px-3.5 rounded-[20px] text-white font-sans ${campaign === "adults"
                      ? "bg-white/15"
                      : (isYearly ? "bg-black/16" : "bg-white/8")
                      }`}
                  >
                    {getPlanLabelText(plan.periodMonths, language)}
                  </span>

                  <div>
                    <span
                      className={`block text-[28px] text-white leading-none font-sans ${language === "ru" ? "text-[24px]" : ""
                        }`}
                    >
                      {`$ ${plan.usdPerMonth.toFixed(2)}`}
                    </span>
                    <span
                      className={`block text-[10px] mt-0.5 font-sans ${isYearly ? "text-white/85" : "text-[#8A94A6]"
                        }`}
                    >
                      {t.home.perMonth}
                    </span>
                  </div>

                  <span
                    className={`block text-[11px] font-sans ${isYearly ? "text-[#E0F2FE] opacity-90" : "text-[#8A94A6]"
                      }`}
                  >
                    {getBilledFrequencyText(plan.periodMonths, language, t)}
                  </span>
                </div>
              </GradientBlock>
            </div>
          );
        })}
      </div>

      {
        campaign === "adults" ? (
          <>
            {/* Under-cards texts */}
            <div className="mt-6 text-center text-white text-[14px] font-sans leading-relaxed font-normal whitespace-pre-line">
              {currentDict.underCards}
            </div>

            <div className="mt-4 text-center text-white/40 text-[13px] font-sans">
              {currentDict.cryptoNote}
            </div>

            {/* SELECT AND BUY Button */}
            <div className="flex justify-center mt-6 w-full">
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
                className={`cursor-pointer font-mono text-[14px] px-4 py-3 rounded-[12px] transition-all duration-250 ease-in-out ${selectedPlan
                  ? "bg-white text-black border-none"
                  : "bg-transparent text-white border border-white/30"
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
          </>
        ) : (
          <>
            {/* SELECT AND BUY Button */}
            <div className="flex justify-center mt-7.5 w-full">
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
                className={`cursor-pointer font-mono text-[14px] px-6 py-2.5 rounded-[14px] transition-all duration-250 ease-in-out ${selectedPlan
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

            {campaign === "gaming" && (
              <div className="mt-5 text-center text-white/40 text-[14px] font-sans">
                {currentDict.cardNote}
              </div>
            )}

            {campaign === "gaming" ? (
              /* Gaming campaign: Included in both section */
              <div className="mt-10 w-full px-1 box-border">
                <h4 className="text-[18px] text-white m-0 mb-[10px] font-sans">
                  {currentDict.includedInBoth}
                </h4>

                <div className="flex flex-col gap-4 mt-3">
                  {currentDict.pains.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 9.99989L8.53553 13.5354L15.6066 6.46436" stroke="white" strokeLinecap="square" />
                      </svg>

                      <div className="flex flex-col">
                        <span className="text-white text-[14px] font-sans font-normal leading-tight">
                          {item.title}
                        </span>
                        <span className="text-white/40 text-[12px] font-sans mt-0.5 leading-tight">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* What's always included Checklist */
              <div className="mt-7.5 w-full px-1 box-border">
                <h4 className="text-[14px] text-white m-0 mb-3 font-sans">
                  {currentDict.whatsAlwaysIncluded}
                </h4>

                <div className="flex flex-col gap-2.5 mt-3">
                  {[
                    t.onboarding.bandwidth,
                    t.onboarding.servers50,
                    t.onboarding.moneyBack7,
                    t.onboarding.noLogs
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.707031 4.24269L4.24257 7.77822L11.3136 0.707153" stroke="white" strokeOpacity={0.4} strokeLinecap="square" />
                      </svg>

                      <span className="text-white/50 text-[14px] font-sans font-normal">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      }
    </div >
  );
}
