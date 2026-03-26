'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Modal } from '@/components/ui/modal';
import { AdminTable } from '@/components/admin/admin-table';
import { ActionDropdown } from '@/components/admin/action-dropdown';
import type { TLoadStatus, TCargoType } from '@/types/database';

interface TCargadorInfo {
  id: string;
  empresa: string;
  cuit: string;
  contacto_nombre: string;
  verified: boolean;
  avatar_url: string | null;
}

interface TAdminLoad {
  id: string;
  cargador_id: string;
  origen_ciudad: string;
  origen_provincia: string;
  destino_ciudad: string;
  destino_provincia: string;
  tipo_carga: TCargoType;
  peso_tn: number;
  tarifa_ars: number;
  tarifa_negociable: boolean;
  estado: TLoadStatus;
  fecha_carga: string;
  descripcion_carga: string;
  created_at: string;
  cargador: TCargadorInfo | TCargadorInfo[] | null;
}

const STATUS_BADGES: Record<TLoadStatus, { label: string; variant: 'default' | 'gold' | 'green' | 'red' | 'blue' | 'gray' }> = {
  publicada: { label: 'Publicada', variant: 'green' },
  aplicada: { label: 'Aplicada', variant: 'blue' },
  asignada: { label: 'Asignada', variant: 'gold' },
  en_camino: { label: 'En camino', variant: 'blue' },
  entregada: { label: 'Entregada', variant: 'green' },
  calificada: { label: 'Calificada', variant: 'default' },
  cancelada: { label: 'Cancelada', variant: 'red' },
};

