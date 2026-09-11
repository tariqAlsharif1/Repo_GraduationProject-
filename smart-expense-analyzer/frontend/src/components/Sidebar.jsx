import {
  LayoutGrid,
  ListChecks,
  LogOut,
  PiggyBank,
  PlusCircle,
  Settings,
  Tags,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/expenses", label: "Expenses", icon: ListChecks },
  { to: "/add-expense", label: "Add Expense", icon: PlusCircle },
  { to: "/budget", label: "Budget", icon: PiggyBank },
  { to: "/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-ink text-white flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-display font-bold text-sm">
              S
            </div>
            <span className="font-display font-semibold text-[15px] tracking-tight">
              Smart Expense
            </span>
          </div>
          <button className="lg:hidden text-ink400" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "text-ink400 hover:bg-ink-soft hover:text-white"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-6 pt-3 border-t border-ink-soft">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white">
            <div className="w-8 h-8 rounded-full bg-ink-softer flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">Tariq</div>
              <div className="text-xs text-ink400 truncate">tariq@demo.app</div>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm font-medium text-ink400 hover:bg-ink-soft hover:text-white transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
