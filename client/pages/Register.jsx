import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../config/axios'

const Register = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post('/register', {
        name,
        email,
        password
      }).then((res)=>{
console.log(res.data)
      }).catch((error)=>{
console.log(error)
      })
      navigate('/login') // Redirect to login after successful registration
      setName('') 
      setEmail('')
      setPassword('') // Clear the input fields
      console.log("Registration successful!")
      // Optionally clear fields or navigate
    } catch (error) {
      console.error("Registration error:", error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-2">Register</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="p-3 rounded-md bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="p-3 rounded-md bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="p-3 rounded-md bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-3 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold hover:from-indigo-700 hover:to-blue-600 transition"
        >
          Sign Up
        </button>
        <div className="text-center text-zinc-400 text-sm">
          Already have an account?{' '}
          <span
            className="text-indigo-400 underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </div>
      </form>
    </div>
  )
}

export default Register
