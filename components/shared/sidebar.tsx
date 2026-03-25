'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TRole = 'transportista' | 'cargador' | 'admin';

interface TNavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: Record<TRole, TNavItem[]> = {
  transportista: [
    { label: 'Panel', href: '/t-panel', icon: '📊' },
    { label: 'Cargas', href: '/t-cargas', icon: '📦' },
    { label: 'Mapa', href: '/t-mapa', icon: '🗺️' },
    { label: 'Mi Perfil', href: '/t-perfil', icon: '👤' },
  ],
  cargador: [
    { label: 'Panel', href: '/c-panel', icon: '📊' },
    { label: 'Publicar Carga', href: '/c-publicar', icon: '📝' },
    { label: 'Mis Cargas', href: '/c-mis-cargas', icon: '📦' },
    { label: 'Mi Perfil', href: '/c-perfil', icon: '👤' },
  ],
  admin: [
    { label: 'Panel', href: '/a-panel', icon: '📊' },
    { label: 'Usuarios', href: '/a-usuarios', icon: '👥' },
    { label: 'Cargas', href: '/a-cargas', icon: '📦' },
    { label: 'Reportes', href: '/a-reportes', icon: '📈' },
  ],
};

interface TSidebarProps {
  role: TRole;
}

export function Sidebar({ role }: TSidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:block">
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-navy'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-base" role="img" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
