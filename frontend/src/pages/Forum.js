import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Snackbar, Alert } from "@mui/material";
import theme from "../theme";

// const dummyPosts = [
//   { username: "Alice", name: "Central Park", location: "New York", description: "Beautiful in fall!", bestTime: "October", created_at: new Date() },
//   { username: "Bob", name: "Hollywood", location: "Los Angeles", description: "Stars everywhere!", bestTime: "June", created_at: new Date() },
//   { username: "Charlie", name: "Empire State", location: "New York", description: "Amazing views.", bestTime: "September", created_at: new Date() },
// ];

const ForumDemo = () => {
  const [cityPosts, setCityPosts] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    bestTime: "",
  });
  const [channelSearch, setChannelSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [suggestedCity, setSuggestedCity] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();
  const home = () => {
    navigate('/');
  };

  useEffect(() => {
    fetch("http://localhost:55000/forum") // your backend
      .then(response => response.json())
      .then(data => {
        const grouped = {};
        data.forEach(post => {
          const cityName = capitalizeWords(post.location);
  
          if (!grouped[cityName]) {
            grouped[cityName] = [];
          }
          grouped[cityName].push({
            username: post.username, 
            name: post.name,
            location: cityName,
            description: post.description,
            bestTime: post.bestTime,
            created_at: post.created_at, // Important: parse MongoDB timestamp
            _id: post._id?.$oid, // optional if you need unique keys
          });
        });

  
        // OPTIONAL: Sort posts by newest first inside each city
        for (const city in grouped) {
          grouped[city].sort((a, b) => b.created_at - a.created_at);
        }
  
        setCityPosts(grouped);
      })
      .catch(error => {
        console.error("Error fetching posts:", error);
      });
  }, []);
  
  

  // const navigate = useNavigate(); // Uncomment if real router

  const actuallySubmitPost = (forcedCity = null) => {
    const cityToUse = forcedCity || formData.location;
    const formattedCity = capitalizeWords(cityToUse);

    const username = Cookies.get("username");
  
    // const newPost = {
    //   author: "DemoUser", // Or from cookie if you have auth
    //   name: formData.name,
    //   location: formattedCity,
    //   description: formData.description,
    //   bestTime: formData.bestTime,
    //   timestamp: new Date().toISOString(),
    // };

    const newPost = {
      username: username,
    ...formData,
    };

    newPost.location = cityToUse;
  
    fetch("http://localhost:55000/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    })
      .then(response => response.json())
      .then(savedPost => {
        // Update frontend immediately
        setCityPosts(prev => {
          const updated = { ...prev };
          if (!updated[formattedCity]) {
            updated[formattedCity] = [];
          }
          updated[formattedCity] = [ 
            {
              ...savedPost,
              username: savedPost.author,
              created_at: new Date(savedPost.timestamp),
            },
            ...updated[formattedCity]
          ];
          return updated;
        });
  
        setFormData({
          name: "",
          location: "",
          description: "",
          bestTime: "",
        });
        setIsModalOpen(false);
        setShowSuggestion(false);
  
        setToastMessage(`✅ Post added to @${formattedCity}!`);
        setToastOpen(true);
      })
      .catch(error => {
        console.error("Error submitting post:", error);
      });
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const existingCities = Object.keys(cityPosts);
  
    let bestMatch = null;
    let bestDistance = Infinity;

    console.log(formData.location);
    setPostSearch("");
  
    existingCities.forEach((city) => {
      const dist = editDistance(formData.location.toLowerCase(), city.toLowerCase());
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = city;
      }
    });
  
    if (!existingCities.includes(capitalizeWords(formData.location))) {
      // Typo detected
      setSuggestedCity(bestMatch);
      setShowSuggestion(true);
      return; // STOP normal submit for now!
    }
  
    // If no typo, or user already accepted typo → normal post submission
    actuallySubmitPost();
  };
  

  // List of channels matching the search term
  const filteredCities = Object.keys(cityPosts).filter(city =>
    city.toLowerCase().includes(channelSearch.toLowerCase())
  );

  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    const costs = Array(s2.length + 1).fill().map((_, i) => i);
  
    for (let i = 1; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 1; j <= s2.length; j++) {
        const newValue = s1[i - 1] === s2[j - 1] ? costs[j - 1] : Math.min(costs[j - 1], lastValue, costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
      costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase()).trim();
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
      
      {/* Sidebar */}
      <div style={{
        width: "250px",
        backgroundColor: "#2f3136",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}>
        
        {/* Home Button */}
        <Button
          variant="contained"
          onClick={() => { home() }}
          style={{
            backgroundColor: theme.palette.purple.main,
            marginBottom: "20px",
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Back to Home
        </Button>

        {/* Search Channel */}
        <input
          type="text"
          placeholder="Search channels..."
          value={channelSearch}
          onChange={(e) => setChannelSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#40444b",
            color: "white",
          }}
        />

        {/* Recommend Button */}
        <Button
          variant="contained"
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: theme.palette.apple.main, marginBottom: "20px", textTransform: "none" }}
        >
          + Recommend
        </Button>

        {/* List of Channels */}
        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          {filteredCities.length > 0 ? (
            filteredCities.map((city, index) => (
              <div
                key={index}
                  onClick={() => {
                    setSelectedCity(city);
                    setPostSearch("");
                  }}                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  backgroundColor: selectedCity === city ? "#40444b" : "transparent",
                  marginBottom: "5px",
                  transition: "0.2s",
                }}
              >
                {city}
              </div>
            ))
          ) : (
            <p>No matching channels</p>
          )}
        </div>

      </div>

      {/* Main content */}
      <div style={{
        flexGrow: 1,
        padding: "30px",
        overflowY: "auto",
      }}>
        {selectedCity ? (
          <>
            <h1 style={{ color: "#800080" }}>{selectedCity}</h1>

            {/* Post Search Bar */}
            <input
              type="text"
              placeholder="Search posts by title..."
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              style={{
                width: "400px",
                padding: "10px",
                margin: "20px 0",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />

            {/* Filtered posts */}
            {cityPosts[selectedCity]?.filter(post =>
              post.name?.toLowerCase().includes(postSearch.toLowerCase())
            ).length > 0 ? (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {cityPosts[selectedCity]
                  .filter(post =>
                    post.name?.toLowerCase().includes(postSearch.toLowerCase())
                  )
                  .map((post, idx) => (
                    <li key={idx} style={{ backgroundColor: "white", marginBottom: "15px", padding: "15px", borderRadius: "10px", boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
                      <h3>Posted by {post.username}: "{post.name}"</h3>
                      <p>"{post.description}"</p>
                      <p><strong>Best Time:</strong> {post.bestTime}</p>
                      <small>{new Date(post.created_at).toLocaleString()}</small>
                    </li>
                ))}
              </ul>
            ) : (
              <p>No matching posts found.</p>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", marginTop: "100px", color: "#555" }}>
            <h2>Welcome to the Forum!</h2>
            <p>Select a city on the left to view posts.</p>
          </div>
        )}
      </div>


      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "600px",
              boxShadow: "0px 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ color: "#800080", marginBottom: "20px" }}>Submit Your Trip</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label>Name:</label>
                <TextField
                  fullWidth
                  required
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ marginTop: "5px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>Location (City):</label>
                <Autocomplete
                  freeSolo
                  options={Object.keys(cityPosts)} // or a hardcoded array if you want!
                  value={formData.location}
                  onChange={(event, newValue) => {
                    setFormData((prevData) => ({
                      ...prevData,
                      location: newValue || "",
                    }));
                  }}
                  onInputChange={(event, newInputValue) => {
                    setFormData((prevData) => ({
                      ...prevData,
                      location: newInputValue,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Enter or select a city..."
                      style={{
                        marginTop: "5px",
                        backgroundColor: "white",
                      }}
                      required
                    />
                  )}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>Description:</label>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  required
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ marginTop: "5px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>Best Time to Visit:</label>
                <TextField
                  fullWidth
                  required
                  name="bestTime"
                  value={formData.bestTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, bestTime: e.target.value }))}
                  style={{ marginTop: "5px" }}
                />
              </div>

              <Box display="flex" justifyContent="space-between">
                <Button variant="contained" type="submit" style={{ backgroundColor: "#32CD32" }}>
                  Submit
                </Button>
                <Button variant="contained" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: "red" }}>
                  Close
                </Button>
              </Box>
            </form>
            {showSuggestion && suggestedCity && (
              <div style={{ marginTop: "20px", backgroundColor: "#ffe0e0", padding: "15px", borderRadius: "10px" }}>
                <p style={{ color: "red" }}>
                  This will create a new channel. Did you mean <strong>{suggestedCity}</strong>?
                </p>
                <Box display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    actuallySubmitPost(suggestedCity); // force corrected city
                  }}
                  style={{ marginRight: "10px" }}
                >
                  Yes, correct it
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    actuallySubmitPost(); // allow user input (even if typo)
                  }}
                >
                  No, create new
                </Button>
                </Box>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Snackbar for success toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default ForumDemo;
