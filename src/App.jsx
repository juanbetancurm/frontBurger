// src/App.jsx - TEMPORARY VERSION WITHOUT NOTIFICATIONS
import { useState, useEffect } from 'react'
import Login from './components/Login'
import POS from './components/POS'
import axios from 'axios'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
        
        // Set default Authorization header for all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        console.log('User restored from localStorage:', parsedUser.email)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    // Setup axios interceptors for better error handling
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      }
    )

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          console.error('Session expired')
          handleLogout()
        } else if (error.response?.status === 403) {
          console.error('Access denied')
        } else if (error.response?.status >= 500) {
          console.error('Server error')
        }
        
        return Promise.reject(error)
      }
    )

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  const handleLogin = (userData, token) => {
    try {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      setIsAuthenticated(true)
      
      console.log('Login successful:', userData.email)
    } catch (error) {
      console.error('Login error:', error)
      alert('Error al procesar el inicio de sesión')
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
      setIsAuthenticated(false)
      
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <POS user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App