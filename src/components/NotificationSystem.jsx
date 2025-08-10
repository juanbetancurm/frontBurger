// src/components/NotificationSystem.jsx - CORRECT VERSION
import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react'

// Create notification context
const NotificationContext = createContext()

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Notification item component
const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, message, duration } = notification

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onRemove])

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return 'ℹ️'
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-green-900 border-green-600'
      case 'error': return 'bg-red-900 border-red-600'
      case 'warning': return 'bg-yellow-900 border-yellow-600'
      case 'info': return 'bg-blue-900 border-blue-600'
      default: return 'bg-gray-900 border-gray-600'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success': return 'text-green-100'
      case 'error': return 'text-red-100'
      case 'warning': return 'text-yellow-100'
      case 'info': return 'text-blue-100'
      default: return 'text-gray-100'
    }
  }

  return (
    <div 
      className={`
        ${getBackgroundColor()} 
        ${getTextColor()}
        border rounded-lg p-4 mb-3 
        shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        hover:scale-105
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">
          {getIcon()}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Main notification container
const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-h-screen overflow-y-auto">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  // Memoize functions to prevent re-renders
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const notification = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    }

    setNotifications(prev => [...prev, notification])
    
    // Also log to console for debugging
    console.log(`[${type.toUpperCase()}] ${message}`)

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods - memoized
  const showSuccess = useCallback((message, duration = 4000) => {
    return addNotification(message, 'success', duration)
  }, [addNotification])

  const showError = useCallback((message, duration = 6000) => {
    return addNotification(message, 'error', duration)
  }, [addNotification])

  const showWarning = useCallback((message, duration = 5000) => {
    return addNotification(message, 'warning', duration)
  }, [addNotification])

  const showInfo = useCallback((message, duration = 4000) => {
    return addNotification(message, 'info', duration)
  }, [addNotification])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }), [
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  ])

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  )
}

// Global notification utility (for use outside of React components)
let globalNotificationContext = null

export const setGlobalNotificationContext = (context) => {
  globalNotificationContext = context
}

export const showGlobalNotification = (message, type = 'info', duration = 5000) => {
  if (globalNotificationContext) {
    return globalNotificationContext.addNotification(message, type, duration)
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }
}

export default NotificationProvider