import React, { useContext, useState, useEffect } from 'react'
import { Context } from "../../store/appContext";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  //Store values in hooks!
  const { store, actions } = useContext(Context);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  //On click of the login button do this...
  //Is it ok for this to be synchronous since it is a login task? Probably..
  const handleClick = () => {
    actions.login(email, password);
    
  }

  //Fun little error here... 
  //Background: https://stackoverflow.com/questions/72150678/cannot-update-a-component-browserrouter-while-rendering-a-different-componen
  //Explanation: A navigation away from a page must occur after the page has rendered! Therefore it has to be wrapped in a 
  // useEffect, otherwise it will throw an error about causing a problem with the rendering. 
  useEffect(() => {
    if (store.token && store.token !=="" && store.token !== undefined) navigate("/");
  }, [store.token, navigate]);

  return (
    <div> 
      <center> 
      <h1>Login</h1>
      </center>
        {(store.token && store.token!=="" && store.token !== undefined) ? "Thank you for logging in." :
      <div>
        <center>
        <input type="text" placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
        <br></br>
        <input type="password" placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
        <br></br>
        <br></br>
        <button onClick={handleClick}>Login</button>
        </center>
      </div>
  }
    </div>
  )
}

export default Login