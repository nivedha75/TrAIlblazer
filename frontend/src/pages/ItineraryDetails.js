import React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Menu,
  MenuItem,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Bot from "../assets/Bot.avif";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import theme from "../theme";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { FaPaperPlane, FaThumbsUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
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
  const [signedIn, setSignedIn] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [tooltipText, setTooltipText] = useState("Open Link in New Tab");
  const [openBook, setOpenBook] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [username, setUsername] = useState("");
  const dropdownRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const navigate = useNavigate();

  const activityDetails = (activityId) => {
    navigate(`/activity-details/${encodeURIComponent(activityId)}`);
  };

  const mapDetails = (activityId) => {
    navigate(`/map-details/${encodeURIComponent(activityId)}`);
  };

  // const navigateToMapDetails = () => {
  //   navigate(`/map-details/${tripId}`);
  // };

  const navigateToRouteDetails = (day) => {
    navigate(`/route-details/${tripId}/${day}`);
  }

  // const bookActivity = (activityId) => { };

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
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Itinerary not found");
        }
        return response.json();
      })
      .then((data) => {
        setTrip(data);
      })
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
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Itinerary not found");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Restaurants: ", data);
        setRestaurantsData(data);
      })
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
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
      .then((response) => response.json())
      .then((data) => setTripDetails(data))
      .catch((error) => console.error("Error fetching trip details:", error));
  }, [tripId]);

  useEffect(() => {
    // Fetch chat messages from the backend
    const userId = Cookies.get("user_id");
    if (userId == tripDetails?.userId) setSignedIn(true);
    //if (tripDetails?.collaborators.includes(Number(userId))) setSignedIn(true);
    const storedUsername = Cookies.get("username");
    const tripId = tripDetails?._id;
    setUsername(storedUsername);
    if (userId && storedUsername) {
      fetch(`http://localhost:55000/get_messages/${userId}/${tripId}`, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setChatMessages(data);
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [tripDetails?._id]);

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
    const tripId = tripDetails._id;
    console.log("userId: ", userId);
    console.log("username: ", username);
    console.log("tripID: ", tripId);
    if (!userId || !tripId) return;

    // Create user message object
    const userMessage = {
      user_id: userId,
      trip_id: tripId,
      sender: username,
      receiver: "chatbot",
      message: inputMessage,
      location: tripDetails.location,
      startDate: tripDetails.startDate,
      endDate: tripDetails.endDate,
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
          "Access-Control-Allow-Headers": "Content-Type",
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
            ? { sender: "chatbot", message: data.response }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

//   function confirmDelete(tripId, activityId) {
//     fetch(`http://localhost:55000/delete_itinerary_activity/${tripId}/${activityId}`, {
//       method: "DELETE",
//     })
//     .then(response => {
//         if (response.ok) {
//             setTrip(prevItinerary => ({
//                 ...prevItinerary,
//                 activities: {
//                     top_preferences: prevItinerary.activities.top_preferences.map(day =>
//                       day.filter(activity => activity.details._id !== activityId)
//                     ),
//                     next_best_preferences: prevItinerary.activities.next_best_preferences.map(day =>
//                       day.filter(activity => activity.details._id !== activityId)
//                     )
//                 }
//             }));
//         } else {
//             console.error("Failed to delete activity");
//         }
//     })
//     .catch(error => console.error("Error:", error));
// }


  const bookActivity = (activity) => {
    setSelectedActivity(activity);
    setOpenBook(true);
  };

  const handleDeleteClick = (activity) => {
    setSelectedActivity(activity);
    setOpenDialog(true);
  };

  const handleLike = (activity, isLike) => {
    const userId = Cookies.get("user_id");
    if (isLike && !activity.likedBy.includes(userId)) {
      if (activity.dislikedBy.includes(userId)) {
        activity.dislikes--;
        activity.dislikedBy = activity.dislikedBy.filter(id => id !== userId);
      }
      activity.likes++;
      activity.likedBy = [...(activity.likedBy || []), userId];
    } else if (!isLike && !activity.dislikedBy.includes(userId)) {
      if (activity.likedBy.includes(userId)) {
        activity.likes--;
        activity.likedBy = activity.likedBy.filter(id => id !== userId);
      }
      activity.dislikes++;
      activity.dislikedBy = [...(activity.dislikedBy || []), userId];
    } else return;
    setTrip((prevTrip) => {
      const dayIndex = activity?.day;
      const newOrder = prevTrip.activities.top_preferences[dayIndex].map((act, i) => 
        act.details._id === activity?.details._id ? activity : act
      );
      saveActivityOrder(activity?.details.tripId, newOrder, activity?.day);
      return {
        ...prevTrip,
        activities: {
          ...prevTrip.activities,
          top_preferences: prevTrip.activities.top_preferences.map((day, i) =>
            i === dayIndex ? newOrder : day
          ),
        },
      };
    });
  };

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function handleSelectActivity(tripId, activity) {
    fetch(`http://localhost:55000/move_itinerary_activity/${tripId}/${activity.activityNumber}`, {
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
        setTrip((prevTrip) => {
          const dayIndex = activity.day;
  
          return {
            ...prevTrip,
            activities: {
              ...prevTrip.activities,
              next_best_preferences: prevTrip.activities.next_best_preferences.map(
                (day, index) =>
                  index === dayIndex
                    ? day.filter((a) => a.activityNumber !== activity.activityNumber) 
                    : day
              ),
              top_preferences: prevTrip.activities.top_preferences.map(
                (day, index) =>
                  index === dayIndex
                    ? [...day, { ...activity }]
                    : [...day]
              ),
            },
          };
        });
      }
    })
    .catch(error => console.error("Error:", error));
  
    handleClose();
  }

  function handleSelectRestaurant(tripId, activity) {
    const daysInTrip = trip.activities.top_preferences.length;
    setShowSearch(false);
    setTimeout(() => {
    let day = null;
    //if (day === null) {
    while (day === null) {
      const userInput = prompt(`Select a day that you would like to go to this restaurant. (Since you are planning on going on a ${daysInTrip} day trip, input a number between 1 to ${daysInTrip}):`);
      if (userInput === null) return;
      if (!userInput || isNaN(userInput) || userInput < 1 || userInput > daysInTrip) {
        alert("Invalid input. Try again.");
        continue; 
      }
      day = parseInt(userInput, 10) - 1;
    }

    
    if (day === null) {
        console.error("Invalid day selected.");
        return;
    }
    fetch(`http://localhost:55000/move_restaurant_activity/${tripId}/${activity.activityNumber}/${day}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
        "Access-Control-Allow-Headers": "Content-Type"
      }
  })
  .then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
})
  .then(data => {
      if (data.message === "Activity moved successfully") {
        // setTrip((prevTrip) => ({
        //   ...prevTrip,
        //   activities: {
        //     ...prevTrip.activities,
        //     top_preferences: [...prevTrip.activities.top_preferences, activity],
        //   },
        // }));
        setTrip((prevTrip) => {
          const newTopPreferences = [...prevTrip.activities.top_preferences];
          newTopPreferences[day] = [...newTopPreferences[day], { ...activity, day }];
          
          return {
            ...prevTrip,
            activities: {
              ...prevTrip.activities,
              top_preferences: newTopPreferences,
            },
          };
        });
      }
  })
  .catch(error => console.error("Error:", error));
  setSearchTerm("");
  }, 0);
  };
  
  
  const saveActivityOrder = (tripId, newOrder, index) => {
    fetch(`http://localhost:55000/update_activity_order/${tripId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ activities: newOrder, index }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Activity order updated successfully") {
          setTrip((prevTrip) => ({
            ...prevTrip,
            activities: {
              ...prevTrip.activities,
              top_preferences: prevTrip.activities.top_preferences.map((d, i) =>
                i === index ? newOrder : d
              ),
            },
          }));
        }
      })
      .catch((error) => console.error("Error saving activity order:", error));
  };

  const addSearch = () => {
    setShowSearch(!showSearch);
    setSearchTerm("");
  };

  const filteredRestaurants = (restaurantsData?.restaurants || []).filter(
    (restaurant) =>
      restaurant.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

const SortableItem = SortableElement(({ activity, deleteMode, handleDeleteClick, signedIn, handleLike }) => {
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Button variant="contained" onClick={() => bookActivity(activity)}
          sx={{ textTransform: "none", width: "150px", backgroundColor: theme.palette.purple.main, color: "white",
          "&:hover": { backgroundColor: "#0000FF"}, fontSize: "1rem",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}>
          Book
      </Button>
      <Button variant="contained" onClick={() => activityDetails(activity.details._id)}
          sx={{ textTransform: "none", width: "150px", backgroundColor: theme.palette.apple.main, color: "white",
          "&:hover": { backgroundColor: "#0000FF"}, fontSize: "1rem",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}>
          More Details
      </Button>
      <Button variant="contained" onClick={() => mapDetails(activity.details._id)}
          sx={{ textTransform: "none", width: "150px", backgroundColor: theme.palette.purple.main, color: "white",
          "&:hover": { backgroundColor: "#0000FF"}, fontSize: "1rem",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}>
          View in Map
      </Button>
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <ThumbUpIcon
          style={{ cursor: "pointer", color: theme.palette.apple.main, fontSize: "35px", marginLeft: "20px" }}
          onClick={() => handleLike(activity, true)}
        />
        <span style={{ fontSize: "20px", marginLeft: "5px" }}>{activity.likes}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <ThumbDownIcon
          style={{ cursor: "pointer", color: theme.palette.purple.main, fontSize: "35px", marginLeft: "20px" }}
          onClick={() => handleLike(activity, false)}
        />
        <span style={{ fontSize: "20px", marginLeft: "5px" }}>{activity.dislikes}</span>
      </div>
    </div>
    {deleteMode && (
      <DeleteIcon
        style={{ cursor: "pointer", color: "red", fontSize: "35px", marginLeft: "20px" }}
        onClick={() => handleDeleteClick(activity)}
      />
    )}
  </div>
});

  const SortableList = SortableContainer(
    ({ activities, deleteMode, handleDeleteClick, signedIn, handleLike }) => (
      <div>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <SortableItem
              key={activity.details._id}
              index={index}
              activity={activity}
              deleteMode={deleteMode}
              handleDeleteClick={handleDeleteClick}
              signedIn={signedIn}
              handleLike={handleLike}
              disabled={!signedIn}
            />
          ))
        ) : (
          <p>No activities to display.</p>
        )}
      </div>
    )
  );

  if (error) {
    return (
      <div
        style={{
          maxWidth: "1500px",
          margin: "auto",
          textAlign: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h1
          style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}
        >
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
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
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
          zIndex: 9999,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ margin: 0, display: "flex", alignItems: "center" }}>
            Chat
            <img
              src={Bot}
              alt="Bot"
              style={{ width: "40px", height: "40px", marginLeft: "10px" }}
            />
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
                  justifyContent:
                    msg?.sender === "chatbot" ? "flex-start" : "flex-end",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    maxWidth: "70%",
                    wordWrap: "break-word",
                    textAlign: msg?.sender === "chatbot" ? "left" : "right",
                    backgroundColor:
                      msg?.sender === "chatbot" ? "#e0e0e0" : "#007bff",
                    color: msg?.sender === "chatbot" ? "#000" : "#fff",
                    whiteSpace: "pre-wrap", // Preserve line breaks
                  }}
                >
                  <strong>
                    {msg?.sender === "chatbot" ? "Chatbot" : "Me"}:
                  </strong>{" "}
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <span {...props} />, // prevent extra <p> tags
                    }}
                  >
                    {msg?.message}
                  </ReactMarkdown>
                  {/* <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p
                          style={{ marginBottom: "12px", lineHeight: "1.5" }}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {msg?.message}
                  </ReactMarkdown> */}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#888" }}>
              No messages yet
            </p>
          )}
        </div>
        <div style={{ display: "flex", marginTop: "10px" }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
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
            Send <FaPaperPlane />
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
          left: "500px",
        }}
      >
        {signedIn && (
          <Button
            variant="contained"
            color="error"
            style={{ position: "absolute", top: 10, right: 70 }}
            onClick={() => setDeleteMode(!deleteMode)}
          >
            {deleteMode ? "Cancel Delete" : "Delete Activities"}
          </Button>
        )}
        <h1
          style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}
        >
          Itinerary Details
        </h1>
        <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>
          {tripDetails?.secondaryLocation
            ? `${tripDetails?.location} and ${tripDetails?.secondaryLocation}`
            : tripDetails?.location}
        </h3>
        <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>
          Owner: {tripDetails?.name}
        </h3>
        {tripDetails?.collaboratorsNames?.length > 0 && (
          <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>
            Collaborators: {tripDetails.collaboratorsNames.join(", ")}
          </h3>
        )}
        <p style={{ fontSize: "18px", margin: "5px 0" }}>
          <strong>Start Date:</strong> {tripDetails?.startDate}
        </p>
        <p style={{ fontSize: "18px", margin: "5px 0" }}>
          <strong>End Date:</strong> {tripDetails?.endDate}
        </p>
        {/* <button onClick={navigateToMapDetails} style={{ marginTop: "10px", padding: "10px", fontSize: "20px", backgroundColor: "#0000FF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", transition: "transform 0.2s ease, box-shadow 0.2s e", display: "flex", alignItems: "center"}} onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
          }}>Check out the Map Details</button> */}
        <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>
          {trip.activities.top_preferences.length > 0 &&
          trip.activities.top_preferences[0].length > 0
            ? "Activities for the Trip"
            : "No Activities Found"}
        </h3>
        {/* make length work */}
        {trip.activities.top_preferences.length > 0 ? (
          trip.activities.top_preferences.map((day, index) => (
            <React.Fragment key={index}>
              <h3 style={{ color: "#333", fontSize: "22px", marginBottom: "10px" }}>Day {index+1}</h3>
              <Button variant="contained" onClick={() => navigateToRouteDetails(index)}
                sx={{ textTransform: "none", backgroundColor: theme.palette.purple.main, color: "white",
                "&:hover": { backgroundColor: "#0000FF"}, fontSize: "1rem",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}>
                View Route
              </Button>
              <SortableList
                key={index}
                activities={day}
                deleteMode={deleteMode}
                handleDeleteClick={handleDeleteClick}
                signedIn={signedIn}
                handleLike={handleLike}
                onSortEnd={({ oldIndex, newIndex }) => {
                  const newOrder = arrayMoveImmutable(day, oldIndex, newIndex);
                  setTrip((prevTrip) => ({
                    ...prevTrip,
                    activities: {
                      ...prevTrip.activities,
                      top_preferences: prevTrip.activities.top_preferences.map(
                        (d, i) => (i === index ? newOrder : d)
                      ),
                    },
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
        {/* The Booking Pop-up */}
        <Dialog open={openBook} onClose={() => setOpenBook(false)}>
        <DialogTitle>Book Activity</DialogTitle>
        <DialogContent>Would you like to book this activity with an external website?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBook(false)} color="error">Cancel</Button>
          <Tooltip title={tooltipText} arrow>
            <Button onClick={() => {
              try {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedActivity?.title)} booking`, "_blank");
                setTooltipText("Opened!");
                setTimeout(() => setTooltipText("Open Link in New Tab"), 1000); // Reset tooltip text after 1s
              } catch (error) {
                console.error("Failed to open:", error);
                setTooltipText("Failed to open");
              }
            }} color="secondary">Google</Button>
          </Tooltip>
          <Tooltip title={tooltipText} arrow>
            <Button onClick={() => {
              try {
                window.open(`https://www.viator.com/searchResults/all?text=${encodeURIComponent(selectedActivity?.title)}`, "_blank");
                setTooltipText("Opened!");
                setTimeout(() => setTooltipText("Open Link in New Tab"), 1000); // Reset tooltip text after 1s
              } catch (error) {
                console.error("Failed to open:", error);
                setTooltipText("Failed to open");
              }
            }} color="primary">Viator</Button>
          </Tooltip>
          <Tooltip title={tooltipText} arrow>
            <Button onClick={() => {
              try {
                window.open(`https://www.tripadvisor.com/Search?q=${encodeURIComponent(selectedActivity?.title)}`, "_blank");
                setTooltipText("Opened!");
                setTimeout(() => setTooltipText("Open Link in New Tab"), 1000); // Reset tooltip text after 1s
              } catch (error) {
                console.error("Failed to open:", error);
                setTooltipText("Failed to open");
              }
            }} color="secondary">Trip Advisor</Button>
          </Tooltip>
          <Tooltip title={tooltipText} arrow>
            <Button onClick={() => {
              try {
                window.open(`https://www.klook.com/en-US/search/?query=${encodeURIComponent(selectedActivity?.title)}`, "_blank");
                setTooltipText("Opened!");
                setTimeout(() => setTooltipText("Open Link in New Tab"), 1000); // Reset tooltip text after 1s
              } catch (error) {
                console.error("Failed to open:", error);
                setTooltipText("Failed to open");
              }
            }} color="primary">Klook</Button>
          </Tooltip>
        </DialogActions>
        </Dialog>
        {/* The Delete Warning */}
         <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the activity "
            {selectedActivity?.title}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={() => {
                setTrip((prevTrip) => {
                  const dayIndex = selectedActivity?.day;
                  const newOrder = prevTrip.activities.top_preferences[dayIndex].filter((act) => act.details._id !== selectedActivity?.details._id);
                  saveActivityOrder(selectedActivity?.details.tripId, newOrder, selectedActivity?.day);
                  return {
                  ...prevTrip,
                  activities: {
                    ...prevTrip.activities,
                    top_preferences: prevTrip.activities.top_preferences.map((day, i) =>
                      i === dayIndex ? newOrder : day
                    ),
                  },
                };
              });
              setOpenDialog(false);
        }} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
        <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  gap: "100px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
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
        {signedIn && (
        <><div style={{ display: "flex", alignItems: "center", cursor: "pointer", flexDirection: "column", position: "relative" }}>
              {/* {showSearch && (
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
                    style={{ padding: "8px", width: "90%", borderRadius: "5px", border: "1px solid #ccc" }} />
                  <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                    {filteredRestaurants.slice(0, 5).map((restaurant) => (
                      <li key={restaurant.activityNumber} onClick={() => handleSelectRestaurant(trip._id, restaurant)} style={{
                        padding: "5px", fontSize: "16px", cursor: "pointer",
                        transition: "background 0.3s",
                        borderRadius: "5px"
                      }}
                        onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
                        onMouseLeave={(e) => e.target.style.background = "white"}>
                        {restaurant.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
              <div style={{ display: "flex", alignItems: "center", flexDirection: "column", cursor: "pointer" }}>
              <AddCircleIcon
                style={{ fontSize: "50px", color: "#007bff", cursor: "pointer" }}
                onClick={() => navigate(`/restaurants/${encodeURIComponent(tripDetails.location)}`)}
                //onClick={addSearch} 
                />
              <span
                //onClick={addSearch}
                onClick={() => navigate(`/restaurants/${encodeURIComponent(tripDetails.location)}`)}
                style={{
                  fontSize: "18px",
                  marginLeft: "2px",
                  color: "#007bff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {/* {showSearch ? "Close Search" : "Add Restaurant"} */}
                Add Restaurant
              </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", flexDirection: "column", cursor: "pointer" }}>
            <AddCircleIcon
              style={{ fontSize: "50px", color: "#007bff", cursor: "pointer" }}
              onClick={() => navigate(`/activities/${encodeURIComponent(tripDetails.location)}`)}
            />
            <span
              onClick={() => navigate(`/activities/${encodeURIComponent(tripDetails.location)}`)}
              style={{
                fontSize: "15px",
                marginLeft: "2px",
                color: "#007bff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Add Any Activity
            </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", flexDirection: "column", cursor: "pointer" }}>
                <AddCircleIcon
                  style={{ fontSize: "50px", color: "#007bff" }}
                  onClick={handleAddClick} />
                <span
                  onClick={handleAddClick}
                  style={{
                    fontSize: "18px",
                    marginLeft: "2px",
                    color: "#007bff",
                    fontWeight: "bold",
                  }}
                >
                  Add Activity
                </span>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {/* {trip.activities.next_best_preferences.map((activity) => (
<MenuItem key={activity.details._id} onClick={() => handleSelectActivity(trip._id, activity)}>
  {activity.title}
</MenuItem>
))} */}
                  {trip.activities.next_best_preferences.map(function (day) {
                    return day.map(function (activity) {
                      return (
                        <MenuItem key={activity.activityNumber} onClick={() => handleSelectActivity(trip._id, activity)}>
                          {activity.title}
                        </MenuItem>
                      );
                    });
                  })}
                </Menu>
              </div></> 
    )}
    </div>
      </div>
    </div>
  );
};

export default ItineraryDetails;
