type AnalyticsValue = string | number | boolean | null | undefined;

export type AnalyticsEventName =
  | "user_registered"
  | "onboarding_completed"
  | "financial_account_created"
  | "transaction_added"
  | "transaction_edited"
  | "budget_created"
  | "savings_goal_created"
  | "account_deleted_requested";

type AnalyticsProperties = Record<string, AnalyticsValue>;

function sanitizeProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => ["string", "number", "boolean"].includes(typeof value) || value === null)
  );
}

export function getAmountRange(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return "unknown";
  if (amount < 50_000) return "lt_50k";
  if (amount < 250_000) return "50k_249k";
  if (amount < 1_000_000) return "250k_999k";
  if (amount < 5_000_000) return "1m_4_9m";
  return "gte_5m";
}

export function trackAnalyticsEvent(eventName: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  const payload = {
    event: eventName,
    properties: sanitizeProperties(properties),
    timestamp: new Date().toISOString(),
  };

  // MVP privacy-first adapter: intentionally avoids raw financial details and PII.
  // Replace this with a real analytics provider once a compliant destination is selected.
  if (process.env.NODE_ENV !== "test") {
    console.info("SISAKU_ANALYTICS", JSON.stringify(payload));
  }
}