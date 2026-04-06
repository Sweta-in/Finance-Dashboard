import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CategorySummary } from '../../types';
import { formatINR, formatINRShort } from '../../utils/currency';
import { EmptyState } from '../ui/EmptyState';

const COLORS = [
  '#0DAF6E',
  '#2B6FE8',
  '#D99515',
  '#7C4DDB',
  '#E5364B',
  '#0097A7',
  '#E67E22',
  '#C2185B',
];

interface DonutCategoryChartProps {
  data: CategorySummary[];
}

interface PieDataItem {
  name: string;
  value: number;
  percentage: number;
  recordCount: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as PieDataItem;

  return (
    <div className="bg-white border border-[#E0E3E8] rounded-lg p-3 shadow-lg">
      <p className="text-xs font-medium text-[#111318] mb-1">
        {item.name}
      </p>
      <p className="text-xs font-mono text-[#5A6170]">
        {formatINR(item.value)} · {item.percentage.toFixed(1)}%
      </p>
      <p className="text-xs text-[#9BA3B0]">
        {item.recordCount} transactions
      </p>
    </div>
  );
}

export function DonutCategoryChart({ data }: DonutCategoryChartProps) {
  const expenseData = useMemo(
    () => (data ?? []).filter((d) => d.type === 'EXPENSE'),
    [data]
  );

  const pieData: PieDataItem[] = useMemo(
    () =>
      expenseData.map((d) => ({
        name: d.category,
        value: d.total,
        percentage: d.percentage,
        recordCount: d.recordCount,
      })),
    [expenseData]
  );

  const total = useMemo(
    () => expenseData.reduce((sum, d) => sum + Number(d.total), 0),
    [expenseData]
  );

  if (!pieData.length) {
    return <EmptyState title="No category data" message="No expense categories to display." />;
  }

  const topCategories = pieData.slice(0, 5);

  return (
    <div>
      {/* Chart with center label */}
      <div className="relative w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              strokeWidth={0}
              animationDuration={1200}
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[#9BA3B0] text-xs">Total Spend</span>
          <span className="text-[#111318] font-mono font-bold text-lg">
            {formatINRShort(total)}
          </span>
        </div>
      </div>

      {/* Custom Legend — top 5 categories */}
      <div className="mt-4 space-y-1">
        {topCategories.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 px-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-[11px] text-[#5A6170] truncate flex-1">
              {item.name}
            </span>
            <span className="text-[11px] font-mono text-[#9BA3B0] shrink-0">
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
