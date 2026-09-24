/**
 * The eight-ray sun from the Philippine flag.
 *
 * Eight rays for the eight provinces that first revolted against Spain, and the
 * three stars for Luzon, Visayas and Mindanao. Drawn rather than illustrated, and
 * used as a repeated mark — not as a badge replacing the restaurant's own logo.
 */
export default function SunMark({ className = "size-8" }: { className?: string }) {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="currentColor">
      <circle cx="32" cy="32" r="9" />
      {rays.map((angle) => (
        <path
          key={angle}
          d="M32 4.5 L35.6 18 L32 21 L28.4 18 Z"
          transform={`rotate(${angle} 32 32)`}
        />
      ))}
    </svg>
  );
}
