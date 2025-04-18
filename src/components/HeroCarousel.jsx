import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HeroCarousel.css"; // Custom styles
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";


// Custom Arrow Components
const CustomPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <ArrowBackIosNewIcon
            className={className}
            style={{
                ...style,
                display: "block",
                left: "10px",
                zIndex: 10,
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                background: "transparent",
                borderRadius: "50%",
                padding: "5px"
            }}
            onClick={onClick}
        />
    );
};

const CustomNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <ArrowForwardIos
            className={className}
            style={{
                ...style,
                display: "block",
                right: "10px",
                zIndex: 10,
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                background: "transparent",
                borderRadius: "50%",
                padding: "5px"
            }}
            onClick={onClick}
        />
    );
};

const HeroCarousel = () => {
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
        <div className="hero-carousel mt-12">
            <Slider {...settings}>
                {/* <div>
                    <img src="./images/1-All-Same-flat-30-Photoroom.png" alt="Banner 1" />
                </div> */}
                <div>
          <img
            src="https://d118ps6mg0w7om.cloudfront.net/media/boolfly/banner/1_All-Same-Burgundy(A).png"
            alt="Banner 1"
            className="w-full object-cover  h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
          />
        </div>
        <div>
          <img
            src="https://d118ps6mg0w7om.cloudfront.net/media/boolfly/banner/4_All-Same-Latic(A).png"
            alt="Banner 2"
            className="w-full h-auto object-cover"
          />
        </div>
            </Slider>
        </div>
    );
};

export default HeroCarousel;
