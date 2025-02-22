import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Card,
  CardMedia,
  IconButton,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import ChihulyGarden from "../assets/Activities/ChihulyGarden.jpg";
import SpaceNeedle from "../assets/Activities/SpaceNeedle.jpg";
import PikePlaceMarket from "../assets/Activities/PikePlaceMarket.jpg";
import OlympicSculpturePark from "../assets/Activities/OlympicSculpturePark.jpg";
import MuseumOfFlight from "../assets/Activities/MuseumOfFlight.jpeg";
import WhalePudgetSound from "../assets/Activities/WhalePudgetSound.jpg";

const activities = [
  {
    title: "Chihuly Garden and Glass",
    image: ChihulyGarden,
    location: "Seattle, WA",
    rating: 4.8,
  },
  {
    title: "Seattle Space Needle",
    image: SpaceNeedle,
    location: "Seattle, WA",
    rating: 4.7,
  },
  {
    title: "Pike Place Market",
    image: PikePlaceMarket,
    location: "Seattle, WA",
    rating: 4.6,
  },
  {
    title: "Whale Watching at Puget Sound",
    image: WhalePudgetSound,
    location: "Seattle, WA",
    rating: 4.9,
  },
  {
    title: "Museum of Flight",
    image: MuseumOfFlight,
    location: "Seattle, WA",
    rating: 4.9,
  },
];

const NextArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      right: "-70px",
      transform: "translateY(-50%)",
      backgroundColor: "#00000099",
      color: "white",
      "&:hover": { backgroundColor: "#000000CC" },
    }}
  >
    <ArrowForwardIosIcon />
  </IconButton>
);

const PrevArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      left: "-70px",
      transform: "translateY(-50%)",
      backgroundColor: "#00000099",
      color: "white",
      "&:hover": { backgroundColor: "#000000CC" },
    }}
  >
    <ArrowBackIosNewIcon />
  </IconButton>
);

const ActivityCarousel = () => {
  const navigate = useNavigate();

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />, 
    centerMode: false,
    pauseOnHover: true,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      { breakpoint: 1300, settings: { slidesToShow: 3 } },
      { breakpoint: 1000, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box sx={{ width: "90%", margin: "auto", padding: "20px", position: "relative", height: "85vh" }}>
      <Typography variant="h4" sx={{ textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
        Featured Activities
      </Typography>
      <Slider {...settings}>
        {activities.map((activity, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
            <Card
              sx={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                height: "85vh",
                width: "95%",
                margin: "0 auto",
              }}
            >
              <CardMedia component="img" image={activity.image} alt={activity.title} sx={{ height: "100%", width: "100%", objectFit: "cover" }} />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  height: "25%",
                  padding: "40px 25px",
                  background: "linear-gradient(to top, #000000EE 20%, #000000DD 40%, #000000BB 60%, #00000088 75%, #00000055 85%, transparent)",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "12px" }}>
                  {activity.title}
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "8px" }}>
                  {activity.location}
                </Typography>
                <Typography variant="body2">⭐ {activity.rating}</Typography>
              </Box>
              <Tooltip title="Add to Itinerary">
                <IconButton
                  sx={{ position: "absolute", top: 10, right: 10, backgroundColor: "#FFFFFFB3" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Added ${activity.title} to itinerary!`);
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default ActivityCarousel;
