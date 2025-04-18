import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./pages/home";
import Shop from "./pages/shop";
import ProductDetails from "./components/ProductDetails";
import Cart from "./pages/cart"; // Updated import
import OrderConfirmation from "./components/OrderConfirmation";
import Category from "./pages/category";
import Login from "./pages/Login";
import RazorpayCheckout from "./components/RazorpayCheckout";
import ProductByBrand from "./pages/productByBrand";
import Order from "./pages/order";
import NewArrivals from "./pages/newArrivals";
import Profile from "./components/profile/ProfilePopup";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
          <Route path="/razorpay-checkout" element={<ProtectedRoute><RazorpayCheckout /></ProtectedRoute>} />
          {/* <Route path="/profile" element={<Profile />} /> */}
          <Route path="/brand/:brandName" element={<ProductByBrand />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/new-arrivals/:category" element={<NewArrivals />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} /> {/* Updated route */}
          <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          {/* <Route path="/RazorpayCheckout" element={<RazorpayCheckout />} /> */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
