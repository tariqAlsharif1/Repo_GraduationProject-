import { formatJD } from "./format";

// Presentation-only text. The actual status/percentage/remaining numbers
// always come from the backend (app/services/budget_service.py) - this just
// picks the matching copy for the status the API already computed.
export function budgetWarningMessage(usagePercentage, spent, budget) {
  if (usagePercentage >= 100) {
    const over = Number(spent) - Number(budget);
    return `You have exceeded your monthly budget by ${formatJD(over)}.`;
  }
  if (usagePercentage >= 90) {
    return "You are approaching your monthly spending limit.";
  }
  if (usagePercentage >= 75) {
    return `You have used ${usagePercentage.toFixed(0)}% of your monthly budget.`;
  }
  return null;
}
