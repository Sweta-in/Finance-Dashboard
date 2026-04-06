import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Scale, Database, PiggyBank } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { AreaTrendChart } from '../components/charts/AreaTrendChart';
import { DonutCategoryChart } from '../components/charts/DonutCategoryChart';
import { BarMonthlyChart } from '../components/charts/BarMonthlyChart';
import { Card, CardHeader } from '../components/ui/Card';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import {
  useDashboardSummary,
  useDashboardTrends,
  useDashboardCategories,
  useDashboardRecent,
} from '../hooks/useDashboard';

function computeSavingsRate(totalIncome: number, totalExpenses: number): number {
  if (totalIncome <= 0) return 0;
  return Number(((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1));
}

function savingsColor(rate: number): 'green' | 'amber' | 'red' {
  if (rate >= 50) return 'green';
  if (rate >= 20) return 'amber';
  return 'red';
}

export default function Dashboard() {
  const summary = useDashboardSummary();
  const trends = useDashboardTrends(6);
  const categories = useDashboardCategories();
  const recent = useDashboardRecent();

  const savingsRate = summary.data
    ? computeSavingsRate(Number(summary.data.totalIncome), Number(summary.data.totalExpenses))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {summary.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : summary.isError ? (
          <div className="col-span-5">
            <ErrorState
              title="Failed to load summary"
              message="Dashboard summary data could not be retrieved. Please check your connection and try again."
              onRetry={() => summary.refetch()}
            />
          </div>
        ) : summary.data ? (
          <>
            <KpiCard
              title="Total Income"
              value={Number(summary.data.totalIncome)}
              trend={summary.data.incomeGrowthPercent}
              trendLabel="vs last month"
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
              index={0}
            />
            <KpiCard
              title="Total Expenses"
              value={Number(summary.data.totalExpenses)}
              trend={summary.data.expenseGrowthPercent}
              trendLabel="vs last month"
              icon={<TrendingDown className="w-5 h-5" />}
              color="red"
              index={1}
            />
            <KpiCard
              title="Net Balance"
              value={Number(summary.data.netBalance)}
              subtitle="Income minus expenses"
              icon={<Scale className="w-5 h-5" />}
              color={Number(summary.data.netBalance) >= 0 ? 'green' : 'red'}
              index={2}
            />
            <KpiCard
              title="Total Records"
              value={summary.data.totalRecords}
              subtitle="Financial entries"
              icon={<Database className="w-5 h-5" />}
              color="amber"
              format="number"
              index={3}
            />
            <KpiCard
              title="Savings Rate"
              value={savingsRate}
              subtitle="Income retained"
              icon={<PiggyBank className="w-5 h-5" />}
              color={savingsColor(savingsRate)}
              format="percent"
              index={4}
            />
          </>
        ) : (
          <div className="col-span-5">
            <EmptyState
              title="Unable to load summary"
              message="Dashboard data could not be retrieved. Please check your connection."
            />
          </div>
        )}
      </div>

      {/* Section 2: Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Area Trend Chart — 65% */}
        <Card className="xl:col-span-3" padding="lg">
          <CardHeader
            title="6-Month Trend"
            subtitle="Income vs Expenses over time"
          />
          {trends.isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-sm text-[var(--text-muted)] font-body">
                Loading chart...
              </div>
            </div>
          ) : trends.isError ? (
            <ErrorState
              title="Failed to load trends"
              message="Trend data could not be retrieved."
              onRetry={() => trends.refetch()}
            />
          ) : trends.data && trends.data.length > 0 ? (
            <AreaTrendChart data={trends.data} />
          ) : (
            <EmptyState title="No trend data" message="Trend data is not available yet." />
          )}
        </Card>

        {/* Donut Category Chart — 35% */}
        <Card className="xl:col-span-2" padding="lg">
          <CardHeader
            title="Spending by Category"
            subtitle="Expense distribution"
          />
          {categories.isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-sm text-[var(--text-muted)] font-body">
                Loading chart...
              </div>
            </div>
          ) : categories.isError ? (
            <ErrorState
              title="Failed to load categories"
              message="Category breakdown could not be retrieved."
              onRetry={() => categories.refetch()}
            />
          ) : categories.data && categories.data.length > 0 ? (
            <DonutCategoryChart data={categories.data} />
          ) : (
            <EmptyState title="No category data" message="No expense categories to display." />
          )}
        </Card>
      </div>

      {/* Section 3: Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Bar Monthly Chart — 60% */}
        <Card className="xl:col-span-3" padding="lg">
          <CardHeader
            title="Monthly Comparison"
            subtitle="Income and expense bars by month"
          />
          {trends.isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-sm text-[var(--text-muted)] font-body">
                Loading chart...
              </div>
            </div>
          ) : trends.isError ? (
            <ErrorState
              title="Failed to load monthly data"
              message="Monthly comparison data could not be retrieved."
              onRetry={() => trends.refetch()}
            />
          ) : trends.data && trends.data.length > 0 ? (
            <BarMonthlyChart data={trends.data} />
          ) : (
            <EmptyState title="No monthly data" message="Monthly comparison data is not available." />
          )}
        </Card>

        {/* Recent Activity — 40% */}
        <Card className="xl:col-span-2" padding="lg">
          <CardHeader
            title="Recent Activity"
            subtitle="Latest transactions"
          />
          {recent.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] animate-shimmer bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] bg-[length:200%_100%]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-[var(--bg-elevated)] animate-shimmer bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] bg-[length:200%_100%]" />
                    <div className="h-2 w-16 rounded bg-[var(--bg-elevated)] animate-shimmer bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] bg-[length:200%_100%]" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.isError ? (
            <ErrorState
              title="Failed to load activity"
              message="Recent activity could not be retrieved."
              onRetry={() => recent.refetch()}
            />
          ) : recent.data && recent.data.length > 0 ? (
            <RecentActivity records={recent.data} />
          ) : (
            <EmptyState title="No recent activity" message="No transactions recorded yet." />
          )}
        </Card>
      </div>
    </motion.div>
  );
}
