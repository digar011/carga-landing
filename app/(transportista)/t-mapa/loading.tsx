export default function MapLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
      <div className="flex min-h-0 flex-1 animate-pulse items-center justify-center rounded-xl bg-gray-100">
        <p className="text-sm text-gray-400">Cargando mapa...</p>
      </div>
    </div>
  );
}
