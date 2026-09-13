import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import type { ScatterRow } from '../../utils/metrics';
import { STATUS_COLORS, STATUS_LIST } from '../../types';
import { ChartCard } from './ChartCard';

interface TooltipPayloadItem {
  payload: ScatterRow;
}

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-soft">
      <p className="font-semibold text-slate-700">{row.projectName}</p>
      <p className="text-slate-500">
        진행률 {row.progress}% · {row.remaining >= 0 ? `D-${row.remaining}` : `D+${Math.abs(row.remaining)} 지연`}
      </p>
    </div>
  );
}

export function ProgressScatterChart({ data }: { data: ScatterRow[] }) {
  return (
    <ChartCard title="진행률과 남은 기간의 관계" subtitle="가로축: 남은 기간(일) · 세로축: 진행률(%)">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis
              type="number"
              dataKey="remaining"
              name="남은 기간"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              unit="일"
            />
            <YAxis
              type="number"
              dataKey="progress"
              name="진행률"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              unit="%"
              width={40}
            />
            <ZAxis range={[70, 70]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {STATUS_LIST.map((status) => (
              <Scatter
                key={status}
                name={status}
                data={data.filter((d) => d.status === status)}
                fill={STATUS_COLORS[status].main}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
