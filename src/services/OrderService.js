// src/services/OrderService.js - FIXED VERSION WITH FALLBACKS
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
    try {
      console.log('Fetching product availability...')
      
      // Try the purchase/availability endpoint first
      try {
        const response = await axios.get(`${this.baseURL}/availability`)
        console.log('Product availability loaded from /purchase/availability:', response.data)
        
        // Ensure we return an array
        if (Array.isArray(response.data)) {
          return response.data
        } else {
          console.warn('Purchase availability response is not an array:', response.data)
          return []
        }
      } catch (purchaseError) {
        console.warn('Purchase availability endpoint failed, trying fallback:', purchaseError.message)
        
        // Fallback: Try to get products from the articles endpoint
        try {
          const articlesResponse = await axios.get('/article/articles?page=0&size=100&sortBy=name&sortOrder=asc')
          console.log('Using articles endpoint as fallback:', articlesResponse.data)
          
          // Transform articles data to match availability format
          const articles = Array.isArray(articlesResponse.data) ? articlesResponse.data : []
          return articles.map(article => ({
            id: article.id,
            name: article.name,
            quantity: article.quantity || 0,
            price: article.price || 0,
            brandName: article.brandName || 'N/A'
          }))
        } catch (articlesError) {
          console.error('Articles fallback also failed:', articlesError)
          throw new Error('No se pudo obtener la información de disponibilidad')
        }
      }
    } catch (error) {
      console.error('Failed to fetch product availability:', error)
      throw new Error(error.response?.data?.message || 'Error al cargar disponibilidad de productos')
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
      
      console.log('Fetching daily sales summary...', params)
      
      const response = await axios.get(`${this.baseURL}/sales/daily`, { params })
      console.log('Daily sales summary loaded:', response.data)
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch daily sales summary:', error)
      
      // If the endpoint doesn't exist, return mock data for now
      if (error.response?.status === 404) {
        console.warn('Sales summary endpoint not found, returning mock data')
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