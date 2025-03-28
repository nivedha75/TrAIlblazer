import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Menu, MenuItem  } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Bot from "../assets/Bot.avif";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import {arrayMoveImmutable} from "array-move";
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

  const navigate = useNavigate();

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

  function confirmDelete(tripId, activityId) {
    fetch(`http://localhost:55000/delete_itinerary_activity/${tripId}/${activityId}`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
    .then(response => {
        if (response.ok) {
            setTrip(prevItinerary => ({
                ...prevItinerary,
                activities: {
                    top_preferences: prevItinerary.activities.top_preferences.filter(activity => activity.activityID !== activityId),
                    next_best_preferences: prevItinerary.activities.next_best_preferences.filter(activity => activity.activityID !== activityId)
                }
            }));
        } else {
            console.error("Failed to delete activity");
        }
    })
    .catch(error => console.error("Error:", error));
}

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      setChatMessages([...chatMessages, { text: inputMessage, sender: "user" }]);
      setInputMessage("");
    }
  };

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
    fetch(`http://localhost:55000/move_itinerary_activity/${tripId}/${activity.activityID}`, {
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
            next_best_preferences: prevTrip.activities.next_best_preferences.filter(
              (a) => a.activityID !== activity.activityID
            ),
            top_preferences: [...prevTrip.activities.top_preferences, activity],
          },
        }));
      }
  })
  .catch(error => console.error("Error:", error));
    handleClose();
  };
  
  const saveActivityOrder = (tripId, newOrder) => {
    fetch(`http://localhost:55000/update_activity_order/${tripId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ activities: newOrder }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "Activity order updated successfully") {
          setTrip((prevTrip) => ({
            ...prevTrip,
            activities: { ...prevTrip.activities, top_preferences: newOrder },
          }));
        }
      })
      .catch(error => console.error("Error saving activity order:", error));
  };

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
    <div style={{ textAlign: "left", flex: 1 }}>
      <h4 style={{ fontSize: "20px", color: "#444" }}>{activity.title}</h4>
      <span> ({activity.context})</span>
      <p>Rating: {activity.rating}</p>
      <p style={{ fontSize: "18px", margin: "5px 0" }}>
        <strong>Location:</strong> {activity?.location || ""}
      </p>
      <p style={{ fontSize: "18px", margin: "5px 0" }}>
        <strong>Description:</strong> {activity.description}
      </p>
      <img src={activity.image} width="500" height="500" alt={activity.title} />
      {activity.notes && (
        <p style={{ fontSize: "18px", margin: "5px 0", fontStyle: "italic" }}>
          <strong>Notes:</strong> {activity.notes}
        </p>
      )}
    </div>
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
          key={activity.activityID}
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
        {/* <div className="tailwind">
        <ChatComponent sendMessage={sendMessage} messages={chatMessages} />
        </div> */}
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
              <p key={index} style={{ textAlign: "left", margin: "5px 0" }}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
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
            Send
          </button>
        </div>
      </div>
      <div
        style={{
          width: "70%",
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
          {trip.activities.top_preferences.length > 0 ? "Activities for the Trip" : "No Activities Found"}
        </h3>
      <SortableList
        activities={trip.activities.top_preferences}
        deleteMode={deleteMode}
        handleDeleteClick={handleDeleteClick}
        onSortEnd={({ oldIndex, newIndex }) => {
          const newOrder = arrayMoveImmutable(trip.activities.top_preferences, oldIndex, newIndex);
          setTrip((prevTrip) => ({
            ...prevTrip,
            activities: { ...prevTrip.activities, top_preferences: newOrder },
          }));
          saveActivityOrder(trip._id, newOrder);
        }}
        distance={10} 
      />

         <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the activity "{selectedActivity?.title}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={() => {confirmDelete(trip._id, selectedActivity.activityID);
        setOpenDialog(false);}} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "500px", marginTop: "20px"}}>
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
        {trip.activities.next_best_preferences.map((activity) => (
          <MenuItem key={activity.activityID} onClick={() => handleSelectActivity(trip._id, activity)}>
            {activity.title}
          </MenuItem>
        ))}
      </Menu>
    </div> 
    </div>
      </div>
    </div>
  );
};

export default ItineraryDetails;