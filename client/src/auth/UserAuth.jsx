import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/User.context'
import { useNavigate } from 'react-router-dom'

const UserAuth = ({children}) => {

    const {user} = useContext(UserContext)
    const token = localStorage.getItem('token') 
    const [loading, setLoading] = useState(true)
    const navigation = useNavigate()    

    useEffect(() => {
      
    if(!token){
        navigation('/login')
    }
    
    setLoading(false)
    
    }, [])
    
    if(loading){
        return <div>Loading...</div>
    }
  return (
    <div>
      {children}
    </div>
  )
}

export default UserAuth

