import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Homepage";
import CreateTrip from './pages/CreateTrip';
import PlanTrip from './pages/PlanTrip';
import PreferenceSurvey from "./pages/PreferenceSurvey";
import TripDetails from './pages/TripDetails';
import ItineraryDetails from './pages/ItineraryDetails';
import ActivityCarousel from './pages/ActivityCarousel';
import PlaceDetails from './pages/PlaceDetails';
import ActivityDetails from './pages/ActivityDetails';
import SignIn from "./pages/SignIn";
import NextBestActivities from './pages/NextBestActivities';


   function App() {
       const [message, setMessage] = useState('');
       const [isAuthenticated, setIsAuthenticated] = useState(false);
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
          {/* <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={isAuthenticated ? <CreateTrip /> : <Navigate to="/sign-in" />} />
            <Route path="/plan" element={isAuthenticated ? <PlanTrip /> : <Navigate to="/sign-in" />} />
            <Route path="/survey" element={isAuthenticated ? <PreferenceSurvey /> : <Navigate to="/sign-in" />} />
            <Route path="/activities" element={isAuthenticated ? <ActivityCarousel /> : <Navigate to="/sign-in" />} />
            <Route path="/trip-details/:tripId" element={isAuthenticated ? <TripDetails /> : <Navigate to="/sign-in" />} />
            <Route path="/place-details/:placeId" element={isAuthenticated ? <PlaceDetails /> : <Navigate to="/sign-in" />} />
            <Route path="/activity-details/:activityId" element={isAuthenticated ? <ActivityDetails /> : <Navigate to="/sign-in" />} />
            <Route path="/sign-in" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
          </Routes> */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateTrip />} />
            <Route path="/plan" element={<PlanTrip />} />
            <Route path="/survey" element={<PreferenceSurvey />} />
            {/* <Route path="/activities/:tripId" element={<ActivityCarousel />} /> */}
            <Route path="/activities" element={<ActivityCarousel />} />
            <Route path="/trip-details/:tripId" element={<TripDetails />} />
            <Route path="/itinerary-details/:tripId" element={<ItineraryDetails />} />
            {/* <Route path="/next-best-activities/:tripId" element={<NextBestActivities />} /> */}
            <Route path="/place-details/:placeId" element={<PlaceDetails />} />
            <Route path="/activity-details/:activityId" element={<ActivityDetails />} />
            <Route path="/sign-in" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
          </Routes>
        </Router>
      );
   }

export default App;
