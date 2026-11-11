import { COLUMNS, ROWS } from './data';
import { BadTable } from './components/BadTable';

export default function App() {
  return (
    <div className="app">
      <h1>
        Таблица {COLUMNS.length} колонок × {ROWS.length} строк
      </h1>
      <p className="subtitle">
        Resize колонок (тянуть за правый край) · перетаскивание колонок (drag за заголовок) ·
        сортировка (клик по заголовку) · поиск по каждой колонке.
        <br />
        <b>Внимание:</b> это намеренно неоптимизированная реализация — для демонстрации
        проблем производительности (без виртуализации, мемоизации и&nbsp;стабильных
        обработчиков).
      </p>

      <BadTable />
    </div>
  );
}