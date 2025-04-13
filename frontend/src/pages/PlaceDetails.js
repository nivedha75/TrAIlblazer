import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Indonesia from "../assets/Indonesia.png";
import Indonesia2 from "../assets/Indonesia2.jpeg";
import Indonesia3 from "../assets/Indonesia3.jpeg";
import Paris from "../assets/Paris.png";
import Paris2 from "../assets/Paris2.png";
import Paris3 from "../assets/Paris3.png";
import Beijing from "../assets/Beijing.png";
import Beijing2 from "../assets/Beijing2.jpeg";
import Beijing3 from "../assets/Beijing3.jpeg";
import Hawaii from "../assets/hawaii.png";
import Hawaii2 from "../assets/Hawaii2.jpeg";
import Hawaii3 from "../assets/Hawaii3.jpeg";
import York from "../assets/NewYork.png";
import York2 from "../assets/NewYork2.jpeg";
import York3 from "../assets/NewYork3.jpeg";
import Japan from "../assets/Japan.png";
import Japan2 from "../assets/Tokyo2.jpeg";
import Japan3 from "../assets/Tokyo3.jpeg";
import Seattle from "../assets/Seattle.jpeg";
import Seattle2 from "../assets/Seattle2.jpeg";
import Seattle3 from "../assets/Seattle3.jpeg";

const imageMap = {
    "../assets/Indonesia.png": Indonesia,
    "../assets/Paris.png": Paris,
    "../assets/NewYork.png": York, 
    "../assets/Japan.png": Japan, 
    "../assets/hawaii.png": Hawaii,
    "../assets/Beijing.png": Beijing,
    "../assets/Seattle.jpeg": Seattle,
    "../assets/Paris2.png": Paris2,
    "../assets/Paris3.png": Paris3,
    "../assets/Indonesia2.jpeg": Indonesia2, 
    "../assets/Indonesia3.jpeg": Indonesia3,
    "../assets/Beijing2.jpeg": Beijing2, 
    "../assets/Beijing3.jpeg": Beijing3,
    "../assets/Hawaii2.jpeg": Hawaii2, 
    "../assets/Hawaii3.jpeg": Hawaii3, 
    "../assets/NewYork2.jpeg": York2, 
    "../assets/NewYork3.jpeg": York3, 
    "../assets/Tokyo2.jpeg": Japan2, 
    "../assets/Tokyo3.jpeg": Japan3,  
    "../assets/Seattle2.jpeg": Seattle2, 
    "../assets/Seattle3.jpeg": Seattle3,  
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
    
    const imageUrls = place.images.map((img) => imageMap[img] || img);

    return (
      <div style={{
        maxWidth: "1500px",
        height: "1500px",
        margin: "auto",
        textAlign: "center",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #800080, #32CD32)",
        color: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}>
        <h1 style={{color: "#32CD32",
          fontSize: "36px",
          marginBottom: "10px",
          textAlign: "center",}}>Place Details</h1>
        <h3 style={{ color: "#32CD32",
          fontSize: "26px",
          marginBottom: "30px",
          textAlign: "center",}}>{place.name}</h3>
        <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "15px",
          marginBottom: "20px"
        }}
      >
      {imageUrls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`${place.name} ${index + 1}`}
          style={{
            width: "400px",
            height: "300px",
            objectFit: "cover",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
          }}
        />
      ))}
      </div>
        <p style={{
          fontSize: "18px",
          color: "white",
          lineHeight: "1.6",
          marginBottom: "30px",
          textAlign: "center",
        }}>  <strong style={{ color: "white" }}> Description:</strong> {place.description}</p>
        <div style={{ textAlign: "center" }}>
        <button style={{
          // marginTop: "20px",
          // padding: "10px 20px",
          // fontSize: "18px",
          // backgroundColor: "#007bff",
          // color: "white",
          // border: "none",
          // borderRadius: "5px",
          // cursor: "pointer",
          // transition: "0.3s",
          // boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
            backgroundColor: "#32CD32",
            color: "#fff",
            padding: "12px 24px",
            fontSize: "18px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s ease, transform 0.2s ease",
        }} 
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#2eb82e";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#32CD32";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  };
  
  export default PlaceDetails;