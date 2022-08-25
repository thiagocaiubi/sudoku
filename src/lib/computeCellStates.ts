import mapRawToColumnIndex from '../hooks/mapRawToColumnIndex';
import mapRawToRowIndex from '../hooks/mapRawToRowIndex';
import { CellState, ComputedCellState } from '../hooks/useGameState';
import createNineObjects from './createNineObjects';
import mapRawToBoxIndex from './mapRawToBoxIndex';

export default function useErrors(raw: CellState[]): ComputedCellState[] {
  const boxes = createNineObjects();
  const rows = createNineObjects();
  const columns = createNineObjects();
  const selectedCells = raw.filter(cell => cell.selected);
  const highlightedValue =
    (selectedCells.length === 1 && selectedCells[0].value) || null;
  const highlightedCellsIndexes = raw
    .map((cell, index) => (cell.value === highlightedValue ? index : 0))
    .filter(index => index !== 0);
  const forbiddenBoxes = highlightedCellsIndexes.map(index =>
    mapRawToBoxIndex(index),
  );
  const forbiddenRows = highlightedCellsIndexes.map(index =>
    mapRawToRowIndex(index),
  );
  const forbiddenColumns = highlightedCellsIndexes.map(index =>
    mapRawToColumnIndex(index),
  );

  raw.forEach(({ value }, index) => {
    if (value === 0) {
      return;
    }

    boxes[mapRawToBoxIndex(index)][value] += 1;
    rows[mapRawToRowIndex(index)][value] += 1;
    columns[mapRawToColumnIndex(index)][value] += 1;
  });

  return raw.map((cellState, index) => {
    const boxIndex = mapRawToBoxIndex(index);
    const rowIndex = mapRawToRowIndex(index);
    const columnIndex = mapRawToColumnIndex(index);

    const error =
      cellState.value !== 0 &&
      !cellState.fixed &&
      (boxes[boxIndex][cellState.value] !== 1 ||
        rows[rowIndex][cellState.value] !== 1 ||
        columns[columnIndex][cellState.value] !== 1);

    return {
      ...cellState,
      error,
      highlighted: cellState.value === highlightedValue,
      forbidden:
        Boolean(highlightedValue && cellState.value) ||
        forbiddenBoxes.includes(boxIndex) ||
        forbiddenRows.includes(rowIndex) ||
        forbiddenColumns.includes(columnIndex),
    };
  });
}
