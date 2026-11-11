import { memo } from 'react';
import type React from 'react';

export type SortDir = 'asc' | 'desc' | null;

interface ColumnHeaderProps {
  colKey: string;
  title: string;
  width: number;
  sortDir: SortDir;
  filterValue: string;
  onSort: (key: string) => void;
  onFilter: (key: string, value: string) => void;
  onResizeStart: (key: string, e: React.MouseEvent) => void;
  onDragStart: (key: string) => void;
  onDrop: (key: string) => void;
}

export const ColumnHeader = memo(function ColumnHeader({
  colKey,
  title,
  width,
  sortDir,
  filterValue,
  onSort,
  onFilter,
  onResizeStart,
  onDragStart,
  onDrop,
}: ColumnHeaderProps) {
  return (
    // ✅ ИСПРАВЛЕНО: используем <th> вместо <div>
    <th
      className="col-header"
      style={{ width }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(colKey)}
    >
      <div className="th-body">
        <div
          className="th-title"
          draggable
          onDragStart={() => onDragStart(colKey)}
          onClick={() => onSort(colKey)}
          title="Клик — сортировка · перетащите — переместить колонку"
        >
          <span className="th-label">{title}</span>
          {sortDir && <span className="sort-ind">{sortDir === 'asc' ? '▲' : '▼'}</span>}
        </div>

        <input
          className="th-filter"
          value={filterValue}
          onChange={(e) => onFilter(colKey, e.target.value)}
          placeholder="поиск…"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="resizer" onMouseDown={(e) => onResizeStart(colKey, e)} />
    </th>
  );
});