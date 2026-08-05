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
      <div className="flex justify-center gap-2.5 w-full box-border">
        {onboardingPlans.map((plan) => {
          const isYearly = plan.periodMonths === 12;
          const isActive = tempSelectedPlanId === plan.id;

          const monthlyPlan = onboardingPlans.find((p) => p.periodMonths === 1);
          const yearlyOriginalTotal = monthlyPlan ? monthlyPlan.usdPerMonth * 12 : undefined;
          const yearlyDiscountPercent = yearlyOriginalTotal
            ? Math.round((1 - plan.usdTotal / yearlyOriginalTotal) * 100)
            : undefined;

          const primaryColor = (isYearly ? "#501B77" : "#cfdfe5");

          const secondaryColor = (isYearly ? "#7F96D0" : "#606768");

          const baseColor = "#000000";

          const solidGradient = "#000000";
          const solidBoxShadow = isYearly
            ? "inset 0 -106px 33.5px -56px rgba(93, 28, 137, 0.9), inset 0 -37px 31.3px -1px rgba(64, 209, 253, 0.6), inset 0 0 12.3px -22px rgba(230, 252, 255, 0.1), inset 0 0 9.85px 0 rgba(230, 252, 255, 0.7)"
            : "inset 0 -70px 24px -50px rgba(255, 255, 255, 0.06)";

          return (
            <div
              key={plan.id}
              onClick={() => {
                if (tempSelectedPlanId === plan.id) {
                  triggerHaptic("medium");
                  trackEvent("onboarding_plans_cta_clicked", { trigger: "double_click" });
                  if (onSelectPlanForPayment) {
                    onSelectPlanForPayment(plan.id);
                  }
                } else {
                  triggerHaptic("light");
                  setTempSelectedPlanId(plan.id);
                  const planType = plan.periodMonths === 12 ? "1_year" : plan.periodMonths === 1 ? "30_days" : `${plan.periodMonths}_months`;
                  const priceVal = plan.usdTotal ?? 0;
                  trackEvent("onboarding_plan_selected", { plan: planType, price: priceVal });
                }
              }}
              className="w-[170px] h-[170px] shrink-0 rounded-[45px] relative cursor-pointer overflow-hidden select-none"
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
                {/* Border Overlay when Selected */}
                {isActive && (
                  <div className="absolute inset-0 border-2 border-white rounded-[45px] pointer-events-none z-30" />
                )}

                {/* RadioButton */}
                <div className="absolute top-[15px] right-[15px] w-6 h-6 z-30 pointer-events-none flex items-center justify-center">
                  {isActive ? (
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.0625 4.59608L4.59803 8.13161L11.6691 1.06055" stroke="black" strokeWidth="1.5" strokeLinecap="square" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-white/40" />
                  )}
                </div>

                <div className="absolute inset-0 flex flex-col items-center z-20 pointer-events-none box-border text-center">
                  {/* Plan title label */}
                  <span
                    className="mt-[25px] font-mono text-[12px] leading-none tracking-[-0.06em] text-center"
                    style={{ color: isYearly ? "#40D1FD" : "#8A94A6" }}
                  >
                    {getPlanLabelText(plan.periodMonths, language)}
                  </span>

                  <div className="relative mt-[27px] flex flex-col items-center">
                    <span
                      className={`block text-[24px] leading-[31px] text-white font-sans ${language === "ru" || language === "by" || language === "uz" ? "text-[20px]" : ""
                        }`}
                    >
                      {isYearly ? (
                        `$ ${plan.usdTotal.toFixed(2)}`
                      ) : (
                        `$ ${plan.usdPerMonth.toFixed(2)}`
                      )}
                    </span>
                    {isYearly && yearlyOriginalTotal ? (
                      <span className="block text-[18px] leading-[23px] mt-0 font-sans text-white/40 line-through">
                        $ {yearlyOriginalTotal.toFixed(0)}
                      </span>
                    ) : !isYearly ? (
                      <span className="block text-[10px] mt-0.5 font-sans text-[#8A94A6]">
                        {t.home.perMonth}
                      </span>
                    ) : null}
                  </div>

                  {!isYearly && (
                    <span className="block text-[11px] mt-1 font-sans text-[#8A94A6]">
                      {getBilledFrequencyText(plan.periodMonths, language, t)}
                    </span>
                  )}

                  {isYearly && yearlyDiscountPercent && yearlyDiscountPercent > 0 ? (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center py-2 px-2.5 rounded-t-[12px] bg-[#40D1FD]">
                      <span className="font-mono text-[12px] leading-none tracking-[-0.06em] text-black text-center">
                        {language === "ru" ? `Скидка ${yearlyDiscountPercent}%` :
                          language === "by" ? `Зніжка ${yearlyDiscountPercent}%` :
                          language === "uz" ? `${yearlyDiscountPercent}% chegirma` :
                          `${yearlyDiscountPercent}% save`}
                      </span>
                    </div>
                  ) : null}
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
            <div className="flex flex-col items-center mt-6 w-full relative group">
              <button
                disabled={!tempSelectedPlanId}
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
                className={`font-mono text-[14px] px-4 py-3 rounded-[12px] transition-all duration-250 ease-in-out ${tempSelectedPlanId
                  ? "bg-white text-black cursor-pointer hover:bg-white/90 border-none"
                  : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                  }`}
              >
                {selectedPlan
                  ? t.home.buyFor(
                    `${selectedPlan.usdTotal % 1 === 0 ? selectedPlan.usdTotal : selectedPlan.usdTotal.toFixed(2)}$`,
                    selectedPlan.starsPrice
                  ).toUpperCase()
                  : t.onboarding.selectAndBuy.toUpperCase()}
              </button>
              {!tempSelectedPlanId && (
                <div className="absolute bottom-full mb-2 bg-[#1A1A1A] border border-white/10 text-white text-[12px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {language === "ru" ? "Выберите план" : language === "uz" ? "Rejani tanlang" : language === "by" ? "Абярыце тарыф" : "Select a plan"}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* SELECT AND BUY Button */}
            <div className="flex flex-col items-center mt-7.5 w-full relative group">
              <button
                disabled={!tempSelectedPlanId}
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
                className={`font-mono text-[14px] px-6 py-2.5 rounded-[14px] transition-all duration-250 ease-in-out ${tempSelectedPlanId
                  ? "bg-white text-black cursor-pointer hover:bg-white/90 border-none"
                  : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                  }`}
              >
                {selectedPlan
                  ? t.home.buyFor(
                    `${selectedPlan.usdTotal % 1 === 0 ? selectedPlan.usdTotal : selectedPlan.usdTotal.toFixed(2)}$`,
                    selectedPlan.starsPrice
                  ).toUpperCase()
                  : t.onboarding.selectAndBuy.toUpperCase()}
              </button>
              {!tempSelectedPlanId && (
                <div className="absolute bottom-full mb-2 bg-[#1A1A1A] border border-white/10 text-white text-[12px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {language === "ru" ? "Выберите план" : language === "uz" ? "Rejani tanlang" : language === "by" ? "Абярыце тарыф" : "Select a plan"}
                </div>
              )}
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
