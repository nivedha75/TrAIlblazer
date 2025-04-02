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
import {IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Tooltip} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { isPast, parseISO, format, isBefore, startOfDay, parse } from 'date-fns';
import AddIcon from "@mui/icons-material/Add"; 
import Bot from "../assets/Bot.avif";
import Seattle from "../assets/Seattle2.png";
import DeleteIcon from "@mui/icons-material/Delete";

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

const SIMILAR_DESTINATION_SETS = [
  new Set(["67b91de835b54e8daa42393d", "67ba807bfe85ae9d77bb42a5"]), // bali, honolulu
  new Set(["67b921aa35b54e8daa42393f", "67ba8142fe85ae9d77bb42a6", "67ba81f8fe85ae9d77bb42a7"]), // paris, tokyo, beijing
  new Set(["67ba7f4efe85ae9d77bb42a4", "67c1ee75b5c78ef7266e0d39"]), // nyc, seattle
];

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trips, setTrips] = useState([]);
  const [places, setPlaces] = useState([]);
  const ddRef = useRef(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [pastRecommendingIndex, setPastRecommendingIndex] = useState();
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);

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

      if (past.length > 0) {
        const index = Math.floor(Math.random() * past.length);
        setPastRecommendingIndex(index);
        const recentPastTrip = past[index];
        // past.reduce((latest, trip) =>
        //   parse(trip.endDate, "yyyy-MM-dd", new Date()) > parse(latest.endDate, "yyyy-MM-dd", new Date()) ? trip : latest
        // );

        console.log("Most Recent Past Trip:", recentPastTrip.location);

        // Find the place object for the most recent past trip
        const recentPlace = places.find(place => place.name === recentPastTrip.location);

        if (recentPlace) {
          console.log("Matched Place Object:", recentPlace);

          // Find the set containing this place's _id
          const matchingSet = SIMILAR_DESTINATION_SETS.find(set => set.has(recentPlace._id));

          if (matchingSet) {
            // Get recommended places (excluding the recently visited place)
            const recommendedIds = [...matchingSet].filter(id => id !== recentPlace._id);
            const recommendedPlaces = places.filter(place => recommendedIds.includes(place._id));

            setRecommendedPlaces(recommendedPlaces);
            console.log("Recommended Places:", recommendedPlaces);
          }
        }
      }
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
      fetch(`http://localhost:55000/trips/user/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched user trips: ", data);
        setTrips(data);
      })
      .catch((error) => {console.error("Error fetching trips:", error);
        setTrips([]);
      });
    } else {
      setIsAuthenticated(false);
      setTrips([]);
    }
    //const savedTrips = JSON.parse(localStorage.getItem("trips")) || [];
    //setTrips(savedTrips);
  }, []);
  const navigate = useNavigate();

  const navigateToCreate = () => {
    navigate("/create");
  };

  const navigateToForum = () => {
    navigate("/forum");
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

  const shareDetails = (tripId) => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      })
      .then(() => console.log("Shared successfully"))
      .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Sharing is not supported on this browser.");
    }
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
    "../assets/Beijing.png": Beijing,
    "../assets/Seattle2.png": Seattle
  };

  const navigateToSignIn = () => {
    navigate('/sign-in');
  }

  const handleLogout = () => {
    // Remove the 'user_id' cookie
    Cookies.remove("user_id");
    Cookies.remove("username");

    // Reload the page
    window.location.reload();
  };

  const Card = ({ 
    image, 
    title = "Place", 
    buttonText = "Trip Details", 
    button = () => alert("Trip Details"), 
    itineraryButton = null,
    shareButton = null,
    start, 
    end, 
    people, 
    share,
    deleteTrip, 
    type,
    tripId,
    setTrips,
    trips 
  }) => {
    const [open, setOpen] = useState(false);
    const handleDeleteClick = () => setOpen(true);
    const [shr, setShare] = useState(false);
    const [tooltipText_T, setTooltipText_T] = useState("Copy link");
    const [tooltipText_I, setTooltipText_I] = useState("Copy link");
    const handleShareClick = () => setShare(true);
    const handleConfirmDelete = (tripId) => {
      setOpen(false);
      console.log("Trip ID being deleted:", tripId);
      fetch(`http://localhost:55000/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
        .then((response) => {
          if (response.ok) {
            setTrips(trips.filter((trip) => trip._id !== tripId));
          } else {
            throw new Error("Failed to delete trip");
          }
        })
        .catch((error) => {
          console.error("Error deleting trip:", error);
        });
    };

    const handleShareTrip = async (tripId) => {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/trip-details/${encodeURIComponent(tripId)}`);
        setTooltipText_T("Copied!");
        setTimeout(() => setTooltipText_T("Copy link"), 1000); // Reset tooltip text after 1s
      } catch (error) {
        console.error("Failed to copy:", error);
        setTooltipText_T("Failed to copy");
      }
    };

    const handleShareItinerary = async (tripId) => {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/itinerary-details/${encodeURIComponent(tripId)}`);
        setTooltipText_I("Copied!");
        setTimeout(() => setTooltipText_I("Copy link"), 1000); // Reset tooltip text after 1s
      } catch (error) {
        console.error("Failed to copy:", error);
        setTooltipText_I("Failed to copy");
      }
    };



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
        {type !== "discover" && (
       <IconButton 
        onClick={handleDeleteClick} 
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          color: "red",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          transition: "background-color 0.3s ease-in-out",
          "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.8)" }
        }}
      >
        <DeleteIcon />
      </IconButton> 
      )}
      <Dialog open={open} onClose={() => setOpen(false)}  BackdropProps={{
    style: { backgroundColor: "rgba(0, 0, 0, 0.5)" }
  }}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this trip?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">Cancel</Button>
          <Button onClick={() => handleConfirmDelete(tripId)} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <IconButton 
        onClick={handleShareClick} 
        sx={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          color: "gray",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          transition: "background-color 0.3s ease-in-out",
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 70)" }
        }}
      >
        <Share />
      </IconButton> 
      <Dialog open={shr} onClose={() => setShare(false)}  BackdropProps={{
    style: { backgroundColor: "rgba(0, 0, 0, 0.5)" }
  }}>
        <DialogTitle>Share Trip</DialogTitle>
        <DialogContent>Would you like to copy a link to the Trip Details or Itinerary Details page?</DialogContent>
        <DialogActions>
          <Button onClick={() => setShare(false)} color="error">Cancel</Button>
          <Tooltip title={tooltipText_T} arrow>
            <Button onClick={() => handleShareTrip(tripId)} color="secondary">Trip Details</Button>
          </Tooltip>
          <Tooltip title={tooltipText_I} arrow>
            <Button onClick={() => handleShareItinerary(tripId)} color="primary">Itinerary Details</Button>
          </Tooltip>
        </DialogActions>
      </Dialog>

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
          left: share ? "60px" : "50%",
          transform: share ? "none" : "translateX(-50%)",       
          display: "flex",
          flexDirection: "row", /* Stack buttons vertically */
          alignItems: "center",
          gap: "8px"
        }}>
         {/* {share && shareButton && (
             <Share onClick={shareButton} style={{ fontSize: 24, color: "#555" }} />
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
          )} */}
          
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

  const deleteTrip = (tripId) => {
    setTrips((prevTrips) => prevTrips.filter((trip) => trip._id !== tripId));
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
            <p>{Cookies.get("username")}</p>
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
      <h2 style={{ marginLeft: "20px" }}>Want some recommendations? Look at what other users have to say:</h2>
      <button onClick={navigateToForum} style={{ marginTop: "10px", padding: "10px", fontSize: "20px", backgroundColor: "#0000FF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", transition: "transform 0.2s ease, box-shadow 0.2s e", display: "flex", alignItems: "center"}} onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
          }}>Visit the Forum</button>
      <div>
        <h1 style={{ marginLeft: "20px" }}>My Trips:</h1>
        <div style={{ width: "90%", margin: "auto", position: "relative", zIndex: 1 }}>
        <Slider {...settings}>
          {upcomingTrips.map((trip) => {
            const formattedStartDate = format(parseISO(trip.startDate), "MMMM dd");
            const formattedEndDate = format(parseISO(trip.endDate), "MMMM dd");
             return (
    <Card key={trip._id} image={imageMap[trip.images]} title={trip.location} shareButton={() => shareDetails(trip._id)} button={() => viewDetails(trip._id)} itineraryButton={() => itineraryDetails(trip._id)} start={formattedStartDate} end={formattedEndDate} people={trip.people} description="Upcoming trip" share={Share} type="upcoming" tripId={trip._id} deleteTrip={() => deleteTrip(trip._id)} setTrips={setUpcomingTrips} trips={upcomingTrips}/>
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
    <Card key={place._id} image={imageMap[place.images[0]]} title={place.name} description={place.description} button={() => placeDetails(place._id)} buttonText="Place Details" type="discover"/>
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
  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", margin: "10px 20px 0 0", position: "fixed", bottom: "0px", right: "-20px", zIndex: 0 }}>
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
    <Card key={trip._id} image={imageMap[trip.images]} title={trip.location} shareButton={() => shareDetails(trip._id)} button={() => viewDetails(trip._id)} itineraryButton={() => itineraryDetails(trip._id)} start={formattedStartDate} end={formattedEndDate} people={trip.people} description="Upcoming trip" share={Share} type="past" tripId={trip._id} deleteTrip={() => deleteTrip(trip._id)} setTrips={setPastTrips} trips={pastTrips}/>
  );})}
  </Slider>
        </div>
  </div>
  {pastTrips.length > 0 ? (
    <><h1 style={{ marginLeft: "20px" }}>Because you went to {pastTrips[pastRecommendingIndex].location}, we recommend:</h1><div style={{ width: "90%", margin: "auto", position: "relative", zIndex: 1, display: "flex" }}>
              {recommendedPlaces.length > 0 ? (
                recommendedPlaces.map(place => (
                  <Card key={place._id} image={imageMap[place.images[0]]} title={place.name} description={place.description} button={() => placeDetails(place._id)} buttonText="Place Details" type="discover" />
                ))
              ) : (
                <p>No recommendations available.</p>
              )}
          </div></>
  ) : (<></>)
  }
  </div>);
};

export default HomePage;