import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TextField, Card, CardContent, CardMedia, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import theme from "../theme";

const RestaurantsPage = () => {
  const { location } = useParams();
  const locate = useLocation();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const itineraryId = locate.state?.tripId;
  const daysInTrip = locate.state?.numDays;

  useEffect(() => {
    console.log("Id: ", itineraryId);
    console.log("Days: ", daysInTrip)
    fetchRestaurants(location).then(data => {console.log("Data: ", data); setRestaurants(data)});
  }, [location, itineraryId, daysInTrip]);

  const fetchRestaurants = async (loc) => {
    console.log("Location: ", loc)
    try {
      const response = await fetch(`http://localhost:55000/api/restaurants/${loc}?tripId=${itineraryId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
      if (!response.ok) {
        throw new Error("Cannot get data from google place API");
      }
      const data = await response.json();
      console.log("Backend response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching activities", error);
    }
    // return [
    //   {
    //     id: 1,
    //     title: 'Museum Visit',
    //     image: 'https://via.placeholder.com/150',
    //     rating: 4.5,
    //     description: 'Explore the local museum.'
    //   },
    //   // Add more activities
    // ];
  };

  const filteredRestaurants = restaurants?.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRestaurant = (activity) => {
    console.log("Activity: ", activity);
    let day = null;

    while (day === null) {
      const userInput = prompt(`Select a day to add this restaurant. Enter a number between 1 and ${daysInTrip}:`);
      if (userInput === null) return; 
      if (!userInput || isNaN(userInput) || userInput < 1 || userInput > daysInTrip) {
        alert("Invalid input. Try again.");
        continue;
      }
      day = parseInt(userInput, 10) - 1;
    }

    fetch(`http://localhost:55000/add_restaurant_to_itinerary/${itineraryId}/${day}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(activity)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add restaurant");
        return res.json();
      })
      .then((data) => {
        alert("Restaurant added to itinerary!");
        navigate(`/itinerary-details/${itineraryId}`);
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong. Try again.");
      });
  };

  const confirmAddActivity = () => {
    navigate(-1);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            backgroundColor: theme.palette.purple.main,
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: '0.3s',
            height: '56px' 
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = theme.palette.purple.main)}
        >
          Back to Home
        </button>
  
        <TextField
          label="Search Activities"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
  
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            backgroundColor: theme.palette.purple.main,
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: '0.3s',
            height: '56px'
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = theme.palette.purple.main)}
        >
          Back to Itinerary
        </button>
      </div>
  
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        maxWidth: 'calc(4 * 300px + 3 * 20px)',
        margin: '0 auto',
      }}>
        {filteredRestaurants?.slice(0, 8).map(activity => (
          <Card key={activity.id} style={{ width: '300px',  backgroundColor: '#b2e59e',
          position: 'relative',
          border: '2px solid #4caf50', 
          borderRadius: '10px',
          transition: '0.3s ease',
          cursor: 'pointer', }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0px 4px 15px rgba(0,0,0,0.2)';
            e.currentTarget.style.backgroundColor = '#32CD32';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.backgroundColor = '#b2e59e';
          }}>
             <IconButton onClick={() => handleAddRestaurant(activity)} color="primary" style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'white',
          zIndex: 2,
        }}>
                <AddCircleIcon />
              </IconButton>
            <CardMedia
              component="img"
              height="140"
              image={activity.details.images}
              alt={activity.title}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {activity.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rating: {activity.details.rating}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activity.details.description}
              </Typography>

            </CardContent>
          </Card>
        ))}
      </div>
  
      {/* Dialog for Day Selection */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Select Day</DialogTitle>
        <DialogContent>
          {/* Implement day selection logic here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={confirmAddActivity} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RestaurantsPage;