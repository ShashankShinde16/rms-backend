import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Category.css";
import ProductList from "../components/ProductList";
import { useParams } from "react-router-dom";
import ProductListBy from "../components/ProductListBy";

function Category() {
  const { name } = useParams();
  return (
    <>
      <Navbar />
      <div className="product-grid-wrapper">
        <ProductListBy />
      </div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
}

export default Category;
