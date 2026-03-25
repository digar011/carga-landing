import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TEmptyStateAction {
  label: string;
  href: string;
}

interface TEmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: TEmptyStateAction;
}

export function EmptyState({ icon, title, description, action }: TEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl" role="img" aria-label={title}>
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
      {action && (
        <Link href={action.href} className="mt-6">
          <Button variant="secondary" size="md">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
