import { useState } from 'react'

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [updatingItems, setUpdatingItems] = useState({})

  const handleUpdateQuantity = async (articleId, newQuantity) => {
    if (newQuantity < 1) return
    
    setUpdatingItems(prev => ({ ...prev, [articleId]: true }))
    try {
      await onUpdateQuantity(articleId, newQuantity)
    } finally {
      setUpdatingItems(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const handleRemoveItem = async (articleId) => {
    setUpdatingItems(prev => ({ ...prev, [articleId]: true }))
    try {
      await onRemoveItem(articleId)
    } finally {
      setUpdatingItems(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const cartItems = cart?.items || []
  const cartTotal = cart?.total || 0

  return (
    <div className="h-full flex flex-col">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl">Carrito</h2>
          {cartItems.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Limpiar Todo
            </button>
          )}
        </div>
        <div className="text-sm opacity-70">
          {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-6xl opacity-30 mb-4">🛒</div>
            <h3 className="mb-2">Carrito Vacío</h3>
            <p className="text-sm opacity-70">
              Agrega productos para comenzar tu pedido
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {cartItems.map(item => (
              <div 
                key={item.id || item.articleId} 
                className="bg-white bg-opacity-5 rounded-lg p-3 border border-gray-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm flex-1 mr-2">
                    {item.articleName}
                  </h4>
                  <button
                    onClick={() => handleRemoveItem(item.articleId)}
                    disabled={updatingItems[item.articleId]}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-orange-400 font-medium">
                    ${item.price?.toFixed(2)}
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.articleId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingItems[item.articleId]}
                      className="w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm">
                      {updatingItems[item.articleId] ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.articleId, item.quantity + 1)}
                      disabled={updatingItems[item.articleId]}
                      className="w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right mt-2">
                  <span className="text-sm font-medium">
                    Subtotal: ${item.subtotal?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-600 p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-orange-400">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button className="btn w-full">
              Procesar Pedido
            </button>
            <button className="btn-secondary w-full text-sm">
              Guardar para Después
            </button>
          </div>

          <div className="mt-3 text-xs text-center opacity-70">
            Los pedidos se procesan en tiempo real
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart