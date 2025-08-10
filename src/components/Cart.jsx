// src/components/Cart.jsx - WITHOUT NOTIFICATIONS
import { useState } from 'react'
import axios from 'axios'
import orderService from '../services/OrderService'

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onPurchaseComplete }) => {
  const [updatingItems, setUpdatingItems] = useState({})
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Extract cart data safely
  const cartItems = cart?.items || []
  const cartTotal = cart?.total || 0

  const handleUpdateQuantity = async (articleId, newQuantity) => {
    if (newQuantity < 1) return

    setUpdatingItems(prev => ({ ...prev, [articleId]: true }))
    
    try {
      const response = await axios.put('/cart/items', {
        articleId,
        quantity: newQuantity
      })
      
      // Update local cart state through parent
      onUpdateQuantity && onUpdateQuantity(articleId, newQuantity)
    } catch (error) {
      console.error('Error updating cart item:', error)
      alert('Error al actualizar la cantidad')
    } finally {
      setUpdatingItems(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const handleRemoveItem = async (articleId) => {
    setUpdatingItems(prev => ({ ...prev, [articleId]: true }))
    
    try {
      await axios.delete(`/cart/items/${articleId}`)
      onRemoveItem && onRemoveItem(articleId)
    } catch (error) {
      console.error('Error removing cart item:', error)
      alert('Error al eliminar el artículo')
    } finally {
      setUpdatingItems(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const handleCompletePurchase = async () => {
    if (cartItems.length === 0) {
      alert('El carrito está vacío')
      return
    }

    setIsProcessingPurchase(true)
    setPurchaseError('')

    try {
      // Complete the purchase using the order service
      const orderResponse = await orderService.completePurchase(cartItems, cartTotal)
      
      console.log('Purchase completed:', orderResponse)

      // Clear the cart after successful purchase
      await axios.delete('/cart')
      
      // Notify parent component about successful purchase
      if (onPurchaseComplete) {
        onPurchaseComplete(orderResponse)
      }

      // Clear local cart state
      onClearCart && onClearCart()

      // Show success message
      alert(`¡Compra completada exitosamente!\nID de Orden: ${orderResponse.id}\nTotal: $${cartTotal.toFixed(2)}`)
      
      setShowConfirmation(false)
    } catch (error) {
      console.error('Purchase completion failed:', error)
      setPurchaseError(error.message)
    } finally {
      setIsProcessingPurchase(false)
    }
  }

  const openPurchaseConfirmation = () => {
    setShowConfirmation(true)
    setPurchaseError('')
  }

  const closePurchaseConfirmation = () => {
    setShowConfirmation(false)
    setPurchaseError('')
  }

  return (
    <>
      <div className="h-full flex flex-col bg-gray-900 bg-opacity-50">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Carrito</h2>
            <div className="text-sm opacity-70">
              {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
            </div>
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
              <button 
                onClick={openPurchaseConfirmation}
                disabled={isProcessingPurchase}
                className="btn w-full"
              >
                {isProcessingPurchase ? 'Procesando...' : 'Completar Compra'}
              </button>
              <button 
                onClick={onClearCart} 
                className="btn-secondary w-full text-sm"
                disabled={isProcessingPurchase}
              >
                Limpiar Carrito
              </button>
            </div>

            <div className="mt-3 text-xs text-center opacity-70">
              Los pedidos se procesan en tiempo real
            </div>
          </div>
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-600 w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Confirmar Compra</h3>
              
              {/* Order Summary */}
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-3">Resumen del Pedido:</h4>
                <div className="space-y-2 text-sm">
                  {cartItems.map(item => (
                    <div key={item.articleId} className="flex justify-between">
                      <span>{item.articleName} x{item.quantity}</span>
                      <span>${item.subtotal?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-600 mt-3 pt-3 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-orange-400">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Error Display */}
              {purchaseError && (
                <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">❌ {purchaseError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closePurchaseConfirmation}
                  disabled={isProcessingPurchase}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCompletePurchase}
                  disabled={isProcessingPurchase}
                  className="btn flex-1"
                >
                  {isProcessingPurchase ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </span>
                  ) : (
                    'Confirmar Compra'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Cart