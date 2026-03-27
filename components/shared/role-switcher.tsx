'use client';

import { useRouter } from 'next/navigation';
import { useViewMode } from '@/lib/contexts/view-mode-context';
import type { TUserRole } from '@/types/database';

const ROLE_CONFIG: Record<TUserRole, { label: string; icon: string; color: string; dashboard: string }> = {
  admin: {
    label: 'Admin',
    icon: '🛡️',
    color: 'bg-purple-500',
    dashboard: '/a-panel',
  },
  transportista: {
    label: 'Transportista',
    icon: '🚛',
    color: 'bg-gold',
    dashboard: '/t-panel',
  },
  cargador: {
    label: 'Cargador',
    icon: '📦',
    color: 'bg-brand-blue',
    dashboard: '/c-panel',
  },
};

export function RoleSwitcher() {
  const router = useRouter();
  const { viewMode, canSwitchRoles, availableRoles, setViewMode } = useViewMode();

  if (!canSwitchRoles) return null;

  const current = ROLE_CONFIG[viewMode];

  function handleSwitch(role: TUserRole) {
    setViewMode(role);
    const config = ROLE_CONFIG[role];
    router.push(config.dashboard);
  }

  return (
    <div className="relative group">
      {/* Current role indicator */}
      <button
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50"
        aria-label="Cambiar rol"
      >
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${current.color}`}
        />
        <span className="hidden sm:inline">{current.icon} {current.label}</span>
        <span className="sm:hidden">{current.icon}</span>
        <svg
          className="h-3 w-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="invisible absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
        <div className="border-b border-gray-100 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Cambiar vista
          </p>
        </div>
        {availableRoles.map((role) => {
          const config = ROLE_CONFIG[role];
          const isActive = viewMode === role;

          return (
            <button
              key={role}
              onClick={() => handleSwitch(role)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'bg-navy/5 font-semibold text-navy'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${config.color}`}
              />
              <span>{config.icon}</span>
              <span>{config.label}</span>
              {isActive && (
                <span className="ml-auto text-xs text-navy">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
