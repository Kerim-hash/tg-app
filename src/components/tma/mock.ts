"use client";

import type { Plan, UserData } from "./types";
import type { FirstPurchaseDiscount, PromoValidationResult } from "./discount";

// Dev/QA mock session for running the app outside Telegram (no initData, no JWT).
// Enable with `?mock=1` (or `#mock=1`) in the URL, e.g. http://localhost:3000/?mock=1
// Combine with a deep-link promo: http://localhost:3000/?mock=1&startapp=promo_TEST10
export function isMockMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const search = new URLSearchParams(window.location.search);
    if (search.get("mock") === "1") return true;
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      if (hashParams.get("mock") === "1") return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

// New user: no active plan, first purchase ahead — the discount flow is visible
export const MOCK_USER: UserData = {
  id: 1,
  firstName: "Mock",
  username: "mock_user",
  isPremium: false,
  paymentMethodSaved: false,
  isTrial: false,
  hasUsedTrial: false,
  trialDuration: 3,
  hasPaid: false,
  subscriptionType: "trial_available",
};

// Mirrors the live /payment/prices/telegram catalog shape after mapping
export const MOCK_PLANS: Plan[] = [
  {
    id: "1",
    label: "1 month",
    starsPrice: 435,
    usdTotal: 9.99,
    usdPerMonth: 9.99,
    rubTotal: 299,
    rubPerMonth: 299,
    periodMonths: 1,
  },
  {
    id: "4",
    label: "1 year",
    starsPrice: 2090,
    usdTotal: 48,
    usdPerMonth: 4,
    rubTotal: 2149,
    rubPerMonth: 179.08,
    periodMonths: 12,
    badge: "Best Value",
  },
];

export function mockFirstPurchaseDiscount(): FirstPurchaseDiscount {
  return {
    percent: 10,
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    promoId: 108,
  };
}

// Fallback used when the real /promo/validate request fails in mock mode
// (no JWT in the browser). TEST<n> applies an n% discount (e.g. TEST10,
// TEST25); USED / EXPIRED reproduce the corresponding error states;
// anything else -> not_found.
export function mockValidatePromo(code: string): PromoValidationResult {
  const normalized = code.trim().toUpperCase();
  if (normalized === "USED") return { ok: false, reason: "used" };
  if (normalized === "EXPIRED") return { ok: false, reason: "expired" };
  const match = normalized.match(/^TEST(\d{1,2})$/);
  if (match) {
    const percent = Number(match[1]);
    if (percent > 0) return { ok: true, percent, promoId: 999 };
  }
  return { ok: false, reason: "not_found" };
}
