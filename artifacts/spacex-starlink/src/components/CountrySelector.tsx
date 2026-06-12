import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, Search, ChevronDown } from "lucide-react";
import { useCurrency, COUNTRIES, CURRENCY_SYMBOLS, type CountryInfo } from "@/hooks/useCurrency";

const REGION_LABELS: Record<string, string> = {
  africa: "Africa",
  americas: "Americas",
  europe: "Europe",
  "asia-pacific": "Asia-Pacific",
};

const REGION_ORDER = ["africa", "americas", "europe", "asia-pacific"];

export function CountrySelector() {
  const { country, currentCountryInfo, setCountry } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setQuery(""); return; }
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleSelect(c: CountryInfo) {
    setCountry(c.code);
    setOpen(false);
  }

  const filtered = query.trim()
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.currency.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  const grouped = REGION_ORDER.map((region) => ({
    region,
    label: REGION_LABELS[region],
    items: (filtered ?? COUNTRIES).filter((c) => c.region === region),
  })).filter((g) => g.items.length > 0);

  const displayFlag = currentCountryInfo?.flag ?? "🌐";
  const displayCurrency = currentCountryInfo?.currency ?? "USD";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Select country and currency"
        className="flex items-center gap-1.5 h-9 px-3 rounded-md text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
      >
        <span className="text-base leading-none">{displayFlag}</span>
        <span className="hidden sm:inline">{displayCurrency}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl shadow-black/80 z-[999] overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-white/8">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or currency…"
                className="bg-transparent text-xs text-white placeholder-gray-600 outline-none flex-1 min-w-0"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto overscroll-contain">
            {grouped.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">No results</p>
            ) : (
              grouped.map(({ region, label, items }) => (
                <div key={region}>
                  <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    {label}
                  </p>
                  {items.map((c) => {
                    const sym = CURRENCY_SYMBOLS[c.currency] ?? c.currency;
                    const isSelected = c.code === country;
                    return (
                      <button
                        key={c.code}
                        onClick={() => handleSelect(c)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5 ${isSelected ? "bg-primary/8" : ""}`}
                      >
                        <span className="text-lg leading-none w-6 text-center shrink-0">{c.flag}</span>
                        <span className="flex-1 text-xs text-white font-medium truncate">{c.name}</span>
                        <span className="text-[11px] text-gray-500 font-bold shrink-0">{sym} {c.currency}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/8 px-3 py-2.5 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-gray-600">Prices shown in your selected currency</span>
          </div>
        </div>
      )}
    </div>
  );
}
