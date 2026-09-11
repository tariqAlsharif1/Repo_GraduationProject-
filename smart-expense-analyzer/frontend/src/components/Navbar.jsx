import { Bell, Menu, Search } from "lucide-react";

export default function Navbar({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 bg-canvas/80 backdrop-blur border-b border-line">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden text-ink600 shrink-0"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-lg sm:text-xl text-ink900 truncate">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-ink600 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2 w-72">
          <Search size={16} className="text-ink400" />
          <input
            type="text"
            placeholder="Search expenses..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-ink400"
          />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            className="relative text-ink600 hover:text-ink900 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-danger-500" />
          </button>
          <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-display text-sm font-semibold">
            T
          </div>
        </div>
      </div>
    </header>
  );
}
