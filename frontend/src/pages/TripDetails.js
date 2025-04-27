import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Indonesia from "../assets/Indonesia.png";
import Paris from "../assets/Paris.png";
import Beijing from "../assets/Beijing.png";
import Hawaii from "../assets/hawaii.png";
import York from "../assets/NewYork.png";
import Japan from "../assets/Japan.png";
import Seattle from "../assets/Seattle.jpeg";

const imageMap = {
    "../assets/Indonesia.png": Indonesia,
    "../assets/Paris.png": Paris,
    "../assets/NewYork.png": York, 
    "../assets/Japan.png": Japan, 
    "../assets/hawaii.png": Hawaii,
    "../assets/Beijing.png": Beijing,
    "../assets/Seattle.jpeg": Seattle
  };

const TripDetails = () => {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      fetch(`http://localhost:55000/trips/${tripId}`, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      })
        .then((response) => response.json())
        .then((data) => setTrip(data))
        .catch((error) => console.error("Error fetching trip details:", error));
    }, [tripId]);
  
    if (!trip) {
      return <p>Loading trip details...</p>;
    }
  
    const imageUrl = imageMap[trip.images] || trip.images;

    return (
      <div style={{
        maxWidth: "1500px",
        margin: "auto",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #800080, #32CD32)",
        color: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}>
        <h1 style={{color: "#32CD32",
                fontSize: "36px",
                marginBottom: "10px", }}>Trip Details</h1>
        <h3 style={{color: "#32CD32",
                fontSize: "26px",
                marginBottom: "30px",}}>{trip.location}</h3>
        {imageUrl && (
        <img 
          src={imageUrl} 
          alt={trip.location} 
          style={{
            width: "100%",
            maxHeight: "350px",
            objectFit: "contain",
            marginBottom: "15px"
          }} 
        />
      )}
      <div style={{
          fontSize: "18px",
          lineHeight: "1.6",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
            }}>
        <p style={{ fontSize: "18px", margin: "5px 0" }}><strong>Start Date:</strong> {trip.startDate}</p>
        <p style={{ fontSize: "18px", margin: "5px 0" }}><strong>End Date:</strong> {trip.endDate}</p>
        <p style={{ fontSize: "18px", margin: "5px 0" }}><strong>Number of people on trip:</strong> {trip.people}</p>
        </div>
        <h4 style={{ fontSize: "24px",
                marginBottom: "20px",
                color: "white", }}>Time Ranges:</h4>
        <div style={{
            backgroundColor: "white",
            color: "black",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            width: "fit-content",
            margin: "0 auto",
            textAlign: "left",
            fontSize: "16px",
        }}>
        {trip.timeRanges &&
          Object.entries(trip.timeRanges).map(([day, times]) => (
            <p key={day} style={{ margin: "5px 0" }}>
              <strong>{day}:</strong> {times.start} - {times.end}
            </p>
          ))}
      </div>

      <button 
        onClick={() => navigate("/")} 
        style={{
          backgroundColor: "#32CD32",
          color: "#fff",
          padding: "12px 24px",
          fontSize: "18px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.3s ease, transform 0.2s ease",
          marginTop: "40px"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#2eb82e";
          e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#32CD32";
          e.currentTarget.style.transform = "translateY(0)";
      }}
      >
        Back to Home
      </button>
      </div>
    );
  };
  
  export default TripDetails;