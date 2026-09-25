/** OmniKit mark: a 2×2 tool grid on ink, one cell picked out in signal orange. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--ink)" />
      <rect x="7" y="7" width="8" height="8" rx="1.5" fill="var(--bg)" />
      <rect x="17" y="7" width="8" height="8" rx="1.5" fill="var(--bg)" />
      <rect x="7" y="17" width="8" height="8" rx="1.5" fill="var(--bg)" />
      <circle cx="21" cy="21" r="4.5" fill="var(--accent)" />
    </svg>
  );
}
