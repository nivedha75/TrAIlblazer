import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';

   function App() {
       const [message, setMessage] = useState('');
       useEffect(() => {
        fetch("http://127.0.0.1:5000/api/hello")
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
           <div>
               <h1>{message}</h1>
               <button onClick={() => alert("Button Clicked!")}>Click Me</button>
           </div>
       );
   }

export default App;
