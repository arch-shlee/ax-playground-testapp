import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { Role } from '../../types';
import { ROLE_COLORS } from '../../types';

export interface LaneLabelData {
  role: Role;
  width: number;
  [key: string]: unknown;
}

function LaneLabelNodeInner({ data }: NodeProps) {
  const d = data as unknown as LaneLabelData;
  const colors = ROLE_COLORS[d.role];
  return (
    <div
      style={{ width: d.width, height: 150, background: colors.bg, borderLeft: `4px solid ${colors.main}` }}
      className="pointer-events-none flex items-start rounded-r-lg pl-4 pt-3"
    >
      <span className="text-[13px] font-bold tracking-wide" style={{ color: colors.main }}>
        {d.role}
      </span>
    </div>
  );
}

export const LaneLabelNode = memo(LaneLabelNodeInner);
