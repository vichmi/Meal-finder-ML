import React from 'react'
export default function Tag({ children }: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--secondary)]/20 px-2 py-0.5 text-xs sm:text-sm font-medium text-[var(--secondary-ink)] ring-1 ring-[var(--secondary)]/40">
      {children}
    </span>
  );
}