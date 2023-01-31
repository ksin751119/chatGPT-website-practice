import React, { useState } from 'react';
import axios from  "axios";
import WelcomePage from './Welcome';
import './App.css';
import { useNavigate, Route, Routes } from 'react-router-dom';


function App(props ) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/users', {
        username,
        password,
      });
      console.log(response.data);
      navigate("/welcome")
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
    {/* <h1> Welcome to my game</h1> */}
    <Routes>
      <Route path="/welcome" element={<WelcomePage {...props} username={username}/>} />
      <Route path="/" element={<h1>Welcome to my game!</h1>} />
    </Routes>
    {/* <WelcomePage {...props} username={username}/> */}
    <form onSubmit={handleSubmit} action="/welcome">
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Submit</button>
    </form>
    </div>
  );
}

export default App;
