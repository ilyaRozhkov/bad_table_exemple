import { useRef, useState } from 'react';
import { COLUMNS, COLUMN_TITLES, ROWS, type Row } from '../data';
import { ColumnHeader, type SortDir } from './ColumnHeader';

const DEFAULT_WIDTH = 140;
type SortState = { key: string; dir: 1 | -1 } | null;

export function BadTable() {
  const [order, setOrder] = useState<string[]>(() => COLUMNS.map((c) => c.key));
  const [widths, setWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(COLUMNS.map((c) => [c.key, DEFAULT_WIDTH])),
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);

  const renderCount = useRef(0);
  renderCount.current += 1;

  // ❌ НИКАКОЙ мемоизации — пересчёт на каждый рендер
  let data: Row[] = ROWS;
  for (const key of Object.keys(filters)) {
    const q = (filters[key] ?? '').trim().toLowerCase();
    if (!q) continue;
    // ✅ ИСПРАВЛЕНО: добавлен String(row[key])
    data = data.filter((row) => String(row[key]).toLowerCase().includes(q));
  }
  if (sort) {
    const { key, dir } = sort;
    data = [...data].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      // ✅ ИСПРАВЛЕНО: добавлен String(bv), чтобы localeCompare получил строку
      return String(av).localeCompare(String(bv), 'ru') * dir;
    });
  }

  // ❌ обработчики создаются заново на каждый рендер
  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 1 };
      if (prev.dir === 1) return { key, dir: -1 };
      return null;
    });
  };

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const startResize = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = widths[key];

    const onMove = (ev: MouseEvent) => {
      setWidths((prev) => ({
        ...prev,
        [key]: Math.max(60, startWidth + ev.clientX - startX),
      }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const moveColumn = (target: string) => {
    if (!dragKey || dragKey === target) return;
    setOrder((prev) => {
      const from = prev.indexOf(dragKey);
      const to = prev.indexOf(target);
      if (from < 0 || to < 0) return prev;
      const next = prev.slice();
      next.splice(from, 1);
      next.splice(to, 0, dragKey);
      return next;
    });
  };

  const totalWidth = order.reduce((sum, k) => sum + widths[k], 0);

  return (
    <div>
      <div className="stats">
        <span>Рендеров: <b>{renderCount.current}</b></span>
        <span>Строк в выборке: <b>{data.length}</b></span>
        <span>Ячеек в DOM: <b>{(data.length * order.length).toLocaleString('ru-RU')}</b></span>
        <span>Виртуализация: <b className="bad">нет</b></span>
        <span>memo / useMemo / useCallback: <b className="bad">нет</b></span>
      </div>

      <div className="table-wrap">
        <table style={{ width: totalWidth }}>
          <colgroup>
            {order.map((key) => (
              <col key={key} style={{ width: widths[key] }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {order.map((key) => {
                const sortDir: SortDir =
                  sort?.key === key ? (sort.dir === 1 ? 'asc' : 'desc') : null;
                return (
                  <ColumnHeader
                    key={key}
                    colKey={key}
                    title={COLUMN_TITLES[key]}
                    width={widths[key]}
                    sortDir={sortDir}
                    filterValue={filters[key] ?? ''}
                    onSort={toggleSort}
                    onFilter={setFilter}
                    onResizeStart={startResize}
                    onDragStart={setDragKey}
                    onDrop={moveColumn}
                  />
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                {order.map((key) => (
                  // ❌ новый объект стиля на каждую ячейку при каждом рендере
                  <td key={key} style={{ padding: '4px 8px' }}>
                    {/* ✅ ИСПРАВЛЕНО: String(row[key]) уже используется здесь, это правильно */}
                    {String(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
