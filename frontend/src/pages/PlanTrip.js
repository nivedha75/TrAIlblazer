import React, {useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const timeLabels = [
    "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM",
    "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
    "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM"
  ];

const PlanTrip = () => {
  const location = useLocation();
  const days = location.state?.days || 1;
  const [startDate, setStartDate] = useState(null);
  const [people, setPeople] = useState("");

  const navigate = useNavigate();

  const formatTime = (hour) => {
    const isPM = hour >= 12;
    let formattedHour = hour % 12 || 12;
    const period = isPM ? 'PM' : 'AM';
    return `${formattedHour} ${period}`;
  };
  
  const formatTimeRanges = (ranges) => {
    const formattedRanges = {};
    Object.keys(ranges).forEach((day, index) => {
      const range = ranges[day];
      formattedRanges[`Day ${index + 1}`] = {
        start: formatTime(range[0]),
        end: formatTime(range[1])
      };
    });
    return formattedRanges;
  };

  const saveTrip = async () => {
    const trip = {
      location: location.state?.locate || "Unknown Destination",
    };
    const savedTrips = JSON.parse(localStorage.getItem("trips5")) || [];
    savedTrips.push(trip);
    localStorage.setItem("trips5", JSON.stringify(savedTrips));
    if (!startDate || !people || people <= 0) {
      alert("Please select a valid start date and valid number of friends.");
      return;
    }
    const tripData = {
      location: location.state?.locate || "Unknown Destination",
      days,
      startDate: startDate.toISOString().split("T")[0],
      endDate: getEndDate(),
      timeRanges: formatTimeRanges(timeRanges),
      people: parseInt(people, 10)
    };

    fetch("http://localhost:55000/trips", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(tripData)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      alert("Trip saved successfully!");
      navigate("/");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to save trip. Please try again.");
    });
  };
  
  const [timeRanges, setTimeRanges] = useState(
    Array.from({ length: days }, () => [9, 17])
  );

  const getEndDate = () => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    return end.toISOString().split("T")[0];
  }

  const isHighlighted = (date) => {
    if (!startDate) return false;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    return date >= start && date <= end;
  };

  const updateTimeRange = (index, newRange) => {
    const updatedRanges = [...timeRanges];
    updatedRanges[index] = newRange;
    setTimeRanges(updatedRanges);
  };

  const peopleChange = (event) => {
    setPeople(event.target.value);
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Plan Your Trip</h1>
    
      <h2>Select Start Date</h2>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <Calendar
          onClickDay={setStartDate}
          value={startDate}
          tileClassName={({ date }) => (isHighlighted(date) ? "highlighted" : "")}
        />
        <style>{`
        .highlighted {
        background-color: #007bff !important;
        color: white !important;
        border-radius: 50%;
        }
`       }</style>
      </div>
      <h2>Daily Plans</h2>
      {Array.from({ length: days }).map((_, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <h3>Day {index + 1}</h3>
          <div style={{ display: "flex", justifyContent: "space-between", width: "600px", margin: "auto" }}>
            <span>12 AM</span>
            <span>12 AM</span>
          </div>
          <Slider
            range
            min={0}
            max={24}
            value={timeRanges[index]}
            onChange={(newRange) => updateTimeRange(index, newRange)}
            step={1}
            allowCross={false}
            styles={{
                track: { backgroundColor: "blue", height: "8px" },
                handle: { backgroundColor: "blue", borderColor: "blue", width: "18px", height: "18px" },
                rail: { backgroundColor: "#ddd", height: "8px" }
            }}
            renderThumb={(props, state) => <div {...props}>{timeLabels[state.valueNow]}</div>}
            style={{ width: "600px", margin: "auto", cursor: "pointer" }}
          />
          <p>Selected Time: {timeLabels[timeRanges[index][0]]} - {timeLabels[timeRanges[index][1]]}</p>
        </div>
      ))}
     <div>
        <input
          type="number"
          value={people}
          onChange={peopleChange}
          placeholder="Number of friends on trip"
          style={{
            width: "600px",
            height: "50px",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginBottom: "20px",
          }}
        />
      </div>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "20px",
          backgroundColor: "#32CD32",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px",
        }}
        onClick={saveTrip}
      >
        Save Trip
      </button>
    </div>
  );
};

export default PlanTrip;