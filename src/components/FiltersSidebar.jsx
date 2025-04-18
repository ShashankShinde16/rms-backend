import React from 'react';
import './FiltersSidebar.css';

const FiltersSidebar = ({ onDiscountChange, onPriceChange }) => {
  const handleCheckboxChange = (e, setType) => {
    const value = e.target.id;
    const isChecked = e.target.checked;
    setType(value, isChecked);
  };

  return (
    <div className="filters-sidebar">
      <h2>Filters</h2>

      <div className="filter-category">
        <h3>Offer</h3>
        <ul className="space-y-2 text-gray-700">
          {["discount-5-10", "discount-15-20", "discount-25"].map((id, i) => (
            <li key={id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={id}
                className="accent-blue-500"
                onChange={(e) => handleCheckboxChange(e, onDiscountChange)}
              />
              <label htmlFor={id} className="cursor-pointer">
                {i === 0 ? "5% - 10% Off" : i === 1 ? "15% - 20% Off" : "25% & Above"}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-price">
        <h3>Price</h3>
        <ul className="space-y-2 text-gray-700">
          {["price-under-500", "price-500-1000", "price-above-1000"].map((id, i) => (
            <li key={id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={id}
                className="accent-blue-500"
                onChange={(e) => handleCheckboxChange(e, onPriceChange)}
              />
              <label htmlFor={id} className="cursor-pointer">
                {i === 0 ? "Under ₹500" : i === 1 ? "₹500 - ₹1000" : "Above ₹1000"}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FiltersSidebar;
