// FlightFinder.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Menu,
    MenuItem,
    Tooltip,
    Select,
    Typography,
    Snackbar,
    Alert,
    IconButton,
    Fab,
  } from "@mui/material";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const FlightFinder = () => {
  const { tripId } = useParams();
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [flights, setFlights] = useState([]);
  const [bookingLink, setBookingLink] = useState("");
  const [loading, setLoading] = useState(false);
  

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  };

  const navigate = useNavigate();
  const backToItinerary = () => {
    navigate(`/itinerary-details/${tripId}`);
  }

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const fetchFlights = async () => {
    const fromCode = fromCity.trim();
    const toCode = toCity.trim();
    const date = formatDate(departureDate);

    if (!fromCode || !toCode) {
      alert("Please enter valid cities from the list.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:55000/api/flights?from=${fromCode}&to=${toCode}&date=${date}`);
      const data = await response.json();
      setFlights(data.best_flights || []);
      setBookingLink(data.booking_link || "");
    } catch (error) {
      console.error("Error fetching flights:", error);
      alert("Failed to fetch flights.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial", maxWidth: "800px", margin: "auto" }}>
        <Button
            variant="contained"
            onClick={() => backToItinerary()}
            sx={{
            textTransform: "none",
            width: "150px",
            color: "white",
            "&:hover": { backgroundColor: "#800080" },
            fontSize: "1rem",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            }}
        >
            Back To Itinerary
        </Button>
      <h1 style={{ color: "#800080" }}>✈️ Flight Finder</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="From (e.g. JFK)"
          value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="To (e.g. FCO)"
          value={toCity}
          onChange={(e) => setToCity(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ color: "#32CD32" }}>Select Departure Date:</h3>
        <Calendar
          onChange={setDepartureDate}
          value={departureDate}
        />
      </div>

      <button style={buttonStyle} onClick={fetchFlights}>
        {loading ? "Searching..." : "Search Flights"}
      </button>

      {flights.length > 0 && (
        <div style={{ marginTop: "30px" }}>
            <h2 style={{ color: "#800080" }}>✈️ Best Flights:</h2>
            {flights.map((flight, idx) => {
            const mainSegment = flight.flights[0];  // first leg
            return (
                <div key={idx} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <img src={flight.airline_logo} alt="airline" style={{ height: "30px", marginRight: "10px" }} />
                    <h3 style={{ margin: 0 }}>{mainSegment.airline}</h3>
                </div>

                <p><strong>Flight:</strong> {mainSegment.flight_number}</p>
                <p><strong>Aircraft:</strong> {mainSegment.airplane}</p>
                <p><strong>From:</strong> {mainSegment.departure_airport.name} ({mainSegment.departure_airport.id})</p>
                <p><strong>To:</strong> {mainSegment.arrival_airport.name} ({mainSegment.arrival_airport.id})</p>
                <p><strong>Departure:</strong> {formatDateTime(mainSegment.departure_airport.time)}</p>
                <p><strong>Arrival:</strong> {formatDateTime(mainSegment.arrival_airport.time)}</p>
                <p><strong>Duration:</strong> {formatDuration(flight.total_duration)}</p>
                <p><strong>Price:</strong> ${flight.price}</p>

                {bookingLink && (
                    <a
                        href={bookingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
                    >
                        View Flights on Google
                    </a>
                )}
                </div>
            );
            })}
        </div>
        )}
    </div>
  );
};

const inputStyle = {
  marginRight: "10px",
  padding: "10px",
  fontSize: "16px",
  width: "250px",
  marginBottom: "10px"
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: "#32CD32",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const cardStyle = {
    padding: "15px",
    margin: "15px 0",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9"
  };
  
  const linkStyle = {
    marginTop: "10px",
    display: "inline-block",
    padding: "8px 14px",
    backgroundColor: "#32CD32",
    color: "white",
    borderRadius: "5px",
    textDecoration: "none"
  };

export default FlightFinder;
