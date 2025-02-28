
import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Rating from '@mui/material/Rating';
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
import React from "react";
import theme from "../theme";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ChihulyGarden from "../assets/Activities/ChihulyGarden.jpg";
import ChihulyGarden2 from "../assets/Activities/ChihulyGarden2.jpg";
import ChihulyGarden3 from "../assets/Activities/ChihulyGarden2.jpg";
import SpaceNeedle from "../assets/Activities/SpaceNeedle.jpg";
import PikePlaceMarket from "../assets/Activities/PikePlaceMarket.jpg";
import OlympicSculpturePark from "../assets/Activities/OlympicSculpturePark.jpg";
import MuseumOfFlight from "../assets/Activities/MuseumOfFlight.jpeg";
import WhalePudgetSound from "../assets/Activities/WhalePudgetSound.jpg";



const imageMap = {
  "../assets/Activities/ChihulyGarden.jpg": ChihulyGarden,
  "../assets/Activities/ChihulyGarden2.jpg": ChihulyGarden2,
  "../assets/Activities/ChihulyGarden3.jpg": ChihulyGarden3,
  "../assets/Activities/SpaceNeedle.jpg": SpaceNeedle,
  "../assets/Activities/PikePlaceMarket.jpg": PikePlaceMarket,
  "../assets/Activities/OlympicSculpturePark.jpg": OlympicSculpturePark,
  "../assets/Activities/MuseumOfFlight.jpeg": MuseumOfFlight,
  "../assets/Activities/WhalePudgetSound.jpg": WhalePudgetSound
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
      <div style={{
        maxWidth: "1500px",
        height: "1500px",
        margin: "auto",
        textAlign: "center",
        backgroundColor: "#f9f9f9"
      }}>
        <h1 style={{textAlign: "center", color: "#333", marginBottom: "10px" }}>Activity Details</h1>
        {/*imageUrl && (
        <img 
          src={imageUrl} 
          alt={activity.name} 
          style={{
            width: "100%",
            maxHeight: "350px",
            objectFit: "contain",
            marginBottom: "15px"
          }} 
        />
        )*/}

{/*<ThemeProvider theme={theme}>
        <Box sx={{ width: "90%", margin: "auto", padding: "20px", position: "relative", height: "85vh" }}>
        
        {activities && activities.length > 0 ? (
        <Slider {...settings}>
            {activities.map((act, index) => (
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
                <CardMedia component="img" image={activity.image[index]} alt={activity.name} sx={{ height: "100%", width: "100%", objectFit: "cover" }} />
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
                </Box>
                </Card>
            </Box>
            ))}
        </Slider>) : (
            <Box sx={{ textAlign: "center", padding: "20px" }}>
                <Typography variant="h5" color="gray" sx={{fontStyle: "italic"}}>No images available</Typography>
            </Box>
        )}
        </Box>
        </ThemeProvider>*/}

        {/**/}
          <h1 style={{ color: "#333", marginBottom: "10px" }}>{activity.name}</h1>
          <h2>Description</h2>
          <p>{activity.description}</p>

          <h2>Hours of Operation</h2>
              <p><strong>Sunday:</strong> {activity.hours.sunday.open} – {activity.hours.sunday.close}</p>
              <p><strong>Monday:</strong> {activity.hours.monday.open} – {activity.hours.monday.close}</p>
              <p><strong>Tuesday:</strong> {activity.hours.tuesday.open} – {activity.hours.tuesday.close}</p>
              <p><strong>Wednesday:</strong> {activity.hours.wednesday.open} – {activity.hours.wednesday.close}</p>
              <p><strong>Thursday:</strong> {activity.hours.thursday.open} – {activity.hours.thursday.close}</p>
              <p><strong>Friday:</strong> {activity.hours.friday.open} – {activity.hours.friday.close}</p>
              <p><strong>Saturday:</strong> {activity.hours.saturday.open} – {activity.hours.saturday.close}</p>
          
          <h2>Visitor Experience</h2>
          <p>{activity.experience}</p>
          
          <h2>Rating</h2>
          <p>{activity.rating}</p>

          <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ paddingRight: "0.25rem"}}>{activity.rating} </Box>
                        <Rating name="activity-rating" precision={0.1} 
                        size="large" readOnly value={activity.rating}/>
                        {/* <Button variant="contained">More Details</Button> */}
                    </Box>
          

          <h2>Contact Information</h2>
          <p><strong>Address:</strong> {activity.address}</p>
          <p><strong>Phone:</strong> {activity.number}</p>
          <p><strong>Email:</strong> {activity.email}</p>          
        <button style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "18px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "0.3s",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
        }} onClick={() => navigate("/activities")}>Back to Activities</button>
      </div>
    );
  };
  
  export default ActivityDetails;
