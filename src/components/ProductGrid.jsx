import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_PRODUCTS_URL = `http://localhost:3000/api/v1/products/`;
const API_CATEGORIES_URL = `http://localhost:3000/api/v1/categories/`;

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]); // Default category
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsPerPage = 5;
  const [selectedImages, setSelectedImages] = useState({});

  // Handle image change on variation selection
  const handleVariationChange = (productId, newImage) => {
    setSelectedImages((prevImages) => ({
      ...prevImages,
      [productId]: newImage,
    }));
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(API_PRODUCTS_URL);
        const productsData = response.data.getAllProducts;
        setProducts(productsData);

        const defaultImages = {};
        productsData.forEach((product) => {
          if (product.variations.length > 0 && product.variations[0].images.length > 0) {
            defaultImages[product._id] = product.variations[0].images[0];
          }
        });
        setSelectedImages(defaultImages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(API_CATEGORIES_URL);
        setCategories([...response.data.getAllCategories]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Filter products based on category
  const filteredProducts = filter === "All" ? products : products.filter((product) => product.category_id.name === filter);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle Pagination
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  // Reset to first page when filter changes
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(0);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-5">
      {/* Filter Dropdown */}
      <div className="flex justify-end items-center mb-5">
        <label htmlFor="filter" className="text-lg font-semibold">Category:</label>
        <select 
          id="filter" 
          value={filter} 
          onChange={handleFilterChange} 
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="All">All</option>
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts
          .slice(currentPage * productsPerPage, (currentPage + 1) * productsPerPage)
          .map((product) => (
            <Link 
              key={product._id} 
              to={`/product/${product._id}`} 
              className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:scale-105"
              state={{ product }}
            >
              <div className="product-card bg-white rounded-lg border">
                {/* Main Product Image */}
                <div className="w-full h-64 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${selectedImages[product._id]})` }}>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>

                  {/* Pricing Section */}
                  <p className="text-gray-700">
                    <span className="line-through mr-2 text-gray-500">₹{product.basePrice}</span>
                    <span className="font-bold text-green-600">₹{product.variations[0].sizes[0].price}</span>
                    <span className="ml-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                      -{product.variations[0].sizes[0].discount}%
                    </span>
                  </p>

                  {/* Variation Thumbnails */}
                  <div className="variations-container mt-2 flex">
                    {product.variations.map((variation, index) => {
                      const isSelected = selectedImages[product._id] === variation.images[0];
                      return (
                        <img
                          key={index}
                          src={variation.images[0]}
                          alt={`${product.name} - Variation ${index + 1}`}
                          className="w-8 h-8 rounded-full mr-2 cursor-pointer"
                          style={{
                            border: isSelected ? "2px solid black" : "none",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleVariationChange(product._id, variation.images[0]);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > productsPerPage && (
        <div className="flex justify-center mt-6 space-x-4">
          <button 
            className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handlePrev} 
            disabled={currentPage === 0}
          >
            Prev
          </button>
          <button 
            className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 ${currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleNext} 
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
