import React from 'react'

const Header = ({ user, onLogout, cartItemCount }) => {
  const formatUserRole = (role) => {
    if (!role) return 'Usuario'
    
    const cleanRole = role.replace('ROLE_', '')
    return cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1)
  }

  const getRoleColor = (role) => {
    if (!role) return 'text-gray-400'
    
    const cleanRole = role.replace('ROLE_', '').toLowerCase()
    switch (cleanRole) {
      case 'admin': return 'text-red-400'
      case 'auxiliar': return 'text-blue-400'
      case 'client': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getRoleIcon = (role) => {
    if (!role) return '👤'
    
    const cleanRole = role.replace('ROLE_', '').toLowerCase()
    switch (cleanRole) {
      case 'admin': return '👨‍💼'
      case 'auxiliar': return '👨‍🍳'
      case 'client': return '👤'
      default: return '👤'
    }
  }

  return (
    <header className="bg-black bg-opacity-30 border-b border-gray-600 p-4 sticky top-0 z-40">
      <div className="container flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl text-orange-400" style={{ fontFamily: 'Rock Salt, cursive' }}>
            Rock & Burger
          </h1>
          <div className="text-sm opacity-70 hidden md:block">
            Sistema POS • Punto de Venta
          </div>
        </div>

        {/* Center Info - Cart and Status */}
        <div className="flex items-center gap-6">
          {/* Cart indicator */}
          <div className="flex items-center gap-2 bg-gray-800 bg-opacity-50 px-3 py-2 rounded-lg">
            <span className="text-sm opacity-80">🛒</span>
            <div className="flex flex-col items-center">
              <div className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[1.5rem] text-center">
                {cartItemCount || 0}
              </div>
              <span className="text-xs opacity-70 hidden sm:block">
                {cartItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* System Status */}
          <div className="hidden lg:flex items-center gap-2 text-xs opacity-70">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Sistema Activo</span>
          </div>
        </div>

        {/* User info and actions */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg">
            <div className="text-xl">
              {getRoleIcon(user.role)}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium truncate max-w-32">
                {user.email || user.username || 'Usuario'}
              </div>
              <div className={`text-xs font-medium ${getRoleColor(user.role)}`}>
                {formatUserRole(user.role)}
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="btn-secondary text-sm px-4 py-2 hover:bg-red-600 hover:border-red-600 transition-colors"
            title="Cerrar Sesión"
          >
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <span className="sm:hidden">🚪</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header