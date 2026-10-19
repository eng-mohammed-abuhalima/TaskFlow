import { cx } from './cx.js';
// lucide-react, always 1.5px stroke. Sizes: 14 (badges), 16 (controls), 20 (nav), 24/32 (empty/state tiles).
export function Icon({ icon: Glyph, size = 16, mirror = false, className, ...rest }) {
  return (
    <Glyph
      size={size}
      strokeWidth={1.5}
      aria-hidden="true"
      focusable="false"
      className={cx('shrink-0', mirror && 'rtl:-scale-x-100', className)}
      {...rest}
    />
  );
}
