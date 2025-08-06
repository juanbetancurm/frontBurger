import { useState, useEffect } from 'react'
import ProductGrid from './ProductGrid'
import Cart from './Cart'
import Header from './Header'
import axios from 'axios'

const POS = ({ user, onLogout }) => {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

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
    } catch (error) {
      console.error('Error adding to cart:', error)
      if (error.response?.status === 409) {
        alert('Este artículo ya está en el carrito. Puedes cambiar la cantidad desde el carrito.')
      } else {
        alert('Error al agregar el artículo al carrito')
      }
    }
  }

  const updateCartItem = async (articleId, quantity) => {
    try {
      const response = await axios.put('/cart/items', {
        articleId: articleId,
        quantity: quantity
      })
      setCart(response.data)
    } catch (error) {
      console.error('Error updating cart item:', error)
      alert('Error al actualizar el artículo')
    }
  }

  const removeFromCart = async (articleId) => {
    try {
      const response = await axios.delete(`/cart/items/${articleId}`)
      setCart(response.data)
    } catch (error) {
      console.error('Error removing from cart:', error)
      alert('Error al remover el artículo del carrito')
    }
  }

  const clearCart = async () => {
    try {
      await axios.delete('/cart')
      setCart({ items: [], total: 0 })
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Error al limpiar el carrito')
    }
  }

  const filteredArticles = selectedCategory 
    ? articles.filter(article => 
        article.categories?.some(cat => cat.id === selectedCategory)
      )
    : articles

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
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
        cartItemCount={cart.items?.length || 0}
      />
      
      <div className="flex-1 flex">
        {/* Main content area */}
        <div className="flex-1 p-4">
          {/* Category filters */}
          <div className="mb-6">
            <h3 className="mb-4">Categorías</h3>
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
          />
        </div>
      </div>
    </div>
  )
}

export default POS