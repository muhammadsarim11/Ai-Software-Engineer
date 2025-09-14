import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from '../pages/Register'
import Login from '../pages/Login'
import Home from '../pages/Home'
import Project from '../pages/Project'
import UserAuth from '../src/auth/UserAuth'

const AppRoutes = () => {
  return (
   <BrowserRouter>
<Routes>
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/project" element={<UserAuth><Project/></UserAuth>} />
        <Route path='/' element={<UserAuth><Home/></UserAuth>}/>
    </Routes>   
   </BrowserRouter>
  )
}

export default AppRoutes
