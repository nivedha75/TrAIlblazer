import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import Profile from "../assets/Profile.png";
import Hawaii from "../assets/hawaii.png";
import ChatBot from "../assets/Chatbot.png";
import Cookies from "js-cookie";

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trips, setTrips] = useState([]);


useEffect(() => {
  // Check if the 'user_id' cookie is set
  const userId = Cookies.get("user_id");

  // If 'user_id' cookie exists, the user is authenticated
  if (userId) {
    setIsAuthenticated(true);
  } else {
    setIsAuthenticated(false);
  }
  const savedTrips = JSON.parse(localStorage.getItem("trips")) || [];
  setTrips(savedTrips);
}, []);
  const navigate = useNavigate();

  const navigateToCreate = () => {
    navigate("/create");
  }

  const navigateToSurvey = () => {
    navigate("/survey");
  }

  const navigateToSignIn = () => {
    navigate('/sign-in');
  }

  const handleLogout = () => {
    // Remove the 'user_id' cookie
    Cookies.remove("user_id");

    // Reload the page
    window.location.reload();
  };

  const Card = ({ image, title = "Place", buttonText = "Trip Details", button = () => alert("Trip Details") }) => {
    return (
      <div style={{
        width: "250px",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
        textAlign: "center",
        margin: "10px",
      }}>
        {image && <img src={image} alt={title} style={{ width: "100%", borderRadius: "10px" }} />}
        <h2>{title}</h2>
        <button 
        onClick={button} 
        style={{
          padding: "10px 15px",
          border: "none",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "10px"
        }}
      >
        {buttonText}
      </button>
      </div>
    );
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <div>
        <h1 style={{ textAlign: "center", color: "#32CD32" }}>
          Tr<span style={{ color: "#800080" }}>AI</span>lblazer
        </h1>
  
        {isAuthenticated ? (
          <div style={{ position: "relative" }}>
            <img
              src={Profile}
              alt="Profile"
              style={{
                position: "relative",
                left: "1350px",
                top: "-60px",
                cursor: "pointer",
              }}
              onClick={toggleDropdown}
            />
            {isOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "80px",
                  left: "1300px",
                  backgroundColor: "white",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  borderRadius: "5px",
                  padding: "10px",
                  zIndex: 10,
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
                      onClick={option === "Logout" ? handleLogout : null}
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
        <div style={{ display: "flex", gap: "10px" }}>
          <Card image={Hawaii} title="Hawaii Getaway" description="Enjoy the beaches of Hawaii." />
          <Card title="New York Adventure" description="Explore the city that never sleeps." />
          {trips.map((trip, index) => (
            <Card key={index} title={trip.location} description="Upcoming trip" />
          ))}
        </div>
      </div>
  
      <button
        onClick={navigateToCreate}
        style={{
          marginTop: "30px",
          padding: "10px",
          fontSize: "20px",
          backgroundColor: "#32CD32",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginLeft: "20px",
        }}
      >
        Create Trip (+)
      </button>
  
      <div style={{ marginTop: "40px" }}>
        <h1 style={{ marginLeft: "20px" }}>Discover New Vacation Spots:</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Card title="Bali, Indonesia" description="Tropical paradise with beautiful landscapes." />
          <Card title="Paris, France" description="The city of love and lights." />
        </div>
        <button
          onClick={navigateToSurvey}
          style={{
            marginTop: "30px",
            padding: "10px",
            fontSize: "20px",
            backgroundColor: "#32CD32",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginLeft: "20px",
          }}
        >
          Take Our Travel Quiz
        </button>
  
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            margin: "10px 20px 0 0",
            position: "fixed",
            bottom: "0px",
            right: "0px",
          }}
        >
          <p style={{ fontSize: "16px", color: "#555", marginRight: "10px", maxWidth: "250px" }}>
            Meet your personal AI travel assistant! Get personalized recommendations and plan your next trip with ease.
          </p>
          <img src={ChatBot} alt="ChatBot" style={{ width: "80px", height: "80px" }} />
        </div>
      </div>
  
      <div style={{ marginTop: "40px" }}>
        <h1 style={{ marginLeft: "20px" }}>Past Trips:</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Card title="Japan Tour" description="Experience the culture and technology of Japan." />
          <Card title="Grand Canyon" description="Explore the natural wonders of Arizona." />
        </div>
      </div>
    </div>
  );
};

export default HomePage;