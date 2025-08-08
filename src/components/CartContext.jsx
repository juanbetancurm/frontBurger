// CartContext.jsx - React Context for cart state management
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cartService from '../services/CartService';

// Initial cart state
const initialCartState = {
    cart: null,
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
    error: null,
    lastUpdated: null
};

// Cart action types
const CART_ACTIONS = {
    LOAD_CART_START: 'LOAD_CART_START',
    LOAD_CART_SUCCESS: 'LOAD_CART_SUCCESS',
    LOAD_CART_ERROR: 'LOAD_CART_ERROR',
    ADD_ITEM_START: 'ADD_ITEM_START',
    ADD_ITEM_SUCCESS: 'ADD_ITEM_SUCCESS',
    ADD_ITEM_ERROR: 'ADD_ITEM_ERROR',
    UPDATE_ITEM_START: 'UPDATE_ITEM_START',
    UPDATE_ITEM_SUCCESS: 'UPDATE_ITEM_SUCCESS',
    UPDATE_ITEM_ERROR: 'UPDATE_ITEM_ERROR',
    REMOVE_ITEM_START: 'REMOVE_ITEM_START',
    REMOVE_ITEM_SUCCESS: 'REMOVE_ITEM_SUCCESS',
    REMOVE_ITEM_ERROR: 'REMOVE_ITEM_ERROR',
    CLEAR_CART_START: 'CLEAR_CART_START',
    CLEAR_CART_SUCCESS: 'CLEAR_CART_SUCCESS',
    CLEAR_CART_ERROR: 'CLEAR_CART_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Cart reducer to manage state changes
function cartReducer(state, action) {
    switch (action.type) {
        case CART_ACTIONS.LOAD_CART_START:
        case CART_ACTIONS.ADD_ITEM_START:
        case CART_ACTIONS.UPDATE_ITEM_START:
        case CART_ACTIONS.REMOVE_ITEM_START:
        case CART_ACTIONS.CLEAR_CART_START:
            return {
                ...state,
                loading: true,
                error: null
            };

        case CART_ACTIONS.LOAD_CART_SUCCESS:
        case CART_ACTIONS.ADD_ITEM_SUCCESS:
        case CART_ACTIONS.UPDATE_ITEM_SUCCESS:
        case CART_ACTIONS.REMOVE_ITEM_SUCCESS:
            return {
                ...state,
                cart: action.payload,
                items: action.payload.items || [],
                totalItems: action.payload.items ? action.payload.items.length : 0,
                totalAmount: action.payload.total || 0,
                loading: false,
                error: null,
                lastUpdated: new Date().toISOString()
            };

        case CART_ACTIONS.CLEAR_CART_SUCCESS:
            return {
                ...state,
                cart: null,
                items: [],
                totalItems: 0,
                totalAmount: 0,
                loading: false,
                error: null,
                lastUpdated: new Date().toISOString()
            };

        case CART_ACTIONS.LOAD_CART_ERROR:
        case CART_ACTIONS.ADD_ITEM_ERROR:
        case CART_ACTIONS.UPDATE_ITEM_ERROR:
        case CART_ACTIONS.REMOVE_ITEM_ERROR:
        case CART_ACTIONS.CLEAR_CART_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        case CART_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
}

// Create cart context
const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Cart provider component
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialCartState);

    // Load cart on component mount
    useEffect(() => {
        loadCart();
    }, []);

    // Load the active cart
    const loadCart = async () => {
        dispatch({ type: CART_ACTIONS.LOAD_CART_START });
        try {
            const cart = await cartService.getActiveCart();
            dispatch({ 
                type: CART_ACTIONS.LOAD_CART_SUCCESS, 
                payload: cart 
            });
        } catch (error) {
            console.error('Failed to load cart:', error);
            dispatch({ 
                type: CART_ACTIONS.LOAD_CART_ERROR, 
                payload: error.message 
            });
        }
    };

    // Add item to cart
    const addItem = async (item) => {
        dispatch({ type: CART_ACTIONS.ADD_ITEM_START });
        try {
            const updatedCart = await cartService.addItemToCart(item);
            dispatch({ 
                type: CART_ACTIONS.ADD_ITEM_SUCCESS, 
                payload: updatedCart 
            });
            
            // Show success notification
            showNotification(`${item.articleName} added to cart successfully!`, 'success');
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            dispatch({ 
                type: CART_ACTIONS.ADD_ITEM_ERROR, 
                payload: error.message 
            });
            
            // Show error notification
            showNotification('Failed to add item to cart. Please try again.', 'error');
        }
    };

    // Update item quantity
    const updateItemQuantity = async (articleId, quantity) => {
        dispatch({ type: CART_ACTIONS.UPDATE_ITEM_START });
        try {
            const updatedCart = await cartService.updateItemQuantity(articleId, quantity);
            dispatch({ 
                type: CART_ACTIONS.UPDATE_ITEM_SUCCESS, 
                payload: updatedCart 
            });
        } catch (error) {
            console.error('Failed to update item quantity:', error);
            dispatch({ 
                type: CART_ACTIONS.UPDATE_ITEM_ERROR, 
                payload: error.message 
            });
        }
    };

    // Remove item from cart
    const removeItem = async (articleId) => {
        dispatch({ type: CART_ACTIONS.REMOVE_ITEM_START });
        try {
            const updatedCart = await cartService.removeItemFromCart(articleId);
            dispatch({ 
                type: CART_ACTIONS.REMOVE_ITEM_SUCCESS, 
                payload: updatedCart 
            });
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
            dispatch({ 
                type: CART_ACTIONS.REMOVE_ITEM_ERROR, 
                payload: error.message 
            });
        }
    };

    // Clear cart
    const clearCart = async () => {
        dispatch({ type: CART_ACTIONS.CLEAR_CART_START });
        try {
            await cartService.clearCart();
            dispatch({ type: CART_ACTIONS.CLEAR_CART_SUCCESS });
        } catch (error) {
            console.error('Failed to clear cart:', error);
            dispatch({ 
                type: CART_ACTIONS.CLEAR_CART_ERROR, 
                payload: error.message 
            });
        }
    };

    // Show notification helper
    const showNotification = (message, type) => {
        // Implement your notification system here
        // For example, using a toast library or custom notification component
        console.log(`[${type.toUpperCase()}] ${message}`);
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
    };

    // Context value
    const contextValue = {
        // State
        cart: state.cart,
        items: state.items,
        totalItems: state.totalItems,
        totalAmount: state.totalAmount,
        loading: state.loading,
        error: state.error,
        lastUpdated: state.lastUpdated,

        // Actions
        loadCart,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        clearError
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;