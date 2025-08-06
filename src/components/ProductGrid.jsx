import React, { useState } from 'react'

const ProductGrid = ({ articles, onAddToCart }) => {
  const [quantities, setQuantities] = useState({})

  const handleQuantityChange = (articleId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [articleId]: Math.max(1, quantity)
    }))
  }

  const handleAddToCart = (article) => {
    const quantity = quantities[article.id] || 1
    onAddToCart(article, quantity)
    setQuantities(prev => ({
      ...prev,
      [article.id]: 1
    }))
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mb-4">No se encontraron productos</h3>
        <p className="opacity-70">No hay artículos disponibles en esta categoría.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Productos Disponibles</h2>
        <div className="text-sm opacity-70">
          {articles.length} productos encontrados
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.map(article => (
          <div key={article.id} className="card hover:bg-opacity-10 transition-all duration-300">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg mb-2">{article.name}</h3>
                <p className="text-sm opacity-80 mb-3 flex-grow">
                  {article.description}
                </p>
                
                {article.categories && article.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.categories.map(category => (
                      <span 
                        key={category.id}
                        className="text-xs bg-orange-600 bg-opacity-30 px-2 py-1 rounded"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                {article.brandName && (
                  <div className="text-xs opacity-70 mb-2">
                    Marca: {article.brandName}
                  </div>
                )}

                <div className="text-xs mb-2">
                  <span className={article.quantity > 0 ? 'text-green-400' : 'text-red-400'}>
                    Stock: {article.quantity}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-orange-400">
                    ${article.price?.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  <label className="text-sm opacity-80">Cantidad:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(article.id, (quantities[article.id] || 1) - 1)}
                      className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center"
                      disabled={quantities[article.id] <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantities[article.id] || 1}
                      onChange={(e) => handleQuantityChange(article.id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center bg-transparent border border-gray-600 rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => handleQuantityChange(article.id, (quantities[article.id] || 1) + 1)}
                      className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(article)}
                  disabled={article.quantity <= 0}
                  className={`btn w-full text-sm ${
                    article.quantity <= 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {article.quantity <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductGrid