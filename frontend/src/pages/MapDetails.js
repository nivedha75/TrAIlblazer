import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardMedia,
    CardContent,
    Container,
    IconButton,
    Typography,
    Paper,
    Grid2,
    Box,
    Tooltip,
    Button,
    ThemeProvider
  } from "@mui/material";
import theme from "../theme";


const MapDetails = () => {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [address, setAddress] = useState();
  const [name, setName] = useState();
  const [error, setError] = useState(null);

  console.log(activityId);
  const navigate = useNavigate();

  const itineraryDetails = (tripId) => {
    navigate(`/itinerary-details/${encodeURIComponent(tripId)}`);
  };

  useEffect(() => {
    fetch(`http://localhost:55000/activities/${activityId}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Itinerary not found");
        }
        return response.json();
      })
      .then((data) => {
        // if (data.activities && data.activities.top_preferences[0]) {
        //   const extractedAddresses = data.activities.top_preferences[0]
        //     .map((activity) => activity.details?.address)
        //     .filter(Boolean); // Remove null/undefined addresses
        //   setAddresses(extractedAddresses);
        // }
        setActivity(data);
        setName(data.name);
        setAddress(data.address);
      })
      .catch((error) => {
        console.error("Error fetching itinerary details:", error);
        setError(error.message);
      });
  }, [activityId]);

  // Load Google Maps script dynamically
  useEffect(() => {
    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD02ijW_hvCeI7WwmYcKylT1eTWEke7gaU`;
      script.async = true;
      script.defer = true;
      script.onload = () => console.log("Google Maps API loaded.");
      document.body.appendChild(script);
    }
  }, []);

  // Initialize a separate map for each address
  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    async function initMaps() {
      const geocoder = new window.google.maps.Geocoder();

        try {
          const result = await geocoder.geocode({ address });

          if (result.results.length > 0) {
            const location = result.results[0].geometry.location;
            const mapElement = document.getElementById("map");

            if (mapElement) {
              const map = new window.google.maps.Map(mapElement, {
                center: location,
                zoom: 12, // Zoomed in on individual locations
              });

              new window.google.maps.Marker({
                map,
                position: location,
                title: address,
              });
            }
            setError("");
          } else {
            console.error("No geocode results for:", address);
            setError("Sorry, Google Maps was unable to find this address.");
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          setError("Sorry, Google Maps was unable to find this address.");
        }
    }

    initMaps();
  }, [address]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Map Details</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="contained" sx={{ textTransform: "none", backgroundColor: theme.palette.purple.main, color: "white",
                            "&:hover": { backgroundColor: "#4BAF36"}, fontSize: "1rem", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}
                             onClick={() => itineraryDetails(activity.tripId)}>
              Back to Itinerary
            </Button>
          </Box>

      <h2>Activity:</h2>
      <h3>{name}</h3>

      <h2>Maps</h2>
        <div style={{ marginBottom: "20px" }}>
          <h4>{address}</h4>
          <div
            id={"map"}
            style={{ height: "600px", width: "100%" }}
          ></div>
        </div>
    </div>
  );
};

export default MapDetails;
