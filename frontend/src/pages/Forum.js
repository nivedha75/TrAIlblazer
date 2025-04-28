import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
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

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    bestTime: "",
  });

  const navigate = useNavigate();
  const home = () => {
    navigate(`/`);
  };

  // Fetch posts when component mounts
  useEffect(() => {
    fetch("http://localhost:55000/forum")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setFilteredPosts(data); // Initially show all posts
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  // Filter posts based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredPosts(posts); // Show all posts if no search term
    } else {
      setFilteredPosts(
        posts.filter((post) =>
          post.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, posts]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // Update search term on input change
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const username = Cookies.get("username");
    
    // Preparing the post data
    const postData = {
        username: username,
      ...formData,
    };

    fetch("http://localhost:55000/forum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        // setPosts((prevPosts) => [data, ...prevPosts]); // Add new post at the top
        setIsModalOpen(false); // Close modal after submission
      })
      .catch((error) => {
        console.error("Error submitting post:", error);
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #800080, #32CD32)",
        color: "white",
        paddingBottom: "50px",
      }}
    >
      <h1 style={{ color: "#32CD32" }}>Forum - Share Your Trip Recommendations</h1>
      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
        <Button variant="contained" sx={{ textTransform: "none", backgroundColor: theme.palette.purple.main, color: "white", marginBottom: "30px",
                        "&:hover": { backgroundColor: "#4BAF36"}, fontSize: "1rem", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}
                          onClick={() => home()}>
          Back to Home
        </Button>
      </Box>

      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: "#32CD32",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "10px 20px",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        Recommend a Trip Spot
      </button>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "600px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ color: "#800080" }}>Submit Your Trip Recommendation</h2>
            <form onSubmit={handleSubmit} style={({ color: "black"}) }>
              <div style={{ marginBottom: "20px" }}>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    margin: "5px 0",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    margin: "5px 0",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    margin: "5px 0",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label>Best Time to Visit:</label>
                <input
                  type="text"
                  name="bestTime"
                  value={formData.bestTime}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    margin: "5px 0",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: "#32CD32",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  borderRadius: "5px",
                }}
              >
                Submit
              </button>
              <button onClick={() => setIsModalOpen(false)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  borderRadius: "5px",
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      <div
        style={{
          width: "80%",
          marginTop: "40px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 style={{ color: "#800080" }}>Forum Posts</h2>
        {/* Search Bar */}
        <input
            type="text"
            placeholder="Search for posts by title..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
            width: "400px",
            padding: "10px",
            margin: "20px 0",
            borderRadius: "5px",
            border: "1px solid #ccc",
            }}
        />
        {filteredPosts.length > 0 ? (
          <ul style={{ listStyleType: "none", padding: "0" }}>
            {filteredPosts.map((post, index) => (
              <li
                key={index}
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "10px 0",
                  color: "black",
                }}
              >
                <h3>Posted by {post.username}: "{post.name}"</h3>
                <p>Location they visited: {post.location}</p>
                <p>"{post.description}"</p>
                <p><strong>Best Time to Visit:</strong> {post.bestTime}</p>
                <small>{new Date(post.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts yet. Be the first to recommend a trip spot!</p>
        )}
      </div>
    </div>
  );
};

export default Forum;
