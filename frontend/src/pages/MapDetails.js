import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MapDetails = () => {
  const { activityId } = useParams();
  const [address, setAddress] = useState();
  const [error, setError] = useState(null);

  console.log(activityId);

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
        setAddress(data.address)
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
          } else {
            console.error("No geocode results for:", address);
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
        }
    }

    initMaps();
  }, [address]);

  return (
    <div>
      <h2>Map Details</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Trip Addresses</h2>
      <p>{address}</p>

      <h2>Maps</h2>
        <div style={{ marginBottom: "20px" }}>
          <h3>{address}</h3>
          <div
            id={"map"}
            style={{ height: "300px", width: "100%" }}
          ></div>
        </div>
    </div>
  );
};

export default MapDetails;
