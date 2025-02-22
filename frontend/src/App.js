import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import CreateTrip from './pages/CreateTrip';
import PlanTrip from './pages/PlanTrip';
import PreferenceSurvey from "./pages/PreferenceSurvey";
import TripDetails from './pages/TripDetails';
import ActivityCarousel from './pages/ActivityCarousel';
import PlaceDetails from './pages/PlaceDetails';

   function App() {
       const [message, setMessage] = useState('');
       useEffect(() => {
        fetch("http://127.0.0.1:55000/api/trailblazer")
        .then((response) => response.json())
        .then((data) => {
          if (data && data.message) {
            setMessage(data.message);
          } else {
            throw new Error("Message not found");
          }
        })
        .catch((error) => console.error("Error fetching data:", error));
       }, []);
       return (
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateTrip />} />
            <Route path="/plan" element={<PlanTrip />} />
            <Route path="/survey" element={<PreferenceSurvey />} />
            <Route path="/activities" element={<ActivityCarousel />} />
            <Route path="/trip-details/:tripId" element={<TripDetails />} />
            <Route path="/place-details/:placeId" element={<PlaceDetails />} />
          </Routes>
        </Router>
      );
   }

export default App;
