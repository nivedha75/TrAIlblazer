import React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Menu, MenuItem  } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Bot from "../assets/Bot.avif";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import {arrayMoveImmutable} from "array-move";
import theme from "../theme";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
// import { Input } from "@/components/ui/input";
// import { Button as ChatButton} from "@/components/ui/button";

// const ChatComponent = ({ sendMessage, messages }) => {
//   const [input, setInput] = useState("");

//   const handleSend = () => {
//     if (input.trim() !== "") {
//       sendMessage(input);
//       setInput("");
//     }
//   };

//   return (
//     <div className="tailwind">
//     <div className="flex flex-col h-full w-full border rounded-lg shadow-md">
//       <div className="flex-1 overflow-y-auto p-4 space-y-2">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`p-3 rounded-lg ${
//               msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-black"
//             }`}
//           >
//             {msg.text}
//           </div>
//         ))}
//       </div>
//       <div className="p-4 flex border-t">
//         <Input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Ask anything..."
//           className="flex-1 p-2 border rounded focus:outline-none"
//         />
//         <ChatButton onClick={handleSend} className="ml-2 bg-blue-600 text-white">
//           Send
//         </ChatButton>
//       </div>
//     </div>
//     </div>
//   );
// };

const ItineraryDetails = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [username, setUsername] = useState("");
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const activityDetails = (activityId) => {
    navigate(`/activity-details/${encodeURIComponent(activityId)}`);
  };

  useEffect(() => {
    if (!showSearch) return; 

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 500); 

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);


  useEffect(() => {
    fetch(`http://localhost:55000/itinerary/${tripId}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Itinerary not found");
        }
        return response.json();
      })
      .then((data) => {setTrip(data);})
      .catch((error) => {
        console.error("Error fetching itinerary details:", error);
        setError(error.message); // Set the error message
      });
  }, [tripId]);

  useEffect(() => {
    fetch(`http://localhost:55000/restaurants/${tripId}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Itinerary not found");
        }
        return response.json();
      })
      .then((data) => {console.log("Restaurants: ", data); setRestaurantsData(data);})
      .catch((error) => {
        console.error("Error fetching restaurant details:", error);
        setError(error.message); // Set the error message
      });
  }, [tripId]);

  useEffect(() => {
    fetch(`http://localhost:55000/trips/${tripId}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
      .then((response) => response.json())
      .then((data) => setTripDetails(data))
      .catch((error) => console.error("Error fetching trip details:", error));
  }, [tripId]);

  useEffect(() => {
    // Fetch chat messages from the backend
    const userId = Cookies.get("user_id");
    const storedUsername = Cookies.get("username");
    setUsername(storedUsername);
    if (userId && storedUsername) {
      fetch(`http://localhost:55000/get_messages/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          return response.json();
        })
        .then((data) => {console.log(data); setChatMessages(data)})
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, []);

  // const handleSendMessage = () => {
  //   if (inputMessage.trim() === "" || !username) return;
  //   if (inputMessage.trim() !== "") {
  //     const userId = Cookies.get("user_id");
  //     console.log("id: ", userId);
  //     console.log("username: ", username);
  //     if (userId) {
  //     const userMessage = {
  //       user_id: userId,
  //       sender: username,
  //       receiver: "chatbot",
  //       message: inputMessage,
  //     };

  //     // Save user message and get chatbot response from backend
  //     fetch("http://localhost:55000/send_message", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Access-Control-Allow-Origin": "http://localhost:3000",
  //         "Access-Control-Allow-Methods": "POST, OPTIONS",
  //         "Access-Control-Allow-Headers": "Content-Type"
  //       },
  //       body: JSON.stringify(userMessage),
  //     })
  //       .then((response) => response.json())
  //       .then((data) => {
  //         setChatMessages((prev) => [...prev, data.userMessage, data.botResponse]);
  //       })
  //       .catch((error) => console.error("Error sending message:", error));
  //     }
  //     setInputMessage("");
  //   }
  // };
  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || !username) return;

    const userId = Cookies.get("user_id");
    console.log("userId: ", userId);
    console.log("username: ", username);
    if (!userId) return;

    // Create user message object
    const userMessage = {
      user_id: userId,
      sender: username,
      receiver: "chatbot",
      message: inputMessage,
      location: tripDetails.location,
      startDate: tripDetails.startDate,
      endDate: tripDetails.endDate
    };

    // Create placeholder chatbot response
    const tempBotResponse = {
      sender: "chatbot",
      message: "Thinking...",
    };

    // Immediately update UI with user message and placeholder chatbot response
    setChatMessages((prev) => [...prev, userMessage, tempBotResponse]);

    setInputMessage(""); // Clear input field

    try {
      const response = await fetch("http://localhost:55000/send_message", {
        method: "POST",
        headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "http://localhost:3000",
                  "Access-Control-Allow-Methods": "POST, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type"
                },
        body: JSON.stringify(userMessage),
      });

      const data = await response.json();
      console.log("Backend response:", data);
      if (!data.response) {
        throw new Error("Chatbot response is null");
      }
  

      // Update the "Thinking..." message with actual chatbot response
      //console.log("Msg: ", data.botResponse?.message);
      setChatMessages((prev) =>
      prev.map((msg, index) =>
        index === prev.length - 1 // Only replace the latest chatbot message
          ? { sender: "chatbot", message: data.response}
          : msg
      )
    );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };


  function confirmDelete(tripId, activityId) {
    fetch(`http://localhost:55000/delete_itinerary_activity/${tripId}/${activityId}`, {
      method: "DELETE",
      // headers: {
      //   "Content-Type": "application/json",
        // "Access-Control-Allow-Origin": "http://localhost:3000",
        // "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
        // "Access-Control-Allow-Headers": "Content-Type"
      // }
    })
    .then(response => {
        if (response.ok) {
            setTrip(prevItinerary => ({
                ...prevItinerary,
                activities: {
                    top_preferences: prevItinerary.activities.top_preferences.map(day =>
                      day.filter(activity => activity.details._id !== activityId)
                    ),
                    next_best_preferences: prevItinerary.activities.next_best_preferences.map(day =>
                      day.filter(activity => activity.details._id !== activityId)
                    )
                }
            }));
        } else {
            console.error("Failed to delete activity");
        }
    })
    .catch(error => console.error("Error:", error));
}


  const handleDeleteClick = (activity) => {
    setSelectedActivity(activity);
    setOpenDialog(true);
  };

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  function handleSelectActivity(tripId, activity) {
    fetch(`http://localhost:55000/move_itinerary_activity/${tripId}/${activity.details._id}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
        "Access-Control-Allow-Headers": "Content-Type"
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.message === "Activity moved successfully") {
        setTrip((prevTrip) => ({
          ...prevTrip,
          activities: {
            ...prevTrip.activities,
            next_best_preferences: prevTrip.activities.next_best_preferences.map(
              (day, index) =>
                index === activity.details.day
                  ? day.filter((a) => a.details._id !== activity.details._id)
                  : day
            ),
            top_preferences: prevTrip.activities.top_preferences.map(
              (day, index) =>
                index === activity.details.day
                  ? [...day, activity]
                  : day
            ),
          },
        }));
      }
  })
  .catch(error => console.error("Error:", error));
    handleClose();
  };

  function handleSelectRestaurant(tripId, activity) {
    fetch(`http://localhost:55000/move_restaurant_activity/${tripId}/${activity.details._id}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
        "Access-Control-Allow-Headers": "Content-Type"
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.message === "Activity moved successfully") {
        setTrip((prevTrip) => ({
          ...prevTrip,
          activities: {
            ...prevTrip.activities,
            top_preferences: [...prevTrip.activities.top_preferences, activity],
          },
        }));
      }
  })
  .catch(error => console.error("Error:", error));
  setShowSearch(false);
  setSearchTerm("");
  };
  
  
  const saveActivityOrder = (tripId, newOrder, index) => {
    fetch(`http://localhost:55000/update_activity_order/${tripId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ activities: newOrder, index }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "Activity order updated successfully") {
          setTrip((prevTrip) => ({
            ...prevTrip,
            activities: { 
              ...prevTrip.activities,
              top_preferences: prevTrip.activities.top_preferences.map((d, i) => i === index ? newOrder : d )},
          }));
        }
      })
      .catch(error => console.error("Error saving activity order:", error));
  };

  const addSearch = () => {
    setShowSearch(!showSearch);
    setSearchTerm("");
  };

  const filteredRestaurants = (restaurantsData?.restaurants || []).filter((restaurant) =>
  restaurant.title.toLowerCase().includes(searchTerm.toLowerCase())
);

const SortableItem = SortableElement(({ activity, deleteMode, handleDeleteClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  return <div
    style={{
      backgroundColor: isHovered ? "#e0e0e0" : "#fff",
      minHeight: "50px",
      padding: "15px",
      marginBottom: "20px",
      borderRadius: "10px",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "background-color 0.2s ease-in-out",
      cursor: "grab",
    }}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}


  >
              {/* <p style={{ fontSize: "18px", margin: "5px 0" }}>
        <strong>Description:</strong> {activity.description}
      </p>
      <img src={activity.image} width="500" height="500" alt={activity.title} />
      {activity.notes && (
        <p style={{ fontSize: "18px", margin: "5px 0", fontStyle: "italic" }}>
          <strong>Notes:</strong> {activity.notes}
        </p>
      )} */}
    <div style={{ textAlign: "left", flex: 1 }}>
      <h4 style={{ fontSize: "18px" }}><strong>{activity.title}</strong></h4>
      <p><strong>Rating:</strong> {activity.details.rating}</p>
      <span><i>{activity.context}</i></span>
    </div>
    <Button variant="contained" onClick={() => activityDetails(activity.details._id)}
        sx={{ textTransform: "none", backgroundColor: theme.palette.purple.main, color: "white",
        "&:hover": { backgroundColor: "#4BAF36"}, fontSize: "1rem",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}>
        More Details
    </Button>
    {deleteMode && (
      <DeleteIcon
        style={{ cursor: "pointer", color: "red", fontSize: "35px", marginLeft: "20px" }}
        onClick={() => handleDeleteClick(activity)}
      />
    )}
  </div>
});

const SortableList = SortableContainer(({ activities, deleteMode, handleDeleteClick }) => (
  <div>
    {activities.length > 0 ? (
      activities.map((activity, index) => (
        <SortableItem
          key={activity.details._id}
          index={index}
          activity={activity}
          deleteMode={deleteMode}
          handleDeleteClick={handleDeleteClick}
        />
      ))
    ) : (
      <p>No activities to display.</p>
    )}
  </div>
));

  if (error) {
    return (
      <div
        style={{
          maxWidth: "1500px",
          margin: "auto",
          textAlign: "center",
          backgroundColor: "#f9f9f9"
        }}
      >
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
          Itinerary Details
        </h1>
        <p style={{ fontSize: "20px", color: "#d9534f" }}>
          There was an error fetching the itinerary: {error}
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "18px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "0.3s",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!trip) {
    return <p>Loading itinerary details...</p>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          width: "30%",
          padding: "20px",
          backgroundColor: "#f4f4f4",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflowY: "auto",
          position: "fixed", // Keeps the chat fixed even while scrolling
          top: "0", // Adjust the vertical position as needed
          left: "0",
          height: "calc(100vh - 40px)", //
          zIndex: 9999
        }}
        >
       <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center" }}>Chat
          <img src={Bot} alt="Bot" style={{ width: "40px", height: "40px", marginLeft: "10px" }} />
          </h2>
        </div>
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            padding: "10px",
            backgroundColor: "#fff",
            borderRadius: "5px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
          >
          {chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => (
              <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg?.sender === "chatbot" ? "flex-start" : "flex-end",
              marginBottom: "8px"
            }}
          >
            <p
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                maxWidth: "70%",
                wordWrap: "break-word",
                textAlign: msg?.sender === "chatbot" ? "left" : "right",
                backgroundColor: msg?.sender === "chatbot" ? "#e0e0e0" : "#007bff",
                color: msg?.sender === "chatbot" ? "#000": "#fff",
              }}
            >
              <strong>{msg?.sender === "chatbot" ? "chatbot" : "Me"}:</strong> {msg?.message}
            </p>
          </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#888" }}>No messages yet</p>
          )}
        </div>
        <div style={{ display: "flex", marginTop: "10px" }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              outline: "none",
            }}
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            style={{
              marginLeft: "10px",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send  <FaPaperPlane />
          </button>
        </div>
      </div>
      <div
        style={{
       //   width: "70%",
          width: "65%",
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f9f9f9",
          position: "relative",
          left: "450px"
        }}
      >
        <Button
          variant="contained"
          color="error"
          style={{ position: "absolute", top: 10, right: 70 }}
          onClick={() => setDeleteMode(!deleteMode)}
        >
          {deleteMode ? "Cancel Delete" : "Delete Activities"}
        </Button>
        <h1 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
          Itinerary Details
        </h1>
        <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>
          {tripDetails?.location}
        </h3>
        <p style={{ fontSize: "18px", margin: "5px 0" }}>
          <strong>Start Date:</strong> {tripDetails?.startDate}
        </p>
        <p style={{ fontSize: "18px", margin: "5px 0" }}>
          <strong>End Date:</strong> {tripDetails?.endDate}
        </p>
        <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>
          {trip.activities.top_preferences.length > 0 && trip.activities.top_preferences[0].length > 0 ? "Activities for the Trip" : "No Activities Found"}
        </h3>
         {/* make length work */}
        {trip.activities.top_preferences.length > 0 ? (
          trip.activities.top_preferences.map((day, index) => (
            <React.Fragment key={index}>
              <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>Day {index+1}</h3>
            <SortableList
              key={index}
              activities={day}
              deleteMode={deleteMode}
              handleDeleteClick={handleDeleteClick}
              onSortEnd={({ oldIndex, newIndex }) => {
                const newOrder = arrayMoveImmutable(day, oldIndex, newIndex);
                setTrip((prevTrip) => ({
                  ...prevTrip,
                  activities: { 
                    ...prevTrip.activities,
                    top_preferences: prevTrip.activities.top_preferences.map((d, i) => i === index ? newOrder : d )},
                }));
                saveActivityOrder(trip._id, newOrder, index);
              }}
              distance={10} 
            />
            </React.Fragment>
          ))
        ) : (
          <p>No days to display.</p>
        )}
        

         <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the activity "{selectedActivity?.title}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={() => {confirmDelete(trip._id, selectedActivity.details._id);
        setOpenDialog(false);}} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "200px", marginTop: "20px"}}>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "18px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "0.3s",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            position: "relative",
            top:"-10px"
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
        >
          Back to Home
        </button>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer", flexDirection: "column", position: "relative" }}>
  {showSearch && (
    <div //ref={dropdownRef} 
    style={{ 
      position: "absolute", 
      bottom: "80px", 
      backgroundColor: "white", 
      padding: "10px", 
      borderRadius: "8px", 
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", 
      width: "280px",
      textAlign: "center",
      zIndex: 1000
    }}>
      <input
        type="text"
        placeholder="Search restaurants..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: "8px", width: "90%", borderRadius: "5px", border: "1px solid #ccc" }}
      />
      <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
        {filteredRestaurants.slice(0, 5).map((restaurant) => (
          <li key={restaurant._id} onClick={() => handleSelectRestaurant(trip._id, restaurant)} style={{ padding: "5px", fontSize: "16px", cursor: "pointer", 
          transition: "background 0.3s", 
          borderRadius: "5px"  }}
          onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
            onMouseLeave={(e) => e.target.style.background = "white"}>
            {restaurant.title}
          </li>
        ))}
      </ul>
    </div>
  )}

  <AddCircleIcon
    style={{ fontSize: "50px", color: "#007bff", cursor: "pointer" }}
    onClick={addSearch}
  />
  <span 
    onClick={addSearch} 
    style={{ fontSize: "18px", marginLeft: "2px", color: "#007bff", fontWeight: "bold", cursor: "pointer" }}
  >
    {showSearch ? "Close Search" : "Add Restaurant"}
  </span>
</div>
      
        <div
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <AddCircleIcon
        style={{ fontSize: "50px", color: "#007bff" }}
        onClick={handleAddClick}
      />
      <span onClick={handleAddClick} style={{ fontSize: "18px", marginLeft: "2px", color: "#007bff", fontWeight: "bold" }}>
        Add Activity
      </span>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {/* {trip.activities.next_best_preferences.map((activity) => (
          <MenuItem key={activity.details._id} onClick={() => handleSelectActivity(trip._id, activity)}>
            {activity.title}
          </MenuItem>
        ))} */}
        {trip.activities.next_best_preferences.map(function (day) {
            return day.map(function (activity) {
              return (
                <MenuItem key={activity.details._id} onClick={() => handleSelectActivity(trip._id, activity)}>
                  {activity.title}
                </MenuItem>
              )});
        })}
      </Menu>
    </div> 
    </div>
      </div>
    </div>
  );
};

export default ItineraryDetails;