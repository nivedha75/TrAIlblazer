import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Indonesia from "../assets/Indonesia.png";
import Paris from "../assets/Paris.png";

const imageMap = {
    "../assets/Indonesia.png": Indonesia,
    "../assets/Paris.png": Paris,
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
      <div>
        <h1>Place Details</h1>
        {imageUrl && <img src={imageUrl} alt="" style={{ width: "100%", maxHeight: "400px", objectFit: "cover" }} />}
        <h3>{place.name}</h3>
        <p>Description: {place.description}</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  };
  
  export default PlaceDetails;