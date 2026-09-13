import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Code2,
  Settings2,
  Cpu,
  UserCheck,
  User,
  HelpCircle,
  Play,
  Flag,
  type LucideIcon,
} from 'lucide-react';
import type { NodeKind, Role } from '../../types';
import { ROLE_COLORS } from '../../types';

const ROLE_ICONS: Record<Role, LucideIcon> = {
  개발자: Code2,
  '운영 담당자': Settings2,
  '검증 시스템': Cpu,
  승인자: UserCheck,
  사용자: User,
  '담당자 미지정': HelpCircle,
};

export interface StepNodeData {
  label: string;
  role: Role;
  kind: NodeKind;
  status: string;
  dimmed: boolean;
  highlighted: boolean;
  [key: string]: unknown;
}

function StepNodeInner({ data, selected }: NodeProps) {
  const d = data as unknown as StepNodeData;
  const colors = ROLE_COLORS[d.role];
  const Icon = d.kind === 'start' ? Play : d.kind === 'end' ? Flag : ROLE_ICONS[d.role];

  const opacity = d.dimmed ? 0.35 : 1;
  const ring = selected
    ? '0 0 0 3px rgba(37, 99, 235, 0.45)'
    : d.highlighted
      ? '0 0 0 2px rgba(37, 99, 235, 0.25)'
      : '0 1px 3px rgba(15, 23, 42, 0.12)';

  if (d.kind === 'decision') {
    return (
      <div style={{ width: 180, height: 110, opacity }} className="relative transition-opacity duration-300">
        <Handle type="target" position={Position.Left} className="!bg-slate-400" />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            clipPath: 'polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)',
            background: colors.bg,
            border: `2px solid ${colors.main}`,
            boxShadow: ring,
          }}
        >
          <div className="flex flex-col items-center gap-1 px-8 text-center">
            <Icon size={16} color={colors.main} />
            <span className="text-[12px] font-semibold leading-tight" style={{ color: colors.text }}>
              {d.label}
            </span>
          </div>
        </div>
        <Handle type="source" position={Position.Right} className="!bg-slate-400" />
      </div>
    );
  }

  if (d.kind === 'start' || d.kind === 'end') {
    return (
      <div
        style={{ width: 140, height: 64, opacity, background: colors.main, boxShadow: ring }}
        className="relative flex items-center justify-center gap-2 rounded-full text-white transition-opacity duration-300"
      >
        {d.kind !== 'start' && <Handle type="target" position={Position.Left} className="!bg-white" />}
        <Icon size={16} />
        <span className="text-[13px] font-semibold">{d.label}</span>
        {d.kind !== 'end' && <Handle type="source" position={Position.Right} className="!bg-white" />}
      </div>
    );
  }

  return (
    <div
      style={{ width: 200, height: 76, opacity, boxShadow: ring, borderColor: colors.border }}
      className="relative flex items-center gap-3 rounded-xl border bg-white px-3 py-2 transition-opacity duration-300"
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: colors.bg, color: colors.main }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-800">{d.label}</p>
        <p className="truncate text-[11px]" style={{ color: colors.main }}>
          {d.role}
        </p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />
    </div>
  );
}

export const StepNode = memo(StepNodeInner);
