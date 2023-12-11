import { Navigate, Outlet } from 'react-router-dom'
import React, { useContext } from 'react'
import { Context } from "../store/appContext";

const PrivateRoutes = () => {
  const { store } = useContext(Context);
  //Token defaults to false...
  let auth = {'token':false}
  //Check if token is in the store, then flip it. 
  if (store.token && store.token !=="" && store.token !== undefined){
    auth = {'token':true};
  }
  
return (
    auth.token ? <Outlet/> : <Navigate to='/login'/>
  )
}

export default PrivateRoutes