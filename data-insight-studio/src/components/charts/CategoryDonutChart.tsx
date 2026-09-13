import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryDonutRow } from '../../utils/metrics';
import { getCategoryColor } from '../../types';
import { ChartCard } from './ChartCard';

export function CategoryDonutChart({ data }: { data: CategoryDonutRow[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard title="업무 유형별 과제 수" subtitle={`전체 ${total}건 기준`}>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={getCategoryColor(entry.name)} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}건`, name]}
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
