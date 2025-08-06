# Rock & Burger - Frontend POS

Frontend React application for the Rock & Burger Point of Sale system.

## 🚀 Project Structure

```
rock-burger-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login form component
│   │   ├── POS.jsx            # Main POS interface
│   │   ├── Header.jsx         # Header with user info
│   │   ├── ProductGrid.jsx    # Product display grid
│   │   └── Cart.jsx           # Shopping cart sidebar
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── index.html                 # Main HTML file
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend services running:
  - Main service on port 8090
  - Cart service on port 8091

### Installation

1. **Create the project directory:**
   ```bash
   mkdir rock-burger-frontend
   cd rock-burger-frontend
   ```

2. **Initialize the project:**
   ```bash
   npm create vite@latest . -- --template react
   ```

3. **Replace the generated files** with the provided code files.

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 🎨 Design Features

- **Chalkboard Aesthetic**: Dark background with chalk-style text and drawings
- **Restaurant Branding**: Orange/yellow accent colors matching Rock & Burger identity  
- **Responsive Layout**: Works on desktop and tablet devices
- **Custom Fonts**: Google Fonts (Rock Salt, Griffy) for authentic feel

## 🔧 Configuration

### Backend Proxy Configuration

The Vite config includes proxy settings for backend services:

```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8090',      // Main service (auth, etc.)
    '/cart': 'http://localhost:8091',     // Cart microservice  
    '/article': 'http://localhost:8090'   // Product service
  }
}
```

### Environment Variables

You can create a `.env` file to override default settings:

```env
VITE_API_BASE_URL=http://localhost:8090
VITE_CART_API_URL=http://localhost:8091
```

## 🚀 Features

### Authentication
- JWT token-based authentication
- Automatic token storage and retrieval
- Role-based access (client, auxiliar, admin)
- Secure logout with token cleanup

### Product Management
- Browse products with pagination
- Filter by categories
- View product details (price, stock, brand)
- Responsive product grid

### Shopping Cart
- Add products to cart
- Update quantities
- Remove items
- Real-time total calculation
- Cart persistence across sessions

### User Experience
- Loading states for all operations
- Error handling with user feedback
- Responsive design for different screen sizes
- Intuitive navigation

## 🔐 Authentication

The app supports any valid credentials from the backend. Example users from the backend:

- **Admin/Auxiliar users**: Any user with auxiliar or admin role
- **Client users**: Any user with client role

## 📱 Responsive Design

- **Desktop**: Full layout with sidebar cart
- **Tablet**: Adapted grid layout
- **Mobile**: Stack layout for optimal mobile experience

## 🛒 Cart Functionality

- **Add to Cart**: Select quantity and add products
- **Update Quantity**: Increment/decrement or direct input
- **Remove Items**: Individual item removal
- **Clear Cart**: Remove all items at once
- **Real-time Updates**: Instant UI updates with backend sync

## 🎯 Usage

1. **Login**: Use any valid backend credentials
2. **Browse Products**: View available products by category
3. **Add to Cart**: Select items and quantities
4. **Manage Cart**: Update quantities or remove items  
5. **Process Order**: Use cart total for checkout

## 🔧 Development

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 📋 Backend Dependencies

Ensure these backend endpoints are available:

- `POST /api/auth/login` - User authentication
- `GET /article/articles` - Fetch products
- `GET /category/categoriespage` - Fetch categories  
- `GET /brand/brandspage` - Fetch brands
- `GET /cart` - Get current cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items` - Update cart item
- `DELETE /cart/items/{id}` - Remove cart item
- `DELETE /cart` - Clear cart

## 🚀 Deployment

For production deployment:

1. Update proxy configuration to point to production backend
2. Build the project: `npm run build`
3. Serve the `dist` folder with any static server
4. Ensure backend CORS settings allow frontend domain

## 🎨 Customization

### Colors

Main colors are defined in CSS variables:

```css
:root {
  --chalkboard-bg: #1a1a1a;
  --chalk-yellow: #F4A623;
  --chalk-orange: #E67E22;
  --accent-color: #D35400;
}
```

### Fonts

The app uses Google Fonts that can be changed in `index.html`:

- **Rock Salt**: Headlines and branding
- **Griffy**: Body text and UI elements

## 📄 License

This project is part of the Rock & Burger POS system.