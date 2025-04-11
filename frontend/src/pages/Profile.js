import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import { Avatar, TextField, Button  } from "@mui/material"; 

const Profile = () => {
    const [user, setUser] = useState({
        userId: Cookies.get("user_id"),
        username: Cookies.get("username"),
        name: Cookies.get("name") || "",
        age: Cookies.get("age") || "",
        about: Cookies.get("about") || "",
        location: Cookies.get("location") || "",
        interests: Cookies.get("interests") || ""
      });
    
      const navigate = useNavigate();
      
      const handleChange = (field, value) => {
        setUser(prev => ({ ...prev, [field]: value }));
      };
    
      const handleSave = () => {
        // For now just log; later can POST to backend
        console.log("Updated user profile:", user);
        alert("Profile saved (not really, just frontend)");
      };
    
      return (
        <div style={styles.pageBackground}>
        <div style={styles.containerWrapper}>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Back to Home
        </button>
          <div style={styles.container}>
            <div style={styles.header}>
              <Avatar style={styles.avatar}>
                {user.name?.charAt(0).toUpperCase() || "U"}
              </Avatar>
              <h2 style={styles.username}>@{user.username}</h2>
            </div>
    
            <div style={styles.details}>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                value={user.name}
                placeholder="Enter name"
                onChange={(e) => handleChange("name", e.target.value)}
                style={styles.input}
              />
              <TextField
                fullWidth
                label="Age"
                variant="outlined"
                value={user.age}
                placeholder="Enter age"
                onChange={(e) => handleChange("age", e.target.value)}
                style={styles.input}
              />
              <TextField
                fullWidth
                label="About"
                variant="outlined"
                value={user.about}
                placeholder="Enter something about you"
                onChange={(e) => handleChange("about", e.target.value)}
                style={styles.input}
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Location"
                variant="outlined"
                value={user.location}
                placeholder="Enter location"
                onChange={(e) => handleChange("location", e.target.value)}
                style={styles.input}
              />
              <TextField
                fullWidth
                label="Interests"
                variant="outlined"
                value={user.interests}
                placeholder="Enter interests (comma separated)"
                onChange={(e) => handleChange("interests", e.target.value)}
                style={styles.input}
              />
              <Button
                variant="contained"
                style={styles.button}
                onClick={handleSave}
              >
                Save Profile
              </Button>
            </div>
          </div>
          </div>
        </div>
      );
    };
    
    const styles = {
      pageBackground: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #32CD32, #800080)",
        paddingTop: "40px",
        paddingBottom: "40px"
      },
      containerWrapper: {
        maxWidth: "700px",
        margin: "0 auto",
        position: "relative"
      },
      backButton: {
        position: "absolute",
        top: "0px",
        right: "0px",
        backgroundColor: "#7f53ac",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "8px",
        fontSize: "0.95rem",
        cursor: "pointer",
        transition: "background-color 0.3s",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      },
      container: {
        maxWidth: "650px",
        margin: "0 auto",
        padding: "30px",
        borderRadius: "20px",
        backgroundColor: "#ffffffee",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      },
      header: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        marginBottom: "30px"
      },
      avatar: {
        width: 70,
        height: 70,
        fontSize: 30,
        background: "linear-gradient(to right, #7f53ac, #647dee)"
      },
      username: {
        fontSize: "1.6rem",
        fontWeight: "600",
        color: "#800080"
      },
      details: {
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      },
      input: {
        backgroundColor: "#f5f5f5",
        borderRadius: "6px"
      },
      button: {
        backgroundColor: "#32CD32",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "1rem",
        textTransform: "none"
      }
    };
    
    export default Profile;