import React, {useState, useEffect, useRef} from "react";
import { useNavigate, Link } from "react-router-dom";
import Profile from "../assets/Profile.png";
import Beijing from "../assets/Beijing.png";
import Hawaii from "../assets/hawaii.png";
import ChatBot from "../assets/Chatbot.png";
import York from "../assets/NewYork.png";
import Indonesia from "../assets/Indonesia.png";
import Japan from "../assets/Japan.png";
import Paris from "../assets/Paris.png";
import Canyon from "../assets/Canyon.png";
import Share from "@mui/icons-material/Share";
import Cookies from "js-cookie";
import Slider from "react-slick";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {IconButton} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { isPast, parseISO, format, isBefore, startOfDay, parse } from 'date-fns';
import AddIcon from "@mui/icons-material/Add"; 
import Bot from "../assets/Bot.avif";

const NextArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      right: "-55px",
      transform: "translateY(-50%)",
      backgroundColor: "#00000099",
      color: "white",
      zIndex: 2,
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
      left: "-50px",
      transform: "translateY(-50%)",
      backgroundColor: "#00000099",
      color: "white",
      zIndex: 2,
      "&:hover": { backgroundColor: "#000000CC" },
    }}
  >
    <ArrowBackIosNewIcon />
  </IconButton>
);

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trips, setTrips] = useState([]);
  const [places, setPlaces] = useState([]);
  const ddRef = useRef(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ddRef.current && !ddRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    fetch("http://localhost:55000/trips", {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data: ", data);
        setTrips(data);
      })
      .catch((error) => console.error("Error fetching trips:", error));
  }, []);

  useEffect(() => {
    if (trips.length > 0) {
      const today = startOfDay(new Date());
      console.log("Today: ", today);
      const upcoming = trips.filter(trip => {
        const tripEndDate = startOfDay(parse(trip.endDate, 'yyyy-MM-dd', new Date()));
        console.log("End date: ", tripEndDate);
        return tripEndDate >= today;
      });
  
      const past = trips.filter(trip => {
        const tripEndDate = startOfDay(parse(trip.endDate, 'yyyy-MM-dd', new Date()));
        return tripEndDate < today;
      });
  
      
      setUpcomingTrips(upcoming);
      setPastTrips(past);

      console.log("Upcoming Trips: ", upcoming);
      console.log("Past Trips: ", past);
    }
  }, [trips]);


  useEffect(() => {
    fetch("http://localhost:55000/places", {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data: ", data);
        setPlaces(data);
      })
      .catch((error) => console.error("Error fetching places:", error));
  }, []);


