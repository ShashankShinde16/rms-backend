import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

// const brands = [
//     { id: 1, name: "Apple", image: "https://via.placeholder.com/100" },
//     { id: 2, name: "Samsung", image: "https://via.placeholder.com/100" },
//     { id: 3, name: "Sony", image: "https://via.placeholder.com/100" },
//     { id: 4, name: "LG", image: "https://via.placeholder.com/100" },
//     { id: 5, name: "Nike", image: "https://via.placeholder.com/100" },
//     { id: 6, name: "Adidas", image: "https://via.placeholder.com/100" }
// ];

const API_URL = `http://localhost:3000/api/v1/brands/`;

const BrandList = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user_token = Cookies.get("user_token");

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get(API_URL, {
                    headers: {
                        Authorization: `Bearer ${user_token}`
                    }
                });
                setBrands(response.data.getAllBrands);
                console.log(response.data.getAllBrands);
            } catch (err) {
                console.error("Error fetching brands:", err);
                setError("Failed to load brands");
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    return (
        <div className="p-6 mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Our Brands</h2>

            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {brands.map((brand) => (
                        <Link to={`/brand/${brand.name}`} key={brand._id}>
                            <div
                                key={brand._id}
                                className="flex flex-col items-center bg-white p-4 shadow-lg rounded-xl transition-transform transform hover:scale-105"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="w-20 h-20 object-contain mb-3 rounded-lg"
                                />
                                <p className="text-lg font-semibold">{brand.name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrandList;


