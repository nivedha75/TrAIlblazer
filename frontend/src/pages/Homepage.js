import React, {useState} from "react";
import Profile from "../assets/Profile.png"

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
    <div>
  <h1 style={{ textAlign: "center", color: "#32CD32" }}>Tr<span style={{ color: "#800080" }}>AI</span>lblazer</h1>
  <img src={Profile} alt="" style = {{position: "relative", left: "1350px", top: "-60px"}} onClick={toggleDropdown}/>
  {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "1300px",
            backgroundColor: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
            padding: "10px",
            zIndex: 10,
          }}
        >
        <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {["Edit Profile", "Edit Survey", "Logout"].map((option, index) => (
              <li
                key={index}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  transition: "background 0.2s ease-in-out",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
  </div>
  <div>
  <h1>My Trips:</h1>
  </div>
  <div style={{ marginTop: "150px" }}>
  <h1>Discover New Vacation Spots:</h1>
  </div>
  <div style={{ marginTop: "150px" }}>
  <h1>Past Trips:</h1>
  </div>
  </div>);
};

export default HomePage;