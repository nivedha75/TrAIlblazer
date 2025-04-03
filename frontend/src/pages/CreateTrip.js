import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

const locations = [
    "New York", "Los Angeles", "Chicago", "Miami", "San Francisco",
    "Seattle", "Boston", "Denver", "Las Vegas", "Orlando"
  ];

const CreateTrip = () => {

  const [query, setQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [days, setDays] = useState("");
  const [selectLocation, setSelectLocation] = useState("");
  const [secondaryLocations, setSecondaryLocations] = useState("");
  const [transportation, setTransportation] = useState("");
  const [places, setPlaces] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    fetch("http://localhost:55000/places", {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data: ", data);
        setPlaces(data);
      })
      .catch((error) => console.error("Error fetching places:", error));
  }, []);

  const navigate = useNavigate();
  
  const dayChange = (event) => {
    setDays(event.target.value);
  }

  const secondaryLocationsChange = (event) => {
    setSecondaryLocations(event.target.value);
  }

  const transportationChange = (event) => {
    setTransportation(event.target.value);
  }

  const goToPlanPage = () => {
    if (!days || isNaN(days) || days <= 0) {
      alert("Please enter a valid number of days!");
      return;
    }
    else if (!selectLocation) {
      alert("Please select a starting location!");
      return;
    }
    navigate("/plan", { state: { days: parseInt(days, 10), locate: selectLocation, secondaryLocate: secondaryLocations, transportation: transportation, image: selectedImage } });
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setFilteredLocations(
      places.filter((place) => place.name.toLowerCase().includes(value.toLowerCase()))
      );
    setShowOptions(true);
  };

  const handleSelect = (place) => {
    setQuery(place.name);
    setSelectLocation(place.name);
    setSelectedImage(place.images[0]);
    setShowOptions(false);
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
        paddingBottom: "50px"
      }}
    >
        <div style={{background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)", textAlign: "center",  width: "650px"}}>
        <h1 style={{textAlign: "center", color: "#800080"}}>Create a Trip</h1>
        <div>
        <input
          type="number"
          value={days}
          onChange={dayChange}
          placeholder="Number of days of trip"
          style={{
            width: "600px",
            height: "50px",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "20px",
            fontSize: "16px",
            boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)"
          }}
        />
      </div>
        <div>
        <h2 style={{color: "#800080"}}>Select a Starting Location: </h2>
        <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
            setQuery("");
            setFilteredLocations(places);
            setShowOptions(true);
          }}
        onBlur={() => setShowOptions(false)}
        placeholder="Type to search locations..."
        style={{
          width: "600px",
          height: "50px",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
          boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)",
          
        }}
      />
    
      {showOptions && filteredLocations.length > 0 && (
        <ul style={{
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
          overflowY: "auto"
        }}>
          {filteredLocations.map((place) => (
            <li key={place._id} style={{
              padding: "10px",
              cursor: "pointer",
              transition: "background 0.2s ease-in-out"
            }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              onMouseDown={() => handleSelect(place)}
            >
              {place.name}
            </li>
          ))}
        </ul>
      )}
      </div>
      <div>
        <h2 style={{color: "#800080"}}>If you want multiple locations, list the others here: </h2>
        <input
          type="text"
          value={secondaryLocations}
          onChange={secondaryLocationsChange}
          placeholder="Secondary locations..."
          style={{
            width: "600px",
            height: "50px",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "20px",
            fontSize: "16px",
            boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)"
          }}
        />
      </div>
      <div>
        <h2 style={{color: "#800080"}}>Planned method of transportation </h2>
        <select onChange={transportationChange}>
          <option value="driving">Driving</option>
          <option value="walking">Walking</option>
          <option value="biking">Biking</option>
        </select>
      </div>
      <button
        style={{
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
        }} onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";}}

        onClick={goToPlanPage}
      >
        Next
      </button>
        </div>
        </div>
    );
};

export default CreateTrip;