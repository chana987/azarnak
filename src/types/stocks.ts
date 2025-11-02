export interface Action {
  Date: string;
  Type: 'BUY' | 'SELL';
  User: string;
  Account: string;
  Company: string;
  'Hebrew Name': string;
  Amount: string;
  'V/S at Purchase': string;
  Currency: string;
  'V/S at Purchase (ILS)': string;
  'Total Purchase Value (ILS)': string;
  'Total Current Value (ILS)': string;
}

export interface Holding {
  company: string;
  hebrewName: string;
  account: string;
  totalShares: number;
  averagePurchasePrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  currency: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  holdings: Holding[];
  actions: Action[];
}

export interface UserPortfolioData {
  user: string;
  summary: PortfolioSummary;
}
