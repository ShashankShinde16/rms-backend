import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserAlt, FaShoppingCart, FaBars } from "react-icons/fa";
import { useCart } from "../context/CartContext"; // Access cart context
import Cookies from "js-cookie";
import ProfilePopup from "./profile/ProfilePopup"; // Import ProfilePopup component
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user_token = Cookies.get("user_token");
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const cartRef = useRef(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const demoUser = {
    name: "Shashank Shinde",
    email: "shashank@example.com",
    role: "user",
    verified: true,
    isActive: true,
    blocked: false,
    address: 
      { city: "Pune", street: "MG Road", phone: "9876543210" }
  };


  const { cart, removeFromCart, updateQuantity } = useCart(); // Access cart state and actions
  let cartItemCount = cart?.cartItem?.length || 0;

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Toggle cart drawer visibility
  const toggleCart = () => setCartOpen(!cartOpen);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <nav className="navbar">
      {/* Logo and Hamburger Menu */}
      <div className="navbar-logo">
        <FaBars className="hamburger-icon" onClick={toggleMobileMenu} />
        <Link to="/home">
          <img
            src="/images/image-Photoroom.png" // Replace with your logo
            alt="Logo"
            className="navbar-logo-img"
          />
        </Link>
      </div>

      {/* Profile, Search, and Cart */}
      <div className="navbar-right">
        {/* <div className="navbar-search">
          <div className="search">
            <input
              type="text"
              className="search__input"
              placeholder="Search..."
            />
            <button className="search__button">
              <svg
                className="search__icon"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <g>
                  <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                </g>
              </svg>
            </button>
          </div>
        </div> */}
        <div className="navbar-actions">
          <div className="relative" ref={profileRef}>
            <FaUserAlt className="icon cursor-pointer" onClick={() => user_token ? setProfileOpen(!profileOpen) : navigate("/")} />
            {profileOpen && (
              <div className="profile-dropdown">
                <Link onClick={() => {setShowProfilePopup(true); setProfileOpen(false)}} className="dropdown-item w-100 text-center">Profile</Link>
                <button onClick={() => {
                  Cookies.remove("user_details");
                  Cookies.remove("user_token");
                  navigate("/"); // Redirect to login page
                }} className="dropdown-item w-100">Sign Out</button>
              </div>
            )}
          </div>

          <div className="flex items-center relative">
            <FaShoppingCart
              className="icon"
              onClick={toggleCart} // Toggle cart visibility
            />
            {cartItemCount > 0 && (
              <span className="cart-item-count">{cartItemCount}</span> // Show item count in cart
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sliding Menu */}
      <div
        ref={mobileMenuRef}
        className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}
      >
        <Link to="/home">Home</Link>
        <a href="/shop">Shop</a>
        <a href="/order">Order</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>

      {/* Cart Slider */}
      <div ref={cartRef} className={`cart-slider ${cartOpen ? "open" : ""}`}>
        <h2>My Cart</h2>
        {cartItemCount === 0 ? (
          <p>No items in the cart yet!</p>
        ) : (
          <div className="cart-items">
            {cart.cartItem.map((item) => {
              // Find the variation that contains the selected variationId
              const matchingVariation = item.productId.variations.find(
                (variation) =>
                  variation.sizes.some((size) => size._id === item.variationId)
              );

              // Find the correct size details
              const selectedSize = matchingVariation
                ? matchingVariation.sizes.find(
                  (size) => size._id === item.variationId
                )
                : null;

              return (
                <div key={item._id} className="cart-item">
                  <img
                    src={matchingVariation?.images?.[0] || item.image}
                    alt={item.productId.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <h3>{item.productId.name}</h3>
                    <p>Size: {selectedSize?.size || "N/A"}</p>
                    <p>Price: ₹{selectedSize?.price || item.price}</p>
                    <div className="quantity-container">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId._id, parseInt(e.target.value))
                        }
                        className="p-2 border rounded-md mb-2 w-16 text-sm cursor-pointer"
                      >
                        {[...Array(selectedSize?.stock).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="remove-from-cart-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <button
          className="view-cart-btn"
          onClick={() => window.location.href = "/cart"}
        >
          View Cart
        </button>
      </div>
      {showProfilePopup && (
        <ProfilePopup user={demoUser} onClose={() => setShowProfilePopup(false)} />
      )}

    </nav>
  );
};

export default Navbar;
