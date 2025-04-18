import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = `http://localhost:3000/api/v1/categories/`;

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const CategoriesPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(API_URL);
        setCategories(response.data.getAllCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const totalPages = Math.ceil(categories.length / CategoriesPerPage);
  const startIndex = currentPage * CategoriesPerPage;
  const visibleCategories = categories.slice(startIndex, startIndex + CategoriesPerPage);

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  if (loading) return <p className="text-center text-gray-500">Loading categories...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-12 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Categories
      </h2>

      {/* Arrows on top for mobile, sides on desktop */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        {currentPage > 0 && (
          <button
            className="mb-2 sm:mb-0 sm:mr-4 px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-full transition"
            onClick={handlePrev}
          >
            &lt;
          </button>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {visibleCategories.map((category) => (
            <Link
              to={`/category/${category.name}`}
              key={category._id}
              state={{ categoryId: category._id, categoryName: category.name }}
              className="group bg-white shadow-md rounded-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <img
                src={category.Image}
                alt={category.name}
                className="w-full h-48 md:h-60 lg:h-72 object-cover"
              />
              <div className="p-3 text-center font-medium text-gray-700 group-hover:text-blue-500">
                {category.name}
              </div>
            </Link>
          ))}
        </div>

        {currentPage < totalPages - 1 && (
          <button
            className="mt-2 sm:mt-0 sm:ml-4 px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-full transition"
            onClick={handleNext}
          >
            &gt;
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryGrid;
