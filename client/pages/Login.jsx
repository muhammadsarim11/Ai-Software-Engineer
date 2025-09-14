import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../config/axios'
import { UserContext, UserProvider } from '../context/User.context'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { User, setUser } = useContext(UserContext)

  useEffect(() => {
    console.log('User updated:', User)
  }, [User])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await axiosInstance.post('/login', { email, password })
console.log(res.data)
      const { token, user } = res.data

      // Save token to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Set user context
      setUser(user)
   console.log(User)
      // Clear form
      setEmail('')
      setPassword('')

      
      // Navigate to dashboard or home
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-2">Login</h2>
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
          Sign In
        </button>
        <div className="text-center text-zinc-400 text-sm">
          Already have an account?{' '}
          <span
            className="text-indigo-400 underline cursor-pointer"
            onClick={() => navigate('/register')}
          >
            Register
          </span>
        </div>
      </form>
    </div>
  )
}

export default Login
