import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const CartContext = createContext();

// Custom hook to use the Cart context
const useCart = () => useContext(CartContext);

const API_URL = `http://localhost:3000/api/v1/carts/`;
const API_URL_Order = `http://localhost:3000/api/v1/orders/`;

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartItem, setCartItem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user_token = Cookies.get("user_token");

  // Fetch cart items from the backend
  useEffect(() => {
    if(user_token){
      fetchCart();
    }
  }, [user_token]);

  const fetchCart = async () => {
    console.log(user_token);
    try {
      const response = await axios.get(API_URL,{
        headers: {
          Authorization: `Bearer ${user_token}`
        }
      });
      if (response.data.cart) {
        setCart(response.data.cart);
        setCartItem(response.data.cart.cartItem);
        console.log(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async(product) => {
    console.log("111111",product);
    const user_details = JSON.parse(Cookies.get("user_details"));
    
    try {
      const response = await axios.post(API_URL, {
        productId: product.productID,
        variationId: product.variationId,
        quantity: product.quantity,
        price: product.price,
        totalProductDiscount: product.discount,
      },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user_token}`
          }
        }
      );
      console.log(response.data);
      await fetchCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      const response = await axios.put(`${API_URL}${id}`, {
        quantity: quantity,
      },{
        headers: {
          Authorization: `Bearer ${user_token}`
        }
      });
      console.log(response.data);
      await fetchCart();
    }
    catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  // Remove product from cart by ID
  const removeFromCart = async(id) => {
    try {
      const response = await axios.delete(`${API_URL}${id}`,{
        headers: {
          Authorization: `Bearer ${user_token}`
        }
      });
      await fetchCart();
      // setCart(response.data.cart.cartItem); // Assuming API returns an array of cart items
      console.log(response.data);
    } catch (err) {
      setError(err.message);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (id) => {
    try {
      const response = await axios.post(`${API_URL_Order}${id}`,{shippingAddress: "AB Road"},{
        headers: {
          Authorization: `Bearer ${user_token}`
        }
      });
      console.log(response.data);
      await fetchCart();
    }
    catch (err) {
      console.error("Error placing order:", err);
    }
  }

  const GetplaceOrder = async () => {
    try {
      const response = await axios.get(`${API_URL_Order}`,{
        headers: {
          Authorization: `Bearer ${user_token}`
        }
      });
      console.log("order",response.data);
      await fetchCart();
    }
    catch (err) {
      console.error("Error placing order:", err);
    }
  }



  return (
    <CartContext.Provider value={{ cart, cartItem, addToCart, removeFromCart, updateQuantity, placeOrder, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider, useCart };
