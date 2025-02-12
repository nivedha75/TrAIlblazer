import React, {useState} from "react";
import { useLocation } from "react-router-dom";
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

  const [timeRanges, setTimeRanges] = useState(
    Array.from({ length: days }, () => [9, 17])
  );

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
        />
      </div>

      {/* <h2>Calendar</h2>
      <div
        style={{
          margin: "20px auto",
          width: "600px",
          height: "400px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          color: "#555",
          backgroundColor: "#f9f9f9",
        }}
      >
        [ Calendar Placeholder ]
      </div> */}

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
          {/* <input
            type="range"
            min="0"
            max="10"
            defaultValue="5"
            style={{ width: "600px" }}
          /> */}
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
        onClick={() => alert("Trip saved!")}
      >
        Save and Continue
      </button>
    </div>
  );
};

export default PlanTrip;