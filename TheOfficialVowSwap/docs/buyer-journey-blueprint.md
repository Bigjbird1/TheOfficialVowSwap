# VowSwap Buyer Journey Blueprint

## 1. Discovery and Browsing Flow

### Homepage Entry Point (`HomePage.tsx`)
- Hero Section (`components/home/HeroSection.tsx`)
  - Featured wedding decor categories
  - Main search bar integration
  - Call-to-action buttons
- Featured Items (`components/home/FeaturedItems.tsx`)
  - Curated product displays
  - Quick add to cart/wishlist functionality
- Featured Categories (`components/home/FeaturedCategories.tsx`)
  - Category navigation tiles
  - Direct links to category-filtered product grids

### Product Browsing (`products/page.tsx`, `products/products-client.tsx`)
- Search and Filter Interface
  - SearchBar (`components/SearchBar.tsx`)
    - Real-time search suggestions
    - Search history integration
  - FilterBar (`components/FilterBar.tsx`)
    - Price range filters
    - Category filters
    - Style/theme filters
    - Availability filters
- Product Grid (`components/ProductGrid.tsx`)
  - Responsive grid layout
  - Product card previews
  - Quick actions (wishlist, quick view)
  - Pagination/infinite scroll
- Mobile Optimization
  - BottomNav (`components/mobile/BottomNav.tsx`)
  - FilterDrawer (`components/mobile/FilterDrawer.tsx`)
  - ProductCardMobile (`components/mobile/ProductCardMobile.tsx`)

## 2. Product Details Flow

### Product Details Page (`ProductDetailsPage.tsx`)
- Item Details (`components/ItemDetails.tsx`)
  - Product images/gallery
  - Price and availability
  - Description and specifications
  - Quantity selector
  - Add to cart button
  - Add to wishlist button
  - Add to registry button (`components/registry/AddToRegistry.tsx`)
- Additional Information
  - Seller Information (`components/SellerInfo.tsx`)
  - Purchase Incentives (`components/PurchaseIncentives.tsx`)
  - Bulk Purchase Options (`components/BulkPurchaseDiscount.tsx`)
- Related Products
  - Similar Products (`components/SimilarProducts.tsx`)
  - Recommended Products (`components/RecommendedProducts.tsx`)
- Reviews Section (`components/Reviews.tsx`)
  - Review listings (`components/reviews/ReviewItem.tsx`)
  - Review submission (`components/reviews/ReviewForm.tsx`)

## 3. Shopping Cart and Checkout Flow

### Shopping Cart (`components/Cart.tsx`)
- Cart Context (`contexts/CartContext.tsx`)
  - Add to cart functionality
  - Remove from cart
  - Update quantities
  - Cart total calculation
- Cart Features
  - Item thumbnails and details
  - Quantity adjustments
  - Remove items
  - Price summaries
  - Promotional code input

### Checkout Process (`components/Checkout.tsx`)
1. Shipping Information (`components/checkout/ShippingForm.tsx`)
   - Address entry/selection
   - Shipping method selection
   - Delivery date estimation
2. Payment Information (`components/checkout/PaymentForm.tsx`)
   - Payment method selection
   - Billing address
   - Security verification
3. Order Review (`components/checkout/ReviewSection.tsx`)
   - Order summary
   - Final price breakdown
   - Terms acceptance
   - Place order button

## 4. Order Management Flow

### Order Confirmation
- Order Details (`components/OrderDetails.tsx`)
  - Order summary
  - Payment confirmation
  - Shipping details
  - Estimated delivery
- Order Tracking (`components/OrderTracker.tsx`)
  - Real-time status updates
  - Shipping milestones
  - Delivery estimates

### User Dashboard (`dashboard/page.tsx`)
- Dashboard Overview (`components/dashboard/DashboardOverview.tsx`)
  - Recent orders
  - Saved items
  - Account settings
- Order History (`components/dashboard/OrderHistory.tsx`)
  - Past order listing
  - Order status tracking
  - Reorder functionality
- Saved Information
  - Addresses (`components/dashboard/SavedAddresses.tsx`)
  - Payment Methods (`components/dashboard/PaymentMethods.tsx`)
  - Wishlist Items (`components/dashboard/WishlistItems.tsx`)
  - Registry Details (`components/dashboard/RegistryDetails.tsx`)

## 5. Authentication and User Onboarding

### Authentication Flow
1. Sign Up (`auth/signup/page.tsx`, `components/auth/SignUpForm.tsx`)
   - Email/password registration
   - Social auth options
   - Terms acceptance
2. Email Verification (`auth/verify-email/page.tsx`)
   - Verification link handling
   - Account activation
3. Sign In (`auth/signin/page.tsx`, `components/auth/SignInForm.tsx`)
   - Credential validation
   - Password recovery
   - Remember me option

### User Profile Integration
- Profile Management
  - Personal information
  - Preferences
  - Communication settings
- Registry Management (`components/registry/Registry.tsx`)
  - Create registry (`components/registry/CreateRegistry.tsx`)
  - Manage items (`components/registry/RegistryItem.tsx`)
- Wishlist Management (`contexts/WishlistContext.tsx`)
  - Add/remove items
  - Share wishlist
  - Move to cart

## 6. Integration Points and Data Flow

### Frontend-Backend Integration
- Product Data (`api/products/route.ts`)
  - Product listings
  - Search and filtering
  - Product details
- Order Management (`api/orders/route.ts`)
  - Order creation
  - Status updates
  - History retrieval
- User Data (`api/auth/[...nextauth]/route.ts`)
  - Profile management
  - Authentication
  - Preferences
- Shopping Features
  - Cart management
  - Wishlist (`api/wishlist/route.ts`)
  - Registry (`api/registry/route.ts`)
- Address/Payment (`api/addresses/route.ts`, `api/payment-methods/route.ts`)
  - Saved addresses
  - Payment methods
  - Billing info

### State Management
- Cart Context (`contexts/CartContext.tsx`)
  - Product storage
  - Quantity management
  - Price calculations
- Wishlist Context (`contexts/WishlistContext.tsx`)
  - Saved items
  - Wishlist operations
- Registry Context (`contexts/RegistryContext.tsx`)
  - Registry items
  - Registry sharing

### Error Handling and Loading States
- Form Validation
  - Input validation
  - Error messages
  - Success feedback
- API Integration
  - Loading indicators
  - Error boundaries
  - Retry mechanisms
- User Feedback
  - Toast notifications
  - Progress indicators
  - Confirmation dialogs

### Navigation and Routing
- Breadcrumb Navigation (`components/Breadcrumbs.tsx`)
  - Path tracking
  - Navigation history
- Main Navigation (`components/NavBar.tsx`)
  - Category menus
  - User menu
  - Cart access
- Mobile Navigation
  - Bottom navigation bar
  - Drawer menus
  - Touch interactions
