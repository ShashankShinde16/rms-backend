import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import ProductList from "../components/ProductListBy";

const ProductByBrand = () => {
    // const { name } = useParams();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow p-5">
                <ProductList />
            </div>
            <Footer />
        </div>
    );
}

export default ProductByBrand;
