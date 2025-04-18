import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Carousel2.css"; // Custom styles for the carousel

const Carousel2 = () => {
    const settings = {
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000, 
        arrows: false, // Hide default arrows
        dots: false, // Disable dots (remove pagination dots)
        fade: true, // Optional fade effect for smooth transitions
    };

    return (
        <div className="carousel2">
            <Slider {...settings}>
                <div>
                    <div className="video-container">  {/* Wrap iframe in a container */}
                    <iframe width="914" height="514" src="https://www.youtube.com/embed/_JLnfvH90lw" title="End of Season Sale! Flat 25% Off. All Same Styling by Mufti" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                </div>
                <div>
                <iframe width="914" height="514" src="https://www.youtube.com/embed/TbymmUIY0W0" title="End of Season Sale! Flat 25% Off. Four Triple Oh Five Oh by Mufti" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
                <div>
                <iframe width="914" height="514" src="https://www.youtube.com/embed/_zmKoumwIA4" title="End of Season Sale! Flat 25% Off. All Same Styling by Mufti" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
            </Slider>
        </div>
    );
};

export default Carousel2;