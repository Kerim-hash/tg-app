"use client";

import { useEffect, useState } from "react";
import { API_BASE, apiCall, safeStorage } from "./api";
import type { Plan } from "./types";

export interface FirstPurchaseDiscount {
  percent: number;
  expiresAt: string;
  promoId?: number;
}

export interface AppliedPromo {
  code: string;
  percent: number;
  promoId?: number;
  source: "manual" | "deeplink";
}

export type PromoFailReason = "not_found" | "used" | "expired" | "invalid" | "network";

export type PromoValidationResult =
  | { ok: true; percent: number; promoId?: number }
  | { ok: false; reason: PromoFailReason };

// Promo endpoints are shared across products; the backend needs to know
// which product the promo is being validated for.
const PROMO_HEADERS = { "X-Product": "iguard" };

export async function fetchFirstPurchaseDiscount(): Promise<FirstPurchaseDiscount | null> {
  try {
    const data = await apiCall("/discount/first-purchase", "GET", undefined, PROMO_HEADERS);
    if (!data?.eligible) return null;
    const percent = Number(data.discount_percent);
    const expiresAt = data.expires_at;
    if (!percent || percent <= 0 || !expiresAt) return null;
    if (new Date(expiresAt).getTime() <= Date.now()) return null;
    return { percent, expiresAt, promoId: data.promo_id };
  } catch (err) {
    console.error("[IGuard] Failed to fetch first-purchase discount:", err);
    return null;
  }
}

// Raw fetch instead of apiCall: a 4xx body like { reason: "used" } must still
// be readable to show a specific error message.
export async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  const token = safeStorage.getItem("iguard_jwt_token");
  const headers: HeadersInit = { "Content-Type": "application/json", ...PROMO_HEADERS };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/promo/validate?code=${encodeURIComponent(code)}`, { headers });
  } catch (err) {
    console.error("[IGuard] Promo validation request failed:", err);
    return { ok: false, reason: "network" };
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }

  const knownReason = (r: unknown): PromoFailReason =>
    r === "not_found" || r === "used" || r === "expired" ? r : "invalid";

  if (!response.ok) {
    if (response.status === 404) return { ok: false, reason: knownReason(data?.reason ?? "not_found") };
    if (response.status >= 500) return { ok: false, reason: "network" };
    return { ok: false, reason: knownReason(data?.reason) };
  }

  const valid = data?.valid ?? data?.eligible ?? true;
  const promoId = data?.promo_id ?? data?.id;

  // Live response shape: { id: 11, type: "sale", sale: 10, sale_type: "percent" }
  let percent = Number(data?.discount_percent ?? data?.percent ?? 0);
  if (!percent && data?.sale !== undefined) {
    const isPercentSale =
      (data.type === undefined || data.type === "sale") &&
      (data.sale_type === undefined || data.sale_type === "percent");
    if (isPercentSale) {
      percent = Number(data.sale);
    } else {
      // e.g. a fixed-amount sale — the UI can only render percent discounts
      console.warn(
        "[IGuard] Unsupported promo type/sale_type:",
        data.type,
        data.sale_type,
      );
    }
  }

  if (!valid || !percent || percent <= 0) {
    return { ok: false, reason: knownReason(data?.reason) };
  }
  return { ok: true, percent, promoId };
}

// Discounted prices are computed on the client: /payment/prices is a public
// endpoint and knows nothing about per-user discounts.
export function applyDiscountToPlan(plan: Plan, percent: number): Plan {
  if (!percent || percent <= 0) return plan;
  const k = 1 - percent / 100;
  return {
    ...plan,
    usdTotal: plan.usdTotal * k,
    usdPerMonth: plan.usdPerMonth * k,
    rubTotal: plan.rubTotal !== undefined ? Math.round(plan.rubTotal * k) : undefined,
    rubPerMonth: plan.rubPerMonth !== undefined ? plan.rubPerMonth * k : undefined,
    starsPrice: Math.round(plan.starsPrice * k),
  };
}

// `startapp=promo_CODE` deep link
export function parsePromoStartParam(startParam: string | null | undefined): string | null {
  if (!startParam || !startParam.startsWith("promo_")) return null;
  const code = startParam.substring("promo_".length).trim();
  return code || null;
}

export function isDiscountActive(d: FirstPurchaseDiscount | null | undefined): d is FirstPurchaseDiscount {
  return !!d && new Date(d.expiresAt).getTime() > Date.now();
}

function formatCountdown(msLeft: number, language: string): string {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) {
    const dayUnit = language === "ru" || language === "by" ? "д" : language === "uz" ? "k" : "d";
    return `${days}${dayUnit} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Ticks every second; returns null when expired or expiresAt is empty/invalid.
export function useCountdown(expiresAt: string | null | undefined, language: string): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setLabel(null);
      return;
    }
    const target = new Date(expiresAt).getTime();
    if (isNaN(target)) {
      setLabel(null);
      return;
    }
    const tick = () => {
      const left = target - Date.now();
      setLabel(left > 0 ? formatCountdown(left, language) : null);
      return left > 0;
    };
    if (!tick()) return;
    const id = setInterval(() => {
      if (!tick()) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, language]);

  return label;
}
