// All stock rules live here so the customer site and admin always agree.
import { isQuantityOnlyCategory } from './constants';

/** Rows to display: one "Free Size" row, or one row per size. */
export function sizeRows(p) {
  if (!p) return [];
  if (p.sizeType === 'sized' && !isQuantityOnlyCategory(p.category)) return p.sizes || [];
  return [{ label: 'Free Size', stock: Number(p.freeSizeStock) || 0 }];
}

export function sizeState(stock) {
  return stock <= 0 ? 'out' : 'in';
}

export function totalStock(p) {
  return sizeRows(p).reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
}

export const isOutOfStock = (p) => totalStock(p) <= 0;

export function stockSummary(p) {
  const rows = sizeRows(p);
  const out = rows.filter((s) => s.stock <= 0).map((s) => s.label);
  const available = rows.filter((s) => s.stock > 0).map((s) => s.label);
  return { out, available, total: totalStock(p), needsAttention: out.length > 0 };
}

/**
 * Chip text + tone for the admin "Needs Attention" list.
 */
export function attentionChip(p) {
  const { out, total } = stockSummary(p);
  if (p.sizeType !== 'sized' || isQuantityOnlyCategory(p.category)) {
    if (total <= 0) return { tone: 'red', text: 'Quantity · 0 in stock' };
    return null;
  }
  if (total <= 0) return { tone: 'red', text: 'All sizes out of stock' };
  if (out.length) return { tone: 'red', text: `${out.join(', ')} out of stock` };
  return null;
}
