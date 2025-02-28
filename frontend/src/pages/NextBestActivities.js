import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const NextBestActivities = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:55000/itinerary/${tripId}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Itinerary not found");
        }
        return response.json();
      })
      .then((data) => setTrip(data))
      .catch((error) => {
        console.error("Error fetching itinerary details:", error);
        setError(error.message); // Set the error message
      });
  }, [tripId]);

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
      .then((data) => setTripDetails(data))
      .catch((error) => console.error("Error fetching trip details:", error));
  }, [tripId]);

  if (error) {
    return (
      <div
        style={{
          maxWidth: "1500px",
          margin: "auto",
          textAlign: "center",
          backgroundColor: "#f9f9f9"
        }}
      >
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
          Next Best Activities
        </h1>
        <p style={{ fontSize: "20px", color: "#d9534f" }}>
          There was an error fetching the itinerary: {error}
        </p>
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
  }

  if (!trip) {
    return <p>Loading itinerary details...</p>;
  }

  return (
    <div
      style={{
        maxWidth: "1500px",
        margin: "auto",
        textAlign: "center",
        backgroundColor: "#f9f9f9"
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
        Next Best Activities
      </h1>
      <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>{tripDetails?.location}</h3>
        <p style={{ fontSize: "18px", margin: "5px 0" }}><strong>Start Date:</strong> {tripDetails?.startDate}</p>
        <p style={{ fontSize: "18px", margin: "5px 0" }}><strong>End Date:</strong> {tripDetails?.endDate}</p>
      <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>
        {trip.activities.next_best_preferences.length > 0 ? "Activities for the Trip" : "No Activities Found"}
      </h3>

      <button
        onClick={() => navigate("/itinerary-details/" + tripId)}
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
        View Original Itinerary Details
      </button>

      {trip.activities.next_best_preferences && trip.activities.next_best_preferences.length > 0 ? (
        trip.activities.next_best_preferences.map((activity) => (
          <div
            key={activity.activityID}
            style={{
              backgroundColor: "#fff",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "10px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
            }}
          >
            <h4 style={{ fontSize: "20px", color: "#444" }}>{activity.title}</h4><span> ({activity.context})</span>
            <p>Rating: {activity.rating}</p>
            <p style={{ fontSize: "18px", margin: "5px 0" }}>
              <strong>Location:</strong> {activity?.location || ''}
            </p>
            <p style={{ fontSize: "18px", margin: "5px 0" }}>
              <strong>Description:</strong> {activity.description}
            </p>
            <img src={activity.image} width="500" height="500" />
            {activity.notes && (
              <p style={{ fontSize: "18px", margin: "5px 0", fontStyle: "italic" }}>
                <strong>Notes:</strong> {activity.notes}
              </p>
            )}
          </div>
        ))
      ) : (
        <p>No activities to display.</p>
      )}

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

export default NextBestActivities;
