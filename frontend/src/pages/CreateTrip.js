import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateTrip = () => {
  const [query, setQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [places, setPlaces] = useState([]);
  const [days, setDays] = useState("");
  const [startingLocation, setStartingLocation] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const [additionalDestinations, setAdditionalDestinations] = useState([]);
  const [transportation, setTransportation] = useState("");

  const [name, setName] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorsNames, setCollaboratorsNames] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:55000/places", {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setPlaces(data);
      })
      .catch((error) => console.error("Error fetching places:", error));
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setFilteredLocations(
      places.filter((place) =>
        place.name.toLowerCase().includes(value.toLowerCase())
      )
    );
    setShowOptions(true);
  };

  const handleSelect = (place) => {
    setQuery(place.name);
    setStartingLocation(place.name);
    setSelectedImage(place.images[0]);
    setShowOptions(false);
  };

  const addDestination = () => {
    setAdditionalDestinations([
      ...additionalDestinations,
      { city: "", days: "" },
    ]);
  };

  const updateDestination = (index, field, value) => {
    const updated = [...additionalDestinations];
    updated[index][field] = value;
    setAdditionalDestinations(updated);
  };

  const removeDestination = (index) => {
    const updated = [...additionalDestinations];
    updated.splice(index, 1);
    setAdditionalDestinations(updated);
  };

  const goToPlanPage = () => {
    if (!days || isNaN(days) || days <= 0) {
      alert("Please enter a valid number of days for the starting city!");
      return;
    }
    if (!startingLocation) {
      alert("Please select a starting location!");
      return;
    }
    for (let dest of additionalDestinations) {
      if (!dest.city || !dest.days || isNaN(dest.days) || dest.days <= 0) {
        alert("Please enter valid cities and days for all additional destinations!");
        return;
      }
    }

    navigate("/plan", {
      state: {
        startingCity: startingLocation,
        startingCityDays: parseInt(days, 10),
        additionalDestinations: additionalDestinations.map(dest => ({
          city: dest.city,
          days: parseInt(dest.days, 10),
        })),
        transportation: transportation,
        collaborators: collaborators,
        collaboratorsNames: collaboratorsNames,
        name: name,
        image: selectedImage,
      },
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #32CD32, #800080)",
        color: "white",
        paddingBottom: "50px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
          width: "650px",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#800080" }}>Create a Trip</h1>

        {/* Days for starting city */}
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="Number of days in starting city"
          style={inputStyle}
        />

        {/* Starting city selection */}
        <h2 style={{ color: "#800080" }}>Select a Starting Location:</h2>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setQuery("");
            setFilteredLocations(places);
            setShowOptions(true);
          }}
          onBlur={() => setTimeout(() => setShowOptions(false), 200)}
          placeholder="Type to search locations..."
          style={inputStyle}
        />
        {showOptions && filteredLocations.length > 0 && (
          <ul style={optionsListStyle}>
            {filteredLocations.map((place) => (
              <li
                key={place._id}
                style={optionItemStyle}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
                onMouseDown={() => handleSelect(place)}
              >
                {place.name}
              </li>
            ))}
          </ul>
        )}

        {/* Additional destinations */}
        <h2 style={{ color: "#800080" }}>Additional Destinations (optional):</h2>
        {additionalDestinations.map((dest, index) => (
          <div key={index} style={{ marginBottom: "15px" }}>
            <input
              type="text"
              value={dest.city}
              onChange={(e) => updateDestination(index, "city", e.target.value)}
              placeholder="City name"
              style={{ ...inputStyle, marginBottom: "5px" }}
            />
            <input
              type="number"
              value={dest.days}
              onChange={(e) => updateDestination(index, "days", e.target.value)}
              placeholder="Days"
              style={inputStyle}
            />
            <button
              onClick={() => removeDestination(index)}
              style={{
                marginTop: "5px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addDestination}
          style={{
            marginBottom: "20px",
            padding: "8px 16px",
            backgroundColor: "#32CD32",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          + Add Destination
        </button>

        {/* Transportation method */}
        <h2 style={{ color: "#800080" }}>Planned method of transportation</h2>
        <select onChange={(e) => setTransportation(e.target.value)} style={{ marginBottom: "20px" }}>
          <option value="driving">Driving</option>
          <option value="walking">Walking</option>
          <option value="biking">Biking</option>
        </select>

        {/* Next Button */}
        <button
          onClick={goToPlanPage}
          style={nextButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "600px",
  height: "50px",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "16px",
  boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
};

const optionsListStyle = {
  listStyleType: "none",
  padding: 0,
  border: "1px solid #ccc",
  borderRadius: "5px",
  width: "600px",
  backgroundColor: "white",
  position: "absolute",
  left: "29%",
  zIndex: 10,
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  marginTop: "5px",
  textAlign: "left",
  color: "black",
  maxHeight: "200px",
  overflowY: "auto",
};

const optionItemStyle = {
  padding: "10px",
  cursor: "pointer",
  transition: "background 0.2s ease-in-out",
};

const nextButtonStyle = {
  position: "absolute",
  bottom: "20px",
  right: "20px",
  padding: "10px 20px",
  fontSize: "20px",
  backgroundColor: "#32CD32",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

export default CreateTrip;
