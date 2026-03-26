'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Modal } from '@/components/ui/modal';
import { AdminTable } from '@/components/admin/admin-table';
import { ActionDropdown } from '@/components/admin/action-dropdown';
import type { TUserRole } from '@/types/database';

interface TAdminUser {
  id: string;
  email: string;
  role: TUserRole;
  created_at: string;
  updated_at: string;
  nombre: string;
  cuit: string;
  verified: boolean;
  plan: string;
  rating: number;
  provincia: string;
  avatar_url: string | null;
}

const ROLE_BADGES: Record<TUserRole, { label: string; variant: 'default' | 'gold' | 'green' | 'red' | 'blue' | 'gray' }> = {
  transportista: { label: 'Transportista', variant: 'blue' },
  cargador: { label: 'Cargador', variant: 'gold' },
  admin: { label: 'Admin', variant: 'default' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<TAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<TAdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setUsers(json.data ?? []);
        setTotalPages(json.meta?.total_pages ?? 1);
      }
    } catch {
      // Connection error — keep existing data
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleAction(userId: string, action: 'suspend' | 'activate' | 'change_role', value?: TUserRole) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchUsers();
        setSelectedUser(null);
      }
    } catch {
      // Silent fail — user will see no change
    } finally {
      setActionLoading(false);
    }
  }

  type TUserRowData = TAdminUser & Record<string, unknown>;

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre / Empresa',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'role',
      label: 'Rol',
      render: (row: TUserRowData) => {
        const info = ROLE_BADGES[row.role];
        return <Badge variant={info.variant}>{info.label}</Badge>;
      },
    },
    {
      key: 'cuit',
      label: 'CUIT',
    },
    {
      key: 'verified',
      label: 'Verificado',
      render: (row: TUserRowData) => (
        <Badge variant={row.verified ? 'green' : 'gray'}>
          {row.verified ? 'S\u00ed' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row: TUserRowData) => (
        <span className="text-sm capitalize">{row.plan}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Registro',
      sortable: true,
      render: (row: TUserRowData) => (
        <span className="text-sm text-gray-500">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row: TUserRowData) => (
        <ActionDropdown
          actions={[
            {
              label: 'Ver detalle',
              onClick: () => setSelectedUser(row),
            },
            {
              label: row.verified ? 'Suspender' : 'Activar',
              onClick: () =>
                handleAction(row.id, row.verified ? 'suspend' : 'activate'),
              variant: row.verified ? ('danger' as const) : ('default' as const),
            },
            {
              label: 'Cambiar a Transportista',
              onClick: () => handleAction(row.id, 'change_role', 'transportista'),
            },
            {
              label: 'Cambiar a Cargador',
              onClick: () => handleAction(row.id, 'change_role', 'cargador'),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Gesti&oacute;n de Usuarios</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Buscar por email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los roles</option>
            <option value="transportista">Transportistas</option>
            <option value="cargador">Cargadores</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <AdminTable<TUserRowData>
          columns={columns}
          rows={users as TUserRowData[]}
          onRowClick={(row) => setSelectedUser(row)}
          emptyMessage="No se encontraron usuarios."
          pagination={{
            page,
            totalPages,
            onPrev: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
          }}
        />
      )}

      {/* User detail modal */}
      <Modal
        open={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title="Detalle del usuario"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium text-gray-500">Nombre / Empresa</p>
                <p className="text-gray-800">{selectedUser.nombre}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Email</p>
                <p className="text-gray-800">{selectedUser.email}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Rol</p>
                <Badge variant={ROLE_BADGES[selectedUser.role].variant}>
                  {ROLE_BADGES[selectedUser.role].label}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-gray-500">CUIT</p>
                <p className="text-gray-800">{selectedUser.cuit}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Verificado</p>
                <Badge variant={selectedUser.verified ? 'green' : 'gray'}>
                  {selectedUser.verified ? 'S\u00ed' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-gray-500">Plan</p>
                <p className="capitalize text-gray-800">{selectedUser.plan}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Rating</p>
                <p className="text-gray-800">{selectedUser.rating.toFixed(1)} / 5</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Provincia</p>
                <p className="text-gray-800">{selectedUser.provincia}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-500">Fecha de registro</p>
                <p className="text-gray-800">{formatDate(selectedUser.created_at)}</p>
              </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() =>
                  handleAction(
                    selectedUser.id,
                    selectedUser.verified ? 'suspend' : 'activate'
                  )
                }
                disabled={actionLoading}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  selectedUser.verified
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-brand-green hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {actionLoading
                  ? 'Procesando...'
                  : selectedUser.verified
                    ? 'Suspender'
                    : 'Activar'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
