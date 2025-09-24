import React from 'react'
export default function Tag({ children }: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--secondary)]/20 px-3 py-1 text-xs font-medium text-[var(--secondary-ink)] ring-1 ring-[var(--secondary)]/40">
      {children}
    </span>
  );
}