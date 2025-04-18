import React, { useEffect } from "react";
import { useCart } from "../context/CartContext";  // Import useCart
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import Carousel2 from "../components/Carousel2";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import "./home.css";
import Cookies from "js-cookie"; // Import Cookies to get user_token
import CategoryGrid from "../components/CategoryGrid";
import NewArrivalsGrid from "../components/NewArrivalsGrid";
import NewAndOff from "../components/NewAndOff";

function Home() {
  const { fetchCart } = useCart(); // Get fetchCart function from context
  const user_token = Cookies.get("user_token");

  useEffect(() => {
    if(user_token) {
      fetchCart();
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="hero-carousel-wrapper">
        <HeroCarousel />
      </div>
      <NewArrivalsGrid />
      <div className="carousel2-wrapper">
        {/* <Carousel2 /> */}
      </div>
      <CategoryGrid />
      <ProductGrid />
      <NewAndOff /> 
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
}

export default Home;
