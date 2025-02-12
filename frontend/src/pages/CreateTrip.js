import React, {useState} from "react";
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

  const navigate = useNavigate();
  
  const dayChange = (event) => {
    setDays(event.target.value);
  }

  const goToPlanPage = () => {
    if (!days || isNaN(days) || days <= 0) {
      alert("Please enter a valid number of days!");
      return;
    }
    navigate("/plan", { state: { days: parseInt(days, 10) } });
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setFilteredLocations(
        locations.filter((location) => location.toLowerCase().includes(value.toLowerCase()))
      );
    setShowOptions(true);
  };

  const handleSelect = (loc) => {
    setQuery(loc);
    setShowOptions(false);
  };

    return (
        <div style={{textAlign: "center"}}>
        <h1 style={{textAlign: "center"}}>Create a Trip</h1>
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
          }}
        />
      </div>
        <div>
        <h2>Select a Location: </h2>
        <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
            setQuery("");
            setFilteredLocations(locations);
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
          marginBottom: "10px",
          
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
          left: "50%",
          transform: "translateX(-50%)"
        }}>
          {filteredLocations.map((location, index) => (
            <li key={index} style={{
              padding: "10px",
              cursor: "pointer",
              transition: "background 0.2s ease-in-out"
            }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              onMouseDown={() => handleSelect(location)}
            >
              {location}
            </li>
          ))}
        </ul>
      )}
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
        }}
        onClick={goToPlanPage}
      >
        Next
      </button>
        </div>
    );
};

export default CreateTrip;