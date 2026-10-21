import { generateKeyBetween } from 'fractional-indexing';

/*
  Board order. Each task may carry a `rank`: a short base-62 string (fractional indexing). Moving a task
  between two others gives it a key between theirs, so a move is ONE write and never renumbers the rest.
  Keys are compared as plain strings (code-unit order), never with localeCompare.

  Tasks made before the board have no rank: they come after the ranked ones, oldest first, until the
  owner opens the board, which gives them ranks in that order (see unrankedFixes).
*/

export const BOARD_COLUMNS = ['todo', 'in_progress', 'done'];

const byKey = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const millis = (task) => task.createdAt?.toMillis?.() ?? 0;

/** Board order inside one column: ranked first (by rank), then unranked (oldest first). Ties by id. */
export function compareRank(a, b) {
  if (a.rank && b.rank) return byKey(a.rank, b.rank) || byKey(a.id, b.id);
  if (a.rank) return -1;
  if (b.rank) return 1;
  return millis(a) - millis(b) || byKey(a.id, b.id);
}

/** { todo: [...], in_progress: [...], done: [...] }, each in board order. */
export function groupByStatus(tasks) {
  const columns = Object.fromEntries(BOARD_COLUMNS.map((s) => [s, []]));
  for (const task of tasks) columns[task.status]?.push(task);
  for (const list of Object.values(columns)) list.sort(compareRank);
  return columns;
}

/**
 * Rank for a task placed at `index` in `list` (the column WITHOUT the moved task).
 * Uses the nearest ranked neighbours, so an unranked neighbour never blocks a move.
 */
export function rankAt(list, index) {
  const before = list.slice(0, index).reverse().find((t) => t.rank)?.rank ?? null;
  // Unranked tasks sort after every ranked one, so only a ranked task can be the upper bound.
  const after = list.slice(index).find((t) => t.rank)?.rank ?? null;
  try {
    return generateKeyBetween(before, after);
  } catch {
    // Two members gave tasks the same key at the same moment: place it right after the one before.
    return generateKeyBetween(before, null);
  }
}

/** Rank for the end of a column (new tasks go to the bottom of "To Do"). */
export const rankAtEnd = (list) => rankAt(list, list.length);

/**
 * Ranks for the column's unranked tasks, in their current order, after its last ranked task:
 * [{ id, rank }]. The owner's board writes these once, so everyone then sees the same order.
 */
export function unrankedFixes(list) {
  let last = [...list].reverse().find((t) => t.rank)?.rank ?? null;
  return list.filter((t) => !t.rank).map((t) => {
    last = generateKeyBetween(last, null);
    return { id: t.id, rank: last };
  });
}
