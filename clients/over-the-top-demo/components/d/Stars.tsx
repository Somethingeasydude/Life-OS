/** The flag's three stars — Luzon, Visayas, Mindanao. Used as a quiet divider. */
export default function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d="M12 1.5l2.9 6.4 7 .7-5.2 4.7 1.5 6.9L12 16.8 5.8 20.2l1.5-6.9L2.1 8.6l7-.7z" />
        </svg>
      ))}
    </span>
  );
}
