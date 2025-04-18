import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import { Link } from "react-router-dom";

const API_URL = `http://localhost:3000/api/v1/categories/`;

// Custom Arrow Components
const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
        <ArrowBackIosNewIcon
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white w-10 h-10 bg-transparent bg-opacity-50 rounded-full cursor-pointer z-10"
            onClick={onClick}
        />
    );
};

const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
        <ArrowForwardIos
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white w-10 h-10 bg-transparent bg-opacity-50 rounded-full cursor-pointer z-10"
            onClick={onClick}
        />
    );
};

const NewArrivalsGrid = () => {
    const [categories, setCategories] = useState({});

    // Array of banners with their related category names
    const bannerItems = [
        {
            name: "Full sleeve",
            image: "https://d118ps6mg0w7om.cloudfront.net/media/boolfly/banner/SS-25-Full-Sleeves-Shirts.jpg",
        },
        {
            name: "Formal",
            image: "https://d118ps6mg0w7om.cloudfront.net/media/boolfly/banner/SS-25-Half-Sleeves-Shirts.jpg",
        },
        {
            name: "Tshirt",
            image: "https://d118ps6mg0w7om.cloudfront.net/media/boolfly/banner/SS-25-Tees.jpg",
        },
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(API_URL);
                const data = response.data.getAllCategories;
                
                const categoryMap = {};
                data.forEach((cat) => {
                    categoryMap[cat.name.toLowerCase()] = cat._id;
                });
                
                setCategories(categoryMap);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const settings = {
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        dots: false,
        fade: true,
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
    };

    return (
        <div className="w-full mt-2 overflow-hidden relative">
            <Slider {...settings}>
                {bannerItems.map((item, index) => {
                    const categoryId = categories[item.name.toLowerCase()];
                    return (
                        <div key={index}>
                            <Link
                                to={`/new-arrivals/${item.name.replace(/\s+/g, "-")}`}
                                state={{ categoryId, categoryName: item.name }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-auto object-cover"
                                />
                            </Link>
                        </div>
                    );
                })}
            </Slider>
        </div>
    );
};

export default NewArrivalsGrid;
