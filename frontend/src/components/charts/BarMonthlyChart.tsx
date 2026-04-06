import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyTrend } from '../../types';
import { formatINRShort, formatINR } from '../../utils/currency';
import { formatMonth } from '../../utils/date';
import { EmptyState } from '../ui/EmptyState';

interface BarMonthlyChartProps {
  data: MonthlyTrend[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-[#E0E3E8] rounded-lg p-3 shadow-lg">
      <p className="text-[#5A6170] text-xs mb-2">
        {formatMonth(label)}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#5A6170] capitalize">
            {entry.dataKey}:
          </span>
          <span className="text-[#111318] font-mono">
            {formatINR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarMonthlyChart({ data }: BarMonthlyChartProps) {
  const chartData = useMemo(
    () =>
      (data ?? []).map((d) => ({
        month: d.month,
        income: Number(d.income) || 0,
        expenses: Number(d.expenses) || 0,
        net: Number(d.net) || 0,
      })),
    [data]
  );

  if (!chartData.length) {
    return <EmptyState title="No monthly data" message="Monthly comparison data is not available." />;
  }

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          barGap={4}
          barCategoryGap="30%"
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E3E8" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(val) => formatMonth(val).slice(0, 3)}
            stroke="#CBD0D8"
            tick={{ fill: '#5A6170', fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(val) => formatINRShort(val)}
            stroke="#CBD0D8"
            tick={{ fill: '#5A6170', fontSize: 11 }}
            width={65}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="income"
            name="Income"
            fill="#0DAF6E"
            fillOpacity={0.85}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            animationDuration={1200}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#E5364B"
            fillOpacity={0.85}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            animationDuration={1200}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
