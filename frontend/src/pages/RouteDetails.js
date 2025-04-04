import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const GOOGLE_MAPS_API_KEY = "AIzaSyD02ijW_hvCeI7WwmYcKylT1eTWEke7gaU";

const RouteDetails = () => {
  const { tripId, day } = useParams();
  const [distanceList, setDistanceList] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [pointsList, setPointsList] = useState([]);

  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState(null);
  
  const [transportation, setTransportation] = useState();

  const navigate = useNavigate();
  const itineraryDetails = () => {
    navigate(`/itinerary-details/${tripId}`);
  };

  useEffect(() => {
    fetch(`http://localhost:55000/itinerary/${tripId}`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Itinerary not found");
        return response.json();
      })
      .then((data) => {
        if (data.activities && data.activities.top_preferences[day]) {
          const extractedAddresses = data.activities.top_preferences[day]
            .map((activity) => activity.details?.address)
            .filter(Boolean); // Remove null/undefined addresses
          setAddresses(extractedAddresses);
        }
      })
      .catch((error) => {
        console.error("Error fetching itinerary details:", error);
        setError(error.message);
      });
  }, [tripId]);

  useEffect(() => {
    fetch(`http://localhost:55000/trips/${tripId}`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Itinerary not found");
        return response.json();
      })
      .then((data) => {
        if (data.transportation) {
            setTransportation(data.transportation);
        } else {
            setTransportation("driving");
        }
      })
      .catch((error) => {
        console.error("Error fetching itinerary details:", error);
        setError(error.message);
      });
  }, [tripId]);

  useEffect(() => {
    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => console.log("Google Maps API loaded.");
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (addresses.length === 0 || !window.google || !window.google.maps) return;

    async function geocodeAddresses() {
      const geocoder = new window.google.maps.Geocoder();
      let newPointsList = [];

      for (const address of addresses) {
        try {
          const result = await geocoder.geocode({ address });

          if (result.results.length > 0) {
            const location = result.results[0].geometry.location;
            newPointsList.push([location.lat(), location.lng()]);
          } else {
            console.error("No geocode results for:", address);
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          setError("Sorry, one of the addresses may be corrupted. Google Maps is unable to route properly.");
        }
      }

      setPointsList(newPointsList);
    }

    geocodeAddresses();
  }, [addresses]);

  useEffect(() => {
    if (!window.google || pointsList.length < 2) return;

    const start = new window.google.maps.LatLng(pointsList[0][0], pointsList[0][1]);
    const end = new window.google.maps.LatLng(pointsList[pointsList.length - 1][0], pointsList[pointsList.length - 1][1]);

    const waypoints = pointsList.slice(1, -1).map(point => ({
      location: new window.google.maps.LatLng(point[0], point[1]),
      stopover: true
    }));

    const map = new window.google.maps.Map(document.getElementById("map-canvas"), {
      zoom: 8,
      center: { lat: 51.3, lng: 0.8 },
      mapTypeId: window.google.maps.MapTypeId.ROADMAP
    });

    const directionsService = new window.google.maps.DirectionsService();
    const directionsDisplay = new window.google.maps.DirectionsRenderer({ map });

    directionsService.route({
      origin: start,
      destination: end,
      waypoints,
      optimizeWaypoints: true,
      travelMode: (transportation === "driving" ? window.google.maps.TravelMode.DRIVING : (transportation == "biking" ? window.google.maps.TravelMode.BICYCLING : window.google.maps.TravelMode.WALKING)), 
      unitSystem: window.google.maps.UnitSystem.METRIC
    }, (response, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);

        let totalDist = 0;
        let totalT = 0;
        let segments = [];

        response.routes[0].legs.forEach((leg, index) => {
          const segmentDist = Math.round(leg.distance.value / 1000); // Convert meters to KM
          const segmentTime = Math.round(leg.duration.value / 60); // Convert seconds to minutes
          totalDist += leg.distance.value;
          totalT += leg.duration.value;

          segments.push(`Point ${String.fromCharCode(65 + index)} → Point ${String.fromCharCode(65 + index + 1)}: ${segmentDist} Km, ${segmentTime} min`);
        });

        setDistanceList(segments);
        setTotalDistance(Math.round(totalDist / 1000)); // Convert total meters to KM
        setTotalTime(Math.round(totalT / 60)); // Convert total seconds to minutes
        setError("");
      } else {
        console.error(`Directions request failed: ${status}`);
        setError("Sorry, Google Maps was unable to route properly.");
      }
    });
  }, [pointsList]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div id="map-canvas" style={{ flex: 3, height: "100%" }}></div>
      <aside style={{ flex: 1, padding: "20px", overflowY: "auto", background: "#f8f9fa" }}>
        <h1>Day {parseInt(day)+1}</h1>
        <p style={{ color: "red" }}>{error}</p>
        <h3>Distances ({transportation})</h3>
        <ul>
          {distanceList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <b>Total Distance:</b> {totalDistance} Km <br />
        <b>Total Time:</b> {totalTime} min
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="contained" sx={{ textTransform: "none", backgroundColor: theme.palette.purple.main, color: "white",
                            "&:hover": { backgroundColor: "#4BAF36"}, fontSize: "1rem", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}
                             onClick={() => itineraryDetails()}>
              Back to Itinerary
            </Button>
          </Box>
      </aside>
    </div>
  );
};

export default RouteDetails;
