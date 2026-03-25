import type { TLoadStatus } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { LOAD_STATUS_LABELS, LOAD_STATUS_COLORS } from '@/utils/constants';

interface TStatusBadgeProps {
  status: TLoadStatus;
  className?: string;
}

type TBadgeVariant = 'default' | 'gold' | 'green' | 'red' | 'blue' | 'gray';

const COLOR_TO_VARIANT: Record<string, TBadgeVariant> = {
  green: 'green',
  blue: 'blue',
  gold: 'gold',
  red: 'red',
  gray: 'gray',
};

export function StatusBadge({ status, className = '' }: TStatusBadgeProps) {
  const color = LOAD_STATUS_COLORS[status] ?? 'gray';
  const variant = COLOR_TO_VARIANT[color] ?? 'default';
  const label = LOAD_STATUS_LABELS[status] ?? status;

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
