import { useState } from 'react'
import axios from 'axios'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/auth/login', formData)
      const { token, userId, email, role } = response.data
      
      const userData = {
        id: userId,
        email: email,
        role: role
      }
      
      onLogin(userData, token)
    } catch (error) {
      console.error('Login error:', error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4" style={{ fontFamily: 'Rock Salt, cursive' }}>
            Rock & Burger
          </h1>
          <div className="chalk-line"></div>
          <p className="text-lg opacity-80">Sistema de Punto de Venta</p>
        </div>

        <div className="card">
          <h2 className="text-center mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2" style={{ width: '20px', height: '20px' }}></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm opacity-70">
            <p>Demo - Usa cualquier credencial válida</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login