const CARGO_LABELS: Record<TCargoType, string> = {
  cereales: 'Cereales',
  alimentos: 'Alimentos',
  maquinaria: 'Maquinaria',
  materiales_construccion: 'Mat. Construcci\u00f3n',
  productos_quimicos: 'Qu\u00edmicos',
  vehiculos: 'Veh\u00edculos',
  ganado: 'Ganado',
  general: 'General',
  refrigerados: 'Refrigerados',
  peligrosos: 'Peligrosos',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminCargasPage() {
  const [loads, setLoads] = useState<TAdminLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLoad, setSelectedLoad] = useState<TAdminLoad | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/admin/loads?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setLoads(json.data ?? []);
        setTotalPages(json.meta?.total_pages ?? 1);
      }
    } catch {
      // Connection error
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleAction(loadId: string, action: 'cancel' | 'restore') {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/loads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadId, action }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchLoads();
        setSelectedLoad(null);
      }
    } catch {
      // Silent fail
    } finally {
      setActionLoading(false);
    }
  }

  function getCargadorName(load: TAdminLoad): string {
    const cargador = Array.isArray(load.cargador) ? load.cargador[0] : load.cargador;
    return cargador?.empresa ?? '—';
  }

  type TLoadRowData = TAdminLoad & Record<string, unknown>;

  const columns = [
    {
      key: 'ruta',
      label: 'Ruta',
      render: (row: TLoadRowData) => (
        <span className="text-sm">
          {row.origen_ciudad} <span className="text-gray-400">\u2192</span> {row.destino_ciudad}
        </span>
      ),
    },
    {
      key: 'tipo_carga',
      label: 'Tipo',
      render: (row: TLoadRowData) => (
        <span className="text-sm">{CARGO_LABELS[row.tipo_carga] ?? row.tipo_carga}</span>
      ),
    },
    {
      key: 'peso_tn',
      label: 'Peso (tn)',
      sortable: true,
      render: (row: TLoadRowData) => <span className="text-sm">{row.peso_tn}</span>,
    },
    {
      key: 'tarifa_ars',
      label: 'Tarifa',
      sortable: true,
      render: (row: TLoadRowData) => (
        <span className="text-sm font-medium">{formatCurrency(row.tarifa_ars)}</span>
      ),
    },
    {
      key: 'cargador_name',
      label: 'Cargador',
      render: (row: TLoadRowData) => (
        <span className="text-sm">{getCargadorName(row)}</span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: TLoadRowData) => {
        const info = STATUS_BADGES[row.estado];
        return <Badge variant={info.variant}>{info.label}</Badge>;
      },
    },
    {
      key: 'fecha_carga',
      label: 'Fecha',
      sortable: true,
      render: (row: TLoadRowData) => (
        <span className="text-sm text-gray-500">{formatDate(row.fecha_carga)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row: TLoadRowData) => (
        <ActionDropdown
          actions={[
            {
              label: 'Ver detalle',
              onClick: () => setSelectedLoad(row),
            },
            ...(row.estado !== 'cancelada'
              ? [
                  {
                    label: 'Cancelar carga',
                    onClick: () => handleAction(row.id, 'cancel'),
                    variant: 'danger' as const,
                  },
                ]
              : []),
            ...(row.estado === 'cancelada'
              ? [
                  {
                    label: 'Restaurar',
                    onClick: () => handleAction(row.id, 'restore'),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Gesti&oacute;n de Cargas</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Buscar por ciudad o descripci\u00f3n..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="publicada">Publicada</option>
            <option value="aplicada">Aplicada</option>
            <option value="asignada">Asignada</option>
            <option value="en_camino">En camino</option>
            <option value="entregada">Entregada</option>
            <option value="calificada">Calificada</option>
            <option value="cancelada">Cancelada</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <AdminTable<TLoadRowData>
          columns={columns}
          rows={loads as TLoadRowData[]}
          onRowClick={(row) => setSelectedLoad(row)}
          emptyMessage="No se encontraron cargas."
          pagination={{
            page,
            totalPages,
            onPrev: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
          }}
        />
      )}

      {/* Load detail modal */}
      <Modal
        open={selectedLoad !== null}
        onClose={() => setSelectedLoad(null)}
        title="Detalle de la carga"
      >
        {selectedLoad && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <p className="font-medium text-gray-500">Ruta</p>
                <p className="text-gray-800">
                  {selectedLoad.origen_ciudad}, {selectedLoad.origen_provincia}{' '}
                  <span className="text-gray-400">\u2192</span>{' '}
                  {selectedLoad.destino_ciudad}, {selectedLoad.destino_provincia}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Tipo de carga</p>
                <p className="text-gray-800">
                  {CARGO_LABELS[selectedLoad.tipo_carga] ?? selectedLoad.tipo_carga}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Peso</p>
                <p className="text-gray-800">{selectedLoad.peso_tn} tn</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Tarifa</p>
                <p className="font-medium text-gray-800">
                  {formatCurrency(selectedLoad.tarifa_ars)}
                  {selectedLoad.tarifa_negociable && (
                    <span className="ml-1 text-xs text-gray-400">(negociable)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Estado</p>
                <Badge variant={STATUS_BADGES[selectedLoad.estado].variant}>
                  {STATUS_BADGES[selectedLoad.estado].label}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-gray-500">Cargador</p>
                <p className="text-gray-800">{getCargadorName(selectedLoad)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Fecha de carga</p>
                <p className="text-gray-800">{formatDate(selectedLoad.fecha_carga)}</p>
              </div>
              {selectedLoad.descripcion_carga && (
                <div className="col-span-2">
                  <p className="font-medium text-gray-500">Descripci&oacute;n</p>
                  <p className="text-gray-800">{selectedLoad.descripcion_carga}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-gray-100 pt-4">
              {selectedLoad.estado !== 'cancelada' ? (
                <button
                  onClick={() => handleAction(selectedLoad.id, 'cancel')}
                  disabled={actionLoading}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Procesando...' : 'Cancelar carga'}
                </button>
              ) : (
                <button
                  onClick={() => handleAction(selectedLoad.id, 'restore')}
                  disabled={actionLoading}
                  className="rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Procesando...' : 'Restaurar'}
                </button>
              )}
              <button
                onClick={() => setSelectedLoad(null)}
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
