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
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-navy-800 mb-2">
          Manage Categories
        </h1>
        <p className="text-gray-600">
          Organize your transactions with custom categories. Categories are
          shared across all accounts.
        </p>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-navy-800 mb-6">
          Add New Category
        </h2>
        <form onSubmit={handleAddCategory}>
          <div className="flex gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-800 font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>

      {/* Existing Categories */}
      <h2 className="text-2xl font-semibold text-navy-800 mb-5">
        Existing Categories
      </h2>
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-gray-500">
            No categories yet. Create your first category above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl p-6 shadow-sm flex justify-between items-center"
            >
              <h3 className="text-lg font-semibold text-navy-800">
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
