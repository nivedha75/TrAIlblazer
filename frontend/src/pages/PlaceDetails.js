import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Indonesia from "../assets/Indonesia.png";
import Paris from "../assets/Paris.png";
import Beijing from "../assets/Beijing.png";
import Hawaii from "../assets/hawaii.png";
import York from "../assets/NewYork.png";
import Japan from "../assets/Japan.png";


const imageMap = {
    "../assets/Indonesia.png": Indonesia,
    "../assets/Paris.png": Paris,
    "../assets/NewYork.png": York, 
    "../assets/Japan.png": Japan, 
    "../assets/hawaii.png": Hawaii,
    "../assets/Beijing.png": Beijing
  };

const PlaceDetails = () => {
    const { placeId } = useParams();
    const [place, setPlace] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      fetch(`http://localhost:55000/places/${placeId}`, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      })
        .then((response) => response.json())
        .then((data) => setPlace(data))
        .catch((error) => console.error("Error fetching trip details:", error));
    }, [placeId]);
  
    if (!place) {
      return <p>Loading trip details...</p>;
    }
    
    const imageUrl = imageMap[place.images[0]] || place.images[0];

    return (
      <div style={{
        maxWidth: "1500px",
        height: "1500px",
        margin: "auto",
        textAlign: "center",
        backgroundColor: "#f9f9f9"
      }}>
        <h1 style={{textAlign: "center", color: "#333", marginBottom: "10px" }}>Place Details</h1>
        <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>{place.name}</h3>
        {imageUrl && (
        <img 
          src={imageUrl} 
          alt={place.name} 
          style={{
            width: "100%",
            maxHeight: "350px",
            objectFit: "contain",
            marginBottom: "15px"
          }} 
        />
      )}
        <p>Description: {place.description}</p>
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
        }} onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  };
  
  export default PlaceDetails;