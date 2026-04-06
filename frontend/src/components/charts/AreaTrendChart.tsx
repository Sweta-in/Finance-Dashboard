import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonthlyTrend } from '../../types';
import { formatINRShort, formatINR } from '../../utils/currency';
import { formatMonth } from '../../utils/date';
import { EmptyState } from '../ui/EmptyState';

interface AreaTrendChartProps {
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

function CustomLegend({ payload }: any) {
  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {payload?.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-[#5A6170]">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AreaTrendChart({ data }: AreaTrendChartProps) {
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
    return <EmptyState title="No trend data" message="Trend data is not available yet." />;
  }

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E3E8" />
          <XAxis
            dataKey="month"
            tickFormatter={(val) => formatMonth(val)}
            stroke="#CBD0D8"
            tick={{ fill: '#5A6170', fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(val) => formatINRShort(val)}
            stroke="#CBD0D8"
            tick={{ fill: '#5A6170', fontSize: 11 }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#0DAF6E"
            fill="#0DAF6E"
            fillOpacity={0.15}
            strokeWidth={2}
            animationDuration={1200}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#E5364B"
            fill="#E5364B"
            fillOpacity={0.15}
            strokeWidth={2}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
