// src/services/OrderService.js - FIXED VERSION WITH ROBUST ERROR HANDLING
import axios from 'axios'

class OrderService {
  constructor() {
    this.baseURL = '/purchase'
  }

  /**
   * Complete a purchase by submitting cart items
   * @param {Array} cartItems - Array of cart items
   * @param {number} totalAmount - Total purchase amount
   * @returns {Promise} - Order completion response
   */
  async completePurchase(cartItems, totalAmount) {
    try {
      const orderRequest = {
        items: cartItems.map(item => ({
          articleId: item.articleId,
          articleName: item.articleName,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalAmount
      }

      console.log('Completing purchase:', orderRequest)
      
      const response = await axios.post(`${this.baseURL}/complete`, orderRequest)
      console.log('Purchase completed successfully:', response.data)
      
      return response.data
    } catch (error) {
      console.error('Purchase completion failed:', error)
      throw new Error(error.response?.data?.message || 'Error al completar la compra')
    }
  }

  /**
   * Get current product availability/stock levels
   * @returns {Promise} - Array of products with availability
   */
  async getProductAvailability() {
    console.log('🔍 Starting product availability fetch...')
    
    // Strategy 1: Try purchase/availability endpoint
    try {
      console.log('📡 Trying /purchase/availability endpoint...')
      const response = await axios.get(`${this.baseURL}/availability`)
      
      console.log('✅ Purchase availability response:', response.data)
      console.log('📊 Response type:', typeof response.data, 'Is array:', Array.isArray(response.data))
      
      if (Array.isArray(response.data)) {
        console.log(`📦 Found ${response.data.length} products from purchase endpoint`)
        return response.data
      } else if (response.data && typeof response.data === 'object') {
        // Handle paginated response or wrapper object
        const dataArray = response.data.content || response.data.data || response.data.items || []
        if (Array.isArray(dataArray)) {
          console.log(`📦 Extracted ${dataArray.length} products from wrapped response`)
          return dataArray
        }
      }
      
      console.warn('⚠️  Purchase endpoint returned non-array data:', response.data)
      return []
      
    } catch (purchaseError) {
      console.warn('❌ Purchase availability endpoint failed:', purchaseError.message)
      console.log('🔄 Falling back to articles endpoint...')
      
      // Strategy 2: Fallback to articles endpoint
      try {
        const articlesResponse = await axios.get('/article/articles?page=0&size=100&sortBy=name&sortOrder=asc')
        console.log('✅ Articles fallback response:', articlesResponse.data)
        
        let articlesData = articlesResponse.data
        
        // Handle different response formats from articles endpoint
        if (!Array.isArray(articlesData)) {
          // Check if it's a paginated response
          articlesData = articlesData?.content || articlesData?.data || articlesData?.items || []
        }
        
        if (Array.isArray(articlesData)) {
          const transformedData = articlesData.map(article => ({
            id: article.id,
            name: article.name || 'Producto sin nombre',
            quantity: typeof article.quantity === 'number' ? article.quantity : 0,
            price: typeof article.price === 'number' ? article.price : 0,
            brandName: article.brandName || article.brand?.name || 'Sin marca',
            description: article.description || null
          }))
          
          console.log(`📦 Transformed ${transformedData.length} products from articles endpoint`)
          return transformedData
        } else {
          console.error('❌ Articles endpoint also returned non-array data:', articlesData)
          return []
        }
        
      } catch (articlesError) {
        console.error('❌ Articles fallback also failed:', articlesError)
        
        // Strategy 3: Return empty array with error info
        console.log('🚨 All endpoints failed, returning empty array')
        return []
      }
    }
  }

  /**
   * Get daily sales summary for a specific date
   * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
   * @returns {Promise} - Sales summary data
   */
  async getDailySalesSummary(date = null) {
    try {
      const params = date ? { date } : {}
      
      console.log('📊 Fetching daily sales summary...', params)
      
      const response = await axios.get(`${this.baseURL}/sales/daily`, { params })
      console.log('✅ Daily sales summary loaded:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch daily sales summary:', error)
      
      // If the endpoint doesn't exist, return mock data
      if (error.response?.status === 404) {
        console.warn('⚠️  Sales summary endpoint not found, returning mock data')
        return {
          date: date || new Date().toISOString().split('T')[0],
          totalOrders: 0,
          totalRevenue: 0
        }
      }
      
      throw new Error(error.response?.data?.message || 'Error al cargar resumen de ventas')
    }
  }

  /**
   * Utility method to format currency
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Utility method to format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  formatDate(date) {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  }
}

// Create and export singleton instance
const orderService = new OrderService()
export default orderService