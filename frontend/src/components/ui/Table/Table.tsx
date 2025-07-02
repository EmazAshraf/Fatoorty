import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  fixed?: 'left' | 'right';
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: React.ReactNode;
  rowKey?: string | ((record: T) => string);
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  scroll?: { x?: number; y?: number };
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

const sizeClasses = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base'
};

const cellPadding = {
  small: 'px-3 py-2',
  medium: 'px-4 py-3',
  large: 'px-6 py-4'
};

export default function Table<T = any>({
  columns,
  data,
  loading = false,
  empty,
  rowKey = 'id',
  onRow,
  scroll,
  size = 'medium',
  bordered = false,
  hoverable = true,
  striped = false,
  sortConfig,
  onSort
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as any)[rowKey] || index.toString();
  };

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    onSort(columnKey, direction);
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getCellValue = (record: T, column: Column<T>) => {
    if (column.render) {
      const index = data.indexOf(record);
      const value = column.dataIndex ? (record as any)[column.dataIndex] : record;
      return column.render(value, record, index);
    }
    
    if (column.dataIndex) {
      return (record as any)[column.dataIndex];
    }
    
    return '';
  };

  const tableClasses = `
    min-w-full divide-y divide-gray-200 
    ${sizeClasses[size]}
    ${bordered ? 'border border-gray-200' : ''}
  `.trim();

  const containerClasses = `
    overflow-hidden shadow ring-1 ring-gray-200 ring-opacity-5 rounded-lg
    ${scroll?.x ? 'overflow-x-auto' : ''}
    ${scroll?.y ? 'overflow-y-auto' : ''}
  `.trim();

  const containerStyle: React.CSSProperties = {
    ...(scroll?.x && { minWidth: scroll.x }),
    ...(scroll?.y && { maxHeight: scroll.y })
  };

  if (loading) {
    return (
      <div className={containerClasses} style={containerStyle}>
        <table className={tableClasses}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${cellPadding[size]} text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className={`${cellPadding[size]} whitespace-nowrap`}>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={containerClasses}>
        <table className={tableClasses}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${cellPadding[size]} text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="text-center py-12">
          {empty || (
            <div className="text-gray-500">
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm">There are no records to display at this time.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} style={containerStyle}>
      <table className={tableClasses}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  ${cellPadding[size]} text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                  ${column.align === 'center' ? 'text-center' : ''}
                  ${column.align === 'right' ? 'text-right' : ''}
                `.trim()}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.title}</span>
                  {column.sortable && renderSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y-0' : ''}`}>
          {data.map((record, index) => {
            const key = getRowKey(record, index);
            const rowProps = onRow ? onRow(record, index) : {};
            
            return (
              <tr
                key={key}
                className={`
                  ${hoverable ? 'hover:bg-gray-50' : ''}
                  ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                `.trim()}
                {...rowProps}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      ${cellPadding[size]} whitespace-nowrap text-gray-900
                      ${column.align === 'center' ? 'text-center' : ''}
                      ${column.align === 'right' ? 'text-right' : ''}
                    `.trim()}
                  >
                    {getCellValue(record, column)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 