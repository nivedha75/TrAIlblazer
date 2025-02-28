import React from "react";
import { useState, useEffect } from "react";
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
  Button,
  ThemeProvider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import ChihulyGarden from "../assets/Activities/ChihulyGarden.jpg";
import SpaceNeedle from "../assets/Activities/SpaceNeedle.jpg";
import PikePlaceMarket from "../assets/Activities/PikePlaceMarket.jpg";
import OlympicSculpturePark from "../assets/Activities/OlympicSculpturePark.jpg";
import MuseumOfFlight from "../assets/Activities/MuseumOfFlight.jpg";
import WhalePudgetSound from "../assets/Activities/WhalePudgetSound.jpg";
import theme from "../theme";
import Rating from '@mui/material/Rating';


const activitiesDefault = [
  {
    title: "Chihuly Garden and Glass",
    image: ChihulyGarden,
    location: "Seattle, WA",
    rating: 4.8,
    activityId: "67c0ec23869bb9853f9588fe",
  },
  {
    title: "Seattle Space Needle",
    image: SpaceNeedle,
    location: "Seattle, WA",
    rating: 4.7,
    activityId: "67c10de0d592e3c35dedf769",
  },
  {
    title: "Pike Place Market",
    image: PikePlaceMarket,
    location: "Seattle, WA",
    rating: 4.6,
    activityId: "67c10e18d592e3c35dedf76a",
  },
  {
    title: "Whale Watching at Puget Sound",
    image: WhalePudgetSound,
    location: "Seattle, WA",
    rating: 4.9,
    activityId: "67c10e4ed592e3c35dedf76c",
  },
  {
    title: "Museum of Flight",
    image: MuseumOfFlight,
    location: "Tukwila, WA",
    rating: 4.9,
    activityId: "67c10e32d592e3c35dedf76b",
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
  // const { tripId } = useParams();

  const [activities, setActivities] = useState(activitiesDefault);

  // Fetch saved progress
  // const fetchItineraryActivities = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:55000/itinerary/${tripId}`);
      
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch itinerary: ${response.statusText}`);
  //     }
  
  //     const data = await response.json();
  //     console.log("Fetched itinerary:", data);
  
  //     if (data.activities.next_best_preferences) {
  //       setActivities(data.activities.next_best_preferences);
  //     } else {
  //       console.warn("No next best preferences found.");
  //     }
  //   } catch (error) {
  //     console.error("Error loading itinerary activities:", error);
  //   }
  // };
  
  // useEffect(() => {
  //   fetchItineraryActivities();
  // }, []);

//   // Load activities when component mounts
//   useEffect(() => {
//     fetchAdditionalActivities();
//   }, []);

  // useEffect(() => {
  //   if (activities) {
  //     fetchAdditionalActivities(); // Properly set fetched activities
  //   }
  // }, [activities]);

    useEffect(() => {
      setActivities(activitiesDefault);
    }, [activitiesDefault]);

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
    <ThemeProvider theme={theme}>
        <Box sx={{ width: "90%", margin: "auto", padding: "20px", position: "relative", height: "85vh" }}>
        <Typography variant="h4" color={theme.palette.apple.main}
        sx={{ textShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)", fontSize:"1.75rem",
        padding:"0.5rem", textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
            Additional V<Box component="span" sx={{ color: theme.palette.purple.main }} >AI</Box>acation Activities
        </Typography>
        
        {activities && activities.length > 0 ? (
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
                    <Typography variant="h3" sx={{ fontWeight: "bold", marginBottom: "12px" }}>
                    {activity.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "1rem", marginBottom: "8px" }}>
                    {activity.location}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ paddingRight: "0.25rem"}}>{activity.rating} </Box>
                        <Rating name="activity-rating" precision={0.1} 
                        size="large" readOnly value={activity.rating}/>
                        {/* <Button variant="contained">More Details</Button> */}
                    </Box>
                    <Button variant="contained" onClick={() => navigate(`/activity-details/${encodeURIComponent(activity.activityId)}`)}
                        sx={{ textTransform: "none", backgroundColor: theme.palette.purple.main, color: "white",
                            "&:hover": { backgroundColor: "#4BAF36"}, fontSize: "1rem",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", position: "absolute", bottom: "2rem", right: "5rem"}}>
                    More Details
                    </Button>
                    {/* The regular shadow is boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2) and
                    then this is slightly darker on hover: boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)"
                    However, variant="contained" has default shadows (regular and darker when hovering)*/}
                    
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
        </Slider>) : (
            <Box sx={{ textAlign: "center", padding: "20px" }}>
                <Typography variant="h5" color="gray" sx={{fontStyle: "italic"}}>No activities available</Typography>
            </Box>
        )}
        </Box>
    </ThemeProvider>
  );
};

export default ActivityCarousel;
