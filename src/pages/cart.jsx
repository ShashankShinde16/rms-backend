import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar"; // Import Navbar
import Cookies from "js-cookie";
import axios from "axios";


const Cart = () => {
  const { cart, cartItem, removeFromCart, updateQuantity, fetchCart } = useCart();
  const user_token = Cookies.get("user_token");

  const cleanPrice = (price) => {
    if (typeof price === "number") {
      return price;
    }
    if (typeof price === "string") {
      return parseFloat(price.replace(/[^\d.-]/g, ""));
    }
    return 0;
  };

  const calculateTotalPrice = () => {
    const totalPrice = cartItem.reduce((acc, item) => {
      const itemPrice = cleanPrice(item.price);
      if (itemPrice && item.quantity) {
        return acc + itemPrice * item.quantity;
      }
      return acc;
    }, 0);
    return parseFloat(totalPrice.toFixed(2));
  };

  const calculateTotalDiscount = () => {
    const totalDiscount = cartItem.reduce((acc, item) => {
      const itemDiscount = item.totalProductDiscount || 0;
      const itemPrice = cleanPrice(item.price);
      return acc + (itemPrice * (itemDiscount / 100)) * item.quantity;
    }, 0);
    return parseFloat(totalDiscount.toFixed(2));
  };


  const handleRemove = (id) => {
    toast(
      (t) => (
        <div className="text-gray-800">
          <p className="mb-2">Are you sure you want to remove this item?</p>
          <div className="flex justify-end space-x-3">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-md"
              onClick={() => {
                removeFromCart(id);
                toast.dismiss(t.id);
                toast.success("Item removed successfully!");
              }}
            >
              Yes, Remove
            </button>
            <button
              className="px-3 py-1 bg-gray-300 rounded-md"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const handlePlaceOrder = async (id) => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      // 1. Create Razorpay Order on backend
      const { data } = await axios.post(
        `http://localhost:3000/api/v1/orders/checkOut/${id}`,
        {
          shippingAddress: {
            street: "Marine Drive",
            city: "Mumbai",
            phone: 9876543210,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        }
      );

      if (!data.order) {
        toast.error("Failed to create order");
        return;
      }

      const options = {
        key: "rzp_test_OKMfqngoXdr6jk", // Replace with your Razorpay Key ID
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Your Shop",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response) {
          // 2. Verify payment and create order
          try {
            const verifyRes = await axios.post(
              "http://localhost:3000/api/v1/orders/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cartId: id,
                shippingAddress: {
                  street: "Marine Drive",
                  city: "Mumbai",
                  phone: 9876543210,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${user_token}`,
                },
              }
            );

            if (verifyRes.data.message === "success") {
              fetchCart(); // Refresh cart after successful order
              toast.success("Order placed successfully!");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment verification request failed");
            console.error(error);
          }
        },
        prefill: {
          name: "Test User",
          email: "user@example.com",
          contact: "9876543210",
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };



  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      <div className="flex p-5 font-sans mt-12 space-x-6">
        {/* Left Section: Cart Items */}
        <div className="flex-3 mr-5 w-2/3">
          <h1 className="text-2xl font-semibold mb-5">Your Cart</h1>
          {cartItem.length > 0 ? (
            cartItem.map((item, index) => {
              const matchingVariation = item.productId.variations.find(variation =>
                variation.sizes.some(size => size._id === item.variationId)
              );

              const selectedSize = matchingVariation
                ? matchingVariation.sizes.find(size => size._id === item.variationId)
                : null;

              return (
                <div key={index} className="flex items-center border border-gray-300 rounded-lg mb-5 p-4 shadow-sm hover:shadow-md">
                  {/* Product Image */}
                  <img src={matchingVariation?.images?.[0] || item.image} alt={item.productId.name} className="w-20 h-20 object-cover rounded-lg" />

                  {/* Product Details */}
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium">{item.productId.name}</h3>
                    <p className="text-gray-700 text-sm">Size: {selectedSize?.size || "N/A"}</p>
                    <p className="text-sm text-gray-600">Price: ₹{selectedSize?.price || item.price}</p>
                    {selectedSize?.stock > 0 ? (
                      <p className="text-green-600 text-sm">In Stock</p>
                    ) : (
                      <p className="text-red-600 text-sm">Out of Stock</p>
                    )}
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center space-x-3">
                    {/* Delete Icon */}
                    <button onClick={() => handleRemove(item._id)} className="text-gray-500 hover:text-red-600">
                      🗑
                    </button>

                    {/* Quantity Buttons */}
                    <div className="flex items-center border border-gray-400 rounded-md px-2">
                      <button
                        className="px-2 text-lg"
                        onClick={() => updateQuantity(item.productId._id, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        className="px-2 text-lg"
                        onClick={() => updateQuantity(item.productId._id, Math.min(selectedSize?.stock, item.quantity + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price on Right */}
                  <div className="ml-4 font-semibold text-lg">
                    ₹{(cleanPrice(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xl font-semibold text-center mt-20">Your cart is empty!</p>
          )}

        </div>

        {/* Right Section: Price Summary */}
        <div className="flex-1 border border-gray-300 rounded-lg p-5 shadow-sm">
          <h3 className="text-xl font-semibold mb-5">PRICE DETAILS</h3>
          <p className="flex justify-between mb-2">
            <span>Price ({cartItem.length} items)</span>
            <span>₹{cartItem.length > 0 ? calculateTotalPrice() : 0}</span>
          </p>
          <p className="flex justify-between mb-2">
            <span>Discount</span>
            <span className="text-green-600">-₹{calculateTotalDiscount()}</span>
          </p>
          <p className="flex justify-between mb-5">
            <span>Shipping Charges</span>
            <span className="text-green-600">Free</span>
          </p>
          <hr />
          <h3 className="flex justify-between my-5 text-lg font-semibold">
            <span>Estimated Total</span>
            <span>₹{cartItem.length > 0 ? calculateTotalPrice() - calculateTotalDiscount() : 0}</span>
          </h3>

          {/* Coupon and Discounts */}
          {/* <div className="mb-5">
            <input type="text" placeholder="Enter promo code" className="p-2 border rounded-md w-full mb-2" />
            <button className="bg-blue-600 text-white rounded-lg py-2 px-5 w-full mt-2 hover:bg-blue-500">
              Apply
            </button>
          </div> */}

          {/* Checkout Button */}
          <button onClick={() => handlePlaceOrder(cart._id)} className="bg-orange-600 text-white rounded-lg py-2 px-5 w-full mt-5 hover:bg-orange-500">
            PLACE ORDER
          </button>

          {/* Estimated Delivery */}
          <div className="mt-5 text-sm text-gray-600">
            <p>Estimated delivery: 3-5 business days</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
