class CartService {
    constructor() {
        // Use port 8091 for cart service, not 8090
        this.baseURL = 'http://localhost:8091';
        this.cartURL = `${this.baseURL}/cart`;
    }

    getAuthToken() {
        // Use standardized 'accessToken' key
        return localStorage.getItem('accessToken') || '';
    }

    getHeaders() {
        const token = this.getAuthToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    async getCart() {
        try {
            console.log('Fetching cart from:', this.cartURL);
            console.log('Using headers:', this.getHeaders());
            
            const response = await fetch(this.cartURL, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (response.ok) {
                const cart = await response.json();
                console.log('Cart loaded successfully:', cart);
                return cart;
            } else {
                console.error('Cart fetch failed:', response.status, response.statusText);
                return { items: [], totalItems: 0, total: 0 };
            }
        } catch (error) {
            console.error('Cart fetch error:', error);
            return { items: [], totalItems: 0, total: 0 };
        }
    }

    async addItem(item) {
        try {
            const requestBody = {
                articleId: item.id,
                articleName: item.name,
                quantity: 1,
                price: item.price
            };
            
            console.log('Adding item to cart:', requestBody);
            
            const response = await fetch(`${this.cartURL}/items`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(requestBody)
            });
            
            if (response.ok) {
                const updatedCart = await response.json();
                console.log('Item added successfully:', updatedCart);
                return true;
            } else {
                console.error('Add item failed:', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Add item error:', error);
            return false;
        }
    }
}

const cartService = new CartService();
export default cartService;