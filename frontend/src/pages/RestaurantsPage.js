import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Card, CardContent, CardMedia, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import theme from "../theme";

const RestaurantsPage = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchRestaurants(location).then(data => setRestaurants(data));
  }, [location]);

  const fetchRestaurants = async (loc) => {
    console.log("Location: ", loc)
    try {
      const response = await fetch(`http://localhost:55000/api/restaurants/${loc}`, {
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

  const filteredRestaurants = restaurants?.filter(restaurant =>
    restaurant.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setOpenDialog(true);
  };

  const confirmAddRestaurant = () => {
    // Logic to add activity to itinerary
    // For example, send a POST request to your backend
    // After adding, navigate back to the itinerary page
    navigate(-1); // Adjust as needed
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
          label="Search Restaurants"
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
              image={activity.image}
              alt={activity.title}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {activity.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rating: {activity.rating}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activity.description}
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
          <Button onClick={confirmAddRestaurant} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RestaurantsPage;