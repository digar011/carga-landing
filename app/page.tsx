import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-white/95 backdrop-blur-sm">
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-xl font-extrabold text-navy">
            <span className="text-2xl">🚛</span> CarGA
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/iniciar-sesion"
              className="hidden text-sm font-medium text-gray-600 hover:text-navy sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-32 pb-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
          <span className="h-2 w-2 rounded-full bg-gold" />
          Próximo lanzamiento — Buenos Aires, Córdoba, Santa Fe
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-navy sm:text-5xl lg:text-6xl">
          La bolsa de cargas digital de Argentina
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500">
          Conectamos transportistas con carga disponible en tiempo real. Sin
          llamadas. Sin grupos de WhatsApp. Sin intermediarios.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/registro?role=transportista"
            className="rounded-lg bg-gold px-8 py-4 text-base font-bold text-white transition-transform hover:scale-[1.03] hover:bg-gold-dark"
          >
            Soy Transportista →
          </Link>
          <Link
            href="/registro?role=cargador"
            className="rounded-lg border-2 border-navy px-8 py-4 text-base font-bold text-navy transition-transform hover:scale-[1.03] hover:bg-navy hover:text-white"
          >
            Soy Cargador →
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Registro gratuito · Lanzamiento 2025
        </p>
      </main>

      {/* Stats */}
      <section className="bg-navy py-16">
        <div className="container-app">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gold">460.000+</div>
              <div className="mt-2 text-sm text-white/60">
                Camiones activos en Argentina
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gold">93%</div>
              <div className="mt-2 text-sm text-white/60">
                Del transporte de mercaderías es por ruta
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gold">USD 35.000M</div>
              <div className="mt-2 text-sm text-white/60">
                Mercado sin digitalizar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark py-8 text-center text-sm text-white/40">
        <div className="container-app">
          <p className="font-semibold text-white/70">🚛 CarGA</p>
          <p className="mt-1">La bolsa de cargas digital de Argentina</p>
          <p className="mt-3">
            Desarrollado por{' '}
            <a
              href="https://codexium.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 underline hover:text-white"
            >
              Codexium
            </a>
          </p>
          <p className="mt-2">© 2025 CarGA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
