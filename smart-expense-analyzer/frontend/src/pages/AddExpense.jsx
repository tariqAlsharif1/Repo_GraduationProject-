import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ExpenseForm from "../components/ExpenseForm";
import { useToast } from "../components/ToastProvider";
import { createExpense, getCategories } from "../services/api";

export default function AddExpense() {
  const notify = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createExpense(values);
      notify("Expense added successfully.");
      navigate("/expenses");
    } catch {
      notify("Failed to save expense. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <h2 className="font-display font-semibold text-xl text-ink900 mb-1">Add New Expense</h2>
      <p className="text-sm text-ink400 mb-6">
        Search for a merchant or type your own description — we'll suggest the category.
      </p>
      <ExpenseForm
        categories={categories}
        submitLabel="Add Expense"
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
