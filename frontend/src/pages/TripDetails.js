import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Indonesia from "../assets/Indonesia.png";
import Paris from "../assets/Paris.png";
import Beijing from "../assets/Beijing.png";
import Hawaii from "../assets/hawaii.png";
import York from "../assets/NewYork.png";
import Japan from "../assets/Japan.png";
import Seattle from "../assets/Seattle2.png";

const imageMap = {
    "../assets/Indonesia.png": Indonesia,
    "../assets/Paris.png": Paris,
    "../assets/NewYork.png": York, 
    "../assets/Japan.png": Japan, 
    "../assets/hawaii.png": Hawaii,
    "../assets/Beijing.png": Beijing,
    "../assets/Seattle2.png": Seattle
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
        textAlign: "center",
        backgroundColor: "#f9f9f9"
      }}>
        <h1 style={{textAlign: "center", color: "#333", marginBottom: "10px" }}>Trip Details</h1>
        <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>{trip.location}</h3>
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
        <p style={{ fontSize: "18px", margin: "5px 0" }}><strong>Start Date:</strong> {trip.startDate}</p>
        <p style={{ fontSize: "18px", margin: "5px 0" }}><strong>End Date:</strong> {trip.endDate}</p>
        <p style={{ fontSize: "18px", margin: "5px 0" }}><strong>Number of people on trip:</strong> {trip.people}</p>
        <h4 style={{ marginTop: "15px", fontSize: "20px", color: "#444" }}>Time Ranges:</h4>
        <div style={{
        backgroundColor: "#fff",
        padding: "10px",
        borderRadius: "5px",
        textAlign: "left",
        fontSize: "16px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        width: "fit-content",
        margin: "0 auto"
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
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = "#0056b3"}
        onMouseLeave={(e) => e.target.style.backgroundColor = "#007bff"}
      >
        Back to Home
      </button>
      </div>
    );
  };
  
  export default TripDetails;