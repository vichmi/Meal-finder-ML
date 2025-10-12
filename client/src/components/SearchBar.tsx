
import axios from '../libs/axios';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';


export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchItems, setSearchItems] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    if (value.length < 3) {
      setSearchItems([]);
      return;
    }
    axios.get(`/search?q=${value}`)
      .then(res => {
        setSearchItems(res.data);
        console.log(res.data)
      })
      .catch(() => setSearchItems([]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
  <form className="relative w-full max-w-xl mx-auto" role="search" aria-label="Search recipes" autoComplete="off" onSubmit={handleSubmit}>
        <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
        placeholder="Search recipes..."
        className="w-full rounded-2xl border bg-[var(--card)] px-4 py-2 pr-10 text-[var(--fg)] placeholder:text-gray-500 dark:placeholder:text-gray-400 border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
        aria-autocomplete="list"
        aria-controls="search-results-list"
      />
      <button
        type="submit"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg)] p-0 m-0 bg-transparent border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Search"
        onClick={handleIconClick}
        style={{ lineHeight: 0 }}
        disabled={query.trim().length === 0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {/* Dropdown for search results */}
      {focused && query.length > 0 && (
        <div
          id="search-results-list"
          className="absolute left-0 right-0 mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg z-20 overflow-hidden max-h-72 sm:max-h-56"
          style={{ width: '100%' }}
        >
          {searchItems.length === 0 ? (
            <div className="px-4 py-3 text-center text-sm text-[var(--muted-fg)]">No recipes found</div>
          ) : (
            <ul>
              {searchItems.map((item, idx) => (
                <li
                  key={item.id || idx}
                  className="px-2 py-1.5 cursor-pointer hover:bg-[var(--bg)] transition-colors text-[var(--fg)] text-sm min-h-0"
                  tabIndex={0}
                  onMouseDown={e => e.preventDefault()}
                  style={{ minHeight: 0 }}
                >
                  <a href={`/recipe/${item._id}`}>
                    <img src={item.img} alt="" className="inline-block w-8 h-8 object-cover rounded mr-2 align-middle" />
                    <span>{item.title || item.name || String(item)}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}