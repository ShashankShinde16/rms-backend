import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import './shop.css';
import BrandList from '../components/BrandList';

function Shop() {
  return (
    <div className="shop-container">
      {/* Navbar */}
      <Navbar />

      {/* Main Content: Filters Sidebar and Product List */}
      {/* <div className="shop-content"> */}
        {/* Sidebar for Filters */}
        {/* <FiltersSidebar /> */}
        
        {/* Product List and Pagination */}
        <div className="product-list-wrapper">
          <BrandList />
          <Pagination />
        </div>
      {/* </div> */}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Shop;
