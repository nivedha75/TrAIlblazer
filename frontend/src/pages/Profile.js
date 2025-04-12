import React, {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import { Avatar, TextField, Button  } from "@mui/material"; 

const Profile = () => {
    const [user, setUser] = useState({
        userId: Cookies.get("user_id"),
        username: Cookies.get("username"),
        name: "",
        age: "",
        about: "",
        location: "",
        interests: ""
      });

    const [profilePic, setProfilePic] = useState("");

    const fileInputRef = useRef();
    const navigate = useNavigate();

      useEffect(() => {
        const fetchProfile = async () => {
          const userId = Cookies.get("user_id");
    
          if (!userId) return;
    
          try {
            const response = await fetch(`http://localhost:55000/profile/${userId}`, {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "http://localhost:3000",
                  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type",
                },
              });
            if (response.ok) {
              const data = await response.json();
              setUser(prev => ({
                ...prev,
                ...data 
              }));
              if (data.profile_pic) {
                setProfilePic(`http://localhost:55000${data.profile_pic}`);
              }
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
          }
        };
    
        fetchProfile();
      }, []);

      const handleChange = (field, value) => {
        setUser(prev => ({ ...prev, [field]: value }));
      };
    
      const handleSave = async () => {
        try {
          const response = await fetch("http://localhost:55000/profile/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
              },
            body: JSON.stringify(user)
          });
      
          const result = await response.json();
      
          if (response.ok) {
            alert("Profile saved successfully!");
          } else {
            alert("Error saving profile: " + result.message);
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Something went wrong while saving profile.");
        }
      };
      
      const handleRemovePic = async () => {
        try {
          const res = await fetch(`http://localhost:55000/api/remove-profile-pic/${user.username}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
              },
          });
          if (res.ok) {
            setProfilePic("");
            alert("Profile picture removed!");
          } else {
            alert("Failed to remove profile picture");
          }
        } catch (err) {
          console.error("Error removing profile picture:", err);
        }
      };

      const handleAvatarClick = () => {
        fileInputRef.current.click(); // Open file picker
      };
      
      const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
      
        const formData = new FormData();
        formData.append("file", file);
      
        const username = Cookies.get("username");
      
        try {
          const response = await fetch(`http://localhost:55000/api/upload-profile-pic/${username}`, {
            method: "POST",
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
              },
            body: formData,
          });
      
          const data = await response.json();
          if (data.filepath) {
            setProfilePic(`http://localhost:55000${data.filepath}`);
          }
        } catch (error) {
          console.error("Error uploading profile picture:", error);
        }
      };

    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //       const reader = new FileReader();
    //       reader.onloadend = () => {
    //         setProfilePic(reader.result); // base64 image data
    //       };
    //       reader.readAsDataURL(file);
    //     }
    //   };

      return (
        <div style={styles.pageBackground}>
        <div style={styles.containerWrapper}>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Back to Home
        </button>
          <div style={styles.container}>
            <div style={styles.header}>
            <div style={styles.avatarSection}>
            <Avatar
            style={styles.avatar}
            onClick={handleAvatarClick}
            src={profilePic || undefined}
            >
            {!profilePic && (user.name?.charAt(0).toUpperCase() || "U")}
            </Avatar>
            <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
            />
            {profilePic && (
            <Button
                variant="outlined"
                color="error"
                size="small"
                style={styles.removeBtn}
                onClick={handleRemovePic}
            >
                Remove Profile Picture
            </Button>
            )}
            </div>
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
      avatarSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "80px" 
      },
      avatar: {
        width: 70,
        height: 70,
        fontSize: 30,
        background: "linear-gradient(to right, #7f53ac, #647dee)",
        cursor: "pointer",
        transition: "none"
      },
      removeBtn: {
        marginTop: "6px",
        padding: "3px 8px",
        fontSize: "0.7rem",
        lineHeight: 1,
        textTransform: "none",
        whiteSpace: "nowrap"
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