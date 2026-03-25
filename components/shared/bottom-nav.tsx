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
    { label: 'Perfil', href: '/t-perfil', icon: '👤' },
  ],
  cargador: [
    { label: 'Panel', href: '/c-panel', icon: '📊' },
    { label: 'Publicar', href: '/c-publicar', icon: '📝' },
    { label: 'Cargas', href: '/c-mis-cargas', icon: '📦' },
    { label: 'Perfil', href: '/c-perfil', icon: '👤' },
  ],
  admin: [
    { label: 'Panel', href: '/a-panel', icon: '📊' },
    { label: 'Usuarios', href: '/a-usuarios', icon: '👥' },
    { label: 'Cargas', href: '/a-cargas', icon: '📦' },
    { label: 'Reportes', href: '/a-reportes', icon: '📈' },
  ],
};

interface TBottomNavProps {
  role: TRole;
}

export function BottomNav({ role }: TBottomNavProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden">
      <ul className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-navy'
                    : 'text-gray-500 hover:text-navy'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-lg" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b bg-gold" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
