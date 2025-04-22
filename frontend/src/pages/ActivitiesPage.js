import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Card, CardContent, CardMedia, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import theme from "../theme";

const ActivitiesPage = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // Replace this with your actual API call to fetch activities based on location
    fetchActivities(location).then(data => setActivities(data));
  }, [location]);

  const fetchActivities = async (loc) => {
    // Mock data; replace with actual API call
    return [
      {
        id: 1,
        title: 'Museum Visit',
        image: 'https://via.placeholder.com/150',
        rating: 4.5,
        description: 'Explore the local museum.'
      },
      // Add more activities
    ];
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddActivity = (activity) => {
    setSelectedActivity(activity);
    setOpenDialog(true);
  };

  const confirmAddActivity = () => {
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
  
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {filteredActivities.slice(0, 6).map(activity => (
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
             <IconButton onClick={() => handleAddActivity(activity)} color="primary" style={{
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
          <Button onClick={confirmAddActivity} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ActivitiesPage;