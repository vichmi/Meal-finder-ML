import { useState, useEffect } from "react";


export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window === "undefined") return "light";
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    });


    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        localStorage.setItem("theme", theme);
    }, [theme]);


    return (
        <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border px-2 py-1 text-sm transition hover:opacity-90 border-[var(--border)] bg-[var(--card)] text-[var(--fg)]"
            aria-label="Toggle theme"
            >
            {theme === "dark" ? "Dark" : "Light"}
        </button>
    );

}