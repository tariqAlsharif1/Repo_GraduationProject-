import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./components/ToastProvider";
import AddExpense from "./pages/AddExpense";
import Analytics from "./pages/Analytics";
import Budget from "./pages/Budget";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";

const PAGE_META = {
  "/": { title: "Dashboard", subtitle: "Good afternoon, Tariq" },
  "/expenses": { title: "Expenses" },
  "/add-expense": { title: "Add Expense" },
  "/budget": { title: "Budget" },
  "/analytics": { title: "Analytics" },
  "/categories": { title: "Categories" },
  "/settings": { title: "Settings" },
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: "Smart Expense" };

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-canvas">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 min-w-0">
          <Navbar
            title={meta.title}
            subtitle={meta.subtitle}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/add-expense" element={<AddExpense />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
