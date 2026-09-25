import Icon from './Icon';
import { isQuantityOnlyCategory } from '../../lib/constants';
import { sizeState, stockSummary } from '../../lib/stock';

const PILL = 'min-w-10 px-2 h-10 rounded-xl font-label-md flex items-center justify-center transition-all';
const PILL_IDLE = `${PILL} border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-medium hover:border-primary active:scale-95`;
const PILL_ON = `${PILL} border-2 border-primary bg-primary/5 text-primary font-semibold active:scale-95`;
const PILL_OUT = `${PILL} border border-outline-variant/30 bg-surface-container text-outline strikethrough-diagonal font-medium cursor-not-allowed opacity-60`;

/** Free-size status chip (green = available, red = not available). */
export function FreeSizeChip({ product }) {
  const { total } = stockSummary(product);
  const ok = total > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-error-container/60 text-error border-error/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-600' : 'bg-error'}`} />
      {quantityOnly ? (ok ? 'Quantity – Available' : 'Quantity – Not Available') : ok ? 'Free Size – Available' : 'Free Size – Not Available'}
    </span>
  );
}

/** Size pills show selectable and sold-out sizes. */
export function SizePills({ product, selected, onSelect }) {
  const { available, out } = stockSummary(product);
  return (
    <>
      <div className="flex flex-wrap items-start gap-2 pt-1">
        {(product.sizes || []).map((s) => {
          const state = sizeState(s.stock);
          return (
            <div key={s.label} className="flex flex-col items-center">
              {state === 'out' ? (
                <button className={PILL_OUT} disabled aria-label={`${s.label} not available`} type="button">
                  {s.label}
                </button>
              ) : (
                <button
                  className={selected === s.label ? PILL_ON : PILL_IDLE}
                  onClick={() => onSelect?.(selected === s.label ? null : s.label)}
                  aria-pressed={selected === s.label}
                  type="button"
                >
                  {s.label}
                </button>
              )}
              {state === 'out' && <span className="text-[9px] text-outline mt-0.5">Sold out</span>}
            </div>
          );
        })}
      </div>
      <p className="font-body-sm text-[11px] text-on-surface-variant pt-1">
        {available.length > 0 && (
          <>
            Available: <span className="font-medium text-on-surface">{available.join(', ')}</span>
          </>
        )}
        {available.length > 0 && out.length > 0 && ' · '}
        {out.length > 0 && (
          <>
            Not available: <span className="text-outline">{out.join(', ')}</span>
          </>
        )}
      </p>
    </>
  );
}

export function SizeSection({ product, selected, onSelect, onGuide }) {
  const quantityOnly = isQuantityOnlyCategory(product.category);
  const sized = product.sizeType === 'sized' && !isQuantityOnlyCategory(product.category);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-[12px] font-semibold text-on-surface">{quantityOnly ? 'Quantity Availability' : 'Size Availability'}</span>
        {sized ? (
          onGuide && (
            <button className="font-label-md text-[10px] text-secondary underline" onClick={onGuide} type="button">
              Size Guide
            </button>
          )
        ) : (
          <FreeSizeChip product={product} />
        )}
      </div>
      {sized && <SizePills product={product} selected={selected} onSelect={onSelect} />}
    </div>
  );
}

