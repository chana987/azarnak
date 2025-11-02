import type { Action, Holding, PortfolioSummary } from '../types/stocks';

/**
 * Calculate portfolio summary from a list of actions for a specific user
 */
export function calculatePortfolioSummary(actions: Action[], user: string): PortfolioSummary {
  // Filter actions for the specific user
  const userActions = actions.filter((action) => action.User === user);

  // Group actions by company and account
  const holdingsMap = new Map<string, {
    company: string;
    hebrewName: string;
    account: string;
    totalShares: number;
    totalInvested: number;
    currentValue: number;
    currency: string;
    transactions: { type: string; shares: number; price: number }[];
  }>();

  userActions.forEach((action) => {
    const key = `${action.Company}-${action.Account}`;
    const shares = parseFloat(action.Amount) || 0;
    const purchaseValueILS = parseFloat(action['Total Purchase Value (ILS)']) || 0;
    const currentValueILS = parseFloat(action['Total Current Value (ILS)']) || 0;

    if (!holdingsMap.has(key)) {
      holdingsMap.set(key, {
        company: action.Company,
        hebrewName: action['Hebrew Name'],
        account: action.Account,
        totalShares: 0,
        totalInvested: 0,
        currentValue: 0,
        currency: action.Currency,
        transactions: [],
      });
    }

    const holding = holdingsMap.get(key)!;

    if (action.Type === 'BUY') {
      holding.totalShares += shares;
      holding.totalInvested += purchaseValueILS;
      holding.currentValue += currentValueILS;
      holding.transactions.push({
        type: 'BUY',
        shares,
        price: parseFloat(action['V/S at Purchase (ILS)']) || 0,
      });
    } else if (action.Type === 'SELL') {
      holding.totalShares -= shares;
      // For SELL, we reduce the invested amount proportionally
      const avgCost = holding.totalInvested / (holding.totalShares + shares);
      holding.totalInvested -= avgCost * shares;
      holding.currentValue -= currentValueILS;
      holding.transactions.push({
        type: 'SELL',
        shares,
        price: parseFloat(action['V/S at Purchase (ILS)']) || 0,
      });
    }
  });

  // Convert holdings map to array and calculate metrics
  const holdings: Holding[] = Array.from(holdingsMap.values())
    .filter((h) => h.totalShares > 0) // Only include holdings with positive shares
    .map((h) => {
      const averagePurchasePrice = h.totalInvested / h.totalShares;
      const profitLoss = h.currentValue - h.totalInvested;
      const profitLossPercentage = (profitLoss / h.totalInvested) * 100;

      return {
        company: h.company,
        hebrewName: h.hebrewName,
        account: h.account,
        totalShares: h.totalShares,
        averagePurchasePrice,
        totalInvested: h.totalInvested,
        currentValue: h.currentValue,
        profitLoss,
        profitLossPercentage,
        currency: h.currency,
      };
    });

  // Calculate totals
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalProfitLoss = currentValue - totalInvested;
  const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalProfitLoss,
    totalProfitLossPercentage,
    holdings,
    actions: userActions,
  };
}

/**
 * Get unique list of users from actions
 */
export function getUsers(actions: Action[]): string[] {
  const users = new Set<string>();
  actions.forEach((action) => {
    if (action.User) {
      users.add(action.User);
    }
  });
  return Array.from(users).sort();
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format date
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
