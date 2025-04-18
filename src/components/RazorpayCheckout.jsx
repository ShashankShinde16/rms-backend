import React, { useState, useEffect } from "react";
import axios from "axios";

const RazorpayCheckout = ({ cartId, userToken }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    fetchCartDetails();
  }, []);

  const fetchCartDetails = async () => {
    try {
      const response = await axios.get(`/api/cart/${cartId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setTotalPrice(response.data.totalPriceAfterDiscount || response.data.totalPrice);
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

//   const handlePayment = async () => {
//     try {
//       // Step 1: Create Razorpay Order
//       const response = await axios.post(
//         `/api/orders/checkout-session/${cartId}`,
//         {},
//         { headers: { Authorization: `Bearer ${userToken}` } }
//       );

//       const { orderId, amount, currency } = response.data;
//       setOrderId(orderId);

//       // Step 2: Open Razorpay Checkout
//       const options = {
//         key: "rzp_test_xxxxxxxxxxxx", // Replace with Razorpay Key ID
//         amount: amount * 100,
//         currency: currency,
//         name: "My E-Commerce",
//         description: "Purchase Items",
//         order_id: orderId,
//         handler: async function (response) {
//           // Step 3: Capture Payment & Create Order
//           try {
//             const paymentResponse = await axios.post(
//               `/api/orders/create-online-order/${cartId}`,
//               {
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_signature: response.razorpay_signature,
//               },
//               { headers: { Authorization: `Bearer ${userToken}` } }
//             );

//             alert("Payment Successful! Order Placed.");
//           } catch (error) {
//             console.error("Payment capture failed:", error);
//             alert("Payment Failed!");
//           }
//         },
//         prefill: {
//           name: "Customer Name",
//           email: "customer@example.com",
//           contact: "9999999999",
//         },
//         theme: { color: "#3399cc" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       console.error("Error in payment process:", error);
//     }
//   };

  return (
    <div>
      <h2>Total Price: ₹{totalPrice}</h2>
      {/* <button onClick={handlePayment}>Pay with Razorpay</button> */}
    </div>
  );
};

export default RazorpayCheckout;
