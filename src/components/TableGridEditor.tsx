import React from 'react';
import { AlignCenter, AlignLeft, AlignRight, Plus, Trash2 } from 'lucide-react';
import { TableData } from '../types/paper';
import { ActiveMathTarget, MathEditRequest, VisualRichInput } from './VisualRichInput';

interface TableGridEditorProps {
  table: TableData;
  onChange: (next: TableData) => void;
  onRemoveTable?: () => void;
  onFocusTarget?: (target: ActiveMathTarget) => void;
  onEditChip?: (req: MathEditRequest) => void;
}

export const TableGridEditor: React.FC<TableGridEditorProps> = ({
  table,
  onChange,
  onRemoveTable,
  onFocusTarget,
  onEditChip,
}) => {
  const colCount = table.headers.length;

  const updateHeader = (colIdx: number, val: string) => {
    const headers = [...table.headers];
    headers[colIdx] = val;
    onChange({ ...table, headers });
  };

  const updateCell = (rowIdx: number, colIdx: number, val: string) => {
    const rows = table.rows.map((r, i) =>
      i === rowIdx ? r.map((c, j) => (j === colIdx ? val : c)) : r
    );
    onChange({ ...table, rows });
  };

  const addRow = () => {
    onChange({
      ...table,
      rows: [...table.rows, Array(colCount).fill('')],
    });
  };

  const removeRow = (rowIdx: number) => {
    if (table.rows.length <= 1) return;
    onChange({
      ...table,
      rows: table.rows.filter((_, i) => i !== rowIdx),
    });
  };

  const addColumn = () => {
    onChange({
      ...table,
      headers: [...table.headers, `Column ${colCount + 1}`],
      rows: table.rows.map((r) => [...r, '']),
      colAligns: [...(table.colAligns ?? Array(colCount).fill('left')), 'left'],
    });
  };

  const removeColumn = (colIdx: number) => {
    if (colCount <= 2) return;
    onChange({
      ...table,
      headers: table.headers.filter((_, i) => i !== colIdx),
      rows: table.rows.map((r) => r.filter((_, i) => i !== colIdx)),
      colAligns: (table.colAligns ?? Array(colCount).fill('left')).filter((_, i) => i !== colIdx),
    });
  };

  const cycleAlign = (colIdx: number) => {
    const current = table.colAligns?.[colIdx] ?? 'left';
    const nextAlign: 'left' | 'center' | 'right' =
      current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
    const aligns = Array.from({ length: colCount }, (_, i) => table.colAligns?.[i] ?? 'left');
    aligns[colIdx] = nextAlign;
    onChange({ ...table, colAligns: aligns });
  };

  return (
    <div className="space-y-2 border border-zinc-200 rounded p-2.5 bg-zinc-50/50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={table.showHeader}
              onChange={(e) => onChange({ ...table, showHeader: e.target.checked })}
              className="accent-zinc-900"
            />
            <span>Header row</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={table.bordered}
              onChange={(e) => onChange({ ...table, bordered: e.target.checked })}
              className="accent-zinc-900"
            />
            <span>Borders</span>
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 border border-zinc-200 bg-white hover:bg-zinc-100 rounded text-zinc-700 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Row
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 border border-zinc-200 bg-white hover:bg-zinc-100 rounded text-zinc-700 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Column
          </button>
          {onRemoveTable && (
            <button
              type="button"
              onClick={onRemoveTable}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 text-zinc-500 hover:text-red-600 cursor-pointer"
              title="Remove table"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs bg-white">
          <thead>
            <tr className="border-b border-zinc-200">
              {table.headers.map((h, colIdx) => {
                const align = table.colAligns?.[colIdx] ?? 'left';
                const AlignIcon =
                  align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignLeft;
                return (
                  <th key={colIdx} className="p-1 border border-zinc-200 bg-zinc-50 font-normal align-top">
                    <div className="flex items-center gap-1 mb-1 justify-between">
                      <button
                        type="button"
                        onClick={() => cycleAlign(colIdx)}
                        title={`Column alignment: ${align} (click to switch)`}
                        className="p-0.5 text-zinc-500 hover:text-zinc-900 rounded cursor-pointer"
                      >
                        <AlignIcon className="w-3 h-3" />
                      </button>
                      {colCount > 2 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(colIdx)}
                          title="Delete column"
                          className="p-0.5 text-zinc-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {table.showHeader && (
                      <VisualRichInput
                        value={h}
                        onChange={(val) => updateHeader(colIdx, val)}
                        placeholder={`Header ${colIdx + 1}`}
                        className="!text-xs !py-1 !px-1.5 font-medium"
                        onFocusTarget={onFocusTarget}
                        onEditChip={onEditChip}
                      />
                    )}
                  </th>
                );
              })}
              <th className="w-7 border border-zinc-200 bg-zinc-50" />
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-1 border border-zinc-200 align-top">
                    <VisualRichInput
                      value={cell}
                      onChange={(val) => updateCell(rowIdx, colIdx, val)}
                      placeholder="Value"
                      className="!text-xs !py-1 !px-1.5 !border-transparent hover:!border-zinc-200"
                      onFocusTarget={onFocusTarget}
                      onEditChip={onEditChip}
                    />
                  </td>
                ))}
                <td className="p-1 border border-zinc-200 text-center">
                  <button
                    type="button"
                    disabled={table.rows.length <= 1}
                    onClick={() => removeRow(rowIdx)}
                    title="Delete row"
                    className="p-0.5 text-zinc-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
