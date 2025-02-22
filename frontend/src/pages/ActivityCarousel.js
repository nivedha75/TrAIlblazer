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
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"; // "Add to Itinerary" icon
import { useNavigate } from "react-router-dom"; // For navigation to details page
import { settings } from "survey-react";
import Canyon from "../assets/Canyon.png";

const activities = [
  {
    title: "Chihuly Garden and Glass",
    image: "https://source.unsplash.com/400x600/?glass,art",
    location: "Seattle, WA",
    rating: 4.8,
  },
  {
    title: "Seattle Space Needle",
    image: "https://source.unsplash.com/400x600/?seattle,needle",
    location: "Seattle, WA",
    rating: 4.7,
  },
  {
    title: "Pike Place Market",
    image: "https://source.unsplash.com/400x600/?market,food",
    location: "Seattle, WA",
    rating: 4.6,
  },
  {
    title: "Museum of Pop Culture",
    image: "https://source.unsplash.com/400x600/?museum,music",
    location: "Seattle, WA",
    rating: 4.5,
  },
  {
    title: "Kerry Park",
    image: "https://source.unsplash.com/400x600/?park,skyline",
    location: "Seattle, WA",
    rating: 4.9,
  },
];

const ActivityCarousel = () => {
  const navigate = useNavigate(); // Handles navigation

  const settings = {
    dots: false,
    infinite: true,
    centerMode: true,
    speed: 500,
    slidesToShow: 3, // Show 3 at a time
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1300, // Large Laptop
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1000, //Smaller Laptop/Tablet
        settings: {
            slidesToShow: 2,
        }
      },
      {
        breakpoint: 600, // Mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Box sx={{ width: "80%", margin: "auto", padding: "20px" }}>
      <Slider {...settings}>
        {activities.map((activity, index) => (
          <Card
            key={index}
            sx={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              height: "500px",
            }}
            //onClick={() => navigate(`/activity/${index}`)} // Navigate to details page
          >
            <CardMedia
              component="img"
              image={activity.image}
              alt={activity.title}
              sx={{ height: "100%", objectFit: "cover" }}
            />
            {/* Overlay Information */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                color: "white",
                padding: "10px",
              }}
            >
              <Typography variant="h6">{activity.title}</Typography>
              <Typography variant="body2">{activity.location}</Typography>
              <Typography variant="body2">⭐ {activity.rating}</Typography>
            </Box>

            {/* "Add to Itinerary" Button */}
            <Tooltip title="Add to Itinerary">
              <IconButton
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click navigation
                  alert(`Added ${activity.title} to itinerary!`);
                }}
              >
                <FavoriteBorderIcon />
              </IconButton>
            </Tooltip>
          </Card>
        ))}
      </Slider>
    </Box>
  );
};

export default ActivityCarousel;
