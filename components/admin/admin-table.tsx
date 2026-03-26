'use client';

import { type ReactNode } from 'react';

interface TColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface TPagination {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

interface TAdminTableProps<T extends Record<string, unknown>> {
  columns: TColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  pagination?: TPagination;
  emptyMessage?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export function AdminTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onRowClick,
  pagination,
  emptyMessage = 'No hay datos para mostrar.',
  sortColumn,
  sortDirection,
  onSort,
}: TAdminTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  function getCellValue(row: T, col: TColumn<T>): ReactNode {
    if (col.render) return col.render(row);
    const value = row[col.key];
    if (value === null || value === undefined) return '—';
    return String(value);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold text-gray-600 ${
                    col.sortable && onSort ? 'cursor-pointer select-none hover:text-navy' : ''
                  }`}
                  onClick={() => {
                    if (col.sortable && onSort) onSort(col.key);
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortColumn === col.key && (
                      <span className="text-xs text-navy">
                        {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={String(row['id'] ?? idx)}
                className={`border-b border-gray-50 transition-colors last:border-0 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-gray-50'
                    : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-800">
                    {getCellValue(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="divide-y divide-gray-100 md:hidden">
        {rows.map((row, idx) => (
          <div
            key={String(row['id'] ?? idx)}
            className={`space-y-2 p-4 ${
              onRowClick ? 'cursor-pointer active:bg-gray-50' : ''
            }`}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-gray-500">{col.label}</span>
                <span className="text-right text-sm text-gray-800">
                  {getCellValue(row, col)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <button
            onClick={pagination.onPrev}
            disabled={pagination.page <= 1}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            P\u00e1gina {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={pagination.onNext}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
