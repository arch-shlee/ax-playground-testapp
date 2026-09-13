import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CompanyStatusRow } from '../../utils/metrics';
import { STATUS_COLORS } from '../../types';
import { ChartCard } from './ChartCard';

export function CompanyStatusChart({ data }: { data: CompanyStatusRow[] }) {
  return (
    <ChartCard title="관계사별 상태 현황" subtitle="정상 · 주의 · 지연 과제 수">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="company"
              tick={{ fontSize: 12, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="정상" stackId="status" fill={STATUS_COLORS.정상.main} radius={[0, 0, 0, 0]} />
            <Bar dataKey="주의" stackId="status" fill={STATUS_COLORS.주의.main} />
            <Bar dataKey="지연" stackId="status" fill={STATUS_COLORS.지연.main} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
