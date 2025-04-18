import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

const API_ORDERS_URL = `http://localhost:3000/api/v1/orders/all`; // Placeholder

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const user_token = Cookies.get("user_token");

    const demoOrders = [
        {
            _id: "order001",
            date: "2025-04-01",
            total: 1599,
            status: "Delivered",
            items: [
                {
                    name: "Nike Air Max",
                    qty: 1,
                    price: 1599,
                    image: "https://rms-ecommerce.s3.ap-south-1.amazonaws.com/products/a08463f8-e428-4709-b252-eb340afde262-screenshot_2025-03-21_040935.png"
                },
            ],
        },
        {
            _id: "order002",
            date: "2025-03-28",
            total: 2599,
            status: "Shipped",
            items: [
                {
                    name: "Adidas Ultraboost",
                    qty: 1,
                    price: 2599,
                    image: "https://rms-ecommerce.s3.ap-south-1.amazonaws.com/products/23259f57-8bbc-4f75-806c-b340a2f58b7e-whatsapp_image_2025-03-24_at_21.26.29_7f62dcca.jpg"
                },
            ],
        },
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(API_ORDERS_URL, {
                    headers: {
                        Authorization: `Bearer ${user_token}`,
                    },
                });
                setOrders(response.data.orders);
                console.log("Fetched orders:", response.data.orders);
            } catch (error) {
                console.warn("API not ready or failed. Using demo orders.", error);
                setOrders(demoOrders);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <>
            <Navbar />
            <div className="p-6 mt-16 min-h-screen bg-gray-50">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Orders</h2>
                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : orders.length === 0 ? (
                    <p className="text-center text-gray-500">No orders found.</p>
                ) : (
                    <div className="grid gap-6 max-w-4xl mx-auto">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Order ID: <span className="text-blue-600">{order._id}</span>
                                        </h3>
                                        <p className="text-sm text-gray-500">Placed on: {order.paidAt}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            order.isDelivered === true
                                                ? "bg-green-100 text-green-700"
                                                : order.isDelivered === false
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {order.isDelivered === true ? "Delivered"
                                                : "Shipped"}
                                    </span>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {order.cartItems.map((item, idx) => {
                                        const matchingVariation = item.productId.variations.find(variation =>
                                            variation.sizes.some(size => size._id === item.variationId)
                                          );

                                        return(
                                        <div key={idx} className="flex gap-4 py-4 items-center">
                                            <img
                                                src={matchingVariation?.images?.[0]}
                                                alt={item.productId.name}
                                                className="w-20 h-20 object-cover rounded border"
                                            />
                                            <div>
                                                <h4 className="text-md font-semibold text-gray-800">{item.productId.name}</h4>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                <p className="text-sm text-gray-600 font-medium">₹{item.price}</p>
                                            </div>
                                        </div>
                                    )})}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <p className="font-semibold text-lg text-gray-800">
                                        Total: ₹{order.total}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Order;
