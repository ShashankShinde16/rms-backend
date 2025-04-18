import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "./Navbar";
import ProductList from "./ProductList";
import Cookies from "js-cookie";
import Footer from "./Footer";
import toast, { Toaster } from "react-hot-toast";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { id } = useParams();

  const product = location.state?.product;

  if (!product) {
    navigate("/");
    return null;
  }

  const [currentImage, setCurrentImage] = useState(product.variations[0].images[0]);
  const [selectedVariation, setSelectedVariation] = useState(product.variations[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [pinCode, setPinCode] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const user_token = Cookies.get("user_token");

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => quantity > 1 && setQuantity((prev) => prev - 1);

  const handleAddToCart = () => {
    if (!selectedSize) {
      if (!user_token) {
        toast.error("Please login first to add items to your cart.");
        navigate("/");
      } else {
        toast.error("Please select a size before adding to the cart.");
      }
      return;
    }

    const selectedData = selectedVariation.sizes.find((s) => s.size === selectedSize);

    if (user_token) {
      addToCart({
        ...product,
        productID: product._id,
        variationId: selectedData._id,
        price: selectedData.price,
        discount: selectedData.discount,
        size: selectedSize,
        quantity,
      });
      toast.success(`${product.name} in ${selectedSize} (Qty: ${quantity}) added to your cart!`);
    } else {
      toast.error("Please login first to add items to your cart.");
      navigate("/");
    }
  };

  const handleImageClick = (image) => setCurrentImage(image);
  const handleSizeClick = (size) => setSelectedSize(size);
  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
    setCurrentImage(variation.images[0]);
    setSelectedSize(null);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select a size before proceeding.");
      return;
    }
    addToCart({ ...product, size: selectedSize });
    navigate("/cart", { state: { product: { ...product, size: selectedSize, quantity: 1 } } });
  };

  const sizes = selectedVariation.sizes.map((size) => size.size);
  const images = selectedVariation.images;

  const visibleImages = images.slice(startIndex, startIndex + 5);

  const handleNext = () => {
    if (startIndex + 5 < images.length) setStartIndex(startIndex + 1);
  };

  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center py-10 bg-gray-100 mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10 w-full max-w-7xl bg-white p-4 sm:p-6 rounded-xl shadow-md">
          
          {/* Image Section */}
          <div className="flex flex-col gap-5 lg:w-1/3 w-full">
            <div className="w-full rounded-lg overflow-hidden border">
              <img src={currentImage} alt={product.name} className="w-full object-cover" />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
              {startIndex > 0 && (
                <button className="p-2 border bg-white rounded-full" onClick={handlePrev}>
                  {"<"}
                </button>
              )}
              <div className="flex gap-2 overflow-x-auto max-w-full sm:max-w-xs">
                {visibleImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-14 h-14 object-cover cursor-pointer border-2 border-transparent hover:border-red-500 rounded"
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>
              {startIndex + 5 < images.length && (
                <button className="p-2 border bg-white rounded-full" onClick={handleNext}>
                  {">"}
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">{product.name}</h1>

            <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
              <span className="text-base sm:text-lg line-through text-gray-500">₹{product.basePrice}</span>
              <span className="text-xl sm:text-2xl font-semibold text-red-500">
                ₹{selectedVariation.sizes.find((s) => s.size === selectedSize)?.price || selectedVariation.sizes[0].price}
              </span>
              <span className="px-2 text-sm font-bold text-green-600 bg-gray-100 border border-black">
                -{selectedVariation.sizes.find((s) => s.size === selectedSize)?.discount || selectedVariation.sizes[0].discount}%
              </span>
            </div>

            <span className="text-sm text-gray-500">Inclusive of all taxes</span>

            {/* Colors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Select Color</h3>
              <div className="flex gap-2 flex-wrap">
                {product.variations.map((variation, index) => (
                  <img
                    key={index}
                    src={variation.images[0]}
                    alt={`Variation ${index + 1}`}
                    className={`w-10 h-10 rounded-full cursor-pointer ${
                      selectedVariation === variation ? "border-2 p-0.5 border-black" : ""
                    }`}
                    onClick={() => handleVariationChange(variation)}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Size</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`w-10 h-10 text-sm sm:text-base rounded-full border border-gray-300 font-semibold ${
                      selectedSize === size ? "bg-green-600 text-white" : "bg-white"
                    } hover:bg-green-100`}
                    onClick={() => handleSizeClick(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
              <h3 className="text-lg font-semibold text-gray-800">Quantity</h3>
              <button className="px-3 py-2 bg-gray-300 rounded-lg" onClick={handleDecrement}>
                -
              </button>
              <span className="text-lg">{quantity}</span>
              <button className="px-3 py-2 bg-gray-300 rounded-lg" onClick={handleIncrement}>
                +
              </button>
            </div>

            {/* Pin Code */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Enter Pin Code</h3>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Enter your pin code"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button className="w-full py-3 bg-green-600 text-white rounded-lg" onClick={handleAddToCart}>
                Add to Bag
              </button>
              <button className="w-full py-3 bg-red-600 text-white rounded-lg" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">Product Details</h3>
              {Array.isArray(product.description) ? (
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {product.description.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">{product.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />

      <ProductList categoryId={product.category_id._id} />

      <Footer />
    </>
  );
};

export default ProductDetails;
