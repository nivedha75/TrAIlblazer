
import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Rating from '@mui/material/Rating';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Card,
  CardMedia,
  Container,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Button,
  ThemeProvider
} from "@mui/material";
import React from "react";
import theme from "../theme";
import AddIcon from "@mui/icons-material/Add";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ChihulyGarden from "../assets/Activities/ChihulyGarden.jpg";
import ChihulyGarden2 from "../assets/Activities/ChihulyGarden2.jpg";
import ChihulyGarden3 from "../assets/Activities/ChihulyGarden2.jpg";
import SpaceNeedle from "../assets/Activities/SpaceNeedle.jpg";
import SpaceNeedle2 from "../assets/Activities/SpaceNeedle2.jpg";
import SpaceNeedle3 from "../assets/Activities/SpaceNeedle3.jpg";
import PikePlaceMarket from "../assets/Activities/PikePlaceMarket.jpg";
import PikePlaceMarket2 from "../assets/Activities/PikePlaceMarket2.jpg";
import PikePlaceMarket3 from "../assets/Activities/PikePlaceMarket3.jpg";
import MuseumOfFlight from "../assets/Activities/MuseumOfFlight.jpg";
import MuseumOfFlight2 from "../assets/Activities/MuseumOfFlight2.jpg";
import MuseumOfFlight3 from "../assets/Activities/MuseumOfFlight3.jpg";
import WhalePudgetSound from "../assets/Activities/WhalePudgetSound.jpg";
import WhalePudgetSound2 from "../assets/Activities/WhalePudgetSound2.jpg";
import WhalePudgetSound3 from "../assets/Activities/WhalePudgetSound3.jpg";



const imageMap = {
  "../assets/Activities/ChihulyGarden.jpg": ChihulyGarden,
  "../assets/Activities/ChihulyGarden2.jpg": ChihulyGarden2,
  "../assets/Activities/ChihulyGarden3.jpg": ChihulyGarden3,
  "../assets/Activities/SpaceNeedle.jpg": SpaceNeedle,
  "../assets/Activities/SpaceNeedle2.jpg": SpaceNeedle2,
  "../assets/Activities/SpaceNeedle3.jpg": SpaceNeedle3,
  "../assets/Activities/PikePlaceMarket.jpg": PikePlaceMarket,
  "../assets/Activities/PikePlaceMarket2.jpg": PikePlaceMarket2,
  "../assets/Activities/PikePlaceMarket3.jpg": PikePlaceMarket3,
  "../assets/Activities/MuseumOfFlight.jpg": MuseumOfFlight,
  "../assets/Activities/MuseumOfFlight2.jpg": MuseumOfFlight2,
  "../assets/Activities/MuseumOfFlight3.jpg": MuseumOfFlight3,
  "../assets/Activities/WhalePudgetSound.jpg": WhalePudgetSound,
  "../assets/Activities/WhalePudgetSound2.jpg": WhalePudgetSound2,
  "../assets/Activities/WhalePudgetSound3.jpg": WhalePudgetSound3,
};


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


const ActivityDetails = () => {
    const { activityId } = useParams();
    const [activity, setActivity] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      fetch(`http://localhost:55000/activities/${activityId}`, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      })
        .then((response) => response.json())
        .then((data) => setActivity(data))
        .catch((error) => console.error("Error fetching trip details:", error));
    }, [activityId]);
  
    if (!activity) {
      return <p>Loading activity details...</p>;
    }
    
    const imageUrl = imageMap[activity.images[0]] || activity.images[0];

    return (
      <Container maxWidth="md" sx={{ textAlign: "center", py: 4, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
        <Typography variant="h3" color="textPrimary" gutterBottom>
          Activity Details
        </Typography>
        <Typography variant="h4" color="textSecondary" gutterBottom>
          {activity.name}
        </Typography>
        
        <Typography variant="h5" color="textPrimary" gutterBottom>Description</Typography>
        <Typography variant="body1" paragraph>{activity.description}</Typography>
        
        <Typography variant="h5" color="textPrimary" gutterBottom>Hours of Operation</Typography>
        {Object.entries(activity.hours).map(([day, times]) => (
          <Typography key={day} variant="body1">
            <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {times.open} – {times.close}
          </Typography>
        ))}
        
        <Typography variant="h5" color="textPrimary" gutterBottom>Visitor Experience</Typography>
        <Typography variant="body1" paragraph>{activity.experience}</Typography>
        
        <Typography variant="h5" color="textPrimary" gutterBottom>Rating</Typography>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <Typography variant="h6" sx={{ pr: 1 }}>{activity.rating}</Typography>
          <Rating name="activity-rating" precision={0.1} size="large" readOnly value={activity.rating} />
        </Box>
        
        <Typography variant="h5" color="textPrimary" gutterBottom>Contact Information</Typography>
        <Typography variant="body1"><strong>Address:</strong> {activity.address}</Typography>
        <Typography variant="body1"><strong>Phone:</strong> {activity.number}</Typography>
        <Typography variant="body1"><strong>Email:</strong> {activity.email}</Typography>
        
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, px: 4, py: 1.5, fontSize: "1rem" }}
          onClick={() => navigate("/activities")}
        >
          Back to Activities
        </Button>
      </Container>
    );
  };
  
  export default ActivityDetails;
