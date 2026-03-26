import { Spinner } from '@/components/ui/spinner';

export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">Cargando...</p>
    </div>
  );
}
