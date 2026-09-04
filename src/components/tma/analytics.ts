"use client";

import WebApp from "@twa-dev/sdk";
import type { Plan, UserData } from "./types";
import { safeStorage } from "./api";
import { trackEvent } from "../../lib/mixpanel";


export type PlanStatus = "none" | "trial" | "active" | "expiring" | "expired";
export type PlanType = "monthly" | "annual";
export type PurchaseTrigger = "buy" | "extend" | "renew";

export const EXPIRING_DAYS_THRESHOLD = 3;

const TRIAL_EXPIRING_DAYS = 1;

const APP_OPENED_KEY = "iguard_app_opened";
const TRIAL_TRACKING_KEY = "iguard_trial_tracking";

export function getPlanStatus(user: UserData): PlanStatus {
  const active = user.activePlan;
  if (active) {
    if (active.isTrial || user.isTrial) return "trial";
    if (active.daysLeft <= EXPIRING_DAYS_THRESHOLD) return "expiring";
    return "active";
  }
  const subType = (user.subscriptionType || "").toLowerCase();
  if (subType === "expired" || user.hasUsedTrial || user.hasPaid) return "expired";
  return "none";
}

export function getPlanType(plan: Plan): PlanType {
  return plan.periodMonths >= 12 ? "annual" : "monthly";
}

export function getCurrentPlanType(user: UserData): PlanType | "trial" {
  if (user.activePlan?.isTrial || user.isTrial) return "trial";
  const name = user.activePlan?.name || "";
  return /year|год|yil|гад/i.test(name) ? "annual" : "monthly";
}

export function getPurchaseTrigger(user: UserData): PurchaseTrigger {
  const status = getPlanStatus(user);
  if (status === "none") return "buy";
  if (status === "expired") return "renew";
  return "extend";
}

function getTelegramWebApp(): any {
  if (typeof window === "undefined") return null;
  try {
    return (window as any)?.Telegram?.WebApp || WebApp;
  } catch {
    return null;
  }
}

// `app_opened`: single entry-point event, fired once per app launch
export function trackAppOpened(startParam: string | null): void {
  if (typeof window === "undefined") return;
  const tg = getTelegramWebApp();
  const tgUser = tg?.initDataUnsafe?.user;
  const isFirstOpen = safeStorage.getItem(APP_OPENED_KEY) !== "true";
  safeStorage.setItem(APP_OPENED_KEY, "true");

  trackEvent("app_opened", {
    is_first_open: isFirstOpen,
    start_param: startParam ?? null,
    tg_platform: tg?.platform ?? "unknown",
    tg_version: tg?.version ?? "unknown",
    is_premium: !!tgUser?.is_premium,
    lang_code: tgUser?.language_code ?? null,
  });
}

interface TrialTrackingState {
  expiration: string;
  expiringTracked: boolean;
  ended: boolean;
}

function readTrialState(): TrialTrackingState | null {
  try {
    const raw = safeStorage.getItem(TRIAL_TRACKING_KEY);
    return raw ? (JSON.parse(raw) as TrialTrackingState) : null;
  } catch {
    return null;
  }
}

function saveTrialState(state: TrialTrackingState): void {
  safeStorage.setItem(TRIAL_TRACKING_KEY, JSON.stringify(state));
}

// Client-side detection of the trial lifecycle from the synced profile:
// `trial_started` / `trial_expiring` / `trial_expired`. Deduplicated per trial
// (keyed by its expiration date) via localStorage, so each fires once.
export function trackTrialLifecycle(user: UserData): void {
  const status = getPlanStatus(user);
  const state = readTrialState();

  if (status === "trial" && user.activePlan) {
    const expiration = user.expiration || user.activePlan.nextBilling;
    let next = state;
    if (!next || next.expiration !== expiration) {
      trackEvent("trial_started", {
        source: "profile_sync",
        days: user.trialDuration ?? user.activePlan.daysLeft,
      });
      next = { expiration, expiringTracked: false, ended: false };
      saveTrialState(next);
    }
    if (user.activePlan.daysLeft <= TRIAL_EXPIRING_DAYS && !next.expiringTracked) {
      trackEvent("trial_expiring", { days_left: user.activePlan.daysLeft });
      saveTrialState({ ...next, expiringTracked: true });
    }
    return;
  }

  if (state && !state.ended) {
    if (status === "expired" || status === "none") {
      trackEvent("trial_expired", { last_plan: "trial" });
    }
    saveTrialState({ ...state, ended: true });
  }
}
