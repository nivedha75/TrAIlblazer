import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";

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
  
    return (
      <div>
        <h1>Trip Details</h1>
        <h3>{trip.location}</h3>
        <p>Start Date: {trip.startDate}</p>
        <p>End Date: {trip.endDate}</p>
        <p>People: {trip.people}</p>
        <h4>Time Ranges:</h4>
        <pre>{JSON.stringify(trip.timeRanges, null, 2)}</pre>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  };
  
  export default TripDetails;