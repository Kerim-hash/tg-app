"use client";

import type { Plan, Translations } from "./types";
import { getPlanLabelText } from "./PlanCard";
import { applyDiscountToPlan } from "./discount";

interface PriceSummaryProps {
  t: Translations;
  language: string;
  plan: Plan;
  discountPercent: number;
}

// Total price row shown on the payment-method step. With a discount active it
// shows the struck-through original next to the discounted price.
export default function PriceSummary({ t, language, plan, discountPercent }: PriceSummaryProps) {
  const discounted = applyDiscountToPlan(plan, discountPercent);
  const hasDiscount = discountPercent > 0;

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "14px 18px",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
        <span style={{ fontSize: "11px", color: "#8A94A6", fontFamily: "var(--font-mono), monospace", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
          {t.payment.total}
        </span>
        <span style={{ fontSize: "14px", color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
          {getPlanLabelText(plan.periodMonths, language)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {hasDiscount && (
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", textDecoration: "line-through", fontFamily: "var(--font-onest), sans-serif" }}>
            $ {plan.usdTotal.toFixed(2)}
          </span>
        )}
        <span style={{ fontSize: "18px", color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
          $ {discounted.usdTotal.toFixed(2)}
        </span>
        {hasDiscount && (
          <span
            style={{
              fontSize: "11px",
              color: "#000",
              background: "#40D1FD",
              borderRadius: "8px",
              padding: "4px 6px",
              fontFamily: "var(--font-mono), monospace",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            -{discountPercent}%
          </span>
        )}
      </div>
    </div>
  );
}
