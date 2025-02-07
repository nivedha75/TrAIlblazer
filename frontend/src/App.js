import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';

   function App() {
       const [message, setMessage] = useState('');
       useEffect(() => {
           fetch('/api/hello') 
               .then(res => res.text())
               .then(data => setMessage(data));
       }, []);

       return (
           <div>
               <h1>{message}</h1>
           </div>
       );
   }

export default App;
