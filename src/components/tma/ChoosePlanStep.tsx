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
  return (
    <div className="w-full flex flex-col box-border">
      <h2 className="text-[24px] text-center text-white m-0 mb-1.5 leading-tight font-sans">
        {plansTexts.title}
      </h2>

      <p className="text-[16px] text-center text-white/40 m-0 mb-10 leading-relaxed font-sans">
        {plansTexts.desc}
      </p>

      {/* Plans Cards */}
      <div className="grid grid-cols-2 gap-2.5 w-full box-border">
        {onboardingPlans.map((plan) => {
          const isYearly = plan.periodMonths === 12;
          const isActive = tempSelectedPlanId === plan.id;

          const primaryColor = (isYearly ? "#5B1B85" : "#cfdfe5");

          const secondaryColor = (isYearly ? "#7F96D0" : "#606768");

          const baseColor = (isYearly ? "#5B1B85" : "#08090a");

          const solidGradient = (isYearly ? "radial-gradient(circle at 50% 0%, rgb(196 112 255) 0%, rgb(131 21 209) 45%, rgb(120 143 202) 75%, rgb(77, 168, 213) 100%)" : undefined);

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

      {campaign === "adults" ? (
        <>
          {/* Under-cards texts */}
          <div className="mt-6 text-center text-white text-[14px] font-sans leading-relaxed font-normal">
            {language === "ru" ? (
              <>
                Без логов · 50+ серверов · 7 дней гарантия ·
                <br />
                Безлимитный трафик
              </>
            ) : language === "es" ? (
              <>
                Sin registros · 50+ servidores · Garantía de 7 días ·
                <br />
                Ancho de banda ilimitado
              </>
            ) : (
              <>
                No logs · 50+ servers · 7-day refund ·
                <br />
                Unlimited bandwidth
              </>
            )}
          </div>

          <div className="mt-4 text-center text-white/40 text-[13px] font-sans">
            {language === "ru"
              ? "с помощью Crypto, Telegram Stars или Карты"
              : language === "es"
                ? "con Crypto, Telegram Stars o Tarjeta"
                : "with Crypto, Telegram Stars, or Card"}
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
              {language === "ru"
                ? "с помощью Карты, Crypto или Telegram Stars"
                : language === "es"
                  ? "con Tarjeta, Crypto o Telegram Stars"
                  : "with Card, Crypto, or Telegram Stars"}
            </div>
          )}

          {campaign === "gaming" ? (
            /* Gaming campaign: Included in both section */
            <div className="mt-10 w-full px-1 box-border">
              <h4 className="text-[18px] text-white m-0 mb-[10px] font-sans">
                {language === "ru" ? "Включено в оба" : language === "es" ? "Incluido en ambos" : "Included in both"}
              </h4>

              <div className="flex flex-col gap-4 mt-3">
                {[
                  {
                    title: language === "ru" ? "Безлимитный трафик" : language === "es" ? "Ancho de banda ilimitado" : "Unlimited bandwidth",
                    desc: language === "ru" ? "Никаких ограничений скорости" : language === "es" ? "Sin restricciones de velocidad" : "No throttling, ever",
                  },
                  {
                    title: language === "ru" ? "50+ локаций серверов" : language === "es" ? "Más de 50 ubicaciones de servidor" : "50+ server locations",
                    desc: language === "ru" ? "Найдите самый быстрый узел для любой игры" : language === "es" ? "Encuentra el nodo más rápido para cualquier juego" : "Find the fastest node for any game",
                  },
                  {
                    title: language === "ru" ? "7 дней гарантии возврата" : language === "es" ? "Garantía de reembolso de 7 días" : "7-day money-back",
                    desc: language === "ru" ? "Не понравилось? Вернем деньги без лишних вопросов" : language === "es" ? "¿No es para ti? Reembolso completo, sin preguntas" : "Not for you? Full refund, no questions",
                  },
                  {
                    title: language === "ru" ? "Игровой режим" : language === "es" ? "Modo de juego" : "Gaming mode",
                    desc: language === "ru" ? "Оптимизированная маршрутизация игрового трафика" : language === "es" ? "Enrutamiento optimizado para tráfico de juegos" : "Optimised routing for game traffic",
                  },
                ].map((item, idx) => (
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
                {language === "ru" ? "Что всегда включено" : language === "es" ? "Qué está incluido" : "What's always included"}
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
      )}
    </div>
  );
}
