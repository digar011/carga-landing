'use client';

import Link from 'next/link';

interface THeaderProps {
  notificationCount?: number;
  userInitials?: string;
}

export function Header({
  notificationCount = 0,
  userInitials = 'US',
}: THeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Logo */}
      <Link
        href="/panel"
        className="flex items-center gap-2 text-lg font-bold text-navy"
      >
        <span className="text-xl" role="img" aria-label="Camion">
          🚛
        </span>
        <span className="hidden xs:inline">CarGA</span>
      </Link>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-navy"
          aria-label={`Notificaciones${notificationCount > 0 ? ` (${notificationCount} nuevas)` : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white transition-opacity hover:opacity-90"
          aria-label="Mi cuenta"
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}
