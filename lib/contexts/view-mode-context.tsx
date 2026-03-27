'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TUserRole } from '@/types/database';

// Super admin emails — loaded from env var, comma-separated
// Configure NEXT_PUBLIC_SUPER_ADMIN_EMAILS in .env.local
const SUPER_ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ?? ''
)
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

type TViewMode = TUserRole;

interface TViewModeContext {
  /** The user's actual role from the DB */
  actualRole: TUserRole;
  /** The currently active view mode (may differ from actualRole for super admins) */
  viewMode: TViewMode;
  /** Whether this user can switch roles */
  canSwitchRoles: boolean;
  /** Available roles this user can switch to */
  availableRoles: TViewMode[];
  /** Switch to a different view mode */
  setViewMode: (mode: TViewMode) => void;
  /** Whether the user is a super admin */
  isSuperAdmin: boolean;
  /** Whether currently viewing as admin */
  isAdminView: boolean;
  /** Whether currently viewing as transportista */
  isTransportistaView: boolean;
  /** Whether currently viewing as cargador */
  isCargadorView: boolean;
  /** Loading state */
  loading: boolean;
}

const ViewModeContext = createContext<TViewModeContext>({
  actualRole: 'transportista',
  viewMode: 'transportista',
  canSwitchRoles: false,
  availableRoles: [],
  setViewMode: () => {},
  isSuperAdmin: false,
  isAdminView: false,
  isTransportistaView: false,
  isCargadorView: false,
  loading: true,
});

export function useViewMode() {
  return useContext(ViewModeContext);
}

const STORAGE_KEY = 'carga_view_mode';

interface TViewModeProviderProps {
  children: ReactNode;
}

export function ViewModeProvider({ children }: TViewModeProviderProps) {
  const [actualRole, setActualRole] = useState<TUserRole>('transportista');
  const [viewMode, setViewModeState] = useState<TViewMode>('transportista');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserRole() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Check if this is a super admin
      const isSuper = SUPER_ADMIN_EMAILS.includes(user.email ?? '');
      setIsSuperAdmin(isSuper);

      // Get role from users table
      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = (userRow?.role as TUserRole) ?? 'transportista';
      setActualRole(role);

      // Restore saved view mode for super admins
      if (isSuper) {
        const saved = localStorage.getItem(STORAGE_KEY) as TViewMode | null;
        if (saved && ['admin', 'transportista', 'cargador'].includes(saved)) {
          setViewModeState(saved);
        } else {
          setViewModeState(role);
        }
      } else {
        setViewModeState(role);
      }

      setLoading(false);
    }

    loadUserRole();
  }, []);

  const setViewMode = useCallback(
    (mode: TViewMode) => {
      if (!isSuperAdmin) return;
      setViewModeState(mode);
      localStorage.setItem(STORAGE_KEY, mode);
    },
    [isSuperAdmin]
  );

  const canSwitchRoles = isSuperAdmin;
  const availableRoles: TViewMode[] = isSuperAdmin
    ? ['admin', 'transportista', 'cargador']
    : [];

  const value: TViewModeContext = {
    actualRole,
    viewMode,
    canSwitchRoles,
    availableRoles,
    setViewMode,
    isSuperAdmin,
    isAdminView: viewMode === 'admin',
    isTransportistaView: viewMode === 'transportista',
    isCargadorView: viewMode === 'cargador',
    loading,
  };

  return (
    <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
  );
}
