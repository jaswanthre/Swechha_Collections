/** Round crowned-"S" monogram cropped from the Swechha Collections logo. */
export function BrandMark({ className = 'w-10 h-10' }) {
  return (
    <img
      src="/brand/logo-mark.webp"
      alt=""
      aria-hidden="true"
      width="192"
      height="192"
      decoding="async"
      draggable="false"
      className={`${className} shrink-0 rounded-full object-cover select-none shadow-[0_2px_8px_rgba(74,21,48,0.28)] ring-1 ring-[#C59B6A]/40`}
    />
  );
}

// Wordmark heights; the image keeps the logo's 3:1 proportions.
const SIZES = {
  sm: 'h-[40px] min-[400px]:h-[44px]',
  md: 'h-[44px]',
  lg: 'h-[52px]',
  xl: 'h-[68px]',
};

/** "Swechha / COLLECTIONS" lettering cut from the logo itself (exact swash S), on a transparent background. */
export function BrandWordmark({ size = 'md', className = '' }) {
  return (
    <img
      src="/brand/wordmark.webp"
      alt="Swechha Collections"
      width="699"
      height="234"
      decoding="async"
      draggable="false"
      className={`${SIZES[size]} w-auto max-w-none shrink-0 select-none ${className}`}
    />
  );
}

/** Monogram + wordmark lockup used in the headers. */
export default function BrandLogo({ markClassName, size = 'md' }) {
  return (
    <span className="flex items-center gap-2 md:gap-2.5 min-w-0">
      <BrandMark className={markClassName} />
      <BrandWordmark size={size} />
    </span>
  );
}
