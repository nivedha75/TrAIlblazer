import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';

   function App() {
       const [message, setMessage] = useState('');
       useEffect(() => {
           fetch('/api/hello') 
           .then(response => response.json())
           .then(data => console.log(data))
           .catch(error => console.error("Error fetching data:", error));
       }, []);
       return (
           <div>
               <h1>{message}</h1>
           </div>
       );
   }

export default App;
