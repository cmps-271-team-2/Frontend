"use client";

import { useState } from "react";
import { Button } from "../ui/Components";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onSort?: (key: string, order: "asc" | "desc") => void;
  isLoading?: boolean;
  emptyMessage?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pagination,
  onPageChange,
  onPerPageChange,
  onSort,
  isLoading = false,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  };

  const renderCellValue = (row: T, column: Column<T>) => {
    const value = column.key in row ? row[column.key as keyof T] : null;
    
    if (column.render) {
      return column.render(value, row);
    }
    
    return value?.toString() || "-";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      {column.label}
                      {sortKey === column.key && (
                        <span className="text-blue-600">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {renderCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.perPage + 1} to{" "}
              {Math.min(pagination.page * pagination.perPage, pagination.total)} of{" "}
              {pagination.total} results
            </span>
            
            {onPerPageChange && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Per page:</label>
                <select
                  value={pagination.perPage}
                  onChange={(e) => onPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="secondary"
              size="sm"
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              variant="secondary"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
