import { useState, useEffect } from "react";
import api from "../api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      await api.post(`/categories?name=${newCategoryName}`);
      setNewCategoryName("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryId}`);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
        <p className="text-slate-500 mt-1 text-sm">Organize transactions with custom categories. Shared across all accounts.</p>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Add New Category</h2>
        <form onSubmit={handleAddCategory}>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-colors"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Existing Categories */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        All Categories
        {categories.length > 0 && (
          <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{categories.length}</span>
        )}
      </h2>
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm text-center">
          <p className="text-slate-500 text-sm">No categories yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-slate-200 px-5 py-3.5 shadow-sm flex justify-between items-center"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {category.name}
              </h3>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-red-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Categories;
