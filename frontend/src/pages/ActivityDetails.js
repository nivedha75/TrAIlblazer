
import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Rating from '@mui/material/Rating';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Card,
  CardMedia,
  CardContent,
  Container,
  IconButton,
  Typography,
  Paper,
  Grid2,
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
import ChihulyGarden3 from "../assets/Activities/ChihulyGarden3.jpg";
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

const ActivityDetails = () => {
    const { activityId } = useParams();
    const [activity, setActivity] = useState(null);
    const navigate = useNavigate();
    const [images, setImages] = useState([]);

  
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
        .then((data) => {
          setActivity(data);
          setImages(data.images || [] );
        })
        .catch((error) => console.error("Error fetching trip details:", error));
    }, [activityId]);
  
    if (!activity) {
      return <p>Loading activity details...</p>;
    }
    
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
          <Typography variant="h3" align="center" gutterBottom>
            {activity.name}
          </Typography>
  
          <Grid2 container spacing={3}>
            {/* <Grid2 item xs={12} md={6}>
              <Card sx={{ maxHeight: 400, overflow: "hidden" }}>
                <CardMedia component="img" image={activity.images[0]} alt={activity.name} sx={{ height: 400 }} />
              </Card>
            </Grid2> */}
            <ThemeProvider theme={theme}>
        <Box sx={{ width: "90%", margin: "auto", padding: "20px", position: "relative", height: "40vh" }}>

        {images && images.length > 0 ? (
        <Slider {...settings}>
            {images.map((image, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                <Card
                sx={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    height: "40vh",
                    width: "95%",
                    margin: "0 auto",
                }}
                >
                <CardMedia component="img" image={imageMap[image]} alt={image} sx={{ height: "100%", width: "100%", objectFit: "cover" }} />
                
                </Card>
            </Box>
            ))}
        </Slider>) : (
            <Box sx={{ textAlign: "center", padding: "20px" }}>
                <Typography variant="h5" color="gray" sx={{fontStyle: "italic"}}>No images available</Typography>
            </Box>
        )}
        </Box>
        </ThemeProvider>

            <Grid2 item xs={12} md={6}>
              <Card sx={{ p: 2, backgroundColor: "#ffffff" }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {activity.description}
                  </Typography>
                  <Typography variant="h6">Visitor Experience</Typography>
                  <Typography variant="body2">{activity.experience}</Typography>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
  
          <Grid2 container spacing={3} sx={{ mt: 2 }}>
            <Grid2 item xs={12} md={6}>
              <Card sx={{ p: 2, backgroundColor: "#ffffff" }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Hours of Operation
                  </Typography>
                  {Object.entries(activity.hours).map(([day, times]) => (
                    <Typography key={day} variant="body2">
                      <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {times.open} – {times.close}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 item xs={12} md={6}>
              <Card sx={{ p: 2, backgroundColor: "#ffffff" }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Rating
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" sx={{ pr: 1 }}>{activity.rating}</Typography>
                    <Rating name="activity-rating" precision={0.1} size="large" readOnly value={activity.rating} />
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
  
          <Card sx={{ p: 2, backgroundColor: "#ffffff", mt: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Contact Information
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong> {activity.address}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {activity.number}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {activity.email}
              </Typography>
            </CardContent>
          </Card>
  
          <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="contained" sx={{ textTransform: "none", backgroundColor: theme.palette.purple.main, color: "white",
                            "&:hover": { backgroundColor: "#4BAF36"}, fontSize: "1rem", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}
                             onClick={() => navigate("/activities")}>
              Back to Activities
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  };
  
  export default ActivityDetails;

