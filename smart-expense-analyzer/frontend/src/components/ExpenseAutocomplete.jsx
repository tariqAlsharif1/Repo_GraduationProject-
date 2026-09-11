import { useEffect, useRef, useState } from "react";

import { getSuggestions } from "../services/api";
import { getCategoryStyle } from "../utils/categoryStyles";

export default function ExpenseAutocomplete({ value, onChange, onSelectCategory }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [flatResults, setFlatResults] = useState(null); // null = show grouped, [] = "no result"
  const [grouped, setGrouped] = useState({ recent: [], popular: [] });
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadGrouped = async () => {
    try {
      const data = await getSuggestions();
      setGrouped(data);
      setFlatResults(null);
    } catch {
      setGrouped({ recent: [], popular: [] });
    }
  };

  const handleFocus = () => {
    setOpen(true);
    if (!query.trim()) {
      loadGrouped();
    }
  };

  const handleChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange(next);
    setOpen(true);
    setHighlightIndex(-1);

    clearTimeout(debounceRef.current);
    if (!next.trim()) {
      loadGrouped();
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await getSuggestions(next);
        setFlatResults(results);
      } catch {
        setFlatResults([]);
      }
    }, 180);
  };

  const currentList = () => {
    if (query.trim()) return flatResults || [];
    return [...grouped.recent, ...grouped.popular];
  };

  const selectSuggestion = (item) => {
    setQuery(item.name);
    onChange(item.name);
    onSelectCategory?.(item.category);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    const list = currentList();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, list.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && list[highlightIndex]) {
        e.preventDefault();
        selectSuggestion(list[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const list = currentList();
  const showGrouped = !query.trim();

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder="Start typing... e.g. Uber, Starbucks, Netflix"
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        autoComplete="off"
      />

      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-white border border-line rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {showGrouped ? (
            <>
              {grouped.recent.length > 0 && (
                <SuggestionGroup
                  label="Recent"
                  items={grouped.recent}
                  offset={0}
                  highlightIndex={highlightIndex}
                  onSelect={selectSuggestion}
                />
              )}
              {grouped.popular.length > 0 && (
                <SuggestionGroup
                  label="Popular"
                  items={grouped.popular}
                  offset={grouped.recent.length}
                  highlightIndex={highlightIndex}
                  onSelect={selectSuggestion}
                />
              )}
              {grouped.recent.length === 0 && grouped.popular.length === 0 && (
                <div className="px-4 py-3 text-sm text-ink400">Start typing to search…</div>
              )}
            </>
          ) : list.length > 0 ? (
            <SuggestionGroup
              items={list}
              offset={0}
              highlightIndex={highlightIndex}
              onSelect={selectSuggestion}
            />
          ) : (
            <button
              type="button"
              className="w-full text-left px-4 py-3 text-sm text-ink600 hover:bg-canvas"
              onClick={() => setOpen(false)}
            >
              Use "<span className="font-medium text-ink900">{query}</span>" as expense
              description
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionGroup({ label, items, offset, highlightIndex, onSelect }) {
  return (
    <div className="py-1">
      {label && (
        <div className="px-4 pt-2 pb-1 text-[11px] font-semibold text-ink400">{label}</div>
      )}
      {items.map((item, i) => {
        const style = getCategoryStyle(item.category);
        const Icon = style.icon;
        const active = offset + i === highlightIndex;
        return (
          <button
            type="button"
            key={`${item.name}-${i}`}
            onClick={() => onSelect(item)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
              active ? "bg-canvas" : "hover:bg-canvas"
            }`}
          >
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: style.bg, color: style.color }}
            >
              <Icon size={14} />
            </span>
            <span className="flex-1 text-ink900">{item.name}</span>
            <span className="text-xs text-ink400">{item.category}</span>
          </button>
        );
      })}
    </div>
  );
}
