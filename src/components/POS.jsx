// src/components/POS.jsx - WITHOUT NOTIFICATIONS
import { useState, useEffect } from 'react'
import ProductGrid from './ProductGrid'
import Cart from './Cart'
import Header from './Header'
import ProductAvailability from './ProductAvailability'
import SalesSummary from './SalesSummary'
import axios from 'axios'

const POS = ({ user, onLogout }) => {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // New state for modal management
  const [showAvailability, setShowAvailability] = useState(false)
  const [showSalesSummary, setShowSalesSummary] = useState(false)
  const [availabilityRefreshTrigger, setAvailabilityRefreshTrigger] = useState(0)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Load articles, categories, and brands in parallel
      const [articlesRes, categoriesRes, brandsRes] = await Promise.all([
        axios.get('/article/articles?page=0&size=50&sortBy=name&sortOrder=asc'),
        axios.get('/category/categoriespage?page=0&size=50&sortBy=name&asc=true'),
        axios.get('/brand/brandspage?page=0&size=50&sortBy=name&asc=true')
      ])

      setArticles(articlesRes.data || [])
      setCategories(categoriesRes.data || [])
      setBrands(brandsRes.data || [])

      // Try to load existing cart
      await loadCart()
      
      console.log('Initial data loaded successfully')
    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error al cargar los datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadCart = async () => {
    try {
      const response = await axios.get('/cart')
      setCart(response.data || { items: [], total: 0 })
    } catch (error) {
      // If no cart exists, that's fine - we'll start with empty cart
      console.log('No existing cart found, starting with empty cart')
      setCart({ items: [], total: 0 })
    }
  }

  const addToCart = async (article, quantity = 1) => {
    try {
      const cartItem = {
        articleId: article.id,
        articleName: article.name,
        quantity: quantity,
        price: article.price
      }

      const response = await axios.post('/cart/items', cartItem)
      setCart(response.data)
      console.log('Item added to cart:', article.name)
    } catch (error) {
      console.error('Error adding to cart:', error)
      if (error.response?.status === 409) {
        alert('Este artículo ya está en el carrito. Puedes cambiar la cantidad desde el carrito.')
      } else {
        alert('Error al agregar el producto al carrito')
      }
    }
  }

  const updateCartItem = async (articleId, newQuantity) => {
    try {
      const response = await axios.put('/cart/items', {
        articleId,
        quantity: newQuantity
      })
      setCart(response.data)
    } catch (error) {
      console.error('Error updating cart item:', error)
      alert('Error al actualizar la cantidad')
    }
  }

  const removeFromCart = async (articleId) => {
    try {
      const response = await axios.delete(`/cart/items/${articleId}`)
      setCart(response.data)
    } catch (error) {
      console.error('Error removing from cart:', error)
      alert('Error al eliminar el artículo')
    }
  }

  const clearCart = async () => {
    try {
      await axios.delete('/cart')
      setCart({ items: [], total: 0 })
      console.log('Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Error al limpiar el carrito')
    }
  }

  // New function to handle successful purchase completion
  const handlePurchaseComplete = async (orderResponse) => {
    console.log('Purchase completed:', orderResponse)
    
    // Reload articles to get updated stock levels
    try {
      const articlesRes = await axios.get('/article/articles?page=0&size=50&sortBy=name&sortOrder=asc')
      setArticles(articlesRes.data || [])
      console.log('Articles reloaded after purchase')
    } catch (error) {
      console.error('Error reloading articles after purchase:', error)
    }

    // Trigger refresh for availability component if it's open
    setAvailabilityRefreshTrigger(prev => prev + 1)
  }

  // Filter articles by selected category
  const filteredArticles = selectedCategory 
    ? articles.filter(article => article.categoryId === selectedCategory)
    : articles

  // Check if user has auxiliar role
  const isAuxiliarUser = user?.role === 'ROLE_auxiliar' || user?.role === 'auxiliar'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Cargando sistema POS...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="mb-4">❌ {error}</p>
          <button onClick={loadInitialData} className="btn">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        onLogout={onLogout} 
        cartItemCount={cart?.items?.length || 0}
      />

      {/* Action Bar - Only show for auxiliar users */}
      {isAuxiliarUser && (
        <div className="bg-gray-800 border-b border-gray-600 p-4">
          <div className="container flex gap-4 items-center">
            <span className="text-sm opacity-70">Herramientas:</span>
            <button
              onClick={() => setShowAvailability(true)}
              className="btn-secondary text-sm px-4 py-2"
            >
              📦 Ver Disponibilidad
            </button>
            <button
              onClick={() => setShowSalesSummary(true)}
              className="btn-secondary text-sm px-4 py-2"
            >
              📊 Resumen de Ventas
            </button>
            <div className="ml-auto text-xs opacity-50">
              {articles.length} productos • {categories.length} categorías
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Category filters */}
          <div className="p-4 border-b border-gray-600">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`btn ${!selectedCategory ? 'btn' : 'btn-secondary'}`}
              >
                Todas
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`btn ${selectedCategory === category.id ? 'btn' : 'btn-secondary'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <ProductGrid 
            articles={filteredArticles}
            onAddToCart={addToCart}
          />
        </div>

        {/* Cart sidebar */}
        <div className="w-80 border-l border-gray-600">
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartItem}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onPurchaseComplete={handlePurchaseComplete}
          />
        </div>
      </div>

      {/* Modal Components */}
      {showAvailability && (
        <ProductAvailability
          refreshTrigger={availabilityRefreshTrigger}
          onClose={() => setShowAvailability(false)}
        />
      )}

      {showSalesSummary && (
        <SalesSummary
          onClose={() => setShowSalesSummary(false)}
        />
      )}
    </div>
  )
}

export default POS