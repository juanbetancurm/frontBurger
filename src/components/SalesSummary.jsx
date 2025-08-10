// src/components/SalesSummary.jsx
import { useState, useEffect } from 'react'
import orderService from '../services/OrderService'

const SalesSummary = ({ onClose }) => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    loadSalesSummary()
  }, [selectedDate])

  const loadSalesSummary = async () => {
    try {
      setLoading(true)
      setError('')
      
      const data = await orderService.getDailySalesSummary(selectedDate)
      setSummary(data)
    } catch (error) {
      console.error('Error loading sales summary:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const calculateAverageOrderValue = () => {
    if (!summary || summary.totalOrders === 0) return 0
    const revenue = parseFloat(summary.totalRevenue) || 0
    return revenue / summary.totalOrders
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getRevenueIcon = () => {
    if (!summary) return '📊'
    const revenue = parseFloat(summary.totalRevenue) || 0
    if (revenue > 500000) return '🚀'
    if (revenue > 200000) return '📈'
    return '💰'
  }

  const getOrdersIcon = () => {
    if (!summary) return '🛒'
    if (summary.totalOrders > 50) return '🔥'
    if (summary.totalOrders > 20) return '📦'
    return '🛒'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-600 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600">
          <div>
            <h2 className="text-2xl font-bold">Resumen de Ventas Diarias</h2>
            <p className="text-sm opacity-70 mt-1">
              Análisis de rendimiento del restaurant
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Date Selector */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <div className="flex-1 text-right text-sm opacity-70">
              {formatDate(selectedDate)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p>Cargando resumen de ventas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">
              <p className="mb-4">❌ {error}</p>
              <button
                onClick={loadSalesSummary}
                className="btn-secondary"
              >
                Reintentar
              </button>
            </div>
          ) : summary ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">{getRevenueIcon()}</div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {formatCurrency(parseFloat(summary.totalRevenue) || 0)}
                  </div>
                  <div className="text-sm opacity-80">Ingresos Totales</div>
                </div>

                {/* Total Orders */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">{getOrdersIcon()}</div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {summary.totalOrders}
                  </div>
                  <div className="text-sm opacity-80">Órdenes Procesadas</div>
                </div>

                {/* Average Order Value */}
                <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {formatCurrency(calculateAverageOrderValue())}
                  </div>
                  <div className="text-sm opacity-80">Valor Promedio</div>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Indicators */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    📈 Indicadores de Rendimiento
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-80">Órdenes por Hora:</span>
                      <span className="font-medium">
                        {summary.totalOrders > 0 ? (summary.totalOrders / 12).toFixed(1) : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-80">Ingresos por Hora:</span>
                      <span className="font-medium">
                        {formatCurrency((parseFloat(summary.totalRevenue) || 0) / 12)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-80">Estado del Día:</span>
                      <span className={`font-medium ${
                        summary.totalOrders > 30 ? 'text-green-400' :
                        summary.totalOrders > 15 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {summary.totalOrders > 30 ? 'Excelente' :
                         summary.totalOrders > 15 ? 'Bueno' : 
                         summary.totalOrders > 0 ? 'Regular' : 'Sin Ventas'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sales Goals */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    🎯 Metas Diarias
                  </h3>
                  <div className="space-y-4">
                    {/* Revenue Goal */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm opacity-80">Meta de Ingresos: $300,000</span>
                        <span className="text-sm font-medium">
                          {(((parseFloat(summary.totalRevenue) || 0) / 300000) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (parseFloat(summary.totalRevenue) || 0) >= 300000 ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{
                            width: `${Math.min(((parseFloat(summary.totalRevenue) || 0) / 300000) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Orders Goal */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm opacity-80">Meta de Órdenes: 25</span>
                        <span className="text-sm font-medium">
                          {((summary.totalOrders / 25) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            summary.totalOrders >= 25 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${Math.min((summary.totalOrders / 25) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Message */}
              <div className="mt-8 bg-gray-800 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold mb-2">📋 Resumen del Día</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  {summary.totalOrders === 0 ? (
                    "No se han procesado órdenes en esta fecha. Verifique que la fecha seleccionada sea correcta."
                  ) : (
                    `Se procesaron ${summary.totalOrders} órdenes generando un total de ${formatCurrency(parseFloat(summary.totalRevenue) || 0)} en ingresos. 
                    El valor promedio por orden fue de ${formatCurrency(calculateAverageOrderValue())}.`
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No hay datos disponibles para la fecha seleccionada
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600 p-4 text-center text-xs opacity-70">
          Los datos se actualizan en tiempo real • Última consulta: {new Date().toLocaleTimeString('es-CO')}
        </div>
      </div>
    </div>
  )
}

export default SalesSummary