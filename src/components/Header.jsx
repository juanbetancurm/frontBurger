import React from 'react'

const Header = ({ user, onLogout, cartItemCount }) => {
  return (
    <header className="bg-black bg-opacity-30 border-b border-gray-600 p-4">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl" style={{ fontFamily: 'Rock Salt, cursive' }}>
            Rock & Burger
          </h1>
          <div className="text-sm opacity-70">
            Sistema POS
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Cart indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-80">Carrito:</span>
            <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {cartItemCount} items
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">
                {user.email}
              </div>
              <div className="text-xs opacity-70 capitalize">
                {user.role?.replace('ROLE_', '')}
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="btn-secondary text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header