useEffect(() => {
  // Check if the 'user_id' cookie is set
  const userId = Cookies.get("user_id");
  //alert(document.cookie);
  //'user_id=1;username=praveer'
  //alert(userId);

  // If 'user_id' cookie exists, the user is authenticated
  if (userId) {
    setIsAuthenticated(true);
  } else {
    setIsAuthenticated(false);
  }
  //const savedTrips = JSON.parse(localStorage.getItem("trips")) || [];
  //setTrips(savedTrips);
}, []);
  const navigate = useNavigate();

  const navigateToCreate = () => {
    navigate("/create");
  };

  const navigateToSurvey = () => {
    navigate("/survey");
  };

  const viewDetails = (tripId) => {
    navigate(`/trip-details/${encodeURIComponent(tripId)}`);
  };

  const itineraryDetails = (tripId) => {
    navigate(`/itinerary-details/${encodeURIComponent(tripId)}`);
  };

  const placeDetails = (placeId) => {
    navigate(`/place-details/${encodeURIComponent(placeId)}`);
  };

  const imageMap = {
    "../assets/Indonesia.png": Indonesia,
    "../assets/Paris.png": Paris,
    "../assets/NewYork.png": York, 
    "../assets/Japan.png": Japan, 
    "../assets/hawaii.png": Hawaii,
    "../assets/Beijing.png": Beijing
  };

  const navigateToSignIn = () => {
    navigate('/sign-in');
  }

  const handleLogout = () => {
    // Remove the 'user_id' cookie
    Cookies.remove("user_id");

    // Reload the page
    window.location.reload();
  };

  const Card = ({ 
    image, 
    title = "Place", 
    buttonText = "Trip Details", 
    button = () => alert("Trip Details"), 
    itineraryButton = null,
    start, 
    end, 
    people, 
    share 
  }) => {
    return (
      <div style={{
        width: "270px",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 8px 8px rgba(0, 0, 0, 0.1), -3px -6px 8px rgba(0, 0, 0, 0.15)",
        backgroundColor: "#90EE90",
        textAlign: "center",
        margin: "10px",
        position: "relative", 
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "350px",
        transition: "transform 0.3s ease, box-shadow 0.3s ease"
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
          {image && <img src={image} alt={title} style={{ width: "100%", height: "50%", borderRadius: "10px" }} />}
          <h2 style={{ margin: "5px", padding: "0" }}>{title}</h2>
          {start && <h3 style={{ margin: "5px", padding: "0" }}>{start} - {end}</h3>}
          {people && (
            <h3 style={{ margin: "5px", padding: "0", display: "flex", alignItems: "center", gap: "5px" }}>
              {people} {people === 1 ? "Traveler" : "Travelers"}
              <span style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: people }).map((_, index) => (
                  <PersonIcon key={index} style={{ fontSize: "30px", color: "#555" }} />
                ))}
              </span>
            </h3>
          )}
        </div>
  
        {/* Buttons Container */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: share ? "10px" : "50%",
          transform: share ? "none" : "translateX(-50%)",       
          display: "flex",
          flexDirection: "row", /* Stack buttons vertically */
          alignItems: "center",
          gap: "8px"
        }}>
         {share && (
             <Share style={{ fontSize: 24, color: "#555" }} />
          // {share && (
          //   <img 
          //     src={share} 
          //     alt="Share" 
          //     style={{ 
          //       width: "30px", 
          //       height: "30px", 
          //       cursor: "pointer" 
          //     }}
          //   />
          )}
          
          {/* Trip Details Button */}
          <button 
            onClick={button} 
            style={{
              padding: "10px 15px",
              border: "none",
              backgroundColor: "#800080",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
            }}
          >
            {buttonText}
          </button>
  
          {/* Itinerary Details Button */}
          {itineraryButton && (
          <button 
            onClick={itineraryButton} 
            style={{
              padding: "10px 15px",
              border: "none",
              backgroundColor: "#0066CC",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
            }}
          >
            Itinerary Details
          </button>)}
        </div>
  
      </div>
    );
  };
  

  const settings = {
    dots: false,
    infinite: upcomingTrips.length > 1,
    slidesToShow: Math.min(4, upcomingTrips.length),
    slidesToScroll: 1,
    arrows: upcomingTrips.length > 1,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />, 
    centerMode: upcomingTrips.length == 1,
    speed: 500,
    variableWidth: false,
    responsive: [
      { breakpoint: 1300, settings: { slidesToShow: Math.min(3, upcomingTrips.length) } },
      { breakpoint: 1000, settings: { slidesToShow: Math.min(2, upcomingTrips.length) } },
      { breakpoint: 600, settings: { slidesToShow: Math.min(1, upcomingTrips.length) } },
    ],
  };

  const settings2 = {
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />, 
    centerMode: false,
    speed: 500,
    responsive: [
      { breakpoint: 1300, settings: { slidesToShow: 3 } },
      { breakpoint: 1000, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const settings3 = {
    dots: false,
    infinite: pastTrips.length > 1,
    slidesToShow: Math.min(4, pastTrips.length),
    slidesToScroll: 1,
    arrows: pastTrips.length > 1,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />, 
    centerMode: pastTrips.length == 1,
    speed: 500,
    variableWidth: false,
    responsive: [
      { breakpoint: 1300, settings: { slidesToShow: Math.min(3, pastTrips.length) } },
      { breakpoint: 1000, settings: { slidesToShow: Math.min(2, pastTrips.length) } },
      { breakpoint: 600, settings: { slidesToShow: Math.min(1, pastTrips.length) } },
    ],
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <div>
        <h1 style={{ textAlign: "center", color: "#32CD32",  textShadow: "3px 3px 6px rgba(0, 0, 0, 0.3)", fontWeight: "bold" }}>
          Tr<span style={{ color: "#800080" }}>AI</span>lblazer
        </h1>
  
        {isAuthenticated ? (
          <div style={{  position: "absolute", top: "10px", right: "20px"  }} ref={ddRef}>
           <PersonIcon
              style={{
                fontSize: "50px",
                cursor: "pointer"
              }}
              onClick={toggleDropdown}
            />
            {isOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  right: "0px",
                  backgroundColor: "white",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  borderRadius: "5px",
                  padding: "10px",
                  zIndex: 10,
                  minWidth: "150px"
                }}
              >
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {["Edit Profile", "Edit Survey", "Logout"].map((option, index) => (
                    <li
                      key={index}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        transition: "background 0.2s ease-in-out",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
                      onClick={() => {
                        if (option === "Logout") handleLogout();
                        if (option === "Edit Survey") navigate("/survey");
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={navigateToSignIn}
            style={{
              position: "relative",
              left: "1350px",
              top: "-60px",
              padding: "10px",
              fontSize: "16px",
              backgroundColor: "#32CD32",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        )}
      </div>
  
      <div>
        <h1 style={{ marginLeft: "20px" }}>My Trips:</h1>
        <div style={{ width: "90%", margin: "auto", position: "relative", zIndex: 1 }}>
        <Slider {...settings}>
          {upcomingTrips.map((trip) => {
            const formattedStartDate = format(parseISO(trip.startDate), "MMMM dd");
            const formattedEndDate = format(parseISO(trip.endDate), "MMMM dd");
             return (
    <Card key={trip._id} image={imageMap[trip.images]} title={trip.location} button={() => viewDetails(trip._id)} itineraryButton={() => itineraryDetails(trip._id)} start={formattedStartDate} end={formattedEndDate} people={trip.people} description="Upcoming trip" share={Share} />
  );})}
  </Slider>
        </div>
        {/* <div style={{ display: "flex", gap: "10px" }}>
          <Card image={Hawaii} title="Hawaii Getaway" description="Enjoy the beaches of Hawaii." share={Share} />
          <Card image={York} title="New York Adventure" description="Explore the city that never sleeps." share={Share} />
          <Slider {...settings}>
          {trips.map((trip) => {
             const formattedStartDate = new Date(trip.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" });
             const formattedEndDate = new Date(trip.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric" });
             return (
    <Card key={trip._id} image={imageMap[trip.images]} title={trip.location} button={() => viewDetails(trip._id)} start={formattedStartDate} end={formattedEndDate} people={trip.people} description="Upcoming trip" share={Share} />
  );})}
        </Slider>
        </div> */}
  </div>
  <button onClick={navigateToCreate} style={{ marginTop: "30px", padding: "10px", fontSize: "20px", backgroundColor: "#32CD32", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", transition: "transform 0.2s ease, box-shadow 0.2s e", display: "flex", alignItems: "center"}} onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
          }}>Create Trip <AddIcon style={{ fontSize: "24px" }} /></button>
  <div style={{ marginTop: "40px" }}>
  <h1 style={{marginLeft: "20px"}}>Discover New Vacation Spots:</h1>
  <div style={{ width: "90%", margin: "auto", position: "relative", zIndex: 1 }}>
  <Slider {...settings2}>
          {places.map((place) => {
             return (
    <Card key={place._id} image={imageMap[place.images[0]]} title={place.name} description={place.description} button={() => placeDetails(place._id)} buttonText="Place Details"/>
  );})}
  </Slider>
  </div>
  <button onClick={navigateToSurvey} style={{ marginTop: "30px", padding: "10px", fontSize: "20px", backgroundColor: "#32CD32", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", transition: "transform 0.2s ease, box-shadow 0.2s e"}} onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
          }}>Take Our Travel Quiz</button>
  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", margin: "10px 20px 0 0", position: "fixed", bottom: "0px", right: "0px", zIndex: 0 }}>
  <p style={{ fontSize: "16px", color: "#555", marginRight: "10px", maxWidth: "250px"}}>
    Meet your personal AI travel assistant! Get personalized recommendations and plan your next trip with ease.
  </p>
  <img
    src={Bot}
    alt="ChatBot"
    style={{ width: "80px", height: "80px"}}
  />
</div>
  </div>
  <div style={{ marginTop: "40px" }}>
  <h1 style={{marginLeft: "20px"}}>Past Trips:</h1>
  <div style={{ width: "90%", margin: "auto", position: "relative" }}>
        <Slider {...settings3}>
          {pastTrips.map((trip) => {
            const formattedStartDate = format(parseISO(trip.startDate), "MMMM dd");
            const formattedEndDate = format(parseISO(trip.endDate), "MMMM dd");
             return (
    <Card key={trip._id} image={imageMap[trip.images]} title={trip.location} button={() => viewDetails(trip._id)} itineraryButton={() => itineraryDetails(trip._id)} start={formattedStartDate} end={formattedEndDate} people={trip.people} description="Upcoming trip" share={Share} />
  );})}
  </Slider>
        </div>
  </div>
  </div>);
};

export default HomePage;