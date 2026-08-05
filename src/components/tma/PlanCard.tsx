"use client";

import GradientBlock from "../GradientBlock";
import type { Plan, Translations } from "./types";

export function getPlanLabelText(periodMonths: number, lang: string): string {
  if (periodMonths === 12) {
    if (lang === "uz") return "Yillik";
    if (lang === "by") return "Гадавы";
    if (lang === "ru") return "Годовой";
    return "Annual";
  }
  if (lang === "ru") {
    if (periodMonths === 1) return "Месячный";
    if (periodMonths === 3) return "3 месяца";
    if (periodMonths === 6) return "6 месяцев";
    return `${periodMonths} мес.`;
  } else if (lang === "uz") {
    if (periodMonths === 1) return "Oylik";
    if (periodMonths === 3) return "3 oy";
    if (periodMonths === 6) return "6 oy";
    return `${periodMonths} oy`;
  } else if (lang === "by") {
    if (periodMonths === 1) return "Месячны";
    if (periodMonths === 3) return "3 месяцы";
    if (periodMonths === 6) return "6 месяцаў";
    return `${periodMonths} мес.`;
  } else {
    if (periodMonths === 1) return "Monthly";
    if (periodMonths === 3) return "3 Months";
    if (periodMonths === 6) return "6 Months";
    return `${periodMonths} Months`;
  }
}

export function getBilledFrequencyText(periodMonths: number, lang: string, t: any): string {
  if (periodMonths === 12) {
    if (lang === "uz") return "Oyiga $4";
    if (lang === "by") return "$4 у месяц";
    if (lang === "ru") return "$4 в месяц";
    return "$4 per month";
  }
  if (periodMonths === 1) {
    return t.home.billedMonthly;
  }
  if (lang === "ru") {
    if (periodMonths === 3) return "Оплата каждые 3 месяца";
    if (periodMonths === 6) return "Оплата каждые 6 месяцев";
    return `Оплата каждые ${periodMonths} мес.`;
  } else if (lang === "uz") {
    if (periodMonths === 3) return "Har 3 oyda to'lov";
    if (periodMonths === 6) return "Har 6 oyda to'lov";
    return `Har ${periodMonths} oyda to'lov`;
  } else if (lang === "by") {
    if (periodMonths === 3) return "Аплата кожныя 3 месяцы";
    if (periodMonths === 6) return "Аплата кожныя 6 месяцаў";
    return `Аплата кожныя ${periodMonths} мес.`;
  } else {
    return `Billed every ${periodMonths} months`;
  }
}

export function PlanCard({
  plan,
  plans,
  isActive,
  language,
  t,
  borderRadius = "45px",
}: {
  plan: Plan;
  plans: Plan[];
  isActive: boolean;
  language: string;
  t: Translations;
  borderRadius?: string;
}) {
  const isYearly = plan.periodMonths === 12;

  const monthlyPlan = plans.find((p) => p.periodMonths === 1);
  const yearlyOriginalTotal = monthlyPlan ? monthlyPlan.usdPerMonth * 12 : undefined;
  const yearlyDiscountPercent = yearlyOriginalTotal
    ? Math.round((1 - plan.usdTotal / yearlyOriginalTotal) * 100)
    : undefined;

  const solidBoxShadow = isYearly
    ? "inset 0 -106px 33.5px -56px rgba(93, 28, 137, 0.9), inset 0 -37px 31.3px -1px rgba(64, 209, 253, 0.6), inset 0 0 12.3px -22px rgba(230, 252, 255, 0.1), inset 0 0 9.85px 0 rgba(230, 252, 255, 0.7)"
    : "inset 0 -70px 24px -50px rgba(255, 255, 255, 0.06)";

  return (
    <GradientBlock
      label=""
      primaryColor={isYearly ? "#501B77" : "#cfdfe5"}
      secondaryColor={isYearly ? "#7F96D0" : "#606768"}
      baseColor={isYearly ? "#000000" : "#08090a"}
      borderRadius={borderRadius}
      height="100%"
      animate={false}
      glowIntensity={isYearly ? 1.2 : 0.8}
      borderGlow={true}
      enableMouseTracking={false}
      solidGradient="#000000"
      solidBoxShadow={solidBoxShadow}
      enableHoverScale={false}
      absoluteChildren={true}
    >
      {/* Border Overlay when Selected */}
      {isActive && (
        <div
          className="absolute inset-0 border-2 border-white pointer-events-none z-30"
          style={{ borderRadius }}
        />
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
            {isYearly ? `$ ${plan.usdTotal.toFixed(2)}` : `$ ${plan.usdPerMonth.toFixed(2)}`}
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
  );
}
