import type { Plan } from "@/data/plans";

export function getFirstPayment(plan: Plan): number {
  return plan.monthlyPrice + plan.hardwareFee;
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}
