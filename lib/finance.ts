/**
 * Financial calculation utilities for the Advanced Financial Dashboard
 * All monetary values handled as integers (cents/paisas) to avoid floating point errors
 */

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashOnHand: number;
  accountsReceivable: number;
  accountsPayable: number;
  mrr: number;
  monthlyBurnRate: number;
  runway: number;
}

/**
 * Format currency value from cents to display format
 * @param cents - Amount in cents/paisas
 * @param currency - Currency code (USD, PKR, etc)
 * @param decimals - Decimal places
 */
export function formatCurrency(
  cents: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  const amount = cents / 100;
  const symbol = currency === 'PKR' ? '₨' : '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/**
 * Calculate percentage change between two values
 */
export function percentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 10000) / 100;
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(revenue: number, expenses: number): number {
  if (revenue === 0) return 0;
  return Math.round(((revenue - expenses) / revenue) * 10000) / 100;
}

/**
 * Calculate runway in months
 * Runway = Cash on Hand ÷ Monthly Burn Rate
 */
export function calculateRunway(cashOnHand: number, monthlyBurnRate: number): number {
  if (monthlyBurnRate === 0) return Infinity;
  return Math.round((cashOnHand / monthlyBurnRate) * 10) / 10;
}

/**
 * Determine health status color based on runway months
 */
export function getRunwayHealthColor(months: number): string {
  if (months > 12) return 'green';    // Healthy
  if (months > 6) return 'yellow';    // Warning
  return 'red';                       // Critical
}

/**
 * Calculate Days Sales Outstanding (DSO)
 * DSO = (Average Accounts Receivable ÷ Daily Revenue)
 */
export function calculateDSO(avgAR: number, dailyRevenue: number): number {
  if (dailyRevenue === 0) return 0;
  return Math.round((avgAR / dailyRevenue) * 10) / 10;
}

/**
 * Calculate burn rate as percentage of runway
 */
export function calculateBurnRate(expenses: number, daysInPeriod: number): number {
  return Math.round((expenses / daysInPeriod) * 100) / 100;
}

/**
 * Linear regression for forecasting
 * Returns array of forecasted values
 */
export function linearRegression(
  historicalData: number[],
  forecastPoints: number
): number[] {
  if (historicalData.length < 2) return [];

  const n = historicalData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += historicalData[i];
    sumXY += i * historicalData[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const forecast: number[] = [];
  for (let i = n; i < n + forecastPoints; i++) {
    forecast.push(Math.max(0, Math.round(slope * i + intercept)));
  }

  return forecast;
}

/**
 * Calculate concentration risk
 * Returns percentage of revenue from top client
 */
export function calculateConcentrationRisk(
  topClientRevenue: number,
  totalRevenue: number
): number {
  if (totalRevenue === 0) return 0;
  return Math.round((topClientRevenue / totalRevenue) * 10000) / 100;
}

/**
 * Get concentration risk level
 */
export function getConcentrationRiskLevel(percentage: number): string {
  if (percentage > 50) return 'critical';
  if (percentage > 40) return 'warning';
  if (percentage > 30) return 'caution';
  return 'healthy';
}

/**
 * Calculate financial health score (0-100)
 * Components:
 * - Runway length: 25%
 * - Profit margin: 20%
 * - Revenue growth trend: 20%
 * - Collection efficiency: 15%
 * - Expense control: 10%
 * - Revenue concentration: 10%
 */
export function calculateHealthScore(metrics: {
  runway: number;
  profitMargin: number;
  revenueGrowthPercent: number;
  collectionEfficiency: number;
  expenseRatioToRevenue: number;
  concentrationRisk: number;
}): number {
  let score = 0;

  // Runway (25%): >12 months = 25 pts, degrades linearly
  const runwayScore = Math.min(25, Math.max(0, (metrics.runway / 12) * 25));
  score += runwayScore;

  // Profit margin (20%): >30% = 20 pts, 0% = 0 pts
  const marginScore = Math.min(20, Math.max(0, (metrics.profitMargin / 30) * 20));
  score += marginScore;

  // Revenue growth (20%): >20% YoY = 20 pts, 0% = 10 pts, negative = 0 pts
  const growthScore = Math.min(20, Math.max(0, ((metrics.revenueGrowthPercent + 20) / 40) * 20));
  score += growthScore;

  // Collection efficiency (15%): >95% = 15 pts
  const collectionScore = Math.min(15, Math.max(0, (metrics.collectionEfficiency / 95) * 15));
  score += collectionScore;

  // Expense ratio (10%): <60% of revenue = 10 pts
  const expenseScore = Math.min(10, Math.max(0, ((60 - metrics.expenseRatioToRevenue) / 60) * 10));
  score += expenseScore;

  // Concentration risk (10%): <30% = 10 pts, >50% = 0 pts
  const concentrationScore = Math.min(10, Math.max(0, ((50 - metrics.concentrationRisk) / 50) * 10));
  score += concentrationScore;

  return Math.round(score);
}

/**
 * Get health score color
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 75) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

/**
 * Get health score description
 */
export function getHealthScoreDescription(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}
