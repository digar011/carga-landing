import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-extrabold text-navy"
      >
        <span className="text-3xl">🚛</span> CarGA
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-gray-400">
        © 2025 CarGA. Todos los derechos reservados.
      </p>
    </div>
  );
}
