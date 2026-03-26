interface TStatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: 'navy' | 'gold' | 'green' | 'blue';
}

const borderColors: Record<string, string> = {
  navy: 'border-l-navy',
  gold: 'border-l-gold',
  green: 'border-l-brand-green',
  blue: 'border-l-brand-blue',
};

const iconBgColors: Record<string, string> = {
  navy: 'bg-navy/10 text-navy',
  gold: 'bg-gold/10 text-gold-dark',
  green: 'bg-green-50 text-green-700',
  blue: 'bg-blue-50 text-blue-700',
};

export function StatCard({
  label,
  value,
  icon,
  color = 'navy',
}: TStatCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 border-l-4 bg-white p-5 ${borderColors[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-navy">{value}</p>
          <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${iconBgColors[color]}`}
          role="img"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
