// src/components/ProductAvailability.jsx - ROBUST VERSION
import { useState, useEffect } from 'react'
import orderService from '../services/OrderService'

const ProductAvailability = ({ refreshTrigger, onClose }) => {
  const [products, setProducts] = useState([]) // Always initialize as array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    loadProductAvailability()
  }, [refreshTrigger])

  const loadProductAvailability = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Loading product availability...')
      const availability = await orderService.getProductAvailability()
      
      console.log('📦 Availability response:', availability)
      console.log('📊 Response type:', typeof availability, 'Is array:', Array.isArray(availability))
      
      // SAFETY CHECK: Always ensure we have an array
      if (Array.isArray(availability)) {
        setProducts(availability)
        console.log(`✅ Successfully loaded ${availability.length} products`)
      } else {
        console.error('❌ Expected array but got:', typeof availability, availability)
        setProducts([])
        setError('El servidor devolvió datos en formato incorrecto')
      }
    } catch (error) {
      console.error('❌ Error loading product availability:', error)
      setError(error.message || 'Error desconocido al cargar productos')
      setProducts([]) // Always ensure products is an array
    } finally {
      setLoading(false)
    }
  }

  // SAFETY: Ensure products is always an array before filtering
  const safeProducts = Array.isArray(products) ? products : []
  
  const filteredProducts = safeProducts.filter(product => {
    if (!product) return false
    
    const name = product.name || ''
    const brandName = product.brandName || ''
    const searchLower = searchTerm.toLowerCase()
    
    return name.toLowerCase().includes(searchLower) || 
           brandName.toLowerCase().includes(searchLower)
  })

  // Sort products with safety checks
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!a || !b) return 0
    
    let aValue = a[sortBy] || ''
    let bValue = b[sortBy] || ''

    // Handle different data types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue || '').toLowerCase()
    }

    // Handle numbers
    if (typeof aValue === 'number') {
      aValue = aValue || 0
      bValue = bValue || 0
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getStockStatus = (quantity) => {
    const qty = quantity || 0
    if (qty === 0) return { text: 'Sin Stock', color: 'text-red-400' }
    if (qty <= 5) return { text: 'Stock Bajo', color: 'text-yellow-400' }
    return { text: 'Disponible', color: 'text-green-400' }
  }

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  // Safe calculations with fallbacks
  const totalProducts = safeProducts.length
  const productsWithStock = safeProducts.filter(p => (p?.quantity || 0) > 5).length
  const productsOutOfStock = safeProducts.filter(p => (p?.quantity || 0) === 0).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-600 w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600">
          <div>
            <h2 className="text-2xl font-bold">Disponibilidad de Productos</h2>
            <p className="text-sm opacity-70 mt-1">
              Estado actual del inventario
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>
            <button
              onClick={loadProductAvailability}
              disabled={loading}
              className="btn-secondary px-4 py-2"
            >
              {loading ? 'Actualizando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p>Cargando disponibilidad...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-400">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="mb-4 text-lg font-semibold">Error al cargar productos</p>
                <p className="mb-4 text-sm opacity-80">{error}</p>
                <button
                  onClick={loadProductAvailability}
                  className="btn-secondary"
                >
                  🔄 Reintentar
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {totalProducts}
                  </div>
                  <div className="text-sm opacity-70">Total Productos</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {productsWithStock}
                  </div>
                  <div className="text-sm opacity-70">Con Stock</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {productsOutOfStock}
                  </div>
                  <div className="text-sm opacity-70">Sin Stock</div>
                </div>
              </div>

              {/* Product Table */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('name')}
                      >
                        Producto {getSortIcon('name')}
                      </th>
                      <th 
                        className="text-left p-3 cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('brandName')}
                      >
                        Marca {getSortIcon('brandName')}
                      </th>
                      <th 
                        className="text-center p-3 cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('quantity')}
                      >
                        Stock {getSortIcon('quantity')}
                      </th>
                      <th 
                        className="text-right p-3 cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('price')}
                      >
                        Precio {getSortIcon('price')}
                      </th>
                      <th className="text-center p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((product, index) => {
                      const quantity = product?.quantity || 0
                      const price = product?.price || 0
                      const status = getStockStatus(quantity)
                      
                      return (
                        <tr 
                          key={product?.id || index} 
                          className={`border-b border-gray-700 hover:bg-gray-700 ${
                            index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-medium">{product?.name || 'Sin nombre'}</div>
                            {product?.description && (
                              <div className="text-xs opacity-70 mt-1">
                                {product.description}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-sm opacity-80">
                            {product?.brandName || 'Sin marca'}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${
                              quantity === 0 ? 'text-red-400' :
                              quantity <= 5 ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {quantity}
                            </span>
                          </td>
                          <td className="p-3 text-right font-medium text-orange-400">
                            ${price.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {sortedProducts.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-lg font-medium mb-2">
                      {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                    </p>
                    {searchTerm && (
                      <p className="text-sm opacity-70">
                        Intenta cambiar los términos de búsqueda
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-600 text-center text-xs opacity-70">
          Última actualización: {new Date().toLocaleString('es-CO')} • 
          {totalProducts > 0 && ` ${totalProducts} productos cargados`}
        </div>
      </div>
    </div>
  )
}

export default ProductAvailability